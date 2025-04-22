"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Users,
  ClipboardCheck,
  UserCheck,
  BellRing,
  ActivitySquare,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppointments, useDoctors, usePatients } from "@/lib/hooks/useQueries";
import { useAuth } from "@/lib/hooks/useAuth";
import { AppointmentStatus } from "@prisma/client";

export default function DashboardPage() {
  const router = useRouter();
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
  const router = useRouter();
  const { data: appointments = [] } = useAppointments();
  const { data: doctors = [] } = useDoctors();
  const { data: patients = [] } = usePatients();

  const todayAppointments = appointments.filter(
    (app) => 
      format(new Date(app.startTime), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") &&
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


  if (!user || user.role === "PATIENT") {
    return null;
  }

  return (
    <div className="ml-0 lg:ml-64 p-6">
      <div className="bg-white rounded-xl shadow-md p-6 border border-[#0A6EFF]/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-[#0A6EFF]/10">
          <div>
            <h1 className="text-2xl font-bold text-[#243352]">Панель управления</h1>
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
      </div>
    </div>
  );
}
