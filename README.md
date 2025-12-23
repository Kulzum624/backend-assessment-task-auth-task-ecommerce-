# Backend Assignment Projects

This repository contains implementation of three backend projects as part of a technical assignment.

## Projects Implemented
1. **User Authentication & RBAC API** (Mandatory)
2. **Task Management API**
3. **E-commerce Backend API**

## Technologies Used
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **PostgreSQL**: Relational database
- **Sequelize**: ORM for Node.js
- **JWT**: For authentication
- **Bcryptjs**: For password hashing
- **Joi**: For request validation
- **Helmet**: For security headers
- **Morgan**: For request logging
- **CORS**: For cross-origin requests

## Project Structure
```
src/
 ├── config/         # Database (Sequelize) and app configurations
 ├── controllers/    # Route handlers
 ├── middlewares/    # Custom middlewares (Auth, Error)
 ├── models/         # Sequelize model definitions
 ├── routes/         # API route definitions
 ├── utils/          # Utility functions and validation
 └── server.js      # Entry point
```

## Setup Instructions

### Prerequisites
- Node.js installed
- PostgreSQL installed and running
- **pgAdmin** installed (optional, for viewing the database)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_NAME=backend_assignment
   DB_PORT=5432
   JWT_SECRET=your_secret_key
   JWT_EXPIRE=24h
   NODE_ENV=development
   ```
   **Note**: Ensure you create the database named `backend_assignment` in PostgreSQL before running the app.

4. Run the application:
   ```bash
   # Production mode
   npm start
   
   # Development mode (with nodemon)
   npm run dev
   ```
   The application will automatically sync models to your database on startup in development mode.

## API Documentation

### 1. User Authentication & RBAC
- **POST /api/v1/auth/register**: Register a new user (Role can be 'user' or 'admin').
- **POST /api/v1/auth/login**: Login and receive JWT token.
- **GET /api/v1/auth/me**: Get current user details (Private).

### 2. Task Management
- **GET /api/v1/tasks**: Get all tasks for logged-in user (supports pagination & filtering).
- **POST /api/v1/tasks**: Create a new task.
- **GET /api/v1/tasks/:id**: Get single task.
- **PUT /api/v1/tasks/:id**: Update task.
- **DELETE /api/v1/tasks/:id**: Delete task.

### 3. E-commerce
- **GET /api/v1/ecommerce/categories**: List all categories.
- **POST /api/v1/ecommerce/categories**: Create a category (Admin only).
- **GET /api/v1/ecommerce/products**: List all products.
- **POST /api/v1/ecommerce/products**: Create a product (Admin only).
- **GET /api/v1/ecommerce/cart**: View user's cart.
- **POST /api/v1/ecommerce/cart**: Add item to cart.
- **POST /api/v1/ecommerce/orders**: Place an order (inventory will be updated).

## Design Decisions & Best Practices
- **ORM**: Switched to Sequelize for better compatibility with PostgreSQL and robust relational handling.
- **RBAC**: Middleware to enforce role-based permissions.
- **Stateless Auth**: JWT-based authentication for scalability.
- **Transitions**: Used Sequelize Hooks for automatic password hashing.
- **Transactions**: Used Sequelize transactions for order placement to ensure data integrity during inventory updates.
- **Security**: Basic headers and CORS protection.
