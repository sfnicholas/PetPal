from django.urls import path
from .views import *

urlpatterns = [
    # Comment views
    path('shelter/<str:username>/comments', ShelterCommentCreateListView.as_view(), name='shelter-comment-create-list-view'),
    path('application/<int:pk>/comments', ApplicationCommentCreateListView.as_view(),
         name='application-comment-create-view'),

]
