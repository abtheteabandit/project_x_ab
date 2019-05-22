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

module.exports = {
	connect: connect,
	objectId: objectId,
	usernameFromId: usernameFromId,
	idFromUsername: idFromUsername,
}

const PORT = 27017,
      MONGO_URL = `mongodb://localhost:${PORT}/banda`;

const mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;


// function create_mongodb() {
// 	connect(db => {
// 		db.collection.createIndex(
// 	}, console.error)
// }


function objectId(id) {
	return mongodb.ObjectID(id);
}

function connect (cbOk, cbErr) {
	MongoClient.connect(MONGO_URL, { useNewUrlParser : true}, (err, db) => {
		if (err) {
			console.error(`Error occrued: ${err}`);
			cbErr('An internal error occured');
		}
		else
			cbOk(db);
	})
}

function usernameFromId (id, cbOk, cbErr, cbNotFound, db=undefined) {
	function exec(db) {
		db.db('users').collection('users').findOne({_id: objectId(id)}, (err, res) => {
			if (err) {
				cbErr(err)
			} else if (!res) {
				cbNotFound()
			} else {
				cbOk(res.username)
			}
		});
	}

	if (db) {
		exec(db)
	} else {
		connect(exec)
	}
}

function idFromUsername (username, cbOk, cbErr, cbNotFound, db=undefined) {
	function exec(db) {
		db.db('users').collection('users').findOne({username: username}, (err, res) => {
			if (err) {
				cbErr(err)
			} else if (!res) {
				cbNotFound()
			} else {
				cbOk(res._id)
			}
		});
	}

	if (db) {
		exec(db)
	} else {
		connect(exec)
	}
}


// function connect (database, collection, cbOk, cbErr) {
// 	connect_to_database(db => {
// 		cbOk(db.db(database).collection(collection))
// 		db.close();
// 	}, cbErr)
// }


// function filter_fields(json) {
// 	var result = {};
// 	for (var i = 1; i < arguments.length; i++) {
// 		var field = arguments[i];

// 		if (!(result[field] = json[field]))
// 			return [false, `missing field '${field}'`];
// 	}
// 	return [true, result]
// }

// function login_user(user, cbOk, cbErr) {
//     [ok, filtered] = filter_fields(user, 'user', 'pwd');
//     if(!ok)
//     	return cbErr(filtered);

// 	connect_to_database('users', db => {
// 		db.db('users').collection('users').find(query).toArray((err, user) => {
// 			if (err) throw err;
// 			callback(user);
// 			db.close()
// 		})
// 	});

//     if(!ok)
//     	return cbErr(filtered);
//     cbOk('<logged in but not actually cause i havent done that yet>');

// // router.post('/login',function(req,res){
// //     handle_database(req,"login",function(response){
// //         if(response === null) {
// //             res.json({"error" : "true","message" : "Database error occured"});
// //         } else {
// //             if(!response) {
// //               res.json({
// //                              "error" : "true",
// //                              "message" : "Login failed ! Please register"
// //                            });
// //             } else {
// //                req.session.key = response;
// //                    res.json({"error" : false,"message" : "Login success."});
// //             }
// //         }
// //     });
// // });

// }

// function register_user(user, cbOk, cbErr) {
//     [ok, user] = filter_fields(user, 'username', 'password', 'email');
//     if(!ok)
//     	return cbErr(user);

// function get_user(username, callback) {
// 	var query = { username: username };
// 	connect_to_database('users', db => {
// 		db.db('users').collection('users').find(query).toArray((err, user) => {
// 			if (err) throw err;
// 			callback(user);
// 			db.close()
// 		})
// 	});
// }

// function del_user(username, callback) {
// 	// TODO: authenticate this
// 	var query = { username: username }
// 	connect_to_database('users', db => {
// 		db.db('users').collection('users').deleteOne(query, (err, obj) => {
// 			if (err)
// 				throw err;
// 			console.log('Deleted: ' + username);
// 			console.log(obj.result.n + ' document(s) deleted');
// 			callback(obj);
// 			db.close();
// 		});
// 	})
// }


// // module.exports = {
// // 	login_user: login_user,
// // 	register_user: register_user
// // }
