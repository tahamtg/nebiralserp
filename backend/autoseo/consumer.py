from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
import subprocess
from .models import Page, opponent
import asyncio
from playwright.async_api import async_playwright
from urllib.parse import quote_plus


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
                "alt": page.alt,
            }
            for page in pages
        ]

    @database_sync_to_async
    def del_model(self):
        Page.objects.all().delete()
        
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


    @database_sync_to_async
    def create_opponent(self, data):
        return opponent.objects.create(
            result_analyz=data
        )

    async def main(self, key):
      
      async with async_playwright() as p:
          
          browser = await p.chromium.launch(headless=True) 

          page = await browser.new_page()

          keyword = quote_plus(key)

          await page.goto(
              f"https://www.google.com/search?q={keyword}"
          )

          links = page.locator("a.ZReHs")

          result= []

          for i in range(3):
            urls = links.nth(i)
            titlesite = await urls.inner_text()
            href = await urls.get_attribute("href")

            result.append({
                "title": titlesite,
                "urlsite": href,
            })

          data={
              "result": result,
          }

          await self.create_opponent(data)

          await browser.close()

          return data

    async def receive_json(self, content, **kwargs):

        message_type = content.get("type")

        if message_type == "start_crawl":

            start_url = content.get("url")

            await self.send_json({
                "type": "crawl_started",
                "url": start_url
            })

            await self.del_model()

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

        if message_type == "start_opponent_analyz":

            start_keyword = content.get("keyword")

            await self.send_json({
                "type": "analyz_started"
            })

            data = await self.main(start_keyword)

            await self.send_json({
                "type": "opponents_analyzed",
                "data": data
            })
