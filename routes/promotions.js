module.exports = router =>{
  const database = require ('../database'),
        matching = require('../algs/matching.js');
  router.post('/cross_promote', (req, res)=>{
    if (!req.session.key){
      console.log('No logged in user tried to cross promote');
      req.status(404).end();
    }
    if (!req.body){
      console.log('Cross promote had no body');
      req.status(401).end();
    }
    else{
      var {promoterName, posterName} =req.body;
      database.connect(db=>{
        db.db('users').collection('users').findOne({'username':promoterName}, (err, promoter)=>{
          if (err){
            console.log('THere was an error finding the promoter user: ' + promoterName);
            res.status(500).end();
            db.close();
          }
          else{
            console.log('Promoter User: ' + promoterName + ' is ' + JSON.stringify(promoter));
            db.db('users').collection('users').findOne({'username':posterName}, (err2, poster)=>{
              if (err2){
                console.log('THere was an error finding the poster user: ' + posterName);
                res.status(500).end();
                db.close();
              }
              else{
                var posterKnowsPromoter = false;
                for (var contact in poster.contacts){
                  if (poster.contacts[contact]['name']==promoterName){
                    posterKnowsPromoter=true;
                  }
                }
                if(posterKnowsPromoter){
                  //get promotion from poster

                  //ed code, post this promotion to posters selected socials
                }
                else{
                  console.log('Poster: '+posterName+' did not have: '+promoterName+' in their contacts list.');
                  res.status(200).send('Sorry, it appears this user does not have you in their contacts, so we will not post to their account. Try fidning them on your promotions page and adding them to your contacts.');
                  db.close();
                }
              }
            });
          }
        });
      }, dbErr=>{
        console.log('There was an error connecting to mongo: ' + dbErr);
        res.status(500).end();
      });
    }
  });

  router.post('/add_mutual_contact', (req, res)=>{
    if (!req.session.key){
      console.log('No logged in user tried to cross promote');
      req.status(404).end();
    }
    if (!req.body){
      console.log('Cross promote had no body');
      req.status(401).end();
    }
    else{
      var {acceptorName, senderName} = req.body;
      database.connect(db=>{
        db.db('users').collection('users').findOne({'username':acceptorName}, (err, acceptor)=>{
          if (err){
            console.log("There was an error getting user: " + acceptorName + ' error: ' + err);
            res.status(500).end();
            db.close();
          }
          else{
            db.db('users').collection('users').findOne({'username':senderName}, (err2, acceptor)=>{
              if (err2){
                console.log("There was an error getting user: " + senderName + ' error: ' + err2);
                res.status(500).end();
                db.close();
              }
              else{
                var senderHasAcceptor = false;
                var acceptorHasSender = false;
                for (var con1 in acceptor.contacts){
                  if (acceptor.contacts[con1]['name']==senderName){
                    acceptorHasSender = true;
                  }
                }
                for (var con2 in sender.contacts){
                  if (acceptor.contacts[con2]['name']==acceptorName){
                    senderHasAcceptor = true;
                  }
                }
                if (senderHasAcceptor && acceptorHasSender){
                  console.log('One of the two parties in add mutual contacts knows eachother.');
                  res.status(200).send('Sorry, it seems that you and ' +senderName+ ' already have eachother in your contacts');
                  db.close();
                }
                else if (senderHasAcceptor && (!acceptorHasSender)){
                  db.db('users').collection('users').updateOne({'username':acceptorName}, {$push:{'contacts':{'name':senderName, 'id':sender['_id']}}}, (err4, res4)=>{
                    if (err4){
                      console.log('There was an error adding '+senderName+' to ' +acceptorName+' error: ' + err4);
                      res.status(500).end();
                      db.close();
                    }
                    else{
                      console.log('Added: '+senderName+' to the contact list of ' +acceptorName);
                      res.status(200).send('We have exchanged your contact information. Check your contacts in the botton right corner to message or cross-promote with ' + senderName);
                      db.close();
                    }
                  });
                }
                else if (acceptorHasSender && (!senderHasAcceptor)){
                  db.db('users').collection('users').updateOne({'username':senderName}, {$push:{'contacts':{'name':acceptorName, 'id':acceptor['_id']}}}, (err5, res5)=>{
                    if (err5){
                      console.log('There was an error adding '+acceptorName+' to ' +senderName+' contacts. Error: ' + err5);
                      res.status(500).end();
                      db.close();
                    }
                    else{
                      console.log('Added: '+acceptorName+' to the contact list of ' +senderName);
                      res.status(200).send('We have exchanged your contact information. '+senderName+' may reach out to you soon via our built in messaging feature. As always you message them. Just click "contacts" in the bottom right corner to begin cross-promotion with '+ senderName);
                      db.close();
                    }
                  });
                }
                else{
                  db.db('users').collection('users').updateOne({'username':senderName}, {$push:{'contacts':{'name':acceptorName, 'id':acceptor['_id']}}}, (err5, res5)=>{
                    if (err5){
                      console.log('There was an error adding '+acceptorName+' to ' +senderName+' contacts. Error: ' + err5);
                      res.status(500).end();
                      db.close();
                    }
                    else{
                      console.log('Added: '+acceptorName+' to the contact list of ' +senderName);
                      db.db('users').collection('users').updateOne({'username':acceptorName}, {$push:{'contacts':{'name':senderName, 'id':sender['_id']}}}, (err4, res4)=>{
                        if (err4){
                          console.log('There was an error adding '+senderName+' to ' +acceptorName+' error: ' + err4);
                          res.status(500).end();
                          db.close();
                        }
                        else{
                          console.log('Added: '+senderName+' to the contact list of ' +acceptorName);
                          res.status(200).send('We have exchanged your contact information. Check your contacts in the botton right corner to message or cross-promote with ' + senderName);
                          db.close();
                        }
                      });
                    }
                  });
                }
              }
            });
          }
        });
      }, dbErr=>{
        console.log('There was an error connecting to mongo: ' + dbErr);
        res.status(500).end();
      });
    }
  });

router.post('/promotion', (req, res)=>{
  if (!req.session.key){
    console.log('No logged in user tried to cross promote');
    req.status(404).end();
  }
  if (!req.body){
    console.log('promotion had no body');
    req.status(401).end();
  }
  else{
    var {name, imgURL, caption, handles, location, mode, medias, preferences} = req.body;
    database.connect(db=>{
      db.db('users').collection('users').updateOne({'username':req.session.key}, {$set:{'promotion':{'name':name, 'imgURL':imgURL, 'caption':caption, 'location':location, 'handles':handles, 'mode':mode, 'medias':medias, 'preferences':preferences}}}, (err2, res2)=>{
        if (err2){
          console.log('There was an error setting promotion: '+name+' for user: ' +req.session.key+' Error: ' + err2);
          res.status(500).end();
          db.close();
        }
        else{
          console.log('Set promotion ' +name+ ' for user: '+req.session.key);
          res.status(200).send('Congratulations, you have added this promotion to Banda! You can change what promotion you would like to use at anytime simply by changing the information here and clicking "Add". To begin running this promo simply go to you contacts and hit the promotion button. If they accept ')
        }
      });
    }, dbErr=>{
      console.log('There was an error connecting to mongo: ' + dbErr);
      res.status(500).end();
    });
  }
});

router.get('/search_promos', (req, res)=>{
  if (!req.session.key){
    console.log('No logged in user tried to cross promote');
    req.status(404).end();
  }
  if (!req.query){
    console.log('Cross promote had no body');
    req.status(401).end();
  }
  else{
    var {lat, lng, searchText} = req.query;
    database.connect(db=>{
      matching.findCrossPromoters(req.session.key, lat, lng, searchText, db, errCB=>{
        console.log('There was an error : ' + errCB);
        if (errCB=="Internal Server Error"){
          res.status(200).json({success:false, data:'Sorry, there was an error on our end. Please try searching again. If this error persits please notify us via our support tab on the Banda "b"'});
          db.close();
        }
        else{
          res.status(500).json({success:false, data:errCB});
          db.close();
        }
      }, okCB=>{
        console.log('Got in ok CB');
        res.status(200).json({success: true, data:okCB});
        db.close();
      });
    }, dbErr=>{
      console.log('There was an error connectiong to mongo: ' + dbErr);
      res.status(500).end();
    });
  }
});

router.post('/user_socials', (req, res)=>{
  if (!req.session.key){
    console.log('No logged in user tried to cross promote');
    req.status(404).end();
  }
  if (!req.body){
    console.log('promotion had no body');
    req.status(401).end();
  }
  else{
    var {id, mode, medias, imageURL, caption, handles, location} = req.body;
    database.connect(db=>{
      for (var key in medias){
        //post our thign to that media
      }
    }, errDB=>{
      console.log('There was an error connectiong to mongo: ' + errDB);
      res.status(500).end();
    });
  }
});

router.post('/add_pull', (req, res)=>{
  //this is the route that gets called from outside our site, such that our bands can quantify their clout.
  if (!req.body){
    console.log('request had no body');
    req.status(401).end();
  }
  else{
    var {id, mode} = req.body;
    database.connect(db=>{
      switch(mode){
        case "bands":
        db.db('bands').collection('bands').updateOne({'_id':database.objectId(id)}, {$inc:{'pull':1}}, (err1, res1)=>{
          if (err1){
            console.log('There was an an error incrementing pull for band:: ' + err1);
            res.status(500).end();
            db.close();
          }
          else{
            console.log('Incremented pull of band: ' + id);
            res.redirect('/about');
            db.close();
          }
        });
        break;
        case 'gigs':
        db.db('gigs').collection('gigs').updateOne({'_id':database.objectId(id)}, {$inc:{'pull':1}}, (err1, res1)=>{
          if (err1){
            console.log('There was an error incrementing pull for gig: ' + err1);
            res.status(500).end();
            db.close();
          }
          else{
            console.log('Incremented pull of gig: ' + id);
            res.redirect('/about');
            db.close();
          }
        });
        break;
        case 'users':
        db.db('users').collection('users').updateOne({'username':id}, {$inc:{'pull':1}}, (err1, res1)=>{
          if (err1){
            console.log('There was an error incrementing pull for user: ' + err1);
            res.status(500).end();
            db.close();
          }
          else{
            console.log('Incremented pull of user: ' + id);
            res.redirect('/about');
            db.close();
          }
        });
        break;
        default:
        console.log('No recognized mode in add_pull: ' + mode);
        res.status(401).end();
        db.close();
        break
      }
    }, errDB=>{
      console.log('There was an error connectiong to mongo: ' + errDB);
      res.status(500).end();
    })
  }
});
} //end of exports
