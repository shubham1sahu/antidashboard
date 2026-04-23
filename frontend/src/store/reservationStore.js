import { create } from 'zustand';

const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const useReservationStore = create((set) => ({
  reservations: [],
  availableTables: [],
  selectedTable: null,
  selectedDate: tomorrow,
  selectedTime: '19:00',
  selectedEndTime: '21:00',
  guestCount: 2,
  setReservations: (reservations) => set({ reservations }),
  setAvailableTables: (availableTables) => set({ availableTables }),
  setSelectedTable: (selectedTable) => set({ selectedTable }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setSelectedTime: (selectedTime) => set({ selectedTime }),
  setSelectedEndTime: (selectedEndTime) => set({ selectedEndTime }),
  setGuestCount: (guestCount) => set({ guestCount }),
  resetSelection: () => set({ selectedTable: null, availableTables: [] }),
}));

export default useReservationStore;
