import { AlertTriangle, Calendar, Heart, Home, Settings, TrendingUp, User2 } from "lucide-react";

export const studentMenu = [
  { title: "Dashboard", url: "/student", icon: Home },
  { title: "My Vitals", url: "/student/vitals", icon: Heart },
  { title: "History", url: "/student/history", icon: Calendar },
  { title: "Alerts", url: "/student/alerts", icon: TrendingUp },
  { title: "Settings", url: "/student/settings", icon: Settings },
];

export const teacherMenu = [
  { title: "Dashboard", url: "/teacher", icon: Home },
  { title: "Students", url: "/teacher/students", icon: User2 },
  { title: "Analytics", url: "/teacher/analytics", icon: TrendingUp },
  { title: "Alerts", url: "/teacher/alerts", icon: AlertTriangle },
  { title: "Settings", url: "/teacher/settings", icon: Settings },
];
