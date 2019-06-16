module.exports = router =>{
  const database = require('../database.js');
  router.get('/picForUser', (req, res)=>{
    if (!req.session.key){
      console.log('No logged in user tried to cross promote');
      req.status(404).end();
    }
    //if no body exists
    if (!req.query){
      console.log('Cross promote had no body');
      req.status(401).end();
    }
    else{
      var {username} = req.query;
      
      database.connect(db=>{
        db.db('bands').collection('bands').find({'creator':username}).toArray(function(err1, bands){
          if (err1){
            console.log('There was an error finding bands for user: ' + username + ' Error: ' + err1);
            res.status(200).send('None');
            db.close();
          }
          else{
            var imgURL = "";
            if (bands==null || bands.length==0){
              db.db('gigs').collection('gigs').find({'creator':username}).toArray(function(err2, gigs){
                if (err2){
                  console.log('There was an error finding bands for user: ' + username + ' Error: ' + err2);
                  res.status(200).send('None');
                  db.close();
                }
                else{
                  if (gigs == null || gigs.length==0){
                    res.status(200).send('None');
                    db.close();
                  }
                  else{
                    var gigImg = "";
                    for (var g in gigs){
                      var gig = gigs[g];
                      gigImg = gig.picture;
                    }
                    res.status(200).send(gigImg);
                  }

                }
              });
            }
            else{
              for (var b in bands){
                var band = bands[b];
                imgURL = band.picture;
              }
              res.status(200).send(imgURL);
              db.close();
            }
          }
        });
      }, dbErr=>{
        console.log('There was an error connectiong to mongo: ' + err);
        res.status(200).send('Internal Server Error');
      });
    }

  });
}
