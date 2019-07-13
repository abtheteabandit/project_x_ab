module.exports = router=>{
  const database = require('../database.js');
  const matching = require('../algs/matching.js');
  router.get('/map_events', (req,res)=>{
    if (!req.query){
      res.status(401).json({'success':false, 'data':'Hmm...it seems soemthign went wrong on our end. Please refresh and try again or contact our support team at banda.customers.help@gmail.com'});
    }
    else{
      var {time, lat, lng} = req.query;
      console.log('GOT QUERY: ' + lat);
      database.connect(db=>{
        db.db('gigs').collection('gigs').find({'isFilled':{$eq:true}}).toArray((err, gigs)=>{
          if (err){
            console.log('THere was an error getting gigs: ' + err);
            res.status(200).json({'success':false, 'data':'Hmmm...sorry went worng on our end'});
            db.close();
          }
          else{
            if (gigs){
              console.log('GIGS: ' + JSON.stringify(gigs))

                    console.log('There are no live streams currently.');

                    matching.findLiveEvents(time, lat, lng, gigs, (errMatch, cbOk)=>{
                      if (errMatch){
                        console.log('There was an error trying to get mathced gigs: ' + errMatch);
                        res.status(200).json({'success':false, 'data':'Hmmm...sorry went worng on our end'});
                        db.close();
                      }
                      else{
                        res.status(200).json({'success':true, 'data':cbOk});
                        db.close();
                      }
                    });



            }
            else{
              res.status(200).json({'success':true, 'data':[]})
              db.close();
            }
          }
        });
      }, dbErr=>{

      })
    }
  });

}
