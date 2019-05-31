module.exports = router => {

const database = require('../database.js')

//post request to delete objects for the database
  router.post('/admin_delete' ,(req, res)=>{
    var {mode} = req.body;
    database.connect(db=>{
      //delete a gig
      if (mode=='gigs'){
        db.db('gigs').collection('gigs').drop();
        res.status(200).send("Deleted gigs");
        db.close();
      }
      //delete a band
      if (mode=='bands'){
        db.db('bands').collection('bands').drop();
        res.status(200).send("Deleted bands");
        db.close();
      }
      //delete an account
      if (mode=='accounts'){
        db.db('users').collection('stripe_users').drop();
        res.status(200).send("Deleted user_stripe_accounts");
        db.close();
      }
      //delete a customer
      if (mode=='customers'){
        db.db('users').collection('stripe_customers').drop();
        res.status(200).send("Deleted stripe_customers");
        db.close();
      }
      //invalid request
      else{
        res.status(401).end();
        db.close();
      }

    }, err=>{
      //error case
      console.log("THERE WAS AN ERROR DELete EVERYTHING : " + err);
      res.status(500).end();
    });
  });

  //for deleteing user created objects
  router.post('/delete', (req, res)=>{
    if (!req.session.key){
      console.log('No signed in user tried to call delete');
      res.status(404).end();
    }
    if (!req.body){
      console.log('No req body sent it delete');
      res.status(401).end();
    }
    else{
      var {mode, id} = req.body;
      database.connect(db=>{
        switch(mode){
          case 'bands':
          db.db('bands').collection('bands').findOne({'_id':database.objectId(id)}, (errFind, band)=>{
            if (errFind){
              console.log('There was an error deleting band: ' + id + ' Error: ' + errFind);
              res.status(500).end();
              db.close();
            }
            else{
              if (band.creator != req.session.key){
                console.log('*****************SOMEONE IS TRYING TO HACK BANDA!******************** USERNAME: ' + req.session.key);
                res.status(200).send('You can only delete bands you have created, nice try ;).');
                db.close();
              }
              else{
                db.db('bands').collection('bands').deleteOne({'_id':database.objectId(id)}, (err, res2)=>{
                  if (err){
                    console.log('There was an error deleteing band with id: ' + id);
                    res.status(500).end();
                    db.close();
                  }
                  else{
                    console.log('deleted band: ' + id);
                    res.status(200).send('We have deleted this band from Banda!');
                    db.close();
                  }
                });
              }
            }
          });

          break;
          case 'gigs':
          db.db('gigs').collection('gigs').findOne({'_id':database.objectId(id)}, (err4, theGig)=>{
            if (err4){
              console.log('There was an error deleting gig: ' + id + ' Error: ' + err4);
              res.status(500).end();
              db.close();
            }
            else{
              if (theGig.creator != req.session.key){
                console.log('*****************SOMEONE IS TRYING TO HACK BANDA!******************** USERNAME: ' + req.session.key);
                res.status(200).send('You can only delete events you have created, nice try ;).');
                db.close();
              }
              else{
                db.db('gigs').collection('gigs').deleteOne({'_id':database.objectId(id)}, (err2, res3)=>{
                  if (err2){
                    console.log('There was an error deleteing gig with id: ' + id);
                    res.status(500).end();
                    db.close();
                  }
                  else{
                    console.log('deleted gig: ' + id);
                    res.status(200).send('We have deleted this event from Banda!');
                    db.close();
                  }
                });
              }
            }
          });
          break;
          case 'users':
          if (id != req.session.key){
            console.log('*****************SOMEONE IS TRYING TO HACK BANDA!******************** USERNAME: ' + req.session.key);
            res.status(200).send('You can only delete your own user, nice try ;).');
            db.close();
          }
          else{
            db.db('users').collection('users').deleteOne({'username':id}, (err3, res4)=>{
              if (err3){
                console.log('There was an error deleteing user with username: ' + id);
                res.status(500).end();
                db.close();
              }
              else{
                console.log('deleted user: ' + id);
                res.status(200).send('We have deleted your account, '+id+' from Banda!');
                db.close();
              }
            });
          }
          break;
          default:
          res.status(401).end();
          db.close();
          break;
        }
      }, dbErr=>{
        console.log('THere was an error connecting ot mongo: ' + dbErr);
        res.status(500).end();
      })
    }
  })

}
