from django.contrib import admin
from .models import IpAddress, User

admin.site.register(IpAddress)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'is_active', 'is_staff', 'is_superuser')