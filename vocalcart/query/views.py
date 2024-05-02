# yourappname/views.py
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.utils.decorators import method_decorator
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, UserRegisterSerializer, UserLoginSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth import logout
from django.views import View
from django.contrib.auth.decorators import login_required
from .models import BlacklistedToken ,SearchQuery,CartItem,UserModel
from .models import BlacklistedToken ,SearchQuery,CartItem,UserModel
import requests
from asgiref.sync import sync_to_async
import httpx
from bs4 import BeautifulSoup
from django.http import JsonResponse
import json
from crawlbase import CrawlingAPI
import time
import re
import logging
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from django.db.models import Count
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
import numpy as np
from decimal import Decimal
from .serializers import CartItemSerializer
from django.conf import settings
import razorpay

logger = logging.getLogger(__name__)


UserModel = get_user_model()

class UserRegister(APIView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDetails(APIView):
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class UserLogin(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        # Authenticate user
        user = authenticate(request, email=email, password=password)

        if user is not None:
            # Generate JWT token
            refresh = RefreshToken.for_user(user)
            token = str(refresh.access_token)

            return Response({'token': token}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            refresh_token = request.data.get("token")

            if not refresh_token:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            # Blacklist the refresh token
            BlacklistedToken.blacklist_token(refresh_token)

            return Response({"detail": "Successfully logged out."}, status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            # Log the exception for further investigation
            logger.error(f"Exception during logout: {e}")
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
 
@method_decorator(csrf_exempt, name='dispatch')
class SearchAmazonView(View):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        try:
            token = request.headers.get('Authorization').split(' ')[1]
            #print(token)
            # Parse JSON data from the request body
            request_data = json.loads(request.body.decode('utf-8'))

            # Get the search query from the request payload
            search_query = request_data.get('query')
            user_email = request_data.get('currentUserEmail')
            print(user_email)
            

            print("Search Query:", search_query)  # Print the search query
            if user_email:
            # Find the user based on the provided email
                user = UserModel.objects.get(email=user_email)

                # Save the search query along with the user who made it
                search_query_obj = SearchQuery.objects.create(user=user, query=search_query)
                search_query_obj.save()

            # Construct the Amazon search URL
            base_url = "https://www.amazon.in"
            search_url = f"{base_url}/s?k={search_query}"

            print("Search URL:", search_url)  # Print the constructed search URL

            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            }

            max_retries = 100
            retry_delay = 0.000000001

            for _ in range(max_retries):
                response = requests.get(search_url, headers=headers)

                if response.status_code == 200:
                    break  # Successful response, exit the loop
                else:
                    print(f"Retrying... Status Code: {response.status_code}")
                    time.sleep(retry_delay)  # Wait for a short duration before retrying

            print("Response:", response)  # Print the response object

            products = []

            if response.status_code == 200:
                soup = BeautifulSoup(response.text, "html.parser")

                for result in soup.select(".s-asin"):
                    title = result.select_one(".a-text-normal")
                    price = result.select_one(".a-price .a-offscreen")
                    image = result.select_one("img.s-image")

                    # Extracting star rating
                    rating_element = result.select_one(".a-declarative .a-icon-star-small .a-icon-alt")
                    rating = rating_element.text.strip() if rating_element else "Not available"

                    if title and price and image:
                        product_info = {
                            "title": title.text.strip(),
                            "price": price.text.strip(),
                            "image_url": image["src"] if "src" in image.attrs else image["data-src"],
                            "rating": rating,
                        }
                        products.append(product_info)

            print("Results:", products)  # Print the extracted products

            # Return the results as JSON
            return JsonResponse({'results': products})

        except Exception as e:
            # Handle exceptions and return an error response
            print("Error:", str(e))
            return JsonResponse({'error': str(e)}, status=500)
        


    
    
@method_decorator(csrf_exempt, name='dispatch')       
class SearchFlipkartView(View):
    def post(self, request):
        request_data = json.loads(request.body.decode('utf-8'))

            # Get the search query from the request payload
        search_query = request_data.get('query') # Default query is 'laptop' if not provided in request
        print(search_query)
        url = f"https://www.flipkart.com/search?q={search_query}"
        html_content = self.fetch_page_html(url)

        if html_content:
            products_data = self.extract_products_info(html_content)
            print(products_data)
            return JsonResponse(products_data, safe=False)
        else:
            return JsonResponse({'error': 'Failed to fetch HTML content from the URL.'}, status=500)

    def fetch_page_html(self, url):
        API_TOKEN = '4ifmqrQm7vvcLzgAyRRN5g'
        crawling_api = CrawlingAPI({'token': API_TOKEN})
        response = crawling_api.get(url)
        if response['status_code'] == 200:
            return response['body'].decode('latin1')
        else:
            print(f"Request failed with status code {response['status_code']}: {response['body']}")
            return None

    def extract_products_info(self, html_content):
        soup = BeautifulSoup(html_content, 'html.parser')
        
        titles = []
        ratings = []
        prices = []
        image_urls = []
        product_listings = soup.select('div#container > div:first-child > div:nth-child(3) > div:first-child > div:nth-child(2) div[data-id]')  # Adjust selector as per the webpage structure

        for product in product_listings:
            title_element = product.select_one('a[title]')
            rating_element = product.select_one('span[id^="productRating"] > div')
            price_element = product.select_one('a._8VNy32 > div > div:first-child')
            image_element = product.select_one('img')

            if title_element and rating_element and price_element and image_element:
                titles.append(title_element['title'].strip())
                ratings.append(rating_element.text.strip())
                # Extract price without decoding
                price_str = price_element.text.strip()
                price = re.sub(r'\D', '', price_str)
                prices.append(price)
                image_urls.append(image_element['src'])

        # Combine the data into a list of dictionaries
        products_data = [
            {
                'title': title,
                'rating': rating,
                'price': price,
                'image_url': image_url
            }
            for title, rating, price, image_url in zip(titles, ratings, prices, image_urls)
        ]

        return products_data



class CheckAuthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        token = request.headers.get('Authorization').split(' ')[1]
        print(token)
        if request.user.is_authenticated:
            print("Check Auth User Authenticated")
            
        user = request.user
        user_data = {
            'username': user.username,
            'email': user.email,
            # Add any other user details you want to include
        }
        return Response(user_data, status=status.HTTP_200_OK)
    
    
    
@method_decorator(csrf_exempt, name='dispatch')
class RecommendationView(APIView):
    
    def post(self, request, *args, **kwargs):
        try:
            # Get the user's email from the request data
            user_email = request.data.get('currentUserEmail')
            print("User Email:", user_email)

            # Find the user based on the provided email
            user = UserModel.objects.get(email=user_email)

            # Retrieve past queries for the user
            past_queries = list(SearchQuery.objects.filter(user=user).values_list('query', flat=True))
            print("Past Queries:", past_queries)

            # Perform data preprocessing and feature engineering using TF-IDF
            tfidf_vectorizer = TfidfVectorizer()
            tfidf_matrix = tfidf_vectorizer.fit_transform(past_queries)
            print("TF-IDF Matrix Shape:", tfidf_matrix.shape)

            # Reduce dimensionality using TruncatedSVD
            n_components = min(tfidf_matrix.shape) - 1  # Limit components to the smaller dimension
            svd = TruncatedSVD(n_components=n_components, random_state=42)
            svd_matrix = svd.fit_transform(tfidf_matrix)
            print("SVD Matrix Shape:", svd_matrix.shape)

            
            # Get recommendations based on the SVD-transformed matrix
            query_index = len(past_queries) - 1  # Index of the latest query
            similar_queries_indices = np.argsort(svd_matrix[query_index])[-3:-1]  # Get indices of most similar queries

            # Retrieve the actual queries for the most similar indices
            similar_queries = [past_queries[i] for i in similar_queries_indices]

            # Initialize the recommendations set
            recommendations_set = set()

            # Loop through similar queries to find unique recommendations
            for query in similar_queries:
                if query != past_queries[-1]:  # Exclude the current query
                    recommendations_set.add(query)

            # Convert the set to a list
            recommendations = list(recommendations_set)

            print("Recommendations:", recommendations)

            amazon_results = self.search_amazon(recommendations)
            #flipkart_results = self.search_flipkart(recommendations)

            # Combine results from both platforms
            combined_results = {
                'Amazon': amazon_results,
                #'Flipkart': flipkart_results
            }

            # Return the combined results as JSON
            return JsonResponse(combined_results)

        except Exception as e:
            # Handle exceptions and return an error response
            print("Error:", str(e))
            return JsonResponse({'error': str(e)}, status=500)

    def search_amazon(self, queries):
        base_url = "https://www.amazon.in"
        results = {}
        max_retries = 100
        retry_delay = 0.000000001  # Adjust delay time as needed
        for query in queries:
            search_url = f"{base_url}/s?k={query}"
            for _ in range(max_retries):
                response = requests.get(search_url)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, "html.parser")
                    products = []
                    for result in soup.select(".s-asin"):
                        title = result.select_one(".a-text-normal")
                        price = result.select_one(".a-price .a-offscreen")
                        image = result.select_one("img.s-image")
                        rating_element = result.select_one(".a-declarative .a-icon-star-small .a-icon-alt")
                        rating = rating_element.text.strip() if rating_element else "Not available"
                        if title and price and image:
                            product_info = {
                                "title": title.text.strip(),
                                "price": price.text.strip(),
                                "image_url": image["src"] if "src" in image.attrs else image["data-src"],
                                "rating": rating,
                            }
                            products.append(product_info)
                    results[query] = products
                    break  # Exit the retry loop if successful
                else:
                    print(f"Retrying... Status Code: {response.status_code}")
                    time.sleep(retry_delay)  # Wait before retrying
        return results

    def search_flipkart(self, queries):
        results = {}
        for query in queries:
            url = f"https://www.flipkart.com/search?q={query}"
            html_content = self.fetch_page_html(url)
            if html_content:
                products_data = self.extract_products_info(html_content)
                results[query] = products_data
        return results

    def fetch_page_html(self, url):
        API_TOKEN = '4ifmqrQm7vvcLzgAyRRN5g'
        crawling_api = CrawlingAPI({'token': API_TOKEN})
        response = crawling_api.get(url)
        if response['status_code'] == 200:
            return response['body'].decode('latin1')
        else:
            print(f"Request failed with status code {response['status_code']}: {response['body']}")
            return None

    def extract_products_info(self, html_content):
        soup = BeautifulSoup(html_content, 'html.parser')
        titles = []
        ratings = []
        prices = []
        image_urls = []
        product_listings = soup.select('div#container > div:first-child > div:nth-child(3) > div:first-child > div:nth-child(2) div[data-id]')  # Adjust selector as per the webpage structure
        for product in product_listings:
            title_element = product.select_one('a[title]')
            rating_element = product.select_one('span[id^="productRating"] > div')
            price_element = product.select_one('a._8VNy32 > div > div:first-child')
            image_element = product.select_one('img')
            if title_element and rating_element and price_element and image_element:
                titles.append(title_element['title'].strip())
                ratings.append(rating_element.text.strip())
                price_str = price_element.text.strip()
                price = re.sub(r'\D', '', price_str)
                prices.append(price)
                image_urls.append(image_element['src'])
        products_data = [
            {
                'title': title,
                'rating': rating,
                'price': price,
                'image_url': image_url
            }
            for title, rating, price, image_url in zip(titles, ratings, prices, image_urls)
        ]
        return products_data
    




@method_decorator(csrf_exempt, name='dispatch')
class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            # Extract user information from the token sent in the request header
            token = request.headers.get('Authorization').split(' ')[1]
            # Extract current user's email from the POST data
            request_data = json.loads(request.body.decode('utf-8'))

            current_user_email = request_data.get('current_user_email')

            title = request_data.get('title')
            # Remove currency symbol and comma from price value
            price_str = request_data.get('price').replace('₹', '').replace(',', '')
            # Convert price to Decimal
            price = Decimal(price_str)
            image_url = request_data.get('image_url')
            rating = request_data.get('rating')
            
            if current_user_email:
                # Find the user based on the provided email
                user = UserModel.objects.get(email=current_user_email)
                # Create and save the CartItem
                add_to_cart = CartItem.objects.create(user=user, title=title, image_src=image_url, price=price, rating=rating)
                add_to_cart.save()
                return Response({'message': 'Product added to cart successfully.'}, status=status.HTTP_201_CREATED)
            else:
                return Response({'error': 'Current user email not provided in the request.'}, status=status.HTTP_400_BAD_REQUEST)
        except UserModel.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # Handle exceptions and return an error response
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
@method_decorator(csrf_exempt, name='dispatch')
class CartDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            token = request.headers.get('Authorization').split(' ')[1]
            current_user_email = request.data.get('current_user_email')  # Retrieve user email from POST data

            if current_user_email:
                # Retrieve cart items based on the provided user email
                cart_items = CartItem.objects.filter(user__email=current_user_email)
                serializer = CartItemSerializer(cart_items, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Current user email not provided in the request.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Handle exceptions and return an error response
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

@csrf_exempt
def initiate_payment(request):
    try:
        data = json.loads(request.body) 
        current_user_email = data.get('current_user_email') # Retrieve user email from request data
        print(current_user_email)
        if current_user_email:
            # Retrieve cart items based on the provided user email
            cart_items = CartItem.objects.filter(user__email=current_user_email)
            # Calculate total amount
            total_amount = sum(item.price for item in cart_items) 

            amount=total_amount * 100 # Convert amount to paise
            print("Total Amount in paise:", total_amount)
            currency = 'INR'

            # Concatenate titles of all items for description
            # description = ', '.join(item.title for item in cart_items)
            # print("Description:", description)

            order = client.order.create({'amount': int(amount), 'currency': currency, 'payment_capture': '1'})
            # Ensure that the order object contains the 'id' field for the order ID
            if 'id' in order:
                print("Order ID:", order['id']) 
                return JsonResponse({'order_id': order['id'], 'amount': total_amount})
            else:
                print("Order ID not found in the response from Razorpay")
                return JsonResponse({'error': 'Order ID not found in the response from Razorpay'}, status=500)
        else:
            return JsonResponse({'error': 'Current user email not provided in the request.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)




def handle_payment_callback(request):
    if request.method == 'POST':
        # Handle payment callback from Razorpay
        data = request.POST.dict()
        razorpay_payment_id = data['razorpay_payment_id']
        razorpay_order_id = data['razorpay_order_id']
        signature = data['razorpay_signature']

        # Verify the signature to ensure that the callback is from Razorpay
        # Note: Replace 'YOUR_RAZORPAY_KEY_SECRET' with your actual Razorpay secret key
        expected_signature = razorpay.utils.generate_signature(razorpay_order_id + '|' + razorpay_payment_id, 'SwdEW8CuSL2ulgvBSlvElvfh')
        if signature == expected_signature:
            # Payment is valid, update your database with the payment status
            # For example, you can update the order status to 'paid'
            # Redirect user to appropriate page (success or failure)
            return Response('Payment success!')
        else:
            # Signature verification failed, payment may be tampered with
            # Handle this case accordingly (e.g., log the incident, mark the order as suspicious, etc.)
            return JsonResponse({'error': 'Invalid signature. Payment failed.'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid HTTP method. Only POST requests are allowed.'}, status=405)
    
    
    
    
@csrf_exempt
def delete_item(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        email = data.get('email', None)
        title = data.get('title', None)

        if email is None or title is None:
            return JsonResponse({'message': 'Email and title are required.'}, status=400)

        try:
            # Find the CartItem associated with the provided email and title
            cart_item = CartItem.objects.get(user__email=email, title=title)
            cart_item.delete()
            return JsonResponse({'message': 'Item deleted successfully.'}, status=200)
        except CartItem.DoesNotExist:
            return JsonResponse({'message': 'Item not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500)
        
        
