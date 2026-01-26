from rest_framework import viewsets, permissions
from .models import Wallet, Category, Transaction
from .serializers import WalletSerializer, CategorySerializer, TransactionSerializer, TransactionReadSerializer

class WalletViewSet(viewsets.ModelViewSet):
    serializer_class = WalletSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wallet.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TransactionViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(wallet__user=self.request.user)

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return TransactionReadSerializer
        return TransactionSerializer

    http_method_names = ['get', 'post', 'delete', 'head', 'options']
