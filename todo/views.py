import json
from numpy import ceil
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
from rest_framework.permissions import IsAdminUser
from django.utils.dateparse import parse_date
from django.contrib.auth.models import User
from django.db.models import Count, Sum

from todo.models import TodoList, UserReport
from todo.serializers import TodoListSerializer

from django.shortcuts import get_object_or_404
from django.http import JsonResponse

@api_view(['POST'])
@permission_classes((AllowAny,))
def signup(request):
    form = UserCreationForm(data=request.data)
    if form.is_valid():
        user = form.save()
        UserReport.objects.get_or_create(user=user)
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
    return Response({'token': token.key,'user_id': user.id, 'is_admin':user.is_staff},status=HTTP_200_OK)


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
    
    # Update report
    report, _ = UserReport.objects.get_or_create(user=request.user)
    report.tasks_created += 1
    report.save()

    return Response({'message': 'TodoList created successfully'}, status=HTTP_201_CREATED)


#add function to get all todolists for specific User with userid with 4 items per page
@api_view(["GET"])
@permission_classes((IsAuthenticated,))
def get_todolists(request, user_id, status_type):
    user = request.user
    if not user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=HTTP_401_UNAUTHORIZED)
    
    search_query = request.GET.get('search', '')
    # need to filter based on all,pending and complete_todolist
    todolists = TodoList.objects.filter(user_id=user_id).order_by('-date')
    if status_type == 'pending':
        todolists = todolists.filter(is_completed=False)
    elif status_type == 'completed':
        todolists = todolists.filter(is_completed=True)
    if not todolists:
        return Response({'error': 'No TodoLists found for this user'}, status=HTTP_404_NOT_FOUND)
    
    if search_query:
        todolists = todolists.filter(name__icontains=search_query)

    paginator = PageNumberPagination()
    paginator.page_size = 4
    result_page = paginator.paginate_queryset(todolists, request)
    serializer = TodoListSerializer(result_page, many=True)
    total_items = todolists.count()
    total_pages = ceil(total_items / paginator.page_size)
    return Response({
        'count': total_items,
        'total_pages': total_pages,
        'next': paginator.get_next_link(),
        'previous': paginator.get_previous_link(),
        'results': serializer.data
    })


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
    
     # Update report
    report, _ = UserReport.objects.get_or_create(user=request.user)
    report.tasks_deleted += 1
    report.save()
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

    # Expecting 'completed' field from frontend
    completed = request.data.get('completed')
    if completed is None:
        return Response({'error': 'Missing "completed" field in request body'}, status=HTTP_400_BAD_REQUEST)

    todolist.is_completed = completed
    todolist.save()
    
    report, _ = UserReport.objects.get_or_create(user=request.user)
    report.tasks_completed += 1
    report.save()

    status_message = "marked as complete" if completed else "unmarked as complete"
    return Response({'message': f'TodoList {status_message}'}, status=HTTP_200_OK)


@api_view(["POST"])
@permission_classes((IsAuthenticated,))
def import_todolist(request, user_id):
    try:
        data = request.data  # Automatically parsed by DRF
        for item in data:
            TodoList.objects.create(
                user_id=user_id,
                name=item['name'],
                date=item['date'],
                is_completed=item.get('is_completed', False)
            )
            
        report, _ = UserReport.objects.get_or_create(user=request.user)
        report.tasks_imported += 1
        report.save()
        return Response({'status': 'success'}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=400)
    
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def track_export(request):
    try:
        report, _ = UserReport.objects.get_or_create(user=request.user)
        report.tasks_exported += 1
        report.save()
        return Response({'message': 'Export tracked'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    
    
@api_view(['GET'])
@permission_classes([IsAdminUser])  # Only admins can access
def admin_reports(request):
    
    # Filter users by date joined (optional date filter)
    users_qs = User.objects.all()
    
    users_by_date = list(users_qs.values('id', 'username', 'date_joined'))

    # Aggregate reports from UserReport table (tracks counts)
    # Fallback: If you haven't wired counters yet, you can sum from TodoList, but here we'll use UserReport.
    most_created = list(
        UserReport.objects.values('user__id', 'user__username')
        .annotate(total=Sum('tasks_created'))
        .order_by('-total')[:5]
    )
    most_deleted = list(
        UserReport.objects.values('user__id', 'user__username')
        .annotate(total=Sum('tasks_deleted'))
        .order_by('-total')[:5]
    )
    most_imported = list(
        UserReport.objects.values('user__id', 'user__username')
        .annotate(total=Sum('tasks_imported'))
        .order_by('-total')[:5]
    )
    most_exported = list(
        UserReport.objects.values('user__id', 'user__username')
        .annotate(total=Sum('tasks_exported'))
        .order_by('-total')[:5]
    )


    return Response({
        "users_by_date": users_by_date,
        "most_created": most_created,
        "most_deleted": most_deleted,
        "most_imported": most_imported,
        "most_exported": most_exported
    }, status=status.HTTP_200_OK)
    
def user_tasks(request, user_id):
    user = get_object_or_404(User, id=user_id)
    tasks = TodoList.objects.filter(user=user).values('id', 'name', 'is_completed', 'date')
    return JsonResponse(list(tasks), safe=False)