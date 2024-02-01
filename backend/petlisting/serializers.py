from rest_framework import serializers
from .models import PetListing
from accounts.models import ShelterUser

class PetListingSerializer(serializers.ModelSerializer):
    shelter = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = PetListing
        fields = '__all__'
        read_only_fields = ['shelter' ]