module.exports = router=>{
  // requiremnts
  const database = require('../database.js');
  const matching = require('../algs/matching.js');
  const stripe_private_key = process.env.STRIPE_SECRET_KEY || 'sk_test_t6hlsKu6iehEdJhV9KzITmxm00flbTdrG5';
  const BANDA_TICKET_CUT = 0.8;
  const REFERER_CUT = 0.2;

  var passwordHash = require('password-hash')
  var passwordValidator = require('password-validator');
  var validator = require("email-validator");
  var stripe = require('stripe')(stripe_private_key);


  //route for getting current events in an area
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
        console.log('There was an error connecting to mongo: ' + dbErr);
        res.status(200).json({'success':false, 'data':'Hmmmm...somethign went wrong our end. Please refresh and try again. If this problem continues please email banda.customers.help@gmail.com to contact our live, 24/7 customer support team!'});
      })
    }
  });

  // route for ticket sales
  router.post('/buyTicket', (req,res)=>{
    if (!req.body){
      console.log('No body sent in buy tickets ');
      res.status(401).end();
    }
    else{
      var {gigID, username, email, passsord, card_token, referal} = req.body;
      var signedIn = false;
      if (!gigID){
        console.log('No body gigID in buy tickets ');
        res.status(401).end();
      }
      if (req.session.key){
        console.log('User is signed in.')
        signedIn=true;
      }
      else{
        database.connect(db=>{
          db.db('gigs').collection('gigs').findOne({'_id':database.objectId(gigID)}, (err, gig)=>{
            if (err){
              console.log('THere was an error tryign to find gig: ' + gigID+ ' error: ' + err);
              res.status(500).end();
              db.close();
            }
            else{
              if (gig.hasOwnProperty('tickets')){
                console.log('Gig has tickets');
                console.log('Ticket is: ' + JSON.stringify(gig.tickets));
                if (signedIn){
                  db.db('users').collection('users').findOne({'username':req.session.key}, (err1, user)=>{
                    if (err1){
                      console.log('THere was an error tryign to find user: ' + req.session.key+ ' error: ' + err1);
                      res.status(500).end();
                      db.close();
                    }
                    else{
                      if (referal){
                        buyWithReferal(username, email, card_token, gig, referal, db, (ref_ok, ref_error)=>{
                          if (card_error){
                            console.log('There was an error with card payment: ' + ref_error);
                            res.status(200).send(ref_error);
                            db.close();
                          }
                          else{
                            // email ticket
                          }
                        });
                      }
                      else{
                        //no refural
                        chargeForTicket(username, email, card_token, gig, db, (card_ok, card_error)=>{
                          if (card_error){
                            console.log('There was an error with card payment: ' + card_error);
                            res.status(200).send(card_error);
                            db.close();
                          }
                          else{
                            // email ticket
                          }
                        });
                      }
                    }
                  });
                }
                else{
                  // user is not logged in so we sign them in or register them
                  signInOrRegUser(username, password, email, cbOk=>{
                    //check is user has laready bought a ticket
                    if (gig.tickets.hasOwnProperty('users')){
                      if (gig.tickets.users.hasOwnProperty(username)){
                        res.status(200).send('Sorry, you already bought a ticket for this event. We will email you the ticket ifnormation again.');
                        //email ticket info
                        sendTicketInfo(email, username, gig, (emailError, emailOk)=>{

                        });
                      }
                      else{
                        // user has not yet bought a ticket
                        if (referal){
                          buyWithReferal(username, email, card_token, gig, referal, db, (ref_ok, ref_error)=>{
                            if (card_error){
                              console.log('There was an error with card payment: ' + ref_error);
                              res.status(200).send(ref_error);
                              db.close();
                            }
                            else{
                              // email ticket
                            }
                          });
                        }
                        else{
                          //no refural
                          chargeForTicket(username, email, card_token, gig, db, (card_ok, card_error)=>{
                            if (card_error){
                              console.log('There was an error with card payment: ' + card_error);
                              res.status(200).send(card_error);
                              db.close();
                            }
                            else{
                              // email ticket
                            }
                          });
                        }
                      }
                    }
                    else{
                      // no one has bought tickets
                      if (referal){
                        buyWithReferal(username, email, card_token, gig, referal, db, (ref_ok, ref_error)=>{
                          if (card_error){
                            console.log('There was an error with card payment: ' + ref_error);
                            res.status(200).send(ref_error);
                            db.close();
                          }
                          else{
                            // email ticket
                          }
                        });
                      }
                      else{
                        //no refural
                        chargeForTicket(username, email, card_token, gig, db, (card_ok, card_error)=>{
                          if (card_error){
                            console.log('There was an error with card payment: ' + card_error);
                            res.status(200).send(card_error);
                            db.close();
                          }
                          else{
                            gig.tickets['users']={}
                            gig.tickets['users'][username]=true;
                            db.db('gigs').collection('gigs').updateOne({'_id':database.objectId(gigID)}, {$set:{'tickets':gig.tickets}}, (updateErr, updateRes)=>{
                              if (updateErr){
                                console.log('There was an error setting gig tickets with new user who just bought a ticket: ' + username + updateErr);
                              }
                              //send ticket email
                            })
                          }
                        });
                      }
                    }
                  }, cbErr=>{
                    console.log('Error from sign in or reg: ' + cbErr);
                    switch(cbErr){
                      case 'internal':
                      res.status(200).send('Hmmm...something went wrong on our end. Please resfesh and try again. If this problem persists please email banda.customers.help@gmail.com to speak with our live 24/7 customer support team!')
                      db.close();
                      break;
                      case 'username':
                      res.status(200).send('The username you provided already exists and your password did not match. Please try a different username or password.');
                      db.close();
                      break;
                      case 'password':
                      res.status(200).send('Your password must contain atleast 8 characters, a number, a lower case character, an upper case character, and no spaces').end();
                      db.close();
                      break;
                      default:
                      res.status(200).send('Hmmm...something went wrong on our end. Please resfesh and try again. If this problem persists please email banda.customers.help@gmail.com to speak with our live 24/7 customer support team!')
                      db.close();
                      break;
                    }
                  });
                }
              }
              else{
                console.warn('BANDA MIGHT BE GETTING HACKED!!! Gig did not have tickets set up but got a post request to buy them');
                res.status(200).send('Nice try. You can not hack us.');
                db.close();
              }
            }
          })
        }, dbErr=>{
          console.log('There was an error connecting to mongo: ' + dbErr);
          res.status(500).end();
        });
      }
    }
  });

  // creates stripe customer and charge for ticket
  function chargeForTicket(username, email, card_token, gig, db, cb){
    if(!username || !card_token || !gig || !db){
      console.log('Missing a field in buy with referal');
      cb(null, 'Hmm... it seems something went wrong on our end procesing your payment. Please refesh the page and try again. If this problem persists please cotnact banda.help.customers@gmail.com for speak with our live, 24/7 customer support team.');
    }
    else{
      //store values from the request
      console.log('card token: ' + card_token);
      var description = 'Ticket buyer with username:  ' + username;
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
          cb(null, err2);
        }
        else{
          console.log(' Created customer: ' + JSON.stringify(customer));
          var cus_id = customer['id'];
          console.log('Default source is: ' + customer.default_source);
            //update the stripe and user collections with the new customer
            db.db('users').collection('stripe_customers').update({'username':username},{$set:{'username':username, 'stripe_id':cus_id, 'charges':[], 'src_id':card_token}}, {upsert:true}, (err20, res4)=>{
              if (err20){
                console.log('There was an error inserting/ updating the customer account for user: ' + req.session.key + ' Error: ' + err20);
                cb(null, 'Hmmm...something wnet wrong on our end.');
              }
              console.log('Added user ' + username+ 'to stripe_customers woth cus_id: ' + cus_id);
              db.db('users').collection('users').updateOne({'username':req.session.key}, {$set:{'isCustomer':true}}, (err4, res4)=>{
                if (err4){
                  console.log('There was an error trying to set isCustomer to true: ' +err4);
                  cb(null, 'Hmmm...something wnet wrong on our end.');
                }
                else{
                  chargeUser(username, gig, db, (charge_ok, charge_err)=>{
                    if (charge_err){
                      console.log('There was an erro charging user: ' + username + ' error: ' + charge_err);
                      cb(null, charge_err);
                    }
                    else{
                      cb('Worked', null);
                    }
                  });
                }
              });
            });
        }
      });

    }
  }
  function buyWithReferal(username, card_token, gig, referal, cb){
    if(!username || !card_token || !gig || !referal){
      console.log('Missing a field in buy with referal');
      cb(null, 'Hmm... it seems something went wrong on our end procesing your payment with this referal code. Please refesh the page and try again. If this problem persists please cotnact banda.help.customers@gmail.com for speak with our live, 24/7 customer support team.');
    }
    if (!referal.hasOwnProperty('username') || !referal.hasOwnProperty('code')){
      console.log('Missing a field in buy with referal');
      cb(null, 'Hmm... it seems something went wrong on our end procesing your payment this referal code. Please refesh the page and try again. If this problem persists please cotnact banda.help.customers@gmail.com for speak with our live, 24/7 customer support team.');
    }
    else{
      //checks to see if referal codes and usernames are legit
      if (gig.tickets.hasOwnProperty('referers')){
        if(gig.tickets.referers.hasOwnProperty(referal.username)){
          if (referal.code==gig.tickets.referers[referal.username].code){
            //valid
            //store values from the request
            console.log('card token: ' + card_token);
            var description = 'Ticket buyer with username:  ' + username;
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
                cb(null, err2);
              }
              else{
                console.log(' Created customer: ' + JSON.stringify(customer));
                var cus_id = customer['id'];
                console.log('Default source is: ' + customer.default_source);
                  //update the stripe and user collections with the new customer
                  db.db('users').collection('stripe_customers').update({'username':username},{$set:{'username':username, 'stripe_id':cus_id, 'charges':[], 'src_id':card_token}}, {upsert:true}, (err20, res4)=>{
                    if (err20){
                      console.log('There was an error inserting/ updating the customer account for user: ' + req.session.key + ' Error: ' + err20);
                      cb(null, 'Hmmm...something wnet wrong on our end.');
                    }
                    console.log('Added user ' + username+ 'to stripe_customers woth cus_id: ' + cus_id);
                    db.db('users').collection('users').updateOne({'username':req.session.key}, {$set:{'isCustomer':true}}, (err4, res4)=>{
                      if (err4){
                        console.log('There was an error trying to set isCustomer to true: ' +err4);
                        cb(null, 'Hmmm...something wnet wrong on our end.');
                      }
                      else{
                        db.db('users').collection('stripe_customers').findOne({'username':username}, (cus_err_3, stripe_customer)=>{
                          if (cus_err_3){
                            console.log(' There was ane rro fidning the stripe customer we jsut created: ' + username + cus_err_3);
                            cb(null, 'Hmmm...something wnet wrong on our end.')
                          }
                          else{
                            if (stripe_customer){
                              db.db('users').collection('stripe_users').findOne({'username':gig.creator}, (stripe_user_err, gig_account)=>{
                                if (strie_user_err){
                                  console.log('THere was an error fidning the connected account for gig creator: ' + gig.creator +stripe_user_err);
                                  cb(null, 'Hmmm...something wnet wrong on our end.');
                                }
                                else{
                                  if (gig_account){
                                    db.db('users').collection('stripe_users').findOne({'username':referal.username}, (stripe_user_err2, referer_account)=>{
                                      if (stripe_user_err2){
                                        console.log('THere was an error finding stripe connected account for referal user: ' + referal.username + ' Error: ' + stripe_user_err2);
                                        cb(null, 'Hmmm...something wnet wrong on our end.');
                                      }
                                      else{
                                        if (referer_account){

                                          // we have gotten all three accounts needed for transfers
                                          console.log('GOt all three acounts proceeding with money transfers.');

                                          var referer_account_id = referer_account.stripe_connected_account_id;
                                          var gig_account_id = gig_account.stripe_connected_account_id;

                                          var banda_amount = MATH.trunc(gig.tickets.price*100*(BANDA_TICKET_CUT-REFERER_CUT));
                                          var referer_amount = MATH.trunc(gig.tickets.price*100*REFERER_CUT);
                                          var gig_amount = MATH.trunc(gig.tickets.price-referer_amount-banda_amount);
                                          var stripe_amount = MATH.trunc(gig.tickets.price*100*0.029+30);

                                          var card_src = stripe_customer.src_id;
                                          var descript = 'Payment for ticket for event: ' +gig.name+' on ' +gig.date;
                                          var tranferGroup = generate_transfer_group();
                                          //create the charge
                                          stripe.charges.create({
                                            amount: (gig.tickets.price+stripe_amount),
                                            currency: "usd",
                                            customer: stripe_customer.stripe_id,
                                            description: descript,
                                            tranferGroup: tranferGroup,
                                          }).then(function(charge) {
                                            //log the new charge in the database
                                            var chageForDB={'charge_id':charge.id, 'amount':charge.amount, 'gigID':gigID, 'transfer':true, 'transfer_group':transfer_group};
                                            db.db('users').collection('stripe_customers').updateOne({'username':req.session.key}, {$push:{'charges':chageForDB}}, (err8, res8)=>{
                                              if (err8){
                                                console.log('There was an error updating stripe customer: ' + username + ' With charge for ticket.' + err8);
                                              }                                              
                                              stripe.transfers.create({
                                                amount: gig_amount,
                                                currency: "usd",
                                                destination: gig_account_id,
                                                transfer_group: transfer_group,
                                              }).then(function(transfer) {
                                                console.log('Transfer: ' + JSON.stringify(transfer));
                                                console.log('Transfered: ' + gig_amount+ ' to gig user with id: ' + gigID);

                                                db.db('users').collection('stripe_users').updateOne({'username':gig.creator}, {$push:{'transfers':transfer}}, (update_stirpe_user_err, res30)=>{
                                                  if (update_stirpe_user_err){
                                                    console.log('There was an error updating transfer data for: ' + gig.creator + ' err: ' + update_stirpe_user_err)
                                                  }
                                                  stripe.transfers.create({
                                                    amount: referer_amount,
                                                    currency: "usd",
                                                    destination: referer_account_id,
                                                    transfer_group: transfer_group,
                                                  }).then(function(transfer2) {
                                                    db.db('users').collection('stripe_users').updateOne({'username':referal.username}, {$push:{'transfers':transfer2}}, (update_stirpe_user_err2, res31)=>{
                                                      if (update_stirpe_user_err2){
                                                        console.log('There was an error updating transfer data for: ' + referal.username + ' err: ' + update_stirpe_user_err2);
                                                      }
                                                      //transfered all money invloved
                                                      cb('worked', null);
                                                    });

                                                  }).catch(function(stripe_error_3){
                                                    console.log('REFERER: There was an error transfering: ' + referer_amount + 'to '+ referal.username+' error: ' + stripe_error_3);
                                                    cb(null, 'Hmmm...something went wrong on our end paying your referer. We will email you the ticket.');
                                                  });
                                                });
                                              }).catch(function(stripe_error_4){
                                                  console.log('GIG TRANSFER: There was an error transfering: ' + gig_amount + 'to '+ gig.creator+' error: ' + stripe_error_4);
                                                  cb(null, 'Hmmm...something went wrong on our end tranfering your money to the gig. We will email you the ticket.');
                                                });
                                            });
                                          }).catch(function(stripe_error2){
                                            console.log('Stripe error for transfer: ' + stripe_error2);
                                            cb(null, stripe_error2);
                                          });


                                        }
                                        else{
                                          console.log('THere was an error finding stripe connected account for referal user: ' + referal.username);
                                          cb(null, 'Hmmm...something wnet wrong on our end.');
                                        }
                                      }
                                    })
                                  }
                                  else{
                                    console.log('THere was an error fidning the connected account for gig creator: ' + gig.creator +stripe_user_err);
                                    cb(null, 'Hmmm...something wnet wrong on our end.');
                                  }
                                }
                              });

                            }
                            else{
                              console.log(' There was ane rro fidning the stripe customer we jsut created: ' + username);
                              cb(null, 'Hmmm...something wnet wrong on our end.')
                            }
                          }
                        });
                      }
                    });
                  });
              }
            });
          }
          else{
            //invalid referer code
            console.warn('SOMEONE MIGHT BE TRYING TO HACK BANDA. Gig: ' + gig._id + ' had invalid refural code sent: '+referal.username+'. user: '+referal.username+' is sketch, and user: ' + username + ' might be sketch, also user: '+gig.creator+' might be sketch.');
            cb(null, 'Hmmm...sorry it seems you sent us an invalid referal code. Please try again with a different referal code, or with no referal code.');
          }
        }
        else{
          //invalid referer username
          console.warn('SOMEONE MIGHT BE TRYING TO HACK BANDA. Gig: ' + gig._id + ' had invalid refural username sent: '+referal.username+'. user: '+referal.username+' is sketch, and user: ' + username + ' might be sketch, also user: '+gig.creator+' might be sketch.');
          cb(null, 'Hmmm...sorry it seems you sent us an invalid referal code. Please try again with a different referal code, or with no referal code.');
        }
      }
      else{
        // has no referals
        console.warn('SOMEONE MIGHT BE TRYING TO HACK BANDA. Gig: ' + gig._id + ' has no refurals but had a refural thing sent. user: ' + username + ' is sketch, also user: '+gig.creator+' might be sketch.');
        cb(null, 'Nice try. You can not hack us.')
      }
    }
  }

  function chargeUser(username, gig, db, cb){
    console.log('About to charge ' + username + ' for ticket to gig: ' + gig.name);

    //get the user that is to be charged
      db.db('users').collection('stripe_customers').findOne({'username':username}, (err9, stripe_customer)=>{
        if(err9){
          console.log('There was an error finding username: ' + username + ' in the stripe_customers' + err9);
          cb(null, 'Hmmm...it seems we had trouble charging your card. Please refresh and try again. If this problem persists please contact banda.help.customers@gmail.com to speak with our live, 24/7 support team.');
          return;
        }
        console.log('stripe_user is: ' + JSON.stringify(stripe_user));
        db.db('users').collection('stripe_users').findOne({'username':gig.creator}, (accountErr, stripe_account)=>{
          if (accountErr){
            console.log('THere was an error tryign to find stripe user: ' + username + ' '+ accountErr);
            cb(null, 'Hmmm...something went wrong on our end');
          }
          else{

            if (!stripe_account || !stripe_customer){
              cb(null, 'Could not find the events bank or the customers card in stripe');
              return;
            }
            //set values for the charge
            var account = stripe_account.stripe_connected_account_id;
            var total_amount = Math.trunc(gig.ticket.price*100);
            var stripe_amount = (total_amount*0.029)+30;
            var banda_amount = Math.trunc((gig.ticket.price*100)*BANDA_TICKET_CUT);

            console.log('Banda amoutn is: ' + banda_amount);
            console.log('Stripe amount is: ' + stripe_amount);
            console.log('Total amount is: ' + total_amount);

            var dest_amount = Math.trunc(total_amount-stripe_amount-banda_amount);
            console.log('dest_amount is: ' + dest_amount);

            var card_src = stripe_customer.src_id;
            var descript = 'Payment for ticket for event: ' +gig.name+' on ' +gig.date;
            //create the charge
            stripe.charges.create({
              amount: total_amount,
              currency: "usd",
              customer: stripe_customer.stripe_id,
              description: descript,
              transfer_data: {
                amount:dest_amount,
                destination: account,
              },
            }).then(function(charge) {
              //log the new charge in the database
              var chageForDB={'charge_id':charge.id, 'amount':charge.amount, 'gigID':gigID, 'transfer':true};
              db.db('users').collection('stripe_customers').updateOne({'username':req.session.key}, {$push:{'charges':chageForDB}}, (err8, res8)=>{
                if (err8){
                  console.log('There was an error updating stripe customer: ' + username + ' With charge for ticket.' + err8);
                  cb(null,'Hmmm...you have been chaged for this ticket however somehthign went wrong storing this charge in our database, ,eaning we may not be able to give you a refund. Please contact banda.help.customers@gmail.com to get this sorted out as quickly as possible.')
                }
                else{
                  //success case for the charge
                  cb('Worked', null)
                }
              });
            }).catch(function(stripe_error2){
              console.log('Stripe error for transfer: ' + stripe_error2);
              cb(null, stripe_error2);
            });
          }
        });
      });
  }


  // auth stuff

  function signInOrRegUser(username, password, email, cbOk, cbErr){
    if (!username) {
      return res.status(200).send('No username supplied')
    } else if (!password) {
      return res.status(200).send('No password supplied')
    } else if (!email) {
      return res.status(200).send('No email supplied')
    }
    if(!validator.validate(email)){
      console.log("password is not valid")
      res.status(200).send('Please enter a valid email').end();
      return;
    } // true

    //confirm the password is secure
    if (validatePassword(password) == false) {
      console.log("password is not valid")
      cbErr('password');
      return;
    }

    //hash the password
    password = hashPassword(password);

    db.db('users').collection('users').findOne({ $or: [{email: email}, {username: username}]}, (err3, obj) => {
      if (err3) {
        cbErr('internal');
      }
      else if (obj) {
        if (obj.password==password){
          console.log('Logging in user: ' + username + ' cause passowrd matched.')
          req.session.key = username;
          cbOk(obj);
        }
        else{
          cbErr('username');
        }
      }
      else {
        //if not, create a new user
        db.db('users').collection('users').insertOne({ email: email, username: username, password: password, contacts:[], 'phone':phone}, (err4, obj1) => {
          if (err4) {
            console.error(`Register request from ${req.ip} (for ${username}, ${email}, ${password}) returned error: ${err4}`);
            cbErr('internal');
          }
          else {
            req.session.key = username;
            console.log('Req session key after inserting user for register is: ' + req.session.key);
            var user = {'username':username, 'email':email, 'password':password};
            cbOk(user)
          }
        });
      }
    });
  }

  //ensure the password is secure
  function validatePassword(password) {
  	console.log("validate password entered!!!!!!!!!!!")
  	var schema = new passwordValidator();
  	schema
  	.is().min(8)                                    // Minimum length 8
  	.is().max(100)                                  // Maximum length 100
  	.has().uppercase()                              // Must have uppercase letters
  	.has().lowercase()                              // Must have lowercase letters
  	.has().digits()                                 // Must have digits
  	.has().not().spaces()                           // Should not have spaces
  	console.log(schema.validate(password))
  	return schema.validate(password)
  }

  //hashes the password
  function hashPassword(password) {
  	password = passwordHash.generate(password);
  	return password;
  }
  function generate_transfer_group(){
    var x = Math.random();
    var y = Math.random();
    var z = Math.random();
    var code = Math.random(x).toString(36).replace('0.', '');
    code += "Zk!ks31l"
    code += Math.random(y).toString(36).replace('0.', '');
    code +="swk0!ams;a_"
    code += Math.random(z).toString(36).replace('0.', '');
    console.log('Random Code: ' + code);
    return code;
  }

  function sendTicketInfo(emai, username, gig, cb){
    let transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com', // go daddy email host port
        port: 465, // could be 993
        secure: true,
        auth: {
            user: 'banda.confirmation@gmail.com',
            pass: 'N5gdakxq9!'
        }
    });
    var mailOptions = {
       from: OUR_ADDRESS, // our address
       to: email, // who we sending to
       subject: "New Gig Added In Your Area!", // Subject line
       text: body, // plain text body
       html: ""// html body
    };

    transporter.sendMail(mailOptions, (error5, info5) => {
       if (error5) {
          console.log('There was an error sending the email: ' + error5);
          cb(error5, null);
       }
       else{
         console.log('Message sent: ' + JSON.stringify(info5));
         cb(null, info5);
       }
     });
  }

}// end of module exports
