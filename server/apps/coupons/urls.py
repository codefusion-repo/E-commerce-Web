from django.urls import path
from .views import PostClaimCoupon, PostApplyCoupon

urlpatterns = [
    path('claim', PostClaimCoupon.as_view()),
    #path('apply', PostApplyCoupon.as_view()),
    #path('post/unapply/coupon', PostUnapplyCoupon.as_view()),
    #path('post/verify/coupon', PostVerifyCoupon.as_view()),
    #path('post/unapply/coupon/from/purchase', PostUnapplyCouponFromPurchase.as_view()),
]