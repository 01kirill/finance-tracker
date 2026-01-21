from django.db import models
from django.conf import settings

class Wallet(models.Model):
    CURRENCY_CHOICES = (
        ('BYN', 'Belarusian Ruble'),
        ('USD', 'US Dollar'),
        ('EUR', 'Euro'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wallets'
    )
    name = models.CharField(max_length=50)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='RUB')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.currency})"

class Category(models.Model):
    TRANSACTION_TYPE_CHOICES = (
        ('INCOME', 'Income'),
        ('EXPENSE', 'Expense'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='categories'
    )
    title = models.CharField(max_length=50)
    transaction_type = models.CharField(
        max_length=7,
        choices=TRANSACTION_TYPE_CHOICES,
        default='EXPENSE'
    )

    def __str__(self):
        return f"{self.title} ({self.transaction_type})"

class Transaction(models.Model):
    wallet = models.ForeignKey(
        Wallet,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='transactions'
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.CharField(max_length=255, blank=True)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.amount} - {self.category}"
