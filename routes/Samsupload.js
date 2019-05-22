module.exports = router => {

const database = require('../database.js'),
      multer = require('multer'),
    //  logger = require('../logger.js'),
      fs = require('fs');

//creating a path for uploads
const UPLOADS_VIRTUAL_BASE_DIR = '/uploads',
      UPLOADS_BASE_DIR = 'static' + UPLOADS_VIRTUAL_BASE_DIR,
      UPLOADS_BASE_DIR_USERS = UPLOADS_BASE_DIR + '/user',
      UPLOADS_BASE_DIR_BANDS = UPLOADS_BASE_DIR + '/user';

//get request of uploads
router.get('/_upload', (req, res) => {
	var id = req.session.key;
	if (!id) {
		return res.status(403).send('Not logged in').end();
	}
	//render and return the uploads
	database.usernameFromId(id, username => {
		res.render('_upload.html', {username: username})
	}, err => {
		logger.warn("[")
		console.warn(`Username find request from ${req.ip} (for ${id}) returned error: ${err}`)
		res.status(500).end();
	}, () => {
		console.warn(`Username find request from ${req.ip} (for ${id}) couldn't find a username`);
		res.status(500).end();
	})
})

//function to get the user files
function getUserFile(basedir, collection) {
	return (req, res) => {
		database.connect(db => {
			database.idFromUsername(req.params.username, id => {
				//get the users files based on id
				db.db('users').collection(collection).findOne({ owner: id }, (err, obj) => {
					if (err) {
						console.warn(`${collection} request ${req.url} (from ${req.ip}) caused an error when finding: ${err}`);
						res.status(500).end()
					} else if (obj === null) {
						res.status(404).end()
					} else {
						//success case
						res.redirect(UPLOADS_VIRTUAL_BASE_DIR + basedir + '/' + obj.filename)
					}
				})
				}, err => {
					console.warn(`${collection} request ${req.url} (from ${req.ip}) caused an error when getting id: ${err}`);
					res.status(500).end()
				}, () => {
					res.status(404).end()
				}, db
			)
		}, err => {
			console.warn("Couldn't connect to database: " + err)
			res.status(500).end()
		})
	}
}

//routes for geeting the users avatar and sounds
router.get('/users/:username/avatar', getUserFile('/avatars', 'avatars'));
router.get('/users/:username/soundbyte', getUserFile('/soundbytes', 'soundbytes'));

//function to get the bands files
function getBandFile(basedir, collection) {
	return (req, res) => {
		database.connect(db => {
			database.idFromUsername(req.params.bandname, id => {
				//get the band needed
				db.db('bands').collection(collection).findOne({ owner: id }, (err, obj) => {
					if (err) {
						console.warn(`${collection} request ${req.url} (from ${req.ip}) caused an error when finding: ${err}`);
						res.status(500).end()
					} else if (obj === null) {
						res.status(404).end()
					} else {
						//redirect to the bands uploads
						res.redirect(UPLOADS_VIRTUAL_BASE_DIR + basedir + '/' + obj.filename)
					}
				})
				}, err => {
					console.warn(`${collection} request ${req.url} (from ${req.ip}) caused an error when getting id: ${err}`);
					res.status(500).end()
				}, () => {
					res.status(404).end()
				}, db
			)
		}, err => {
			console.warn("Couldn't connect to database: " + err)
			res.status(500).end()
		})
	}
}

//get routes for the bands avatar and sounds
router.get('/bands/:bandname/avatar', getBandFile('/avatars', 'avatars'));
router.get('/bands/:bandname/soundbyte', getBandFile('/soundbytes', 'soundbytes'));

//function to validate the user is logged in
function requireLoggedIn(which) {
	return (req, res, next) => {
		if (!req.session.key) {
			console.info(`User from ${req.ip} tried to upload a(n) ${which} whilst not logged in`);
			res.status(401).send('Not logged in').end();
		} else {
			next()
		}
	};
}

//function for uploading new user files
function uploadUserFile(basedir, collection, which) {
	return [
		requireLoggedIn(which),
		multer({ dest: UPLOADS_BASE_DIR_USERS + basedir }).single(which),
		(req, res) => {
			console.log(`[${req.ip}] File uploaded: ` + req.file.path);

			var id = req.session.key;
			var filename = req.file.filename;

			if (!id) {
				console.warn("User wasn't logged in, but got past `requireLoggedIn`");
				return res.status(500).end();
			}
			//connect to the db
			database.connect(db => {
				var coll = db.db('users').collection(collection);
				//remove the previous or old files
				coll.deleteMany({ owner: database.objectId(id) }, (err, _obj) => {
					if (err) {
						console.warn(`Couldn't delete ${which} with user id ${id}: ${err}`);
						res.status(500).end()
						db.close()
					} else {
						// insert the new files
						coll.insertOne({ filename: filename, owner: database.objectId(id) }, (err, _result) => {
							if (err) {
								console.warn(`Couldn't insert ${which} with owner '${id}', filename '${filename}': ${err}`)
								res.status(500).end()
							} else {
								res.status(200).json({ success: true }).end()
							}
							db.close()
						})
					}
				})
			}, err => {
				console.warn("Couldn't connect to database: " + err);
				res.status(500).end()
			})
		}
	];
}

//delete the user files
function deleteUserFile(basedir, collection, which) {
	return [
		requireLoggedIn(which),
		(req, res) => {
			var id = req.session.key;

			if (!id) {
				console.warn("User wasn't logged in, but got past `requireLoggedIn`");
				return res.status(500).end();
			}
			//connect to the db
			database.connect(db => {
				var coll = db.db('users').collection(collection);
				//find the username's files
				coll.findOne({ 'username': id }, (err, obj) => {
					if (err) {
						console.warn(`Couldn't find ${which} for user ${id}: ${err}`);
						res.status(500).end()
					} else {
						//create the needed path
						var file = UPLOADS_BASE_DIR_USERS + basedir + '/' + obj.filename;
						//remove the files from the path
						coll.deleteMany({ owner: database.objectId(id) }, (err, _obj) => {
							db.close();
							if (err) {
								console.warn(`Couldn't delete ${which} with user id ${id}: ${err}`);
								res.status(500).end()
							} else if (!obj) {
								console.warn(`Couldn't delete ${which} corresponding to user ${id}`);
								res.status(500).end()
							} else {
								console.log(JSON.stringify(obj));
								//unlink the deleted files
								fs.unlink(file, err => {
									if (err) {
										console.warn(`Couldn't delete ${which} file '${file}' for user ${id}: ${err}`);
									} else {
										console.log(`Deleted file ${which} file ${file} for user ${id}`);
									}
									res.status(200).json({ success: true }).end(); // users doesn't need to know there was an error
								})
							}
						})
					}
				})
			}, err => {
				console.warn("Couldn't connect to database: " + err);
				res.status(500).end()
			})
		}
	];
}
//uploading and deleting user files
router.route('/settings/avatar')
	.post(uploadUserFile('/avatars', 'avatars', 'avatar'))
	.delete(deleteUserFile('/avatars', 'avatars', 'avatar'));

// router.route('/user/:username/bands')
//   .get(/* return gigs that username has */)
//   .post(/* add a new gig */) // needs logged in
//   .update(/* update a gig */) // ^
//   .delete(/* delete a gig */) // ^

//uplaoding and deleting sound bytes
router.route('/settings/soundbyte')
	.post(uploadUserFile('/soundbytes', 'soundbytes', 'soundbyte'))
	.delete(deleteUserFile('/soundbytes', 'soundbytes', 'soundbyte'));


	//functino to upload a band file 
function uploadBandFile(basedir, collection, which) {
	return [
		requireLoggedIn(which),
		multer({ dest: UPLOADS_BASE_DIR_BANDS + basedir }).single(which),
		(req, res) => {
			console.log(`[${req.ip}] File uploaded: ` + req.file.path);

			var id = req.session.key;
			var filename = req.file.filename;

			if (!id) {
				console.warn("User wasn't logged in, but got past `requireLoggedIn`");
				return res.status(500).end();
			}

			//connect to the database
			database.connect(db => {
				var coll = db.db('bands').collection(collection);

				//detlete old file in the database
				coll.deleteMany({ owner: database.objectId(id) }, (err, _obj) => {
					if (err) {
						console.warn(`Couldn't delete ${which} with user id ${id}: ${err}`);
						res.status(500).end()
						db.close()
					} else {
						// insert new files into the db
						coll.insertOne({ filename: filename, owner: database.objectId(id) }, (err, _result) => {
							if (err) {
								console.warn(`Couldn't insert ${which} with owner '${id}', filename '${filename}': ${err}`)
								res.status(500).end()
							} else {
								res.status(200).json({ success: true }).end()
							}
							db.close()
						})
					}
				})
			}, err => {
				console.warn("Couldn't connect to database: " + err);
				res.status(500).end()
			})
		}
	];
}

//delete specific band files
function deleteBandFile(basedir, collection, which) {
	return [
		requireLoggedIn(which),
		(req, res) => {
			var id = req.session.key;

			if (!id) {
				console.warn("User wasn't logged in, but got past `requireLoggedIn`");
				return res.status(500).end();
			}

			//connect to the database
			database.connect(db => {
				var coll = db.db('bands').collection(collection);
				//find the new id
				coll.findOne({ 'creator': id }, (err, obj) => {
					if (err) {
						console.warn(`Couldn't find ${which} for band ${id}: ${err}`);
						res.status(500).end()
					} else {
						//create and find the new file path
						var file = UPLOADS_BASE_DIR_BANDS + basedir + '/' + obj.filename;
						//delete the file
						coll.deleteMany({ 'creator': id }, (err, _obj) => {
							db.close();
							if (err) {
								console.warn(`Couldn't delete ${which} with band id ${id}: ${err}`);
								res.status(500).end()
							} else if (!obj) {
								console.warn(`Couldn't delete ${which} corresponding to band ${id}`);
								res.status(500).end()
							} else {
								//unlink the file
								console.log(JSON.stringify(obj));
								fs.unlink(file, err => {
									if (err) {
										console.warn(`Couldn't delete ${which} file '${file}' for band ${id}: ${err}`);
									} else {
										console.log(`Deleted file ${which} file ${file} for band ${id}`);
									}
									res.status(200).json({ success: true }).end(); // users doesn't need to know there was an error
								})
							}
						})
					}
				})
			}, err => {
				console.warn("Couldn't connect to database: " + err);
				res.status(500).end()
			})
		}
	];
}
//rountes to upload and delete band avatars
router.route('/bands/avatar')
	.post(uploadBandFile('/avatars', 'avatars', 'avatar'))
	.delete(deleteBandFile('/avatars', 'avatars', 'avatar'));

	//routes to upload and delete band sound bytes
router.route('/bands/soundbyte')
	.post(uploadBandFile('/soundbytes', 'soundbytes', 'soundbyte'))
	.delete(deleteBandFile('/soundbytes', 'soundbytes', 'soundbyte'));

  
} /* end module.exports */
