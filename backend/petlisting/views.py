from .models import PetListing
from .permissions import IsShelterUser, IsShelterUserAndOwner
from .serializers import PetListingSerializer
from rest_framework import generics
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from rest_framework import permissions
from django.shortcuts import get_object_or_404
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.filters import SearchFilter

class PetListingCreate(generics.CreateAPIView):
    serializer_class = PetListingSerializer
    permission_classes = [IsShelterUser]

    def perform_create(self, serializer):
        if not self.request.user.is_authenticated or not hasattr(self.request.user, 'shelteruser'):
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        serializer.save(shelter=self.request.user.shelteruser)


class PetListingRetrieveUpdateDestroy(RetrieveUpdateDestroyAPIView):
    queryset = PetListing.objects.all()
    serializer_class = PetListingSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            self.permission_classes = [IsShelterUserAndOwner]
        else:
            self.permission_classes = [permissions.IsAuthenticatedOrReadOnly]
        return super().get_permissions()

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()

class PetListingList(generics.ListAPIView):
    queryset = PetListing.objects.all()
    serializer_class = PetListingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    search_fields = ['name']
    filterset_fields = ['status', 'breed', 'age', 'gender', 'size', 'shelter']
    ordering_fields = ['name', 'age']
    ordering = ['name']

    def get_queryset(self):
        queryset = super().get_queryset()
        shelter_id = self.request.query_params.get('shelter_id')
        if shelter_id:
            queryset = queryset.filter(shelter_petlisting__user__pk=shelter_id)
        return queryset
