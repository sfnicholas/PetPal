from django.urls import path
from .views import *

urlpatterns = [
    path('notifications', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>', NotificationUpdateDeleteView.as_view(), name='notification-update'),
    path('notifications/view', NotificationView.as_view(), name='get-notification'),
]
