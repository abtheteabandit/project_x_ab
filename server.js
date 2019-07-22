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

// This is our offical v1.1 server file, not realted to the server.js file on our live D.O. instance

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

//social media signin dependencies
var   passport = require('passport');
var   FacebookStrategy = require('passport-facebook').Strategy
var   TwitterStrategy = require('passport-twitter').Strategy;
var   request = require('request')
var   axios = require('axios')
const url = require('url');
var querystring = require('querystring');

//social media access token
var TokenPassport = require('passport');
var TwitterTokenStrategy = require('passport-twitter').Strategy;
var Twit = require('twit')

//express plugins
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

//intialize passport and start sessions for the token auth
app.use(TokenPassport.initialize());
app.use(TokenPassport.session());


/** ROUTES **/

// Make statics readable
app.use(express.static(STATIC_DIR));


// create the router
var router = express.Router();

// display index
router.get('/', (_, res) => res.redirect('/index'));
router.get('/index', (_, res) => { res.render('index.html'); });
router.get('/about',(_,res)=> {res.render('about.html');});

//import routes from routes folder
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
require('./routes/media.js')(router, app) //for getting media based on username
require('./routes/notifications.js')(router, app) // for real time notifications
require ('./routes/autoPost.js')(router, app) // for auto posting to sites with explicit user permission



//for routing messaing and emiting the message:
router.post('/messages', (req, res)=>{
  if (!req.body) {
     console.log("No body recived for messaging");
     res.status(400).send('No body sent').end();
	}
	//store parameters
  var {senderID, recieverID, body, timeStamp} = req.body;
  console.log('made it into messagin on router and sender id was: ' + senderID);
  database.connect(db=>{
		let messages = db.db('messages').collection('messages');
		//place message in db
    messages.insertOne({'senderID':senderID, 'recieverID':recieverID, 'body':body, 'timeStamp': timeStamp}, (err2, result)=>{
      if (err2){
        consoel.log("There was an error adding the message from " + senderID + "Error was: " + err2);
        res.status(500).end();
        db.close();
      }
      else{
				//success case
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
passport.use('auth_facebook',new FacebookStrategy({
	clientID: 475851112957866,
	clientSecret: '5c355ad2664c4b340a5a72e5ce7b9134',
	callbackURL: 'https://www.banda-inc.com/facebook/return',
  passReqToCallback: true
},
function(req, accessToken, refreshToken, profile, cb) {
	//store values from the intial request
	let id = profile.id
	let token = accessToken
	let refresh = refreshToken

	//create the url to request profile data
	let url = "https://graph.facebook.com/v3.3/me?" + "fields=name,email&access_token=" + token;

		//make the request
		request({
				url: url,
				json: true
		}, function (err, response, body) {
				//store the needed values from the facebook api  call
				let email = body.email;
				let username = body.name.replace(/\s+/g, '_')
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
					users.find({email: email}).toArray((err, obj) => {
						console.log(JSON.stringify(obj))
						console.log("!!!!!!!!!!!!!!!!!!!!!")
						console.log("!!!!!!!!!!!!!!!!!!!!!")
						console.log("!!!!!!!!!!!!!!!!!!!!!")
						console.log("!!!!!!!!!!!!!!!!!!!!!" + obj.legnth + " is the object length!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
						console.log("!!!!!!!!!!!!!!!!!!!!!")
						console.log("!!!!!!!!!!!!!!!!!!!!!")
						console.log("!!!!!!!!!!!!!!!!!!!!!")
						//catch error
						if (err) {
							console.error(`User find request from ${req.ip} (for ${username}) returned error: ${err}`)
							db.close();
						}

						//if the user already exists
						else if (obj.length > 0) {
							//sign the user in
							req.session.key = username;
							req.session.cookie.expires = false
							req.session.save()
							db.close();
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
									console.log("the user does NOT already exist")
									req.session.key = username;
									req.session.cookie.expires = false
									req.session.save()
									db.close();
								}
							});
						}
					}), err => {
					console.warn("Couldn't connect to database: " + err)
					res.status(500).send()
				};
			});
	//done(null, profile);
	// return cb(null, profile);
	});
	return cb(null, profile);
}))

//intialize twitter auth for passport
passport.use('auth_twitter', new TwitterStrategy({
	consumerKey: 'vTzIdwGET3J1GVoytgt1maOqC',
	consumerSecret: 'lk77gRVrv5BptNuZvc1m8y42Lim9SXnOIhLkolGRYf42y8Eh6b',
	userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true",
	callbackURL: "https://www.banda-inc.com/auth/twitter/callback",
  passReqToCallback: true
},
function(req, token, tokenSecret, profile, done) {
	console.log(profile)

	//store profile info
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
			console.log(JSON.stringify(obj))
			if (err) {
				console.error(`User find request from ${req.ip} (for ${username}) returned error: ${err}`)
				db.close();
			}
			//if the user already exists
			else if (obj.email == email) {
				//sign the user in
				console.log(username + " is the username")
				req.session.key = username;
				req.session.cookie.expires = false
				req.session.save()
				console.log(req.session)
				console.log('Req session key after inserting user for register is: ' + req.session.key);
				db.close();
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
router.get('/loginWithFacebook', passport.authenticate('auth_facebook', { scope: ['email']}))

//route for facebook oauth callback
router.get('/facebook/return',
  passport.authenticate('auth_facebook', { failureRedirect: 'https://www.banda-inc.com/facebook/successAuth' }),
  function(req, res) {
    res.redirect('https://www.banda-inc.com/facebook/failedAuth');
	});

//route for failed oauth callback for facebook
router.get('/facebook/failedAuth', (req, res) => {
	return res.redirect('https://www.banda-inc.com/index#');
})

//route for succesful oauth callback for facebook
router.get('/facebook/successAuth', (req, res) => {
	return res.redirect('https://www.banda-inc.com/index#');
})

//route for failed oauth callback for twitter
router.get('/twitter/failedAuth', (req, res) => {
	return res.redirect('https://www.banda-inc.com/index#');
})

//route for succesful oauth callback for twitter
router.get('/twitter/successAuth', (req, res) => {
	return res.redirect('https://www.banda-inc.com/index');
})

//authenticate twitter redirect url
router.get('/auth/twitter', passport.authenticate('auth_twitter'))

//callback route for twitter authenication
router.get('/auth/twitter/callback', passport.authenticate('auth_twitter', {successRedirect: 'https://www.banda-inc.com/twitter/failedAuth', failureRedirect: 'https://www.banda-inc.com/twitter/successAuth'}))






//setup passport for getting a twitter access token
passport.use("token_twitter", new TwitterTokenStrategy({
	consumerKey: 'vTzIdwGET3J1GVoytgt1maOqC',
	consumerSecret: 'lk77gRVrv5BptNuZvc1m8y42Lim9SXnOIhLkolGRYf42y8Eh6b',
	userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true",
	callbackURL: "https://www.banda-inc.com/token/twitter/callback",
  passReqToCallback: true
},
function(req, token, tokenSecret, profile, done) {
	console.log(profile)
	//store twitter api values
	var username = profile.username
	var email = profile.emails[0].value
	var followers_count = profile.followers_count
	var status_count = profile._json.statuses_count
	var screen_name = profile.screen_name

	//check for null values
	if (!username) {
		return res.status(400).send('Name not found')
	} else if (!email) {
		return res.status(400).send('Email not found')
	}

	//create an instance of the twitter api
	T = new Twit({
		consumer_key:         'vTzIdwGET3J1GVoytgt1maOqC',
		consumer_secret:      'lk77gRVrv5BptNuZvc1m8y42Lim9SXnOIhLkolGRYf42y8Eh6b',
		access_token:         token,
		access_token_secret:  tokenSecret,
		timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
		//strictSSL:            true,     // optional - requires SSL certificates to be valid. todo: uncomment for production
	})

	//query for the most recent tweets
	var optionsT = { screen_name: screen_name, count: 200 };
  var retweets = 0
	var favorites = 0
	//make query
	T.get('statuses/user_timeline', optionsT , function(err, data) {
		//average twitter dataover 200 most recnt tweets
		for (var i = 0; i < data.length ; i++) {
			retweets += data[i].retweet_count
			favorites += data[i].favorite_count
		}
		retweets /= data.length
		favorites /= data.length

		//multiply averages by total tweets
		retweets = retweets*status_count
		favorites = favorites*status_count

		//if no tweets, intialize to 0
		if(data.length == 0){
			retweets = 0
			favorites = 0
		}
		database.connect(db => {
			//store the access tokens
			db.db('users').collection('users').update({'username':req.session.key}, {$set:{'twitter':{'access_token':token,
																																																		'token_secret':tokenSecret,
																																																		'retweets':retweets,
																																																		'favorites':favorites,
																																																		'follower_count':followers_count,
																																																		'status_count':status_count,
																																																		'screen_name':screen_name}}}, {upsert:true}
				, (err4, res4)=>{
						if (err4){
							res.status(500).end();
							db.close();
						}
						else{
							console.log("the token was retrieved")
							db.close();
						}
			});
		}, err => {
			console.warn("Couldn't connect to database: " + err)
		});
		done(null, null);
	})
}
));

//route for failed oauth callback for twitter
router.get('/twitter/token/failedAuth', (req, res) => {
	return res.redirect('https://www.banda-inc.com/promo#?isPromo=true');
})

//route for succesful oauth callback for twitter
router.get('/twitter/token/successAuth', (req, res) => {
	return res.redirect('https://www.banda-inc.com/promo#?isPromo=true');
})

//authenticate twitter redirect url
router.get('/token/twitter', passport.authenticate('token_twitter'))

//callback route for twitter authenication
router.get('/token/twitter/callback', passport.authenticate('token_twitter', {successRedirect: 'https://www.banda-inc.com/twitter/token/failedAuth', failureRedirect: 'https://www.banda-inc.com/twitter/token/successAuth'}))

//post request to post a tweet to twitter
router.post('/postTweet', (req, res) =>{
	//connect to the db
	database.connect(db => {
		//find the user in the db
		db.db('users').collection('users').findOne({ 'username': req.session.key}, (err, obj) => {
			//create an instance of the twitter api
			T = new Twit({
				consumer_key:         'vTzIdwGET3J1GVoytgt1maOqC',
				consumer_secret:      'lk77gRVrv5BptNuZvc1m8y42Lim9SXnOIhLkolGRYf42y8Eh6b',
				access_token:         obj.twitter.access_token,
				access_token_secret:  obj.twitter.token_secret,
				timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
				//strictSSL:            true,     // optional - requires SSL certificates to be valid. todo: uncomment for production
			})

			//get and post the message data
      var {promo, coupon} = req.body;
      var message = promo.caption;
      var link=promo.imgURL;
      if (coupon==null){
        if (!(promo.handles=="")){
          message= message+'\n'+promo.handles;
        }
      }
      else{
        if (!(promo.handles=="")){
          message= message+'\n'+promo.handles;
        }
        message = message + '\n' + coupon.details;
        if (coupon.hasOwnProperty('link')){
          message= message + '\n'+coupon.link;
        }
      }
      message = message + '\n\n'+'(posted from https://www.banda-inc.com where artists rise, venues grow, and music-lovers band together!)'
      //string concatination with handles, caption and coupon description nad our own Banda stuff

			var imgURL = promo.imgURL.replace('www.banda-inc.com//', 'www.banda-inc.com/');
			//post the message as a tweet
			T.post('statuses/update', { status: message }, function(err, data, response) {
				console.log(data)
				return res.status(200).send('Tweet posted!')
			})
		})
	}, err => {
		//catch errors
		console.warn("Couldn't connect to database: " + err)
		res.status(500).end()
	});

});
const multiparty = require('multiparty');

//post request to post a photo on twitter
router.post('/postPhotoTweet', function(req, res){
  var form = new multiparty.Form();
    form.parse(req, function(err1, fields, files){
        if (err1){
          console.log('error with multiparty: ' + err1);
          res.status(500).end();
        }
        else{
          console.log('Fields: ' + JSON.stringify(fields));
          console.log('PROMO: ' + JSON.stringify(JSON.parse(fields.promo[0])))
          console.log('COUPOn: ' + JSON.stringify(JSON.parse(fields.coupon[0])))
          //console.log('files:'  + JSON.stringify(files));
          //connect to the db
        	database.connect(db => {
        		//find the user in the db
        		db.db('users').collection('users').findOne({ 'username': req.session.key}, (err, obj) => {
        			//create an instance of the twitter api
        			T = new Twit({
        				consumer_key:         'vTzIdwGET3J1GVoytgt1maOqC',
        				consumer_secret:      'lk77gRVrv5BptNuZvc1m8y42Lim9SXnOIhLkolGRYf42y8Eh6b',
        				access_token:         obj.twitter.access_token,
        				access_token_secret:  obj.twitter.token_secret,
        				timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
        				//strictSSL:            true,     // optional - requires SSL certificates to be valid. todo: uncomment for production
        			})

        			//get and post the message data
              var promo = JSON.parse(fields.promo[0]);
              var coupon = JSON.parse(fields.coupon[0]);

              var message = promo.caption;
        			var link=promo.imgURL;

        			//store the media files twitter wants
        			var media = fields.media_data[0];

              media = media.replace('data:image/png;base64,', '');
              media = media.replace('data:image/jpeg;base64,', '');
              console.log('MEDIA IS: ' + media);
        		//	var mediaData = req.mediaData;

						//format the message for the tweet
              if (coupon==null){
                if (!(promo.handles=="")){
                  message= message+'\n'+promo.handles;
                }
              }
              else{
                if (!(promo.handles=="")){
                  message= message+'\n'+promo.handles;
                }
                message = message + '\n' + coupon.details;
                if (coupon.hasOwnProperty('link')){
                  message= message + '\n'+coupon.link;
                }
              }
              message = message + '\n\n'+'(posted from https://www.banda-inc.com where artists rise, venues grow, and music-lovers band together!)'
              //string concatination with handles, caption and coupon description nad our own Banda stuff
              console.log(media)
        			//post the image to the twitter account
        			T.post('media/upload', {'media_data': media}, function(err, data, response) {
                if (err){
                  console.log('There was an error with upladoing meida to Twitter: ' + err);
                }
        				console.log('Data from media/upload:' + JSON.stringify(data));
        				let mediaId = data.media_id_string; //store the photos media id to post as a tweet
                console.log("MEDIA ID: " + mediaId);

        				//post the tweet (message) and photo (mediaId) as a tweet
        				T.post('statuses/update', { status: message, media_ids: [mediaId] }, function(err, data, response) {
                  if (err){
                    console.log('There was an error psoting tweet error:' + err);
                  }
        					console.log(data)
        					return res.status(200).send('Tweet posted!')
        				})
        			})
        		})
        	}, err => {
        		//catch errors
        		console.warn("Couldn't connect to database: " + err)
        		res.status(500).end()
        	});
        }
    });
});



//setup passport for getting a facebook token
//instialize passport js for user login with facebook
passport.use('token_facebook',new FacebookStrategy({
	clientID: 475851112957866,
	clientSecret: '5c355ad2664c4b340a5a72e5ce7b9134',
	callbackURL: 'https://www.banda-inc.com/facebook/token/return',
	//callbackURL: 'http://localhost:1600/facebook/return',
  passReqToCallback: true
},
function(req, accessToken, refreshToken, profile, cb) {
	//store values from the intial request
	let profile_id = profile.id
	let token = accessToken
	let refresh = refreshToken

axios.get('https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=475851112957866&client_secret=5c355ad2664c4b340a5a72e5ce7b9134&fb_exchange_token=' + token)
	.then(function (response) {

		// handle success
		var longToken = response.data.access_token
		const date = Math.floor(new Date() / 1000)
		console.log(req.session.key + " owns the token " + longToken)
		database.connect(db => {

		//store the access tokens and profile information
		db.db('users').collection('users').updateOne({'username':req.session.key},{$set:{'facebook':{'accessToken': longToken,
																																																	'profile':profile,
																																																	'date': date}}}
				, (err4, res4)=>{
					if (err4){
						res.status(500).end();
						db.close();
					}
					else{
						db.close();
					}
		});
	}, err => {
		console.warn("Couldn't connect to database: " + err)
	});

	})
	.catch(function (error) {
		// handle error
		console.log(error);
	})
	.finally(function () {
		// always executed
		return cb(null, profile);
	});

}));

//route to get facebook access token
router.get('/getFacebookToken', passport.authenticate('token_facebook', { scope: [
	'manage_pages',
		'user_posts',
			'read_insights',
				'pages_show_list',
					'publish_pages',
						'public_profile']}))

//route for facebook oauth callback
router.get('/facebook/token/return',
  passport.authenticate('token_facebook', { failureRedirect: 'https://www.banda-inc.com/facebook/token/successAuth' }),
  function(req, res) {
    res.redirect('https://www.banda-inc.com/facebook/token/failedAuth');
	});

//route for failed token callback for facebook
router.get('/facebook/token/failedAuth', (req, res) => {
	console.log("!!!!!!!!!!!!!!!!!!!!!!!make a request for the page here!!!!!!!!!!!!!!!!!!!!!!!")
	var pageData = ""
	database.connect(db => {
		//set database path
		db.db('users').collection('users').findOne({username: req.session.key}, (err, obj) => {
			//catch error
			if (err) {
				console.error(`User find request from ${req.ip} (for ${username}) returned error: ${err}`)
				db.close();
			}
			//query for an access token
			axios.get('https://graph.facebook.com//v3.3/me/accounts' + '?access_token=' + obj.facebook.accessToken)
				.then(function (response) {
					console.log(response.data);
					pageData = response.data
				})
				.catch(function (error) {
					console.log(error);
				})
				.finally(function () {
					// always executed
					//redirect to the page selection modal
					var xurl = 'https://www.banda-inc.com/promo#?'
					for(let i = 0; i < pageData.data.length; i++){
						console.log("page is below")
						console.log(pageData.data[i])
						xurl += "page" + i + "=" + pageData.data[i].name + "&id" + i + "=" + pageData.data[i].id + "&"
					}
					xurl += "pageNum=" + pageData.data.length + "&isPromo=true"
					console.log(xurl + " is the url !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
					return res.redirect(xurl);
				})
			})
	}, err => {
		console.warn("Couldn't connect to database: " + err)
		res.status(500).send()
	});
})

//route for succesful token  callback for facebook
router.get('/facebook/token/successAuth', (req, res) => {
	return res.redirect('https://www.banda-inc.com/promo#');
})

//get the page access token for facebook based on selected page in modal
router.post('/getFacebookPageTokens', (req, res) =>{
	let pageId = req.body.pageId
	let pageName = req.body.pageName

	console.log("the page id is " + pageId)
	console.log("the page name is " + pageName)

	database.connect(db => {
		//set database path
		db.db('users').collection('users').findOne({username: req.session.key}, (err, obj) => {
			//catch error
			if (err) {
				console.error(`User find request from ${req.ip} (for ${username}) returned error: ${err}`)
				db.close();
			}

			console.log(obj)
			let token = obj.facebook.accessToken
			//get short term page token
			axios.get('https://graph.facebook.com/' + pageId + '?fields=access_token&access_token=' + token)
				.then(function (response) {
					console.log(response.data);
					let pageToken = response.data.access_token
					console.log("the short term page token  is " + pageToken)

					//get long term page token
					axios.get('https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=475851112957866&client_secret=5c355ad2664c4b340a5a72e5ce7b9134&fb_exchange_token=' + pageToken)
						.then(function (response) {
							let pageToken = response.data.access_token

					 		//get the number of followers on a page
							axios.get('https://graph.facebook.com/' + pageId + '?access_token=' + pageToken + '&fields=name,fan_count')
							.then(function (response) {
								let followerCount = response.data.fan_count
								console.log("the follower count is " + followerCount)

								//get page consumption for the last 28 days
					 			axios.get('https://graph.facebook.com/' + pageId + '/insights/page_consumptions' + '?access_token=' + pageToken)
									.then(function (response) {
										let values = response.data.data[2].values
										console.log(values)
										var totalConsumption = 0
										for (let i = 0; i < values.length; i++){
											console.log(values[i].value+ " is the v")
											totalConsumption += values[i].value
										}
										console.log(totalConsumption  + " total consumption")

										//store all values from the facebook api in the database
										database.connect(db => {
											//store the access tokens and profile information
											db.db('users').collection('users').updateOne({'username':req.session.key}, {$set:{'facebook':{
																																																										'profile':obj.facebook.profile,
																																																										'accessToken':token,
																																																										'pageToken':pageToken,
																																																										'followerCount':followerCount,
																																																										'totalConsumption':totalConsumption,
																																																										'pageId': pageId
																																																										}}}
												, (err4, res4)=>{
														if (err4){
															res.status(500).end();
															db.close();
														}
														else{
															//success case
															db.close();
															res.status(200).send('Success');

														}
											});
										}, err => {
											console.warn("Couldn't connect to database: " + err)
										});

					 			})
					 			.catch(function (error) {
					 				console.log(error);
					 			})
							})
							.catch(function (error) {
								console.log(error);
							})
						})
						.catch(function (error) {
							console.log(error);
						});
				})
				.catch(function (error) {
					console.log(error);
				});
		})
	}, err => {
		console.warn("Couldn't connect to database: " + err)
		res.status(500).send()
	});
})


//for image processing
var Jimp = require('jimp');


//make post on facebook using message parameter
router.post("/postOnFBPage", function(req, res){

//connect to the db to check date of tokens
database.connect(db => {
	console.log("Got in database connect");
	//find the user in the db
	db.db('users').collection('users').findOne({ 'username': req.session.key}, (err, obj) => {
		if (err) {
			console.error(`Login request from ${req.ip} (for ${req.session.key}) returned error: ${err}`)
			res.status(500).end()
		}

		const dateSent = obj.facebook.date
		const currDate = Math.floor(new Date() / 1000)

		//if token is older than 60 days
		if(currDate - dateSent >= 5184000){
			//make the user refresh the token to: make more fluid
			res.status(200).send("Hmmm...it seems your Facebook token is expired, please reconnect your Facebook in promotions.")
      db.close();
		}
    else{
      //get the massage

      var {promo, coupon} = req.body;
      var message = promo.caption;
      var link=promo.imgURL;
      if (coupon==null){
        if (!(promo.handles==undefined)){
          message= message+'\n'+promo.handles;
        }
      }
      else{
        if (!(promo.handles==undefined)){
          message= message+'\n'+promo.handles;
        }
        message = message + '\n' + coupon.details;
        if (coupon.hasOwnProperty('link')){
          message= message + '\n'+coupon.link;
        }
      }
      message = message + '\n\n'+'(posted from https://www.banda-inc.com where artists rise, venues grow, and music-lovers band together!)'
      //string concatination with handles, caption and coupon description nad our own Banda stuff

      var imgURL = promo.imgURL.replace('https://www.banda-inc.com/', '');
      // image processing
      Jimp.read('./'+imgURL, (errImg, img)=>{
        if (errImg){
          console.log('There was an error reading image at url: ' + imgURL + ' Error: ' + errImg);
          res.status(200).send('JIMP ERROR');
          db.close();
        }
        else{
          console.log('got image: ' + JSON.stringify(img));
          res.status(200).send('JIMP worked');
          db.close();
        }
      })
      const pageToken = obj.facebook.pageToken
      const pageId = obj.facebook.pageId
      console.log('USER IS: ' + JSON.stringify(obj));

      //set the parameters
      var options = {
        url: 'https://graph.facebook.com/' + pageId + '/feed?message=' + message + '&access_token=' + pageToken,
        method: 'POST'
      };
      console.log('OPTIONS URL: ' + options.url);

      function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
        }
        //success case
        console.log(body);
        res.status(200).send('Success');
      }

      //make the post request
      request(options, callback);

      db.close();
    }
  });
	}, err => {
			console.warn("Couldn't connect to database: " + err)
			res.status(500).end()
	});

	})

//make facebook post wth link and message
router.post("/postLinkOnFBPage", function(req,res){

	//connect to the db to check date of tokens
	database.connect(db => {
	//find the user in the db
	db.db('users').collection('users').findOne({ 'username': req.session.key}, (err, obj) => {
		if (err) {
			console.error(`Login request from ${req.ip} (for ${req.session.key}) returned error: ${err}`)
			res.status(500).end()
		}

		//set a unix time date
		const dateSent = obj.facebook.date
		const currDate = Math.floor(new Date() / 1000)

		//if token is older than 60 days
		if(currDate - dateSent >= 5184000){
			//make the user refresh the token to: make more fluid
			res.status(200).send("Hmmm...it seems your Facebook token is expired, please reconnect your Facebook in promotions.")
			db.close();
		}
		else{
			//get the message and parameters
			var {promo, coupon} = req.body;
			var message = promo.caption;
			//set the link to include in the post from the link
			var link=promo.link;
			if (coupon==null){
				if (!(promo.handles=="")){
					message= message+'\n'+promo.handles;
				}
			}
			else{
				if (!(promo.handles=="")){
					message= message+'\n'+promo.handles;
				}
				message = message + '\n' + coupon.details;
				if (coupon.hasOwnProperty('link')){
					message= message + '\n'+coupon.link;
				}
			}
			message = message + '\n\n'+'(posted from https://www.banda-inc.com where artists rise, venues grow, and music-lovers band together!)'
			//string concatination with handles, caption and coupon description nad our own Banda stuff

			var imgURL = promo.imgURL.replace('www.banda-inc.com//', 'www.banda-inc.com/');
			const pageToken = obj.facebook.pageToken
			const pageId = obj.facebook.pageId

			//set the parameters for message and link in post
			var options = {
				url: 'https://graph.facebook.com/' + pageId + '/feed?message=' + message + '&link=' + link + '&access_token=' + pageToken,
				method: 'POST'
			};
			console.log('OPTIONS URL: ' + options.url);

			function callback(error, response, body) {
				if (!error && response.statusCode == 200) {
						console.log(body);
				}
				//success case
				console.log(body);
				res.status(200).send('Success');
			}

			//make the post request
			request(options, callback);

			db.close();
		}
	});
	}, err => {
			console.warn("Couldn't connect to database: " + err)
			res.status(500).end()
	});
})

//make facebook post with photo link parameter on promo
router.post("/postImageToFB", function(req, res){
	//connect to the db to check date of tokens
database.connect(db => {
	console.log("Got in database connect");
	//find the user in the db
	db.db('users').collection('users').findOne({ 'username': req.session.key}, (err, obj) => {
		if (err) {
			console.error(`Login request from ${req.ip} (for ${req.session.key}) returned error: ${err}`)
			res.status(500).end()
		}

		const dateSent = obj.facebook.date
		const currDate = Math.floor(new Date() / 1000)

		//if token is older than 60 days
		if(currDate - dateSent >= 5184000){
			//make the user refresh the token to: make more fluid
			res.status(200).send("Hmmm...it seems your Facebook token is expired, please reconnect your Facebook in promotions.")
      db.close();
		}
    else{

      //get the massage
      var {promo, coupon} = req.body;
      var message = promo.caption;
			var link=promo.imgURL;
			//format the message and cupoun
      if (coupon==null){
        if (!(promo.handles==undefined)){
          message= message+'\n'+promo.handles;
        }
      }
      else{
        if (!(promo.handles==undefined)){
          message= message+'\n'+promo.handles;
        }
        message = message + '\n' + coupon.details;
        if (coupon.hasOwnProperty('link')){
          message= message + '\n'+coupon.link;
        }
      }
      message = message + '\n\n'+'(posted from https://www.banda-inc.com where artists rise, venues grow, and music-lovers band together!)'
      //string concatination with handles, caption and coupon description nad our own Banda stuff

      //testing imgURL
			var imgURL = promo.imgURL.replace('www.banda-inc.com//', 'http://localhost:1600/');
			//conver the impage
      Jimp.read(imgURL, (err4, img)=>{
        if (err4){
          console.log(err4);

        }
        else{
          console.log('IMG: ' + JSON.stringify(img));
          var mime = img.getMIME();
          console.log('mime:    ' + mime);
          if (mime==undefined || mime==null || mime=='none'){
            //data type not recognized error cb
					}
					//success case
          else{
						//convert iamge to base 64
            img.getBase64(mime, (err64, cb64)=>{
              if (err64){
                console.log('There was an error getting base64 encoding form image: ' + err64);
              }
              else{
                console.log('cb for image cb64: ' + JSON.stringify(cb64));
                console.log('  \n')

								//console.log('buffer data: ' + buffer.data);
								console.log('  \n')
								//store the needed tokens
                const pageToken = obj.facebook.pageToken
                const pageId = obj.facebook.pageId
                //console.log('USER IS: ' + JSON.stringify(obj));

                //set the parameters and post the image to facebook
                var options = {
                  url: 'https://graph.facebook.com/' + pageId + '/photos?caption=' + message + '&source=' + cb64+ '&access_token=' + pageToken,
                  method: 'POST'
                };
                console.log('OPTIONS URL: ' + options.url);

                function callback(error, response, body) {
                  if (!error && response.statusCode == 200) {
                      console.log(body);
                  }
                  if (error){
                    console.log('Error: ' + error);
                  }
                  //success case
                  console.log(body);
                  res.status(200).send('Success');
                }

                //make the post request
                request(options, callback);
                db.close();
              }
            })
          }

        }
      });
    }
  });
	}, err => {
			console.warn("Couldn't connect to database: " + err)
			res.status(500).end()
	});
})

//instialize passport js for user login with facebook
passport.use('inst_data',new FacebookStrategy({
	clientID: 475851112957866,
	clientSecret: '5c355ad2664c4b340a5a72e5ce7b9134',
	callbackURL: 'https://www.banda-inc.com/inst/token/return',
  passReqToCallback: true
},
function(req, accessToken, refreshToken, profile, cb) {
	//store values from the intial request
	let profile_id = profile.id
	let token = accessToken
	let longToken = ""
	const date = Math.floor(new Date() / 1000)
	console.log("the insta token is " + token)
	console.log("the profile id " + profile_id)

	axios.get('https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=475851112957866&client_secret=5c355ad2664c4b340a5a72e5ce7b9134&fb_exchange_token=' + token)
		.then(function (response) {
			//store intial values
			console.log(response.data);
			pageData = response.data
			longToken = response.data.access_token

			console.log("the long token is " + longToken)


			//store the access tokens and profile information
			axios.get("https://graph.facebook.com/v3.2/me/accounts?access_token=" + longToken)
				.then(function (response) {
					console.log(response.data)
					database.connect(db => {
						//set database path
						var users = db.db('users').collection('users');
						//store the access tokens and profile information
						db.db('users').collection('users').updateOne({'username':req.session.key},{$set:{'instagram':{'accessToken': longToken,
																																																						'fbProfile':profile,
																																																						'date': date}}}
						, (err4, res4)=>{
							if (err4){
								res.status(500).end();
								db.close();
							}
						else{
							console.log("!!!!!!!!!!!!!!!!!insta token was stored!!!!!!!!!!!!!!!!!")
							db.close();
						}
					});
				}, err => {
					console.warn("Couldn't connect to database: " + err)
					});
				})
				.catch(function (error) {
					console.log(error);
				})
				.finally(function () {
					// always executed
					return cb(null, profile);
				});
		})
		.catch(function (error) {
			console.log(error);
		})
		.finally(function () {
			// always executed
			//return cb(null, profile);
		});
		//return cb(null, profile);
	}
));

//route to get facebook access token
router.get('/getInstData', passport.authenticate('inst_data', { scope: [
	'instagram_basic',
			'instagram_manage_insights',
					'read_insights',
						'pages_show_list',
							'manage_pages',
								'public_profile']}))

//route for facebook oauth callback
router.get('/inst/token/return',
  passport.authenticate('inst_data', { failureRedirect: 'https://www.banda-inc.com/inst/token/failedAuth' }),
  function(req, res) {
		console.log("inst token callback")
    res.redirect('https://www.banda-inc.com/inst/token/successAuth');
	});

//route for failed token callback for facebook
router.get('/inst/token/failedAuth', (req, res) => {
	console.log("failuere reached")
	database.connect(db => {
		//set database path
		var users = db.db('users').collection('users');
		//check to see if the user laready exists
		users.findOne({ $or: [{email: req.session.key}, {username: req.session.key}]}, (err, obj) => {
			//catch error
			if (err) {
				console.error(`User find request from ${req.ip} (for ${username}) returned error: ${err}`)
				db.close();
			}
			console.log(obj)
			let token = ""
			if(token.length != undefined){
				token = obj.instagram.accessToken
			}
			else{
				token = obj.instagram.accessToken
			}
			let xurl = 'https://www.banda-inc.com/promo#?'
			//store the access tokens and profile information
			axios.get("https://graph.facebook.com/v3.2/me/accounts?access_token=" + token)
				.then(function (response) {
					const pages = response.data
					console.log(pages.data.length + " is tthe length")
					for(let i = 0; i < pages.data.length; i++){
						console.log("page is below")
						console.log(pages.data[i])
						xurl += "page" + i + "=" + pages.data[i].name + "&id" + i + "=" + pages.data[i].id + "&"
					}
					xurl += "pageNum=" + pages.data.length + "&isPromo=true" + "&isInsta=true"
					return res.redirect(xurl);
				})
				.catch(function (error) {
					console.log(error);
				})
				.finally(function () {
					// always executed
					return res.redirect(xurl);
				});
		})
	}, err => {
		console.warn("Couldn't connect to database: " + err)
		res.status(500).send()
	});
	return res.redirect('https://www.banda-inc.com/promo#');
})

//route for succesful token  callback for facebook
router.get('/inst/token/successAuth', (req, res) => {
	console.log("success reached")
	database.connect(db => {
		//set database path
		var users = db.db('users').collection('users');
		//check to see if the user laready exists
		users.findOne({ $or: [{email: req.session.key}, {username: req.session.key}]}, (err, obj) => {
			//catch error
			if (err) {
				console.error(`User find request from ${req.ip} (for ${username}) returned error: ${err}`)
				db.close();
			}
			console.log(obj)
			let token = ""
			if(token.length != undefined){
				token = obj.instagram.accessToken
			}
			else{
				token = obj.instagram.accessToken
			}
			let xurl = 'https://www.banda-inc.com/promo#?'
			//store the access tokens and profile information
			axios.get("https://graph.facebook.com/v3.2/me/accounts?access_token=" + token)
				.then(function (response) {
					const pages = response.data
					//create page modal url
					for(let i = 0; i < pages.data.length; i++){
						xurl += "page" + i + "=" + pages.data[i].name + "&id" + i + "=" + pages.data[i].id + "&"
					}
					xurl += "pageNum=" + pages.data.length + "&isPromo=true" + "&isInsta=true"
					//redirect to the page selection modal
					return res.redirect(xurl);
				})
				.catch(function (error) {
					console.log(error);
				})
				.finally(function () {
					// always executed
					return res.redirect(xurl);
				});
		})
		})
		, err => {
			console.warn("Couldn't connect to database: " + err)
			res.status(500).send()
		};
})

//route to store users insta data
router.post('/storeInstData', (req,res)=>{
	let followerCount = 0
	let postCount = 0

	let instaId = ""
	let token = ""
	let pageName = ""
	let instaBussinessAccount = ""
	let instagramUsername = ""

	//set query parameters
	instaId = req.body.pageId
	pageName = req.body.pageName
	instagramUsername = req.body.username

 database.connect(db => {
		//set database path
		var users = db.db('users').collection('users');
		//check to see if the user laready exists
		users.findOne({ $or: [{email: req.session.key}, {username: req.session.key}]}, (err, obj) => {
			//catch error
			if (err) {
				console.error(`User find request from ${req.ip} (for ${username}) returned error: ${err}`)
				db.close();
			}
			//console.log(obj.instagram[obj.instagram.length - 1].accessToken)
			console.log(obj)
			console.log(obj.instagram)
			console.log(obj.instagram.accessToken)
			token = obj.instagram.accessToken
			//query for the account id
			axios.get("https://graph.facebook.com/v3.2/" + instaId + "?fields=instagram_business_account&access_token=" + token)
				.then(function (response) {
					console.log(response.data);
					instaBussinessAccount = response.data.instagram_business_account.id

					// // //get follower count and media count
					axios.get("https://graph.facebook.com/v3.3/" + instaBussinessAccount + "?fields=business_discovery.username(" + instagramUsername + "){followers_count,media_count}&access_token=" + token)
					  .then(function (response) {
							console.log(response.data);
							followerCount = response.data.business_discovery.followers_count
							postCount = response.data.business_discovery.media_count

							// //request instagram ofor insights
							axios.get("https://graph.facebook.com/v3.3/" + instaId + "/insights?metric=impressions,profile_views,website_clicks&period=day&access_token=" + token)
								.then(function (response) {
									console.log(response.data);
									let impressions = response.data.data[0]
									let profileViews = response.data.data[1]
									let websiteClicks = response.data.data[2]

									axios.get("https://graph.facebook.com/v3.3/" + instaId + "/insights?metric=reach&period=week&access_token=" + token)
										.then(function (response) {
											console.log(response.data);
											let reach = response.data.data[0]

											//create the instagram data object
											let instagramData = { impressions: impressions,
													profileViews: profileViews,
														websiteClicks: websiteClicks,
															instaBussinessAccount: instaBussinessAccount,
																followerCount: followerCount,
																	postCount: postCount,
																		token: token,
																			instaId: instaId,
																				pageName: pageName,
																					instagramUsername: instagramUsername,
																						reach: reach }

																						database.connect(db => {
																							//store the access tokens and profile information
																							db.db('users').collection('users').updateOne({'username':req.session.key}, {$set:{ 'instagram': instagramData }}
																								, (err4, res4)=>{
																										if (err4){
																											res.status(500).end();
																											db.close();
																										}
																										else{
																											//success case
																											db.close();
																											res.status(200).send('Success');

																										}
																							});
																						}, err => {
																							console.warn("Couldn't connect to database: " + err)
																						});
										})
										.catch(function (error) {
											console.log(error);
										})

								})
								.catch(function (error) {
									console.log(error);
								})
					  })
					  .catch(function (error) {
					    console.log(error);
						})
				})
				.catch(function (error) {
					console.log(error);
				})

		})
	}, err => {
		console.warn("Couldn't connect to database: " + err)
		res.status(500).send()
	});

	res.send("success")
})




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
})



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
