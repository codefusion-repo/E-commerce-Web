from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework import permissions
from django.utils import timezone
import base64
from .models import IpAddress
from .serializers import IpAddressSerializer, StatusSerializer
from .utils import CreateConfirmNumber, AuthenticateUser, DecryptData, VerifyFirebaseToken
from django.contrib.auth import get_user_model

User = get_user_model()

# Vista para obtener el ip del dispositivo actual
class GetDeviceIp(APIView):
    permission_classes=(permissions.AllowAny,)
    def get(self, request, format=None):
        try:
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')

            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR')

            ipAddress, created = IpAddress.objects.get_or_create({
                'ip': ip
            })
            if created:
                ipAddress = IpAddress.objects.get(ip=ip)
                
            serializer = IpAddressSerializer(ipAddress)

            return Response({'ipAddress': serializer.data}, status=status.HTTP_200_OK)
        except ValueError as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)

# Vista para registrar a un nuevo usuario    
class Register(APIView):
    permission_classes = (permissions.AllowAny,)
    def post(self, request, format=None):
        try:
            data = self.request.data 
            if 'token' not in data:
                raise ValueError('Registration token not received')
            if 'uid' not in data:
                raise ValueError('Registration uid was not received')
            if 'email' not in data:
                raise ValueError('Registration email was not received')
            if 'username' not in data:
                raise ValueError('Registration username was not received')     
                   
            user, created = User.objects.get_or_create(
                id=data['uid'],
                email=data['email'].lower(),
                defaults={
                    'username': data['username'],
                    'first_name': data['first_name'],
                    'last_name': data['last_name'],
                    'rut': data['rut'],
                    'phone': data['phone'],
                })      
               
            if created:
                user = User.objects.get(id=data['uid'])
                user.set_password(data['token'])
                user.save()   

            if user.is_active == False:
                result = CreateConfirmNumber(user.email, user.first_name)
                if result['status'] == 200:
                    statusData = {
                        'uid': user.id,
                        'status': 'waitingConfirmCode'
                    }
                    serializedStatus = StatusSerializer(statusData)     

                    user.token = result['safe_confirm_number']
                    user.token_expire = result['token_expire']
                    user.save()

                    return Response({
                        'detail': f"Unverified email, we send a verification code to your email",
                        'email': serializedStatus.data}, 
                        status=status.HTTP_200_OK)                    
                else:
                    raise ValueError(result['detail'])    
                
            result = AuthenticateUser(request, user, data['token'])
            if result['status'] == 200:
                return Response({
                    'detail': 'logged in',
                    'email': result['email'],
                    'tokens': result['tokens'],
                    'user': result['user']}, 
                    status=status.HTTP_200_OK)
            else:
                print(result['detail'])
                statusData = {
                    'uid': user.id,
                    'status': 'notLogged'
                }
                serializedStatus = StatusSerializer(statusData)
                return Response({
                    'detail': f'Registered user but could not log in, try again',
                    'email': serializedStatus.data}, 
                    status=status.HTTP_200_OK)          
                                            
        except ValueError as e:
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)  
                       
# Vista para verificar el email de un nuevo usuario registrado
class VerifyEmail(APIView): 
    permission_classes=(permissions.AllowAny,)
    def post(self, request, format=None):
        try:
            data = self.request.data 
            if 'token' not in data:
                raise ValueError('Access token was not received')
            if 'uid' not in data:
                raise ValueError('The uid was not received')
            if 'verifyEmailNumber' not in data:
                raise ValueError('Verification number not received')
            if User.objects.filter(id=data['uid']).exists():
                user = User.objects.get(id=data['uid'])
            else:
                raise ValueError('Unable to get user')
            
            if user.token_expire < timezone.now():
                result = CreateConfirmNumber(user.email, user.first_name)
                if result['status'] == 200:
                    statusData = {
                        'uid': user.id,
                        'status': 'waitingConfirmCode'
                    }
                    serializedStatus = StatusSerializer(statusData)
                    
                    user.token = result['safe_confirm_number']
                    user.token_expire = result['token_expire']
                    user.save()
                                        
                    return Response({
                        'detail': f"Verification code expired, we send a new verification code to your email",
                        'email': serializedStatus.data}, 
                        status=status.HTTP_200_OK)   
                else:
                    raise ValueError(result['detail'])  
                
            token = base64.urlsafe_b64decode(user.token.encode('utf-8'))      

            decryptedToken =  DecryptData(token)

            if decryptedToken == data['verifyEmailNumber']:     
                user.is_active = True
                user.save()     

                result = AuthenticateUser(request, user, data['token'])
                if result['status'] == 200:
                    return Response({
                        'detail': 'logged in',
                        'email': result['email'],
                        'tokens': result['tokens'],
                        'user': result['user']}, 
                        status=status.HTTP_200_OK)
                else:
                    print(result['detail'])
                    statusData = {
                        'uid': user.id,
                        'status': 'notLogged'
                    }
                    serializedStatus = StatusSerializer(statusData)
                    return Response({
                        'detail': f'Could not log in, try again',
                        'email': serializedStatus.data}, 
                        status=status.HTTP_200_OK) 
            else:
                raise ValueError('Incorrect verification code')  
            
        except ValueError as e:
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)  

# Vista para iniciar sesión de un usuario registrado
class Login(APIView):
    permission_classes=(permissions.AllowAny,)
    def post(self, request, format=None):
        try: 
            data = self.request.data 
            if 'token' not in data:
                raise ValueError('Access token was not received')
            if 'email' not in data:
                raise ValueError('The email was not received')
            
            if User.objects.filter(email=data['email']).exists():
                user = User.objects.get(email=data['email'])     
            else:
                statusData = {
                    'uid': "",
                    'status': 'notRegistered'
                }         
                serializedStatus = StatusSerializer(statusData)       
                return Response({
                    'detail': 'Unregistered user',
                    'email': serializedStatus.data}, 
                    status=status.HTTP_200_OK)     
            
            if user.is_active == False:
                result = CreateConfirmNumber(user.email, user.first_name)
                if result['status'] == 200:
                    statusData = {
                        'uid': user.id,
                        'status': 'waitingConfirmCode'
                    }
                    serializedStatus = StatusSerializer(statusData)     

                    user.token = result['safe_confirm_number']
                    user.token_expire = result['token_expire']
                    user.save()

                    return Response({
                        'detail': f"Unverified email, we send a verification code to your email",
                        'email': serializedStatus.data}, 
                        status=status.HTTP_200_OK)                    
                else:
                    raise ValueError(result['detail'])
                
            result = AuthenticateUser(request, user, data['token'])
            if result['status'] == 200:
                return Response({
                    'detail': 'logged in',
                    'email': result['email'],
                    'tokens': result['tokens'],
                    'user': result['user']}, 
                    status=status.HTTP_200_OK)
            else:
                print(result['detail'])
                statusData = {
                    'uid': user.id,
                    'status': 'notLogged'
                }
                serializedStatus = StatusSerializer(statusData)
                return Response({
                    'detail': f'Could not log in, try again',
                    'email': serializedStatus.data}, 
                    status=status.HTTP_200_OK)        
                 
        except ValueError as e:
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)  
        
# Vista para verificar id token y autenticar al usuario si este es valido
class VerifyFirebaseIdToken(APIView):
    permission_classes=(permissions.AllowAny,)
    def post(self, request, format=None):
        try:
            data = self.request.data 
            if 'token' not in data:
                raise ValueError('Access token was not received')
            if 'email' not in data:
                raise ValueError('The email was not received')
            
            if User.objects.filter(email=data['email']).exists():
                user = User.objects.get(email=data['email'])
            else:
                raise ValueError('Failed to verify user token')
            
            if user.is_active == False:            
                raise ValueError('Failed to verify user token')
            
            result = VerifyFirebaseToken(data['token'])
            if result['status'] == 200:
                return Response(status=status.HTTP_200_OK)                   
            else:
                raise ValueError(result['detail'])   
            
        except ValueError as e:
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)     