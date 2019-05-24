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
                  if (poster.contacts[contact]==promoterName){
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
}
