from decimal import Decimal
from django.db.models import Sum
from django.core.cache import cache
from django.utils.dateparse import parse_date
from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .tasks import update_exchange_rates
from .utils import convert_currency

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

        target_currency = request.query_params.get('currency', 'BYN').upper()

        rates = cache.get('currency_rates')
        if not rates:
            update_exchange_rates()
            rates = cache.get('currency_rates')

        if not rates:
            rates = {'BYN': 1, 'USD': 1, 'EUR': 1}

        queryset = Transaction.objects.filter(
            wallet__user=request.user,
            category__transaction_type='EXPENSE'
        )
        if start_date:
            queryset = queryset.filter(date__gte=parse_date(start_date))
        if end_date:
            queryset = queryset.filter(date__lte=parse_date(end_date))

        raw_stats = queryset.values(
            'category__title',
            'category__id',
            'wallet__currency'
        ).annotate(total_amount=Sum('amount'))

        final_stats = {}

        for item in raw_stats:
            cat_id = item['category__id']
            title = item['category__title']
            amount = item['total_amount']
            source_currency = item['wallet__currency']

            amount_converted = convert_currency(
                amount,
                source_currency,
                target_currency,
                rates
            )

            if cat_id not in final_stats:
                final_stats[cat_id] = {
                    'category__title': title,
                    'category__id': cat_id,
                    'total_amount': Decimal(0)
                }

            final_stats[cat_id]['total_amount'] += amount_converted

        response_data = sorted(
            final_stats.values(),
            key=lambda x: x['total_amount'],
            reverse=True
        )

        return Response(response_data)


class WalletTotalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        target_currency = request.query_params.get('currency', 'BYN').upper()

        rates = cache.get('currency_rates')
        if not rates:
            update_exchange_rates()
            rates = cache.get('currency_rates')

        if not rates:
            rates = {'BYN': 1, 'USD': 1, 'EUR': 1}
        wallets = Wallet.objects.filter(user=request.user)
        total_balance = Decimal(0)
        for wallet in wallets:
            converted_amount = convert_currency(
                wallet.balance,
                wallet.currency,
                target_currency,
                rates
            )
            total_balance += converted_amount

        return Response({
            'total': total_balance,
            'currency': target_currency
        })
