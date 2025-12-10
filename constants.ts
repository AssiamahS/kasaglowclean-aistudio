import type { Service, Feature, ProcessStep, Testimonial, FeatureSlide, Location } from './types';
import {
  SparklesIcon, HomeIcon, BuildingOfficeIcon, TruckIcon,
  // FIX: Removed 'GiftIcon' as it is not exported from IconComponents.
  ShieldCheckIcon, ThumbUpIcon, UsersIcon,
  PhoneArrowUpRightIcon, CalendarDaysIcon, CheckBadgeIcon,
  HeartIcon, LockClosedIcon, CheckCircleIcon, MapPinIcon
} from './components/IconComponents';

// FIX: Added BUSINESS_HOURS constant required by CalendarBooking component.
export const BUSINESS_HOURS = {
  start: 9, // 9 AM
  end: 17, // 5 PM
};

// FIX: Added MOCKED_BOOKED_SLOTS constant required by CalendarBooking component.
export const MOCKED_BOOKED_SLOTS = new Set<string>([
  // Example: 'YYYY-MM-DD-HH'
]);

export const SERVICES: Service[] = [
  {
    icon: HomeIcon,
    title: 'Residential Cleaning',
    description: 'Keep your home consistently clean with our scheduled cleaning services. Weekly, bi-weekly, or monthly options available.',
    // FIX: Added 'duration' and 'reservationFee' to match the updated Service type.
    duration: 120,
    reservationFee: 25,
  },
  {
    icon: SparklesIcon,
    title: 'Deep Cleaning',
    description: 'A comprehensive, top-to-bottom clean that leaves your home spotless. Perfect for spring cleaning or special occasions.',
    // FIX: Added 'duration' and 'reservationFee' to match the updated Service type.
    duration: 240,
    reservationFee: 50,
  },
  {
    icon: TruckIcon,
    title: 'Move In/Out Cleaning',
    description: 'Ensure a smooth transition. We clean your old home for the next residents or your new home before you settle in.',
    // FIX: Added 'duration' and 'reservationFee' to match the updated Service type.
    duration: 180,
    reservationFee: 40,
  },
  {
    icon: BuildingOfficeIcon,
    title: 'Commercial Cleaning',
    description: 'Maintain a clean, healthy, and productive workspace for your employees and clients with our professional commercial cleaning.',
    // FIX: Added 'duration' and 'reservationFee' to match the updated Service type.
    duration: 150,
    reservationFee: 35,
  },
];

export const FEATURE_SLIDES: FeatureSlide[] = [
  {
    image: 'https://images.unsplash.com/photo-1600585152915-d208bec867a1?q=80&w=1972&auto=format&fit=crop',
    video: '/videos/deep-cleaning.mp4',
    title: 'The KasaGlow Difference',
    subtitle: 'Exceptional Quality, Every Time',
    description: 'We are committed to providing a reliable, high-quality experience. Our professional team is dedicated to making your home a cleaner, healthier, and happier place.',
    features: [
      { icon: ShieldCheckIcon, text: 'Trusted & Fully Insured' },
      { icon: ThumbUpIcon, text: '100% Satisfaction Guarantee' },
      { icon: UsersIcon, text: 'Expertly Trained Professionals' },
    ]
  },
  {
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1974&auto=format&fit=crop',
    video: '/videos/hero-home-cleaning.mp4',
    title: 'We Love Your Furry Friends',
    subtitle: 'Pet-Friendly Cleaning Services',
    description: 'Our team uses pet-safe products and techniques to ensure a clean home that\'s also safe for your beloved companions. We pay special attention to pet hair and odors.',
    features: [
      { icon: HeartIcon, text: 'Non-Toxic, Pet-Safe Products' },
      { icon: HomeIcon, text: 'Specialized in Pet Hair Removal' },
      { icon: SparklesIcon, text: 'Odor Elimination Treatments' },
    ]
  },
  {
    image: 'https://images.unsplash.com/photo-1583501653320-27a0a283a553?q=80&w=2070&auto=format&fit=crop',
    video: '/videos/garage-cleaning.mp4',
    title: 'Beyond the Living Room',
    subtitle: 'Garage & Outdoor Area Cleaning',
    description: 'Let us tackle the dirtiest parts of your home. We offer comprehensive garage cleaning and organization services to reclaim your space.',
    features: [
      { icon: CheckCircleIcon, text: 'De-cluttering & Organization' },
      { icon: SparklesIcon, text: 'Pressure Washing Services' },
      { icon: TruckIcon, text: 'Junk Hauling & Disposal' },
    ]
  },
   {
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop',
    video: '/videos/office-cleaning.mp4',
    title: 'Professional Spaces, Impeccable Results',
    subtitle: 'Corporate & Office Cleaning',
    description: 'Impress clients and boost employee morale with a pristine work environment. We offer flexible contracts for businesses of all sizes.',
    features: [
      { icon: CalendarDaysIcon, text: 'Flexible Evening & Weekend Hours' },
      { icon: BuildingOfficeIcon, text: 'Customized Commercial Plans' },
      { icon: LockClosedIcon, text: 'Secure & Discreet Service' },
    ]
  },
];


export const HOW_IT_WORKS_STEPS: ProcessStep[] = [
  {
    icon: PhoneArrowUpRightIcon,
    title: '1. Get a Free Estimate',
    description: 'Contact us via phone or our online form to tell us about your cleaning needs. We\'ll provide a no-obligation estimate.',
  },
  {
    icon: CalendarDaysIcon,
    title: '2. Book Your Service',
    description: 'Choose a date and time that works for you. We offer flexible scheduling to fit your busy life.',
  },
  {
    icon: CheckBadgeIcon,
    title: '3. Enjoy Your Clean Home',
    description: 'Our professional team will arrive on time and transform your space. Relax and enjoy the KasaGlow shine!',
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: "Our school has never looked better! KasaGlow keeps our classrooms spotless and the kids love coming to a clean environment. Very reliable service.",
    author: 'Maria R., Teacher',
    location: '',
    rating: 5,
  },
  {
    quote: "As a nurse, cleanliness is everything. KasaGlow maintains hospital-grade standards in our medical office. Professional and thorough every single time.",
    author: 'Jennifer K., Nurse',
    location: '',
    rating: 5,
  },
  {
    quote: "Our marketing agency looks amazing thanks to KasaGlow. Clients are always impressed when they visit. Worth every penny for our brand image.",
    author: 'Alex T., Marketing Director',
    location: '',
    rating: 5,
  },
  {
    quote: "KasaGlow cleaned our construction site office and crew areas. They handled the dirt and dust like pros. Great job on a tough space.",
    author: 'Mike D., Site Manager',
    location: '',
    rating: 5,
  },
  {
    quote: "We use KasaGlow for our weekly office cleaning, and the difference is night and day. The team is reliable, efficient, and always leaves the place looking immaculate.",
    author: 'David L., Office Manager',
    location: '',
    rating: 5,
  },
];

export const LOCATIONS: Location[] = [
  {
    state: 'North Jersey',
    cities: [],
    image: '/images/jerseycity_skyline.jpg'
  },
  {
    state: 'South Jersey',
    cities: [],
    image: '/images/newyork_skyline.jpg'
  },
  {
    state: 'Philly',
    cities: [],
    image: '/images/philly_skyline.jpg'
  }
];
