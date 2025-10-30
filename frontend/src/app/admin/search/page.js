"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search as SearchIcon,
  User,
  BookOpen,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { searchStudent } from "@/lib/api";

export default function SearchStudentPage() {
  const [rollNumber, setRollNumber] = useState("");
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setStudent(null);

    if (!rollNumber.trim()) {
      setError("Please enter a roll number");
      return;
    }

    setLoading(true);

    try {
      const data = await searchStudent(rollNumber);
      setStudent(data.student);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-4xl font-bold  mb-2">Search Student</h1>
          <p>Find student information by roll number</p>
        </div>

        {/* Search Form */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <Input
                placeholder="Enter roll number (e.g., CS2024001)"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading} className="gap-2">
                <SearchIcon className="w-4 h-4" />
                {loading ? "Searching..." : "Search"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Student Details */}
        {student && (
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm  mb-1">Full Name</p>
                    <p className="text-lg font-semibold">{student.name}</p>
                  </div>
                  <div>
                    <p className="text-sm  mb-1">Roll Number</p>
                    <p className="text-lg font-semibold ">
                      {student.roll_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm  mb-1">Department</p>
                    <p className="text-lg font-semibold ">
                      {student.department}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm  mb-1">Total Attendance</p>
                    <Badge variant="default" className="text-base px-3 py-1">
                      {student.total_attendance} classes
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enrolled Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Enrolled Courses
                </CardTitle>
                <CardDescription>
                  {student.courses.length} course
                  {student.courses.length !== 1 ? "s" : ""} enrolled
                </CardDescription>
              </CardHeader>
              <CardContent>
                {student.courses.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {student.courses.map((course) => (
                      <div
                        key={course.id}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                      >
                        <p className="font-semibold">{course.code}</p>
                        <p className="text-sm ">{course.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className=" text-center py-6">No courses enrolled</p>
                )}
              </CardContent>
            </Card>

            {/* Attendance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Attendance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className=" rounded-lg p-6 text-center">
                  <p className="text-5xl font-bold mb-2">
                    {student.total_attendance}
                  </p>
                  <p className="text-gray-600">Total Classes Attended</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!student && !error && !loading && (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <SearchIcon className="w-16 h-16  mx-auto mb-4" />
                <p className=" text-lg mb-2">Enter a roll number to search</p>
                <p className=" text-sm">Student information will appear here</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
