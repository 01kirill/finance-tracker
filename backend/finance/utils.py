from decimal import Decimal

def convert_currency(amount, source_currency, target_currency, rates):
    """
    Конвертирует сумму из source в target, используя словарь rates (относительно USD).
    """
    if source_currency == target_currency:
        return amount

    try:
        rate_target = Decimal(str(rates.get(target_currency, 1)))
        rate_source = Decimal(str(rates.get(source_currency, 1)))
        return amount * (rate_target / rate_source)
    except Exception:
        return amount
