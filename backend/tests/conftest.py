import sys
import time
from pathlib import Path

# Forzar UTF-8 para evitar UnicodeDecodeError en Windows
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, str(Path(__file__).parent.parent))

import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="session")
def client():
    return TestClient(app)


@pytest.fixture(scope="session")
def admin_token(client):
    """Login como admin con retry por rate limiting (429)."""
    for intento in range(3):
        resp = client.post("/api/v1/auth/login", json={
            "email": "admin@foodstore.com",
            "password": "admin123"
        })
        if resp.status_code == 429:
            time.sleep(10)  # esperar que pase el rate limit
            continue
        if resp.status_code == 200:
            return resp.json()["access_token"]
        break
    # Si llegó acá es porque falló
    pytest.fail(f"admin_token: {resp.status_code} - {resp.text}")


@pytest.fixture
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="session")
def client_token(client):
    """Registra y loguea un CLIENT de prueba con retry por rate limiting."""
    import uuid
    email = f"testclient_{uuid.uuid4().hex[:8]}@test.com"

    # Register
    client.post("/api/v1/auth/register", json={
        "nombre": "Test Client", "email": email, "password": "test1234"
    })

    # Login con retry
    for intento in range(3):
        resp = client.post("/api/v1/auth/login", json={
            "email": email, "password": "test1234"
        })
        if resp.status_code == 429:
            time.sleep(10)
            continue
        if resp.status_code == 200:
            return resp.json()["access_token"]
        break

    pytest.fail(f"client_token: {resp.status_code} - {resp.text}")


@pytest.fixture
def client_headers(client_token):
    return {"Authorization": f"Bearer {client_token}"}
