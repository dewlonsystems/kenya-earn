# kenya-earn/backend/core/serializers.py
from rest_framework import serializers
from .models import Profile, Wallet, Task, Payment, Transaction

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            'firebase_uid', 'first_name', 'last_name', 'email',
            'phone_number', 'city', 'address', 'profile_picture',
            'referral_code', 'is_activated', 'theme_preference'
        ]
        read_only_fields = ['firebase_uid', 'referral_code', 'is_activated']

class ProfileCompletionSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    city = serializers.CharField(max_length=100)
    address = serializers.CharField()
    profile_picture = serializers.URLField(required=False, allow_blank=True)
    referral_code = serializers.CharField(max_length=10, required=False, allow_blank=True)

    def validate_phone_number(self, value):
        if not value.startswith('254') or len(value) != 12:
            raise serializers.ValidationError("Phone number must be in format 2547XXXXXXXX")
        return value

    def validate_referral_code(self, value):
        if value:
            from .models import Profile
            try:
                Profile.objects.get(referral_code=value)
            except Profile.DoesNotExist:
                raise serializers.ValidationError("Invalid referral code.")
        return value

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'reward_amount', 'image',
            'posted_by', 'assigned_to', 'status', 'rejection_reason',
            'expires_at', 'created_at'
        ]
        read_only_fields = ['posted_by', 'assigned_to', 'created_at']

class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ['balance']

class TransactionSerializer(serializers.ModelSerializer):
    recipient_name = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'type', 'status', 'recipient', 'recipient_name', 'timestamp', 'description']

    def get_recipient_name(self, obj):
        if obj.recipient:
            return f"{obj.recipient.first_name} {obj.recipient.last_name}"
        return None

class ActivateSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)

    def validate_phone_number(self, value):
        if not value.startswith('254') or len(value) != 12:
            raise serializers.ValidationError("Phone number must be in format 2547XXXXXXXX")
        return value