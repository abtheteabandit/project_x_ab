/*************************************************************************
 *
 * BANDA CONFIDENTIAL
 * __________________
 *
 *  Copyright (C) 2019
 *  Banda Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Banda Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Banda Incorporated
 * and its suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Banda Incorporated.
 *
*************************************************************************/

// `express` is used to serve up webpages
// `redis` is used to store user sessions
// `mongodb` is used to store more heavy-duty objects

//todo: change back to port 1600 for production
const EXPRESS_APP_PORT = 1600,
      PUBLIC_DIR = 'public',
      STATIC_DIR = 'static',
      REDIS_HOST = 'localhost'
      REDIS_PORT = 6379;

const express = require('express'),
      redis = require("redis"),
      session = require('express-session'),
      redisStore = require('connect-redis')(session),
      bodyParser = require('body-parser'),
      cookieParser = require('cookie-parser');
      //social media signin
      passport = require('passport');
      Strategy = require('passport-facebook').Strategy;

var client = redis.createClient();
var app = express();

//for real time capabilities:
var http = require('http').Server(app);
var io = require('socket.io')(http);
 path = require('path'),
 nodeMailer = require('nodemailer');

app.set('views', PUBLIC_DIR);
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// this is how sessions are handled
app.use(session({
	secret: 'secret password here ;p',
	store: new redisStore({ // store sessions with redis
		host: REDIS_HOST,
		port: REDIS_PORT,
		client: client,
		ttl: 100000
	}),
	saveUninitialized: false,
	resave: false,
	// cookie: { secure: true, maxAge: 86400000 }
}));

console.info("figure out why cookies aren't working");

//add dependencies to express app
app.use(cookieParser("lol my secret $c5%ookie parser 0nu@mber thingy 12038!@"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true }));
app.use(require('morgan')('combined'));

//intialize and configure passport for 3rd party auth
passport.use(new Strategy({
  clientID: 475851112957866,
  clientSecret: '5c355ad2664c4b340a5a72e5ce7b9134',
  callbackURL: '/return'
},
function(accessToken, refreshToken, profile, cb) {

  //todo: store this data in a session and the database
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
  console.log("refrech token: " + refreshToken)
  console.log("access token: " + accessToken)
  console.log("id: " + profile.id)
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

  return cb(null, profile);
}));

//serlize a user when a session starts
passport.serializeUser(function(user, cb) {
  cb(null, user);
  });

//deserlialize a user when a session ends
passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
  });

// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());


/** ROUTES **/

// Make statics readable
app.use(express.static(STATIC_DIR));


// create the router
var router = express.Router();

// display index
router.get('/', (_, res) => res.redirect('/index'));
router.get('/index', (_, res) => { res.render('index.html'); });
router.get('/about',(_,res)=> {res.render('about.html');});

require('./routes/auth.js')(router, app); // login, register, logout
require('./routes/upload2.js')(router, app); // uploads and downlaods data
require('./routes/search.js')(router, app); //searches and posting
require('./routes/create.js')(router, app); //  for adding new bands and gigs
require('./routes/update.js')(router, app); // for updating gigs and bands
require('./routes/navigation.js')(router, app); // for navigating the website
require('./routes/sessionInfo.js')(router, app); // for getting info in and out of sessions
require('./routes/interactions.js')(router, app); // for allowing bands and gigs to interact
require('./routes/delete.js')(router, app); // for ressetting everythingegt rid of htis
require('./routes/messaging.js')(router, app); //for getting messages out of monog
require('./routes/samples.js')(router, app); //for getting sampples
require('./routes/newAccount.js')(router, app); //for creating stripe connected account (bands)
require('./routes/newCustomer.js')(router, app); // for creating chareable customers  (gigs)
require('./routes/meta-data.js')(router, app) //for exporting meta-data
require('./routes/support.js')(router, app) //for letting customers email us with issues.
require('./routes/promotions.js')(router, app) //for letting users find contacts, create promos and post them


//for routing messaing and emiting the message:

router.post('/messages', (req, res)=>{
  if (!req.body) {
     console.log("No body recived for messaging");
     res.status(400).send('No body sent').end();
  }
  var {senderID, recieverID, body, timeStamp} = req.body;
  console.log('made it into messagin on router and sender id was: ' + senderID);
  database.connect(db=>{
    let messages = db.db('messages').collection('messages');
    messages.insertOne({'senderID':senderID, 'recieverID':recieverID, 'body':body, 'timeStamp': timeStamp}, (err2, result)=>{
      if (err2){
        consoel.log("There was an error adding the message from " + senderID + "Error was: " + err2);
        res.status(500).end();
        db.close();
      }
      else{
        console.log("Message with body: "+ body +"was instered into db");
        console.log("Message with recID: "+ recieverID +"was instered into db");
        //io.emit('message, recID:'+recieverID+'', {'senderID':senderID, 'recieverID':recieverID, 'body':body, 'timeStamp': timeStamp});
        io.emit(recieverID, {'senderID':senderID, 'recieverID':recieverID, 'body':body, 'timeStamp': timeStamp});
        res.status(200).send(result);
        db.close();
      }
    });
  }, err=>{
    console.log("Couldn't connect to mongo with error: "+err);
    res.status(500).end();
  });

});

//uses our router:
app.use('/', router);
//app.listen(EXPRESS_APP_PORT, () => console.info('Express started on port ' + EXPRESS_APP_PORT));

//print when a user connects:
io.on('connection', () =>{
  console.log("A user is connected! GO BANDA, GO!");
});

// startup the server
var server = http.listen(EXPRESS_APP_PORT, ()=>{
  console.log('http+express server running on port: ' + server.address().port);
});

var email_port = 3000;
app.listen(email_port, function(req, res){
  console.log('Email is running on port: ',email_port);
});

router.post('/messages', (req, res)=>{
  if (!req.body) {
     console.log("No body recived for messaging");
     res.status(400).send('No body sent').end();
  }
  var {senderID, recieverID, body, timeStamp} = req.body;
  console.log('made it into messagin on router and sender id was: ' + senderID);
  database.connect(db=>{
    let messages = db.db('messages').collection('messages');
    messages.insertOne({'senderID':senderID, 'recieverID':recieverID, 'body':body, 'timeStamp': timeStamp}, (err2, result)=>{
      if (err2){
        consoel.log("There was an error adding the message from " + senderID + "Error was: " + err2);
        res.status(500).end();
        db.close();
      }
      else{
        console.log("Message with body: "+ body +"was instered into db");
        console.log("Message with recID: "+ recieverID +"was instered into db");
        //io.emit('message, recID:'+recieverID+'', {'senderID':senderID, 'recieverID':recieverID, 'body':body, 'timeStamp': timeStamp});
        io.emit(recieverID, {'senderID':senderID, 'recieverID':recieverID, 'body':body, 'timeStamp': timeStamp});
        res.status(200).send(result);
        db.close();
      }
    });
  }, err=>{
    console.log("Couldn't connect to mongo with error: "+err);
    res.status(500).end();
  });

});
