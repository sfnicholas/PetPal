# views.py

from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile

from application.models import Application
from .serializers import UserSerializer, ShelterUserSerializer, SeekerUserSerializer
from .models import User, ShelterUser, SeekerUser


class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user_type = request.data.get('user_type')
        if user_type not in ['seeker', 'shelter']:
            return Response({'error': 'Invalid user type'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            data = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
            if user_type == 'seeker':
                serializer = SeekerUserSerializer(data={'user': user.pk})
                if serializer.is_valid():
                    seeker= serializer.save()
                    seeker.address = request.data.get('address')
                    seeker.phone = request.data.get('phone')
                    seeker.save()
                    return Response(data, status=status.HTTP_201_CREATED)
            elif user_type == 'shelter':
                serializer = ShelterUserSerializer(data={'user': user.pk, 'mission_statement': request.data.get('mission_statement')})
                if serializer.is_valid():
                    shelter = serializer.save()
                    shelter.address = request.data.get('address')
                    shelter.phone = request.data.get('phone')
                    shelter.save()
                    return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = User.objects.filter(username=username).first()

        if user and user.check_password(password):
            refresh = RefreshToken.for_user(user)
            try:
                shelter_user = ShelterUser.objects.get(user=user)
                userType = 'shelter'
            except ShelterUser.DoesNotExist:
                userType = 'seeker'
            data = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user_type': userType,

            }
            return Response(data, status=status.HTTP_200_OK)

        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'detail': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ShelterListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        try:
            # Retrieve all PetShelter instances from the database
            pet_shelters = ShelterUser.objects.all()

            # Serialize the queryset using ShelterUserSerializer
            data = [{'username': shelter.user.username, 'email': shelter.user.email, 'pk': ShelterUserSerializer(shelter).data, 'address': shelter.address, 'phone': shelter.phone, 'mission_statement': shelter.mission_statement, 'id': shelter.pk} for shelter in pet_shelters]

            # Return the serialized data as a response
            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            # Handle exceptions if any
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SeekerProfileUpdateDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        # Check if the logged-in user is a shelter
        user = request.user
        try:
            shelter_user = ShelterUser.objects.get(user=user)
        except ShelterUser.DoesNotExist:
            if user.username == username:
                try:
                    seeker = SeekerUser.objects.get(user=user)
                    
                    data = {'username': seeker.user.username, 'email': seeker.user.email,
                            'pk': SeekerUserSerializer(seeker).data, 'phone': seeker.phone, 'address': seeker.address, 'id': seeker.pk}
                    
                    # Check if the 'avatar' field has a file associated with it
                    if seeker.avatar and seeker.avatar.file:
                        data['avatar'] = seeker.avatar.url
                    else:
                        data['avatar'] = None

                    return Response(data, status=status.HTTP_200_OK)
                except SeekerUser.DoesNotExist:
                    return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            else:
                return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        # Check if there is an active application between the shelter and the seeker
        application = Application.objects.filter(
            pet_listing__shelter=shelter_user,
            applicant__user__username=username)
        if len(application) == 0:
            return Response({'detail': 'No active application with this seeker'}, status=status.HTTP_404_NOT_FOUND)

        # Retrieve the seeker's profile
        seeker = SeekerUser.objects.get(user__username=username)
        data = {'username': seeker.user.username, 'email': seeker.user.email,
            'pk': SeekerUserSerializer(seeker).data, 'phone': seeker.phone, 'address': seeker.address, 'id': seeker.pk}
                    
                    # Check if the 'avatar' field has a file associated with it
        if seeker.avatar and seeker.avatar.file:
            data['avatar'] = seeker.avatar.url
        else:
            data['avatar'] = None

        return Response(data, status=status.HTTP_200_OK)

    def put(self, request, username):
        user = request.user
        if user.username == username:
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                password = request.data.get('password')
                if password:
                    user.set_password(password)
                    user.save()
                seeker = SeekerUser.objects.get(user=user)
                address = request.data.get('address')
                if address:
                    seeker.address = address
                    seeker.save()
                phone = request.data.get('phone')
                if phone:
                    seeker.phone = phone
                    seeker.save()
                avatar_data = request.data.get('avatar')
                if avatar_data:
                    try:
                        # Resize the image if needed
                        image = Image.open(avatar_data)
                        output_buffer = BytesIO()
                        image.save(output_buffer, format='JPEG', quality=60)
                        output_buffer.seek(0)

                        # Save the resized image as InMemoryUploadedFile
                        avatar = InMemoryUploadedFile(output_buffer, 'ImageField', f"{username}_avatar.jpg", 'image/jpeg', None, None)
                        seeker = SeekerUser.objects.get(user=user)
                        seeker.avatar = avatar
                        seeker.save()

                    except Exception as e:
                        return Response({'detail': f'Error processing avatar: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    def delete(self, request, username):
        if request.user.username == username:
            try:
                seeker_user = SeekerUser.objects.get(user=request.user)
            except Exception as e:
                return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

            #for app in seeker_user.applications.all():
            #    app.delete()
            #for notifcation in seeker_user.notifications.all():
            #    notifcation.delete()

            seeker_user.user.delete()
            # Delete the seeker user
            seeker_user.delete()

            return Response({'detail': 'Seeker and associated data deleted successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
class SeekerProfileByPkView(APIView):
     def get(self, request, pk):
        # Check if the logged-in user is a shelter
        user = request.user
        try:
            shelter_user = ShelterUser.objects.get(user=user)
        except ShelterUser.DoesNotExist:
            seeker = SeekerUser.objects.get(pk=pk)
            if user == seeker.user:
                try:
                    seeker = SeekerUser.objects.get(pk=pk)
                    
                    data = {'username': seeker.user.username, 'email': seeker.user.email,
                            'pk': SeekerUserSerializer(seeker).data, 'phone': seeker.phone, 'address': seeker.address, 'id': seeker.pk}
                    
                    
                    # Check if the 'avatar' field has a file associated with it
                    if seeker.avatar and seeker.avatar.file:
                        data['avatar'] = seeker.avatar.url
                    else:
                        data['avatar'] = None

                    return Response(data, status=status.HTTP_200_OK)
                except SeekerUser.DoesNotExist:
                    return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            else:
                return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        # Check if there is an active application between the shelter and the seeker
        seeker = SeekerUser.objects.get(pk=pk)

        application = Application.objects.filter(
                pet_listing__shelter=shelter_user,
                applicant__user__username=seeker.user.username,
        )
        if len(application) == 0:
            return Response({'detail': 'No active application with this seeker'}, status=status.HTTP_404_NOT_FOUND)

        # Retrieve the seeker's profile
        seeker = SeekerUser.objects.get(pk=pk)
        data = {'username': seeker.user.username, 'email': seeker.user.email,
            'pk': SeekerUserSerializer(seeker).data, 'phone': seeker.phone, 'address': seeker.address, 'id': seeker.pk}
                    
                    # Check if the 'avatar' field has a file associated with it
        if seeker.avatar and seeker.avatar.file:
            data['avatar'] = seeker.avatar.url
        else:
            data['avatar'] = None

        return Response(data, status=status.HTTP_200_OK)


class ShelterProfileByPkView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            shelter = ShelterUser.objects.get(pk=pk)
            serializer = ShelterUserSerializer(shelter)
            data = {'username': shelter.user.username, 'email': shelter.user.email, 'pk': ShelterUserSerializer(shelter).data,
                    'address': shelter.address, 'phone': shelter.phone, 'mission_statement': shelter.mission_statement, 'id': shelter.pk}

            if shelter.avatar and shelter.avatar.file:
                data['avatar'] = shelter.avatar.url
            else:
                data['avatar'] = None

            return Response(data, status=status.HTTP_200_OK)        
        except ShelterUser.DoesNotExist:
            return Response({'detail': 'Shelter not found'}, status=status.HTTP_404_NOT_FOUND)
        

class ShelterProfileUpdateDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        try:
            shelter = ShelterUser.objects.get(user__username=username)
            serializer = ShelterUserSerializer(shelter)
            data = {'username': shelter.user.username, 'email': shelter.user.email, 'pk': ShelterUserSerializer(shelter).data,
                    'address': shelter.address, 'phone': shelter.phone, 'mission_statement': shelter.mission_statement, 'id': shelter.pk}

            if shelter.avatar and shelter.avatar.file:
                data['avatar'] = shelter.avatar.url
            else:
                data['avatar'] = None

            return Response(data, status=status.HTTP_200_OK)        
        except ShelterUser.DoesNotExist:
            return Response({'detail': 'Shelter not found'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, username):
        user = request.user  # Assuming the user is authenticated
        if user.username == username:
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                password = request.data.get('password')
                shelter_user = ShelterUser.objects.get(user=user)
                if password:
                    user.set_password(password)
                    user.save()
                address = request.data.get('address')
                if address:
                    shelter_user.address = address
                    shelter_user.save()
                phone = request.data.get('phone')
                if phone:
                    shelter_user.phone = phone
                    shelter_user.save()
                mission_statement = request.data.get('mission_statement')
                if mission_statement:
                    shelter_user.mission_statement = mission_statement
                    shelter_user.save()
                avatar_data = request.data.get('avatar')
                if avatar_data:
                    try:
                        # Resize the image if needed
                        image = Image.open(avatar_data)
                        output_buffer = BytesIO()
                        image.save(output_buffer, format='JPEG', quality=60)
                        output_buffer.seek(0)

                        # Save the resized image as InMemoryUploadedFile
                        avatar = InMemoryUploadedFile(output_buffer, 'ImageField', f"{username}_avatar.jpg", 'image/jpeg', None, None)
                        seeker = ShelterUser.objects.get(user=user)
                        seeker.avatar = avatar
                        seeker.save()

                    except Exception as e:
                        return Response({'detail': f'Error processing avatar: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)


    def delete(self, request, username):
        if request.user.username == username:
            try:
                shelter_user = ShelterUser.objects.get(user=request.user)
            except ShelterUser.DoesNotExist:
                return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

            #for notification in shelter_user.notifications.all():
            #    notification.delete()

            #for pet_listing in shelter_user.pet_listings.all():
            #    pet_listing.delete()

            for comment in shelter_user.comments.all():
                comment.delete()

            shelter_user.user.delete()
            shelter_user.delete()

            return Response({'detail': 'Shelter and associated data deleted successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    # Set permissions for the 'get' method to AllowAny
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return super().get_permissions()