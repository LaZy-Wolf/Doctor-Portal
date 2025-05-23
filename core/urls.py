from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('signin/', views.signin, name='signin'),
    path('signup/', views.signup, name='signup'),
    path('doctor/dashboard/', views.doctor_dashboard, name='doctor_dashboard'),
    path('patient/dashboard/', views.patient_dashboard, name='patient_dashboard'),
    path('create-blog/', views.create_blog, name='create_blog'),
    path('view-blogs/', views.view_blogs, name='view_blogs'),
    path('blog/<int:post_id>/', views.blog_detail, name='blog_detail'),
    path('logout/', views.logout_view, name='logout'),
    path('api/check-auth/', views.check_auth, name='check_auth'),
    path('api/check-email/', views.check_email, name='check_email'),
]