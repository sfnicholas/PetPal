# serializers.py

from rest_framework import serializers
from .models import User, ShelterUser, SeekerUser


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'password', 'username']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class ShelterUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = ShelterUser
        fields = ['user']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        shelter_user = ShelterUser.objects.create(user=user_data)
        return shelter_user


class SeekerUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeekerUser
        fields = ['user']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        seeker_user = SeekerUser.objects.create(user=user_data)
        return seeker_user
