def test_crear_pedido_sin_direccion_falla(client, client_headers):
    """Crear pedido con producto inexistente debe fallar."""
    resp = client.post("/api/v1/pedidos", json={
        "forma_pago_codigo": "EFECTIVO",
        "items": [{"producto_id": 99999, "cantidad": 1}]
    }, headers=client_headers)
    assert resp.status_code == 400


def test_validar_items_sin_stock(client, client_headers):
    """Validar items con producto inexistente debe devolver valido=False."""
    resp = client.post("/api/v1/pedidos/validar", json={
        "items": [{"producto_id": 99999, "cantidad": 99, "precio_original": 10}]
    }, headers=client_headers)
    assert resp.status_code == 200
    assert resp.json()["valido"] == False
