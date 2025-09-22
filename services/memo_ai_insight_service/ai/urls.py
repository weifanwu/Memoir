from django.urls import path
from .views import ai_search

urlpatterns = [
    path('ai_search/', ai_search, name='ai_search'),
]