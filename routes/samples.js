module.exports = router => {
  const database = require('../database.js');

  //get request for the band samples
  router.get('/samples', (req, res)=>{
    database.connect(db=>{
      //query the db
      db.db('bands').collection('bands').find({}, {'audioSamples':1}).toArray(function(err2, result2){
        if(err2){
          console.log('There was an error getting samples: ' + err2);
          db.close();
        }
        console.log(JSON.stringify(result2));
        res.status(200).send(result2);
        db.close();
      });
    }, err=>{
      console.log('There was an error connecting to mongo: ' + err);
    });
  });
}
