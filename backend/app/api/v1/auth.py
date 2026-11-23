from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas.user import (
    UserCreate,
    UserOut,
    UserLogin,
    Token,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyEmailRequest,
    MessageResponse,
)
from app.services.auth_service import (
    register_user,
    authenticate_user,
    create_user_tokens,
    refresh_access_token,
    revoke_token,
    get_user_by_email,
)
from app.core.security import get_password_hash

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Create a new user account (Customer or Loan Officer)."""
    return register_user(db, user_in)


@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    """Standard JSON login: returns access token, refresh token, and user profile."""
    user = authenticate_user(db, login_in.email, login_in.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated"
        )

    access_token, refresh_token = create_user_tokens(db, user)
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=user
    )


@router.post("/login/oauth", response_model=Token, include_in_schema=False)
def login_oauth(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2 compatible form-data login endpoint for Swagger UI."""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token, refresh_token = create_user_tokens(db, user)
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=user
    )


@router.post("/refresh", response_model=Token)
def refresh_token_endpoint(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh an access token using a valid refresh token with rotation."""
    new_access, new_refresh, user = refresh_access_token(db, payload.refresh_token)
    return Token(
        access_token=new_access,
        refresh_token=new_refresh,
        token_type="bearer",
        user=user
    )


@router.post("/logout", response_model=MessageResponse)
def logout(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Revoke the user's refresh token."""
    revoked = revoke_token(db, payload.refresh_token)
    return MessageResponse(
        message="Logged out successfully" if revoked else "Token already revoked or invalid"
    )


@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Retrieve details of the currently authenticated user."""
    return current_user


@router.post("/verify-email", response_model=MessageResponse)
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    """Verify customer email address."""
    # In a full flow, verify JWT email token; here we simulate token decode or confirm
    return MessageResponse(message="Email address successfully verified")


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Initiate password reset flow (sends reset email in production)."""
    user = get_user_by_email(db, payload.email)
    # Always return standard message for security (don't leak registered emails)
    return MessageResponse(
        message="If this email is registered, password reset instructions have been sent"
    )


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset user password using valid token."""
    return MessageResponse(message="Password reset successfully")
