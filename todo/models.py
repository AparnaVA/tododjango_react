#add a model for saving todolist with name and date input from specific User the users can make a todo complete and pending

from django.db import models
from django.contrib.auth.models import User
class TodoList(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='todolists')
    name = models.CharField(max_length=255)
    date = models.DateField()
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - {self.user.username} - {'Completed' if self.is_completed else 'Pending'}"
    
    class Meta:
        ordering = ['-date']  # Order by date descending
        verbose_name = 'Todo List'
        verbose_name_plural = 'Todo Lists'
# This model allows users to create todo lists with a name, date, and completion status.
# The `user` field links the todo list to a specific user, and the `is_completed` field tracks the completion status.
# You can use this model in your views to create, update, and retrieve todo lists for users.