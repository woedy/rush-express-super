from decimal import Decimal


DELIVERY_FEE_FLAT = Decimal("5.00")


def calculate_delivery_fee(subtotal: Decimal) -> Decimal:
    if subtotal <= 0:
        return Decimal("0.00")
    return DELIVERY_FEE_FLAT

