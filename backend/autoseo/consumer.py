from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
import subprocess
from .models import Page
import asyncio
from asgiref import sync_to_async


class AnalysisConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        await self.accept()

    @database_sync_to_async
    def get_pages(self):

        pages = Page.objects.all()

        return [
            {
                "id": page.id,
                "url": page.url,
                "status": page.status_code,
                "title": page.title,
                "description": page.meta_description,
                "keywords": page.keywords,
            }
            for page in pages
        ]

    async def start_crawler(self, start_url):

        def run():

            process = subprocess.run(
                [
                    "scrapy",
                    "crawl",
                    "site",
                    "-a",
                    f"start_url={start_url}",
                ],
                cwd="crawler"
            )

            return process.returncode

        return await asyncio.to_thread(run)

    async def receive_json(self, content, **kwargs):

        message_type = content.get("type")

        if message_type == "start_crawl":

            start_url = content.get("url")

            await self.send_json({
                "type": "crawl_started",
                "url": start_url
            })

            async def del_model():
             
                sync_to_async(Page.objects.all().delete())

            await del_model()

            return_code = await self.start_crawler(start_url)

            await self.send_json({
                "type": "crawl_finished",
                "url": start_url,
                "success": return_code == 0
            })

            pages = await self.get_pages()

            await self.send_json({
                "type": "pages",
                "data": pages
            })

            print("START URL:", start_url)