import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import sys
sys.path.append(os.path.join(os.getcwd(), 'backend'))

# Manually load env vars from backend/.env if needed
from dotenv import load_dotenv
load_dotenv('backend/.env')

django.setup()

from properties.models import Property

print("Properties in database:")
for p in Property.objects.all():
    print(f"ID: {p.id}, Title: {p.title}, Image: {p.image}, URL: {p.image_url}")
