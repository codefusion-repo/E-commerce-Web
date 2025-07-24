from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
import uuid

# Create your models here.

class IpAddress(models.Model):
    ip = models.CharField(max_length=155)

    def __str__(self):
        return self.ip

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required.')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_active') is not True:
            raise ValueError('The superuser must have is_active=True.')
        if extra_fields.get('is_staff') is not True:
            raise ValueError('The superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('The superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)
        
class User(AbstractBaseUser, PermissionsMixin):
    id = models.CharField(default=uuid.uuid4(), max_length=300, primary_key=True, unique=True, editable=False)
    username = models.CharField(max_length=150, unique=False)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    email           = models.EmailField(max_length=255, blank=False, unique=True)

    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    rut             = models.CharField(max_length=35, blank=True, null=True)
    phone           = models.CharField(max_length=35, blank=True, null=True)

    objects = UserManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['username']

    token           = models.CharField(max_length=500, blank=True, null=True)
    token_expire    = models.DateTimeField(blank=True, null=True)

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.email