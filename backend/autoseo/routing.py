from django.urls import re_path
from .consumer import AnalysisConsumer

websocket_urlpatterns =[
    re_path(
    r"ws/analyze/$",
    AnalysisConsumer.as_asgi()
)
]