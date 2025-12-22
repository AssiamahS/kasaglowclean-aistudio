import React from 'react';

export interface Service {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  // FIX: Added missing properties 'duration' and 'reservationFee' for the booking flow.
  duration: number;
  reservationFee: number;
}

export interface Feature {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}

// NEW: For the Why Choose Us carousel
export interface FeatureSlide {
  image: string;
  video?: string; // Optional video path
  title: string;
  subtitle: string;
  description: string;
  features: {
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    text: string;
  }[];
}

export interface ProcessStep {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  location: string;
  rating: number;
}

// NEW: For the locations page
export interface Location {
  state: string;
  cities: string[];
  image: string;
}

// FIX: Added missing 'Customer' interface for the booking form.
export interface Customer {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
}

// FIX: Added missing 'BookingDetails' interface for booking confirmation and payment steps.
export interface BookingDetails {
  service: Service;
  dateTime: Date;
  customer: Customer;
  confirmationId: string;
}
