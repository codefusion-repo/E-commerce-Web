from django.contrib import admin

# Register your models here.
from .models import Newsletter, Message

admin.site.register(Newsletter)
admin.site.register(Message)