# Event Booking System

A full-stack event booking platform built with a **microservices architecture**. Users browse events, buy tickets, rate and comment on events, and see their order history. Admins and managers use a back office to create and manage events.

Built as the final project of a web development workshop at the Technion.

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Material UI |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB (Mongoose) |
| Messaging | RabbitMQ (amqplib, fanout exchanges) |
| Auth | JWT in HTTP-only cookies, bcrypt |

## Architecture

```
                 ┌──────────────┐
                 │   Frontend   │  React + Vite
                 └──────┬───────┘
                        │ HTTP
                 ┌──────▼───────┐
                 │ API Gateway  │  auth, users, routing   :3000
                 └──────┬───────┘
       ┌────────────┬───┴────────┬──────────────┐
       ▼            ▼            ▼              ▼
  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────────┐
  │ Event   │  │ Order   │  │ Comment │  │ User History │
  │ :3001   │  │ :3002   │  │ :3003   │  │ :3004        │
  └────┬────┘  └────┬────┘  └────┬────┘  └──────┬───────┘
       └────────────┴─────┬──────┴──────────────┘
                          ▼
                  RabbitMQ (events)
```

The frontend only talks to the **API Gateway**. The gateway checks the JWT, then forwards the request to the right service. Services keep each other in sync through RabbitMQ messages, for example:

- tickets are bought → Event API updates the tickets available and the lowest price
- an order is created → User History API saves the event for that user
- a comment or rating is added → Event API updates the event
- an event is deleted → Order API deletes its tickets

## Services

| Folder | Port | What it does |
| --- | --- | --- |
| [`services/wsp-project-api-gateway`](services/wsp-project-api-gateway) | 3000 | Login, signup, logout, password reset, user permissions, and routing to the other services |
| [`services/event-API`](services/event-API) | 3001 | Events (CRUD, filter by price, sort, tickets available) and ratings |
| [`services/order-API`](services/order-API) | 3002 | Tickets and orders, including payment |
| [`services/comment-API`](services/comment-API) | 3003 | Comments on events |
| [`services/userHistory-API`](services/userHistory-API) | 3004 | Each user's past and upcoming events |
| [`services/user-API`](services/user-API) | — | Early standalone user service (the gateway now handles users) |
| [`services/rating-API`](services/rating-API) | — | Early standalone rating service (ratings now live in Event API) |

User roles: **User**, **Worker**, **Manager**, **Admin**. The back office is for the staff roles.

## Frontend

[`frontend/`](frontend) has two parts:

- **Front office** – event catalog, event page with tickets, comments and ratings, checkout, success page, user page
- **Back office** – event catalog, event details, create event

## Running locally

Requirements: Node.js 20+, a MongoDB database, and a RabbitMQ instance (for example CloudAMQP).

### 1. Start the services

Run each service in its own terminal:

```bash
cd services/event-API
```

```bash
npm install
```

```bash
npm run dev
```

Repeat for `order-API`, `comment-API`, `userHistory-API`, and `wsp-project-api-gateway`.

Each service reads its secrets from a `.env` file in its folder (never committed):

| Variable | Used by | Meaning |
| --- | --- | --- |
| `PORT` | all | Port to listen on (defaults in the table above) |
| `DBPASS` | all | MongoDB password |
| `RABBITMQPASS` | all except user/rating | RabbitMQ password |
| `JWT_SECRET` | gateway | Secret for signing tokens |
| `EVENT_URL`, `RATING_URL`, `TICKET_URL`, `ORDER_URL`, `COMMENT_URL`, `USERHISTORY_URL` | gateway | Service URLs (default to localhost) |
| `EVENT_API_URL` | userHistory-API | Event API URL |

> **Note:** the MongoDB and RabbitMQ hostnames are currently set in each service's `src/index.ts` and `src/messaging/rabbitmq.ts`. Point them at your own instances before running.

### 2. Start the frontend

```bash
cd frontend
```

```bash
npm install
```

```bash
npm run dev
```

In development the frontend calls the gateway at `http://localhost:3000`.

## Project status

The original deployment (Render + MongoDB Atlas + CloudAMQP) is offline. Planned next steps:

- [ ] Re-host the services and the database
- [ ] Move database and RabbitMQ URLs into environment variables
- [ ] Move the GitHub Pages workflow to the repo root
- [ ] Improve the frontend, page by page

## Team

Team project. Backend services and messaging by Matias; frontend by a teammate.
