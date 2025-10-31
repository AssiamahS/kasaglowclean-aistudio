import { Link } from 'react-router-dom';
import { Sparkles, Calendar, CheckCircle, Star } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: <Calendar className="w-12 h-12 text-indigo-600" />,
      title: 'Easy Booking',
      description: 'Book your cleaning service in just a few clicks'
    },
    {
      icon: <CheckCircle className="w-12 h-12 text-indigo-600" />,
      title: 'Professional Service',
      description: 'Experienced cleaners you can trust'
    },
    {
      icon: <Star className="w-12 h-12 text-indigo-600" />,
      title: 'Quality Guaranteed',
      description: '100% satisfaction or your money back'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      text: 'KasaGlowClean transformed my home! Professional and thorough.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      text: 'Best cleaning service I\'ve ever used. Highly recommend!',
      rating: 5
    },
    {
      name: 'Emily Davis',
      text: 'Quick booking, amazing results. Will definitely use again!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-indigo-600" />
              <span className="text-2xl font-bold text-gray-900">KasaGlowClean</span>
            </div>
            <div className="flex gap-4">
              <Link
                to="/services"
                className="text-gray-700 hover:text-indigo-600 font-medium"
              >
                Services
              </Link>
              <Link
                to="/admin/login"
                className="text-gray-700 hover:text-indigo-600 font-medium"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Professional Cleaning Services
          </h1>
          <p className="text-xl mb-8 text-indigo-100">
            Book your cleaning appointment in minutes. Professional, reliable, and affordable.
          </p>
          <Link
            to="/services"
            className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition"
          >
            Book Now
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose Service</h3>
              <p className="text-gray-600">
                Select from our range of professional cleaning services
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Pick Date & Time</h3>
              <p className="text-gray-600">
                Choose a convenient time slot from our availability
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Relax</h3>
              <p className="text-gray-600">
                We'll take care of the rest. Enjoy your clean space!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">{testimonial.text}</p>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-indigo-100">
            Book your cleaning service today and experience the difference
          </p>
          <Link
            to="/services"
            className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition"
          >
            Book Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6" />
            <span className="text-xl font-bold">KasaGlowClean</span>
          </div>
          <p className="text-gray-400">
            Professional cleaning services you can trust
          </p>
          <p className="text-gray-400 mt-2">
            Email: info@kasaglowclean.com | Phone: +1-555-0100
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
