from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from accounts.models import ShelterUser, SeekerUser
from application.models import Application
from .serializers import CommentSerializer
from notification.models import Notification


class ShelterCommentCreateListView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination

    def post(self, request, username):
        try:
            shelter_user = ShelterUser.objects.get(user__username=username)
            text = request.data.get('text')
            user = request.user

            serializer = CommentSerializer(data={"username": user.username, "text": text, "creationTime": timezone.now()})
            if serializer.is_valid():
                comment = serializer.save()
                shelter_user.comments.add(comment)

                Notification.objects.create(
                    recipient=shelter_user.user,
                    message=f"New comment from {user.username}: {text}",
                    link=f"/shelter/{username}" 
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response({'detail': 'invalid comment' + str(serializer.errors)}, status=status.HTTP_400_BAD_REQUEST)
        except ShelterUser.DoesNotExist:
            return Response({'detail': 'Shelter not Found'}, status=status.HTTP_404_NOT_FOUND)

    def get(self, request, username):
        try:
            shelter_user = ShelterUser.objects.get(user__username=username)
            comments = shelter_user.comments.all().order_by('-creationTime')

            paginator = self.pagination_class()
            result_page = paginator.paginate_queryset(comments, request)

            serializer = CommentSerializer(result_page, many=True)
            return paginator.get_paginated_response(serializer.data)
        except ShelterUser.DoesNotExist:
            return Response({'detail': 'Shelter not found'}, status=status.HTTP_404_NOT_FOUND)

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return super().get_permissions()


class ApplicationCommentCreateListView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination
    def post(self, request, pk):
        user = request.user
        try:
            application = Application.objects.get(pk=pk)
            try:
                shelter_user = ShelterUser.objects.get(user__username=user.username)
                if application.pet_listing.shelter != shelter_user:
                    return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            except ShelterUser.DoesNotExist:
                seeker_user = SeekerUser.objects.get(user__username=user.username)
                if application.applicant != seeker_user:
                    return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            text = request.data.get('text')
            user = request.user

            serializer = CommentSerializer(data={"username": user.username, "text": text, "creationTime": timezone.now()})
            if serializer.is_valid():
                comment = serializer.save()
                application.comments.add(comment)
                application.last_update_time = timezone.now()
                if user == application.applicant.user:
                    Notification.objects.create(
                        recipient=application.pet_listing.shelter.user,
                        message=f"New comment on application {pk} by {user.username}",
                        link=f"/application/{pk}"
                    )
                else:
                    Notification.objects.create(
                        recipient=application.applicant.user,
                        message=f"New comment on application {pk} by {user.username}",
                        link=f"/application/{pk}"
                    )

                return Response(status=status.HTTP_201_CREATED)
            else:
                return Response({'detail': 'invalid comment' + str(serializer.errors)}, status=status.HTTP_400_BAD_REQUEST)

        except Application.DoesNotExist:
            return Response({'detail': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)


    def get(self, request, pk):
        user = request.user
        try:
            application = Application.objects.get(pk=pk)
            try:
                shelter_user = ShelterUser.objects.get(user__username=user.username)
                if application.pet_listing.shelter != shelter_user:
                    return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            except ShelterUser.DoesNotExist:
                seeker_user = SeekerUser.objects.get(user__username=user.username)
                if application.applicant != seeker_user:
                    return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            comments = application.comments.all().order_by('-creationTime')

            paginator = self.pagination_class()
            result_page = paginator.paginate_queryset(comments, request)

            serializer = CommentSerializer(result_page, many=True)
            return paginator.get_paginated_response(serializer.data)

        except Application.DoesNotExist:
            return Response({'detail': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
