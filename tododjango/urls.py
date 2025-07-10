
from django.contrib import admin
from django.urls import path
from todo import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("signup/", views.signup, name="signup"),
    path("login/", views.login, name="login"),
    path("logout/", views.logout, name="logout"),

    path("todolist/create/", views.create_todolist, name="create_todolist"),
    path("todolist/all/<int:user_id>/<str:status_type>/", views.get_todolists, name="get_todolist"),
    path("todolist/<int:user_id>/<int:todolist_id>/", views.get_todolist_by_id, name="get_todolist_by_id"),
    path("todolist/<int:user_id>/edit/<int:todolist_id>/", views.update_todolist, name="update_todolist"),
    path("todolist/delete/<int:todolist_id>/", views.delete_todolist, name="delete_todolist"),
    path("todolist/<int:todolist_id>/", views.complete_todolist, name="retrieve_todolists"),

    
]
