# yourappname/views.py
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
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import logout
from django.views import View
from .models import BlacklistedToken 
import requests
from asgiref.sync import sync_to_async
import httpx
from bs4 import BeautifulSoup
from django.http import JsonResponse
import json
from crawlbase import CrawlingAPI
import time
import re


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

class UserLogin(TokenObtainPairView):
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            # Successfully logged in, add additional information if needed
            user = UserModel.objects.get(email=request.data['email'])
            response.data['user_id'] = user.id
            user_serializer = UserSerializer(user)
            refresh = RefreshToken.for_user(user)
            response.data['refresh_token'] = str(refresh)
            response.data['user'] = user_serializer.data

        #print("Response data:", response.data)  # Add this line

        return response
    
class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            refresh_token = request.data.get("token")

            if not refresh_token:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            try:
                # Check if the token is already blacklisted
                if not BlacklistedToken.is_token_blacklisted(refresh_token):
                    # Blacklist the refresh token
                    BlacklistedToken.blacklist_token(refresh_token)

                return Response(status=status.HTTP_200_OK)
            except TokenError as e:
                print(f"TokenError: {e}")
                return Response(status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"Exception: {e}")
            return Response(status=status.HTTP_400_BAD_REQUEST)
 
 
@method_decorator(csrf_exempt, name='dispatch')
class SearchAmazonView(View):
    def post(self, request, *args, **kwargs):
        try:
            # Parse JSON data from the request body
            request_data = json.loads(request.body.decode('utf-8'))

            # Get the search query from the request payload
            search_query = request_data.get('query')

            # Construct the Amazon search URL
            base_url = "https://www.amazon.in"
            search_url = f"{base_url}/s?k={search_query}"
            print("Search Query:", search_query)

            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            }

            max_retries = 100
            retry_delay = 0.000000001

            print(search_url)
            for _ in range(max_retries):
                response = requests.get(search_url, headers=headers)

                if response.status_code == 200:
                    break  # Successful response, exit the loop
                else:
                    print(f"Retrying... Status Code: {response.status_code}")
                    time.sleep(retry_delay)  # Wait for a short duration before retrying

            print(response)
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

            # Return the results as JSON
            print("Results:", products)
            return JsonResponse({'results': products})

        except Exception as e:
            # Handle exceptions and return an error response
            print("Error:", str(e))
            return JsonResponse({'error': str(e)}, status=500)
        
        
        
        
        
@method_decorator(csrf_exempt, name='dispatch')       
class oldSearchFlipkartView(View):
    def post(self, request, *args, **kwargs):
        try:
            # Parse JSON data from the request body
            request_data = json.loads(request.body.decode('utf-8'))

            # Get the search query from the request payload
            search_query = request_data.get('query')

            # Define headers for the request
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            }

            # Call the function to scrape Flipkart search results
            flipkart_results = self.scrape_flipkart_search_results(search_query, headers)
            print(flipkart_results)

            # Return the results as JSON
            return JsonResponse({'results': flipkart_results})

        except Exception as e:
            # Handle exceptions and return an error response
            print("Error:", str(e))
            return JsonResponse({'error': str(e)}, status=500)

    def scrape_flipkart_search_results(self, search_query, headers):
        product_titles = []
        product_prices = []
        product_images = []
        product_ratings = []

        url = f"https://www.flipkart.com/search?q={search_query}"
        page = requests.get(url, headers=headers)
        soup = BeautifulSoup(page.content, 'html.parser')

        results = soup.select('._1AtVbE')  # Adjust the selector based on the Flipkart HTML structure

        for result in results:
            title = result.select_one('._4rR01T')
            price = result.select_one('._30jeq3._1_WHN1')  # Corrected selector
            image = result.select_one('._396cs4')
            rating = result.select_one('._1lRcqv')  # Selector for star rating

            if title and price and image and rating:
                product_titles.append(title.text.strip())
                product_prices.append(price.text.strip())
                product_images.append(image['src'] if 'src' in image.attrs else image['data-src'])
                product_ratings.append(rating.text.strip())

        # Create a list of dictionaries for each product
        flipkart_results = [
            {
                'title': title,
                'price': price,
                'image_url': image_url,
                'rating': rating
            }
            for title, price, image_url, rating in zip(product_titles, product_prices, product_images, product_ratings)
        ]

        return flipkart_results
    
    
    
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
