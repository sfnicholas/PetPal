from django.db import models
from django.conf import settings
from django.utils import timezone

class Notification(models.Model):
    STATUS_CHOICES = [('unread', 'Unread'), ('read', 'Read')]

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='unread')
    created_at = models.DateTimeField(auto_now_add=True)
    message = models.TextField()
    link = models.URLField()

    def __str__(self):
        return f'Notification for {self.recipient.username} - Status: {self.status}'
