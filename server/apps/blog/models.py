from django.db import models
import uuid
from tinymce.models import HTMLField
from django.contrib.auth import get_user_model

User = get_user_model()

def blog_category_thumbnail_directory(instance, filename):
    return 'store/blog/categories/{0}/{1}'.format(instance.slug, filename)   

class BlogCategory(models.Model):
    class Meta:
        verbose_name = "Blog category"
        verbose_name_plural = "Blog categories"

    id = models.CharField(max_length=300, primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=155, unique=True)
    slug = models.SlugField(max_length=155, unique=True)
    icon = models.ImageField(default=None, upload_to=blog_category_thumbnail_directory, blank=True, null=True)
    description = models.TextField(max_length=500, blank=True, null=True)
    views = models.IntegerField(default=0, blank=True)

    def get_view_count(self):
        views = BlogCategoryViewCount.objects.filter(blog_category=self).count()
        return views
    
    def __str__(self):
        return f'Blog category {self.name}'
    
class BlogCategoryViewCount(models.Model):
    blog_category = models.ForeignKey(BlogCategory, related_name='blog_category_view_count', on_delete=models.CASCADE)
    ip_address = models.CharField(max_length=255)

    def __str__(self):
        return f'Vista de la categoría blog {self.blog_category.name}.'

def blog_post_thumbnail_directory(instance, filename):
    return 'store/blog/posts/{0}/{1}'.format(instance.slug, filename)   
    
class Post(models.Model):
    id = models.CharField(max_length=300, primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    
    class Meta:
        verbose_name = "Post"
        verbose_name_plural = "Posts"
        
    class ActiveObjects(models.Manager):
        def get_queryset(self):
            return super().get_queryset().filter(status='active')
    
    post_status = [
        ('not_active', 'not_active'),
        ('active', 'active'),
    ]

    status = models.CharField(max_length=255, default="active", choices=post_status)
    description = models.TextField(max_length=500, blank=True, null=True)
    categories = models.ManyToManyField(BlogCategory, blank=True)

    slug = models.SlugField(max_length=255, unique=True)

    thumbnail = models.ImageField(default=None, upload_to=blog_post_thumbnail_directory, blank=True, null=True)
    title = models.CharField(max_length=200)
    content = HTMLField('Content')

    stars = models.FloatField(default=0)
   
    author = models.ForeignKey(User, related_name='userPost', on_delete=models.CASCADE)

    creationDate = models.DateTimeField(auto_now_add=True)

    views = models.IntegerField(default=0, blank=True)

    objects = models.Manager()
    activeObjects = ActiveObjects()

    def get_view_count(self):
        views = PostViewCount.objects.filter(post=self).count()
        return views
    
    def __str__(self):
        return f'Post {self.title}'
    
class PostViewCount(models.Model):
    post = models.ForeignKey(Post, related_name='postViews', on_delete=models.CASCADE)
    ip_address = models.CharField(max_length=255)

    def __str__(self):
        return f'Vista del post {self.post.title}.'
    
STARS = [
    (1, "1 estrella"),
    (2, "2 estrellas"),
    (3, "3 estrellas"),
    (4, "4 estrellas"),
    (5, "5 estrellas"),
]

class PostComment(models.Model):
    id = models.CharField(max_length=300, primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, related_name='usersPostComments', on_delete=models.CASCADE)
    post = models.ForeignKey(Post, related_name='postComments', on_delete=models.CASCADE)
    comment = models.TextField(max_length=500)
    stars = models.IntegerField(default=1, choices=STARS)
    creationDate = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Comentario del usuario {self.user.email} para el post {self.post.title}.'
    

