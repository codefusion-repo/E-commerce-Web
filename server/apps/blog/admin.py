from django.contrib import admin
from .models import BlogCategory, Post, PostComment
from tinymce.widgets import TinyMCE
from django.db import models

admin.site.register(BlogCategory)
admin.site.register(PostComment)

class MyPostAdmin(admin.ModelAdmin):
    formfield_override = {
        models.TextField: {'widget': TinyMCE()}
    }

admin.site.register(Post, MyPostAdmin)