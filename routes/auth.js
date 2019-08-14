//additional node modules in use
var passwordHash = require('password-hash')
var passwordValidator = require('password-validator');
var validator = require("email-validator");


//start router for exporting
module.exports = router => {
database = require('../database.js');

// temporary routes for testing
/*
router.get('/register', (_, res) => res.redirect('_register'));
router.get('/login', (_, res) => res.redirect('_login'));
router.get('/logout', (_, res) => res.redirect('_logout'));
router.get('/_register', (_, res) => res.render('_register.html'));
router.get('/_login', (_, res) => res.render('_login.html'));
router.get('/_logout', (_, res) => res.render('_logout.html'));
*/
/** login and validation stuff **/

//ensure the password is secure
function validatePassword(password) {
	console.log("validate password entered!!!!!!!!!!!")
	var schema = new passwordValidator();
	schema
	.is().min(8)                                    // Minimum length 8
	.is().max(100)                                  // Maximum length 100
	.has().uppercase()                              // Must have uppercase letters
	.has().lowercase()                              // Must have lowercase letters
	.has().digits()                                 // Must have digits
	.has().not().spaces()                           // Should not have spaces
	console.log(schema.validate(password))
	return schema.validate(password)
}

//hashes the password
function hashPassword(password) {
	password = passwordHash.generate(password);
	return password;
}

//post request to register a user
router.post('/register', (req, res) => {
	console.log("GOT INTO Register");
	if (req.session.key) {
		console.info(`User ${req.session.key} from ${req.ip} attempted to register whilst logged in`);
		req.session.key=req.session.key
	  res.status(200).send('Already logged in');
		return;
	}

	//store values from the request
	var {username, email, password, confirm_password, phone} = req.body;
	console.log("GOT user name, email and passowrd they are: " + username + " " + email + " " + password + " " + confirm_password);

//confirm password is the same
	if(password != confirm_password){
	  res.status(200).send('Passwords do not match')
		return;
	}

	//check for null values
	if (!username) {
		return res.status(400).send('No username supplied')
	} else if (!password) {
		return res.status(400).send('No password supplied')
	} else if (!email) {
		return res.status(400).send('No email supplied')
	}

	//confirm email address is a valid email address
	if(!validator.validate(email)){
		console.log("password is not valid")
	  res.status(200).send('Please enter a valid email').end();
		return;
	} // true

	//confirm the password is secure
	if (validatePassword(password) == false) {
		console.log("password is not valid")
	  res.status(200).send('Your password must contain atleast 8 characters, a number, a lower case character, an upper case character, and no spaces').end();
		return;
	}

	//hash the password
	password = hashPassword(password);

	database.connect(db => {
		//store the user in the database
		var users = db.db('users').collection('users');
		//check to see if the user laready exists
		users.findOne({ $or: [{email: email}, {username: username}]}, (err, obj) => {
			if (err) {
				console.error(`User find request from ${req.ip} (for ${username}) returned error: ${err}`)
				res.status(500).end()
				db.close();
			} else if (obj) {
				console.log('That username or email already exists sending that info back.')
				res.status(200).send('Username or email already exists').end();
			} else {
				//if not, create a new user
				users.insertOne({ email: email, username: username, password: password, contacts:[], 'phone':phone}, (err, obj) => {
					if (err) {
						console.error(`Register request from ${req.ip} (for ${username}, ${email}, ${password}) returned error: ${err}`);
						res.status(500).end();
						db.close();
					} else {
						//booth code, testing how to store usernames in sessions//
						req.session.key = username;
						console.log('Req session key after inserting user for register is: ' + req.session.key);
						///////
						res.status(200).send('Success');
						db.close();
					}
				});
			}
		})
	}, err => {
		console.warn("Couldn't connect to database: " + err)
		res.status(500).end()
	});
})

//post request for logging in a user
router.post('/login', (req, res) => {
	console.log("IN LOGIN On Router Page");
	if (req.session.key) {
		console.info(`User ${req.session.key} from ${req.ip} attempted to login whilst logged in`);
		req.session.key = req.session.key;
	  res.status(402).send('Already logged in').end();
	}

	//store values from the request
	var {username, password} = req.body;
	console.log("////////////////////////////////////////////////////////////////////////////////////");
	console.log("GOt username it is : " + username);
	console.log(" ");
	console.log("////////////////////////////////////////////////////////////////////////////////////");
	console.log("GOt password it is : " + password);
	console.log(" ");
	if (!username) {
	  res.status(200).send('No username supplied')
	} else if (!password) {
	  res.status(200).send('No password supplied')
	}

	//password = hashPassword(password);

	//connect to the db
	database.connect(db => {
		console.log("Got in database connect");
		//find the user in the db
		db.db('users').collection('users').findOne({ 'username': username}, (err, obj) => {
			console.log("Got in find one");
			console.log(JSON.stringify(obj));
			if (err) {
				console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
				res.status(500).end()
			} else if (!obj) {
				console.log('No user with that username');
				res.status(200).send('Hmmm...It seems there is no user with that username on record, please try again.')

			} else {
				//if the user's password is correct
				if(passwordHash.verify(password, obj.password)){
					console.log("////////////////////////////////////////////////////////////////////////////////////");
					req.session.key = username;
					console.log('In the login, just made the session key from obj key and it is: ' + req.session.key);
					res.status(200).send('Success').end();
					return;
					db.close();
				}
				//else it is not correct
				else{
					console.log('got in else meaning passwordhas veirfy returned false for username: ' + username + 'passowrd: ' + password)
					res.status(200).send('Not a valid login')
					db.close();

				}
			}
		})
	}, err => {
		console.warn("Couldn't connect to database: " + err)
		res.status(500).end()
	});
});

//get request to logout a user
router.get('/logout', (req, res) => {
	if(req.session.key) {
		//end the users session
		req.session.destroy(() => res.status(200).json({ success: true }).end())
	} else {
		return res.status(402).send('Not logged in').end()
    }
});

//check if a user is logged in
router.get('/hasSession', (req, res) =>{
	console.log("checking session")
	if(req.session.key){
		//if the user is logged in
		console.log("is true")
		res.status(200).json({ success: true }).end()
	}
	else{
		//if the user has no session
		console.log("is false")
		res.status(200).json({ success: false }).end()
	}
})

router.post('/forgotPassword', (req,res)=>{
	if (req.hasOwnProperty('session')){
		if (req.session.hasOwnProperty('key')){
			if (req.session.key){
				console.log('Already logged in!')
				res.status(400).end()
			}
		}
	}
	if (!req.body){
		console.log('no body')
		res.status(400).end()
	}
	else{
		var {username} = req.body
		if (!username){
			console.log('no username and no email sent');
			res.status(200).send("Sorry, you must provide your username. If you have forgotten both please contact banda.help.customers@gmail.com.")
		}
		else{
			database.connect(db=>{
				db.db('users').collection('users').findOne({'username':username}, (err, user)=>{
					if (err){
						console.log('There was an error finding user: ' + username + err)
						res.status(200).send('Hmmm...there was an issue finding this username or email. Please try again. If this problem persits please contact us at banda.help.customers@gmail.com')
						db.close()
					}
					else{
						var newPassword = generateRandomPassword();
						var hashedPass = hashPassword(newPassword);
						if (user){
							db.db('users').collection('users').updateOne({'username':username}, {$set:{'password':hashedPass}}, (err3, res3)=>{
								if (err3){
									console.log('There was an error reseting password in db for user: ' + username + err3);
									res.status(200).send('Hmmm...there was an issue reseting your password. Please resfresh this page and try again. If this problem persits please contact us at banda.help.customers@gmail.com')
									db.close();
								}
								else{
									sendPasswordEmail(user, newPassword, (emailErr, ok)=>{
										if (emailErr){
											console.log('There was an error send eamil to user: ' + user.email + emailErr)
											res.status(200).send('Hmmm...there was an issue sending the new password to your email. Please resfresh this page and try again. If this problem persits please contact us at banda.help.customers@gmail.com')
											db.close()
										}
										else{
											console.log('Sent email with new password: '+newPassword+' to: ' + user.email)
											res.status(200).send('We have reset your password and sent the new password to your email. Just enter the new password with your username on the login modal.')
											db.close()
										}
									});
								}
							})

						}
						else{
							console.log('No user: ' + username +' '+email)
							res.status(200).send('Sorry, we do not recognize this username or email. Please try again wit a different email or username. If this is incorrect please email us at banda.help.customers@gmail.com')
							db.close();
						}
					}
				});
			}, dbErr=>{
				console.log('Error connecting to mongo: ' + dbErr);
				res.status(500).end();
			})

		}
	}

})

function sendPasswordEmail(user, password, cb){
	if (!user.hasOwnProperty('email')){
		cb('Sorry, it seems your account does not have an email associated with it. Please sign up for a new account or contact our support team.');
	}
	else{
		let transporter = nodeMailer.createTransport({
				host: 'smtp.gmail.com', // go daddy email host port
				port: 465, // could be 993
				secure: true,
				auth: {
						user: 'banda.confirmation@gmail.com',
						pass: 'N5gdakxq9!'
				}
		});
		var mailOptions = {
			 from: 'banda.confirmation@gmail.com', // our address
			 to: user.email, // who we sending to
			 subject: "Reset Password For Banda", // Subject line
			 text: 'Hello, '+user.username+',\nSorry your password was lost we have reset it to:\n'+password+'\n Enter this password with your username on www.banda-inc.com in our login modal and you should be all good. Thank you.', // plain text body
			 html: ""// html body
		};

		transporter.sendMail(mailOptions, (error, info) => {
			 if (error) {
					console.log('There was an error sending the email: ' + error);
					cb(error, null);
			 }
			 else{
				 console.log('Message sent: ' + JSON.stringify(info));
				 cb(null, info);
			 }
		 });
	}
}

function generateRandomPassword(){
	var q = Math.random(12)
	var p = Math.random(20)
	var x = Math.random(q);
  var y = Math.random(q);
  var code = Math.random(x).toString(36).replace('0.', '');
  code += "p12aqwwzzw12urd"
  code += Math.random(y).toString(36).replace('0.', '');
  console.log('Random Code: ' + code);
  return code;
}


} /* end module.exports */
