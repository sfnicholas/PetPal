from rest_framework import serializers
from .models import Comment


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['text', 'username', 'creationTime']
        read_only_fields = ['creationTime']

    def create(self, validated_data):
        # You may want to customize the creation of the comment,
        return Comment.objects.create(**validated_data)
