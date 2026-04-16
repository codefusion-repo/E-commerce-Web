from django.db import models
from django.db.models import Count
from tinymce.models import HTMLField
from django.contrib.auth import get_user_model
from datetime import datetime
import uuid

User = get_user_model()

def category_icons_directory(instance, filename):
    return 'store/categories/{0}/{1}'.format(instance.slug, filename)   

class Category(models.Model):
    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"

    id = models.CharField(max_length=300, primary_key=True, unique=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True)
    
    icon = models.ImageField(default=None, upload_to=category_icons_directory, blank=True, null=True)

    subcategories = models.ManyToManyField('self', blank=True)

    views = models.IntegerField(default=0, blank=True)

    class CategoryObjects(models.Manager):
        def get_queryset(self):
            return super().get_queryset().filter(type='category')
        
    class BrandObjects(models.Manager):
        def get_queryset(self):
            return super().get_queryset().filter(type='brand') 
        
    class SpecialObjects(models.Manager):
        def get_queryset(self):
            return super().get_queryset().filter(type='special')
              
    category_type = [
        ('brand', 'brand'),
        ('category', 'category'),
        ('special', 'special'),
    ]      

    type = models.CharField(max_length=100, default="category", choices=category_type)

    objects = models.Manager()
    categoryObjects = CategoryObjects()
    brandObjects = BrandObjects()
    specialObjects = SpecialObjects()
    
    def __str__(self):
        return f'Categoría {self.name}' 
    
class CategoryViewCount(models.Model):
    category = models.ForeignKey(Category, related_name='category_view_count', on_delete=models.CASCADE)
    ip_address = models.CharField(max_length=255)

    def __str__(self):
        return f'Vista de la categoría {self.category.name}.'

def product_image_directory(instance, filename):
    if hasattr(instance, 'slug'):
        slug = instance.slug
    else:
        slug = instance.product.slug

    return f'store/products/{slug}/{filename}'

class Product(models.Model):
    class Meta:
        verbose_name = "Product"
        verbose_name_plural = "Products"

    id = models.CharField(max_length=300, primary_key=True, unique=True, default=uuid.uuid4, editable=False)

    class OnSaleObjects(models.Manager):
        def get_queryset(self):
            return super().get_queryset().filter(status='on_sale')
        
    product_status = [
        ('not_on_sale', 'not_on_sale'),
        ('on_sale', 'on_sale'),
    ]
    name = models.CharField(max_length=255)
    slug = models.CharField(max_length=255)

    thumbnail = models.ImageField(upload_to=product_image_directory, blank=False, null=False)

    price = models.IntegerField(blank=False, null=False)

    categories = models.ManyToManyField(Category, blank=True)

    description = models.TextField(max_length=3000, blank=True, null=True)
    #content = HTMLField(blank=True, null=True)

    stock = models.IntegerField(blank=False, null=False)

    status = models.CharField(max_length=255, default="on_sale", choices=product_status)

    creationDate = models.DateTimeField(auto_now_add=True)

    views = models.IntegerField(default=0, blank=True)

    stars = models.FloatField(default=0)

    objects = models.Manager()
    onSaleObjects = OnSaleObjects()

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f'Producto {self.name}'
    
class ProductFeatures(models.Model):
    product = models.ForeignKey(Product, related_name='productsFeatures', on_delete=models.CASCADE,  blank=False, null=False)
    param = models.CharField(max_length=155, blank=False, null=False)
    value = models.CharField(max_length=155,  blank=False, null=False)

    def __str__(self):
        return f'Característica {self.param} del producto {self.product.name}.'
    
class ProductDimensions(models.Model):
    product = models.ForeignKey(Product, related_name='productsDimensions', on_delete=models.CASCADE,  blank=False, null=False)
    weight  = models.FloatField(blank=False, null=False)
    height  = models.FloatField(blank=False, null=False)
    width   = models.FloatField(blank=False, null=False)
    length  = models.FloatField(blank=False, null=False)

    def __str__(self):
        return f'Dimensiones del producto {self.product.name}.'

class ProductImages(models.Model):
    product = models.ForeignKey(Product, related_name='productsImages', on_delete=models.CASCADE,  blank=False, null=False)
    image = models.ImageField(upload_to=product_image_directory, max_length=1000)

    def __str__(self):
        return f'Imagen del producto {self.product.name}.'

STARS = [
    (1, "1 estrella"),
    (2, "2 estrellas"),
    (3, "3 estrellas"),
    (4, "4 estrellas"),
    (5, "5 estrellas"),
]

class ProductComment(models.Model):
    id = models.CharField(max_length=300, primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, related_name='users', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='productsComments', on_delete=models.CASCADE)
    comment = models.TextField(max_length=500)
    stars = models.IntegerField(default=1, choices=STARS)
    creationDate = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Comentario del usuario {self.user.email} para el producto {self.product.name}.'
    
class ProductViewCount(models.Model):
    product = models.ForeignKey(Product, related_name='productsViews', on_delete=models.CASCADE,  blank=False, null=False)
    ip_address = models.CharField(max_length=255)

    def __str__(self):
        return f'Vista del producto {self.product.name}.'