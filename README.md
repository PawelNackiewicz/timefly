# TimeFly

## Project Description

TimeFly is a time tracking application that simplifies the process of recording work hours through a check-in/check-out mechanism with PIN verification. It aims to automate time registration for employees while providing administrators with the ability to manually intervene when necessary, thus reducing administrative overhead and improving accuracy.

## Tech Stack

- **Frontend**:
  - Astro - Modern static site builder with React integration
  - React - JavaScript library for building user interfaces
  - Tailwind CSS - Utility-first CSS framework for rapid UI development
  - shadcn/ui - High-quality, accessible UI components built on Radix UI and Tailwind
- **Backend & Database**:
  - Supabase - Open source Firebase alternative providing authentication, PostgreSQL database, and real-time subscriptions
  - PostgreSQL - Advanced open-source relational database
- **Testing**:
  - Playwright - End-to-end testing framework (to be implemented post-MVP)
- **Deployment**:
  - Vercel - Platform for frontend deployment, optimized for Astro

## Live Environments

TimeFly is deployed on two environments:

- **Production**: [http://prod-timefly.vercel.app/](http://prod-timefly.vercel.app/)
- **Test/Preview**: [https://prev-timefly.vercel.app/](https://prev-timefly.vercel.app/)

### How to Use the System

#### Employee Clock-In/Clock-Out (Test Environment)

On the test environment, you can access the employee clock-in/clock-out interface without logging in:

1. Navigate to [https://prev-timefly.vercel.app/clock](https://prev-timefly.vercel.app/clock)
2. This view allows employees to start and end their work shifts using their PIN
3. No authentication is required for this view

#### Admin Access

To access the administrative dashboard with full management capabilities:

1. Navigate to the login page at [https://prev-timefly.vercel.app/login](https://prev-timefly.vercel.app/login)
2. Use the following credentials:
   - **Email**: public@user.com
   - **Password**: P@ssword1!
3. Once logged in, you'll have access to:
   - Employee management
   - Time tracking reports
   - Dashboard with KPIs
   - Manual time entry corrections

## Getting Started Locally

To get started with TimeFly locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/timefly.git
   cd timefly
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

## Available Scripts

- `dev`: Starts the development server.
- `start`: Alias for `dev`.
- `build`: Builds the application for production.
- `preview`: Previews the production build.

## Project Scope

The initial version of TimeFly (MVP) includes:

- Automated check-in/check-out process with PIN verification.
- Manual intervention capabilities for administrators.
- A responsive web interface optimized for mobile devices.
- Employee list with search and filter functionality.
- An admin panel displaying key performance indicators (KPIs).

Advanced security features and integrations with other systems are not included in the MVP.

## Project Status

The project is currently in the MVP development phase, focusing on core functionalities.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
