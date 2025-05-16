from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    USER_TYPES = (
        ('doctor', 'Doctor'),
        ('patient', 'Patient'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    user_type = models.CharField(max_length=10, choices=USER_TYPES)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    address_line1 = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} ({self.user_type})"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def get_full_address(self):
        return f"{self.address_line1}, {self.city}, {self.state} - {self.pincode}"