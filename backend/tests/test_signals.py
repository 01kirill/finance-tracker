import pytest
from finance.models import Wallet, Category, Transaction

@pytest.mark.django_db
def test_balance_decreases_on_expense(user):
    wallet = Wallet.objects.create(user=user, name="Debit", balance=1000)
    cat = Category.objects.create(user=user, title="Food", transaction_type="EXPENSE")

    Transaction.objects.create(wallet=wallet, category=cat, amount=100, date="2023-01-01")

    wallet.refresh_from_db()
    assert wallet.balance == 900

@pytest.mark.django_db
def test_balance_increases_on_income(user):
    wallet = Wallet.objects.create(user=user, name="Debit", balance=1000)
    cat = Category.objects.create(user=user, title="Salary", transaction_type="INCOME")

    Transaction.objects.create(wallet=wallet, category=cat, amount=500, date="2023-01-01")

    wallet.refresh_from_db()
    assert wallet.balance == 1500

@pytest.mark.django_db
def test_balance_reverts_on_delete(user):
    wallet = Wallet.objects.create(user=user, name="Debit", balance=1000)
    cat = Category.objects.create(user=user, title="Food", transaction_type="EXPENSE")
    tx = Transaction.objects.create(wallet=wallet, category=cat, amount=100, date="2023-01-01")

    wallet.refresh_from_db()
    assert wallet.balance == 900

    tx.delete()
    wallet.refresh_from_db()
    assert wallet.balance == 1000
