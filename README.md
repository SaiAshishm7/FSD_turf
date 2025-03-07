# Friendly Turf Booking System

A modern, user-friendly web application for booking sports turfs. Built with React, TypeScript, and Supabase, featuring real-time availability, seamless booking management, and automated email notifications.

![Turf Booking System](public/screenshot.png)

## Features

- 📅 Real-time turf availability calendar
- 🕒 Flexible time slot selection
- 👥 Multiple player capacity options
- 💳 Transparent pricing system
- ✉️ Automated email confirmations
- 🔐 Secure user authentication
- 📱 Responsive design
- ⚡ Real-time booking updates
- 🎯 5-day advance booking window

## Tech Stack

- **Frontend:**
  - React
  - TypeScript
  - Tailwind CSS
  - Shadcn UI Components
  - React Router DOM

- **Backend:**
  - Supabase (Database & Authentication)
  - Express.js (Email Service)
  - Node.js

- **Email Service:**
  - Nodemailer

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn
- Git

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SaiAshishm7/FSD_turf.git
   cd friendly-turf-booking
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up the email service:
   ```bash
   cd email-service
   npm install
   ```
   Create a `.env` file in the email-service directory:
   ```env
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_app_password
   ```

## Running the Application

1. Start the frontend development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Start the email service:
   ```bash
   cd server
   npm start
   ```


## Database Schema

The application uses the following main tables in Supabase:

- **users** - User authentication and profile information
- **turfs** - Turf details including name, location, and pricing
- **bookings** - Booking records with status tracking

## Features in Detail

### Booking System
- Interactive calendar for date selection
- Real-time availability checking
- Flexible duration options (1-3 hours)
- Multiple player capacity options (5-20 players)
- Automatic price calculation based on duration

### User Management
- Secure authentication
- Booking history
- Email notifications
- Password reset functionality

### Admin Features
- Booking management
- Turf management
- User management
- Booking status updates

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@friendlyturf.com or create an issue in the repository.

## Acknowledgments

- [Supabase](https://supabase.com/) for the backend infrastructure
- [Shadcn UI](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the styling system
