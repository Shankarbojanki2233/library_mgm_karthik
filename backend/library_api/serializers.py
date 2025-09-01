from rest_framework import serializers
from .models import Book, Category, LibraryUser, Transaction


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class BookSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Book
        fields = '__all__'

    def create(self, validated_data):
        # Set available copies equal to total copies for new books
        validated_data['available'] = validated_data.get('copies', 1)
        return super().create(validated_data)


class LibraryUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = LibraryUser
        fields = '__all__'


class TransactionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_author = serializers.CharField(source='book.author', read_only=True)
    
    class Meta:
        model = Transaction
        fields = '__all__'


class BookListSerializer(serializers.ModelSerializer):
    """Simplified serializer for book listings"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'category', 'category_name', 
            'sub_category', 'year', 'copies', 'available', 'rating', 
            'popularity', 'tags', 'description', 'location'
        ]


class UserListSerializer(serializers.ModelSerializer):
    """Simplified serializer for user listings"""
    
    class Meta:
        model = LibraryUser
        fields = [
            'id', 'name', 'email', 'student_id', 'employee_id', 
            'department', 'year', 'role', 'fines', 'is_active'
        ]