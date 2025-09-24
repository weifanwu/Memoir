from django.urls import path
from .views import AddDiaryView, SearchDiaryView

urlpatterns = [
    path("add_diary/", AddDiaryView.as_view()),
    path("search_diary/", SearchDiaryView.as_view()),
]