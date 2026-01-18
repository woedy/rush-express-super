import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "rush_express.settings")

app = Celery("rush_express")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
