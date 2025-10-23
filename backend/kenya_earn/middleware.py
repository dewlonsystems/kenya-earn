# kenya-earn/backend/kenya_earn/middleware.py
import json
import firebase_admin
from firebase_admin import credentials, auth
from django.conf import settings
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
import os

# Initialize Firebase only once
if not firebase_admin._apps:
    cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
    firebase_admin.initialize_app(cred)

class FirebaseAuthenticationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Skip auth for admin, static, media, and public paths
        exempt_urls = ['/admin/', '/static/', '/media/', '/api/schema/', '/api/docs/']
        if any(request.path.startswith(url) for url in exempt_urls):
            return None

        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)

        token = auth_header.split('Bearer ')[1]
        try:
            decoded_token = auth.verify_id_token(token)
            request.firebase_user = decoded_token
            request.firebase_uid = decoded_token['uid']
        except Exception as e:
            return JsonResponse({'error': 'Invalid Firebase token', 'details': str(e)}, status=401)

        return None