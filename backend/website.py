import scrapy
from urllib.parse import urlparse

class WebsiteSpider(scrapy.Spider):
    name = "website"
    def __init__(self, start_url=None, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.start_urls=[
            start_url
        ]

        parsed_url = urlparse(start_url)

        self.allowed_domains = [
            parsed_url.netloc
        ]
        
    def parse(self, response):
        title = response.css("title::text").get()
        description = response.css("meta[name='description']::attr(content)")

        yield{
            "url": response.url,
            "status": response.status,
            "title": title,
            "description": description,
        }
            
