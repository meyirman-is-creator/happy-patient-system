// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  CalendarDays,
  Users,
  UserCheck,
  ActivitySquare,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAppointments,
  useDoctors,
  usePatients,
} from "@/lib/hooks/useQueries";
import { useAuth } from "@/lib/hooks/useAuth";
import { AppointmentStatus } from "@prisma/client";

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="ml-0 lg:ml-64 p-6">
        <div className="flex justify-center py-12 text-[#0A6EFF]">
          <div className="animate-pulse">Загрузка...</div>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}

function Dashboard() {
  const { user } = useAuth();
  const { data: appointments = [] } = useAppointments();
  const { data: doctors = [] } = useDoctors();
  const { data: patients = [] } = usePatients();

  const todayAppointments = appointments.filter(
    (app) =>
      format(new Date(app.startTime), "yyyy-MM-dd") ===
        format(new Date(), "yyyy-MM-dd") &&
      app.status === AppointmentStatus.BOOKED
  );

  const upcomingAppointments = appointments.filter(
    (app) =>
      new Date(app.startTime) > new Date() &&
      app.status === AppointmentStatus.BOOKED
  );

  const completedAppointments = appointments.filter(
    (app) => app.status === AppointmentStatus.OCCUPIED
  );

  if (!user) {
    return (
      <div className="ml-0 lg:ml-64 p-6">
        <div className="flex justify-center py-12 text-[#0A6EFF]">
          <div className="animate-pulse">Загрузка данных пользователя...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-[20px] mt-[20px]">
      <div className="bg-white rounded-xl shadow-md p-6 border border-[#0A6EFF]/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-[#0A6EFF]/10">
          <div>
            <h1 className="text-2xl font-bold text-[#243352]">
              Панель управления
            </h1>
            <p className="text-[#243352]/70 mt-1">
              Добро пожаловать, {user.firstName} {user.lastName}!
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="bg-[#0A6EFF]/5 px-4 py-2 rounded-lg">
              <p className="text-[#243352] font-medium">
                Сегодня: {format(new Date(), "dd MMMM yyyy", { locale: ru })}
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-[#0A6EFF]/10 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between bg-[#0A6EFF]/5 rounded-t-lg">
              <CardTitle className="text-lg text-[#243352]">
                Записи сегодня
              </CardTitle>
              <CalendarDays className="h-5 w-5 text-[#0A6EFF]" />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-[#243352]">
                {todayAppointments.length}
              </div>
              <p className="text-sm text-[#243352]/70 mt-1">
                Запланированных приемов
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#0A6EFF]/10 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between bg-[#0A6EFF]/5 rounded-t-lg">
              <CardTitle className="text-lg text-[#243352]">Врачей</CardTitle>
              <UserCheck className="h-5 w-5 text-[#0A6EFF]" />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-[#243352]">
                {doctors.length}
              </div>
              <p className="text-sm text-[#243352]/70 mt-1">
                Специалистов в системе
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#0A6EFF]/10 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between bg-[#0A6EFF]/5 rounded-t-lg">
              <CardTitle className="text-lg text-[#243352]">
                Пациентов
              </CardTitle>
              <Users className="h-5 w-5 text-[#0A6EFF]" />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-[#243352]">
                {patients.length}
              </div>
              <p className="text-sm text-[#243352]/70 mt-1">
                Обслуживаемых пациентов
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="bg-[#F8FAFC] p-6 rounded-xl border border-[#0A6EFF]/10">
          <h2 className="text-xl font-bold text-[#243352] mb-4 flex items-center">
            <ActivitySquare className="h-5 w-5 mr-2 text-[#0A6EFF]" />
            Статистика
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border border-[#0A6EFF]/10">
              <p className="text-sm text-[#243352]/70">Предстоящие приемы</p>
              <p className="text-2xl font-bold text-[#0A6EFF] mt-1">
                {upcomingAppointments.length}
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-[#0A6EFF]/10">
              <p className="text-sm text-[#243352]/70">Завершенные приемы</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {completedAppointments.length}
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-[#0A6EFF]/10">
              <p className="text-sm text-[#243352]/70">Активность системы</p>
              <p className="text-2xl font-bold text-[#243352] mt-1">Высокая</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
