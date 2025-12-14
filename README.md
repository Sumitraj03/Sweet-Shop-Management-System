# Sweet Shop Management System

---

## 1. Project Objective

The Sweet Shop Management System is a full-stack web application developed to manage sweet shop operations in a structured and scalable manner.

The objective of this project is to design, build, and test a system that follows modern software engineering practices, including:

- RESTful API design  
- Database-driven data management  
- Secure user authentication  
- Frontend and backend integration  
- Clean, modular, and maintainable code  

This project is developed according to the **AI Kata: Sweet Shop Management System** requirements.

---

## 2. System Architecture Overview

The application follows a client–server architecture.

### Frontend (Client)

A single-page application (SPA) built using React, providing a responsive and user-friendly interface for interacting with the system.

### Backend (Server)

A RESTful API designed according to the specifications, responsible for handling business logic, authentication, authorization, and database operations.

### Database

A persistent database is used to store users, sweets, and inventory information.  
In-memory storage is intentionally avoided to ensure data persistence and reliability.

---

## 3. Backend Design

### 3.1 Backend Technology Choice

The backend is designed using **Node.js with Express**.

This technology supports scalable application development, clean REST API design, and efficient request handling.

---

### 3.2 Authentication and Authorization

The system implements JWT (JSON Web Token) based authentication.

Key aspects include:
- User registration and login functionality
- Token-based authentication after successful login
- Protected routes accessible only with valid tokens
- Role-based authorization for admin-level operations

Authentication endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`

---

### 3.3 Sweet Management APIs

Each sweet entity contains the following attributes:
- Unique ID
- Name
- Category
- Price
- Quantity in stock

Available endpoints:
- `POST /api/sweets` – Add a new sweet  
- `GET /api/sweets` – Retrieve all available sweets  
- `GET /api/sweets/search` – Search sweets by name, category, or price range  
- `PUT /api/sweets/:id` – Update sweet details  
- `DELETE /api/sweets/:id` – Delete a sweet (Admin only)  

---

### 3.4 Inventory Management

Inventory operations are handled using the following endpoints:

- `POST /api/sweets/:id/purchase`  
  - Reduces stock quantity when a sweet is purchased  
  - Prevents purchase if stock is zero  

- `POST /api/sweets/:id/restock`  
  - Increases stock quantity  
  - Accessible only to admin users  

These operations ensure accurate inventory control.

---

## 4. Frontend Application

### 4.1 Frontend Technology

The frontend is developed using React with a component-based architecture and modern JavaScript.

---

### 4.2 Frontend Functionality

The frontend provides:
- User registration and login forms  
- A dashboard displaying all available sweets  
- Search and filter functionality  
- Purchase button for each sweet, disabled when stock is zero  
- Admin interfaces to add, update, and delete sweets  

The frontend communicates with the backend through RESTful APIs.

---

### 4.3 User Interface and Experience

The user interface is designed to be:
- Responsive across devices  
- Clean and minimal  
- Easy to navigate  
- Focused on usability and clarity  

---

## 5. Test-Driven Development

The project follows Test-Driven Development (TDD) principles:
- Tests are written before implementing backend logic  
- Development follows the Red → Green → Refactor cycle  
- Backend logic is covered with meaningful test cases  

This ensures reliable and predictable API behavior.

---

## 6. Clean Code and Best Practices

The project follows standard clean coding practices:
- Readable and well-structured code  
- Meaningful naming conventions  
- Modular and maintainable design  
- Clear separation of concerns  
- Well-defined API responsibilities  

---

## 7. Git and Version Control

Git is used for version control with:
- Small and descriptive commits  
- Logical commit history  
- Clear tracking of development progress  

---

## 8. AI Usage Transparency

AI tools were used responsibly during development for:
- Understanding project requirements  
- Generating initial boilerplate code  
- Debugging and refining logic  
- Assisting with documentation  

AI usage is documented transparently as required.

---

## 9. Deliverables

The project includes:
- A public GitHub repository  
- Complete project documentation  
- Frontend application  
- Backend API design  
- Clear scope for testing and deployment  

---

## 10. Summary (Interview-Ready)

> This project is a full-stack Sweet Shop Management System developed as part of an AI Kata.  
> It includes a React-based frontend and a RESTful backend design with authentication, inventory management, and role-based access control.  
> The system follows clean code principles, test-driven development, and modern software engineering best practices.


