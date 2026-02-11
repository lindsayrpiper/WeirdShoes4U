# Ecommerce Web Application Skeleton

A full-featured ecommerce web application built with Next.js 14+ App Router, TypeScript, and Tailwind CSS. This skeleton provides a solid foundation for building production-ready ecommerce platforms.

## Features

- **Product Catalog**: Browse, search, and filter products by category
- **Shopping Cart**: Add, update, and remove items with persistent cart state
- **User Authentication**: Login and signup functionality with secure password hashing
- **Checkout Flow**: Complete checkout process with shipping address
- **Order Management**: View order history and order details
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Server Components**: Leverages Next.js App Router and Server Components
- **Type Safety**: Full TypeScript implementation

## Tech Stack

- **Framework**: Next.js 14+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: bcrypt for password hashing
- **State Management**: React Context API

## Project Structure

```
ecommerce-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # Backend API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── products/      # Product CRUD operations
│   │   │   ├── cart/          # Cart management
│   │   │   └── orders/        # Order processing
│   │   ├── products/          # Frontend product pages
│   │   ├── cart/              # Frontend cart page
│   │   ├── checkout/          # Frontend checkout flow
│   │   ├── orders/            # Frontend order history
│   │   ├── auth/              # Frontend auth pages
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── backend/               # Backend business logic
│   │   ├── lib/               # Utilities and mock data
│   │   ├── models/            # Data models/types
│   │   ├── services/          # Business logic services
│   │   └── middleware/        # Auth middleware
│   ├── frontend/              # Frontend components and logic
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # React context providers
│   │   └── utils/             # Frontend utilities
│   └── types/                 # Shared TypeScript types
└── public/                     # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd ecommerce-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit:
```
http://localhost:3000
```
(Or the port shown in the terminal if 3000 is already in use)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Endpoints

### Products
- `GET /api/products` - Get all products (supports ?category, ?search, ?featured query params)
- `GET /api/products/[id]` - Get single product by ID
- `GET /api/products/categories` - Get all categories

### Cart
- `GET /api/cart?cartId={id}` - Get cart by ID
- `POST /api/cart` - Add item to cart
  ```json
  { "cartId": "string", "productId": "string", "quantity": number }
  ```
- `PUT /api/cart` - Update item quantity
  ```json
  { "cartId": "string", "productId": "string", "quantity": number }
  ```
- `DELETE /api/cart?cartId={id}&productId={id}` - Remove item from cart

### Orders
- `GET /api/orders?userId={id}` - Get user orders
- `POST /api/orders` - Create new order
  ```json
  {
    "userId": "string",
    "cartId": "string",
    "shippingAddress": {
      "fullName": "string",
      "address": "string",
      "city": "string",
      "state": "string",
      "zipCode": "string",
      "country": "string",
      "phone": "string"
    }
  }
  ```
- `GET /api/orders/[id]` - Get order by ID

### Authentication
- `POST /api/auth/register` - Register new user
  ```json
  { "email": "string", "password": "string", "name": "string" }
  ```
- `POST /api/auth/login` - Login user
  ```json
  { "email": "string", "password": "string" }
  ```

## Demo Account

For testing purposes, use the following demo account:

- **Email**: demo@example.com
- **Password**: demo123

## Key Components

### Backend Services

- **productService**: Manages product catalog, search, and filtering
- **cartService**: Handles cart operations (add, update, remove)
- **orderService**: Processes orders and manages order history
- **authService**: Handles user registration and authentication

### Frontend Components

- **Navbar**: Navigation with cart count and user status
- **ProductCard**: Individual product display
- **ProductList**: Grid of product cards
- **CartItem**: Cart item with quantity controls
- **CartSummary**: Order summary with totals
- **SearchBar**: Product search functionality
- **AuthForm**: Login/signup form
- **OrderCard**: Order summary card

### Context Providers

- **CartContext**: Global cart state management
- **AuthContext**: User authentication state

## Features to Implement Next

This is a skeleton application. Here are suggested features to add:

1. **Database Integration**: Replace in-memory storage with PostgreSQL/MongoDB
2. **Payment Processing**: Integrate Stripe or PayPal
3. **Image Upload**: Add product image upload functionality
4. **Admin Dashboard**: Create admin panel for managing products/orders
5. **Product Reviews**: Add rating and review system
6. **Wishlist**: Implement wishlist functionality
7. **Email Notifications**: Send order confirmation emails
8. **Advanced Search**: Add filters, price ranges, sorting
9. **Inventory Management**: Track stock levels accurately
10. **Multi-currency Support**: Add currency conversion

## Data Storage

Currently using in-memory storage (Map objects) for:
- Cart data
- Order data
- User data (with mock users)

**Important**: Data will reset when the server restarts. For production, integrate with a database.

## Environment Variables

Create a `.env.local` file (already exists) and configure:

```env
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
```

## Testing the Application

1. **Homepage**: Visit `/` to see featured products
2. **Product Catalog**: Navigate to `/products` to browse all products
3. **Product Detail**: Click any product to view details
4. **Add to Cart**: Click "Add to Cart" on any product
5. **View Cart**: Click cart icon in navbar to view cart
6. **Checkout**: Click "Proceed to Checkout" (requires login)
7. **Authentication**: Login with demo account or create new account
8. **Place Order**: Complete checkout form to place order
9. **Order History**: View orders at `/orders`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - Feel free to use this skeleton for your projects.

## Contributing

This is a skeleton project for educational purposes. Feel free to fork and customize for your needs.

## Support

For issues or questions, please refer to the Next.js documentation:
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
