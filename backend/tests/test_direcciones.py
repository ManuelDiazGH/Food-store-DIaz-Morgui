import uuid


def test_crear_direccion(client, client_headers):
    resp = client.post("/api/v1/direcciones", json={
        "alias": "Test",
        "linea1": "Av. Siempre Viva 123",
        "ciudad": "Buenos Aires",
        "cp": "1425"
    }, headers=client_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["linea1"] == "Av. Siempre Viva 123"
    assert "id" in data
