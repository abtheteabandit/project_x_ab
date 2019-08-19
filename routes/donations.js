module.exports = router=>{
  router.post('/createDonator', (req, res)=>{
    console.log('\n*****DONATION******\n')
    var stripe_private_key = process.env.STRIPE_SECRET_KEY || 'sk_test_t6hlsKu6iehEdJhV9KzITmxm00flbTdrG5';
    var stripe = require('stripe')(stripe_private_key);
    if (!req.body){
      console.log('no body sent!')
      res.status(200).send('Sorry, it seems there was an issue on our end.').end();
    }
    else{
      var {card_token, email} = req.body;
      console.log('card token: ' + card_token);
      //store values from the request
      console.log('REQ body:' + JSON.stringify(req.body));
      var {card_token, email} = req.body;
      console.log('card token: ' + card_token);
      var description = 'Donator with email:  ' + email;
      console.log('CUSTOMER EMAIL: '+ email);

      //create a new stripe customer
      stripe.customers.create({
        description: description,
        email:email,
        source:card_token
      }, (err2, customer)=>{
        if (err2){
          console.log('There was an error creating the customer for email: ' + email);
          console.log('STRIPE ERROR WAS: ' + err2);
          res.status(200).send(err2);
        }
        else{
          console.log(' Craeeted customer: ' + JSON.stringify(customer));
          var cus_id = customer['id'];
          console.log('Default source is: ' + customer.default_source);
          database.connect(db=>{
            //update the stripe and user collections with the new customer
            db.db('donators').collection('donators').update({'email':email},{$set:{'stripe_id':cus_id, 'charges':[], 'src_id':card_token}}, {upsert:true}, (err20, res4)=>{
              if (err20){
                console.log('There was an error inserting/ updating the customer account for user: ' +email+ ' Error: ' + err20);
                res.status(500).end();
                db.close();
              }
              else{
                res.status(200).send('Thank you so very much for your donation. Feel free to go to our front page and listen to some of our arists, or email us with any questions or concerns and we will personally email you within 24 hours.\nA Change Is Gunna Come.');
                db.close();
              }
            });
          }, dbErr=>{
            console.log('There was an error conencting to mongo: ' + dbErr);
            res.status(500).end();
          });

        }
      });
      // create customer

    }
  });

  router.post('/makeDonation', (req,res)=>{
    if (!req.body){
      console.log('no body sent')
      res.status(200).send('Sorry, it seems something went wrong on our frontend.').end();
    }
    else{
      var {amount, email} = req.body;
      if (!amount){
        console.log('amount not present')
        res.status(200).send('Sorry, you must choose an amount.').end();
      }
      else{
        database.connect(db=>{
          db.db('donators').collection('donators').findOne({'email':email}, (donator_error, stripe_cus)=>{
            if (donator_error){
              console.log("There was an error finding donator");
              res.status(500).end();
              db.close();
            }
            else{
              if (!stripe_cus){
                console.log('The user must be a donar.');
                res.status(200).send('Sorry, something went wrong on our end. You have not been charged, please refresh and try again.')
                db.close();
              }
              else{
                chargeUser(email, amount, cb=>{
                    sendDonoEmail(email, cb2=>{
                      console.log('Donation went through');
                      res.status(200).send(cb);
                      db.close();
                    });
                })
              }
            }
          })
        }, dbErr=>{
          console.log('There was an error conencting to mongo: ' + dbErr);
          res.status(500).end();
        })
      }
    }
  })

  // function to chagre a user the amount they wanted to.
  function chargeUser(email, amount, cb){
    console.log('PRICE IN CHARGE: ' + amount);

    //setup variables for user info
    var chargeAmount = Math.trunc(100*amount); // this puts it into cents.

    console.log('BANDA CASH: ' + chargeAmount);

    //get the user that is to be charged
    database.connect(db=>{
      db.db('donators').collection('donators').findOne({'email':email}, (err9, stripe_user)=>{
        if(err9){
          console.log('There was an error finding username: ' + email + ' in the stripe_customers' + err9);
          cb(err9);
          return;
        }
        console.log('stripe_user is: ' + JSON.stringify(stripe_user));
        if (!stripe_user){
          cb('Error: no donator user');
        }
        else{
          //create a stripe transaction
          stripe.charges.create({
            //stripe variables
            amount: chargeAmount,
            currency: 'usd',
            customer: stripe_user.stripe_id,
            description: "Thank you for donating to Banda, Inc. Together We Will Band Together.",
          }, function(stripe_error, charge) {

            //catch errors in the api
              if(stripe_error){
                console.log('There was an error createing chage with stripe: ' + stripe_error.message);
                cb(stripe_error);
              }
              else{
                console.log('THe charge is: ' + JSON.stringify(charge));

                //intialize the db variables for the charge
                var chageForDB={'charge_id':charge.id, 'amount':charge.amount, 'transfer':false};

                //store the charge in the database
                db.db('donators').collection('donators').updateOne({'email':email}, {$push:{'charges':chageForDB}}, (err11, result11)=>{
                  if (err11){
                    console.log('There was an error adding the charge to user: '+email+' charges array.' + err11);
                    cb();
                    db.close();
                  }
                  else{
                    //complete and log the history of the charge
                    console.log('Added charge to db and charge was successful. We charged user: ' +email+' '+chargeAmount);
                    cb();
                    db.close();
                  }
                })
              }
            });
          }
      });
    }, err=>{
      cb(err)
    });
  }

  function sendDonoEmail(email, cb){
    var now = new Date().toString();
    var cleanNow = now.replace(" ", "_");
    let transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com', // go daddy email host port
        port: 465, // could be 993
        secure: true,
        auth: {
            user: 'banda.confirmation@gmail.com',
            pass: 'N5gdakxq9!'
        }
    });
    mailOptions = {
       attachments : [{'path':'/static/assets/Donations/thankyou.png'}],
       from: "banda.confirmation@gmail.com", // our address
       to: email, // who we sending to
       subject: "Thank you for donating to Banda!", // Subject line
       text: "", // plain text body
       html: "<strong>Thank you</strong> so much for helping us to change the music industry. Below is your certificate of donation. "// html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
       if (error) {
          console.log('There was an error sending the email: ' + error);
          cb('error')
       }
       else{
         cb()
       }
    });
  }
}
