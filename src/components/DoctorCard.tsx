"use client";

import Link from "next/link";
import { Calendar, User, Clipboard } from "lucide-react";

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
  onDelete,
}: DoctorCardProps) {
  const { user } = doctor;
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <Card className="flex flex-col h-full border-2 border-blue-100 dark:border-blue-900/30 bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3 border-b border-blue-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 bg-blue-100 dark:bg-blue-900/30 ring-4 ring-blue-500/20 dark:ring-blue-400/20">
            <AvatarFallback className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl text-blue-800 dark:text-blue-300">
              Dr. {user.firstName} {user.lastName}
            </CardTitle>
            <CardDescription className="text-blue-600/70 dark:text-blue-400/70 font-medium">
              {doctor.specialization || "General Practitioner"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pt-4">
        {doctor.education && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">
              Education
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {doctor.education}
            </p>
          </div>
        )}
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-gray-700 dark:text-gray-300">
              {user.email}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clipboard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-gray-700 dark:text-gray-300">
              {user.phone}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4 border-t border-blue-100 dark:border-gray-700">
        <Button
          asChild
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
        >
          <Link href={`/calendar?doctorId=${doctor.id}`}>
            <Calendar className="h-4 w-4 mr-2" />
            View Schedule
          </Link>
        </Button>

        {isAdmin && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(doctor)}
              className="border-2 border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-gray-800 text-blue-700 dark:text-blue-300 transition-colors"
            >
              Edit
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800 text-white transition-colors"
                >
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white dark:bg-gray-900 border-2 border-blue-100 dark:border-gray-700 rounded-xl shadow-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-blue-800 dark:text-blue-300">
                    Delete Doctor
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-gray-400">
                    Are you sure you want to delete Dr. {user.firstName}{" "}
                    {user.lastName}? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-3 mt-4">
                  <Button
                    variant="outline"
                    onClick={(e) => e.preventDefault()}
                    className="border-2 border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-gray-800 text-blue-700 dark:text-blue-300 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => onDelete?.(doctor.id)}
                    className="bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800 text-white transition-colors"
                  >
                    Delete
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
