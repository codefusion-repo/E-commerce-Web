from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import * 
from .serializers import * 
from .pagination import SmallSetPagination

# Obtener todas las categorias de la tienda (Nueva versión)
class GetCategories(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request, format=None):
        try:
            if Category.objects.all().exists():
                categories = Category.objects.all()
                serializer = CategoriesSerializer(categories, many=True)    
                return Response({'categories': serializer.data}, status=status.HTTP_200_OK)
            else:
                raise ValueError('No categories found')
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)     

# Obtener todas los productos de la tienda (Nueva versión)
class GetProducts(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request, format=None):
        try:
            if Product.objects.all().exists():
                products = Product.objects.all()
                serializer = ProductsSerializer(products, many=True)    
                return Response({'products': serializer.data}, status=status.HTTP_200_OK)
            else:
                raise ValueError('No products found')
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)  
                    
# Función para obtener las categorias de la tienda
class GetAllCategories(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request, format=None):
        try:
            if Category.categoryObjects.all().exists():
                categories1 = Category.categoryObjects.all()
            else:
                categories1 = []
            if Category.brandObjects.all().exists():
                categories2 = Category.brandObjects.all()
            else: 
                categories2 = []
                          
            categories = list(categories1) + list(categories2)

            print(categories)

            if categories != []:
                serializer = CategoriesSerializer(categories, many=True)    
                return Response({'categories': serializer.data}, status=status.HTTP_200_OK)
            else: 
                raise ValueError('No categories found')
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST) 
             
# Función para obtener una categoria de la tienda
class GetCategory(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request, slug, format=None):
        try:
            if Category.objects.filter(slug=slug).exists():
                category = Category.objects.get(slug=slug)
                serializer = CategoriesSerializer(category, many=False)    
                return Response({'category': serializer.data}, status=status.HTTP_200_OK)
            else: 
                raise ValueError('Category not found')
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)    
          
# Función para obtener los productos de la tienda              
class GetAllProducts(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request, format=None):
        try:
            if Product.onSaleObjects.all().exists():
                products = Product.onSaleObjects.all().order_by('name')
                paginator = SmallSetPagination()
                results = paginator.paginate_queryset(products, request)
                serializer = SimpleProductsSerializer(products, many=True)
                return Response({'products': serializer.data}, status=status.HTTP_200_OK)   
            else: 
                raise ValueError('No products found')
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_404_NOT_FOUND)   

# Función para obtener los productos de una categoria de la tienda     
class GetProductsByCategory(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request, slug, format=None):
        try:
            if slug == None:
                raise ValueError('No products found in the category')

            if Category.objects.filter(slug=slug).exists():
                category = Category.objects.get(slug=slug)
                if Product.onSaleObjects.filter(categories=category).exists():
                    products = Product.onSaleObjects.filter(categories=category).order_by('name')
                    paginator = SmallSetPagination()
                    results = paginator.paginate_queryset(products, request)
                    serializer = SimpleProductsSerializer(products, many=True)
                    return Response({'products': serializer.data}, status=status.HTTP_200_OK)   
                else:
                    raise ValueError('No products found')     
            else:
                raise ValueError('Category not found')     
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)   

# Función para obtener los productos de una segun los filtros del usuario       
class GetProductsByFilter(APIView):
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

            filtered_products = []    

            if slug:
                category = Category.objects.get(slug=slug)
                for product in products:
                    if product.categories.filter(id=category.id):
                        filtered_products.append(product)
            else:
                for product in products:
                    filtered_products.append(product)   

            if minPrice:
                filtered_products = [product for product in filtered_products if int(product.price) >= int(minPrice)]

            if maxPrice:
                filtered_products = [product for product in filtered_products if int(product.price) <= int(maxPrice)]

            if search:
                filtered_products = [product for product in filtered_products if search.lower() in product.name.lower() or search.lower() in product.slug.lower()]

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
                paginator = SmallSetPagination()
                results = paginator.paginate_queryset(filtered_products, request)
                serializer = SimpleProductsSerializer(filtered_products, many=True)

                return Response({'products': serializer.data}, status=status.HTTP_200_OK)                 
            else:
                raise ValueError('No products found')
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)     

# Función para obtener un producto       
class GetProduct(APIView):          
    permission_classes = (permissions.AllowAny,)
    def get(self, request, slug, format=None):
        try:
            if slug == None:
                raise ValueError('The product was not found')

            if Product.onSaleObjects.filter(slug=slug).exists():
                product = Product.objects.get(slug=slug)
                serializer = ProductsSerializer(product)
                return Response({'product': serializer.data}, status=status.HTTP_200_OK)
            else:
                raise ValueError('The product was not found')     
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)  

# Función para comentar un producto
class PostCreateComment(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=(permissions.IsAuthenticated,)
    def post(self, request, format=None):
        try:
            data = self.request.data 

            if Product.onSaleObjects.filter(id=data['id']).exists():
                product = Product.objects.get(id=data['id'])
            else:
                raise ValueError('The product was not found')   
              
            comment, created = ProductComment.objects.get_or_create(
                user=request.user, 
                product=product, 
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
        
# Función para editar un comentario de un producto
class PostEditComment(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=(permissions.IsAuthenticated,)
    def post(self, request, format=None):
        try:
            data = self.request.data 

            if ProductComment.objects.filter(id=data['id']).exists():
                comment = ProductComment.objects.get(id=data['id'])
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
        
# Función para borrar un comentario de un producto
class PostDeleteComment(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=(permissions.IsAuthenticated,)
    def post(self, request, format=None):
        try:
            data = self.request.data 

            if ProductComment.objects.filter(id=data['id']).exists():
                comment = ProductComment.objects.get(id=data['id'])
            else:
                raise ValueError('Comment not found') 

            comment.delete()

            return Response(status=status.HTTP_200_OK)
        
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)   