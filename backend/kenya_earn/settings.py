import os
import json
from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

# Security
SECRET_KEY = config('SECRET_KEY', default='django-insecure-local-dev-key-please-change-in-prod')
DEBUG = config('DEBUG', default=True, cast=bool)

# Hosts
if DEBUG:
    ALLOWED_HOSTS = ['localhost', '127.0.0.1']
else:
    ALLOWED_HOSTS = ['.onrender.com']  # Render subdomain wildcard

# Application definition
INSTALLED_APPS = [
    'core',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'whitenoise.runserver_nostatic',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'kenya_earn.middleware.FirebaseAuthenticationMiddleware',
]

ROOT_URLCONF = 'kenya_earn.urls'

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

WSGI_APPLICATION = 'kenya_earn.wsgi.application'

# Database
if DEBUG:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    # Render + Supabase (or any PostgreSQL)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('DB_NAME', default='postgres'),
            'USER': config('DB_USER'),
            'PASSWORD': config('DB_PASSWORD'),
            'HOST': config('DB_HOST'),
            'PORT': config('DB_PORT', default='5432'),
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = []

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Nairobi'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': [],
}

# CORS Settings
if DEBUG:
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:3000",
    ]
else:
    # ⚠️ Remove trailing spaces!
    CORS_ALLOWED_ORIGINS = [
        "https://freelancer-tawny.vercel.app",
    ]

# Firebase: Load credentials securely
FIREBASE_SERVICE_ACCOUNT_JSON = config('FIREBASE_SERVICE_ACCOUNT_JSON', default=None)

if FIREBASE_SERVICE_ACCOUNT_JSON:
    # Production: load from environment variable (JSON string)
    import firebase_admin
    from firebase_admin import credentials
    firebase_dict = json.loads(FIREBASE_SERVICE_ACCOUNT_JSON)
    FIREBASE_CREDENTIALS = credentials.Certificate(firebase_dict)
else:
    # Local development fallback (optional)
    firebase_path = config('FIREBASE_SERVICE_ACCOUNT_PATH', default='firebase-service-account.json')
    FIREBASE_CREDENTIALS = os.path.join(BASE_DIR, firebase_path)

# Paystack
PAYSTACK_PUBLIC_KEY = config('PAYSTACK_PUBLIC_KEY', default='pk_test_xxx')
PAYSTACK_SECRET_KEY = config('PAYSTACK_SECRET_KEY', default='sk_test_xxx')