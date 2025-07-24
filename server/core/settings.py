from pathlib import Path

import firebase_admin
from firebase_admin import credentials
from cryptography.fernet import Fernet
import json

import os
from datetime import timedelta
import dj_database_url

import environ
env = environ.Env()
environ.Env.read_env()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS_PRO')

CORS_ORIGIN_WHITELIST = env.list('CORS_ORIGIN_WHITELIST_PRO') 
CSRF_TRUSTED_ORIGINS = env.list('CSRF_TRUSTED_ORIGINS_PRO')
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS_PRO')
CORS_ALLOW_METHODS = env.list('CORS_ALLOW_METHODS')

GOOGLE_APP_CREDENTIAL = env('GOOGLE_APP_CREDENTIAL')
GOOGLE_APP_ENCRYPTION_KEY = env('GOOGLE_APP_ENCRYPTION_KEY')

#LEER CLAVE DE CIFRADO
cipher_suite = Fernet(GOOGLE_APP_ENCRYPTION_KEY)

GOOGLE_APP_CREDENTIAL_PATH = os.path.join(os.path.dirname(__file__), GOOGLE_APP_CREDENTIAL)

#LEER ARCHIVO CIFRADI
with open(GOOGLE_APP_CREDENTIAL_PATH, 'rb') as encrypted_file:
    encrypted_data = encrypted_file.read()

#DESCIFRAR LOS DATOS DEL ARCHIVO CIFRADO
decrypted_data = cipher_suite.decrypt(encrypted_data)

#LEER LAS CREDENCIALES
cred = credentials.Certificate(json.loads(decrypted_data))

#INICIALIZAR APP DE FIREBASE
APP = firebase_admin.initialize_app(cred)

# Application definition
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_cleanup.apps.CleanupConfig',
]

PROJECT_APPS = [
    'apps.myAuth',
    'apps.user',
    'apps.shop',
    'apps.delivery',
    'apps.payment',
    'apps.purchase',
    'apps.home',
    'apps.blog',
    'apps.contact',
    'apps.coupons'
]

THIRD_PARTY_APPS = [
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
    'tinymce',
]

INSTALLED_APPS = DJANGO_APPS + PROJECT_APPS + THIRD_PARTY_APPS

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# WSGI_APPLICATION = 'core.wsgi.application'
ASGI_APPLICATION = 'core.asgi.application'


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

"""DATABASES = {
    'default': dj_database_url.config(
        default=env('DATABASE_URL'),
        engine='django.db.backends.postgresql'
    )
}"""
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
DATABASES["default"]["ATOMIC_REQUESTS"] = True

# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher",
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",
]

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

SITE_ID = 1

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_ROOT = os.path.join(BASE_DIR, 'static_root')
STATIC_URL = '/static/'

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static-ecw/static')
]

MEDIA_ROOT = os.path.join(BASE_DIR, 'media_root')
MEDIA_URL = '/media/'

if not DEBUG:
    PROTOCOL = "https://"
    AWS_ACCESS_KEY_ID = env('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = env('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = env('AWS_STORAGE_BUCKET_NAME')

    AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.sa-east-1.amazonaws.com'
    AWS_S3_OBJECT_PARAMETERS = {'CacheControl':'max-age=86400'}

    STATIC_LOCATION = 'static-ecw/static/'
    STATIC_URL = f'{PROTOCOL}{AWS_S3_CUSTOM_DOMAIN}/{STATIC_LOCATION}'
    STATICFILES_STORAGE = 'core.storage_backends.StaticStorage'

    PUBLIC_MEDIA_LOCATION = 'static-ecw/media/'
    MEDIA_URL = f'{PROTOCOL}{AWS_S3_CUSTOM_DOMAIN}/{PUBLIC_MEDIA_LOCATION}'
    DEFAULT_FILE_STORAGE = 'core.storage_backends.MediaStorage'

TINYMCE_DEFAULT_CONFIG = {
    'height': 600,
    'width': 1000,
    'plugins': 'advlist autolink lists link image charmap print preview anchor visualblocks',
    'toolbar': 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image',
    'image_advtab': True,
    'font_formats': 'Arial=arial,helvetica,sans-serif;Courier New=courier new,courier,monospace;Georgia=georgia,palatino;Tahoma=tahoma,arial,helvetica,sans-serif;Times New Roman=times new roman,times,serif;Verdana=verdana,geneva,sans-serif',
    'style_formats':  [
    { 'title': 'Headers', 'items': [
      { 'title': 'h1', 'block': 'h1' },
      { 'title': 'h2', 'block': 'h2' },
      { 'title': 'h3', 'block': 'h3' },
      { 'title': 'h4', 'block': 'h4' },
      { 'title': 'h5', 'block': 'h5' },
      { 'title': 'h6', 'block': 'h6' }
    ] },
    { 'title': 'Containers', 'items': [
      { 'title': 'header', 'block': 'header', 'wrapper': True, 'merge_siblings': False, 'classes': 'flex box-xxl m-height-xxs column a-start j-center padding-b-xs padding-t-xs padding-l-xxs padding-r-xxs second-border-b margin-b-xxs' },
      { 'title': 'div', 'block': 'div', 'wrapper': True, 'merge_siblings': False, 'classes': 'flex column box-xxl a-start j-start t-start gap-xxs padding-s margin-b-xxs' },
      { 'title': 'div 2', 'block': 'div', 'wrapper': True, 'merge_siblings': False, 'classes': 'flex column box-xxl a-center j-center t-start gap-xxs padding-s margin-b-xxs' },
      { 'title': 'image', 'block': 'div', 'wrapper': True, 'merge_siblings': False, 'classes': 'f-width-xl f-height-m margin-b-xxs' },
    ] }
  ],
}

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly'
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication'
    ],
}

SIMPLE_JWT = {
    'AUTH_HEADER_TYPES': ('JWT', ),
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(minutes=720),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_TOKEN_CLASSES': (
        'rest_framework_simplejwt.tokens.AccessToken',
    )
}

AUTH_USER_MODEL = 'myAuth.User'