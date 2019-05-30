module.exports = router =>{
  //stripe auth
  stripe_private_key = process.env.STRIPE_SECRET_KEY || 'sk_test_t6hlsKu6iehEdJhV9KzITmxm00flbTdrG5';
  var stripe = require('stripe')(stripe_private_key);
  const database = require('../database.js');

  //post request for a new stripe user
  router.post('/createStripeCustomer', (req, res)=>{
    var country = 'US';
    if (!req.session.key){
      console.log('No logged in user tried to create an account');
      res.status(404).end();
    }
    if (!req.body){
      console.log('no req body sent');
      res.status(401).end();
    }
    else{
      //store values from the request
      console.log('REQ body:' + JSON.stringify(req.body));
      var {card_token, email} = req.body;
      console.log('card token: ' + card_token);
      var username = req.session.key;
      var description = 'Event owner with username:  ' + username;
      console.log('CUSTOMER EMAIL: '+ email);

      //create a new stripe customer
      stripe.customers.create({
        description: description,
        email:email,
        source: card_token
      }, (err2, customer)=>{
        if (err2){
          console.log('There was an error creating the customer for username: ' + username);
          console.log('STRIPE ERROR WAS: ' + err2);
          res.status(200).send(err2);
        }
        else{
          console.log(' Craeeted customer: ' + JSON.stringify(customer));
          var cus_id = customer['id'];
          console.log('Default source is: ' + customer.default_source);
          database.connect(db=>{
            //update the stripe and user collections with the new customer
            db.db('users').collection('stripe_customers').insertOne({'username':username, 'stripe_id':cus_id, 'charges':[], 'src_id':card_token}, (res4)=>{
              console.log('Added user ' + username+ 'to stripe_customers woth cus_id: ' + cus_id);
              db.db('users').collection('users').updateOne({'username':req.session.key}, {$set:{'isCustomer':true}}, (err4, res4)=>{
                if (err4){
                  console.log('There was an error trying to set isCustomer to true: ' +err4);
                  res.status(500).end();
                  db.close();
                }
                else{
                  res.status(200).send('Congratulations, '+username+'you are now ready to find talent for your gig, Just click "bands" on our search page.');
                  db.close();
                }
              });

            })
          }, err3=>{
            console.log('There was an error conencting to mongo: ' + err3);
            res.status(500).end();
          });

        }
      });
      // create customer

    }
  });

  router.get('/customer_status', (req, res)=>{
    if (!req.session.key){
      console.log('No logged in user tried to create an account');
      res.status(404).end();
    }
    if (!req.query){
      console.log('no req query sent');
      res.status(401).end();
    }
    else{
      database.connect(db=>{
        db.db('users').collection('stripe_customers').findOne({'username':req.session.key}, (err2, res2)=>{
          if (err2){
            console.log('There was an error finding customer for: ' + req.session.key+' Error:'+err2);
            res.status(200).send(false);
            db.close();
          }
          else{
            if (res2==null || res2.length==0){
              console.log('There was no stripe customer for: ' + req.session.key);
              res.status(200).send(false);
              db.close();
            }
            else{
              console.log('There was stripe customer for: ' + req.session.key);
              res.status(200).send(true);
              db.close();
            }
          }
        })
      }, errDB=>{
        console.log('There was an error conencting to mongo: ' + err3);
        res.status(500).end();
      });
    }
  });
}

/*
var stripe = require("stripe")("sk_test_t6hlsKu6iehEdJhV9KzITmxm00flbTdrG5");

stripe.customers.create({
  description: 'Customer for jenny.rosen@example.com',
  source: "tok_amex" // obtained with Stripe.js
}, function(err, customer) {
  // asynchronously called
});
*/
