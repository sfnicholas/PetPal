from django.contrib.contenttypes.fields import GenericForeignKey, ContentType
from django.db import models
from django.utils import timezone


class Comment(models.Model):
    text = models.TextField()
    creationTime = models.DateTimeField(auto_now_add=True)
    username = models.TextField()




    # This is for When an application receives a new comment, its "last update time" should be changed.
    """def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.application.last_update_time = timezone.now()
        self.application.save()"""
