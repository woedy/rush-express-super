from decimal import Decimal, InvalidOperation

from core.models import DeliverySetting

DEFAULT_DELIVERY_FEE = Decimal("5.00")


def get_delivery_fee_setting() -> Decimal:
    setting = DeliverySetting.objects.filter(key=DeliverySetting.Keys.DELIVERY_FEE_FLAT).first()
    if not setting or not setting.value:
        return DEFAULT_DELIVERY_FEE
    try:
        return Decimal(setting.value)
    except (InvalidOperation, TypeError):
        return DEFAULT_DELIVERY_FEE


def calculate_delivery_fee(subtotal: Decimal) -> Decimal:
    if subtotal <= 0:
        return Decimal("0.00")
    return get_delivery_fee_setting()
