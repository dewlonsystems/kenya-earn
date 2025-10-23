from django.contrib import admin
from .models import Profile, Wallet, Task, Payment, Transaction

admin.site.register(Profile)
admin.site.register(Wallet)
admin.site.register(Task)
admin.site.register(Payment)
admin.site.register(Transaction)