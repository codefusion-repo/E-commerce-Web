from django.contrib import admin
from .models import *

# Register your models here.

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'type',)
    list_display_links = ('name', )
    list_per_page = 25

admin.site.register(Category, CategoryAdmin)
admin.site.register(CategoryViewCount)

class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name',)
    list_display_links = ('name', )
    list_per_page = 25

admin.site.register(Product, ProductAdmin)
admin.site.register(ProductFeatures)
admin.site.register(ProductDimensions)
admin.site.register(ProductImages)
admin.site.register(ProductComment)
admin.site.register(ProductViewCount)
