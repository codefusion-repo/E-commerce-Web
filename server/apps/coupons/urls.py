from django.urls import path
from .views import *

urlpatterns = [
    path('post/apply/coupon', PostApplyCoupon.as_view()),
    path('post/unapply/coupon', PostUnapplyCoupon.as_view()),
    path('post/verify/coupon', PostVerifyCoupon.as_view()),
    path('post/unapply/coupon/from/purchase', PostUnapplyCouponFromPurchase.as_view()),
]