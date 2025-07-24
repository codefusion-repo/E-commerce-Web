from rest_framework import serializers
from .models import * 

class SubategoriesSerializer(serializers.ModelSerializer): 
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'icon',
            'slug',
            'views',
            'type',
        ]

class CategoriesSerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()
    views = serializers.SerializerMethodField()
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'icon',
            'slug',
            'views',
            'type',
            'subcategories',
        ]

    def get_subcategories(self, obj):
        subcategories_qs = obj.subcategories.all()
        subcategories = []
        for subcategory in subcategories_qs:
            if subcategory.type != "special":
                subcategories.append(subcategory)

        subcategories_serializer = SubategoriesSerializer(subcategories, many=True)   
        return subcategories_serializer.data

    def get_views(self, obj):
        views_count = CategoryViewCount.objects.filter(category=obj).count()
        return views_count   
    

class FeaturesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductFeatures
        fields = [
            'id',
            'param',
            'value',
        ]

class DimensionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductDimensions
        fields = [
            'id',
            'weight',
            'height',
            'width',
            'length',
        ]

class ImagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImages
        fields = [
            'image'
        ]

class CommentUserSerializer(serializers.Serializer):
    id = serializers.CharField()
    email = serializers.CharField()
    first_name = serializers.CharField()

class CommentsSerializer(serializers.ModelSerializer):
    user = CommentUserSerializer()
    class Meta:
        model = ProductComment
        fields = [
            'id',
            'user',
            'comment',
            'stars',
            'creationDate',
        ]

class ProductsSerializer(serializers.ModelSerializer):
    categories = CategoriesSerializer(many=True)
    features = serializers.SerializerMethodField()
    dimensions = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    views = serializers.SerializerMethodField()
    stars = serializers.SerializerMethodField()
    comments_quantity = serializers.SerializerMethodField()
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'thumbnail',
            'price',
            'categories',
            'description',
            'stars',
            'stock',
            'status',
            'features',
            'dimensions',
            'images',
            'comments',
            'comments_quantity',
            'views',
            'creationDate',
        ]

    def get_features(self, obj):
        if ProductFeatures.objects.filter(product=obj).exists():
            features_qs = ProductFeatures.objects.filter(product=obj)
            features_serializer = FeaturesSerializer(features_qs, many=True)
            return features_serializer.data  
        else:
            return [] 
    
    def get_dimensions(self, obj):
        if ProductDimensions.objects.filter(product=obj).exists():
            dimensions_qs = ProductDimensions.objects.get(product=obj)
            dimensions_serializer = DimensionsSerializer(dimensions_qs)
            return dimensions_serializer.data 
        else: 
            return None
    
    def get_images(self, obj):
        if ProductImages.objects.filter(product=obj).exists():
            images_qs = ProductImages.objects.filter(product=obj)
            images_serializer = ImagesSerializer(images_qs, many=True)
            return images_serializer.data     
        else: 
            return [] 
        
    def get_comments(self, obj):
        if ProductComment.objects.filter(product=obj).exists():
            comments_qs = ProductComment.objects.filter(product=obj)
            comments_serializer = CommentsSerializer(comments_qs, many=True)
            return comments_serializer.data  
        else: 
            return [] 
        
    def get_comments_quantity(self, obj):
        if ProductComment.objects.filter(product=obj).exists():
            comments_qs = ProductComment.objects.filter(product=obj)
            total_comments = len(comments_qs)
            return total_comments 
        else: 
            return 0        
            
    def get_stars(self, obj):
        if ProductComment.objects.filter(product=obj).exists():
            comments_qs = ProductComment.objects.filter(product=obj)
            total_stars = sum(comment.stars for comment in comments_qs)
            total_comments = len(comments_qs)
            average_stars = total_stars / total_comments
            return average_stars 
        else: 
            return 0    
             
    def get_views(self, obj):
        views_count = ProductViewCount.objects.filter(product=obj).count()
        return views_count   
    
class SimpleProductsSerializer(serializers.ModelSerializer):
    categories = CategoriesSerializer(many=True)
    views = serializers.SerializerMethodField()
    stars = serializers.SerializerMethodField()
    comments_quantity = serializers.SerializerMethodField()
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'thumbnail',
            'price',
            'categories',
            'description',
            'stock',
            'status',
            'views',
            'stars',
            'comments_quantity',
            'creationDate',
        ]

    def get_views(self, obj):
        views_count = ProductViewCount.objects.filter(product=obj).count()
        return views_count 
    
    def get_comments_quantity(self, obj):
        if ProductComment.objects.filter(product=obj).exists():
            comments_qs = ProductComment.objects.filter(product=obj)
            total_comments = len(comments_qs)
            return total_comments 
        else: 
            return 0        
            
    def get_stars(self, obj):
        if ProductComment.objects.filter(product=obj).exists():
            comments_qs = ProductComment.objects.filter(product=obj)
            total_stars = sum(comment.stars for comment in comments_qs)
            total_comments = len(comments_qs)
            average_stars = total_stars / total_comments
            return average_stars 
        else: 
            return 0     
         
class PaginatorSerializer(serializers.Serializer):
    has_next = serializers.BooleanField()
    has_previous = serializers.BooleanField()
    num_pages = serializers.IntegerField()
