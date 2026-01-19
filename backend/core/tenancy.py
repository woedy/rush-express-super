from django.db.models import QuerySet


def filter_by_merchant(queryset: QuerySet, merchant_field: str, merchant_id) -> QuerySet:
    if merchant_id is None:
        return queryset.none()
    return queryset.filter(**{merchant_field: merchant_id})
