# kenya-earn/backend/core/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('profile/complete/', views.complete_profile, name='complete_profile'),
    path('profile/', views.profile_detail, name='profile_detail'),
    path('activate/', views.activate_account, name='activate_account'),
    path('verify-payment/<str:reference>/', views.verify_payment, name='verify_payment'),
    path('webhook/paystack/', views.paystack_webhook, name='paystack_webhook'),
    
    # Optional: keep Daraja callback during transition, then remove
    # path('mpesa/callback/', views.mpesa_callback, name='mpesa_callback'),
    
    path('dashboard/', views.dashboard_data, name='dashboard_data'),
    path('tasks/', views.task_list, name='task_list'),
    path('tasks/<int:task_id>/submit/', views.submit_task, name='submit_task'),
    path('wallet/', views.wallet_data, name='wallet_data'),
    path('wallet/withdraw/', views.withdraw_funds, name='withdraw_funds'),
    path('wallet/transfer/', views.transfer_funds, name='transfer_funds'),
    path('settings/', views.update_settings, name='update_settings'),
    path('account/delete/', views.delete_account, name='delete_account'),
]