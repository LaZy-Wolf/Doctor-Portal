from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from .models import UserProfile
from .forms import SignUpForm

def index(request):
    """Render the main page with user type selection."""
    if request.user.is_authenticated:
        # Redirect to appropriate dashboard if already logged in
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.user_type == 'doctor':
            return redirect('doctor_dashboard')
        else:
            return redirect('patient_dashboard')
    return render(request, 'index.html')

def signin(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user_type = request.POST.get('user_type')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            user_profile = UserProfile.objects.get(user=user)
            if user_profile.user_type == user_type:
                login(request, user)
                if user_type == 'doctor':
                    return redirect('doctor_dashboard')
                return redirect('patient_dashboard')
            messages.error(request, f"Account is for {user_profile.user_type}, not {user_type}")
        else:
            messages.error(request, "Invalid username or password")
    
    return redirect('index')

def signup(request):
    """Handle user registration."""
    print("\n=== SIGNUP STARTED ===")  # Debug
    if request.method == 'POST':
        print("POST data:", request.POST)  # Debug
        print("FILES data:", request.FILES)  # Debug
        
        form = SignUpForm(request.POST, request.FILES)
        if form.is_valid():
            print("Form is valid - saving user")  # Debug
            user = form.save()
            print(f"User created: {user.username}")  # Debug
            
            login(request, user)
            print("User logged in")  # Debug
            print(f"Redirecting to {user.userprofile.user_type}_dashboard")

            
            if form.cleaned_data['user_type'] == 'doctor':
                return redirect('doctor_dashboard')
            return redirect('patient_dashboard')
        else:
            print("Form errors:", form.errors)  # Debug
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field}: {error}")
    
    return redirect('index')

@login_required
def doctor_dashboard(request):
    """Render doctor dashboard."""
    user_profile = UserProfile.objects.get(user=request.user)
    context = {
        'user_profile': user_profile
    }
    return render(request, 'doctor_dashboard.html', context)

@login_required
def patient_dashboard(request):
    """Render patient dashboard."""
    user_profile = UserProfile.objects.get(user=request.user)
    context = {
        'user_profile': user_profile
    }
    return render(request, 'patient_dashboard.html', context)

@login_required
def logout_view(request):
    """Handle user logout."""
    logout(request)
    return redirect('index')

def check_auth(request):
    """API endpoint to check if user is authenticated."""
    if request.user.is_authenticated:
        user_profile = UserProfile.objects.get(user=request.user)
        return JsonResponse({
            'isAuthenticated': True,
            'userType': user_profile.user_type
        })
    return JsonResponse({'isAuthenticated': False})
