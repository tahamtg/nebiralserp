"""
ASGI config for nebiralserpback project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nebiralserpback.settings')
from django.core.asgi import get_asgi_application
import sys
import asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(
        asyncio.WindowsProactorEventLoopPolicy()
    )

django_asgi_app = get_asgi_application()
from channels.routing import ProtocolTypeRouter, URLRouter
from autoseo.routing import websocket_urlpatterns

application = ProtocolTypeRouter({

    "http": django_asgi_app,
    "websocket": URLRouter(
        websocket_urlpatterns
    ),

}
)

