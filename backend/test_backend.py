"""
Quick test script to verify backend setup
Run this after setting up the database
"""

import sys
import os


def test_imports():
    """Test if all required packages are installed"""
    print("🧪 Testing imports...")

    try:
        import fastapi
        print("✅ FastAPI installed")
    except:
        print("❌ FastAPI not found - run: pip install fastapi")
        return False

    try:
        import cv2
        print("✅ OpenCV installed")
    except:
        print("❌ OpenCV not found - run: pip install opencv-python-headless")
        return False

    try:
        import sklearn
        print("✅ Scikit-learn installed")
    except:
        print("❌ Scikit-learn not found - run: pip install scikit-learn")
        return False

    try:
        import sqlalchemy
        print("✅ SQLAlchemy installed")
    except:
        print("❌ SQLAlchemy not found - run: pip install sqlalchemy")
        return False

    return True


def test_database():
    """Test database connection"""
    print("\n🧪 Testing database connection...")

    try:
        from database import SessionLocal, Student, Course

        db = SessionLocal()

        # Try to query courses
        courses = db.query(Course).all()
        print(f"✅ Database connected - Found {len(courses)} courses")

        # List courses
        if courses:
            print("\n📚 Available courses:")
            for course in courses:
                print(f"   - {course.course_code}: {course.course_name}")

        db.close()
        return True

    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("   Make sure DATABASE_URL is set in .env file")
        return False


def test_face_service():
    """Test face recognition service"""
    print("\n🧪 Testing face recognition service...")

    try:
        from face_service import face_service

        # Check if Haar Cascade loaded
        if face_service.face_cascade.empty():
            print("❌ Haar Cascade failed to load")
            return False

        print("✅ Face recognition service initialized")
        print(f"   Face size: {face_service.face_size}")
        return True

    except Exception as e:
        print(f"❌ Face service failed: {e}")
        return False


def test_ml_service():
    """Test ML service"""
    print("\n🧪 Testing ML service...")

    try:
        from ml_service import ml_service

        info = ml_service.get_model_info()
        print(f"✅ ML service initialized")
        print(f"   Model trained: {info['trained']}")
        print(f"   Number of students: {info['num_students']}")

        if not info['trained']:
            print("   ℹ️  Model will be trained when first student is registered")

        return True

    except Exception as e:
        print(f"❌ ML service failed: {e}")
        return False


def test_env_file():
    """Check if .env file exists"""
    print("\n🧪 Checking environment configuration...")

    if not os.path.exists('.env'):
        print("❌ .env file not found")
        print("   Create .env file with DATABASE_URL")
        return False

    from dotenv import load_dotenv
    load_dotenv()

    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        print("❌ DATABASE_URL not set in .env")
        return False

    print("✅ Environment configuration found")
    return True


def main():
    print("=" * 60)
    print("🚀 BACKEND TESTING SUITE")
    print("=" * 60)

    all_passed = True

    # Run tests
    all_passed &= test_env_file()
    all_passed &= test_imports()
    all_passed &= test_database()
    all_passed &= test_face_service()
    all_passed &= test_ml_service()

    print("\n" + "=" * 60)
    if all_passed:
        print("✅ ALL TESTS PASSED! Backend is ready!")
        print("\n📝 Next steps:")
        print("   1. Run: uvicorn main:app --reload")
        print("   2. Visit: http://localhost:8000/docs")
        print("   3. Test endpoints with Swagger UI")
    else:
        print("❌ SOME TESTS FAILED! Fix the issues above")
    print("=" * 60)


if __name__ == "__main__":
    main()
