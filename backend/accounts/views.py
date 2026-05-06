from rest_framework import generics, permissions, viewsets
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserSerializer, CustomTokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


# ---------------------------------------------------------------------------
# Custom login view — uses enriched serializer
# ---------------------------------------------------------------------------
class CustomTokenObtainPairView(TokenObtainPairView):
    """
    POST /api/auth/login/

    Returns:
        {
          "refresh": "...",
          "access": "...",
          "user": {
            "id": 1,
            "username": "admin",
            "email": "admin@stayhub.com",
            "full_name": "",
            "role": "ADMIN",
            "is_staff": true,
            "is_superuser": true
          }
        }
    """
    serializer_class = CustomTokenObtainPairSerializer


# ---------------------------------------------------------------------------
# Register (create new user)
# ---------------------------------------------------------------------------
class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


# ---------------------------------------------------------------------------
# Profile (get / update current user)
# ---------------------------------------------------------------------------
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ---------------------------------------------------------------------------
# Admin: full user management
# ---------------------------------------------------------------------------
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
