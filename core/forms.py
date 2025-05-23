from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import UserProfile, BlogPost, Category
import logging

logger = logging.getLogger(__name__)

class SignUpForm(UserCreationForm):
    first_name = forms.CharField(max_length=30, required=True)
    last_name = forms.CharField(max_length=30, required=True)
    email = forms.EmailField(max_length=254, required=True)
    user_type = forms.ChoiceField(choices=[('patient', 'Patient'), ('doctor', 'Doctor')], required=True)
    profile_picture = forms.ImageField(required=False)
    use_default_picture = forms.BooleanField(required=False, initial=True)
    address_line1 = forms.CharField(max_length=100, required=True)
    city = forms.CharField(max_length=50, required=True)
    state = forms.CharField(max_length=50, required=True)
    pincode = forms.CharField(max_length=10, required=True)

    class Meta:
        model = User
        fields = [
            'username', 'first_name', 'last_name', 'email', 
            'password1', 'password2', 'user_type', 
            'profile_picture', 'use_default_picture', 
            'address_line1', 'city', 'state', 'pincode'
        ]

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            logger.error(f"Email validation failed: {email} already exists")
            raise forms.ValidationError("This email is already registered.")
        return email

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if User.objects.filter(username=username).exists():
            logger.error(f"Username validation failed: {username} already exists")
            raise forms.ValidationError("This username is already taken.")
        return username

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            logger.error("Password mismatch detected")
            self.add_error('password2', "Passwords do not match.")
        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
            profile = UserProfile.objects.create(
                user=user,
                user_type=self.cleaned_data['user_type'],
                address_line1=self.cleaned_data['address_line1'],
                city=self.cleaned_data['city'],
                state=self.cleaned_data['state'],
                pincode=self.cleaned_data['pincode'],
            )
            if not self.cleaned_data['use_default_picture'] and self.cleaned_data['profile_picture']:
                profile.profile_picture = self.cleaned_data['profile_picture']
                profile.save()
        logger.info(f"User {user.username} created successfully")
        return user

class BlogPostForm(forms.ModelForm):
    class Meta:
        model = BlogPost
        fields = ['title', 'category', 'summary', 'content', 'image', 'is_draft']
        widgets = {
            'content': forms.Textarea(attrs={'rows': 10}),
            'summary': forms.Textarea(attrs={'rows': 4}),
        }