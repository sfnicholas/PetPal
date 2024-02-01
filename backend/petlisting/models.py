from django.db import models
from accounts.models import ShelterUser


# Create your models here.
class PetListing(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('adopted', 'Adopted'),
        ('canceled', 'Canceled')
    ]
    GENDER_CHOICES = [
        ('m', 'M'),
        ('f', 'F'),
    ]
    # Filter on shelter, status_choices, gender_choices, species.  
    #pk = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='available')
    description = models.TextField()
    adoption_fee = models.CharField(max_length=10)
    shelter = models.ForeignKey(ShelterUser, on_delete=models.CASCADE, related_name='pet_listings')
    species = models.CharField(max_length=255)
    breed = models.CharField(max_length=255)
    age = models.IntegerField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default=('m', 'M'))
    size = models.CharField(max_length=255)
    medical_history = models.TextField()
    behavior = models.TextField()
    special_needs = models.TextField()
    image1 = models.ImageField(upload_to='images/', null=True, blank=True)
    image2 = models.ImageField(upload_to='images/', null=True, blank=True)
    image3 = models.ImageField(upload_to='images/', null=True, blank=True)

