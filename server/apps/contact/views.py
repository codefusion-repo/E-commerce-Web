from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
import re

from .models import Message, Newsletter
from apps.myAuth.utils import SendEmail

def verifyMessage(mensaje):
    link_pattern = r'http[s]?://\S+'
    has_links = bool(re.search(link_pattern, mensaje))
    return has_links

# Función para enviar un mensaje de contacto 
class SendMessage(APIView):
    permission_classes = (permissions.AllowAny,)
    def post(self, request, format=None):
        try:
            data = self.request.data 
            if 'email' not in data:
                raise ValueError('Email not entered')
            if 'name' not in data:
                raise ValueError('Name not entered')            
            if 'message' not in data:
                raise ValueError('Message not entered')
            
            if verifyMessage(data['message']):
                raise ValueError('You cannot send links')
            
            Message.objects.create(
                email=data['email'].lower(),
                name=data['name'],
                message=data['message']
            )

            # ENVIAR EMAIL DE RESPALDO AL ADMIN Y AL USUARIO
            SendEmail(email=data['email'].lower(), name=data['name'], subject="E-commerce-Web Contact email", variables={ 'name': data['name'], "msj": data['message'] })
        
            return Response({'detail': 'Message sent'}, status=status.HTTP_200_OK)   
        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)   
        
class UserInNewsletter(APIView):
    permission_classes = (permissions.AllowAny,)
    def post(self, request, format=None):
        try:
            data = self.request.data 
            if 'email' not in data:
                raise ValueError('Email not entered')
            
            newsletter, created = Newsletter.objects.get_or_create(
                 email=data['email']
            )

            if created:
                SendEmail(email=data['email'].lower(), name=data['email'].lower(), templateId=6175540, subject='Welcome to the newsletter E-commerce-Web', variables={ 'email': data['email'].lower() })
                return Response({'detail': 'Welcome to the newsletter E-commerce-Web'}, status=status.HTTP_200_OK) 
            else:
                newsletter.delete()
                SendEmail(email=data['email'].lower(), name=data['email'].lower(), templateId=6175538, subject='You have unsubscribed from the newsletter E-commerce-Web', variables={ 'email': data['email'].lower() })
                return Response({'detail': 'You have unsubscribed from the newsletter E-commerce-Web'}, status=status.HTTP_200_OK) 

        except ValueError as e:
            print(e)
            return Response({
                'detail': str(e) }, 
                status=status.HTTP_400_BAD_REQUEST)   