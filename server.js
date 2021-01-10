const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require("bcrypt");
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator({});
const app = express();
const port = 3000;
const db = require('./database');
const { pool } = require('./database');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('static')); //gia prospelash tou css
app.set('view engine', 'ejs');




app.use(cookieParser('keyboard cat'));
app.use(session({
  secret: 'secret',
  cookie: { maxAge: 60000 },
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

//flash message middleware
app.use((req, res, next)=>{
  res.locals.message = req.session.message
  delete req.session.message
  next()
})




app.get('/', (req, res) => {
  res.render('login', { message: flash('success', 'error') });
});
app.get('/signup.ejs', (req, res) => {
  res.render('signup')
})


app.post("/register", async (req, res) => {
  let { email, username, password, secpassword } = req.body;

  let errors = [];

  console.log({
    email,
    username,
    password,
    secpassword
  });

  if (!email || !username || !password || !secpassword) {
    errors.push({ message: "Please enter all fields" });
  }

  if (password.length < 2) {
    errors.push({ message: "Password must be a least 6 characters long" });
  }

  if (password !== secpassword) {
    errors.push({ message: "Passwords do not match" });
  }

  if (errors.length > 0) {
    res.render("signup", { errors, email, username, password, secpassword });
  } else {
    // Validation passed
    pool.query(
      `SELECT * FROM users
          WHERE email = $1`,
      [email],
      (err, results) => {
        if (err) {
          console.log(err);
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          req.flash('error', 'Email already in use');
          return res.render('signup');
          
        } else {
          pool.query(
            `INSERT INTO users (username, password, email)
                  VALUES ($2, $3, $1)`,
            //RETURNING user_ID, password`,
            [email, username, password],
            (err, results) => {
              if (err) {
                throw err;
              }
              console.log(results.rows);
              req.flash("success", "You are now registered. Please log in");
              res.render('login');
            }
          );
        }
      }
    );
  }
});


app.post("/users/login", async (req, res) => {
  const sql = "SELECT username FROM users WHERE username = $1 and password = $2"
  const result = await pool.query(sql,
    [req.body.username, req.body.password]);

  //fail
  if (result.rowCount === 0){
    req.flash('error', 'Your username or password is wrong. ')
    res.redirect('/');
  }  
  else{
    req.flash('success', 'You are now logged in. ')
    res.render('start');
  }  
});




app.get('/users', db.getUsers);

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
});  