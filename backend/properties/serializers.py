from rest_framework import serializers
from .models import Property, Booking, RoomType, PropertyImage
from accounts.serializers import UserSerializer

class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image']

class RoomTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomType
        fields = ['id', 'name', 'price_per_night', 'price_per_day', 'price_per_month']

class BookingSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    property_title = serializers.ReadOnlyField(source='property.title')
    room_type_name = serializers.ReadOnlyField(source='room_type.name')

    class Meta:
        model = Booking
        fields = [
            'id', 'property', 'property_title', 'user', 'user_details', 
            'room_type', 'room_type_name', 'payment_type', 
            'check_in', 'check_out', 'booked_at', 'is_confirmed'
        ]
        read_only_fields = ['user', 'booked_at']

class PropertySerializer(serializers.ModelSerializer):
    host_username = serializers.ReadOnlyField(source='host.username')
    host_details = UserSerializer(source='host', read_only=True)
    room_types = RoomTypeSerializer(many=True, read_only=True)
    images = PropertyImageSerializer(many=True, read_only=True)

    class Meta:
        model = Property
        fields = [
            'id', 'host', 'host_username', 'host_details', 'title', 'description', 
            'property_type', 'price_per_night', 'price_per_day', 'price_per_month',
            'allows_nightly', 'allows_daily', 'allows_monthly',
            'location', 'advance_payment_amount', 'image', 'image_url', 'amenities', 
            'is_available', 'room_types', 'images', 'created_at'
        ]
        read_only_fields = ['host']
