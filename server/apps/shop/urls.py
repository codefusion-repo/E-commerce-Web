from django.urls import path
from .views import (
    GetAllCategories, 
    GetCategory,
    GetAllProducts, 
    GetProductsByCategory, 
    GetProductsByFilter, 
    GetProduct, 
    PostCreateComment,
    PostEditComment,
    PostDeleteComment,

    GetCategories,
    GetProducts
    )

urlpatterns = [
    # Versión nueva
    path('get/categories', GetCategories.as_view()),
    path('get/products', GetProducts.as_view()),

    # Versión vieja
    path('all/categories', GetAllCategories.as_view()),
    path('get/<slug>', GetCategory.as_view()),
    path('all/products', GetAllProducts.as_view()),
    path('<slug>', GetProductsByCategory.as_view()),
    path('on/change/filter', GetProductsByFilter.as_view()),
    path('product/<slug>', GetProduct.as_view()),

    # Manejo de comentarios del producto
    path('create/comment', PostCreateComment.as_view()),
    path('edit/comment', PostEditComment.as_view()),
    path('delete/comment', PostDeleteComment.as_view()),
]