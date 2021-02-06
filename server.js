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
const { IPData } = require('./ip_data.js');
const fetch = require('node-fetch');

app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('static')); //gia prospelash tou css
app.set('view engine', 'ejs');




app.use(cookieParser('keyboard cat'));
app.use(session({
  secret: 'secret',
  cookie: { maxAge: 100000000 },
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

      res.render('admin', { users_number, methods, responseStatus });
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
          req.session.username = newusername;
          req.session.password = newpassword;
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
  const data = req.body;
  var currentdate = new Date();
  var cached_ips = new Object();
  cached_ips.ip = [];
  console.log(cached_ips.ip.length);
  console.log(currentdate);
  for (let i=0; i < (req.body.log.entries).length; i++){
    var ip = req.body.log.entries[i].serverIPAddress;
    // check for IPv6 value inside brackets 
    if (ip.length > 3) {
      if ((ip.indexOf('[')) != -1) {
        ip = ip.substring(ip.indexOf('[') + 1, ip.indexOf(']'));
      }
      //console.log(ip);
      if ((cached_ips.ip).length == 0){ 
      // get lat & long for server ip address
        console.log("first IP to be cached" + " " + ip);
        cached_ips.ip[0] =  new Object();
        cached_ips.ip[0].ip = ip;
        //console.log(cached_ips.ip[0].ip);
        server_data = await IPData(ip);
        req.body.log.entries[i].server_lat = server_data.latitude;
        req.body.log.entries[i].server_long = server_data.longitude;
        cached_ips.ip[0].lat = server_data.latitude;
        cached_ips.ip[0].long = server_data.longitude;
        //console.log("cached" + cached_ips.ip[0].long);
      }
      
      else {
          var cached = false;
          console.log("cached: " + " " + cached);
          for (let k=0; k < (cached_ips.ip).length; k++){
            console.log("searching for IP:" + ip + "IP cached is:" + cached_ips.ip[k].ip);
            if(cached_ips.ip[k].ip == ip){
              req.body.log.entries[i].server_lat = cached_ips.ip[k].lat;
              req.body.log.entries[i].server_long = cached_ips.ip[k].long;
              console.log("ALREADY CACHED");
              cached = true;
            }
          } 
          if (!cached){
            console.log("cached:" + " " + cached);
            server_data = await IPData(ip);
            req.body.log.entries[i].server_lat = server_data.latitude;
            req.body.log.entries[i].server_long = server_data.longitude;
            let counter = cached_ips.ip.length;
            cached_ips.ip[counter] =  new Object();
            cached_ips.ip[counter].ip = ip;
            cached_ips.ip[counter].lat = server_data.latitude;
            cached_ips.ip[counter].long = server_data.longitude;
            console.log("IP not cached" + ip);
            console.log("cached " + " " + cached_ips.ip[counter].long)

          }
      }
      
    }


  }


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



  for (var i = 0; i < data.log.entries.length; i++) {
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
    pool.query(`INSERT INTO headers (content_type, cache_control, pragma, last_modified, host, age, expires, res_id) VALUES ($1, $2, $3, $4, $5, $6, $7, (SELECT MAX(response_id) FROM response))`,
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

    pool.query(`INSERT INTO headers (content_type, cache_control, pragma, last_modified, host, age, expires, req_id) VALUES ($1, $2, $3, $4, $5, $6, $7,(SELECT MAX(request_id) FROM request))`,
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



//locations gia to map tou admin
app.get("/admin/map/users", (req, res) => {
  pool.query(`SELECT  DISTINCT geolat,geolong, user_id FROM har_files `, (err, results, fields) => {
    if (err) throw err;
    //console.log(results.rows);
    res.send(results.rows)
  })
})

// epistrefei JSON me latitude kai longtitude pou exei steilei o kathe xrhsths
app.get("/admin/map/server", (req, res) => {
  pool.query(`SELECT DISTINCT  entries.serverlat, entries.serverlong, users.user_id
              FROM ((entries
              INNER JOIN har_files ON har_files.har_id = entries.har_id)
              INNER JOIN users ON users.user_id = har_files.user_id); `, (err, results, fields) => {
    if (err) throw err;
    res.send(results.rows)
    //console.log(results.rows)
  })

})
//epipleon stoixeia gia ta admin map
app.get("/admin/map/lines", (req, res) => {
  pool.query(`SELECT DISTINCT entries.serverlat, entries.serverlong, har_files.geolat, har_files.geolong, users.user_id
              FROM ((entries
              INNER JOIN har_files ON har_files.har_id = entries.har_id)
              INNER JOIN users ON users.user_id = har_files.user_id); `, (err, results, fields) => {
    if (err) throw err;
    res.send(results.rows)
    //console.log(results.rows)
  })

})



//locations gia to heatmpap tou USER
app.get("/geo", (req, res) => {
  pool.query(`SELECT serverlat, serverlong FROM entries WHERE har_id IN (SELECT har_id FROM har_files WHERE user_id IN (SELECT user_id FROM users WHERE username = $1))`, [req.session.username], (err, results, fields) => {
    if (err) throw err;
    //console.log(results.rows);
    res.send(results.rows)
  })
})

<<<<<<< Updated upstream
=======



//ADMIN PIE CHART 3-C
app.get("/admin/pie/image", (req, res) => {
  pool.query(`SELECT
              COUNT(CASE WHEN cache_control LIKE '%private%' THEN 1 END) AS private,
              COUNT(CASE WHEN cache_control LIKE '%public%' THEN 1 END) AS public,
              COUNT(CASE WHEN cache_control LIKE '%no-cache%' THEN 1 END) AS no_catch,
              COUNT(CASE WHEN cache_control LIKE '%no-store%' THEN 1 END) AS no_store
              FROM headers WHERE content_type LIKE '%image%' `, (err, results, fields) => {
    if (err) throw err;
>>>>>>> Stashed changes


<<<<<<< Updated upstream
// header content types
app.get("/admin/headers/types", (req, res) => {
  pool.query(`SELECT  DISTINCT content_type FROM headers WHERE content_type IS NOT NULL `, (err, results, fields) => {
=======
//ADMIN PIE CHART 3-C
app.get("/admin/pie/application_javascript", (req, res) => {
  pool.query(`SELECT
              COUNT(CASE WHEN cache_control LIKE '%private%' THEN 1 END) AS private,
              COUNT(CASE WHEN cache_control LIKE '%public%' THEN 1 END) AS public,
              COUNT(CASE WHEN cache_control LIKE '%no-cache%' THEN 1 END) AS no_catch,
              COUNT(CASE WHEN cache_control LIKE '%no-store%' THEN 1 END) AS no_store
              FROM headers WHERE content_type LIKE '%application/javascript%' `, (err, results, fields) => {
>>>>>>> Stashed changes
    if (err) throw err;
    //console.log(results.rows);
    res.send(results.rows)
  })
})


//ADMIN PIE CHART 3-C
app.get("/admin/pie/font", (req, res) => {
  pool.query(`SELECT
              COUNT(CASE WHEN cache_control LIKE '%private%' THEN 1 END) AS private,
              COUNT(CASE WHEN cache_control LIKE '%public%' THEN 1 END) AS public,
              COUNT(CASE WHEN cache_control LIKE '%no-cache%' THEN 1 END) AS no_catch,
              COUNT(CASE WHEN cache_control LIKE '%no-store%' THEN 1 END) AS no_store
              FROM headers WHERE content_type LIKE '%font%' `, (err, results, fields) => {
    if (err) throw err;

    console.log( results.rows)
    res.send(results.rows)
    //console.log(results.rows)
  })

})


//axreiasto alla mporei na volepsei ws texnikh gia na exoume se allo fakelo ta queries kai ta functions 
app.get('/users', db.getUsers);

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
});  