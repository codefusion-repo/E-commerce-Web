from django.db import models
from django.db.models.signals import post_save, pre_save
from django.contrib.auth import get_user_model
import uuid

# Create your models here.

User = get_user_model()

class Address(models.Model):
    class Meta:
        verbose_name = "Address"
        verbose_name_plural = "Addresses"
    id = models.CharField(max_length=300, primary_key=True, unique=True, default=uuid.uuid4, editable=False)

    user            = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_address")
    regionName     = models.CharField(max_length=155)
    regionCode     = models.CharField(max_length=20)
    countyName     = models.CharField(max_length=155)
    countyCode     = models.CharField(max_length=20)
    streetName     = models.CharField(max_length=255)
    streetNumber   = models.CharField(max_length=20)

    postalCode     = models.CharField(max_length=30)
    lat      = models.FloatField()
    lng     = models.FloatField()

    phoneNumber    = models.CharField(max_length=20)
    comment         = models.TextField(max_length=355, blank=True, null=True)

    isDefault      = models.BooleanField(default=False)   

    def __str__(self):
        return self.user.email
    
def post_save_address(sender, instance, created, **kwargs):
    address = instance
    if address.isDefault:
        if Address.objects.filter(user=address.user).exists():
            allAddress = Address.objects.filter(user=address.user)
            for addr in allAddress:
                if addr.id != address.id:
                    addr.isDefault = False
                    addr.save()

post_save.connect(post_save_address, Address)
# pre_save.connect(post_save_address, Address)