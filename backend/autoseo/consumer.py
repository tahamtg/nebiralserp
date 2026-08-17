import json

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from playwright.async_api import async_playwright

class AnanlyzationsUrl(AsyncWebsocketConsumer):

    async def connect(self):

        from .models import Analysis
        self.room = self.scope["url_route"]["kwargs"]["room"]
        self.group_room = f"url+{self.room}"

        await self.channel_layer.group_add(
            self.group_room,
            self.channel_name
        )

        await self.accept()

async def GotoUrl():
    

async def receive(self, text_data=None, bytes_data=None):

    from .models import Page, Analysis

    data = json.loads(text_data)
    types = data.get("type")

    if types == "analyze":

        url = data.get("url")

        if not url:
            return

        analysis = await sync_to_async(
            Analysis.objects.create
        )(
            url=url
        )

        model = await sync_to_async(
            Page.objects.create
        )(
            analysis=analysis,
            url=url,
            title="Test title",
            meta_description="Test description",
            meta_keywords="test, seo",
        )

        await self.channel_layer.group_send(
            self.group_room,
            {
                "type": "sendDetails",
                "title": model.title,
                "meta_description": model.meta_description,
                "meta_keywords": model.meta_keywords,
            }
        )
            