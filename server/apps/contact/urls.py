from django.urls import path
from .views import *

urlpatterns = [
    path('send/message', SendMessage.as_view()),
    path('user/in/newsletter', UserInNewsletter.as_view()),
]