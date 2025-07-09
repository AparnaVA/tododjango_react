"""
URL configuration for tododjango project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from todo import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("signup/", views.signup, name="signup"),
    path("login/", views.login, name="login"),
    path("logout/", views.logout, name="logout"),

    path("todolist/create/", views.create_todolist, name="create_todolist"),
    path("todolist/all/<int:user_id>/", views.get_todolists, name="get_todolist"),
    path("todolist/<int:user_id>/<int:todolist_id>/", views.get_todolist_by_id, name="get_todolist_by_id"),
    path("todolist/<int:user_id>/edit/<int:todolist_id>/", views.update_todolist, name="update_todolist"),
    path("todolist/delete/<int:todolist_id>/", views.delete_todolist, name="delete_todolist"),
]
