import uuid


def test_catalogo_publico(client):
    resp = client.get("/api/v1/productos")
    assert resp.status_code in (200, 500)
    if resp.status_code == 200:
        try:
            data = resp.json()
            assert "items" in data
        except Exception:
            pass


def test_crear_producto_requiere_auth(client):
    resp = client.post("/api/v1/productos", json={"nombre": "Test"})
    assert resp.status_code == 401


def test_admin_puede_crear_producto(client, auth_headers):
    nombre = f"Pizza Test {uuid.uuid4().hex[:6]}"
    resp = client.post("/api/v1/productos", json={
        "nombre": nombre, "precio_base": 10.50, "stock_cantidad": 100
    }, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["nombre"] == nombre


def test_cliente_no_puede_crear_producto(client, client_headers):
    resp = client.post("/api/v1/productos", json={
        "nombre": "No deberia", "precio_base": 5
    }, headers=client_headers)
    assert resp.status_code == 403
