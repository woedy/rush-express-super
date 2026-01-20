from __future__ import annotations

from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken


@database_sync_to_async
def get_user_for_token(token: str):
    try:
        validated = AccessToken(token)
    except TokenError:
        return AnonymousUser()
    user_id = validated.get("user_id")
    if not user_id:
        return AnonymousUser()
    User = get_user_model()
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()


class JwtAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        token = None
        query_string = scope.get("query_string", b"").decode("utf-8")
        if query_string:
            params = parse_qs(query_string)
            token = (params.get("token") or params.get("access") or [None])[0]

        if not token:
            headers = dict(scope.get("headers") or [])
            auth_header = headers.get(b"authorization")
            if auth_header:
                try:
                    auth_value = auth_header.decode("utf-8")
                    if auth_value.lower().startswith("bearer "):
                        token = auth_value.split(" ", 1)[1].strip()
                except UnicodeDecodeError:
                    token = None

        scope["user"] = AnonymousUser()
        if token:
            scope["user"] = await get_user_for_token(token)
        return await self.inner(scope, receive, send)
