from django.contrib import admin
from .models import UserModel, BlacklistedToken, SearchQuery

class UserModelAdmin(admin.ModelAdmin):
    pass

class BlacklistedTokenAdmin(admin.ModelAdmin):
    pass

class SearchQueryAdmin(admin.ModelAdmin):
    list_display = ['user', 'query', 'created_at']  # Customize the display fields as needed

admin.site.register(UserModel, UserModelAdmin)
admin.site.register(BlacklistedToken, BlacklistedTokenAdmin)
admin.site.register(SearchQuery, SearchQueryAdmin)

