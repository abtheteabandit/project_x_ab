module.exports = router => {

const database = require('../database.js')

//post request to delete objects for the database
  router.post('/delete' ,(req, res)=>{
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

}
