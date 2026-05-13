"""Tests para el módulo de Ingredientes."""
import uuid


def test_listar_ingredientes(client, auth_headers):
    resp = client.get("/api/v1/ingredientes", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)


def test_crear_ingrediente(client, auth_headers):
    nombre = f"Cheddar_{uuid.uuid4().hex[:6]}"
    resp = client.post("/api/v1/ingredientes", json={
        "nombre": nombre,
        "es_alergeno": False,
    }, headers=auth_headers)
    assert resp.status_code == 201
    assert resp.json()["nombre"] == nombre


def test_crear_ingrediente_alergeno(client, auth_headers):
    nombre = f"Mani_{uuid.uuid4().hex[:6]}"
    resp = client.post("/api/v1/ingredientes", json={
        "nombre": nombre,
        "es_alergeno": True,
    }, headers=auth_headers)
    assert resp.status_code == 201
    assert resp.json()["es_alergeno"] is True


def test_crear_ingrediente_sin_auth(client):
    resp = client.post("/api/v1/ingredientes", json={
        "nombre": "No deberia",
    })
    assert resp.status_code == 401


def test_crear_ingrediente_con_cliente(client, client_headers):
    resp = client.post("/api/v1/ingredientes", json={
        "nombre": "No deberia",
    }, headers=client_headers)
    assert resp.status_code == 403


def test_eliminar_ingrediente(client, auth_headers):
    nombre = f"DelIng_{uuid.uuid4().hex[:6]}"
    created = client.post("/api/v1/ingredientes", json={
        "nombre": nombre,
    }, headers=auth_headers)
    assert created.status_code == 201
    ing_id = created.json()["id"]
    resp = client.delete(f"/api/v1/ingredientes/{ing_id}", headers=auth_headers)
    assert resp.status_code == 204
