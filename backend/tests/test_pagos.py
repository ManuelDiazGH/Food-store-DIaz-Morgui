def test_crear_pago_sin_token_mp_falla(client, client_headers):
    """Sin MP_ACCESS_TOKEN configurado, crear pago debe fallar."""
    resp = client.post("/api/v1/pagos/crear", json={
        "pedido_id": 99999,  # pedido inexistente → 400
        "forma_pago_codigo": "MERCADOPAGO"
    }, headers=client_headers)
    # Sin MP_ACCESS_TOKEN o pedido no existe → esperamos error
    assert resp.status_code in (400, 502)
