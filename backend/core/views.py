# kenya-earn/backend/core/views.py
import time
import json
import os
import requests
import hashlib
import hmac
from datetime import datetime, timedelta
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction, models
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from decouple import config

from .models import Profile, Wallet, Task, Payment, Transaction
from .serializers import (
    ProfileSerializer,
    ProfileCompletionSerializer,
    TaskSerializer,
    WalletSerializer,
    TransactionSerializer,
    ActivateSerializer
)

# Paystack config
PAYSTACK_SECRET_KEY = config('PAYSTACK_SECRET_KEY')
PAYSTACK_PUBLIC_KEY = config('PAYSTACK_PUBLIC_KEY')

# -------------------------
# PROFILE
# -------------------------

@api_view(['POST'])
def complete_profile(request):
    firebase_uid = request.firebase_uid
    serializer = ProfileCompletionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    data = serializer.validated_data

    first_name = request.firebase_user.get('name', '').split()[0] if request.firebase_user.get('name') else ''
    last_name = ' '.join(request.firebase_user.get('name', '').split()[1:]) if request.firebase_user.get('name') else ''
    email = request.firebase_user.get('email', '')

    # Get referrer if code provided
    referred_by = None
    if data.get('referral_code'):
        try:
            referred_by = Profile.objects.get(referral_code=data['referral_code'])
        except Profile.DoesNotExist:
            pass  # Should not happen due to validation

    profile, created = Profile.objects.get_or_create(
        firebase_uid=firebase_uid,
        defaults={
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'phone_number': data.get('phone_number', ''),
            'city': data.get('city', ''),
            'address': data.get('address', ''),
            'profile_picture': data.get('profile_picture', request.firebase_user.get('picture', '')),
            'referred_by': referred_by,
        }
    )

    if not created:
        profile.phone_number = data.get('phone_number', profile.phone_number)
        profile.city = data.get('city', profile.city)
        profile.address = data.get('address', profile.address)
        profile.profile_picture = data.get('profile_picture', profile.profile_picture)
        profile.save()

    Wallet.objects.get_or_create(profile=profile)

    # If referred by someone, create PENDING referral bonus
    if referred_by and created:
        Transaction.objects.create(
            wallet=referred_by.wallet,
            amount=50.00,
            type='deposit',
            status='pending',
            description=f"{first_name} used your code"
        )

    serializer_out = ProfileSerializer(profile)
    return Response(serializer_out.data)

@api_view(['GET', 'PUT'])
def profile_detail(request):
    profile = get_object_or_404(Profile, firebase_uid=request.firebase_uid)
    if request.method == 'GET':
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

# -------------------------
# ACTIVATION & PAYSTACK
# -------------------------

@api_view(['POST'])
def activate_account(request):
    profile = get_object_or_404(Profile, firebase_uid=request.firebase_uid)
    if profile.is_activated:
        return Response({'error': 'Already activated'}, status=400)

    serializer = ActivateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    phone_number = serializer.validated_data['phone_number']
    email = request.data.get('email', profile.email or 'user@example.com')
    amount_kes = 300  # Production amount

    url = "https://api.paystack.co/transaction/initialize"
    headers = {
        "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "email": email,
        "amount": int(amount_kes * 100),  # KES → cents
        "currency": "KES",
        "callback_url": "https://yourdomain.com/dashboard",  # Update to your live domain
        "metadata": {
            "custom_fields": [
                {"display_name": "Phone", "variable_name": "phone", "value": phone_number}
            ],
            "mobile_money": {"provider": "mpesa"}
        },
        "reference": f"ACTIVATE-{profile.id}-{int(time.time())}"
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response_data = response.json()

        if response_data.get('status'):
            Payment.objects.create(
                profile=profile,
                phone_number=phone_number,
                amount=amount_kes,
                status='pending',
                mpesa_checkout_id=response_data['data']['reference']  # Reuse field for Paystack ref
            )
            return Response({'data': response_data['data']})
        else:
            return Response({'error': 'Payment initiation failed', 'details': response_data.get('message', 'Unknown error')}, status=400)
    except Exception as e:
        return Response({'error': 'Network error', 'details': str(e)}, status=500)


@api_view(['GET'])
def verify_payment(request, reference):
    """Optional frontend verification (webhook is source of truth)"""
    profile = get_object_or_404(Profile, firebase_uid=request.firebase_uid)
    try:
        payment = Payment.objects.get(
            profile=profile,
            mpesa_checkout_id=reference,
            status='completed'
        )
        return Response({'activated': True, 'reference': reference})
    except Payment.DoesNotExist:
        return Response({'activated': False}, status=404)


@csrf_exempt
def paystack_webhook(request):
    """Secure Paystack webhook to confirm M-Pesa STK Push success"""
    signature = request.headers.get('x-paystack-signature')
    payload = request.body

    # Verify webhook signature
    expected_sig = hmac.new(
        PAYSTACK_SECRET_KEY.encode(), payload, hashlib.sha512
    ).hexdigest()

    if signature != expected_sig:
        return JsonResponse({'status': 'invalid signature'}, status=400)

    try:
        event = json.loads(payload)
        if event['event'] == 'charge.success':
            data = event['data']
            reference = data['reference']
            amount_paid = data['amount'] / 100  # cents → KES
            phone = None

            # Extract phone from metadata
            for field in data.get('metadata', {}).get('custom_fields', []):
                if field.get('variable_name') == 'phone':
                    phone = field['value']
                    break

            try:
                payment = Payment.objects.get(mpesa_checkout_id=reference)
                # Only activate if amount is at least Ksh 300
                if payment.status != 'completed' and amount_paid >= 300:
                    payment.status = 'completed'
                    payment.save()

                    profile = payment.profile
                    profile.is_activated = True
                    profile.save()

                    # Handle referral bonus
                    if profile.referred_by:
                        try:
                            referrer = profile.referred_by
                            pending_bonus = Transaction.objects.filter(
                                wallet=referrer.wallet,
                                amount=50.00,
                                type='deposit',
                                status='pending',
                                description__icontains=profile.first_name
                            ).first()
                            if pending_bonus:
                                pending_bonus.status = 'completed'
                                pending_bonus.save()
                            else:
                                Transaction.objects.create(
                                    wallet=referrer.wallet,
                                    amount=50.00,
                                    type='deposit',
                                    status='completed',
                                    description=f"{profile.first_name} used your code"
                                )
                        except Exception as e:
                            print(f"Referral bonus error: {e}")

                    # Record activation transaction
                    Transaction.objects.create(
                        wallet=profile.wallet,
                        amount=payment.amount,
                        type='activation',
                        status='completed'
                    )

            except Payment.DoesNotExist:
                # Log for monitoring: unexpected payment
                print(f"Webhook: Payment with reference {reference} not found")
                pass

        return JsonResponse({'status': 'success'})
    except Exception as e:
        print("Paystack webhook error:", e)
        return JsonResponse({'status': 'error'}, status=500)

# -------------------------
# DASHBOARD
# -------------------------

@api_view(['GET'])
def dashboard_data(request):
    profile = get_object_or_404(Profile, firebase_uid=request.firebase_uid)
    
    current_hour = timezone.now().hour
    if 5 <= current_hour < 12:
        greeting = f"Good morning, {profile.first_name}"
    elif 12 <= current_hour < 17:
        greeting = f"Good afternoon, {profile.first_name}"
    else:
        greeting = f"Good evening, {profile.first_name}"

    completed_tasks = Task.objects.filter(assigned_to=profile, status='approved').count()
    pending_tasks = Task.objects.filter(assigned_to=profile, status='pending').count()
    total_earnings = Transaction.objects.filter(
        wallet=profile.wallet,
        type__in=['deposit', 'activation'],
        status='completed'
    ).aggregate(total=models.Sum('amount'))['total'] or 0

    return Response({
        'greeting': greeting,
        'is_activated': profile.is_activated,
        'stats': {
            'completed_tasks': completed_tasks,
            'pending_tasks': pending_tasks,
            'total_earnings': float(total_earnings),
        }
    })

# -------------------------
# TASKS
# -------------------------

@api_view(['GET'])
def task_list(request):
    profile = get_object_or_404(Profile, firebase_uid=request.firebase_uid)
    if not profile.is_activated:
        return Response({'error': 'Account not activated'}, status=403)

    status_filter = request.GET.get('status', 'available')
    if status_filter == 'available':
        tasks = Task.objects.filter(status='available', expires_at__gt=timezone.now())
    else:
        tasks = Task.objects.filter(assigned_to=profile, status=status_filter)

    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def submit_task(request, task_id):
    profile = get_object_or_404(Profile, firebase_uid=request.firebase_uid)
    if not profile.is_activated:
        return Response({'error': 'Account not activated'}, status=403)

    task = get_object_or_404(Task, id=task_id, status='available')
    task.assigned_to = profile
    task.status = 'pending'
    task.save()
    return Response({'status': 'submitted'})

# -------------------------
# WALLET & TRANSACTIONS
# -------------------------

@api_view(['GET'])
def wallet_data(request):
    profile = get_object_or_404(Profile, firebase_uid=request.firebase_uid)
    wallet = get_object_or_404(Wallet, profile=profile)
    transactions = wallet.transactions.all().order_by('-timestamp')

    return Response({
        'balance': float(wallet.balance),
        'transactions': TransactionSerializer(transactions, many=True).data
    })

@api_view(['POST'])
def withdraw_funds(request):
    profile = get_object_or_404(Profile, firebase_uid=request.firebase_uid)
    if not profile.is_activated:
        return Response({'error': 'Account not activated'}, status=403)

    amount = request.data.get('amount')
    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return Response({'error': 'Invalid amount'}, status=400)

    if amount <= 0:
        return Response({'error': 'Amount must be positive'}, status=400)

    if profile.wallet.balance < amount:
        return Response({'error': 'Insufficient balance'}, status=400)

    Transaction.objects.create(
        wallet=profile.wallet,
        amount=amount,
        type='withdrawal',
        status='pending'
    )

    return Response({'status': 'Withdrawal request submitted'})

@api_view(['POST'])
def transfer_funds(request):
    sender = get_object_or_404(Profile, firebase_uid=request.firebase_uid)
    if not sender.is_activated:
        return Response({'error': 'Account not activated'}, status=403)

    recipient_code = request.data.get('recipient_code')
    amount = request.data.get('amount')

    if not recipient_code or not amount:
        return Response({'error': 'Recipient and amount required'}, status=400)

    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return Response({'error': 'Invalid amount'}, status=400)

    if amount <= 0:
        return Response({'error': 'Amount must be positive'}, status=400)

    try:
        recipient = Profile.objects.get(referral_code=recipient_code)
    except Profile.DoesNotExist:
        return Response({'error': 'Recipient not found'}, status=404)

    if sender.wallet.balance < amount:
        return Response({'error': 'Insufficient balance'}, status=400)

    with transaction.atomic():
        sender.wallet.balance -= amount
        recipient.wallet.balance += amount
        sender.wallet.save()
        recipient.wallet.save()

        Transaction.objects.create(
            wallet=sender.wallet,
            amount=amount,
            type='transfer',
            status='completed',
            recipient=recipient
        )
        Transaction.objects.create(
            wallet=recipient.wallet,
            amount=amount,
            type='transfer',
            status='completed',
            recipient=sender
        )

    return Response({'status': 'Transfer completed'})

# -------------------------
# SETTINGS
# -------------------------

@api_view(['PUT'])
def update_settings(request):
    profile = get_object_or_404(Profile, firebase_uid=request.firebase_uid)
    theme = request.data.get('theme_preference')
    if theme in ['light', 'dark', 'system']:
        profile.theme_preference = theme
        profile.save()
        return Response({'theme_preference': profile.theme_preference})
    return Response({'error': 'Invalid theme'}, status=400)

@api_view(['DELETE'])
def delete_account(request):
    profile = get_object_or_404(Profile, firebase_uid=request.firebase_uid)
    profile.delete()
    return Response({'status': 'Account deleted'})