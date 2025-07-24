from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Banner 
from .serializers import BannerSerializer 
from apps.blog.models import Post
from apps.blog.serializers import PostSerializer
from apps.shop.models import Category, Product
from apps.shop.serializers import CategoriesSerializer, ProductsSerializer, SimpleProductsSerializer

# Función para obtener los banners de la tienda     
class GetFeaturedElements(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request, format=None):
        try:
            if Banner.selectedObjects.all().exists():
                banners = Banner.selectedObjects.all()
                serializerBanners = BannerSerializer(banners, many=True)
                #return Response({'banners': serializer.data}, status=status.HTTP_200_OK)   
            else:
                raise ValueError('No images found')     
            
            if Category.categoryObjects.all().exists():
                categories = Category.categoryObjects.all().order_by('-views')[:6]
                serializerCategories = CategoriesSerializer(categories, many=True)
               
            else:
                raise ValueError('No categories found')        
                   
            if Category.brandObjects.all().exists():
                categories = Category.brandObjects.all().order_by('-views')[:10]
                serializerBrands = CategoriesSerializer(categories, many=True)
                #return Response({'brands': serializer.data}, status=status.HTTP_200_OK)   
            else:
                raise ValueError('No brands found')     

            if Product.onSaleObjects.all().exists():
                products = Product.onSaleObjects.all().order_by('-views')[:10]
                serializerProducts = SimpleProductsSerializer(products, many=True)
                #return Response({'products': serializer.data}, status=status.HTTP_200_OK)   
            else:
                raise ValueError('No products found')    
                        
            return Response({                
                'banners': serializerBanners.data,
                'categories': serializerCategories.data,
                'brands': serializerBrands.data,
                'products': serializerProducts.data
                }, status=status.HTTP_200_OK)   
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)   
        
# Función para obtener los banners de la tienda     
class GetSitemapElements(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request, format=None):
        try:
            if Post.activeObjects.all().exists():
                posts = Post.activeObjects.all().order_by('-creationDate')[:20]
                serializerPosts = PostSerializer(posts, many=True)
                #return Response({'banners': serializer.data}, status=status.HTTP_200_OK)   
            else:
                raise ValueError('No posts found')     
            
            if Category.categoryObjects.all().exists():
                categories1 = Category.specialObjects.all().order_by('-views')[:20]
                categories2 = Category.categoryObjects.all().order_by('-views')[:20]
                categories = list(categories1) + list(categories2)
                serializerCategories = CategoriesSerializer(categories, many=True)
               
            else:
                raise ValueError('No categories found')        
                   
            if Category.brandObjects.all().exists():
                categories = Category.brandObjects.all().order_by('-views')[:20]
                serializerBrands = CategoriesSerializer(categories, many=True)
                #return Response({'brands': serializer.data}, status=status.HTTP_200_OK)   
            else:
                raise ValueError('No brands found')     

            if Product.onSaleObjects.all().exists():
                products = Product.onSaleObjects.all().order_by('-views')[:20]
                serializerProducts = SimpleProductsSerializer(products, many=True)
                #return Response({'products': serializer.data}, status=status.HTTP_200_OK)   
            else:
                raise ValueError('No products found')    
                        
            return Response({                
                'posts': serializerPosts.data,
                'categories': serializerCategories.data,
                'brands': serializerBrands.data,
                'products': serializerProducts.data
                }, status=status.HTTP_200_OK)   
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)   
        
# Función para obtener los banners de la tienda     
class GetBanners(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request, format=None):
        try:
            if Banner.selectedObjects.all().exists():
                banners = Banner.selectedObjects.all()
                serializer = BannerSerializer(banners, many=True)
                return Response({'banners': serializer.data}, status=status.HTTP_200_OK)   
            else:
                raise ValueError('No images found')     
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)   

# Función para obtener las categorias especiales de la tienda     
class GetSpecialCategories(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request, format=None):
        try:
            if Category.specialObjects.all().exists():
                categories = Category.specialObjects.all().order_by('-views')[:6]
                serializer = CategoriesSerializer(categories, many=True)
                return Response({'categories': serializer.data}, status=status.HTTP_200_OK)   
            else:
                raise ValueError('No categories found')     
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)  
                
# Función para obtener las categorias principales de la tienda     
class GetFeaturedCategories(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request, format=None):
        try:
            if Category.categoryObjects.all().exists():
                categories = Category.categoryObjects.all().order_by('-views')[:6]
                serializer = CategoriesSerializer(categories, many=True)
                return Response({'categories': serializer.data}, status=status.HTTP_200_OK)   
            else:
                raise ValueError('No categories found')     
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)  
        
# Función para obtener las marcas principales de la tienda     
class GetFeaturedBrands(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request, format=None):
        try:
            if Category.brandObjects.all().exists():
                categories = Category.brandObjects.all().order_by('-views')[:10]
                serializer = CategoriesSerializer(categories, many=True)
                return Response({'brands': serializer.data}, status=status.HTTP_200_OK)   
            else:
                raise ValueError('No brands found')     
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)  
        
# Función para obtener los productos principales de la tienda     
class GetFeaturedProducts(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request, format=None):
        try:
            if Product.onSaleObjects.all().exists():
                products = Product.onSaleObjects.all().order_by('-views')[:10]
                serializer = SimpleProductsSerializer(products, many=True)
                return Response({'products': serializer.data}, status=status.HTTP_200_OK)   
            else:
                raise ValueError('No products found')     
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)  
        
# Función para obtener categorias y productos segun los filtros del usuario       
class GetProductsAndCategoriesByFilter(APIView):
    permission_classes=(permissions.AllowAny,)
    def post(self, request, format=None):
        try:
            data = self.request.data

            if 'slug' not in data:
                slug = None
            else:
                slug = data['slug']

            if 'minPrice' not in data:
                minPrice = None
            else:
                minPrice = data['minPrice']

            if 'maxPrice' not in data:
                maxPrice = None
            else:
                maxPrice = data['maxPrice']

            if 'search' not in data:
                search = None
            else:
                search = data['search']

            if 'orderBy' not in data:
                orderBy = None
            else:
                orderBy = data['orderBy']

            products = Product.onSaleObjects.all()
            categories = Category.categoryObjects.all()
            brands = Category.brandObjects.all()
             
            filtered_products = []
            filtered_categories = []    
            filtered_brands = []   

            if slug:
                category = Category.objects.get(slug=slug)
                for product in products:
                    if product.categories.filter(id=category.id):
                        filtered_products.append(product)

                if category.type == "category": 
                    filtered_categories = [category]  
                else:   
                    filtered_brands = [category]  
            else:
                filtered_products = products 
                filtered_categories = categories    
                filtered_brands = brands   
                    
            if search and not slug:
                filtered_products = [product for product in filtered_products if search.lower() in product.name.lower() or search.lower() in product.slug.lower()]
                filtered_categories = [category for category in filtered_categories if search.lower() in category.name.lower() or search.lower() in category.slug.lower()]
                filtered_brands = [brand for brand in filtered_brands if search.lower() in brand.name.lower() or search.lower() in brand.slug.lower()]
            
            if minPrice:
                filtered_products = [product for product in filtered_products if int(product.price) >= int(minPrice)]

            if maxPrice:
                filtered_products = [product for product in filtered_products if int(product.price) <= int(maxPrice)]

            if orderBy == None or orderBy == 'df':
                filtered_products = sorted(filtered_products, key=lambda x: x.name)
            if orderBy == 'mp':
                filtered_products = sorted(filtered_products, key=lambda x: x.views)
            if orderBy == 'az':
                filtered_products = sorted(filtered_products, key=lambda x: x.name)
            if orderBy == 'za':
                filtered_products = sorted(filtered_products, key=lambda x: x.name, reverse=True)
            if orderBy == 'me':
                filtered_products = sorted(filtered_products, key=lambda x: x.price)
            if orderBy == 'ma':
                filtered_products = sorted(filtered_products, key=lambda x: x.price, reverse=True)
            if orderBy == 'ra':
                filtered_products = sorted(filtered_products, key=lambda x: x.creationDate, reverse=True)
            if orderBy == 'ar':
                filtered_products = sorted(filtered_products, key=lambda x: x.creationDate)

            if filtered_products != []:
                serializer_products = SimpleProductsSerializer(filtered_products, many=True)
                serializer_products = serializer_products.data
            else:
                serializer_products = []

            if filtered_categories != []:
                serializer_categories = CategoriesSerializer(filtered_categories, many=True)
                serializer_categories = serializer_categories.data
            else:
                serializer_categories = []

            if filtered_brands != []:
                serializer_brands = CategoriesSerializer(filtered_brands, many=True) 
                serializer_brands = serializer_brands.data   
            else:
                serializer_brands = []
            return Response({
                'products': serializer_products,
                'categories': serializer_categories,
                'brands': serializer_brands}
                , status=status.HTTP_200_OK)   
                      
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)     