from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from .models import UserProfile, BlogPost, Category
from .forms import SignUpForm, BlogPostForm
import json
from django.views.decorators.csrf import csrf_exempt
import logging

# Setup logging
logger = logging.getLogger(__name__)

def index(request):
    """Render the main page with user type selection."""
    if request.user.is_authenticated:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.user_type == 'doctor':
            return redirect('doctor_dashboard')
        return redirect('patient_dashboard')
    return render(request, 'index.html', {'active_tab': 'selection'})

def signin(request):
    """Handle user login."""
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user_type = request.POST.get('user_type', 'patient')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            user_profile = UserProfile.objects.get(user=user)
            if user_profile.user_type == user_type:
                login(request, user)
                if user_type == 'doctor':
                    return redirect('doctor_dashboard')
                return redirect('patient_dashboard')
            else:
                messages.error(request, f"Account is for {user_profile.user_type}, not {user_type}")
                return render(request, 'index.html', {
                    'active_tab': 'signin',
                    'user_type': user_type,
                    'username': username
                })
        else:
            messages.error(request, "Invalid username or password")
            return render(request, 'index.html', {
                'active_tab': 'signin',
                'user_type': user_type,
                'username': username
            })
    
    user_type = request.GET.get('user_type', 'patient')
    return render(request, 'index.html', {
        'active_tab': 'signin',
        'user_type': user_type
    })

def signup(request):
    """Handle user registration."""
    if request.method == 'POST':
        form = SignUpForm(request.POST, request.FILES)
        user_type = request.POST.get('user_type', 'patient')
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Account created successfully!')
            if form.cleaned_data['user_type'] == 'doctor':
                return redirect('doctor_dashboard')
            return redirect('patient_dashboard')
        else:
            logger.error('Signup form errors: %s', form.errors.as_json())
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field}: {error}")
            return render(request, 'index.html', {
                'form': form,
                'active_tab': 'signup',
                'user_type': user_type,
                'form_errors': form.errors
            })
    
    user_type = request.GET.get('user_type', 'patient')
    form = SignUpForm(initial={'user_type': user_type})
    return render(request, 'index.html', {
        'form': form,
        'active_tab': 'signup',
        'user_type': user_type
    })

@login_required
def doctor_dashboard(request):
    """Render doctor dashboard."""
    user_profile = UserProfile.objects.get(user=request.user)
    if user_profile.user_type != 'doctor':
        messages.error(request, "Access denied. This page is for doctors only.")
        return redirect('patient_dashboard')
    return render(request, 'doctor_dashboard.html', {
        'user_profile': user_profile
    })

@login_required
def patient_dashboard(request):
    """Render patient dashboard."""
    user_profile = UserProfile.objects.get(user=request.user)
    if user_profile.user_type != 'patient':
        messages.error(request, "Access denied. This page is for patients only.")
        return redirect('doctor_dashboard')
    return render(request, 'patient_dashboard.html', {
        'user_profile': user_profile
    })

@login_required
def create_blog(request):
    """Handle blog post creation."""
    if request.user.userprofile.user_type != 'doctor':
        messages.error(request, "Only doctors can create blog posts.")
        return redirect('patient_dashboard')
    
    if request.method == 'POST':
        form = BlogPostForm(request.POST, request.FILES)
        if form.is_valid():
            blog_post = form.save(commit=False)
            blog_post.author = request.user
            blog_post.save()
            messages.success(request, 'Blog post created successfully!')
            return redirect('view_blogs')
        else:
            messages.error(request, 'Please correct the errors in the form.')
    else:
        form = BlogPostForm()
    
    return render(request, 'create_blog.html', {
        'blog_form': form
    })

@login_required
def view_blogs(request):
    """Display blog posts."""
    user_profile = UserProfile.objects.get(user=request.user)
    if user_profile.user_type == 'doctor':
        blog_posts = BlogPost.objects.filter(author=request.user).order_by('-created_at')
        return render(request, 'view_blogs.html', {
            'blog_posts': blog_posts
        })
    else:
        categories = Category.objects.all()
        blogs_by_category = {
            category: BlogPost.objects.filter(category=category, is_draft=False).order_by('-created_at')
            for category in categories
        }
        return render(request, 'view_blogs.html', {
            'blogs_by_category': blogs_by_category
        })

@login_required
def blog_detail(request, post_id):
    """Display individual blog post."""
    post = get_object_or_404(BlogPost, id=post_id)
    if post.is_draft and post.author != request.user:
        messages.error(request, "You cannot view this draft post.")
        return redirect('view_blogs')
    return render(request, 'blog_detail.html', {
        'post': post
    })

@login_required
def logout_view(request):
    """Handle user logout."""
    logout(request)
    messages.success(request, "You have been logged out.")
    return redirect('index')

@csrf_exempt
def check_auth(request):
    """API endpoint to check authentication status."""
    if request.user.is_authenticated:
        user_profile = UserProfile.objects.get(user=request.user)
        return JsonResponse({
            'isAuthenticated': True,
            'userType': user_profile.user_type
        })
    return JsonResponse({'isAuthenticated': False})

@csrf_exempt
def check_email(request):
    """API endpoint to check if email is already registered."""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            exists = UserProfile.objects.filter(user__email=email).exists()
            return JsonResponse({'exists': exists})
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
    return JsonResponse({'error': 'Invalid request'}, status=400)