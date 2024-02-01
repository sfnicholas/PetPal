from django.contrib.auth.base_user import BaseUserManager
from django.db import models
from django.contrib.auth.models import AbstractUser
from notification.models import Notification
from comments.models import Comment
# from petlisting.models import PetListing
#from application.models import Application


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    objects = CustomUserManager()
    REQUIRED_FIELDS = ['email']
    #USERNAME_FIELD = 'email'

    def __str__(self):
        return self.email

class ShelterUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar = models.ImageField(blank=True)
    phone = models.CharField(max_length=10)
    address = models.CharField(max_length=255)
    mission_statement = models.TextField()
    # pet_listings = models.ManyToManyField(PetListing, related_name='shelter_petlisting', blank=True)
    comments = models.ManyToManyField(Comment, related_name='shelter_comment', blank=True)
    #pet_listings = models.ManyToManyField(PetListing, related_name='shelter_petlisting', blank=True)
    #notifications = models.ManyToManyField(Notification, related_name='shelter_notification', blank=True)

    def __str__(self):
        return self.user.email


class SeekerUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar = models.ImageField(blank=True)
    phone = models.CharField(max_length=10)
    address = models.CharField(max_length=255)
    #applications = models.ManyToManyField(Application, related_name='seeker_application', blank=True)
    #notifications = models.ManyToManyField(Notification, related_name='seeker_notification', blank=True)

    def __str__(self):
        return self.user.email


