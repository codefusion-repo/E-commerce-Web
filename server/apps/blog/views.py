from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import * 
from .serializers import * 
# Create your views here.

# Función para obtener todas las categorias del blog
class GetBlogCategories(APIView):
    permission_classes=(permissions.AllowAny,)
    def get(self, request, format=None):
        try:
            if BlogCategory.objects.all().exists():
                blogCategories = BlogCategory.objects.all()
                serializer = BlogCategorySerializer(blogCategories, many=True)
                return Response({'blogCategories': serializer.data}, status=status.HTTP_200_OK)
            else:
                raise ValueError("No blog categories found")
                # raise ValueError('No se encontraron las categorias del blog')
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)     

# Función para obtener todas las publicaciones del blog
class GetBlogPosts(APIView):
    permission_classes=(permissions.AllowAny,)
    def get(self, request, format=None):   
        try:
            if Post.objects.all().exists():
                posts = Post.objects.all()
                serializer = PostSerializer(posts, many=True)
                return Response({'posts': serializer.data}, status=status.HTTP_200_OK)
            else: 
                raise ValueError("No publications found")
                # raise ValueError('No se encontraron publicaciones')
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)        
        
# Función para obtener las categorias de la tienda
class GetAllBlogCategories(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request, format=None):
        try:
            if BlogCategory.objects.all().exists():
                blog_categories = BlogCategory.objects.all()
            else:
                blog_categories = []
                          
            if blog_categories != []:
                serializer = SimpleBlogCategoriesSerializer(blog_categories, many=True)    
                return Response({'blog_categories': serializer.data}, status=status.HTTP_200_OK)
            else: 
                raise ValueError("No blog categories found")
                # raise ValueError('No se encontraron categorías del blog')
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST) 

# Función para obtener una categoria del blog
class GetBlogCategory(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request, slug, format=None):
        try:
            if slug == None:
                raise ValueError("No blog category found")
                # raise ValueError('No se encontro la categoría')
            
            if BlogCategory.objects.filter(slug=slug).exists():
                category = BlogCategory.objects.get(slug=slug)
                serializer = BlogCategorySerializer(category, many=False)    
                return Response({'blog_category': serializer.data}, status=status.HTTP_200_OK)
            else: 
                raise ValueError("No blog category found")
                # raise ValueError('No se encontro la categoría')
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)   
        
# Función para obtener las publicaciones del blog             
class GetAllPosts(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request, format=None):
        try:
            if Post.activeObjects.all().exists():
                posts = Post.activeObjects.all().order_by('name')
                serializer = PostSerializer(posts, many=True)
                return Response({'posts': serializer.data}, status=status.HTTP_200_OK)   
            else: 
                raise ValueError("No products found")
                # raise ValueError('No se encontraron productos')
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_404_NOT_FOUND)   

# Función para obtener las publicaciones populares de todas las categoria del blog  
class GetFeaturedPostsByCategory(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request, format=None):
        try:
            if BlogCategory.objects.all().exists():
                featuredPostsByCategories = BlogCategory.objects.all()
            else:
                featuredPostsByCategories = []

            if featuredPostsByCategories != []:
                serializer = FeaturedPostByCategoriesSerializer(featuredPostsByCategories, many=True)    
                return Response({'featuredPostsByCategories': serializer.data}, status=status.HTTP_200_OK)
            else: 
                raise ValueError('No popular categories found')
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST) 
                
# Función para obtener las publicaciones de una categoria del blog  
class GetPostsByCategory(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request, slug, format=None):
        try:
            if slug == None:
                raise ValueError('No posts found in the category')

            if BlogCategory.objects.filter(slug=slug).exists():
                category = BlogCategory.objects.get(slug=slug)
                if Post.activeObjects.filter(categories=category).exists():
                    posts = Post.activeObjects.filter(categories=category).order_by('name')
                    serializer = PostSerializer(posts, many=True)
                    return Response({'posts': serializer.data}, status=status.HTTP_200_OK)   
                else:
                    raise ValueError('No posts found')     
            else:
                raise ValueError('Blog category not found')     
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)   

# Función para obtener un producto       
class GetPost(APIView):          
    permission_classes = (permissions.AllowAny,)
    def get(self, request, slug, format=None):
        try:
            if slug == None:
                raise ValueError('The post was not found')

            if Post.activeObjects.filter(slug=slug).exists():
                post = Post.activeObjects.get(slug=slug)
                serializer = PostSerializer(post)
                return Response({'post': serializer.data}, status=status.HTTP_200_OK)
            else:
                raise ValueError('The post was not found')     
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)  
                
# Función para comentar una publicación
class PostCreateBlogComment(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=(permissions.IsAuthenticated,)
    def post(self, request, format=None):
        try:
            data = self.request.data 

            if Post.activeObjects.filter(id=data['id']).exists():
                post = Post.activeObjects.get(id=data['id'])
            else:
                raise ValueError('The post was not found')   
              
            comment, created = PostComment.objects.get_or_create(
                user=request.user, 
                post=post, 
                defaults={
                    'comment': data['comment'], 
                    'stars': int(data['stars'])
                })
            if created == False:
                comment.comment = data['comment']
                comment.stars = int(data['stars'])
                comment.save()

            return Response(status=status.HTTP_200_OK)
        
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)                    
        
# Función para editar un comentario de una publicación
class PostEditBlogComment(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=(permissions.IsAuthenticated,)
    def post(self, request, format=None):
        try:
            data = self.request.data 

            if PostComment.objects.filter(id=data['id']).exists():
                comment = PostComment.objects.get(id=data['id'])
            else:
                raise ValueError('Comment not found') 

            comment.comment = data['comment']
            comment.stars = int(data['stars'])
            comment.save()

            return Response(status=status.HTTP_200_OK)
        
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)     
        
# Función para borrar un comentario de una publicación
class PostDeleteBlogComment(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=(permissions.IsAuthenticated,)
    def post(self, request, format=None):
        try:
            data = self.request.data 

            if PostComment.objects.filter(id=data['id']).exists():
                comment = PostComment.objects.get(id=data['id'])
            else:
                raise ValueError('Comment not found') 

            comment.delete()

            return Response(status=status.HTTP_200_OK)
        
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)   