import pytest
from finance.models import Wallet, Category, Transaction

@pytest.mark.django_db
def test_total_balance_api(auth_client, user, mocker):
    mocker.patch('finance.views.cache.get', return_value={'BYN': 3.2, 'USD': 1})

    Wallet.objects.create(user=user, name="W1", currency="BYN", balance=100)
    Wallet.objects.create(user=user, name="W2", currency="USD", balance=10)

    response = auth_client.get('/api/finance/balance/?currency=BYN')
    assert response.status_code == 200
    assert float(response.data['total']) == 132.0

@pytest.mark.django_db
def test_stats_aggregation(auth_client, user):
    w = Wallet.objects.create(user=user, currency="BYN", balance=1000)
    c1 = Category.objects.create(user=user, title="Food")
    c2 = Category.objects.create(user=user, title="Taxi")

    Transaction.objects.create(wallet=w, category=c1, amount=10, date="2023-01-01")
    Transaction.objects.create(wallet=w, category=c1, amount=20, date="2023-01-02")
    Transaction.objects.create(wallet=w, category=c2, amount=5, date="2023-01-03")

    response = auth_client.get('/api/finance/stats/?start_date=2023-01-01&end_date=2023-01-31')

    assert len(response.data) == 2
    assert response.data[0]['category__title'] == "Food"
    assert response.data[0]['total_amount'] == 30.0
