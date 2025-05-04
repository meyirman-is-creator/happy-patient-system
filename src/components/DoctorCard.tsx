"use client";

import Link from "next/link";
import {
  Calendar,
  Mail,
  Phone,
  GraduationCap,
  Stethoscope,
  Edit
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import type { Doctor } from "@/lib/types";
import { useState } from "react";

interface DoctorCardProps {
  doctor: Doctor;
  isAdmin?: boolean;
  onEdit?: (doctor: Doctor) => void;
  onDelete?: (doctorId: string) => void;
}

export function DoctorCard({
  doctor,
  isAdmin,
  onEdit,
}: DoctorCardProps) {
  const { user } = doctor;
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <Card className="flex flex-col h-full border border-[#0A6EFF]/10 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <CardHeader className="pb-3 border-b border-[#0A6EFF]/10 bg-gradient-to-r from-[#0A6EFF]/5 to-white">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 bg-[#0A6EFF]/10 ring-4 ring-[#0A6EFF]/20">
            <AvatarFallback className="text-xl font-bold text-[#0A6EFF]">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl text-[#243352]">
              Др. {user.firstName} {user.lastName}
            </CardTitle>
            <CardDescription className="text-[#0A6EFF] font-medium">
              {doctor.specialization || "Врач общей практики"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pt-4">
        {doctor.education && (
          <div className="mb-4 p-3 bg-[#0A6EFF]/5 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="h-4 w-4 text-[#0A6EFF]" />
              <p className="text-sm font-medium text-[#243352]">Образование</p>
            </div>
            <p className="text-sm text-[#243352]/80">{doctor.education}</p>
          </div>
        )}
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex items-center gap-3 text-sm">
            <Stethoscope className="h-4 w-4 text-[#0A6EFF]" />
            <span className="text-[#243352]">
              Опыт работы: <span className="font-medium">7 лет</span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-[#0A6EFF]" />
            <span className="text-[#243352]">{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-[#0A6EFF]" />
            <span className="text-[#243352]">{user.phone}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4 border-t border-[#0A6EFF]/10">
        <Button
          asChild
          className="bg-[#0A6EFF] hover:bg-[#0A6EFF]/90 text-white"
        >
          <Link href={`/calendar?doctorId=${doctor.id}`}>
            <Calendar className="h-4 w-4 mr-2" />
            Расписание
          </Link>
        </Button>

        {isAdmin && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit && onEdit(doctor)}
              className="border-2 border-[#0A6EFF]/10 hover:bg-[#0A6EFF]/5 text-[#243352]"
            >
              <Edit className="h-4 w-4 mr-2" />
              Изменить
            </Button>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                
              </DialogTrigger>
              <DialogContent className="bg-white border-2 border-[#0A6EFF]/10 rounded-xl shadow-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-[#243352]">
                    Удаление врача
                  </DialogTitle>
                  <DialogDescription className="text-[#243352]/70">
                    Вы уверены, что хотите удалить Др. {user.firstName}{" "}
                    {user.lastName}? Это действие нельзя отменить.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-3 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                    className="border-2 border-[#0A6EFF]/10 hover:bg-[#0A6EFF]/5 text-[#243352]"
                  >
                    Отмена
                  </Button>
                  
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
