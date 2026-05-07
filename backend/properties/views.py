from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Property, Booking
from .serializers import PropertySerializer, BookingSerializer
from django.core.mail import send_mail
from django.conf import settings
from django.db import models

class IsHostOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.host == request.user

from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all().order_by('-created_at')
    serializer_class = PropertySerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        queryset = Property.objects.all().order_by('-created_at')
        host_id = self.request.query_params.get('host_id')
        if host_id:
            queryset = queryset.filter(host_id=host_id)
        
        # Search by location and keyword
        location = self.request.query_params.get('location')
        keyword = self.request.query_params.get('keyword')
        room_type = self.request.query_params.get('room_type')

        if location:
            queryset = queryset.filter(location__icontains=location)
        if keyword:
            queryset = queryset.filter(models.Q(title__icontains=keyword) | models.Q(description__icontains=keyword))
        if room_type:
            queryset = queryset.filter(room_types__name=room_type).distinct()
            
        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsHostOrReadOnly]
        else:
            permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        # Only owners or admins can create properties
        if self.request.user.role not in ['HOST', 'ADMIN']:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only hosts can add properties.")
        
        property_obj = serializer.save(host=self.request.user)
        self.handle_related_data(property_obj)

    def perform_update(self, serializer):
        property_obj = serializer.save()
        self.handle_related_data(property_obj)

    def handle_related_data(self, property_obj):
        # Handle multiple image uploads
        images_data = self.request.FILES.getlist('images')
        from .models import PropertyImage, RoomType
        for image in images_data:
            PropertyImage.objects.create(property=property_obj, image=image)
        
        # Fallback: If main image is missing but gallery images were uploaded, 
        # use the first gallery image as the main image.
        if not property_obj.image and images_data:
            property_obj.image = images_data[0]
            property_obj.save()
        
        # Handle room types if provided in request data
        import json
        room_types_data = self.request.data.get('room_types')
        if room_types_data:
            if isinstance(room_types_data, str):
                try:
                    room_types_data = json.loads(room_types_data)
                except:
                    pass
            
            # For updates, we might want to clear old room types or update them.
            # Simple approach: clear and recreate if provided.
            property_obj.room_types.all().delete()
            
            for rt_data in room_types_data:
                RoomType.objects.create(
                    property=property_obj,
                    name=rt_data.get('name'),
                    price_per_night=rt_data.get('price_per_night'),
                    price_per_day=rt_data.get('price_per_day'),
                    price_per_month=rt_data.get('price_per_month')
                )

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by('-booked_at')
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Booking.objects.all()
        elif user.role == 'HOST':
            # Owner sees bookings for their properties
            return Booking.objects.filter(property__host=user)
        else:
            # Normal user sees their own bookings
            return Booking.objects.filter(user=user)

    def perform_create(self, serializer):
        booking = serializer.save(user=self.request.user)
        
        # Send email to owner
        owner = booking.property.host
        if owner.email:
            subject = f"New Booking for {booking.property.title}"
            message = f"User {booking.user.username} ({booking.user.email}) has booked your property: {booking.property.title}.\n"
            message += f"Guest Details:\nName: {booking.user.full_name or booking.user.username}\nPhone: {booking.user.phone_number or 'N/A'}\n"
            
            # Note: In a real app, use a background task for sending emails
            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [owner.email],
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Failed to send email: {e}")
