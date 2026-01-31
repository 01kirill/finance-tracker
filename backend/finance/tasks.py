import requests
import logging
from django.core.cache import cache
from celery import shared_task

logger = logging.getLogger(__name__)

@shared_task
def update_exchange_rates():
    """
    Скачивает курсы валют относительно USD и сохраняет их в Redis.
    Используем бесплатное API: https://api.exchangerate-api.com/
    """
    try:
        url = "https://api.exchangerate-api.com/v4/latest/USD"
        response = requests.get(url)
        data = response.json()

        rates = data.get('rates', {})

        cache.set('currency_rates', rates, timeout=86400 + 3600)

        logger.info(f"Exchange rates updated: {rates}")
        return "Rates updated"

    except Exception as e:
        logger.error(f"Error updating rates: {e}")
        return "Failed"
