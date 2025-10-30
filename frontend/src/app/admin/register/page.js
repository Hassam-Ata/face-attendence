"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import WebcamCapture from "@/components/attendance/WebcamCapture";
import { registerStudent, getAllCourses } from "@/lib/api";

export default function RegisterStudentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    roll_number: "",
    department: "",
    course_ids: [],
  });
  const [capturedImage, setCapturedImage] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await getAllCourses();
      setCourses(data.courses || []);
    } catch (err) {
      setError("Failed to load courses");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCourseToggle = (courseId) => {
    setFormData((prev) => ({
      ...prev,
      course_ids: prev.course_ids.includes(courseId)
        ? prev.course_ids.filter((id) => id !== courseId)
        : [...prev.course_ids, courseId],
    }));
  };

  const handleImageCapture = (imageSrc) => {
    setCapturedImage(imageSrc);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!formData.name || !formData.roll_number || !formData.department) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.course_ids.length === 0) {
      setError("Please select at least one course");
      return;
    }

    if (!capturedImage) {
      setError("Please capture a face image");
      return;
    }

    setLoading(true);

    try {
      const response = await registerStudent({
        ...formData,
        face_image: capturedImage,
      });

      setSuccess(true);

      // Reset form after 2 seconds
      setTimeout(() => {
        router.push("/admin");
      }, 2000);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                Registration Successful!
              </h2>
              <p className="mb-4">
                Student has been registered successfully. Redirecting to
                dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-4 py-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold  mb-2">Register New Student</h1>
          <p>Add a new student with face recognition</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
              <CardDescription>
                Enter the student's basic details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roll_number">Roll Number *</Label>
                  <Input
                    id="roll_number"
                    name="roll_number"
                    placeholder="CS2024001"
                    value={formData.roll_number}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  name="department"
                  placeholder="Computer Science"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Course Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Courses</CardTitle>
              <CardDescription>
                Choose the courses this student is enrolled in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.course_ids.includes(course.id)
                        ? "border-blue-50"
                        : " hover:border-gray-300"
                    }`}
                    onClick={() => handleCourseToggle(course.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold ">{course.course_code}</p>
                        <p className="text-sm ">{course.course_name}</p>
                        {course.instructor && (
                          <p className="text-xs text-gray-500 mt-1">
                            {course.instructor}
                          </p>
                        )}
                      </div>
                      {formData.course_ids.includes(course.id) && (
                        <CheckCircle className="w-5 h-5 text-blue-500 shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Face Capture */}
          <Card>
            <CardHeader>
              <CardTitle>Capture Face Image</CardTitle>
              <CardDescription>
                Take a clear photo for face recognition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WebcamCapture
                onCapture={handleImageCapture}
                disabled={loading}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="submit"
              size="lg"
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register Student"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.push("/admin")}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
