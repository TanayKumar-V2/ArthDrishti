from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from jose import JWTError

from app.core.config import settings
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.models.user import User, RefreshToken, CustomerProfile
from app.schemas.user import UserCreate


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Fetch user by case-insensitive email."""
    return db.query(User).filter(User.email == email.lower().strip()).first()


def register_user(db: Session, user_in: UserCreate) -> User:
    """Register a new user account with initial customer profile."""
    existing_user = get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists"
        )

    # Sanitize role: only allow customer or loan_officer through public registration
    role = user_in.role if user_in.role in ["customer", "loan_officer"] else "customer"

    new_user = User(
        email=user_in.email.lower().strip(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=role,
        is_active=True,
        is_verified=False,
    )
    db.add(new_user)
    db.flush()

    # Automatically initialize empty customer profile
    profile = CustomerProfile(user_id=new_user.id)
    db.add(profile)

    db.commit()
    db.refresh(new_user)
    return new_user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate email and password against hash."""
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_user_tokens(db: Session, user: User) -> Tuple[str, str]:
    """Create and persist JWT access and refresh tokens for user."""
    access_token = create_access_token(subject=user.id, role=user.role)
    refresh_token_str = create_refresh_token(subject=user.id)

    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_refresh_token = RefreshToken(
        user_id=user.id,
        token=refresh_token_str,
        expires_at=expires_at,
        revoked=False
    )
    db.add(db_refresh_token)
    db.commit()

    return access_token, refresh_token_str


def refresh_access_token(db: Session, refresh_token_str: str) -> Tuple[str, str, User]:
    """Validate refresh token, revoke old one, and issue a fresh pair (token rotation)."""
    try:
        payload = decode_token(refresh_token_str)
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        if not user_id or token_type != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_token_str,
        RefreshToken.revoked == False
    ).first()

    if not db_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token revoked or not found")

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User inactive or not found")

    # Revoke old token and rotate
    db_token.revoked = True
    db.commit()

    new_access, new_refresh = create_user_tokens(db, user)
    return new_access, new_refresh, user


def revoke_token(db: Session, refresh_token_str: str) -> bool:
    """Revoke a refresh token on logout."""
    db_token = db.query(RefreshToken).filter(RefreshToken.token == refresh_token_str).first()
    if db_token:
        db_token.revoked = True
        db.commit()
        return True
    return False


def seed_superuser(db: Session) -> None:
    """Ensure initial admin superuser exists on application startup."""
    admin = get_user_by_email(db, settings.FIRST_SUPERUSER_EMAIL)
    if not admin:
        admin = User(
            email=settings.FIRST_SUPERUSER_EMAIL.lower().strip(),
            hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
            full_name="System Administrator",
            role="admin",
            is_active=True,
            is_verified=True,
        )
        db.add(admin)
        db.commit()
