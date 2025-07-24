from django.urls import path
from .views import *

urlpatterns = [
    # Versión nueva
    path('get/categories', GetBlogCategories.as_view()),
    path('get/posts', GetBlogPosts.as_view()),

    # Versión vieja
    path('all/categories', GetAllBlogCategories.as_view()),
    path('posts/by/categories', GetFeaturedPostsByCategory.as_view()),
    path('get/<slug>', GetBlogCategory.as_view()),
    path('<slug>', GetPostsByCategory.as_view()),

    path('all/posts', GetAllPosts.as_view()),
    path('get/post/<slug>', GetPost.as_view()),

    # Manejo de comentarios de una publicación 
    path('create/comment', PostCreateBlogComment.as_view()),
    path('edit/comment', PostEditBlogComment.as_view()),
    path('delete/comment', PostDeleteBlogComment.as_view()),
]