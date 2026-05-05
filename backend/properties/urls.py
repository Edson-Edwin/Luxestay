from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet, BookingViewSet

router = DefaultRouter()
router.register(r'bookings', BookingViewSet)
router.register(r'', PropertyViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
