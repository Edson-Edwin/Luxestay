from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    USER_ROLES = (
        ('NORMAL', 'Normal User'),
        ('HOST', 'Property Host'),
        ('ADMIN', 'Administrator'),
    )
    role = models.CharField(max_length=10, choices=USER_ROLES, default='NORMAL')
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    full_name = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
