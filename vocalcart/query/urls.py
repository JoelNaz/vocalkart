from django.urls import path
from .views import CheckAuthView, UserRegister, UserDetails, UserLogin, LogoutView, SearchAmazonView, SearchFlipkartView

urlpatterns = [
    path('register/', UserRegister.as_view(), name='register'),
    path('user/', UserDetails.as_view(), name='user-details'),
    path('login/', UserLogin.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('search_query_amazon/', SearchAmazonView.as_view(), name='search_amazon'), 
    path('search_query_flipkart/',SearchFlipkartView.as_view(), name='flipkart_view'),
    path('check-auth/', CheckAuthView.as_view(), name='check_auth'),
    
]