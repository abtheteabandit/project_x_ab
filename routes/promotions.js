module.exports = router =>{
  const database = require ('../database');
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
}
