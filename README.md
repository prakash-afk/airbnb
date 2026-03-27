# Airbnb Mini App

A simple Airbnb-style web app built with Node.js, Express, EJS, and Tailwind CSS.
Users can add homes and view listings in a clean server-rendered interface.

## Features

* Add new homes with details (location, price, type, guests)
* View all listings on homepage
* MVC-style structure (routes, controllers, shared store)
* Tailwind CSS UI
* Custom 404 page

## Tech Stack

* Node.js, Express
* EJS (server-side rendering)
* Tailwind CSS
* Nodemon

## Project Structure

```
airbnb/
├── controllers/
├── routes/
├── data/
├── views/
├── public/
├── app.js
```

## Run Locally

```
npm install
npm run tailwind   # build CSS
npm start
```

Open: http://localhost:3001

## Current Limitations

* Data stored in memory (no database)
* No edit/delete functionality
* No validation layer

## Next Steps

* Add database (MongoDB / PostgreSQL)
* Implement edit/delete listings
* Add authentication

---

A clean beginner project focused on understanding Express architecture and building structured backend systems.
