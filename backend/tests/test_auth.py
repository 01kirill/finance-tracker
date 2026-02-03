import pytest

@pytest.mark.django_db
def test_registration(api_client):
    payload = {
        "email": "new@test.com",
        "password": "strong_password123",
        "re_password": "strong_password123"
    }
    response = api_client.post('/api/auth/users/', payload)
    assert response.status_code == 201

@pytest.mark.django_db
def test_login(api_client, user):
    user.set_password('pass123')
    user.is_active = True
    user.save()

    payload = {"email": user.email, "password": "pass123"}
    response = api_client.post('/api/auth/jwt/create/', payload)
    assert response.status_code == 200
    assert "access" in response.data
