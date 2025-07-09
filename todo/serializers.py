#add serialization for TodoList model
from rest_framework import serializers
from .models import TodoList
class TodoListSerializer(serializers.ModelSerializer):
    class Meta:
        model = TodoList
        fields = ['id', 'name', 'date', 'is_completed']
        read_only_fields = ['id', 'is_completed']  # id and is_completed are read-only
    def create(self, validated_data):
        """
        Create and return a new `TodoList` instance, given the validated data.
        """
        return TodoList.objects.create(**validated_data)
    def update(self, instance, validated_data):
        """
        Update and return an existing `TodoList` instance, given the validated data.
        """
        instance.name = validated_data.get('name', instance.name)
        instance.date = validated_data.get('date', instance.date)
        instance.is_completed = validated_data.get('is_completed', instance.is_completed)
        instance.save()
        return instance