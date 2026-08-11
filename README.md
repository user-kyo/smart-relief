# SmartRelief Disaster Coordination System

An AI-Powered Disaster Resource Coordination and Decision Support System featuring Super Admin, LGU-DRRM Admin, Responder, and Citizen role portals.

## Architecture

This project is separated into decoupled frontend and backend applications.

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express, Gemini AI API

## Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.

## Run Locally

You will need to open two separate terminals to run both the frontend and backend development servers.

### 1. Start the Backend

In your first terminal, navigate to the `backend` directory and install the dependencies:

```bash
cd backend
npm install
```

Next, set up your environment variables. Copy the example `.env` file:

```bash
cp .env.example .env
```
*(On Windows, you can just copy and paste the file manually and rename it to `.env`)*

Open the `.env` file and add your `GEMINI_API_KEY`.

Start the backend development server:

```bash
npm run dev
```
The backend server will run on `http://localhost:3000`.

### 2. Start the Frontend

In your second terminal, navigate to the `frontend` directory and install the dependencies:

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```
The frontend Vite server will typically run on `http://localhost:5173`. Any API requests made to `/api` from the frontend will be automatically proxied to the backend server.
