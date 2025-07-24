from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from apps.myAuth.utils import CreateConfirmNumber, DecryptData, SendEmail
from apps.myAuth.serializers import UserSerializer, StatusSerializer
from firebase_admin import auth
from django.conf import settings
from django.utils import timezone
import base64

from django.contrib.auth import get_user_model

User = get_user_model()

# Función para obtener información actualizada del usuario
class GetProfile(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=(permissions.IsAuthenticated,)
    def get(self, request, format=None):
        try:
            if User.objects.filter(id=request.user.id).exists():
                user = User.objects.get(id=request.user.id)
                serializedUser = UserSerializer(user)
                return Response({ 
                    'user': serializedUser.data }, 
                    status=status.HTTP_200_OK)
            else:
                raise ValueError('User not found')
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)   

# Función para editar la información de perfil del usuario
class ProfileEditor(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=(permissions.IsAuthenticated,)
    def post(self, request, format=None):
        try: 
            data = self.request.data 
            if 'param' not in data: 
                raise ValueError('Parameter not received')
            if 'value' not in data: 
                raise ValueError('Value not received')
            
            User.objects.update_or_create(id=request.user.id, defaults={
                f"{data['param']}": data['value']
            })   

            return Response ({'detail': 'Updated profile'}, status=status.HTTP_200_OK)     
        except ValueError as e:
            print(e)
            return Response({
                'detail': 'Could not update profile' }, 
                status=status.HTTP_400_BAD_REQUEST)      

# Función para cambiar email (enviar código de confirmación al nuevo email)
class ChangeEmail(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=(permissions.IsAuthenticated,)
    def post(self, request, format=None):
        try:
            data = self.request.data 
            if 'newEmail' not in data: 
                raise ValueError('New email not received')
            
            if User.objects.filter(email=data['newEmail'].lower()).exists():
                userEmailUsed = User.objects.get(email=data['newEmail'].lower())
                if userEmailUsed.id == request.user.id:
                    raise ValueError('Enter an email different from the current one')
                else:
                    raise ValueError('Email entered is in use')
            try: 
                firebaseUser = auth.get_user_by_email(email=data['newEmail'].lower(), app=settings.APP)
                if firebaseUser['uid'] == id:
                    raise ValueError('Enter an email different from the current one')
                else:
                    raise ValueError('Email entered is in use')
            except: 
                print(f"Email {data['newEmail']} is available")   

            if User.objects.filter(id=request.user.id).exists():
                user = User.objects.get(id=request.user.id)
                result = CreateConfirmNumber(user.email, user.first_name, data['newEmail'].lower())
                if result['status'] == 200:
                    statusData = {
                        'uid': user.id,
                        'status': 'waitingCode'
                    }
                    serializedStatus = StatusSerializer(statusData)     

                    user.token = result['safe_confirm_number']
                    user.token_expire = result['token_expire']
                    user.save()

                    return Response({
                        'detail': f"Please verify your new email, we send a verification code to your email",
                        'email': serializedStatus.data}, 
                        status=status.HTTP_200_OK)                    
                else:
                    raise ValueError(result['detail'])     
            else:
                raise ValueError('User not found')   
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST) 
        
# Función para cambiar email (recibir código de confirmación de nuevo email)
class ReceiveChangeEmail(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=(permissions.IsAuthenticated,)
    def post(self, request, format=None):
        try:
            data = self.request.data 
            if 'code' not in data: 
                raise ValueError('Code not received')    
             
            if User.objects.filter(id=request.user.id).exists():
                user = User.objects.get(id=request.user.id)     
            else: 
                raise ValueError('User not found')       

            if user.token_expire < timezone.now():
                user.token = None
                user.token_expire = None
                user.save()    
                raise ValueError('Code expired, try again')  
            
            token = base64.urlsafe_b64decode(user.token.encode('utf-8'))
            tokenDecrypted = DecryptData(token)
            valores = tokenDecrypted.split(',')

            code = valores[0]
            new_email = valores[1].lower()    

            if code == data['code']:    
                if User.objects.filter(email=new_email).exists():
                    userEmailUsed = User.objects.get(email=new_email)
                    if userEmailUsed.id == request.user.id:
                        raise ValueError('Enter an email different from the current one')
                    else:
                        raise ValueError('Email entered is in use')
                try: 
                    firebaseUser = auth.get_user_by_email(email=new_email, app=settings.APP)
                    if firebaseUser['uid'] == id:
                        raise ValueError('Enter an email different from the current one')
                    else:
                        raise ValueError('Email entered is in use')
                except: 
                    print(f"Email {new_email} is available")   

                firebase_user = auth.get_user(user.id)
                if any(item.provider_id == 'password' for item in firebase_user.provider_data):
                    auth.update_user(user.id, email=new_email, app=settings.APP)

                    user.email = new_email
                    user.save()
                    
                    statusData = {
                        'uid': user.id,
                        'status': 'emailUpdated'
                    }
                    serializedStatus = StatusSerializer(statusData)
        
                    return Response({
                        'detail': f'Updated email, log in with the new email {new_email}',
                        'email': serializedStatus.data}, 
                        status=status.HTTP_200_OK)  
                else: 
                    raise ValueError('You must set your password to be able to change your email')                                                              
            else:
                raise ValueError('Wrong code')
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)   

# Función para configurar una nueva contraseña  
class SetPassword(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=(permissions.IsAuthenticated,)
    def post(self, request, format=None):
        try:
            data = self.request.data 
            if 'password' not in data: 
                raise ValueError('Password not received')     
            
            auth.update_user(request.user.id, password=data['password'])
                    
            statusData = {
                'uid': request.user.id,
                'status': 'passwordUpdated'
            }
            serializedStatus = StatusSerializer(statusData)
        
            return Response({
                    'detail': f'Updated password',
                    'email': serializedStatus.data}, 
                    status=status.HTTP_200_OK)    
                
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)   
        
# Función para manejar el olvido de contraseña (enviar código de confirmación al email) 
class ForgotPassword(APIView):
    permission_classes=(permissions.AllowAny,)
    def post(self, request, format=None):
        try:
            data = self.request.data 
            if 'email' not in data: 
                raise ValueError('Email not received')   
            
            if User.objects.filter(email=data['email'].lower()).exists():
                user = User.objects.get(email=data['email'].lower())
                result = CreateConfirmNumber(user.email, user.first_name)
                if result['status'] == 200:
                    statusData = {
                        'uid': user.id,
                        'status': 'waiting'
                    }
                    serializedStatus = StatusSerializer(statusData)     

                    user.token = result['safe_confirm_number']
                    user.token_expire = result['token_expire']
                    user.save()

                    # ENVIAR EMAIL

                    return Response({
                        'detail': f"Verify that it is you, we send a verification code to your email",
                        'email': serializedStatus.data}, 
                        status=status.HTTP_200_OK)                    
                else:
                    raise ValueError(result['detail']) 
            else:
                raise ValueError('User not found')                    
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)   
        
# Función para cambiar la contraseña olvidada y confirmar el codigo enviado al correo
class ReceiveChangeForgotPassword(APIView):
    permission_classes=(permissions.AllowAny,)
    def post(self, request, format=None):
        try:
            data = self.request.data 
            if 'email' not in data: 
                raise ValueError('Email not received')     
            if 'code' not in data: 
                raise ValueError('Code not received') 
            if 'newPassword' not in data: 
                raise ValueError('Password not received')   
            
            if User.objects.filter(email=data['email'].lower()).exists():
                user = User.objects.get(email=data['email'].lower())
            else:  
                raise ValueError('User not found')   

            if user.token_expire < timezone.now():
                result = CreateConfirmNumber(user.email, user.first_name)  
                if result['status'] == 200:
                    statusData = {
                        'uid': user.id,
                        'status': 'waiting'
                    }  
                    serializedStatus = StatusSerializer(statusData)                  
                    user.token = result['safe_confirm_number']
                    user.token_expire = result['token_expire']
                    user.save()
                    return Response({
                        'detail': f"Verify that it is you, we send a verification code to your email",
                        'email': serializedStatus.data}, 
                        status=status.HTTP_200_OK)         
                else:
                    raise ValueError(result['detail'])     

            token = base64.urlsafe_b64decode(user.token.encode('utf-8'))      

            decryptedToken =  DecryptData(token)   

            if decryptedToken == data['code']:
                auth.update_user(user.id, password=data['newPassword'])
                        
                statusData = {
                    'uid': user.id,
                    'status': 'passwordUpdated'
                }
                serializedStatus = StatusSerializer(statusData)
            
                return Response({
                        'detail': f'Password updated, please log in',
                        'email': serializedStatus.data}, 
                        status=status.HTTP_200_OK)     
            else:
                raise ValueError('Incorrect verification code')                                                                          
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)   
        
# Función para cambiar la contraseña olvidada
class ChangeForgottenPassword(APIView):
    permission_classes=(permissions.AllowAny,)
    def post(self, request, format=None):
        try:
            data = self.request.data 
            if 'password' not in data: 
                raise ValueError('Password not received')   
            if 'email' not in data: 
                raise ValueError('Email not received')   
            
            if User.objects.filter(email=data['email'].lower()).exists():
                user = User.objects.get(email=data['email'].lower())
            else:  
                raise ValueError('User not found') 
            
            auth.update_user(user.id, password=data['password'])
                    
            statusData = {
                'uid': user.id,
                'status': 'passwordUpdated'
            }
            serializedStatus = StatusSerializer(statusData)
        
            return Response({
                    'detail': f'Password updated, please log in again',
                    'email': serializedStatus.data}, 
                    status=status.HTTP_200_OK)  
                                
        except ValueError as e:
            print(e)
            return Response({
                'detail': 'Could not update password' }, 
                status=status.HTTP_400_BAD_REQUEST)   

# Función para manejar la eliminación de una cuenta (enviar código de confirmación al email) 
class DeleteAccount(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=(permissions.IsAuthenticated,)
    def post(self, request, format=None):
        try:
            if User.objects.filter(id=request.user.id).exists():
                user = User.objects.get(id=request.user.id)
                result = CreateConfirmNumber(user.email, user.first_name)
                if result['status'] == 200:
                    statusData = {
                        'uid': user.id,
                        'status': 'waitingCode'
                    }
                    serializedStatus = StatusSerializer(statusData)
                    user.token = result['safe_confirm_number']
                    user.token_expire = result['token_expire']
                    user.save()         
                    return Response({
                        'detail': f"Please verify that you want to delete your account, we will send a verification code to your email",
                        'email': serializedStatus.data}, 
                        status=status.HTTP_200_OK)    
                else:
                    raise ValueError(result['detail'])     
            else:
                raise ValueError('User not found')                                      
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)      
                 
# Función para manejar la eliminación de una cuenta (recibir código de confirmación al email) 
class ReceiveDeleteAccount(APIView):    
    authentication_classes=[JWTAuthentication]
    permission_classes=(permissions.IsAuthenticated,)    
    def post(self, request, format=None):
        try:
            data = self.request.data 

            if 'code' not in data: 
                raise ValueError('Code not received')   
            
            if User.objects.filter(id=request.user.id).exists():
                user = User.objects.get(id=request.user.id)
            else:  
                raise ValueError('User not found')      
            
            if user.token_expire < timezone.now():
                result = CreateConfirmNumber(user.email, user.first_name)  
                if result['status'] == 200:
                    statusData = {
                        'uid': user.id,
                        'status': 'waitingCode'
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

            if decryptedToken == data['code']:
                auth.delete_user(user.id, app=settings.APP)
                user.delete()

                return Response({
                    'detail': 'User successfully deleted'}, 
                    status=status.HTTP_200_OK)   
            else:
                raise ValueError('Incorrect verification code')     
                                        
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)   
        

# Función para reenviar código al email
class ResendVerifyCode(APIView):
    permission_classes=(permissions.AllowAny,)
    def post(self, request, format=None):
        try:
            data = self.request.data 
            if 'email' not in data: 
                raise ValueError('Email not received')   
            
            if User.objects.filter(email=data['email'].lower()).exists():
                user = User.objects.get(email=data['email'].lower())
                email = user.email
                name = user.first_name
                if user.token: 
                    token = base64.urlsafe_b64decode(user.token.encode('utf-8'))      
                    decryptedToken =  DecryptData(token)        
                    SendEmail(email=email, name=name, templateId=6533949, subject="CodeFusion.cl | Verification code", variables={ 'name': name, 'msj': decryptedToken } )   
                    return Response({
                            'detail': f'Code sent to your email.',
                        }, 
                            status=status.HTTP_200_OK)     
                    
                result = CreateConfirmNumber(email, name)  
                if result['status'] == 200:
                    user.token = result['safe_confirm_number']
                    user.token_expire = result['token_expire']
                    user.save()
                
                return Response({
                            'detail': f'Código reenviado a tu email',
                        }, 
                            status=status.HTTP_200_OK)  
            else:
                return Response({
                            'detail': f'Usuario no encontrado',
                        }, 
                            status=status.HTTP_200_OK)  

                                
        except ValueError as e:
            print(e)
            return Response({
                'detail': 'No fue posible reenviar el email' }, 
                status=status.HTTP_400_BAD_REQUEST)   