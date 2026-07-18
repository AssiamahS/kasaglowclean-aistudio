// ============================================================
// WHITE-LABEL BRAND CONFIG — this is the ONLY file (plus
// tailwind.config.js colors, /public/images, and the services
// list in constants.ts) you edit to re-skin this site for a new
// client. See WHITELABEL.md for the full clone checklist.
// ============================================================

export const BRAND = {
  // Identity
  name: 'KasaGlow Cleaning Services',
  shortName: 'KasaGlow',
  legalName: 'KasaGlow Cleaning Services LLC',
  tagline: 'Exceptional Quality, Every Time',
  vertical: 'cleaning' as 'cleaning' | 'barbershop' | 'other',

  // Contact
  phone: '(908) 417-5388',
  phoneHref: 'tel:9084175388',
  email: 'info@kasaglowclean.com',
  domain: 'kasaglowclean.com',

  // Assets (drop replacements into /public/images)
  logo: '/images/smalllogo.jpg',

  // Service area
  serviceArea: 'Union County & Central New Jersey',

  // Trust signals shown in the homepage trust strip
  trust: {
    bondedInsured: true,
    satisfactionGuarantee: true,
    yearsInBusiness: null as number | null,
    ecoFriendly: true,
  },

  // Social — leave '' to hide a link
  social: {
    facebook: '',
    instagram: '',
    google: '', // Google Business profile / reviews URL
  },

  // Wording that differs per vertical ("cleaning" vs "appointment" language)
  bookingNoun: 'cleaning',        // e.g. barbershop: 'appointment'
  workerNoun: 'cleaning team',    // e.g. barbershop: 'barber'
};

export default BRAND;
