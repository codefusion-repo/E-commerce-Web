from django.urls import path
from .views import *

urlpatterns = [
    path('get/featured/elements', GetFeaturedElements.as_view()),
    path('get/sitemap/elements', GetSitemapElements.as_view()),
    path('get/banners', GetBanners.as_view()),
    path('get/special/categories', GetSpecialCategories.as_view()),
    path('get/featured/categories', GetFeaturedCategories.as_view()),
    path('get/featured/brands', GetFeaturedBrands.as_view()),
    path('get/featured/products', GetFeaturedProducts.as_view()),
    path('post/search', GetProductsAndCategoriesByFilter.as_view()),
]