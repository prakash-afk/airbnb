const express = require('express');
const path = require('path');

const errorController = require('./controllers/errorController');
const userRouter = require('./routes/userRouter');
const hostRouter = require('./routes/hostRouter');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(userRouter);
app.use(hostRouter);

app.use(errorController.get404);
app.use(errorController.get500);

module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
}
