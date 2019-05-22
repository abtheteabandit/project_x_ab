module.exports = router => {
  database = require('../database.js');

  //get request for the current user's data
  router.get('/user', (req, res)=>{
    console.log("GOT INTO GET USERNAMEE");
    console.log('session is: '+ JSON.stringify(req.session));
    console.log('client is: '+ JSON.stringify(req.session.client));
    console.log('client is: '+ JSON.stringify(req.session.store));

    var userkey = req.session.key;
    console.log('userkey is :' + userkey);
    //find the users data in the db
    database.connect(db=>{
      db.db('users').collection('users').findOne({'username': userkey}, function(err2, result){
        if (err2){
          console.log('There was an error trying to find user with id: '+userkey+ " error: "+ err2);
          res.status(500).end();
          db.close();
        }
        else{
          //success case
          res.status(200).send(result);
          db.close();
        }
      });
    }, err=>{
      console.error('couldnt connect to database: ' + err);
      res.status(500).end();

    });

  }, error=>{
    console.warn("Couldn't connect to server: " + err)
		res.status(500).end()
  });
}
