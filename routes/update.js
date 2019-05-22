module.exports = router => {
  const database = require('../database.js');
  var ObjectId = require('mongodb').ObjectID;

  //post request to update the data of a gig
  router.post('/updateGig', (req, res) => {
    if (!req.body) {
  		 res.status(400).send('No body sent').end();
    }
    
    //query the database
    database.connect(db=>{
      var {id, query} = req.body;
      var newvalues = query;
      console.log(JSON.stringify(newvalues));
      //update the gigs based on id
      db.db('gigs').collection("gigs").updateOne({'_id':ObjectId(id)}, newvalues, result =>{
        console.log("updated gig " + id);
        res.status(200).send(result);
        db.close();

      }, error =>{
        console.log("There was an error: " + error);
        res.send("Internal server error").end();
        db.close();
      });
    }, err=>{
      console.log("Couldn't connec to mongo with error: "+err);
      res.status(500).end();
    });

  });

  //update a band based on id
  router.post('/updateBand', (req, res) =>{
    if (!req.body) {
  		 res.status(400).send('No body sent').end();
  	}
    if(!req.session.key){
      console.log('No logged in user tried to edit band');
      res.status(403).end();
    }
    var {id, query} = req.body;
    var newvalues =  query;
    console.log('query :' + JSON.stringify(query));
    database.connect(db=>{
      //update the band in the db
      db.db('bands').collection("bands").updateOne({'_id':ObjectId(id)}, newvalues, result=>{
        console.log("updated band " + id);
        res.status(200).end();
        db.close();
      }, error=>{
        console.log("There was an error: " + err);
        res.status(500).send("Internal server error").end();
        db.close();
      });
    }, err=>{
      console.log("Couldn't connec to mongo with error: "+err);
      res.status(500).end();
    });
  });

  //update a bands rating
  router.post('/bandRating', (req, res) =>{
    if (!req.body) {
  		 res.status(400).send('No body sent').end();
  	}

    var {id, newRating, gigID, showedUp} = req.body;
    console.log('new rating is : ' + newRating)

    database.connect(db=>{
      //find the band with the id needed
      db.db('bands').collection('bands').findOne({'_id':ObjectId(id)}, function(err2, result){
        if (err2){
          console.log("Error while trying to find band with id: "+id+"Error: "+err2);
          res.sataus(500).end();
        }
        else{
          console.log("Result from find one band in rating post is: "+JSON.stringify(result));
          var myBand = result;
          //sanitize data
          var noShows = parseInt(result['noShows']);
          if (noShows == null){
            if (!showedUp){
              noShows = 1;
            }
            else{
              noShows = 0;
            }
          }
          else{
            if (!showedUp){
              noShows += 1;
            }
          }
          //store rating and num rating
          var rating = result['rating'];
          var numRatings = result['numRatings'];
          console.log('Num ratings: ' + numRatings);
          console.log('var rating =' + rating );
          //udpate values
          if (numRatings==null || numRatings==0  ||numRatings=='0' || numRatings==""){
            numRatings=1;
            var timesShowed = 1;
            if (showedUp){
              timesShowed=1;
            }
            else{
               timesShowed = 0;
            }
            var percentShows = timesShowed;
            var query = {'rating':newRating, 'numRatings':1, 'noShows':noShows, 'showsUp':percentShows};
            var newvalues = {$set: query};
            console.log('about to set rating with: ' + JSON.stringify(newvalues));
            //update the database for bands
              db.db('bands').collection("bands").updateOne({'_id':ObjectId(id)}, newvalues, res4=>{
                console.log("updated band " + id);
                var newValues2 = {$set:{'recievedRating':true}};
              //  console.log('')
              //update the gigs of the band
                db.db('gigs').collection('gigs').updateOne({'_id':ObjectId(gigID)}, newValues2, {upsert:true}, res3=>{
                  console.log('set recivedRating to true for gig: ' + gigID);
                  res.status(200).end();
                  db.close();
                }, error3=>{
                  console.log('There was an error setting rating recived to true for gig : ' + gigID + 'error3: ' + error3);
                  db.close();
                });
              }, error=>{
                console.log("There was an error: " + error);
                res.send("Internal server error").end();
                db.close();
              });
          }
          else{
            //update values of the band for times and ratings
            var timesShown = parseInt(numRatings) - noShows;
            var perectShown = timesShown/parseInt(numRatings);
            var totalScore = parseInt(numRatings)*rating;
            console.log('totalScore: '+ totalScore);
            console.log('new rating is ' + newRating);
            totalScore = totalScore + parseInt(newRating);
            console.log('totalScore: '+ totalScore);
            numRatings = parseInt(numRatings)+1;
            var rating2 = totalScore/numRatings;
            console.log('rating2: '+ rating2);
            var query = {'rating':rating2, 'numRatings':numRatings, 'noShows':noShows, 'showsUp':perectShown};
            var newvalues = {$set: query};
            //update the bands collection
              db.db('bands').collection("bands").updateOne({'_id':ObjectId(id)}, newvalues, res2=>{
                console.log("updated band " + id);
                var newValues2 = {$set:{'recievedRating':true}};

                //update the gigs collection
                db.db('gigs').collection('gigs').updateOne({'_id':ObjectId(gigID)}, newValues2, {upsert:true}, res3=>{
                  console.log('set recivedRating to true for gig: ' + gigID);
                  res.status(200).end();
                  db.close();
                }, error3=>{
                  console.log('There was an error setting rating recived to true for gig : ' + gigID);
                  db.close();
                });
              }, error2=>{
                console.log("There was an error: " + error2);
                res.status(500).end();
                db.close();
              });
          }
        }
      });
    }, err=>{
      console.log("Couldn't connect to mongo with error: "+err);
      res.status(500).end();
    });
  });

  //post request to update a user's data
  router.post('/updateAUser', (req, res)=>{
    if (!req.body){
      console.log('No body sent!');
      res.status(400).end();
    }
    if (!req.session.key){
      console.log('None logged in user tried to update a user');
      res.status(403).end();
    }
    else{
      var {id, query} = req.body;
      database.connect(db=>{
        //udpate based on if
        db.db('users').collection('users').updateOne({'_id':ObjectId(id)}, query, (err2,result)=>{
          if(err2){
            console.log('Error updating user with:' +id +' :' + err2)
          }
        //  console.log('Result is: ' + JSON.stringify(result));
          console.log('Updated user with id: ' + id );
          res.status(200).end()
          db.close();
        });
      }, err=>{
        console.log('There was an error connecting to mongo here is error: ' + err);
      });

    }
  });

}
