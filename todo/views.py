from rest_framework import status
from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from django.contrib.auth.forms import UserCreationForm
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND, HTTP_401_UNAUTHORIZED, HTTP_201_CREATED
from rest_framework.authtoken.models import Token
from django.core.paginator import Paginator
from rest_framework.pagination import PageNumberPagination

from todo.models import TodoList
from todo.serializers import TodoListSerializer

@api_view(['POST'])
@permission_classes((AllowAny,))
def signup(request):
    form = UserCreationForm(data=request.data)
    if form.is_valid():
        user = form.save()
        return Response("account created successfully", status=status.HTTP_201_CREATED)
    return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(["POST"])
@permission_classes((AllowAny,))
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")
    if username is None or password is None:
        return Response({'error': 'Please provide both username and password'},
                        status=HTTP_400_BAD_REQUEST)
    user = authenticate(username=username, password=password)
    if not user:
        return Response({'error': 'Invalid Credentials'},
                        status=HTTP_404_NOT_FOUND)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key,'user_id': user.id},status=HTTP_200_OK)


# add logout function to delete token for specific User
@api_view(["POST"])
@permission_classes((IsAuthenticated,))
def logout(request):
    user = request.user
    if not user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=HTTP_401_UNAUTHORIZED)

    try:
        token = Token.objects.get(user=user)
        token.delete()
        return Response({'message': 'Logged out successfully'}, status=HTTP_200_OK)
    except Token.DoesNotExist:
        return Response({'error': 'Token not found'}, status=HTTP_404_NOT_FOUND)


#add function to create todolist with name and date input from specific User and save it to db
@api_view(["POST"])
@permission_classes((IsAuthenticated,))
def create_todolist(request):
    user = request.user
    if not user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=HTTP_401_UNAUTHORIZED)
    
    name = request.data.get("name")
    date = request.data.get("date")
    
    if not name or not date:
        return Response({'error': 'Name and date are required'}, status=HTTP_400_BAD_REQUEST)
    # Create a new TodoList instance
    todolist = TodoList.objects.create(user=user, name=name, date=date)

    return Response({'message': 'TodoList created successfully'}, status=HTTP_201_CREATED)


#add function to get all todolists for specific User with userid with 4 items per page
@api_view(["GET"])
@permission_classes((IsAuthenticated,))
def get_todolists(request, user_id, status_type):
    user = request.user
    if not user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=HTTP_401_UNAUTHORIZED)
    # need to filter based on all,pending and complete_todolist
    todolists = TodoList.objects.filter(user_id=user_id).order_by('-date')
    if status_type == 'pending':
        todolists = TodoList.objects.filter(user_id=user_id,is_completed=False)
    elif status_type == 'completed':
        todolists = TodoList.objects.filter(user_id=user_id,is_completed=True)
    if not todolists:
        return Response({'error': 'No TodoLists found for this user'}, status=HTTP_404_NOT_FOUND)

    paginator = PageNumberPagination()
    paginator.page_size = 4
    result_page = paginator.paginate_queryset(todolists, request)
    serializer = TodoListSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)


#add function to get todolists for specific User with todolist id
@api_view(["GET"])
@permission_classes((IsAuthenticated,))
def get_todolist_by_id(request, user_id, todolist_id):
    user = request.user
    if not user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=HTTP_401_UNAUTHORIZED)

    try:
        todolist = TodoList.objects.get(id=todolist_id, user_id=user.id)
    except TodoList.DoesNotExist:
        return Response({'error': 'TodoList not found'}, status=HTTP_404_NOT_FOUND)

    serializer = TodoListSerializer(todolist)
    return Response(serializer.data, status=HTTP_200_OK)


#add function to update a todolist with name and date input from specific User
@api_view(["PUT"])
@permission_classes((IsAuthenticated,))
def update_todolist(request,user_id, todolist_id):
    user = request.user
    if not user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=HTTP_401_UNAUTHORIZED)

    try:
        todolist = TodoList.objects.get(id=todolist_id, user_id=user_id)
    except TodoList.DoesNotExist:
        return Response({'error': 'TodoList not found'}, status=HTTP_404_NOT_FOUND)

    name = request.data.get("name")
    date = request.data.get("date")

    if name:
        todolist.name = name
    if date:
        todolist.date = date
    todolist.save()

    return Response({'message': 'TodoList updated successfully'}, status=HTTP_200_OK)


#add function to delete a todolist for specific User
@api_view(["DELETE"])
@permission_classes((IsAuthenticated,))
def delete_todolist(request, todolist_id):
    user = request.user
    if not user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=HTTP_401_UNAUTHORIZED)

    try:
        todolist = TodoList.objects.get(id=todolist_id, user=user)
    except TodoList.DoesNotExist:
        return Response({'error': 'TodoList not found'}, status=HTTP_404_NOT_FOUND)

    todolist.delete()
    return Response({'message': 'TodoList deleted successfully'}, status=HTTP_200_OK)

#add make as complete for tasks
@api_view(["PATCH"])
@permission_classes((IsAuthenticated,))
def complete_todolist(request, todolist_id):
    user = request.user
    if not user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=HTTP_401_UNAUTHORIZED)

    try:
        todolist = TodoList.objects.get(id=todolist_id, user_id=user.id)
    except TodoList.DoesNotExist:
        return Response({'error': 'TodoList not found'}, status=HTTP_404_NOT_FOUND)

    todolist.is_completed = True
    todolist.save()

    return Response({'message': 'TodoList marked as complete'}, status=HTTP_200_OK)