from rest_framework import serializers
from .models import Application

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['application_id', 'pet_listing', 'applicant', 'status', 'creation_time', 'last_update_time']
        read_only_fields = ['application_id', 'pet_listing', 'applicant', 'creation_time', 'last_update_time']
