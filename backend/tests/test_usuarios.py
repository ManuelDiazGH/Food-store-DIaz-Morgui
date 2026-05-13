def test_listar_usuarios_es_publico(client):
    """El listado de usuarios es público (sin auth requerida)."""
    resp = client.get("/api/v1/usuarios")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)


def test_admin_lista_usuarios(client, auth_headers):
    resp = client.get("/api/v1/usuarios", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) > 0
