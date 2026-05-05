from django.db import models
from django.conf import settings

class Property(models.Model):
    PROPERTY_TYPES = (
        ('HOSTEL', 'Hostel'),
        ('PRIVATE_ROOM', 'Private Room'),
        ('VILLA', 'Villa'),
        ('BEACHFRONT', 'Beachfront'),
        ('CABIN', 'Cabin'),
        ('CASTLE', 'Castle'),
    )

    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='properties')
    title = models.CharField(max_length=200)
    description = models.TextField()
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPES)
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_per_month = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    allows_nightly = models.BooleanField(default=True)
    allows_daily = models.BooleanField(default=False)
    allows_monthly = models.BooleanField(default=False)
    
    location = models.CharField(max_length=200)
    advance_payment_amount = models.DecimalField(max_digits=10, decimal_places=2, default=50.00, help_text="Fixed advance payment required to book")
    image = models.ImageField(upload_to='properties/', null=True, blank=True)
    image_url = models.URLField(blank=True, null=True, help_text="Fallback for static images if upload is empty")
    amenities = models.JSONField(default=list, blank=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

import os
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile

class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='properties/gallery/')
    
    def save(self, *args, **kwargs):
        if self.image:
            # Open the image using Pillow
            img = Image.open(self.image)
            
            # Convert to RGB if necessary (to handle RGBA or other modes)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize if too large
            max_size = (1200, 1200)
            img.thumbnail(max_size, Image.LANCZOS)
            
            # Compress
            output = BytesIO()
            img.save(output, format='JPEG', quality=70)
            output.seek(0)
            
            # Replace the image with the compressed version
            name = os.path.splitext(self.image.name)[0] + '.jpg'
            self.image = ContentFile(output.read(), name=name)
            
        super().save(*args, **kwargs)

class RoomType(models.Model):
    ROOM_CHOICES = (
        ('DORMITORY', 'Dormitory'),
        ('DOUBLE', 'Double'),
        ('SINGLE', 'Single'),
    )
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='room_types')
    name = models.CharField(max_length=20, choices=ROOM_CHOICES)
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_per_month = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.name} - {self.property.title}"

class Booking(models.Model):
    PAYMENT_TYPE_CHOICES = (
        ('NIGHTLY', 'Nightly'),
        ('DAILY', 'Daily'),
        ('MONTHLY', 'Monthly'),
    )
    
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='bookings')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    room_type = models.ForeignKey(RoomType, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    payment_type = models.CharField(max_length=10, choices=PAYMENT_TYPE_CHOICES, default='NIGHTLY')
    
    check_in = models.DateField(null=True, blank=True)
    check_out = models.DateField(null=True, blank=True)
    
    booked_at = models.DateTimeField(auto_now_add=True)
    is_confirmed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} booked {self.property.title} ({self.payment_type})"
