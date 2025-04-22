import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { addDays, setHours, setMinutes } from "date-fns";

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding the database...");

  // Clean up existing data
  await prisma.medicalRecord.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();

  console.log("✓ Cleaned up existing data");

  // Create Admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@happypatient.com",
      password: adminPassword,
      firstName: "Admin",
      lastName: "User",
      phone: "(123) 456-7890",
      role: "ADMIN",
      adminProfile: {
        create: {},
      },
    },
  });

  console.log("✓ Created admin user");

  // Create Doctors
  const doctorPassword = await bcrypt.hash("doctor123", 10);

  const doctor1 = await prisma.user.create({
    data: {
      email: "doctor1@happypatient.com",
      password: doctorPassword,
      firstName: "John",
      lastName: "Smith",
      phone: "(234) 567-8901",
      role: "DOCTOR",
      doctorProfile: {
        create: {
          specialization: "Cardiologist",
          education: "MD, Harvard Medical School",
        },
      },
    },
    include: {
      doctorProfile: true,
    },
  });

  const doctor2 = await prisma.user.create({
    data: {
      email: "doctor2@happypatient.com",
      password: doctorPassword,
      firstName: "Sarah",
      lastName: "Johnson",
      phone: "(345) 678-9012",
      role: "DOCTOR",
      doctorProfile: {
        create: {
          specialization: "Neurologist",
          education: "MD, Johns Hopkins University",
        },
      },
    },
    include: {
      doctorProfile: true,
    },
  });

  console.log("✓ Created doctor users");

  // Create Patients
  const patientPassword = await bcrypt.hash("patient123", 10);

  const patient1 = await prisma.user.create({
    data: {
      email: "patient1@example.com",
      password: patientPassword,
      firstName: "Alex",
      lastName: "Brown",
      phone: "(456) 789-0123",
      role: "PATIENT",
      patientProfile: {
        create: {
          dateOfBirth: new Date("1985-05-15"),
          gender: "Male",
        },
      },
    },
    include: {
      patientProfile: true,
    },
  });

  const patient2 = await prisma.user.create({
    data: {
      email: "patient2@example.com",
      password: patientPassword,
      firstName: "Emily",
      lastName: "Davis",
      phone: "(567) 890-1234",
      role: "PATIENT",
      patientProfile: {
        create: {
          dateOfBirth: new Date("1990-10-20"),
          gender: "Female",
        },
      },
    },
    include: {
      patientProfile: true,
    },
  });

  console.log("✓ Created patient users");

  // Create Appointments
  const today = new Date();

  // Past appointment (completed)
  const pastAppointment = await prisma.appointment.create({
    data: {
      doctorId: doctor1.doctorProfile!.id,
      patientId: patient1.patientProfile!.id,
      startTime: setMinutes(setHours(addDays(today, -7), 10), 0), // 10:00 AM a week ago
      endTime: setMinutes(setHours(addDays(today, -7), 10), 30), // 10:30 AM a week ago
      title: "Regular Checkup",
      symptoms: "Mild headache and fatigue",
      status: "OCCUPIED",
    },
  });

  // Create medical record for the past appointment
  await prisma.medicalRecord.create({
    data: {
      appointmentId: pastAppointment.id,
      patientId: patient1.patientProfile!.id,
      doctorNotes:
        "Patient appears to be suffering from stress-induced tension headaches. Recommended reducing work hours and prescribed pain relief medication. Follow-up in 3 weeks.",
    },
  });

  // Today's appointment (upcoming)
  await prisma.appointment.create({
    data: {
      doctorId: doctor2.doctorProfile!.id,
      patientId: patient2.patientProfile!.id,
      startTime: setMinutes(setHours(addDays(today, 0), 15), 0), // 3:00 PM today
      endTime: setMinutes(setHours(addDays(today, 0), 15), 30), // 3:30 PM today
      title: "Neurological Consultation",
      symptoms:
        "Recurring migraines, especially after looking at screens for long periods",
      status: "BOOKED",
    },
  });

  // Future appointment (upcoming)
  await prisma.appointment.create({
    data: {
      doctorId: doctor1.doctorProfile!.id,
      patientId: patient2.patientProfile!.id,
      startTime: setMinutes(setHours(addDays(today, 3), 11), 0), // 11:00 AM in 3 days
      endTime: setMinutes(setHours(addDays(today, 3), 12), 0), // 12:00 PM in 3 days
      title: "Follow-up Appointment",
      symptoms: "Follow-up for recent treatment",
      status: "BOOKED",
    },
  });

  // Create some empty slots
  for (let i = 1; i <= 5; i++) {
    const startHour = 9 + i; // Create slots from 10 AM to 3 PM
    await prisma.appointment.create({
      data: {
        doctorId: doctor1.doctorProfile!.id,
        startTime: setMinutes(setHours(addDays(today, 1), startHour), 0), // Start at the hour
        endTime: setMinutes(setHours(addDays(today, 1), startHour), 30), // 30 minute slot
        status: "FREE",
      },
    });

    await prisma.appointment.create({
      data: {
        doctorId: doctor2.doctorProfile!.id,
        startTime: setMinutes(setHours(addDays(today, 2), startHour), 0), // Start at the hour
        endTime: setMinutes(setHours(addDays(today, 2), startHour), 30), // 30 minute slot
        status: "FREE",
      },
    });
  }

  console.log("✓ Created appointments and medical records");

  console.log("✅ Seeding complete!");
}

seed()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
