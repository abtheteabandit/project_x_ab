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
var   passport = require('passport');
var   FacebookStrategy = require('passport-facebook').Strategy
var   TwitterStrategy = require('passport-twitter').Strategy;
var   request = require('request')


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

//instialize passport js for user login with facebook
passport.use(new FacebookStrategy({
	clientID: 475851112957866,
	clientSecret: '5c355ad2664c4b340a5a72e5ce7b9134',
	callbackURL: '/facebook/return',
  passReqToCallback: true
},
function(req, accessToken, refreshToken, profile, cb) {
	console.log("callback entered")
	console.log(profile)
	//store values from the intial request
	let id = profile.id
	let token = accessToken
	let refresh = refreshToken

	//create the url to request profile data
	let url = "https://graph.facebook.com/v3.3/me?" + "fields=id,name,email,first_name,last_name&access_token=" + token;

		//make the request
		request({
				url: url,
				json: true
		}, function (err, response, body) {
				//store the needed values from the facebook api  call
				console.log(body)
				let email = body.email;  
				let username = body.name.replace(/\s+/g, '_')
				console.log(body); 

				//check for null values
				if (!username) {
					return res.status(400).send('Name not found')
				} else if (!email) {
					return res.status(400).send('Email not found')
				}

				database.connect(db => {
					//set database path
					var users = db.db('users').collection('users');
					//check to see if the user laready exists
					users.findOne({ $or: [{email: email}, {username: username}]}, (err, obj) => {
						//catch error
						if (err) {
							console.error(`User find request from ${req.ip} (for ${username}) returned error: ${err}`)
							//res.status(500).send()
							db.close();
						} 
						//if the user already exists
						else if (obj) {
							//sign the user in
							req.session.key = username;
							req.session.cookie.expires = false
							req.session.save()
						} else {
							//if not, create a new user 
							users.insertOne({ email: email, username: username, contacts:[]}, (err, obj) => {
								//catch error
								if (err) {
									console.error(`Register request from ${req.ip} (for ${username}, ${email}) returned error: ${err}`);
									//res.status(500).send();
									db.close();
								}
								//if the user is created, sign the user in
								 else {
									req.session.key = username;
									req.session.cookie.expires = false
									req.session.save()
									db.close();
								}
							});
						}
					})
				}, err => {
					console.warn("Couldn't connect to database: " + err)
					res.status(500).send()
				});

			});
	return cb(null, profile);
}));

//setup twitter auth for passport
passport.use(new TwitterStrategy({
	consumerKey: 'vTzIdwGET3J1GVoytgt1maOqC',
	consumerSecret: 'lk77gRVrv5BptNuZvc1m8y42Lim9SXnOIhLkolGRYf42y8Eh6b',
	userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true",
	callbackURL: "http://localhost:1600/auth/twitter/callback",
  passReqToCallback: true
},
function(req, token, tokenSecret, profile, done) {
	let username = profile.username
	let email = profile.emails[0].value

	//check for null values
	if (!username) {
		return res.status(400).send('Name not found')
	} else if (!email) {
		return res.status(400).send('Email not found')
	}

	console.log("the username is " + username)
	console.log("the email is " + email)

	database.connect(db => {
		//set database path
		var users = db.db('users').collection('users');
		//check to see if the user laready exists
		users.findOne({ $or: [{email: email}, {username: username}]}, (err, obj) => {
			//catch error
			if (err) {
				console.error(`User find request from ${req.ip} (for ${username}) returned error: ${err}`)
				db.close();
			} 
			//if the user already exists
			else if (obj) {
				//sign the user in
				req.session.key = username;
				req.session.cookie.expires = false
				req.session.save()
				console.log(req.session)
				console.log('Req session key after inserting user for register is: ' + req.session.key);
				db.close();
				//return res.redirect('/twitter/successAuth' + username);
			} else {
				//if not, create a new user 
				users.insertOne({ email: email, username: username, contacts:[]}, (err, obj) => {
					//catch error
					if (err) {
						console.error(`Register request from ${req.ip} (for ${username}, ${email}) returned error: ${err}`);
						db.close();
					}
					//if the user is created, sign the user in
					 else {
						req.session.key = username;
						req.session.cookie.expires = false
						req.session.save()
						console.log(req.session)
						console.log('Req session key after inserting user for register is: ' + req.session.key);
						db.close();
						//return res.redirect('/twitter/successAuth' + username);
					}
				});
			}
		})
	}, err => {
		console.warn("Couldn't connect to database: " + err)
	});
	done(null, null);
}
));

//passport serialie the user
passport.serializeUser(function(user, cb){
	cb(null, user);
});

//passport deserialize the user
passport.deserializeUser(function(obj, cb){
	cb(null, obj);
});

//route to login with facebook
router.get('/loginWithFacebook', passport.authenticate('facebook', { scope: ['email','public_profile']}))

//route for facebook oauth callback
router.get('/facebook/return', 
  passport.authenticate('facebook', { failureRedirect: '/facebook/successAuth' }),
  function(req, res) {
    res.redirect('/facebook/failedAuth');
	});
	
//route for failed oauth callback for facebook
router.get('/facebook/failedAuth', (req, res) => {
	return res.redirect('http://localhost:1600/index');
})

//route for succesful oauth callback for facebook
router.get('/facebook/successAuth', (req, res) => {
	return res.redirect('http://localhost:1600/index');
})

//route for failed oauth callback for twitter
router.get('/twitter/failedAuth', (req, res) => {
	return res.redirect('http://localhost:1600/index');
})

//route for succesful oauth callback for twitter
router.get('/twitter/successAuth', (req, res) => {
	return res.redirect('http://localhost:1600/index');
})

//authenticate twitter redirect url
router.get('/auth/twitter', passport.authenticate('twitter'))

//callback route for twitter authenication
router.get('/auth/twitter/callback', passport.authenticate('twitter', {successRedirect: '/twitter/failedAuth', failureRedirect: '/twitter/successAuth'}))

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
