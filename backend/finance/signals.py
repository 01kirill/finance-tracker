from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db import transaction
from .models import Transaction

@receiver(post_save, sender=Transaction)
def update_balance_on_save(sender, instance, created, **kwargs):
    if created:
        with transaction.atomic():
            wallet = instance.wallet
            if instance.category and instance.category.transaction_type == 'INCOME':
                wallet.balance += instance.amount
            else:
                wallet.balance -= instance.amount
            wallet.save()

@receiver(post_delete, sender=Transaction)
def update_balance_on_delete(sender, instance, **kwargs):
    with transaction.atomic():
        wallet = instance.wallet
        if instance.category and instance.category.transaction_type == 'INCOME':
            wallet.balance -= instance.amount
        else:
            wallet.balance += instance.amount
        wallet.save()
