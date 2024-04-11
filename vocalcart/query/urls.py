from django.urls import path
from .views import CheckAuthView, UserRegister, UserDetails, UserLogin, LogoutView, SearchAmazonView, SearchFlipkartView, RecommendationView,AddToCartView,RetrieveCartView

urlpatterns = [
    path('register/', UserRegister.as_view(), name='register'),
    path('user/', UserDetails.as_view(), name='user-details'),
    path('login/', UserLogin.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('search_query_amazon/', SearchAmazonView.as_view(), name='search_amazon'), 
    path('search_query_flipkart/',SearchFlipkartView.as_view(), name='flipkart_view'),
    #path('search_query_jiomart/',SearchJioMartView.as_view(), name='jiomart_view'),
    path('recommendations/', RecommendationView.as_view(), name='recommendation_view'),
    path('check-auth/', CheckAuthView.as_view(), name='check_auth'),
    path('addtocart/', AddToCartView.as_view(), name='add_to_cart'),
    path('retrievecart/', RetrieveCartView.as_view(), name='retrieve_cart'),
    
]