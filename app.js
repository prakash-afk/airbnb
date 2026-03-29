const loadEnv = require('./config/loadEnv');
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const path = require('path');

const { connectToMongo } = require('./config/mongo');
const authRouter = require('./routes/authRouter');
const errorController = require('./controllers/errorController');
const userRouter = require('./routes/userRouter');
const hostRouter = require('./routes/hostRouter');

loadEnv();

const app = express();
const sessionStore = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  databaseName: process.env.MONGODB_DB_NAME || 'airbnb',
  collection: 'sessions',
});

sessionStore.on('error', (error) => {
  console.error('Session store error:', error.message);
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'airbnb-super-secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    name: 'airbnb.sid',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    },
  })
);
app.use((req, res, next) => {
  res.locals.isLoggedIn = Boolean(req.session?.isLoggedIn);
  res.locals.currentUser = req.session?.user || null;
  next();
});

app.use(authRouter);
app.use(userRouter);
app.use(hostRouter);

app.use(errorController.get404);
app.use(errorController.get500);

module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 3001;

  connectToMongo()
    .then(() => {
      app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}/`);
      });
    })
    .catch((error) => {
      console.error('Failed to connect to MongoDB:', error.message);
      process.exit(1);
    });
}
