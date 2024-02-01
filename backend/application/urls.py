from django.urls import path
from .views import *

urlpatterns = [
    path('applications/new', ApplicationCreateView.as_view(), name='application-create'),
    path('applications/list', ApplicationListView.as_view(), name='application-list'),
    path('applications/<int:pk>', ApplicationUpdateRetrieveView.as_view(), name='application-update-detail')
]