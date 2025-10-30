"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import WebcamCapture from "@/components/attendance/WebcamCapture";
import { markAttendance, getAllCourses } from "@/lib/api";

export default function MarkAttendancePage() {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
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

  const handleImageCapture = (imageSrc) => {
    setCapturedImage(imageSrc);
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess(null);

    if (!selectedCourse) {
      setError("Please select a course");
      return;
    }

    if (!capturedImage) {
      setError("Please capture your face image");
      return;
    }

    setLoading(true);

    try {
      const response = await markAttendance(selectedCourse, capturedImage);
      setSuccess(response);
      setCapturedImage(null);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAnother = () => {
    setSuccess(null);
    setError("");
    setSelectedCourse("");
    setCapturedImage(null);
  };

  if (success) {
    return (
      <div className="min-h-screen  flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>

              <h2 className="text-3xl font-bold  mb-2">
                Attendance Marked Successfully!
              </h2>

              <div className="rounded-lg p-6 my-6 text-left">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Student Name:</span>
                    <span className="font-semibold ">
                      {success.student.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="">Roll Number:</span>
                    <span className="font-semibold ">
                      {success.student.roll_number}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Department:</span>
                    <span className="font-semibold ">
                      {success.student.department}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Course:</span>
                    <span className="font-semibold ">{success.course}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Confidence:</span>
                    <span className="font-semibold ">
                      {success.confidence}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-semibold ">
                      {new Date(success.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Link href="/">
                  <Button variant="outline" size="lg">
                    Go Home
                  </Button>
                </Link>
                <Button onClick={handleMarkAnother} size="lg">
                  Mark Another Attendance
                </Button>
              </div>
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
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <UserCheck className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold ">Mark Attendance</h1>
          </div>
          <p>Select your course and capture your face to mark attendance</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Course Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Course</CardTitle>
              <CardDescription>
                Choose the course you want to mark attendance for
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="course">Course *</Label>
                <Select
                  value={selectedCourse}
                  onValueChange={setSelectedCourse}
                >
                  <SelectTrigger id="course" className="w-full">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {course.course_code}
                          </span>
                          <span className="text-sm ">{course.course_name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCourse && (
                <div className="mt-4 p-4 rounded-lg">
                  {(() => {
                    const course = courses.find(
                      (c) => c.id.toString() === selectedCourse
                    );
                    return course ? (
                      <div className="space-y-2">
                        <p className="font-semibold ">{course.course_name}</p>
                        <p className="text-sm ">
                          Instructor: {course.instructor || "N/A"}
                        </p>
                        {course.start_time && course.end_time && (
                          <p className="text-sm ">
                            Time: {course.start_time} - {course.end_time}
                          </p>
                        )}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Face Capture */}
          {selectedCourse && (
            <Card>
              <CardHeader>
                <CardTitle>Capture Your Face</CardTitle>
                <CardDescription>
                  Position your face clearly in the camera
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WebcamCapture
                  onCapture={handleImageCapture}
                  disabled={loading}
                />
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          {selectedCourse && capturedImage && (
            <Card className="border-2 border-blue-200 ">
              <CardContent className="pt-6">
                <Button
                  onClick={handleSubmit}
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Verifying Face...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Mark My Attendance
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
