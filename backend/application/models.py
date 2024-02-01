from django.db import models
from django.utils import timezone

from accounts.models import SeekerUser
from comments.models import Comment
from petlisting.models import PetListing
from django.conf import settings

class Application(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('denied', 'Denied'),
        ('withdrawn', 'Withdrawn'),
    ]
    application_id = models.AutoField(primary_key=True)
    pet_listing = models.ForeignKey(PetListing, on_delete=models.CASCADE)
    applicant = models.ForeignKey(SeekerUser, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    creation_time = models.DateTimeField(default=timezone.now)
    last_update_time = models.DateTimeField(auto_now=True)
    comments = models.ManyToManyField(Comment, related_name='application_comment', blank=True)
