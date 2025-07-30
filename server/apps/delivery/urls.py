from django.urls import path
from .views import AddAddress, AddressEditor, DeleteAddress, SetDefaultAddress, PostShipit

urlpatterns = [
    path('post/shipit', PostShipit.as_view()),
    path('add/address', AddAddress.as_view()),
    path('address/editor', AddressEditor.as_view()),
    path('delete/address', DeleteAddress.as_view()),
    path('set/default/address', SetDefaultAddress.as_view()),
]