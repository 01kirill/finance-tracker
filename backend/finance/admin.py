from django.contrib import admin
from .models import Wallet, Category, Transaction

@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'currency', 'balance', 'created_at')
    list_filter = ('currency', 'created_at')
    search_fields = ('name', 'user__email')
    readonly_fields = ('balance',)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'transaction_type')
    list_filter = ('transaction_type',)
    search_fields = ('title', 'user__email')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('amount', 'get_currency', 'category', 'wallet', 'date', 'created_at')
    list_filter = ('date', 'category__transaction_type', 'wallet__currency')
    search_fields = ('description', 'wallet__name', 'category__title')
    date_hierarchy = 'date'

    @admin.display(description='Currency')
    def get_currency(self, obj):
        return obj.wallet.currency
