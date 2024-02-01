from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from accounts.models import SeekerUser, ShelterUser
from .models import Application
from petlisting.models import PetListing
from .serializers import ApplicationSerializer
from django.core.exceptions import PermissionDenied
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from notification.models import Notification
from rest_framework.filters import SearchFilter



class ApplicationCreateView(generics.CreateAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        pet_listing_id = self.request.data.get('pet_listing')
        pet_listing = get_object_or_404(PetListing, pk=pet_listing_id)

        if pet_listing.status != 'available':
            raise ValidationError('This pet listing is not available.')

        if not hasattr(self.request.user, 'seekeruser'):
            raise PermissionDenied("You do not have permission to create this application.")
        
        existing_application = Application.objects.filter(
            applicant=self.request.user.seekeruser,
            pet_listing=pet_listing,
            status__in=['pending', 'accepted']
        ).exists()

        if existing_application:
            raise ValidationError('You have already applied for this pet.')

        application = serializer.save(applicant=self.request.user.seekeruser, pet_listing=pet_listing)
        text = "I want to adopt this pet!"
        Notification.objects.create(
                    recipient=pet_listing.shelter.user,
                    message=f"New application from {self.request.user.username}: {text}",
                    link=f"/applications/{application.pk}" 
                )

class ApplicationListView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['status']
    ordering_fields = ['creation_time', 'last_update_time']
    ordering = ['-creation_time']
    searching_fields = ['status']
    pagination_class = PageNumberPagination

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'shelteruser'):
            return Application.objects.filter(pet_listing__shelter=user.shelteruser)
        elif hasattr(user, 'seekeruser'):
            return Application.objects.filter(applicant=user.seekeruser)
        else:
            raise PermissionDenied("You do not have permission to see these applications.")
        

class ApplicationUpdateRetrieveView(generics.RetrieveUpdateAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        application = serializer.instance
        user = self.request.user
        try:
            seeker_user = SeekerUser.objects.get(user=user)
            if application.applicant == seeker_user:
                if application.status in ['pending', 'accepted'] and serializer.validated_data['status'] == 'withdrawn':
                    serializer.save()
                else:
                    raise PermissionDenied("Pet seeker can only update status from pending or accepted to withdrawn.")
            else:
                raise PermissionDenied("You do not have permission to update this application.")
        except SeekerUser.DoesNotExist:
            shelter_user = ShelterUser.objects.get(user=user)
            if application.pet_listing.shelter == shelter_user:
                new_status = serializer.validated_data.get('status')
                if application.status == 'pending' and new_status in ['accepted', 'denied']:
                    serializer.save()

                    if new_status == 'accepted':
                        # Update the PetListing status to 'adopted'
                        pet_listing = application.pet_listing
                        pet_listing.status = 'adopted'
                        pet_listing.save()

                        # Update all other pending applications for this pet to 'denied'
                        Application.objects.filter(
                            pet_listing=pet_listing,
                            status='pending'
                        ).exclude(pk=application.pk).update(status='denied')

                else:
                    raise PermissionDenied("Shelter can only update status from pending to accepted or denied.")
            else:
                raise PermissionDenied("You do not have permission to update this application.")

        except ShelterUser.DoesNotExist:
            raise PermissionDenied("You do not have permission to update this application.")
        # except SeekerUser.DoesNotExist:
        #     shelter_user = ShelterUser.objects.get(user=user)
        #     if application.pet_listing.shelter == shelter_user:
        #         if application.status == 'pending' and serializer.validated_data['status'] in ['accepted', 'denied']:
        #             serializer.save()
        #         else:
        #             raise PermissionDenied("Shelter can only update status from pending to accepted or denied.")
        #     else:
        #         raise PermissionDenied("You do not have permission to update this application.")
        # except ShelterUser.DoesNotExist:
        #     raise PermissionDenied("You do not have permission to update this application.")

    def get_queryset(self):
        """
        Optionally restricts the returned applications to a given user,
        by filtering against a `username` query parameter in the URL.
        """
        queryset = super().get_queryset()
        user = self.request.user
        return queryset