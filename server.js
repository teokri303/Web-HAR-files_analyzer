const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator({});
const fileUpload = require('express-fileupload');
const app = express();
const port = 3000;
const db = require('./database');
const { pool } = require('./database');
const index = require('./index')


app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('static')); //gia prospelash tou css
app.set('view engine', 'ejs');




app.use(cookieParser('keyboard cat'));
app.use(session({
  secret: 'secret',
  cookie: { maxAge: 1000000 },
  resave: false,
  saveUninitialized: false
}));
app.use(flash());


//flash message middleware
app.use((req, res, next) => {
  res.locals.message = req.session.message
  delete req.session.message
  next()
})




app.get('/', (req, res) => {
  res.render('login', { message: flash('success', 'error') });
});
app.get('/signup.ejs', (req, res) => {
  res.render('signup')
});
app.get('/login.ejs', (req, res) => {
  res.render('login')
});
app.get('/login/home', (req, res) => {
  res.render('home');
});
app.get('/home/upload', (req, res) => {
  res.render('upload');
});
app.get('/home/upload/choice', (req, res) => {
  res.render('uploadSEC');
});
app.get('/home/profile', (req, res) => {
  res.render('profile', { name: req.session.username, password: req.session.password });
});



//registration handler
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
  } // o kwdikos thelei prosthetous periorismous pou tha prostethoun meta gia na einai eukoles oi dokimes

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

//login handler
app.post("/login/home", async (req, res) => {
  let { username, password } = req.body;

  const sql = "SELECT username FROM users WHERE username = $1 and password = $2"
  const result = await pool.query(sql,
    [req.body.username, req.body.password]);


  if (username == "admin" && password == "adminadmin") {
    res.render('admin')
  }
  //fail
  if (result.rowCount === 0) {
    req.flash('error', 'Your username or password is wrong. ')
    res.redirect('/');
  }
  else {
    req.flash('success', 'You are now logged in. ')
    req.session.username = req.body.username;
    req.session.password = req.body.password;
    res.render('home');
  }
});

//change user information handler
app.post("/home/profile", async (req, res) => {
  let { newusername, newpassword, secpassword } = req.body;

  let errors = [];

  console.log({
    newusername,
    newpassword,
    secpassword
  });

  if (!newusername || !newpassword || !secpassword) {
    errors.push({ message: "Please enter all fields" });
  }

  if (newpassword.length < 2) {
    errors.push({ message: "Password must be a least 6 characters long" });
  } // o kwdikos thelei prosthetous periorismous pou tha prostethoun meta gia na einai eukoles oi dokimes

  if (newpassword !== secpassword) {
    errors.push({ message: "Passwords do not match" });
  }

  if (errors.length > 0) {
    res.render("profile", { name: req.session.username, password: req.session.password, errors, newusername, newpassword, secpassword });
  } else {
    // Validation passed
    pool.query(
      `UPDATE users SET username = $1, password = $2
          WHERE username = $3 AND password = $4`,
      [newusername, newpassword, req.session.username, req.session.password],
      (err, results) => {
        if (err) {
          console.log(err);
        }
        else {
          console.log(results.rows);
          req.flash("success", "Your information changed succesfully");
          res.render('profile', { name: newusername, password: newpassword });
        }
      }
    );
  }
});

//ARXIKO POST HANDLER GIA TO FILE
/*app.post("/upload/har", async (req,res) =>{
  console.log("DONE")
  try {
    let har = req.file.submited_file;
  }
  catch (error) {
    console.log(error)
  }

  console.log(har)


})*/
app.post("/upload/har", async (req, res) => {
  console.log("POST REQUEST CAME")

const submited_file = req.files.sumbited_file.data;
//const parsed = JSON.parse(submited_file.data)
//let filtered = index.har_filter(req.files.sumbited_file)
const filtered_data = index.har_filter(submited_file)
data = JSON.parse(filtered_data)
console.log('NAME OF FILE = ' + req.files.sumbited_file.name)
console.log(data.log.entries[0].serverIPAddress)



})





//axreiasto alla mporei na volepsei ws texnikh gia na exoume se allo fakelo ta queries kai ta functions 
app.get('/users', db.getUsers);

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
});  