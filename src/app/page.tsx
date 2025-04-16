'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types/user';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();
 
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full bg-white border-b border-gray-200">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#273441]">Happy Patient</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="outline" className="border-[#51657A] text-[#51657A] hover:text-[#273441]">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-[#007CFF] hover:bg-[#0070E6] text-white">
                Register
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-[#273441]">
            Welcome to the Happy Patient System
          </h1>
          <p className="text-xl text-[#51657A]">
            Streamlined medical center management for patients, doctors, and administrators
          </p>
          
          <div className="py-8">
            <Link href="/register">
              <Button className="bg-[#007CFF] hover:bg-[#0070E6] text-white text-lg px-8 py-6">
                Get Started
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            <div className="p-6 border rounded-lg bg-[#6D8CAD]/5">
              <h2 className="text-xl font-bold text-[#273441] mb-4">For Patients</h2>
              <ul className="text-left text-[#51657A] space-y-2">
                <li>✓ Easy appointment booking</li>
                <li>✓ Access to medical records</li>
                <li>✓ Cancel or reschedule visits</li>
                <li>✓ Find specialists</li>
              </ul>
            </div>
            
            <div className="p-6 border rounded-lg bg-[#6D8CAD]/5">
              <h2 className="text-xl font-bold text-[#273441] mb-4">For Doctors</h2>
              <ul className="text-left text-[#51657A] space-y-2">
                <li>✓ Manage daily schedule</li>
                <li>✓ Track patient visits</li>
                <li>✓ Update medical records</li>
                <li>✓ Access patient history</li>
              </ul>
            </div>
            
            <div className="p-6 border rounded-lg bg-[#6D8CAD]/5">
              <h2 className="text-xl font-bold text-[#273441] mb-4">For Administrators</h2>
              <ul className="text-left text-[#51657A] space-y-2">
                <li>✓ Manage doctor profiles</li>
                <li>✓ Configure schedules</li>
                <li>✓ Monitor appointments</li>
                <li>✓ System oversight</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="py-4 bg-[#273441] text-white text-center">
        <div className="container">
          <p>&copy; 2025 Happy Patient System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}