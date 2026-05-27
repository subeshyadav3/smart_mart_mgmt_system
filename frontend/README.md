# Smart Mart Frontend

Professional Next.js + TypeScript frontend for the Smart Mart Management System.

## Features

- **Staff Dashboard**: Manage products, inventory, sales, and billing
- **Member Portal**: Shop products, track loyalty points, view orders
- **Authentication**: Secure login for both staff and members
- **Product Management**: Add, edit, delete, and search products
- **Inventory Tracking**: Real-time stock monitoring and logs
- **Billing System**: Create bills, manage cart, apply discounts
- **Responsive Design**: Mobile-friendly Tailwind CSS UI

## Tech Stack

- **Framework**: Next.js 15 + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Context API + Zustand
- **HTTP Client**: Axios
- **UI Components**: Lucide React Icons
- **Notifications**: React Hot Toast
- **Storage**: Cookies (js-cookie)

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # Reusable React components
├── services/         # API client and services
├── lib/              # Utility functions
├── types/            # TypeScript types
├── context/          # React Context providers
├── hooks/            # Custom React hooks
└── public/           # Static assets
```

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create `.env.local` file**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

## Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types

## Usage

### Staff User

1. Go to `/auth/login`
2. Login with staff credentials (email + password)
3. Access dashboard at `/dashboard`
4. Manage products, inventory, and create bills

### Member User

1. Go to `/auth/member-register` to create account
2. Login at `/auth/member-login` with membership ID
3. Access member portal at `/member/home`
4. Shop and manage orders

## API Endpoints

Frontend communicates with backend API at `http://localhost:5000/api`

### Authentication
- `POST /api/auth/staff/login` - Staff login
- `POST /api/auth/member/login` - Member login
- `POST /api/auth/member/register` - Member registration

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PATCH /api/products/:id/stock` - Adjust stock

### Sales
- `POST /api/sales/bills` - Create bill
- `GET /api/sales/bills` - List bills

### Workforce
- `GET /api/workforce` - List staff
- `POST /api/workforce` - Create staff

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:5000)

## License

Proprietary - Smart Mart Management System
