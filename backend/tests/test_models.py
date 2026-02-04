import pytest
from finance.models import Wallet, Category, Transaction

@pytest.mark.django_db
def test_wallet_str(user):
    wallet = Wallet.objects.create(user=user, name="Main", currency="BYN")
    assert str(wallet) == "Main (BYN)"

@pytest.mark.django_db
def test_category_str(user):
    cat = Category.objects.create(user=user, title="Food", transaction_type="EXPENSE")
    assert str(cat) == "Food (EXPENSE)"

@pytest.mark.django_db
def test_transaction_creation(user):
    wallet = Wallet.objects.create(user=user, name="Main", balance=100)
    cat = Category.objects.create(user=user, title="Food")
    tx = Transaction.objects.create(wallet=wallet, category=cat, amount=50, date="2023-01-01")
    assert tx.amount == 50
