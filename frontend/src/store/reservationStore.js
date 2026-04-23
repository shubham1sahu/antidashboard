import { create } from 'zustand';

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const tomorrow = formatLocalDate(new Date(Date.now() + 24 * 60 * 60 * 1000));

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
