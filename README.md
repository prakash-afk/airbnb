# Airbnb Mini App

A simple Airbnb-style web app built with Node.js, Express, EJS, Tailwind CSS, and MongoDB.
Users can browse stays, create accounts, log in, save favourites, and manage homes through a server-rendered interface.

## Features

* Add new homes with details like location, price, type, guests, rating, photo, and availability
* View all listings on the homepage and open a full detail page for each home
* Real signup and login flow with session-based authentication
* Logout support with MongoDB-backed session storage
* Per-user favourites saved in MongoDB instead of being shared globally
* Host-only pages for adding, editing, and deleting listings
* Server-side validation using Express Validator and custom validation rules
* Password hashing with `bcryptjs`
* Tailwind CSS UI with animated login/signup experience
* Custom 404 and 500 pages

## Tech Stack

* Node.js, Express
* EJS (server-side rendering)
* MongoDB, Mongoose
* Express Session, connect-mongodb-session
* Express Validator
* bcryptjs
* Tailwind CSS
* Nodemon

## Project Structure

```text
airbnb/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── views/
│   ├── auth/
│   ├── host/
│   └── store/
├── public/
├── app.js
└── package.json
```

## Run Locally

```bash
npm install
npm run tailwind   # build CSS in watch mode
npm start
```

Open: http://localhost:3001

## Environment Variables

Create a `.env` file with values like:

```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=airbnb
SESSION_SECRET=your_session_secret
```

## Current Limitations

* No production-ready authorization rules beyond simple guest/host access separation
* No booking persistence yet, bookings page is still a placeholder view
* No password reset or email verification flow
* Some shared layout pieces are still duplicated across EJS files instead of partials

## Next Steps

* Add a real bookings/reservations model
* Move repeated navbar/layout markup into EJS partials
* Add tests for auth, favourites, and host actions
* Improve role-based permissions and route guards

---

A structured learning project focused on Express MVC, MongoDB integration, sessions, authentication, and building a cleaner full-stack backend flow.
