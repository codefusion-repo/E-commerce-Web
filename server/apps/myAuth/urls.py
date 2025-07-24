from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenVerifyView, TokenRefreshView

urlpatterns = [
    path('get/device/ip', GetDeviceIp.as_view()),
    path('register', Register.as_view()),
    path('verify/email', VerifyEmail.as_view()),
    path('login', Login.as_view()),
    path('verify/firebase/id/token', VerifyFirebaseIdToken.as_view()),
    path('verify', TokenVerifyView.as_view()),
    path('refresh', TokenRefreshView.as_view()),
]