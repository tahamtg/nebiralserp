from django.db import models


class Page(models.Model):
    
    url = models.URLField()

    status_code = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    title = models.TextField(blank=True)
    meta_description = models.TextField(blank=True)
    keywords = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)