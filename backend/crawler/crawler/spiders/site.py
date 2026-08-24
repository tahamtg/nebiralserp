import scrapy
from urllib.parse import urlparse
import re
from collections import Counter
import requests

class WebsiteSpider(scrapy.Spider):
    name = "site"
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

        print(
            "CRAWL:",
            response.status,
            response.url
        )

        if response.status >= 500:
            print(
                "TARGET WEBSITE ERROR:",
                response.status,
                response.url
            )
            return

        title = response.css("title::text").get()
        description = response.css(
            "meta[name='description']::attr(content)"
        ).get()

        keywords = response.css("body *::text").getall()

        text = " ".join(keywords)

        words = re.findall(
            r"[\u0600-\u06FF]+",
            text
        )

        onekeyword = words

       
        second_keywords = [
            f"{first} {second}"
            for first, second in zip(words, words[1:])
        ]


        third_keywords = [
            f"{first} {second} {third}"
            for first, second, third in zip(
                words,
                words[1:],
                words[2:]
            )
        ]

        pharses = onekeyword + second_keywords + third_keywords

        words_count = Counter(pharses)

        for key, count in words_count.most_common(30):
            key= {
                "key": key,
                "count": count,
            }
                
        
        alt = response.css("img::attr(alt)").getall()

        keywordPage = response.css(
            "meta[name='keywords']::attr(content)"
        ).get()

        data = {
            "url": response.url,
            "status": response.status,
            "title": title,
            "description": description,
            "keywords": key,
            "keyword": keywordPage,
            "alt": alt,
        }

        response_save = requests.post(
            "http://127.0.0.1:8000/api/save-page/",
            json=data,
            timeout=10
        )

        print(
            "SAVE PAGE:",
            response_save.status_code,
            response_save.text
        )

        links = response.css("a::attr(href)").getall()

        for link in links:

            if link.startswith((
                "tel:",
                "mailto:",
                "javascript:",
                "#"
            )):
                continue

            yield response.follow(
                link,
                callback=self.parse
            )
                
            
            
