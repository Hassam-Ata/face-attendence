"use client";

import Link from "next/link";
import { UserPlus, CheckSquare, LayoutDashboard, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen ">
      {/* Header */}
      <header className="border-b bg-black sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold">
                Face Recognition Attendance
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold ">Smart Attendance System</h2>
          <p className="text-xl max-w-2xl mx-auto">
            Automated attendance marking using AI-powered face recognition
            technology
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {/* Student Attendance */}
          <Card className="hover:shadow-xl transition-shadow duration-300 border-2 hover:border-blue-600">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <CheckSquare className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Mark Attendance</CardTitle>
              <CardDescription>
                Students can mark their attendance by scanning their face
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/attendance/mark">
                <Button className="w-full" size="lg">
                  Go to Attendance
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Dashboard */}
          <Card className="hover:shadow-xl transition-shadow duration-300 border-2 hover:border-blue-600">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <LayoutDashboard className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
              <CardDescription>
                View attendance records, analytics, and manage students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button className="w-full" size="lg">
                  Open Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Register Student */}
          <Card className="hover:shadow-xl transition-shadow duration-300 border-2 hover:border-blue-600">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Register Student</CardTitle>
              <CardDescription>
                Add new students to the system with face recognition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/register">
                <Button className="w-full" size="lg">
                  Register New Student
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className=" rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold  mb-6 text-center">
            Why Use Our System?
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-xl">⚡</span>
              </div>
              <div>
                <h4 className="font-semibold  mb-1">Fast & Accurate</h4>
                <p className="text-sm ">
                  Mark attendance in seconds with high accuracy face recognition
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-xl">🔒</span>
              </div>
              <div>
                <h4 className="font-semibold  mb-1">Secure & Reliable</h4>
                <p className="text-sm ">
                  Advanced ML algorithms ensure authentic attendance records
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <h4 className="font-semibold  mb-1">Real-time Analytics</h4>
                <p className="text-sm ">
                  Track attendance patterns and generate detailed reports
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <h4 className="font-semibold  mb-1">Easy to Use</h4>
                <p className="text-sm ">
                  Simple interface for both students and administrators
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t  mt-16">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center ">
            © 2025 Face Recognition Attendance System. Built with Next.js &
            FastAPI
          </p>
        </div>
      </footer>
    </div>
  );
}
