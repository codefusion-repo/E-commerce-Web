from rest_framework import serializers
from .models import *

class SimpleBlogCategoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = [
            'id',
            'name',
            'slug',
        ]

class SimplePostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post    
        fields = [
            'id',
            'title',
            'description',
            'thumbnail',
            'slug',
        ]    

class FeaturedPostByCategoriesSerializer(serializers.ModelSerializer):
    posts = serializers.SerializerMethodField()
    class Meta:
        model = BlogCategory
        fields = [
            'id',
            'name',
            'slug',
            'posts',
        ]

    def get_posts(self, obj):
        if Post.objects.filter(categories=obj).exists():
            posts_qs = Post.objects.filter(categories=obj).order_by('-views')[:4]
            posts_serializer = SimplePostSerializer(posts_qs, many=True)
            return posts_serializer.data  
        else: 
            return []  
        
class BlogCategorySerializer(serializers.ModelSerializer):
    posts = serializers.SerializerMethodField()
    views = serializers.SerializerMethodField()
    class Meta:
        model = BlogCategory
        fields = [
            'id',
            'name',
            'slug',
            'icon',
            'description',
            'posts',
            'views',
        ]
    def get_views(self, obj):
        views_count = BlogCategoryViewCount.objects.filter(blog_category=obj).count()
        return views_count   
    
    def get_posts(self, obj):
        if Post.objects.filter(categories=obj).exists():
            posts_qs = Post.objects.filter(categories=obj).order_by('-views')
            posts_serializer = SimplePostSerializer(posts_qs, many=True)
            return posts_serializer.data  
        else: 
            return []   
            
class PostUserSerializer(serializers.Serializer):
    id = serializers.CharField()
    email = serializers.CharField()
    first_name = serializers.CharField()

class PostSerializer(serializers.ModelSerializer):
    views = serializers.SerializerMethodField()
    author = PostUserSerializer()
    comments = serializers.SerializerMethodField()
    stars = serializers.SerializerMethodField() 
    class Meta:
        model = Post    
        fields = [
            'id',
            'categories',
            'title',
            'description',
            'content',
            'thumbnail',
            'slug',
            'stars',
            'author',
            'creationDate',
            'views',
            'comments',
        ]        
    def get_views(self, obj):
        views_count = PostViewCount.objects.filter(post=obj).count()
        return views_count  
    
    def get_comments(self, obj):
        if PostComment.objects.filter(post=obj).exists():
            comments_qs = PostComment.objects.filter(post=obj)
            comments_serializer = PostCommentsSerializer(comments_qs, many=True)
            return comments_serializer.data  
        else: 
            return []    
    def get_stars(self, obj):
        if PostComment.objects.filter(post=obj).exists():
            comments_qs = PostComment.objects.filter(post=obj)
            total_stars = sum(comment.stars for comment in comments_qs)
            total_comments = len(comments_qs)
            average_stars = total_stars / total_comments
            return average_stars 
        else: 
            return 0    
                
class PostCommentsSerializer(serializers.ModelSerializer):
    user = PostUserSerializer()
    class Meta:
        model = PostComment
        fields = [
            'id',
            'user',
            'comment',
            'stars',
            'creationDate',
        ]