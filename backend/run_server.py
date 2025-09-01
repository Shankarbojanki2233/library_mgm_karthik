#!/usr/bin/env python
"""
Django development server runner
This script sets up and runs the Django development server
"""
import os
import sys
import subprocess
from pathlib import Path

def main():
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    print("🚀 Starting Django Library Management API Server...")
    print("📍 Backend directory:", backend_dir)
    
    # Set Django settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library_backend.settings')
    
    try:
        # Run migrations first
        print("📦 Running database migrations...")
        subprocess.run([sys.executable, 'manage.py', 'makemigrations'], check=True)
        subprocess.run([sys.executable, 'manage.py', 'migrate'], check=True)
        
        # Create superuser if needed (optional)
        print("👤 Creating admin user (if needed)...")
        subprocess.run([
            sys.executable, 'manage.py', 'shell', '-c',
            """
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@library.com', 'admin123')
    print('✅ Admin user created: admin/admin123')
else:
    print('ℹ️ Admin user already exists')
            """
        ])
        
        # Load initial data
        print("📚 Loading initial library data...")
        subprocess.run([sys.executable, 'manage.py', 'shell', '-c', """
from library_api.models import Category, Book, LibraryUser
import json
from datetime import date

# Create categories
categories_data = [
    {"name": "Computer Science", "code": "CS", "description": "Books related to computer science and information technology", "sub_categories": ["Programming", "Database", "Security", "AI/ML", "Web Development"]},
    {"name": "Mathematics", "code": "MATH", "description": "Mathematical concepts and applications for engineering", "sub_categories": ["Engineering Math", "Statistics", "Discrete Math", "Calculus"]},
    {"name": "Electronics", "code": "ECE", "description": "Electronic engineering and communication technologies", "sub_categories": ["Digital Systems", "Analog Circuits", "Communication", "Control Systems"]},
    {"name": "Mechanical Engineering", "code": "MECH", "description": "Mechanical engineering principles and applications", "sub_categories": ["Design", "Thermodynamics", "Materials", "Manufacturing"]},
    {"name": "Civil Engineering", "code": "CIVIL", "description": "Civil engineering and construction technology", "sub_categories": ["Structures", "Materials", "Surveying", "Environmental"]}
]

for cat_data in categories_data:
    category, created = Category.objects.get_or_create(
        name=cat_data["name"],
        defaults=cat_data
    )
    if created:
        print(f"✅ Created category: {category.name}")

# Create sample users
users_data = [
    {"name": "Priya Sharma", "email": "priya.sharma@sanketika.edu", "student_id": "SPT2023001", "department": "Computer Science", "year": 2, "role": "student", "join_date": date(2023, 1, 15), "phone": "+91-9876543210", "address": "123 College Road, Bangalore"},
    {"name": "Dr. Anita Gupta", "email": "anita.gupta@sanketika.edu", "employee_id": "EMP001", "department": "Library", "role": "admin", "join_date": date(2020, 1, 10), "phone": "+91-9876543212", "address": "789 Faculty Housing, Bangalore"}
]

for user_data in users_data:
    user, created = LibraryUser.objects.get_or_create(
        email=user_data["email"],
        defaults=user_data
    )
    if created:
        print(f"✅ Created user: {user.name}")

print("✅ Initial data loaded successfully!")
        """])
        
        # Start the server
        print("🌐 Starting Django development server on http://localhost:8000")
        print("📖 API Documentation available at: http://localhost:8000/api/")
        print("🔧 Admin panel available at: http://localhost:8000/admin/ (admin/admin123)")
        print("\n📋 Available API Endpoints:")
        print("  📚 Books: http://localhost:8000/api/books/")
        print("  🏷️ Categories: http://localhost:8000/api/categories/")
        print("  👥 Users: http://localhost:8000/api/users/")
        print("  📊 Transactions: http://localhost:8000/api/transactions/")
        print("\n🛑 Press Ctrl+C to stop the server")
        
        subprocess.run([sys.executable, 'manage.py', 'runserver', '0.0.0.0:8000'])
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error running Django command: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()