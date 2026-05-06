from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


# ---------------------------------------------------------------------------
# Standard user serializer (used for register / profile / admin user list)
# ---------------------------------------------------------------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'password',
            'role', 'phone_number', 'address', 'full_name',
            'is_staff', 'is_superuser',
        )
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


# ---------------------------------------------------------------------------
# Custom JWT serializer
# Adds extra claims to the token payload and enriches the login response.
# ---------------------------------------------------------------------------
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        """Embed extra claims directly inside the JWT payload."""
        token = super().get_token(user)

        # Custom claims — readable by any service that decodes the token
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser

        return token

    def validate(self, attrs):
        """Return tokens + a 'user' object so the frontend can route correctly."""
        data = super().validate(attrs)

        user = self.user

        # Determine the effective role:
        # Superusers and staff members are treated as ADMIN on the frontend.
        effective_role = user.role
        if user.is_superuser or user.is_staff:
            effective_role = 'ADMIN'

        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': user.full_name or '',
            'role': effective_role,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        }

        return data
