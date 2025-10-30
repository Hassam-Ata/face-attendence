"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  CheckSquare,
  UserPlus,
  Search,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats, getTodayAttendance } from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, attendanceData] = await Promise.all([
        getDashboardStats(),
        getTodayAttendance(),
      ]);
      setStats(statsData.stats);
      setTodayAttendance(attendanceData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <header className="border-b bg-black sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/">
                <Button variant="ghost" size="sm" className="mb-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              <h1 className="text-3xl  font-bold ">Admin Dashboard</h1>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/register">
                <Button className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Register Student
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-linear-to-br from-blue-500 to-blue-600 ">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-4xl font-bold">
                  {stats?.total_students || 0}
                </p>
                <Users className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">
                Total Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-4xl font-bold">
                  {stats?.total_courses || 0}
                </p>
                <BookOpen className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">
                Today's Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-4xl font-bold">
                  {stats?.today_attendance || 0}
                </p>
                <CheckSquare className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={`bg-linear-to-br ${
              stats?.model_trained
                ? "from-teal-500 to-teal-600"
                : "from-orange-500 to-orange-600"
            } text-white`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">
                Model Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">
                  {stats?.model_trained ? "Trained" : "Not Trained"}
                </p>
                <BarChart3 className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" />
                Search Student
              </CardTitle>
              <CardDescription>Find student by roll number</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/search">
                <Button variant="outline" className="w-full">
                  Go to Search
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Analytics
              </CardTitle>
              <CardDescription>
                View detailed attendance analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/analytics">
                <Button variant="outline" className="w-full">
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-600" />
                Register Student
              </CardTitle>
              <CardDescription>Add new student to system</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/register">
                <Button variant="outline" className="w-full">
                  Register Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Today's Attendance by Course */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance Summary</CardTitle>
            <CardDescription>
              Attendance marked on{" "}
              {todayAttendance?.date
                ? new Date(todayAttendance.date).toLocaleDateString()
                : "today"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : todayAttendance &&
              Object.keys(todayAttendance.courses).length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead className="text-center">Present</TableHead>
                    <TableHead className="text-center">
                      Total Enrolled
                    </TableHead>
                    <TableHead className="text-center">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(todayAttendance.courses).map(
                    ([code, data]) => {
                      const percentage =
                        data.total_enrolled > 0
                          ? (
                              (data.present / data.total_enrolled) *
                              100
                            ).toFixed(1)
                          : 0;

                      return (
                        <TableRow key={code}>
                          <TableCell className="font-medium">{code}</TableCell>
                          <TableCell>{data.course_name}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="default" className="bg-green-500">
                              {data.present}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {data.total_enrolled}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                percentage >= 75
                                  ? "default"
                                  : percentage >= 50
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {percentage}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">
                  No attendance marked today
                </p>
                <p className="text-gray-400 text-sm">
                  Students can mark attendance through the attendance portal
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
