from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from apps.purchase.models import Purchase
from .models import Coupon, UserCoupon
from apps.myAuth.serializers import UserSerializer
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()

class PostClaimCoupon(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=(permissions.IsAuthenticated,)
    def post(self, request, format=None):
        try:
            data = self.request.data 
            required_fields = ["coupon_code"]
            for field in  required_fields:
                if field not in data:
                   raise ValueError(f"Required field: {field}") 
                
            if Coupon.objects.filter(code=data['coupon_code']).exists():
                coupon = Coupon.objects.get(code=data['coupon_code'])  
                if coupon.limit <= 0:
                    raise ValueError("Coupon not available 1")
                
                if coupon.discount_expire < timezone.now():
                    raise ValueError("Expired coupon")
            else:
                raise ValueError("Coupon not available 2")
            
            if User.objects.filter(id=request.user.id).exists():
                user = User.objects.get(id=request.user.id)  
            else:
                raise ValueError("You must have an account to claim a coupon")
            
            if UserCoupon.objects.filter(coupon=coupon, user=user).exists():
                raise ValueError("You have already claimed this coupon")
            
            UserCoupon.objects.create(coupon=coupon, user=user)

            if coupon.limit > 0:
                coupon.limit -= 1;
                coupon.save()
            
            user = User.objects.get(id=request.user.id)  
            userSerializer = UserSerializer(user, many=False)

            return Response(userSerializer.data, status=status.HTTP_200_OK)
               
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST)   

class PostApplyCoupon(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=(permissions.IsAuthenticated,)
    def post(self, request, format=None):     
        try:
            data = self.request.data 
            required_fields = ["coupon_code", "purchase_id"]
            for field in  required_fields:
                if field not in data:
                   raise ValueError(f"Required field: {field}")        
                
            if Coupon.objects.filter(code=data['coupon_code']).exists():
                coupon = Coupon.objects.get(code=data['coupon_code'])  
                if coupon.limit <= 0:
                    raise ValueError("Coupon not available")
                
                if coupon.discount_expire < timezone.now():
                    raise ValueError("Expired coupon")
            else:
                raise ValueError("Coupon not available")
            
            if User.objects.filter(id=request.user.id).exists():
                user = User.objects.get(id=request.user.id)  
            else:
                raise ValueError("You must have an account to claim a coupon")
                            
            if UserCoupon.objects.filter(coupon=coupon, user=user).exists():
                userCoupon = userCoupon.objects.get(coupon=coupon, user=user)

                if coupon.status == "is_claimed":
                    purchase = Purchase.objects.get(id=data['purchase_id'])

                    purchase.coupon = userCoupon
                    purchase.save()

                    userCoupon.status = "is_applied"
                    userCoupon.save()
                else:
                    if coupon.status == "is_applied":
                        raise ValueError("Coupon already applied")
                    if coupon.status == "is_used":
                        raise ValueError("Coupon already used")
            else:
                raise ValueError("Coupon not available")
                
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST)      
          
class PostVerifyCoupon(APIView): 
    authentication_classes=[JWTAuthentication]
    permission_classes=(permissions.IsAuthenticated,)
    def post(self, request, format=None):      
        try:
            data = self.request.data      
            if 'code' not in data:
                raise ValueError("Coupon entered in another purchase")
            
            if Coupon.objects.filter(code=data['code']).exists():
                coupon = Coupon.objects.get(code=data['code'])
            else:
                raise ValueError("Coupon not available")
            
            if UserCoupon.objects.filter(coupon=coupon, user=request.user).exists():
                userCoupon = UserCoupon.objects.get(coupon=coupon, user=request.user)
                if userCoupon.purchase:
                    raise ValueError("You have already redeemed this coupon")
                else:
                    return Response(status=status.HTTP_200_OK)
            else:
                raise ValueError("Coupon not found")
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST) 

class PostUnapplyCoupon(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=(permissions.IsAuthenticated,)
    def post(self, request, format=None):
        try:
            data = self.request.data 

            if 'code' not in data: 
                raise ValueError("Coupon not entered")
            
            if Coupon.objects.filter(code=data['code']).exists():
                coupon = Coupon.objects.get(code=data['code'])  
                if coupon.limit > 0:
                    coupon.limit += 1;
                    coupon.save()
                else:
                    raise ValueError("Coupon not available")
            else:
                raise ValueError("Coupon not found")
                        
            if coupon.discount_expire < timezone.now():
                raise ValueError("Expired coupon")
            
            userCoupon, created = UserCoupon.objects.get_or_create(coupon=coupon, user=request.user)

            if created:
                userCoupon = UserCoupon.objects.get(coupon=coupon, user=request.user)
                    
            if userCoupon.purchase == None:
                userCoupon.isUsed = False
                userCoupon.save()                
            
            return Response(status=status.HTTP_200_OK)
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST)     
        
class PostUnapplyCouponFromPurchase(APIView):    
    authentication_classes=[JWTAuthentication]
    permission_classes=(permissions.IsAuthenticated,)
    def post(self, request, format=None):
        try:
            data = self.request.data     

            if 'code' not in data: 
                raise ValueError("Coupon not received") 

            if 'commerceOrder' not in data: 
                raise ValueError("Order number not received")     

            if Purchase.objects.filter(code=data['commerceOrder'], user=request.user).exists():
                purchase = Purchase.objects.get(code=data['commerceOrder'], user=request.user) 
            else:
                raise ValueError("Order not found")    

            if UserCoupon.objects.filter(purchase=purchase, user=request.user).exists():
                userCoupon = UserCoupon.objects.get(purchase=purchase, user=request.user)
            else:
                raise ValueError("Coupon not found")
            
            if purchase.status == "created" or purchase.status == "uncompleted":
                new_total = purchase.total + purchase.discount
                purchase.total = new_total
                purchase.discount = 0
                purchase.save()

                #userCoupon.purchase = None
                #userCoupon.isUsed = False
                #userCoupon.save()
                return Response(status=status.HTTP_200_OK)
            else:
                raise ValueError("Option not available")   
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST)     