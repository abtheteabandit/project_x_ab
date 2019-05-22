//additional node modules in use
var passwordHash = require('password-hash')
var passwordValidator = require('password-validator');
var validator = require("email-validator");
 


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
	var {username, email, password, confirm_password} = req.body;
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
				users.insertOne({ email: email, username: username, password: password, contacts:[]}, (err, obj) => {
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
					res.status(200).send('Success');
					db.close();
				}
				//else it is not correct
				else{
					console.log('got in else meaning passwordhas veirfy returned false for username: ' + username + 'passowrd: ' + password)
					return res.status(200).send('Not a valid login')
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

} /* end module.exports */
