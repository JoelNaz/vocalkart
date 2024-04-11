# yourappname/serializers.py
from django.contrib.auth import authenticate
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import CartItem

UserModel = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ['email', 'username', 'password', 'number']  # Include other fields as needed
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
       # print(validated_data)
        user = UserModel.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def check_user(self, cleaned_data):
        user = authenticate(username=cleaned_data['email'], password=cleaned_data['password'])
        if not user:
            raise serializers.ValidationError('User not found')
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ['id', 'email', 'username', 'number']  # Include other fields as needed




class CartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = ['title', 'image_src', 'price', 'rating', 'created_at']