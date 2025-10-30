from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date, time as dt_time
import json

from database import get_db, Student, Course, Attendance, StudentCourse
from face_service import face_service
from ml_service import ml_service

# Initialize FastAPI app
app = FastAPI(title="Face Recognition Attendance API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
                   "http://127.0.0.1:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== PYDANTIC MODELS ====================


class StudentRegisterRequest(BaseModel):
    name: str
    roll_number: str
    department: str
    course_ids: List[int]
    face_image: str  # base64 encoded image


class AttendanceMarkRequest(BaseModel):
    course_id: int
    face_image: str  # base64 encoded image


class StudentResponse(BaseModel):
    id: int
    name: str
    roll_number: str
    department: str
    created_at: datetime


class CourseResponse(BaseModel):
    id: int
    course_name: str
    course_code: str
    instructor: Optional[str]


class AttendanceResponse(BaseModel):
    id: int
    student_name: str
    roll_number: str
    course_name: str
    date: datetime
    status: str
    confidence_score: Optional[int]

# ==================== ENDPOINTS ====================


@app.get("/")
def read_root():
    return {
        "message": "Face Recognition Attendance API",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    model_info = ml_service.get_model_info()
    return {
        "status": "healthy",
        "database": "connected",
        "model_trained": model_info['trained'],
        "num_students": model_info['num_students']
    }

# ==================== STUDENT ENDPOINTS ====================


@app.post("/api/students/register")
async def register_student(
    name: str = Form(...),
    roll_number: str = Form(...),
    department: str = Form(...),
    course_ids: str = Form(...),  # JSON string of course IDs
    face_image: str = Form(...),  # base64 encoded
    db: Session = Depends(get_db)
):
    """Register a new student with face encoding"""

    try:
        # Check if roll number already exists
        existing = db.query(Student).filter(
            Student.roll_number == roll_number).first()
        if existing:
            raise HTTPException(
                status_code=400, detail="Roll number already exists")

        # Process face image
        success, image_array = face_service.process_base64_image(face_image)
        if not success:
            raise HTTPException(status_code=400, detail=image_array)

        # Extract face encoding
        success, encoding = face_service.extract_face_encoding(image_array)
        if not success:
            raise HTTPException(status_code=400, detail=encoding)

        # Convert encoding to string for storage
        encoding_string = face_service.encoding_to_string(encoding)

        # Create student
        new_student = Student(
            name=name,
            roll_number=roll_number,
            department=department,
            face_encoding=encoding_string
        )

        db.add(new_student)
        db.flush()  # Get the student ID

        # Parse course IDs and enroll student
        course_id_list = json.loads(course_ids)
        for course_id in course_id_list:
            enrollment = StudentCourse(
                student_id=new_student.id,
                course_id=course_id
            )
            db.add(enrollment)

        db.commit()
        db.refresh(new_student)

        # Retrain the model with new student
        success, message = ml_service.retrain_with_new_student(db)

        return {
            "success": True,
            "message": "Student registered successfully",
            "student": {
                "id": new_student.id,
                "name": new_student.name,
                "roll_number": new_student.roll_number,
                "department": new_student.department
            },
            "model_status": message
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error registering student: {str(e)}")


@app.get("/api/students")
def get_all_students(db: Session = Depends(get_db)):
    """Get all registered students"""
    students = db.query(Student).all()
    return {
        "success": True,
        "count": len(students),
        "students": [
            {
                "id": s.id,
                "name": s.name,
                "roll_number": s.roll_number,
                "department": s.department,
                "has_face_encoding": s.face_encoding is not None
            }
            for s in students
        ]
    }


@app.get("/api/students/search")
def search_student(roll_number: str, db: Session = Depends(get_db)):
    """Search student by roll number"""
    student = db.query(Student).filter(
        Student.roll_number == roll_number).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Get student's courses
    courses = db.query(Course).join(StudentCourse).filter(
        StudentCourse.student_id == student.id
    ).all()

    # Get attendance records
    attendance_records = db.query(Attendance).filter(
        Attendance.student_id == student.id
    ).all()

    return {
        "success": True,
        "student": {
            "id": student.id,
            "name": student.name,
            "roll_number": student.roll_number,
            "department": student.department,
            "courses": [{"id": c.id, "name": c.course_name, "code": c.course_code} for c in courses],
            "total_attendance": len(attendance_records)
        }
    }

# ==================== COURSE ENDPOINTS ====================


@app.get("/api/courses")
def get_all_courses(db: Session = Depends(get_db)):
    """Get all available courses"""
    courses = db.query(Course).all()
    return {
        "success": True,
        "count": len(courses),
        "courses": [
            {
                "id": c.id,
                "course_name": c.course_name,
                "course_code": c.course_code,
                "instructor": c.instructor,
                "start_time": str(c.start_time) if c.start_time else None,
                "end_time": str(c.end_time) if c.end_time else None
            }
            for c in courses
        ]
    }

# ==================== ATTENDANCE ENDPOINTS ====================


@app.post("/api/attendance/mark")
async def mark_attendance(
    course_id: int = Form(...),
    face_image: str = Form(...),
    db: Session = Depends(get_db)
):
    """Mark attendance using face recognition"""

    try:
        # Verify course exists
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        # Process face image
        success, image_array = face_service.process_base64_image(face_image)
        if not success:
            raise HTTPException(status_code=400, detail=image_array)

        # Extract face encoding
        success, encoding = face_service.extract_face_encoding(image_array)
        if not success:
            raise HTTPException(status_code=400, detail=encoding)

        # Predict student
        success, prediction = ml_service.predict_student(encoding)
        if not success:
            raise HTTPException(status_code=400, detail=prediction)

        student_id = prediction['student_id']
        confidence = prediction['confidence']

        # Check confidence threshold
        if confidence < 60:
            raise HTTPException(
                status_code=400,
                detail=f"Low confidence ({confidence}%). Face not recognized clearly."
            )

        # Get student details
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise HTTPException(
                status_code=404, detail="Student not found in database")

        # Check if student is enrolled in this course
        enrollment = db.query(StudentCourse).filter(
            StudentCourse.student_id == student_id,
            StudentCourse.course_id == course_id
        ).first()

        if not enrollment:
            raise HTTPException(
                status_code=403,
                detail=f"{student.name} is not enrolled in {course.course_name}"
            )

        # Check if attendance already marked today
        today = datetime.now().date()
        existing_attendance = db.query(Attendance).filter(
            Attendance.student_id == student_id,
            Attendance.course_id == course_id,
            Attendance.date >= datetime.combine(today, dt_time.min),
            Attendance.date <= datetime.combine(today, dt_time.max)
        ).first()

        if existing_attendance:
            return {
                "success": True,
                "message": "Attendance already marked",
                "student": {
                    "name": student.name,
                    "roll_number": student.roll_number
                },
                "course": course.course_name,
                "status": existing_attendance.status,
                "marked_at": existing_attendance.marked_at
            }

        # Mark attendance
        new_attendance = Attendance(
            student_id=student_id,
            course_id=course_id,
            status="present",
            confidence_score=confidence,
            date=datetime.now(),
            marked_at=datetime.now()
        )

        db.add(new_attendance)
        db.commit()

        return {
            "success": True,
            "message": "Attendance marked successfully",
            "student": {
                "id": student.id,
                "name": student.name,
                "roll_number": student.roll_number,
                "department": student.department
            },
            "course": course.course_name,
            "confidence": confidence,
            "timestamp": new_attendance.marked_at
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error marking attendance: {str(e)}")


@app.get("/api/attendance/today")
def get_today_attendance(db: Session = Depends(get_db)):
    """Get today's attendance summary"""
    today = datetime.now().date()

    attendances = db.query(Attendance).filter(
        Attendance.date >= datetime.combine(today, dt_time.min),
        Attendance.date <= datetime.combine(today, dt_time.max)
    ).all()

    # Group by course
    course_summary = {}
    for att in attendances:
        course = db.query(Course).filter(Course.id == att.course_id).first()
        if course.course_code not in course_summary:
            course_summary[course.course_code] = {
                "course_name": course.course_name,
                "present": 0,
                "total_enrolled": db.query(StudentCourse).filter(
                    StudentCourse.course_id == course.id
                ).count()
            }
        if att.status == "present":
            course_summary[course.course_code]["present"] += 1

    return {
        "success": True,
        "date": str(today),
        "total_present": len(attendances),
        "courses": course_summary
    }


@app.get("/api/attendance/course/{course_id}")
def get_course_attendance(course_id: int, db: Session = Depends(get_db)):
    """Get attendance for a specific course"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    attendances = db.query(Attendance).filter(
        Attendance.course_id == course_id).all()

    records = []
    for att in attendances:
        student = db.query(Student).filter(
            Student.id == att.student_id).first()
        records.append({
            "student_name": student.name,
            "roll_number": student.roll_number,
            "date": att.date,
            "status": att.status,
            "confidence": att.confidence_score
        })

    return {
        "success": True,
        "course": {
            "id": course.id,
            "name": course.course_name,
            "code": course.course_code
        },
        "total_records": len(records),
        "records": records
    }


@app.get("/api/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics"""
    today = datetime.now().date()

    total_students = db.query(Student).count()
    total_courses = db.query(Course).count()

    today_attendance = db.query(Attendance).filter(
        Attendance.date >= datetime.combine(today, dt_time.min),
        Attendance.date <= datetime.combine(today, dt_time.max)
    ).count()

    return {
        "success": True,
        "stats": {
            "total_students": total_students,
            "total_courses": total_courses,
            "today_attendance": today_attendance,
            "model_trained": ml_service.get_model_info()['trained']
        }
    }

# ==================== RUN SERVER ====================


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
