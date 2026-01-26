from rest_framework import serializers
from .models import Wallet, Category, Transaction

class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ['id', 'name', 'currency', 'balance', 'created_at']
        read_only_fields = ['balance']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'title', 'transaction_type']

class TransactionReadSerializer(serializers.ModelSerializer):
    # Вкладываем полные объекты вместо ID
    wallet = WalletSerializer(read_only=True)
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Transaction
        fields = ['id', 'wallet', 'category', 'amount', 'date', 'description', 'created_at']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'wallet', 'category', 'amount', 'date', 'description', 'created_at']

    def validate(self, data):
        user = self.context['request'].user

        if data['wallet'].user != user:
            raise serializers.ValidationError("Вы не можете использовать чужой кошелек!")

        if data['category'] and data['category'].user != user:
            raise serializers.ValidationError("Вы не можете использовать чужую категорию!")

        return data
