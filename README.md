# KasaGlowClean - Cleaning Services Booking System

A full-stack cleaning services booking website built with React, Node.js, Express, and PostgreSQL. Similar to Calendly but specifically designed for cleaning service businesses.

## Features

### Customer-Facing
- **Landing Page** - Professional landing page with testimonials and service information
- **Service Selection** - Browse available cleaning services with descriptions and pricing
- **Calendar Booking** - Select date and available time slots
- **Booking Form** - Complete customer information and special instructions
- **Email Confirmation** - Automatic confirmation emails with booking details
- **Booking Management** - View booking confirmation and details

### Admin Dashboard
- **Authentication** - Secure admin login system
- **Dashboard Stats** - View today's bookings, weekly bookings, pending bookings, and revenue
- **Booking Management** - View, filter, and manage all bookings
- **Customer Management** - View customer profiles and booking history
- **Service Management** - Add, edit, and deactivate services
- **Availability Settings** - Configure business hours and block specific dates

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS v4
- React Router DOM
- Axios
- Lucide React (icons)
- React Hook Form
- Date-fns

### Backend
- Node.js
- Express 5
- PostgreSQL
- Prisma ORM
- JSON Web Tokens (JWT)
- Bcrypt
- Nodemailer
- Express Validator

## Project Structure

```
kasaglowclean/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   │   ├── admin/        # Admin pages
│   │   │   ├── LandingPage.jsx
│   │   │   ├── ServicesPage.jsx
│   │   │   ├── BookingPage.jsx
│   │   │   └── ConfirmationPage.jsx
│   │   ├── context/          # React context
│   │   ├── services/         # API service
│   │   └── utils/            # Utility functions
│   ├── package.json
│   └── .env.example
│
├── backend/                  # Node.js backend
│   ├── src/
│   │   ├── routes/           # API routes
│   │   ├── controllers/      # Route controllers
│   │   ├── services/         # Business logic
│   │   ├── middleware/       # Express middleware
│   │   ├── config/           # Configuration
│   │   ├── utils/            # Utility functions
│   │   └── server.js         # Entry point
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/AssiamahS/kasaglowclean.git
cd kasaglowclean
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/kasaglowclean?schema=public"

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@kasaglowclean.com

# Business Settings
BUSINESS_NAME="KasaGlowClean"
BUSINESS_EMAIL=info@kasaglowclean.com
BUSINESS_PHONE="+1-555-0100"
BUFFER_TIME_MINUTES=30
```

#### Set Up Database

1. Create a PostgreSQL database:
```bash
createdb kasaglowclean
```

2. Run Prisma migrations:
```bash
npm run prisma:migrate
```

3. Generate Prisma Client:
```bash
npm run prisma:generate
```

#### Seed Initial Data (Optional)

You can use Prisma Studio to add initial services and time slots:

```bash
npm run prisma:studio
```

Or create a seed script to add:
- **Services**: House Cleaning, Deep Cleaning, Office Cleaning, Move-in/out Cleaning
- **Time Slots**: Configure business hours (e.g., Mon-Fri 8AM-6PM, Sat 9AM-5PM)
- **Admin User**: Create your first admin account

#### Start Backend Server

```bash
npm run dev
```

The backend will run on `http://localhost:3000`

### 3. Frontend Setup

#### Install Dependencies

```bash
cd ../frontend
npm install
```

#### Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

#### Start Frontend Development Server

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Initial Setup

### 1. Create Admin Account

First, temporarily remove the admin creation restriction in `backend/src/routes/admin.js`:

Comment out these lines (around line 18-22):
```javascript
// if (adminCount > 0) {
//   return res.status(403).json({
//     error: 'Admin registration is closed. Contact existing admin.'
//   });
// }
```

Then use an API client (Postman, Insomnia, or curl) to create your first admin:

```bash
curl -X POST http://localhost:3000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@kasaglowclean.com",
    "password": "your-secure-password"
  }'
```

After creating your admin, restore the restriction by uncommenting those lines.

### 2. Add Services

Log in to the admin dashboard (`http://localhost:5173/admin/login`) and add your services, or use the API:

```bash
curl -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Standard House Cleaning",
    "description": "Complete cleaning of your home including dusting, vacuuming, and mopping",
    "durationMinutes": 120,
    "price": 99.99,
    "active": true
  }'
```

### 3. Configure Business Hours

Add time slots for your business hours:

```bash
curl -X POST http://localhost:3000/api/availability/time-slots \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "dayOfWeek": 1,
    "startTime": "08:00",
    "endTime": "18:00",
    "isAvailable": true
  }'
```

Repeat for each day of the week (0 = Sunday, 6 = Saturday).

## API Endpoints

### Public Endpoints

- `GET /api/services` - Get all active services
- `GET /api/services/:id` - Get service by ID
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking by ID
- `GET /api/bookings/confirmation/:code` - Get booking by confirmation code
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `GET /api/availability/:serviceId/:date` - Get available time slots

### Admin Endpoints (Requires Authentication)

- `POST /api/admin/register` - Register admin (restricted)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/me` - Get admin profile
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/customers` - Get all customers
- `GET /api/bookings` - Get all bookings (with filters)
- `PUT /api/bookings/:id` - Update booking
- `POST /api/services` - Create service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service
- `GET /api/availability/time-slots` - Get time slots
- `POST /api/availability/time-slots` - Create time slot
- `PUT /api/availability/time-slots/:id` - Update time slot
- `DELETE /api/availability/time-slots/:id` - Delete time slot
- `GET /api/availability/blocked-dates` - Get blocked dates
- `POST /api/availability/blocked-dates` - Create blocked date
- `DELETE /api/availability/blocked-dates/:id` - Delete blocked date

## Email Configuration

### Using Gmail

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security > 2-Step Verification > App Passwords
   - Generate a password for "Mail"
3. Use the app password in your `.env` file:

```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
```

### Email Templates

The system sends these automated emails:
- **Booking Confirmation** - Sent to customer after booking
- **Admin Notification** - Sent to business owner for new bookings
- **Booking Reminder** - Sent 24 hours before appointment (requires cron job)

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables:
   - `VITE_API_URL=https://your-backend-url.com/api`
4. Deploy

### Backend (Railway/Render)

1. Create a new project on Railway or Render
2. Add a PostgreSQL database
3. Configure environment variables (all from `.env.example`)
4. Deploy from GitHub
5. Run migrations: `npm run prisma:migrate`

### Database (Supabase/PlanetScale)

For production, use a managed PostgreSQL service:
- **Supabase**: Free tier with 500MB database
- **PlanetScale**: Serverless MySQL (requires Prisma adapter)
- **Railway**: Includes PostgreSQL with your app

## Development

### Run Backend with Hot Reload

```bash
cd backend
npm run dev
```

### Run Frontend with Hot Reload

```bash
cd frontend
npm run dev
```

### Database Management

```bash
# Open Prisma Studio
npm run prisma:studio

# Create a new migration
npm run prisma:migrate

# Reset database
npx prisma migrate reset
```

## Testing

### Test Booking Flow

1. Go to `http://localhost:5173`
2. Click "Book Now"
3. Select a service
4. Choose date and time
5. Fill in customer information
6. Submit booking
7. Check confirmation page and email

### Test Admin Dashboard

1. Go to `http://localhost:5173/admin/login`
2. Log in with admin credentials
3. View dashboard statistics
4. Check bookings and customers

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `psql -U postgres`
- Check DATABASE_URL in `.env`
- Ensure database exists: `createdb kasaglowclean`

### Email Not Sending

- Verify SMTP credentials
- Check firewall/network settings
- Enable "Less secure app access" or use App Password for Gmail
- Check email logs in console

### CORS Errors

- Verify FRONTEND_URL in backend `.env`
- Check that backend is running on correct port
- Ensure VITE_API_URL in frontend `.env` matches backend URL

### Prisma Client Issues

```bash
npm run prisma:generate
```

## Future Enhancements

- [ ] Payment integration (Stripe)
- [ ] SMS notifications (Twilio)
- [ ] Recurring bookings
- [ ] Customer accounts/login
- [ ] Review and rating system
- [ ] Calendar export (iCal/Google Calendar)
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Automated reminder emails (cron job)

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.