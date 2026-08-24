from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Page

@api_view(["POST"])
def save_page(request):
    try:
        data = request.data

        Page.objects.update_or_create(
            url=data["url"],
            defaults={
                "status_code": data.get("status"),
                "title": data.get("title") or "",
                "meta_description": data.get("description") or "",
                "keywords": data.get("keywords") or [],
                "alt": data.get("alt") or "",
            }
        )

        return Response({
            "message": "Page saved successfully"
        })

    except Exception as e:
        print("SAVE ERROR:", e)

        return Response({
            "error": str(e)
        }, status=500)
