# kenya-earn/backend/core/models.py
import secrets
from django.db import models
from django.utils import timezone

def generate_referral_code():
    return secrets.token_urlsafe(8).upper()[:8]

class Profile(models.Model):
    firebase_uid = models.CharField(max_length=255, unique=True)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    city = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    profile_picture = models.URLField(blank=True)
    referral_code = models.CharField(max_length=10, unique=True, default=generate_referral_code)
    referred_by = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='referrals')
    is_activated = models.BooleanField(default=False)
    theme_preference = models.CharField(
        max_length=10,
        choices=[('light', 'Light'), ('dark', 'Dark'), ('system', 'System')],
        default='system'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.firebase_uid})"

class Wallet(models.Model):
    profile = models.OneToOneField(Profile, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    def __str__(self):
        return f"Wallet of {self.profile}"

class Task(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    title = models.CharField(max_length=200)
    description = models.TextField()
    reward_amount = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.URLField(blank=True)
    posted_by = models.CharField(max_length=255)  # Admin UID or name
    assigned_to = models.ForeignKey(Profile, null=True, blank=True, on_delete=models.SET_NULL)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    rejection_reason = models.TextField(blank=True)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title

class Payment(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    mpesa_checkout_id = models.CharField(max_length=100, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    phone_number = models.CharField(max_length=15)
    status = models.CharField(max_length=20, default='pending')  # pending, completed, failed
    created_at = models.DateTimeField(default=timezone.now)

class Transaction(models.Model):
    TYPE_CHOICES = [
        ('activation', 'Activation'),
        ('withdrawal', 'Withdrawal'),
        ('deposit', 'Deposit'),
        ('transfer', 'Transfer'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
    ]
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    recipient = models.ForeignKey(Profile, null=True, blank=True, on_delete=models.SET_NULL)  # for transfers
    timestamp = models.DateTimeField(default=timezone.now)