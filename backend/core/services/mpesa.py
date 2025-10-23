# kenya-earn/backend/core/services/mpesa.py
import requests
from django.conf import settings
from datetime import datetime
import base64

def get_mpesa_access_token():
    consumer_key = settings.MPESA_CONFIG['CONSUMER_KEY']
    consumer_secret = settings.MPESA_CONFIG['CONSUMER_SECRET']
    api_url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    r = requests.get(api_url, auth=(consumer_key, consumer_secret))
    return r.json().get('access_token')

def lipa_na_mpesa_online(phone_number, amount, account_reference):
    access_token = get_mpesa_access_token()
    if not access_token:
        return {'error': 'Could not get access token'}

    shortcode = settings.MPESA_CONFIG['SHORTCODE']
    passkey = settings.MPESA_CONFIG['PASSKEY']
    callback_url = settings.MPESA_CONFIG['CALLBACK_URL']

    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    password = base64.b64encode((shortcode + passkey + timestamp).encode()).decode()

    payload = {
        "BusinessShortCode": shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": phone_number,
        "PartyB": shortcode,
        "PhoneNumber": phone_number,
        "CallBackURL": callback_url,
        "AccountReference": account_reference,
        "TransactionDesc": "Activation Fee"
    }

    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.post(
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        json=payload,
        headers=headers
    )
    return response.json()