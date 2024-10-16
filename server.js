import app from "./app.js";

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});



const express = require('express');
const passport = require('passport');
const session = require('express-session');

const app = express();

app.use(session({ secret: 'your secret key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());