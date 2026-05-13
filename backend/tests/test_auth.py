import uuid


def test_register_creates_user(client):
    email = f"nuevo_{uuid.uuid4().hex[:8]}@test.com"
    resp = client.post("/api/v1/auth/register", json={
        "nombre": "Nuevo", "email": email, "password": "test1234"
    })
    assert resp.status_code == 201
    data = resp.json()
    # Register devuelve TokenResponse (access_token, no email)
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_register_duplicate_email_returns_409(client):
    email = f"dup_{uuid.uuid4().hex[:8]}@test.com"
    # Primer registro
    resp1 = client.post("/api/v1/auth/register", json={
        "nombre": "Usuario Test", "email": email, "password": "test1234"
    })
    assert resp1.status_code == 201, f"Primer registro falló: {resp1.text}"
    # Segundo registro con el mismo email → debe fallar
    resp2 = client.post("/api/v1/auth/register", json={
        "nombre": "Otro Usuario", "email": email, "password": "test1234"
    })
    assert resp2.status_code == 409


def test_login_returns_tokens(client):
    email = f"login_{uuid.uuid4().hex[:8]}@test.com"
    client.post("/api/v1/auth/register", json={
        "nombre": "LoginTest", "email": email, "password": "test1234"
    })
    resp = client.post("/api/v1/auth/login", json={
        "email": email, "password": "test1234"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_login_wrong_password_returns_401(client):
    resp = client.post("/api/v1/auth/login", json={
        "email": "admin@foodstore.com", "password": "wrongpass"
    })
    assert resp.status_code == 401


def test_me_returns_user_data(client, auth_headers):
    resp = client.get("/api/v1/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == "admin@foodstore.com"


def test_me_without_token_returns_401(client):
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401
