def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data


def test_user_registration_and_login(client):
    """Test user registration followed by authentication."""
    # 1. Register new user
    register_payload = {
        "email": "testuser@example.com",
        "password": "Password123!",
        "full_name": "Test Risk Analyst",
        "role": "customer"
    }
    reg_response = client.post("/api/v1/auth/register", json=register_payload)
    assert reg_response.status_code == 201
    user_data = reg_response.json()
    assert user_data["email"] == "testuser@example.com"
    assert user_data["role"] == "customer"
    assert "id" in user_data

    # 2. Duplicate registration should fail
    dup_response = client.post("/api/v1/auth/register", json=register_payload)
    assert dup_response.status_code == 400

    # 3. Login with correct credentials
    login_payload = {
        "email": "testuser@example.com",
        "password": "Password123!"
    }
    login_response = client.post("/api/v1/auth/login", json=login_payload)
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    assert "refresh_token" in token_data
    assert token_data["token_type"] == "bearer"

    # 4. Fetch /auth/me with Bearer token
    access_token = token_data["access_token"]
    me_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["email"] == "testuser@example.com"

    # 5. Token refresh
    refresh_response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": token_data["refresh_token"]}
    )
    assert refresh_response.status_code == 200
    new_tokens = refresh_response.json()
    assert "access_token" in new_tokens
    assert new_tokens["access_token"] != access_token


def test_invalid_login(client):
    """Test that invalid passwords or non-existent users are rejected."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@example.com", "password": "WrongPassword123!"}
    )
    assert response.status_code == 401
