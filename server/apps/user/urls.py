from django.urls import path
from .views import *

urlpatterns = [
    path('get/profile', GetProfile.as_view()),
    path('profile/editor', ProfileEditor.as_view()),
    path('change/email', ChangeEmail.as_view()),
    path('receive/change/email', ReceiveChangeEmail.as_view()),
    path('set/password', SetPassword.as_view()),
    path('forgot/password', ForgotPassword.as_view()),
    path('receive/change/forgot/password', ReceiveChangeForgotPassword.as_view()),
    path('change/forgotten/password', ChangeForgottenPassword.as_view()),
    path('delete/account', DeleteAccount.as_view()),
    path('receive/delete/account', ReceiveDeleteAccount.as_view()),
    path('resend/verify/code', ResendVerifyCode.as_view()),
]