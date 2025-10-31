
export interface Service {
  id: number;
  name: string;
  description: string;
  duration: number; // in minutes
  reservationFee: number;
}

export interface Customer {
  name:string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
}

export interface BookingDetails {
  service: Service;
  dateTime: Date;
  customer: Customer;
  confirmationId: string;
}
