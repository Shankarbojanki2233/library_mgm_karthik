#!/bin/bash

echo "🚀 Starting Django Library Management API Server..."

# Navigate to backend directory
cd "$(dirname "$0")"

# Install dependencies (if needed)
echo "📦 Installing Python dependencies..."
python -m pip install -r requirements.txt

# Run migrations
echo "🗄️ Setting up database..."
python manage.py makemigrations
python manage.py migrate

# Create superuser if needed
echo "👤 Setting up admin user..."
python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@library.com', 'admin123')
    print('✅ Admin user created: admin/admin123')
else:
    print('ℹ️ Admin user already exists')
"

# Load initial data
echo "📚 Loading initial library data..."
python manage.py shell -c "
from library_api.models import Category, LibraryUser
from datetime import date

# Create categories
categories_data = [
    {'name': 'Computer Science', 'code': 'CS', 'description': 'Books related to computer science and information technology', 'sub_categories': ['Programming', 'Database', 'Security', 'AI/ML', 'Web Development']},
    {'name': 'Mathematics', 'code': 'MATH', 'description': 'Mathematical concepts and applications for engineering', 'sub_categories': ['Engineering Math', 'Statistics', 'Discrete Math', 'Calculus']},
    {'name': 'Electronics', 'code': 'ECE', 'description': 'Electronic engineering and communication technologies', 'sub_categories': ['Digital Systems', 'Analog Circuits', 'Communication', 'Control Systems']},
]

for cat_data in categories_data:
    category, created = Category.objects.get_or_create(
        name=cat_data['name'],
        defaults=cat_data
    )
    if created:
        print(f'✅ Created category: {category.name}')

# Create sample users
users_data = [
    {'name': 'Priya Sharma', 'email': 'priya.sharma@sanketika.edu', 'student_id': 'SPT2023001', 'department': 'Computer Science', 'year': 2, 'role': 'student', 'join_date': date(2023, 1, 15), 'phone': '+91-9876543210', 'address': '123 College Road, Bangalore'},
    {'name': 'Dr. Anita Gupta', 'email': 'anita.gupta@sanketika.edu', 'employee_id': 'EMP001', 'department': 'Library', 'role': 'admin', 'join_date': date(2020, 1, 10), 'phone': '+91-9876543212', 'address': '789 Faculty Housing, Bangalore'}
]

for user_data in users_data:
    user, created = LibraryUser.objects.get_or_create(
        email=user_data['email'],
        defaults=user_data
    )
    if created:
        print(f'✅ Created user: {user.name}')

print('✅ Initial data loaded successfully!')
"

echo ""
echo "🌐 Starting Django development server..."
echo "📖 API Documentation: http://localhost:8000/api/"
echo "🔧 Admin Panel: http://localhost:8000/admin/ (admin/admin123)"
echo ""
echo "📋 Available API Endpoints:"
echo "  📚 Books: http://localhost:8000/api/books/"
echo "  🏷️ Categories: http://localhost:8000/api/categories/"
echo "  👥 Users: http://localhost:8000/api/users/"
echo "  📊 Transactions: http://localhost:8000/api/transactions/"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start the Django server
python manage.py runserver 0.0.0.0:8000