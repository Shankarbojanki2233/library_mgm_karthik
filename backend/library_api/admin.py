from django.contrib import admin
from .models import Book, Category, LibraryUser, Transaction


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'description', 'created_at']
    search_fields = ['name', 'code', 'description']
    list_filter = ['created_at']


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'year', 'copies', 'available', 'rating']
    search_fields = ['title', 'author', 'isbn']
    list_filter = ['category', 'year', 'rating']
    list_editable = ['copies', 'available']


@admin.register(LibraryUser)
class LibraryUserAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'role', 'department', 'fines', 'is_active']
    search_fields = ['name', 'email', 'student_id', 'employee_id']
    list_filter = ['role', 'department', 'is_active']
    list_editable = ['fines', 'is_active']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'book', 'type', 'borrow_date', 'due_date', 'status', 'fine_amount']
    search_fields = ['user__name', 'book__title']
    list_filter = ['type', 'status', 'borrow_date']
    date_hierarchy = 'borrow_date'