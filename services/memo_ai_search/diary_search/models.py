from django.db import models

class Diary(models.Model):
    diaryid = models.CharField(max_length=200, primary_key=True)
    username = models.CharField(max_length=100)
    content = models.TextField()
    date = models.DateField()

    def __str__(self):
        return f"{self.username} - {self.date}"
