import logging
from django.http import JsonResponse
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

logger = logging.getLogger(__name__)

class HealthView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        # Log to stdout so we can see it in Docker logs
        logger.info("Health check endpoint hit")
        return JsonResponse({"status": "ok"})


class ReadyView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        logger.info("Ready check endpoint hit")
        return JsonResponse({"status": "ready"})
