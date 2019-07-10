module.exports = router=>{
  const database = require('../database.js');
  router.get('/map_events', (req,res)=>{
    if (!req.query){
      res.status(401).json({'success':false, 'data':'Hmm...it seems soemthign went wrong on our end. Please refresh and try again or contact our support team at banda.customers.help@gmail.com'});
    }
    else{
      database.connect(db=>{

      }, dbErr=>{
        
      })
    }
  });

}
