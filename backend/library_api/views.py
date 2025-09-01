from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Book, Category, LibraryUser, Transaction
from .serializers import (
    BookSerializer, CategorySerializer, LibraryUserSerializer, 
    TransactionSerializer, BookListSerializer, UserListSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    def get_queryset(self):
        queryset = Category.objects.all()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search) |
                Q(code__icontains=search)
            )
        return queryset

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get category statistics"""
        categories_with_stats = []
        for category in self.get_queryset():
            books_count = category.books.count()
            borrowed_count = sum(book.copies - book.available for book in category.books.all())
            available_count = sum(book.available for book in category.books.all())
            
            categories_with_stats.append({
                'id': category.id,
                'name': category.name,
                'code': category.code,
                'description': category.description,
                'sub_categories': category.sub_categories,
                'total_books': books_count,
                'borrowed_books': borrowed_count,
                'available_books': available_count
            })
        
        return Response(categories_with_stats)


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.select_related('category').all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BookListSerializer
        return BookSerializer
    
    def get_queryset(self):
        queryset = Book.objects.select_related('category').all()
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(author__icontains=search) |
                Q(tags__icontains=search)
            )
        
        # Category filter
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__name=category)
        
        # Availability filter
        available_only = self.request.query_params.get('available_only', None)
        if available_only == 'true':
            queryset = queryset.filter(available__gt=0)
        
        # Sorting
        sort_by = self.request.query_params.get('sort_by', 'title')
        if sort_by in ['title', 'author', 'year', 'rating', 'popularity']:
            if sort_by == 'year':
                queryset = queryset.order_by('-year')
            elif sort_by in ['rating', 'popularity']:
                queryset = queryset.order_by(f'-{sort_by}')
            else:
                queryset = queryset.order_by(sort_by)
        
        return queryset

    @action(detail=True, methods=['post'])
    def borrow(self, request, pk=None):
        """Borrow a book"""
        book = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({'error': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = LibraryUser.objects.get(id=user_id)
        except LibraryUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if book.available <= 0:
            return Response({'error': 'Book not available'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create transaction
        from datetime import date, timedelta
        borrow_date = date.today()
        due_date = borrow_date + timedelta(days=15)
        
        transaction = Transaction.objects.create(
            user=user,
            book=book,
            type='borrow',
            borrow_date=borrow_date,
            due_date=due_date,
            status='borrowed'
        )
        
        # Update book availability
        book.available -= 1
        book.save()
        
        return Response({
            'message': 'Book borrowed successfully',
            'transaction_id': transaction.id,
            'due_date': due_date
        })

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get popular books"""
        popular_books = self.get_queryset().order_by('-popularity')[:10]
        serializer = self.get_serializer(popular_books, many=True)
        return Response(serializer.data)


class LibraryUserViewSet(viewsets.ModelViewSet):
    queryset = LibraryUser.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        return LibraryUserSerializer
    
    def get_queryset(self):
        queryset = LibraryUser.objects.all()
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(email__icontains=search) |
                Q(student_id__icontains=search) |
                Q(employee_id__icontains=search)
            )
        
        # Role filter
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(role=role)
        
        # Active filter
        active_only = self.request.query_params.get('active_only', None)
        if active_only == 'true':
            queryset = queryset.filter(is_active=True)
        
        return queryset

    @action(detail=True, methods=['get'])
    def borrowed_books(self, request, pk=None):
        """Get user's borrowed books"""
        user = self.get_object()
        transactions = Transaction.objects.filter(
            user=user, 
            status__in=['borrowed', 'overdue']
        ).select_related('book')
        
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def pay_fine(self, request, pk=None):
        """Pay user's fine"""
        user = self.get_object()
        amount = request.data.get('amount', 0)
        
        if amount <= 0:
            return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)
        
        if user.fines < amount:
            return Response({'error': 'Amount exceeds fine balance'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.fines -= amount
        user.save()
        
        return Response({
            'message': f'Fine of ₹{amount} paid successfully',
            'remaining_fine': user.fines
        })


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.select_related('user', 'book').all()
    serializer_class = TransactionSerializer
    
    def get_queryset(self):
        queryset = Transaction.objects.select_related('user', 'book').all()
        
        # User filter
        user_id = self.request.query_params.get('user_id', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Status filter
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Date range filter
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(borrow_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(borrow_date__lte=end_date)
        
        return queryset

    @action(detail=True, methods=['post'])
    def return_book(self, request, pk=None):
        """Return a borrowed book"""
        transaction = self.get_object()
        
        if transaction.status == 'returned':
            return Response({'error': 'Book already returned'}, status=status.HTTP_400_BAD_REQUEST)
        
        from datetime import date
        return_date = date.today()
        
        # Calculate fine if overdue
        fine = 0
        if return_date > transaction.due_date:
            overdue_days = (return_date - transaction.due_date).days
            fine = overdue_days * 1  # ₹1 per day
        
        # Update transaction
        transaction.return_date = return_date
        transaction.status = 'returned'
        transaction.fine_amount = fine
        transaction.save()
        
        # Update book availability
        book = transaction.book
        book.available += 1
        book.save()
        
        # Add fine to user if applicable
        if fine > 0:
            user = transaction.user
            user.fines += fine
            user.save()
        
        return Response({
            'message': 'Book returned successfully',
            'fine_amount': fine,
            'return_date': return_date
        })

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue transactions"""
        from datetime import date
        overdue_transactions = self.get_queryset().filter(
            due_date__lt=date.today(),
            status='borrowed'
        )
        
        # Update status to overdue
        overdue_transactions.update(status='overdue')
        
        serializer = self.get_serializer(overdue_transactions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get transaction analytics"""
        from django.db.models import Count, Sum
        from datetime import date, timedelta
        
        # Basic stats
        total_transactions = self.get_queryset().count()
        borrowed_count = self.get_queryset().filter(status='borrowed').count()
        overdue_count = self.get_queryset().filter(status='overdue').count()
        total_fines = self.get_queryset().aggregate(Sum('fine_amount'))['fine_amount__sum'] or 0
        
        # Popular books
        popular_books = (
            self.get_queryset()
            .values('book__title', 'book__author')
            .annotate(borrow_count=Count('id'))
            .order_by('-borrow_count')[:10]
        )
        
        # Recent activity (last 30 days)
        thirty_days_ago = date.today() - timedelta(days=30)
        recent_activity = (
            self.get_queryset()
            .filter(borrow_date__gte=thirty_days_ago)
            .values('borrow_date')
            .annotate(count=Count('id'))
            .order_by('borrow_date')
        )
        
        return Response({
            'total_transactions': total_transactions,
            'borrowed_count': borrowed_count,
            'overdue_count': overdue_count,
            'total_fines': total_fines,
            'popular_books': popular_books,
            'recent_activity': list(recent_activity)
        })