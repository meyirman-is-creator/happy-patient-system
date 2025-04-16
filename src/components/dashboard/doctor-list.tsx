import { useEffect, useState } from "react";
import { useDoctorStore } from "@/store/doctor-store";
import { Doctor } from "@/types/user";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface DoctorListProps {
  onSelectDoctor?: (doctor: Doctor) => void;
  isAdmin?: boolean;
}

export function DoctorList({
  onSelectDoctor,
  isAdmin = false,
}: DoctorListProps) {
  const { doctors, fetchDoctors, isLoading, error } = useDoctorStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Filter doctors based on search term
  const filteredDoctors = doctors.filter((doctor) => {
    const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#273441]">Available Doctors</h2>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by name or specialization"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />

          {isAdmin && (
            <Link href="/admin/doctors/add">
              <Button className="bg-[#007CFF] hover:bg-[#0070E6]">
                Add Doctor
              </Button>
            </Link>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid place-items-center h-40">
          <p className="text-[#51657A]">Loading doctors...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="grid place-items-center h-40">
          <p className="text-[#51657A]">
            No doctors found matching your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoctors.map((doctor) => (
            <Card
              key={doctor.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardHeader className="bg-[#6D8CAD]/10 pb-2">
                <CardTitle className="text-[#273441]">{`Dr. ${doctor.firstName} ${doctor.lastName}`}</CardTitle>
                <Badge className="bg-[#007CFF] hover:bg-[#0070E6] w-fit">
                  {doctor.specialization}
                </Badge>
              </CardHeader>
              <CardContent className="pt-4">
                {doctor.description && (
                  <CardDescription className="text-[#51657A] mb-2">
                    {doctor.description}
                  </CardDescription>
                )}
                <div className="text-sm text-[#51657A]">
                  <p>Phone: {doctor.phoneNumber}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 bg-[#F9FAFB] p-2">
                {isAdmin ? (
                  <>
                    <Link href={`/admin/doctors/edit/${doctor.id}`}>
                      <Button
                        variant="outline"
                        className="text-[#51657A] border-[#51657A] hover:text-[#273441]"
                      >
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/admin/schedules/${doctor.id}`}>
                      <Button
                        variant="outline"
                        className="text-[#51657A] border-[#51657A] hover:text-[#273441]"
                      >
                        Manage Schedule
                      </Button>
                    </Link>
                  </>
                ) : onSelectDoctor ? (
                  <Button
                    className="bg-[#007CFF] hover:bg-[#0070E6]"
                    onClick={() => onSelectDoctor(doctor)}
                  >
                    View Schedule
                  </Button>
                ) : (
                  <Link href={`/patient/doctors/${doctor.id}`}>
                    <Button className="bg-[#007CFF] hover:bg-[#0070E6]">
                      View Schedule
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
