from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Time
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database URL from .env file
DATABASE_URL = os.getenv("DATABASE_URL")

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL, echo=True)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# ==================== MODELS ====================


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    roll_number = Column(String(50), unique=True, nullable=False, index=True)
    department = Column(String(100), nullable=False)
    face_encoding = Column(Text, nullable=True)  # Store as JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    attendances = relationship("Attendance", back_populates="student")
    student_courses = relationship("StudentCourse", back_populates="student")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    course_name = Column(String(100), nullable=False)
    course_code = Column(String(20), unique=True, nullable=False)
    instructor = Column(String(100), nullable=True)
    start_time = Column(Time, nullable=True)  # Attendance window start
    end_time = Column(Time, nullable=True)    # Attendance window end
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    attendances = relationship("Attendance", back_populates="course")
    student_courses = relationship("StudentCourse", back_populates="course")


class StudentCourse(Base):
    """Junction table for many-to-many relationship between Student and Course"""
    __tablename__ = "student_courses"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    enrolled_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student = relationship("Student", back_populates="student_courses")
    course = relationship("Course", back_populates="student_courses")


class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default="present")  # present, absent, late
    marked_at = Column(DateTime, default=datetime.utcnow)
    # Face recognition confidence
    confidence_score = Column(Integer, nullable=True)

    # Relationships
    student = relationship("Student", back_populates="attendances")
    course = relationship("Course", back_populates="attendances")


# ==================== DATABASE FUNCTIONS ====================

def get_db():
    """Dependency for FastAPI to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables in the database"""
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created successfully!")


def drop_tables():
    """Drop all tables (use with caution!)"""
    Base.metadata.drop_all(bind=engine)
    print("⚠️ All tables dropped!")


def seed_courses():
    """Add some default courses to the database"""
    db = SessionLocal()
    try:
        # Check if courses already exist
        existing = db.query(Course).first()
        if existing:
            print("Courses already exist, skipping seed...")
            return

        courses = [
            Course(
                course_name="Data Structures and Algorithms",
                course_code="CS201",
                instructor="Dr. Ahmed Khan",
                start_time="09:00:00",
                end_time="09:15:00"
            ),
            Course(
                course_name="Database Management Systems",
                course_code="CS301",
                instructor="Prof. Sarah Ali",
                start_time="11:00:00",
                end_time="11:15:00"
            ),
            Course(
                course_name="Machine Learning",
                course_code="CS401",
                instructor="Dr. Fatima Malik",
                start_time="14:00:00",
                end_time="14:15:00"
            ),
            Course(
                course_name="Web Development",
                course_code="CS302",
                instructor="Mr. Hassan Raza",
                start_time="10:00:00",
                end_time="10:15:00"
            )
        ]

        db.add_all(courses)
        db.commit()
        print("✅ Default courses added successfully!")

    except Exception as e:
        print(f"❌ Error seeding courses: {e}")
        db.rollback()
    finally:
        db.close()


# ==================== MAIN EXECUTION ====================

if __name__ == "__main__":
    print("🚀 Setting up database...")
    print(
        f"📍 Database URL: {DATABASE_URL[:30]}..." if DATABASE_URL else "❌ No DATABASE_URL found!")

    # Create all tables
    create_tables()

    # Seed default courses
    seed_courses()

    print("\n✨ Database setup complete!")
