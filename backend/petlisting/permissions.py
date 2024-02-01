from rest_framework import permissions
from accounts.models import ShelterUser

class IsShelterUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'shelteruser')

class IsShelterUserAndOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.shelter.user == request.user
