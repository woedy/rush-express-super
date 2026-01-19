from typing import Any

from django.contrib.auth import get_user_model

from .models import AuditLog

User = get_user_model()


def log_audit(action: str, entity: str, actor: User | None = None, metadata: dict[str, Any] | None = None) -> AuditLog:
    payload = metadata or {}
    return AuditLog.objects.create(actor=actor, action=action, entity=entity, metadata=payload)
