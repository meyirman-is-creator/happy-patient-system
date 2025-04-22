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
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>
              Dr. {user.firstName} {user.lastName}
            </CardTitle>
            <CardDescription>
              {doctor.specialization || "General Practitioner"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {doctor.education && (
          <div className="mb-4">
            <p className="text-sm font-medium">Education</p>
            <p className="text-sm text-muted-foreground">{doctor.education}</p>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clipboard className="h-4 w-4 text-muted-foreground" />
            <span>{user.phone}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button asChild>
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
            >
              Edit
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Doctor</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete Dr. {user.firstName}{" "}
                    {user.lastName}? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={(e) => e.preventDefault()}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => onDelete?.(doctor.id)}
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
