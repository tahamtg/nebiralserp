from django.urls import re_path
from .consumer import AnanlyzationsUrl

websocket_urlpatterns =[
    re_path(
    r"ws/analyze/$",
    AnanlyzationsUrl.as_asgi()
)
]