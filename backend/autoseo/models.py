from django.db import models


class Analysis(models.Model):

    url = models.URLField()

    created_at = models.DateTimeField(auto_now_add=True)

class Page(models.Model):
    analysis = models.ForeignKey(
        Analysis,
        on_delete=models.CASCADE,
        related_name="pages"
    )

    url = models.URLField()

    status_code = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    title = models.TextField(blank=True)
    meta_description = models.TextField(blank=True)
    meta_keywords = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)