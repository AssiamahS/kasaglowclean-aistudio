
import type { Service } from './types';

export const SERVICES: Service[] = [
  {
    id: 1,
    name: 'Standard House Cleaning',
    description: 'A thorough cleaning of all standard living areas, kitchens, and bathrooms.',
    duration: 120, // 2 hours
    reservationFee: 25,
  },
  {
    id: 2,
    name: 'Deep Cleaning',
    description: 'An intensive, detailed cleaning perfect for spring cleaning or special occasions.',
    duration: 240, // 4 hours
    reservationFee: 50,
  },
  {
    id: 3,
    name: 'Office Cleaning',
    description: 'Keep your workspace productive and professional with our tailored office cleaning services.',
    duration: 180, // 3 hours
    reservationFee: 40,
  },
  {
    id: 4,
    name: 'Move-In/Move-Out Cleaning',
    description: 'Ensure a spotless transition for your new or old home. Ready for inspection.',
    duration: 300, // 5 hours
    reservationFee: 60,
  },
  {
    id: 5,
    name: 'Apartment Cleaning',
    description: 'Specialized cleaning for apartments and condos, focusing on maximizing smaller spaces.',
    duration: 90, // 1.5 hours
    reservationFee: 20,
  },
  {
    id: 6,
    name: 'Post-Construction Cleaning',
    description: 'We handle the dust and debris after construction, leaving your new space immaculate.',
    duration: 360, // 6 hours
    reservationFee: 75,
  },
];

export const BUSINESS_HOURS = {
  start: 8, // 8 AM
  end: 18, // 6 PM
};

// Mocking some booked slots for demonstration purposes.
// In a real app, this would come from an API.
// Format: 'YYYY-MM-DD-HH' (24-hour format)
export const MOCKED_BOOKED_SLOTS = new Set([
  new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().slice(0, 10) + '-10',
  new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().slice(0, 10) + '-11',
  new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().slice(0, 10) + '-14',
  new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().slice(0, 10) + '-09',
]);
