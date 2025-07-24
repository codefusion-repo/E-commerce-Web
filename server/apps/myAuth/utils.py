from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding
from django.utils import timezone
from firebase_admin import auth
from django.conf import settings
from .serializers import UserSerializer, TokenSerializer, StatusSerializer
from django.contrib.auth import authenticate, login
from rest_framework_simplejwt.tokens import RefreshToken
import base64
import random
import os
import environ
from mailjet_rest import Client

env = environ.Env()
environ.Env.read_env()

# Función para cifrar datos
def EncryptData(data):
    secret_key = env('GENERAL_ENCRYPTION_KEY')

    init_code = os.urandom(16)

    encrypted = Cipher(
        algorithms.AES(secret_key.encode('utf-8')), 
        modes.CBC(init_code), 
        backend=default_backend()).encryptor()
    
    padder = padding.PKCS7(128).padder()

    data_padded = padder.update(data.encode('utf-8')) + padder.finalize()

    encrypted_data = encrypted.update(data_padded) + encrypted.finalize()

    return init_code + base64.b64encode(encrypted_data)

# Función para descifrar datos
def DecryptData(data):
    secret_key = env('GENERAL_ENCRYPTION_KEY')

    init_code = data[:16]

    cifrador = Cipher(
        algorithms.AES(secret_key.encode('utf-8')), 
        modes.CBC(init_code), 
        backend=default_backend()).decryptor()

    data = base64.b64decode(data[16:])

    data_padded = cifrador.update(data) + cifrador.finalize()

    unpadder = padding.PKCS7(128).unpadder()

    decrypted_data = unpadder.update(data_padded) + unpadder.finalize()

    return decrypted_data.decode('utf-8')


# Función para crear números de confirmación
def CreateConfirmNumber(email, name, new_email=None):
    try:
        confirm_number = ''.join([str(random.randint(0, 9)) for _ in range(6)])
       
        if new_email is not None:
            chainToken = f'{confirm_number},{new_email}'
            SendEmail(email=email, name=name, templateId=6533949, subject="CodeFusion.cl | Verification code", variables={ 'name': name, 'msj': confirm_number } )
        else:
            chainToken = f'{confirm_number}'
            SendEmail(email=email, name=name, templateId=6533949, subject="CodeFusion.cl | Verification code", variables={ 'name': name, 'msj': confirm_number } )

        encrypted_confirm_number = EncryptData(str(chainToken))

        safe_confirm_number = base64.urlsafe_b64encode(encrypted_confirm_number).decode('utf-8')
        token_expire = timezone.now() + timezone.timedelta(minutes=15)


        # SendEmail(email=email, name=name, confirm_number=confirm_number)

        return {
            'status': 200,
            'safe_confirm_number': safe_confirm_number,
            'token_expire': token_expire,
            #'confirm_number': confirm_number
        }
    except Exception as e:
        print(e)
        return {
            'status': 400,
            'detail': 'Could not generate confirmation token'
        }

# Función para enviar un email
def SendEmail(email, name, templateId, subject=None, variables=None):
    try:

        api_key = env('MJ_APIKEY_PUBLIC')
        api_secret = env('MJ_APIKEY_PRIVATE')
        mailjet = Client(auth=(api_key, api_secret), version='v3.1')
        # print("variables: ", variables)
        data = {
        'Messages': [
                        {
                            "From": {
                                    "Email": env('MJ_SUPER_EMAIL'),
                                    "Name": "E-commerce test e-mail"
                            },
                            "To": [
                                    {
                                        "Email": email,
                                        "Name": name
                                    }
                            ],

                            'TemplateID': templateId,  
                            'TemplateLanguage': True,
                            "Subject": subject,
                            'Variables': variables
                        }
                ]
        }
        result = mailjet.send.create(data=data)     
        print(result.status_code)
        print(result.json())

        return {
            'status': 200,
        }
    except Exception as e:
        print(e)
        return {
            'status': 400,
            'detail': 'Could not send email'
        }
    
# Función para verificar el token de firebase
def VerifyFirebaseToken(token):
    try:
        decoded_token = auth.verify_id_token(id_token=token, app=settings.APP, check_revoked=True)
        return {
            'status': 200,
            'decoded_token': decoded_token
        }
    except auth.RevokedIdTokenError:
        return {
            'status': 400,
            'detail': 'Token de acceso revocado'
        }
    except auth.UserDisabledError:
        return {
            'status': 400,
            'detail': 'Token de acceso pertence a un usuario inactivo'
        }
    except auth.InvalidIdTokenError:
        return {
            'status': 400,
            'detail': 'Token de acceso no válido'
        }
    except Exception as e:
        print(e)
        return {
            'status': 400,
            'detail': 'No fue posible verificar el token de acceso'
        }
    
# Función para autenticar a los usuarios 
def AuthenticateUser(request, user, token):
    try:
        token = str(token)
        result = VerifyFirebaseToken(token)
        if result['status'] == 200:
            decoded_token = result['decoded_token']
            email = decoded_token['email']
            user.set_password(token)
            user.save()
        else:
            raise Exception(result['detail'])
        
        if user is None or not user.check_password(token):
            raise Exception('Contraseña incorrecta')
        
        user = authenticate(request, email=email.lower(), password=token)
        if user is not None:
            login(request, user)
        else:
            raise Exception('No fue posible iniciar sesión')
        
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token        

        tokenData = {
            'refresh': refresh,
            'access': access
        }
        statusData = {
            'uid': user.id,
            'status': 'emailVerified'
        }
        serializedToken = TokenSerializer(tokenData)
        serializedStatus = StatusSerializer(statusData)
        serializedUser = UserSerializer(user)

        return {
            'status': 200,
            'email': serializedStatus.data,
            'tokens': serializedToken.data,
            'user': serializedUser.data
        }
    except Exception as e:
            return {
                'status': 400,
                'detail': e
            }