from django.urls import path
from .views import save_page

urlpatterns = [
    path("save-page/", save_page),
]