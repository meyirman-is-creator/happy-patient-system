import { create } from 'zustand';
import { Slot, SlotStatus, DoctorSchedule } from '@/types/appointment';
import { addMinutes, format, parseISO } from 'date-fns';

interface ScheduleState {
  schedules: DoctorSchedule[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchDoctorSchedule: (doctorId: string, date?: string) => Promise<DoctorSchedule>;
  bookSlot: (slotId: string, patientId: string) => Promise<Slot>;
  cancelBooking: (slotId: string) => Promise<Slot>;
  markSlotAsOccupied: (slotId: string) => Promise<Slot>;
  createDoctorSchedule: (doctorId: string, date: string, startTime: string, endTime: string) => Promise<DoctorSchedule>;
  clearError: () => void;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  schedules: [],
  isLoading: false,
  error: null,
  
  fetchDoctorSchedule: async (doctorId, date) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // For now we'll mock it
      
      // Check if we already have this doctor's schedule
      const existingSchedule = get().schedules.find(s => s.doctorId === doctorId);
      
      if (existingSchedule) {
        set({ isLoading: false });
        return existingSchedule;
      }
      
      // Create mock schedule with 30-minute slots
      const today = date ? new Date(date) : new Date();
      const formattedDate = format(today, 'yyyy-MM-dd');
      
      const slots: Slot[] = [];
      const startHour = 9; // 9 AM
      const endHour = 17; // 5 PM
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const endTimeDate = addMinutes(parseISO(`${formattedDate}T${startTime}`), 30);
          const endTime = format(endTimeDate, 'HH:mm');
          
          slots.push({
            id: `${doctorId}-${formattedDate}-${startTime}`,
            doctorId,
            date: formattedDate,
            startTime,
            endTime,
            status: SlotStatus.FREE,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
      
      const doctorSchedule: DoctorSchedule = {
        doctorId,
        slots,
      };
      
      set(state => ({ 
        schedules: [...state.schedules, doctorSchedule], 
        isLoading: false 
      }));
      
      return doctorSchedule;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  bookSlot: async (slotId, patientId) => {
    set({ isLoading: true, error: null });
    try {
      const schedules = [...get().schedules];
      
      // Find the schedule and slot
      for (const schedule of schedules) {
        const slotIndex = schedule.slots.findIndex(s => s.id === slotId);
        
        if (slotIndex !== -1) {
          // Check if slot is available
          if (schedule.slots[slotIndex].status !== SlotStatus.FREE) {
            throw new Error('Slot is not available');
          }
          
          // Update the slot
          const updatedSlot: Slot = {
            ...schedule.slots[slotIndex],
            patientId,
            status: SlotStatus.BOOKED,
            updatedAt: new Date().toISOString(),
          };
          
          // Update the schedule
          const updatedSlots = [...schedule.slots];
          updatedSlots[slotIndex] = updatedSlot;
          
          schedule.slots = updatedSlots;
          
          set({ schedules, isLoading: false });
          
          return updatedSlot;
        }
      }
      
      throw new Error('Slot not found');
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  cancelBooking: async (slotId) => {
    set({ isLoading: true, error: null });
    try {
      const schedules = [...get().schedules];
      
      // Find the schedule and slot
      for (const schedule of schedules) {
        const slotIndex = schedule.slots.findIndex(s => s.id === slotId);
        
        if (slotIndex !== -1) {
          // Check if slot is booked
          if (schedule.slots[slotIndex].status !== SlotStatus.BOOKED) {
            throw new Error('Slot is not booked');
          }
          
          // Update the slot
          const updatedSlot: Slot = {
            ...schedule.slots[slotIndex],
            patientId: undefined,
            status: SlotStatus.FREE,
            updatedAt: new Date().toISOString(),
          };
          
          // Update the schedule
          const updatedSlots = [...schedule.slots];
          updatedSlots[slotIndex] = updatedSlot;
          
          schedule.slots = updatedSlots;
          
          set({ schedules, isLoading: false });
          
          return updatedSlot;
        }
      }
      
      throw new Error('Slot not found');
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  markSlotAsOccupied: async (slotId) => {
    set({ isLoading: true, error: null });
    try {
      const schedules = [...get().schedules];
      
      // Find the schedule and slot
      for (const schedule of schedules) {
        const slotIndex = schedule.slots.findIndex(s => s.id === slotId);
        
        if (slotIndex !== -1) {
          // Check if slot is booked
          if (schedule.slots[slotIndex].status !== SlotStatus.BOOKED) {
            throw new Error('Slot is not booked');
          }
          
          // Update the slot
          const updatedSlot: Slot = {
            ...schedule.slots[slotIndex],
            status: SlotStatus.OCCUPIED,
            updatedAt: new Date().toISOString(),
          };
          
          // Update the schedule
          const updatedSlots = [...schedule.slots];
          updatedSlots[slotIndex] = updatedSlot;
          
          schedule.slots = updatedSlots;
          
          set({ schedules, isLoading: false });
          
          return updatedSlot;
        }
      }
      
      throw new Error('Slot not found');
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  createDoctorSchedule: async (doctorId, date, startTime, endTime) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // For now we'll create a schedule with 30-minute slots
      
      const formattedDate = format(new Date(date), 'yyyy-MM-dd');
      
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      const slots: Slot[] = [];
      
      let currentHour = startHour;
      let currentMinute = startMinute;
      
      while (
        currentHour < endHour || 
        (currentHour === endHour && currentMinute < endMinute)
      ) {
        const startTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        
        // Calculate end time (30 minutes later)
        let nextMinute = currentMinute + 30;
        let nextHour = currentHour;
        
        if (nextMinute >= 60) {
          nextMinute -= 60;
          nextHour += 1;
        }
        
        // Skip if we've gone past the end time
        if (nextHour > endHour || (nextHour === endHour && nextMinute > endMinute)) {
          break;
        }
        
        const endTimeStr = `${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`;
        
        slots.push({
          id: `${doctorId}-${formattedDate}-${startTimeStr}`,
          doctorId,
          date: formattedDate,
          startTime: startTimeStr,
          endTime: endTimeStr,
          status: SlotStatus.FREE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        
        // Move to next slot
        currentMinute = nextMinute;
        currentHour = nextHour;
      }
      
      const doctorSchedule: DoctorSchedule = {
        doctorId,
        slots,
      };
      
      // Check if we already have a schedule for this doctor
      const schedules = [...get().schedules];
      const existingScheduleIndex = schedules.findIndex(s => s.doctorId === doctorId);
      
      if (existingScheduleIndex !== -1) {
        // Merge slots
        const existingSlots = schedules[existingScheduleIndex].slots;
        const newSlots = [...existingSlots, ...slots];
        
        schedules[existingScheduleIndex] = {
          ...schedules[existingScheduleIndex],
          slots: newSlots,
        };
        
        set({ schedules, isLoading: false });
      } else {
        set(state => ({ 
          schedules: [...state.schedules, doctorSchedule], 
          isLoading: false 
        }));
      }
      
      return doctorSchedule;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  clearError: () => {
    set({ error: null });
  },
}));