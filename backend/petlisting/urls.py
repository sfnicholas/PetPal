from django.urls import path
from .views import PetListingCreate, PetListingRetrieveUpdateDestroy, PetListingList

urlpatterns = [
    path('petlistings', PetListingList.as_view(), name='petlisting-list'),  # List and search pet listings
    path('petlistings/new', PetListingCreate.as_view(), name='petlisting-create'),  # Create a new pet listing
    path('petlistings/<int:pk>', PetListingRetrieveUpdateDestroy.as_view(), name='petlisting-detail'),  # Retrieve, update, or delete a pet listing
]