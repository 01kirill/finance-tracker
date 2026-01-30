from django.db.models import Sum
from django.utils.dateparse import parse_date
from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

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

class TransactionStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        queryset = Transaction.objects.filter(
            wallet__user=request.user,
            category__transaction_type='EXPENSE'
        )

        if start_date:
            queryset = queryset.filter(date__gte=parse_date(start_date))
        if end_date:
            queryset = queryset.filter(date__lte=parse_date(end_date))

        stats = queryset.values('category__title', 'category__id') \
            .annotate(total_amount=Sum('amount')) \
            .order_by('-total_amount')

        return Response(stats)
