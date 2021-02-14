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
  pool.query('SELECT lastupload FROM users WHERE username = $1',[req.session.username], function(err, result){
    if (err)
    throw err;
    else{
      time = result.rows;
      //console.log(time)
    }

  })
  pool.query("SELECT COUNT(user_id) FROM har_files WHERE user_id IN (SELECT user_id FROM users WHERE username = $1)",[req.session.username], function (err, count) {
    if (err)
      throw err;
      else {
        console.log(count)
        res.render('profile', { name: req.session.username, password: req.session.password, last_upload: time, count: count });
      }
  });
});
app.get('/login/admin',(req, res) => {
  res.render('admin')
});

//REGISTERED USERS COUNT ADMIN
app.get('/admin/info/users/count',(req, res) => {
  pool.query("SELECT COUNT(*) FROM users",(err, result) =>{
    if (err) throw err;
    res.send(result.rows[0].count)
    
  });
});
//INTERNET PROVIDERS COUNT ADMIN
app.get('/admin/info/providers/count',(req, res) => {
  pool.query("SELECT COUNT(DISTINCT host) AS count FROM har_files",(err, result) => {
    if (err) throw err;
    //console.log(result.rows[0].count)
    res.send(result.rows[0].count)
  });
});
//METHODS STATUS COUNT ADMIN
app.get('/admin/info/methods/count',(req, res) => {
  pool.query("SELECT method, COUNT(*) FROM request GROUP BY method",(err, result) => {
    if (err) throw err;
    //console.log(result.rows)
    res.send(result.rows)
  });
});
//RESPONSE STATUS COUNT ADMIN
app.get('/admin/info/response/count',(req, res) => {
  pool.query("SELECT status, COUNT(*) FROM response GROUP BY status",(err, result) => {
    if (err) throw err;
    //console.log(result.rows)
    res.send(result.rows)
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

  if (password.length < 6) {
    errors.push({ message: "Password must be a least 6 characters long." });
  }
  if (password.match(/[a-z]+/) == null){
    errors.push({ message: "Passwords must contain at least a small letter." });
  }
  if (password.match(/[A-Z]+/) == null) {
    errors.push({ message: "Passwords must contain at least one capital letter." });
  }
  if (password.match(/[0-9]+/) == null) {
    errors.push({ message: "Passwords must contain at least one number." });
  }
  if (password.match(/[$@#&!]+/) == null) {
    errors.push({ message: "Passwords must contain at least one symbol ($@#&!)" });
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
          WHERE email = $1 OR username = $2`,
      [email, username],
      (err, results) => {
        if (err) {
          console.log(err);
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          req.flash('error', 'Email or username already in use');
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
    req.flash('error', 'Your username or password is wrong. ');
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
    pool.query(`INSERT INTO headers (content_type, cache_control, pragma, last_modified, host, age, expires, res_id, en_id) VALUES ($1, $2, $3, $4, $5, $6, $7, (SELECT MAX(response_id) FROM response),(SELECT MAX(entries_id) FROM entries))`,
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

    pool.query(`INSERT INTO headers (content_type, cache_control, pragma, last_modified, host, age, expires, req_id, en_id) VALUES ($1, $2, $3, $4, $5, $6, $7,(SELECT MAX(request_id) FROM request),(SELECT MAX(entries_id) FROM entries))`,
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

//INFO GIA MONADIKA DOMAINS SOTN ADMIN
app.get('/admin/info/domains',(req,res)=>{
  pool.query("SELECT COUNT(DISTINCT url) AS count FROM request WHERE url LIKE '%%www.%.com%' OR url LIKE '%www.%.gr%'", function (err, results) {
    if (err) throw err;
    //console.log(results.rows)
    res.send(results.rows)
  
  });
})

//MESH HLIKIA ISTOANTIKEIMENWN  ALL
app.get('/admin/info/age',(req,res)=>{
  pool.query("SELECT cache_control FROM headers WHERE cache_control IS NOT NULL AND cache_control LIKE '%max-age%' ;", function (err, results) {
    if (err) throw err;
    //console.log(results.rows)
    res.send(results.rows)
  });
})
//MESH HLIKIA ANA CONTENT-TYPE--APPLICATION
app.get('/admin/info/age/application',(req,res)=>{
  pool.query("SELECT cache_control FROM headers WHERE cache_control IS NOT NULL AND cache_control LIKE '%max-age%' AND content_type LIKE '%application%' ;", function (err, results) {
    if (err) throw err;
    //console.log(results.rows)
    res.send(results.rows)
  });
})
//MESH HLIKIA ANA CONTENT-TYPE--IMAGE 
app.get('/admin/info/age/image',(req,res)=>{
  pool.query("SELECT cache_control FROM headers WHERE cache_control IS NOT NULL AND cache_control LIKE '%max-age%' AND content_type LIKE '%image%' ;", function (err, results) {
    if (err) throw err;
    //console.log(results.rows)
    res.send(results.rows)
  });
})
//MESH HLIKIA ANA CONTENT-TYPE--TEXT
app.get('/admin/info/age/text',(req,res)=>{
  pool.query("SELECT cache_control FROM headers WHERE cache_control IS NOT NULL AND cache_control LIKE '%max-age%' AND content_type LIKE '%text%' ;", function (err, results) {
    if (err) throw err;
    //console.log(results.rows)
    res.send(results.rows)
  });
})


app.get('/admin/info/chart/info',(req,res)=>{
  pool.query("SELECT EXTRACT(hour FROM starteddatetime) AS time, EXTRACT(dow FROM starteddatetime) AS day, method, content_type, timings FROM entries INNER JOIN request ON entries.entries_id = request.en_id  INNER JOIN headers ON headers.en_id = entries.entries_id WHERE headers.content_type IS NOT NULL ORDER BY EXTRACT(hour FROM starteddatetime) ASC ", function (err, results) {
    if (err) throw err;
    //console.log(results.rows)
    res.send(results.rows)
  });
})




//USER HEATMAP HANDLER
app.get("/geo", (req, res) => {
  pool.query(`SELECT serverlat, serverlong FROM entries WHERE har_id IN (SELECT har_id FROM har_files WHERE user_id IN (SELECT user_id FROM users WHERE username = $1)) AND (serverlat, serverlong) IS NOT NULL;`, [req.session.username], (err, results, fields) => {
    if (err) throw err;
    //console.log(results.rows);
    res.send(results.rows)
  })
})
//ADMIN MAP INFORMATION 1
app.get("/admin/map/users", (req, res) => {
  pool.query(`SELECT  DISTINCT geolat,geolong, user_id FROM har_files WHERE (geolat,geolong) IS NOT NULL;`, (err, results, fields) => {
    if (err) throw err;
    //console.log(results.rows);
    res.send(results.rows)
  })
})
// ADMIN MAP INFORMATION 2
app.get("/admin/map/server", (req, res) => {
  pool.query(`SELECT DISTINCT  entries.serverlat, entries.serverlong, users.user_id
              FROM ((entries
              INNER JOIN har_files ON har_files.har_id = entries.har_id)
              INNER JOIN users ON users.user_id = har_files.user_id) WHERE (entries.serverlat, entries.serverlong) IS NOT NULL; `, (err, results, fields) => {
    if (err) throw err;
    res.send(results.rows)
    //console.log(results.rows)
  })

})
//ADMIN MAP INFORMATION 3
app.get("/admin/map/lines", (req, res) => {
  pool.query(`SELECT entries.serverlat, entries.serverlong, har_files.geolat, har_files.geolong, users.user_id
              FROM ((entries
              INNER JOIN har_files ON har_files.har_id = entries.har_id)
              INNER JOIN users ON users.user_id = har_files.user_id) WHERE (entries.serverlat, entries.serverlong, har_files.geolat, har_files.geolong) IS NOT NULL; `, (err, results, fields) => {
    if (err) throw err;
    res.send(results.rows)
    //console.log(results.rows)
  })

})
//ADMIN PIE CHART 3-C
app.get("/admin/pie/image", (req, res) => {
  pool.query(`SELECT
              COUNT(CASE WHEN cache_control LIKE '%private%' THEN 1 END) AS private,
              COUNT(CASE WHEN cache_control LIKE '%public%' THEN 1 END) AS public,
              COUNT(CASE WHEN cache_control LIKE '%no-cache%' THEN 1 END) AS no_catch,
              COUNT(CASE WHEN cache_control LIKE '%no-store%' THEN 1 END) AS no_store
              FROM headers WHERE content_type LIKE '%image%' `, (err, results, fields) => { 
    if (err) throw err;

    //console.log(results.rows)
    res.send(results.rows)
    //console.log(results.rows)
  })

})
//ADMIN PIE CHART 3-C
app.get("/admin/pie", (req, res) => {
  pool.query(`SELECT
              COUNT(CASE WHEN cache_control LIKE '%private%' THEN 1 END) AS private,
              COUNT(CASE WHEN cache_control LIKE '%public%' THEN 1 END) AS public,
              COUNT(CASE WHEN cache_control LIKE '%no-cache%' THEN 1 END) AS no_catch,
              COUNT(CASE WHEN cache_control LIKE '%no-store%' THEN 1 END) AS no_store
              FROM headers`, (err, results, fields) => {
    if (err) throw err;

    //console.log(results.rows)
    res.send(results.rows)
    //console.log(results.rows)
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

    //console.log( results.rows)
    res.send(results.rows)
    //console.log(results.rows)
  })

})
//ADMIN PIE CHART 3-C
app.get("/admin/pie/text_javascript", (req, res) => {
  pool.query(`SELECT
              COUNT(CASE WHEN cache_control LIKE '%private%' THEN 1 END) AS private,
              COUNT(CASE WHEN cache_control LIKE '%public%' THEN 1 END) AS public,
              COUNT(CASE WHEN cache_control LIKE '%no-cache%' THEN 1 END) AS no_catch,
              COUNT(CASE WHEN cache_control LIKE '%no-store%' THEN 1 END) AS no_store
              FROM headers WHERE content_type LIKE '%text/javascript%' `, (err, results, fields) => {
    if (err) throw err;

    //console.log( results.rows)
    res.send(results.rows)
    
  })

})




app.listen(port, () => {
  console.log(`App running on port ${port}.`)
});  