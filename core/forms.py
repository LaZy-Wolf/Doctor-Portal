from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.core.exceptions import ValidationError
from .models import UserProfile

class SignUpForm(UserCreationForm):
    firstName = forms.CharField(max_length=100, required=True)
    lastName = forms.CharField(max_length=100, required=True)
    email = forms.EmailField(max_length=254, required=True)
    addressLine1 = forms.CharField(max_length=255, required=True)
    city = forms.CharField(max_length=100, required=True)
    state = forms.CharField(max_length=100, required=True)
    pincode = forms.CharField(max_length=20, required=True)
    profilePicture = forms.ImageField(required=False)
    user_type = forms.ChoiceField(
        choices=UserProfile.USER_TYPES,
        widget=forms.HiddenInput()
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2', 'user_type')  # ✅ user_type added

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise ValidationError("This email is already registered.")
        return email

    def clean(self):
        cleaned_data = super().clean()
        # You can add more custom validation here if needed
        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        user.first_name = self.cleaned_data['firstName']
        user.last_name = self.cleaned_data['lastName']
        
        if commit:
            user.save()
            self.save_m2m()

            UserProfile.objects.create(
                user=user,
                user_type=self.cleaned_data['user_type'],
                first_name=self.cleaned_data['firstName'],
                last_name=self.cleaned_data['lastName'],
                address_line1=self.cleaned_data['addressLine1'],
                city=self.cleaned_data['city'],
                state=self.cleaned_data['state'],
                pincode=self.cleaned_data['pincode'],
                profile_picture=self.cleaned_data.get('profilePicture')
            )
        
        return user
