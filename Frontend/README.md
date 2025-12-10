# FreshCount - Restaurant Inventory Management

A full-stack inventory management system built with React, Node.js, Express, and Firebase.

## Prerequisites

1.  **Node.js**: Ensure you have Node.js installed.
2.  **Firebase Project**:
    - Go to [Firebase Console](https://console.firebase.google.com/).
    - Create a new project.
    - Enable **Firestore Database**.
    - Go to **Project Settings > Service Accounts**.
    - Generate a new **private key** and save the JSON file.

## Setup Instructions

### 1. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  **Configure Firebase**:
    - Rename the downloaded Firebase JSON key to `serviceAccountKey.json`.
    - Place it inside the `backend/` folder.
4.  **Configure Environment**:
    - Copy `.env.example` to `.env`:
      ```bash
      cp .env.example .env
      ```
    - (Optional) Update `JWT_SECRET` in `.env` for security.
5.  **Seed Database** (Create initial Admin/Staff users & products):
    ```bash
    node seed.js
    ```
6.  Start the server:
    ```bash
    npm run dev
    ```
    The backend will run on `http://localhost:5000`.

### 2. Frontend Setup

1.  Open a new terminal and navigate to the root directory (FreshCount):
    ```bash
    cd ..  # If you are in backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The frontend will run on `http://localhost:5173`.

## Usage

1.  Open your browser to `http://localhost:5173`.
2.  **Login Credentials**:
    - **Admin**: `admin@freshcount.com` / `admin123`
    - **Staff**: `staff@freshcount.com` / `staff123`

### Features by Role

- **Staff**:
  - View Dashboard & Inventory.
  - Add Stock (IN) for products.
  - View Stock History.
- **Admin**:
  - Full access to all features.
  - Manage Users (Create/Delete).
  - Create/Edit/Delete Categories & Products.
  - Remove Stock (OUT) and Delete Stock Records.
