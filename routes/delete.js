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
                if (band.upcomingGigs.length!=0){
                  console.log('Band with id: ' + id + 'has upcoming gigs so no delete');
                  res.status(200).send('Sorry, you cannot delete a band that has been booked for events. You can cancel on these events first and then click delete.')
                  db.close();
                }
                db.db('bands').collection('bands').deleteOne({'_id':database.objectId(id)}, (err, res2)=>{
                  if (err){
                    console.log('There was an error deleteing band with id: ' + id);
                    res.status(500).end();
                    db.close();
                  }
                  else{
                    var all_gigs=[];
                    db.db('gigs').collection('gigs').update({'bandFor':id}, {$set:{'isFilled':false, 'bandFor':null}}, (err10, res10)=>{
                      if (err10){
                        console.log('There was an error removing band with id: ' + id +' from gigs: Error: ' + err10);
                        res.status(500).end();
                        db.close()
                      }
                      else{
                        console.log('deleted band: ' + id);
                        res.status(200).send('We have deleted this band from Banda!');
                        db.close();
                      }
                    });

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
                if (theGig.isFilled){
                  console.log('Cannot delete a filled gig.');
                  res.status(200).send('Sorry, you cannot delete an event which has booked an artist. You can cancel on the artist first, then click delete again. Thank you.');
                  db.close();
                }
                db.db('gigs').collection('gigs').deleteOne({'_id':database.objectId(id)}, (err2, res3)=>{
                  if (err2){
                    console.log('There was an error deleteing gig with id: ' + id);
                    res.status(500).end();
                    db.close();
                  }
                  else{
                    var apps = []
                    for (var an_app in theGig.applications){
                      apps.push(theGig.applications[an_app]);
                    }
                    apps.forEach(function(applicant_id){
                      db.db('bands').collection('bands').findOne({'_id':database.objectId(applicant_id))}, (err11, res11)=>{
                        if (err11){
                          console.log('There was an error fidning band with id:' + applicant_id + ' Error was: ' + err11 );
                          res.status(500).end();
                          db.close();
                        }
                        else{
                          var stillAppliedTo = [];
                          for (var applied_gig in res11.appliedGigs){
                            if (res11.appliedGigs[applied_gig][0]==id){
                                res11.appliedGigs[applied_gig][1]=true;
                                stillAppliedTo.push(res11.appliedGigs[applied_gig]);
                            }
                            else{
                              stillAppliedTo.push(res11.appliedGigs[applied_gig]);
                            }
                          }
                          db.db('bands').collection('bands').updateOne({'_id':database.objectId(applicant_id)}, {$set:{'appliedGigs':stillAppliedTo}}, (err12, res12)=>{
                            if (err12){
                              console.log('There was an error updating band with id: ' + applicant_id + ' Error: ' + err12);
                              res.status(500).end();
                              db.close();
                            }
                            else{
                              console.log('Updated band with id: ' + applicant_id + ' becuase their applied gig: ' + id + ' was deleted.');
                            }
                          });
                        }
                      });
                    });
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
            res.status(200).send('Delete yourself, nice try ;)');
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
