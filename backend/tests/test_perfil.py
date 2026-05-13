"""Tests para el módulo de Perfil."""


def test_get_perfil_requiere_auth(client):
    resp = client.get("/api/v1/perfil")
    assert resp.status_code == 401


def test_get_perfil_returns_user_data(client, auth_headers):
    resp = client.get("/api/v1/perfil", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "admin@foodstore.com"
    assert "nombre" in data
    assert "fecha_registro" in data


def test_update_perfil(client, auth_headers):
    resp = client.put("/api/v1/perfil", json={
        "nombre": "Admin Actualizado",
        "telefono": "+5491112345678",
    }, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["nombre"] == "Admin Actualizado"

    # Restaurar
    client.put("/api/v1/perfil", json={
        "nombre": "Admin",
    }, headers=auth_headers)


def test_update_perfil_requiere_auth(client):
    resp = client.put("/api/v1/perfil", json={"nombre": "Test"})
    assert resp.status_code == 401
