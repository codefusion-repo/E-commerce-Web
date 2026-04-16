# server/core/firebase.py
import json
import os
from cryptography.fernet import Fernet
import firebase_admin
from firebase_admin import credentials
from django.conf import settings

def init_firebase():
    if firebase_admin._apps:
        return firebase_admin.get_app()

    cipher_suite = Fernet(settings.GOOGLE_APP_ENCRYPTION_KEY)
    credential_path = os.path.join(os.path.dirname(settings.__file__), settings.GOOGLE_APP_CREDENTIAL)

    with open(credential_path, "rb") as encrypted_file:
        encrypted_data = encrypted_file.read()

    decrypted_data = cipher_suite.decrypt(encrypted_data)
    cred = credentials.Certificate(json.loads(decrypted_data))
    return firebase_admin.initialize_app(cred)