// EXAMPLE brand config for a barbershop client.
// To use: copy the BRAND object into src/brand.ts, swap tailwind colors
// (barbers skew dark/gold: primary #1F2937, secondary #D4A94E), replace the
// services in src/constants.ts with the SERVICES below, and drop the shop's
// logo/photos into public/images. Full checklist in WHITELABEL.md.

export const BRAND = {
  name: 'Faded Kings Barbershop',
  shortName: 'Faded Kings',
  legalName: 'Faded Kings Barbershop LLC',
  tagline: 'Sharp Cuts. No Waiting.',
  vertical: 'barbershop' as const,

  phone: '(732) 555-0134',
  phoneHref: 'tel:7325550134',
  email: 'book@fadedkings.com',
  domain: 'fadedkings.com',

  logo: '/images/smalllogo.jpg',
  serviceArea: 'Manalapan & Freehold, NJ',

  trust: {
    bondedInsured: false,
    satisfactionGuarantee: true,
    yearsInBusiness: null,
    ecoFriendly: false,
  },

  social: { facebook: '', instagram: '', google: '' },

  bookingNoun: 'appointment',
  workerNoun: 'barber',
};

// Drop-in replacement for SERVICES in src/constants.ts (icons from
// IconComponents; durations in minutes; reservationFee = the deposit that
// kills no-shows — the #1 barbershop pain point).
export const SERVICES = [
  { title: 'Haircut', description: 'Classic cut, fade, or taper — finished with a hot towel.', duration: 45, reservationFee: 10 },
  { title: 'Haircut + Beard', description: 'Full cut plus beard shape-up and line work.', duration: 60, reservationFee: 15 },
  { title: 'Kids Cut (12 & under)', description: 'Patient, clean cuts for the young kings.', duration: 30, reservationFee: 5 },
  { title: 'Beard Trim & Shape', description: 'Beard sculpting, razor lines, and conditioning.', duration: 30, reservationFee: 5 },
];
