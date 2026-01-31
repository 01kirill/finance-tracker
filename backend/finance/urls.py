from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import WalletViewSet, CategoryViewSet, TransactionViewSet, TransactionStatsView, WalletTotalView

router = DefaultRouter()
router.register(r'wallets', WalletViewSet, basename='wallet')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = router.urls + [
    path('stats/', TransactionStatsView.as_view(), name='transaction-stats'),
    path('balance/', WalletTotalView.as_view(), name='wallets-total'),
]
