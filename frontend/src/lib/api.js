import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==================== STUDENT APIs ====================

export const registerStudent = async (studentData) => {
  try {
    const formData = new FormData();
    formData.append("name", studentData.name);
    formData.append("roll_number", studentData.roll_number);
    formData.append("department", studentData.department);
    formData.append("course_ids", JSON.stringify(studentData.course_ids));
    formData.append("face_image", studentData.face_image);

    const response = await axios.post(
      `${API_BASE_URL}/api/students/register`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to register student";
  }
};

export const getAllStudents = async () => {
  try {
    const response = await api.get("/api/students");
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to fetch students";
  }
};

export const searchStudent = async (rollNumber) => {
  try {
    const response = await api.get(
      `/api/students/search?roll_number=${rollNumber}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Student not found";
  }
};

// ==================== COURSE APIs ====================

export const getAllCourses = async () => {
  try {
    const response = await api.get("/api/courses");
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to fetch courses";
  }
};

// ==================== ATTENDANCE APIs ====================

export const markAttendance = async (courseId, faceImage) => {
  try {
    const formData = new FormData();
    formData.append("course_id", courseId);
    formData.append("face_image", faceImage);

    const response = await axios.post(
      `${API_BASE_URL}/api/attendance/mark`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to mark attendance";
  }
};

export const getTodayAttendance = async () => {
  try {
    const response = await api.get("/api/attendance/today");
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to fetch attendance";
  }
};

export const getCourseAttendance = async (courseId) => {
  try {
    const response = await api.get(`/api/attendance/course/${courseId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to fetch course attendance";
  }
};

// ==================== DASHBOARD APIs ====================

export const getDashboardStats = async () => {
  try {
    const response = await api.get("/api/dashboard/stats");
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to fetch dashboard stats";
  }
};

export const healthCheck = async () => {
  try {
    const response = await api.get("/health");
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Backend not responding";
  }
};

export default api;
