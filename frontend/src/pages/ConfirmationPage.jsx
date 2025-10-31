import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, MapPin, Mail, Phone, Sparkles } from 'lucide-react';
import { getBookingByCode } from '../services/api';

const ConfirmationPage = () => {
  const { code } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [code]);

  const fetchBooking = async () => {
    try {
      const response = await getBookingByCode(code);
      setBooking(response.data);
    } catch (error) {
      console.error('Failed to fetch booking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Booking not found</p>
          <Link to="/" className="text-indigo-600 hover:underline">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-indigo-600" />
              <span className="text-2xl font-bold text-gray-900">KasaGlowClean</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-gray-600">
              Thank you for choosing KasaGlowClean. We've sent a confirmation email to{' '}
              <span className="font-semibold">{booking.customer.email}</span>
            </p>
          </div>

          {/* Confirmation Code */}
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6 mb-8 text-center">
            <p className="text-sm text-gray-600 mb-2">Confirmation Code</p>
            <p className="text-3xl font-bold text-indigo-600">{booking.confirmationCode}</p>
            <p className="text-xs text-gray-500 mt-2">Please save this code for your records</p>
          </div>

          {/* Booking Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Booking Details</h2>

            <div className="flex items-start gap-3">
              <div className="bg-indigo-100 rounded-full p-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold">
                  {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-indigo-100 rounded-full p-2">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-semibold">
                  {new Date(booking.startTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-indigo-100 rounded-full p-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold">{booking.address}</p>
                {booking.city && booking.state && (
                  <p className="text-sm text-gray-600">
                    {booking.city}, {booking.state} {booking.zipCode}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <p className="text-sm text-gray-600">Service</p>
              <p className="font-semibold text-lg">{booking.service.name}</p>
              <p className="text-sm text-gray-600 mt-1">{booking.service.description}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-semibold">{booking.service.durationMinutes} minutes</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Price</p>
              <p className="text-2xl font-bold text-indigo-600">${booking.service.price}</p>
            </div>

            {booking.specialNotes && (
              <div>
                <p className="text-sm text-gray-600">Special Instructions</p>
                <p className="font-semibold">{booking.specialNotes}</p>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="mt-8 border-t pt-6">
            <h3 className="font-semibold mb-3">What happens next?</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>You'll receive a confirmation email with all the details</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>We'll send you a reminder 24 hours before your appointment</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Our team will arrive on time and ready to clean</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              to="/"
              className="flex-1 bg-indigo-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Back to Home
            </Link>
            <Link
              to="/services"
              className="flex-1 bg-white text-indigo-600 border-2 border-indigo-600 text-center py-3 rounded-lg font-semibold hover:bg-indigo-50 transition"
            >
              Book Another Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
