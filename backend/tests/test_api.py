import pytest
from finance.models import Wallet, Category, Transaction

@pytest.mark.django_db
def test_get_wallets_list(auth_client, user):
    Wallet.objects.create(user=user, name="W1")
    Wallet.objects.create(user=user, name="W2")

    response = auth_client.get('/api/finance/wallets/')
    assert response.status_code == 200
    assert len(response.data) == 2

@pytest.mark.django_db
def test_create_wallet(auth_client):
    payload = {"name": "New Wallet", "currency": "USD"}
    response = auth_client.post('/api/finance/wallets/', payload)
    assert response.status_code == 201
    assert Wallet.objects.count() == 1
    assert Wallet.objects.first().currency == "USD"

@pytest.mark.django_db
def test_cannot_see_others_wallets(auth_client, api_client):
    from model_bakery import baker
    other_user = baker.make('users.User')
    other_wallet = Wallet.objects.create(user=other_user, name="Secret")

    response = auth_client.get('/api/finance/wallets/')
    assert response.status_code == 200
    assert len(response.data) == 0

@pytest.mark.django_db
def test_create_category(auth_client):
    payload = {"title": "Taxi", "transaction_type": "EXPENSE"}
    response = auth_client.post('/api/finance/categories/', payload)
    assert response.status_code == 201
    assert Category.objects.first().title == "Taxi"

@pytest.mark.django_db
def test_create_transaction_api(auth_client, user):
    wallet = Wallet.objects.create(user=user, name="W1", balance=100)
    cat = Category.objects.create(user=user, title="C1")

    payload = {
        "wallet": wallet.id,
        "category": cat.id,
        "amount": "50.00",
        "date": "2023-10-10"
    }
    response = auth_client.post('/api/finance/transactions/', payload)
    assert response.status_code == 201
    wallet.refresh_from_db()
    assert wallet.balance == 50

@pytest.mark.django_db
def test_delete_transaction_api(auth_client, user):
    wallet = Wallet.objects.create(user=user, name="W1", balance=100)
    cat = Category.objects.create(user=user, title="C1")
    tx = Transaction.objects.create(wallet=wallet, category=cat, amount=50, date="2023-01-01")

    response = auth_client.delete(f'/api/finance/transactions/{tx.id}/')
    assert response.status_code == 204
    wallet.refresh_from_db()
    assert wallet.balance == 100
