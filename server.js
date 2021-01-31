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
const { string } = require('joi');
const  {IPData} = require('./ip_data.js');
const fetch = require('node-fetch');

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
app.get('/home/profile', (req, res) => {
  res.render('profile', { name: req.session.username, password: req.session.password });
});

//ADMIN PAGE ANALYTICS 
app.get('/login/admin', async (req, res) => {
//USERS
  pool.query("SELECT * FROM users", function (err, user_info) {
    if (err)
      throw err;
    else {

      users = user_info;
    }
  });
  //REGISTERED USERS
  pool.query("SELECT COUNT(*) FROM users", function (err, count) {
    if (err)
      throw err;
    else {
      users_number = count.rows[0].count;
    }
  });
  //RESPONSE STATUS COUNT
  pool.query("SELECT status, COUNT(*) FROM response GROUP BY status", function (err, status_count) {
    if (err)
      throw err;
    else {
      responseStatus = status_count.rows;
      //console.log(parseInt(responseStatus[0].status))
      //console.log(responseStatus)
    }
  });
  //METHODS STATUS COUNT
  pool.query("SELECT method, COUNT(*) FROM request GROUP BY method", function (err, get_method) {
    if (err)
      throw err;
    else {
      methods = get_method.rows;
      //console.log(methods)
      
      res.render('admin', { users, users_number, methods, responseStatus });
      res.end();
    }
  });
  


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
    res.redirect('/login/admin')

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

//upload har and store in database handler
app.post("/upload/har", async (req, res) => {
  console.log("POST REQUEST CAME");
  //console.log(req.body);
  const data = req.body;
  var currentdate = new Date();
  for (let i=0; i < (req.body.log.entries).length; i++){

    var ip = req.body.log.entries[i].serverIPAddress;
    if(ip.length > 3) {
      if((ip.indexOf('[')) !=-1 ){
         ip = ip.substring(ip.indexOf('[') + 1, ip.indexOf(']')); 
      }
      server_data = await IPData(ip);
      req.body.log.entries[i].server_lat = server_data.latitude;
      req.body.log.entries[i].server_long = server_data.longitude;
    
    }
  }
  console.log(data.log.entries[0].server_lat)
  
  //last-update in table users insert when you upload har
  pool.query(`UPDATE users SET lastupload = $1 WHERE username = $2`,
  [currentdate, req.session.username],
  (err, results) => {
    if (err) {
      throw err;
    }
  })
    
  //inserting values into Har-Files
  pool.query(`INSERT INTO har_files (host, geolat, geolong, user_id) VALUES ($1, $2, $3, (SELECT user_id FROM users WHERE username = $4))`,
  [data.log.user_data.organization_name, data.log.user_data.latitude, data.log.user_data.longitude, req.session.username],
  (err, results) => {
    if (err) {
      throw err;
    }
  })


  
  for (var i = 0; i < data.log.entries.length; i++){
    pool.query(`INSERT INTO entries (starteddatetime, serveripaddress, timings, serverlat, serverlong, har_id) VALUES ($1, $2, $3, $4, $5, (SELECT MAX(har_id) FROM har_files))`,
      [data.log.entries[i].startedDateTime, data.log.entries[i].serverIPAddress, data.log.entries[i].timings.wait, data.log.entries[i].server_lat, data.log.entries[i].server_long],
      (err, results) => {
        if (err) {
          throw err;
        }
      })

    pool.query(`INSERT INTO request (method, url, en_id) VALUES ($1, $2, (SELECT MAX(entries_id) FROM entries))`,
      [data.log.entries[i].request.method, data.log.entries[i].request.url],
      (err, results) => {
        if (err) {
          throw err;
        }
      })
    pool.query(`INSERT INTO response (status, statustext, en_id) VALUES ($1, $2, (SELECT MAX(entries_id) FROM entries))`,
      [data.log.entries[i].response.status, data.log.entries[i].response.statusText],
      (err, results) => {
        if (err) {
          throw err;
        }
      })
    pool.query(`INSERT INTO headers (content_type, cache_control, pragma, last_modified, host, age, expires, en_id) VALUES ($1, $2, $3, $4, $5, $6, $7, (SELECT MAX(entries_id) FROM entries))`,
      [data.log.entries[i].response.headers.content_type,
      data.log.entries[i].response.headers.cache_control,
      data.log.entries[i].response.headers.pragma,
      data.log.entries[i].response.headers.last_modified,
      data.log.entries[i].response.headers.host,
      data.log.entries[i].response.headers.age,
      data.log.entries[i].response.headers.expires,
      ],
      (err, results) => {
        if (err) {
          throw err;
        }
      })

    pool.query(`INSERT INTO headers (content_type, cache_control, pragma, last_modified, host, age, expires) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [data.log.entries[i].request.headers.content_type,
      data.log.entries[i].request.headers.cache_control,
      data.log.entries[i].request.headers.pragma,
      data.log.entries[i].request.headers.last_modified,
      data.log.entries[i].request.headers.host,
      data.log.entries[i].request.headers.age,
      data.log.entries[i].request.headers.expires
      ],
      (err, results) => {
        if (err) {
          throw err;
        }
      })

  }
  
  console.log("SAAAAAVEEEEDDDD")


})



//TEST GIA TRAVIGMA LAT LONG APO ENTRIES

app.get("/test", (req, res) =>{
  pool.query(`SELECT username FROM users`, (err,results,fields) =>{
    if(err) throw err;
    console.log(results.rows);
    res.send(results.rows)
  })
})
app.get("/geo", (req, res) =>{
  pool.query(`SELECT serverlat, serverlong FROM entries`, (err,results,fields) =>{
    if(err) throw err;
    console.log(results.rows);
    res.send(results.rows)
  })
})







//axreiasto alla mporei na volepsei ws texnikh gia na exoume se allo fakelo ta queries kai ta functions 
app.get('/users', db.getUsers);

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
});  