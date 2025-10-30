"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Users, BookOpen, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  getAllCourses,
  getCourseAttendance,
  getDashboardStats,
} from "@/lib/api";

export default function AnalyticsPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [attendanceData, setAttendanceData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseAttendance(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchInitialData = async () => {
    try {
      const [coursesData, statsData] = await Promise.all([
        getAllCourses(),
        getDashboardStats(),
      ]);
      setCourses(coursesData.courses || []);
      setStats(statsData.stats);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchCourseAttendance = async (courseId) => {
    setLoading(true);
    try {
      const data = await getCourseAttendance(courseId);
      setAttendanceData(data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen  p-4 py-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-10 h-10 " />
            <h1 className="text-4xl font-bold ">Attendance Analytics</h1>
          </div>
          <p className="">View detailed attendance reports and insights</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats?.total_students || 0}</p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Total Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats?.total_courses || 0}</p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Today's Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                {stats?.today_attendance || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Course Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Course</CardTitle>
            <CardDescription>
              Choose a course to view detailed attendance records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.course_code} - {course.course_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Attendance Records */}
        {selectedCourse && (
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                {attendanceData?.course.name} ({attendanceData?.course.code})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-gray-500">
                  Loading attendance data...
                </div>
              ) : attendanceData && attendanceData.records.length > 0 ? (
                <>
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Total Records:</strong>{" "}
                      {attendanceData.total_records}
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Roll Number</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-center">
                            Confidence
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendanceData.records.map((record, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {record.student_name}
                            </TableCell>
                            <TableCell>{record.roll_number}</TableCell>
                            <TableCell>{formatDate(record.date)}</TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={
                                  record.status === "present"
                                    ? "default"
                                    : "destructive"
                                }
                                className={
                                  record.status === "present"
                                    ? "bg-green-500"
                                    : ""
                                }
                              >
                                {record.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {record.confidence ? (
                                <Badge
                                  variant={
                                    record.confidence >= 80
                                      ? "default"
                                      : record.confidence >= 60
                                      ? "secondary"
                                      : "destructive"
                                  }
                                >
                                  {record.confidence}%
                                </Badge>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">
                    No attendance records found
                  </p>
                  <p className="text-gray-400 text-sm">
                    Attendance records will appear here once students mark their
                    attendance
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!selectedCourse && (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">
                  Select a course to view analytics
                </p>
                <p className="text-gray-400 text-sm">
                  Detailed attendance records will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
