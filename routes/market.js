//start router for exporting
module.exports = router => {
    database = require('../database.js');
    stripe_private_key = process.env.STRIPE_SECRET_KEY || 'sk_test_t6hlsKu6iehEdJhV9KzITmxm00flbTdrG5';
    var stripe = require('stripe')(stripe_private_key);
    const orderid = require('order-id')('mysecret');
    const BANDA_CUT = 0.05;
    const BATCH_LIMIT = 100; //this value can and will change
    const OUR_ADDRESS = "banda.confirmation@gmail.com";
    

    //todo: figure out get query parameters, express orders, order history/refunds and confirm batchId system
    
    //post request for creating a new merch on the marketplace
    router.post('/market/createMerch', (req, res) => {
        //if the user is not signed in
        if(!req.session.key){
            console.log('Non logged in user tried to post a band');
            res.status(400).end();
            return;
          }
        
          //if the request has no body
          if (!req.body) {
                 res.status(400).send('No body sent');
             return;
          }
    
        //store values from the request
        var {bandFor, gigFor, color, type, supplierCost, userCut, bandaCut, price, imgSrc, description} = req.body;
        
        //connect to the db
        database.connect(db => {
            console.log("Got in database connect");
            const batchID = createBatchID(type, color, price, creator, bandFor, gigFor);
            //place the song in the db
            let market = db.db('marketplace').collection('merch');
            market.insertOne({ 'creator': req.session.key, 'bandFor': bandFor, 'gigFor': gigFor, 'color': color, 'type': type, 'supplierCost': supplierCost, 'userCut': userCut, 'bandaCut':bandaCut, 'price': price, 'preOrders': [], 'batchID': batchID, 'expressOrders':[], 'imgSrc': imgSrc, 'rating': 0, 'description': description}, (err, obj) => {
                if (err) {
                    console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                    res.status(500).end()
                } 
                res.status(200).send('Success').end();	
            })
        }, err => {
            console.warn("Couldn't connect to database: " + err)
            res.status(500).end()
        });
    });
    
    //post request for placing a preorder for merch with a batchID
    router.post('/market/preorder', (req, res)=>{
        //if the user is not signed in
        if(!req.session.key){
            console.log('Non logged in user tried to post a band');
            res.status(400).end();
            return;
          }
        
          //if the request has no body
          if (!req.body) {
                 res.status(400).send('No body sent');
             return;
          }
    
        //store values from the request
        var {price, address, date, size, batchID} = req.body;
        const id = orderid.generate()
        //update preorders array
        database.connect(db => {
            console.log("Got in database connect");
            //add the order to the preorders
            let market = db.db('marketplace').collection('merch');
            market.update({"batchID":batchID},{$push:{ "preorders": {'price':price, 'address':address, 'date':date, 'size':size, 'orderId':id} }}, (err, obj) => {
                if (err) {
                    console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                    res.status(500).end()
                } 

                //update the batch collection
                let batches = db.db('marketplace').collection('batches');
                batches.update({"color": color, "type": type},{ $push: { "orders": {batchID:batchID}} }, (err, obj) => { 
                    if (err) {
                        console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                        res.status(500).end()
                    } 
                    //fill orders if size exceeds limit
                    batches.find( { preorders: {$size: {$gt:BATCH_LIMIT} } }, (err,obj)=>{
                        fillOrders(obj);
                    });
                    res.status(200).send('Success').end();	
                }) 
            })
        }, err => {
            console.warn("Couldn't connect to database: " + err)
            res.status(500).end()
        });

        
    })

    //post request for placing an express order for merch with a batchID
    router.post('/market/expressOrder', (req,res)=>{
        //if the user is not signed in
        if(!req.session.key){
            console.log('Non logged in user tried to post a band');
            res.status(400).end();
            return;
          }
        
          //if the request has no body
          if (!req.body) {
                 res.status(400).send('No body sent');
             return;
          }
    
        //store values from the request
        var {price, address, date, size, merchId} = req.body;
        const orderId = orderid.generate()
        //update preorders array
        database.connect(db => {
            console.log("Got in database connect");

            //todo: perform purchase api call here



            //add the order to the preorders
            let market = db.db('marketplace').collection('pastOrders');
            market.insertOne({'price':price, 'address':address, 'date':date, 'size':size, 'merchId': merchId, 'orderId': orderId}, (err, obj) => {
                if (err) {
                    console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                    res.status(500).end()
                } 
                res.status(200).send('Success').end();	
            })
        }, err => {
            console.warn("Couldn't connect to database: " + err)
            res.status(500).end()
        });
    })

    //post request to request returning an item 
    router.post('/market/submitReturn', (req, res)=>{
        //if the user is not signed in
        if(!req.session.key){
            console.log('Non logged in user tried to post a band');
            res.status(400).end();
            return;
          }
        
          //if the request has no body
          if (!req.body) {
            res.status(400).send('No body sent');
            return;
          }
    
        //store values from the request
        var {orderId} = req.body;
        //update preorders array
        database.connect(db => {
            console.log("Got in database connect");

            //todo: perform purchase api call here
            let pastOrders = db.db('marketplace').collection('pastOrders');
            pastOrders.findOne({orderId: orderId}, (err, obj) => {
                //failure case
                if (err) {
                    console.error(`User find request from ${req.ip} (for ${username}) returned error: ${err}`)
                    res.status(500).end()
                    db.close();
                } 
                //if the order is found
                else if (obj) {
                    console.log('That username or email already exists sending that info back.')
                    //add order to pending return
                    let pendingReturns = db.db('marketplace').collection('pendingReturns');
                    pendingReturns.insertOne({obj}, (err, obj2) => {
                        if (err) {
                            console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                            res.status(500).end()
                        } 

                        //remove the order from past orders
                        pastOrders.remove({obj}, (err, obj3) =>{
                            if (err) {
                                console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                                res.status(500).end()
                            } 
                            res.status(200).send('These will be instructions on how to submit a return and how you will get fully refunded!').end();
                        })	
                    })
                } 
                //if the order is not found
                else {
                    res.status(200).send('Order not found').end();
                }
            })
        }, err => {
            console.warn("Couldn't connect to database: " + err)
            res.status(500).end()
        });
    })

    //post request for fullfilling a return
    router.post('/market/successfulReturn', (req,res)=>{
        //if the user is not signed in
        if(!req.session.key){
            console.log('Non logged in user tried to post a band');
            res.status(400).end();
            return;
          }
        
        //if the request has no body
        if (!req.body) {
            res.status(400).send('No body sent');
            return;
        }

        var {orderId} = req.body;
        //update preorders array
        database.connect(db => {
            console.log("Got in database connect");

            //todo: perform purchase api call here
            let pendingReturns = db.db('marketplace').collection('pendingReturns');
            let pastOrders = db.db('marketplace').collection('pastOrders');
            pendingReturns.findOne({orderId: orderId}, (err, obj) => {
                //failure case
                if (err) {
                    console.error(`User find request from ${req.ip} (for ${username}) returned error: ${err}`)
                    res.status(500).end()
                    db.close();
                } 
                //if the order is found
                else if (obj) {
                    console.log('That username or email already exists sending that info back.')
                    //add order to pending return
                    obj.returned = true;
                    pastOrders.insertOne({obj}, (err, obj2) => {
                        if (err) {
                            console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                            res.status(500).end()
                        } 

                        //remove the order from past orders
                        pendingReturns.remove({orderId: obj.orderId}, (err, obj3) =>{
                            if (err) {
                                console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                                res.status(500).end()
                            } 
                            res.status(200).send('These will be instructions on how to submit a return and how you will get fully refunded!').end();
                        })	
                    })
                } 
                //if the order is not found
                else {
                    res.status(200).send('Order not found').end();
                }
            })
        }, err => {
            console.warn("Couldn't connect to database: " + err)
            res.status(500).end()
        });

    })

    //post request of the return is not made
    router.post('/market/failedReturn', (req,res)=>{
        //if the user is not signed in
        if(!req.session.key){
            console.log('Non logged in user tried to post a band');
            res.status(400).end();
            return;
          }
        
        //if the request has no body
        if (!req.body) {
            res.status(400).send('No body sent');
            return;
        }

        var {orderId} = req.body;
        //update preorders array
        database.connect(db => {
            console.log("Got in database connect");

            let pendingReturns = db.db('marketplace').collection('pendingReturns');
            let pastOrders = db.db('marketplace').collection('pastOrders');
            pendingReturns.findOne({orderId: orderId}, (err, obj) => {
                //failure case
                if (err) {
                    console.error(`User find request from ${req.ip} (for ${username}) returned error: ${err}`)
                    res.status(500).end()
                    db.close();
                } 
                //if the order is found
                else if (obj) {
                    console.log('That username or email already exists sending that info back.')
                    //add order to pending return
                    obj.returned = false;
                    pastOrders.insertOne({obj}, (err, obj2) => {
                        if (err) {
                            console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                            res.status(500).end()
                        } 

                        //remove the order from past orders
                        pendingReturns.remove({orderId: obj.orderId}, (err, obj3) =>{
                            if (err) {
                                console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                                res.status(500).end()
                            } 
                            res.status(200).send('These will be instructions on how to submit a return and how you will get fully refunded!').end();
                        })	
                    })
                } 
                //if the order is not found
                else {
                    res.status(200).send('Order not found').end();
                }
            })
        }, err => {
            console.warn("Couldn't connect to database: " + err)
            res.status(500).end()
        });

    })

    //post request to upload a beat
    router.post('/market/uploadBeat', (req, res) =>{
        //if the user is not signed in
        if(!req.session.key){
            console.log('Non logged in user tried to post a band');
            res.status(400).end();
            return;
        }
        
        //if the request has no body
        if (!req.body) {
            res.status(400).send('No body sent');
            return;
        }
    
        //store values from the request
        var {songSrc, imgSrc, creator, price, songName, description} = req.body;

        //connect to the db
        database.connect(db => {
            console.log("Got in database connect");
            //instance of db for beats
            var beats = db.db('marketplace').collection('beats');
            //check to see if the user laready exists
            users.findOne({songName:songName, creator:req.session.key}, (err, obj) => {
                if (err) {
                    console.error(`User find request from ${req.ip} (for ${username}) returned error: ${err}`)
                    res.status(500).end()
                    db.close();
                } else if (obj) {
                    console.log('That username or email already exists sending that info back.')
                    res.status(200).send('This song already exists').end();
                } else {
                    //if not, create a new beat
                    beats.insertOne({songSrc: songSrc, imgSrc: imgSrc, creator: creator, price: price, owner: req.session.key, songName: songName, description: description, rating:0}, (err, obj) => {
                        if (err) {
                            console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                            res.status(500).end()
                        } 
                        res.status(200).send('Success').end();	
                    })
                }
            })
        }, err => {
            console.warn("Couldn't connect to database: " + err)
            res.status(500).end()
        });

    })

    //post request to exchange rights of beats
    router.post('/market/exchangeBeat', (req,res) => {
        //if the user is not signed in
        if(!req.session.key){
            console.log('Non logged in user tried to post a band');
            res.status(400).end();
            return;
        }
        
        //if the request has no body
        if (!req.body) {
            res.status(400).send('No body sent');
            return;
        }
    
        //store values from the request
        var {creator, songName} = req.body;

        //connect to the db
        database.connect(db => {
            console.log("Got in database connect");
            //instance of db for beats
            var beats = db.db('marketplace').collection('beats');
            //check to see if the user laready exists
            users.findOne({'songName':songName, 'creator':req.session.key}, (err, obj) => {
                if (err) {
                    console.error(`User find request from ${req.ip} (for ${username}) returned error: ${err}`)
                    res.status(500).end()
                    db.close();
                } else if (obj) {
                    console.log('That username or email already exists sending that info back.')
                    res.status(200).send('This song does not exist').end();
                } else {
                    //todo: run a stripe charge here
                    beats.updateOne({'songName':req.session.key, 'creator': creator}, {$set:{'owner':req.session.key}}, (err, obj) => {
                        if (err) {
                            console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                            res.status(500).end()
                        } 
                        res.status(200).send('Success').end();	
                    })
                }
            })
        }, err => {
            console.warn("Couldn't connect to database: " + err)
            res.status(500).end()
        });

    })

    //get request to  get all merchandise in merch collection
    router.get('/market/getAllMerch', (req,res) =>{
        //if the user is not signed in
        if(!req.session.key){
            console.log('Non logged in user tried to post a band');
            res.status(400).end();
            return;
        }
        
        //if the request has no body
        if (!req.body) {
            res.status(400).send('No body sent');
            return;
        }

        //connect to the db
        database.connect(db => {
            console.log("Got in database connect");
            //instance of db for beats
            var merch = db.db('marketplace').collection('merch');
            //check to see if the user laready exists
            merch.find({}, (err, obj) => {
                if (err) {
                    console.error(`User find request from ${req.ip} (for ${username}) returned error: ${err}`)
                    res.status(500).end()
                    db.close();
                } 
                res.status(200).send(obj).end();	
            })
        }, err => {
            console.warn("Couldn't connect to database: " + err)
            res.status(500).end()
        });
    })

    //get merch by type
    router.post('market/getMerchByType', (req,res) =>{
        //if the user is not signed in
        if(!req.session.key){
            console.log('Non logged in user tried to post a band');
            res.status(400).end();
            return;
        }
        
        //if the request has no body
        if (!req.body) {
            res.status(400).send('No body sent');
            return;
        }

        var type = req.body.type;
        //connect to the db
        database.connect(db => {
            console.log("Got in database connect");
            //instance of db for beats
            var merch = db.db('marketplace').collection('merch');
            //check to see if the user laready exists
            merch.find({"type":type}, (err, obj) => {
                if (err) {
                    console.error(`User find request from ${req.ip} (for ${username}) returned error: ${err}`)
                    res.status(500).end()
                    db.close();
                } 
                res.status(200).send(obj).end();	
            })
        }, err => {
            console.warn("Couldn't connect to database: " + err)
            res.status(500).end()
        });
    })

    //get merch by owner
    router.post('/market/getMerchByOwner', (req,res) =>{
        //if the user is not signed in
        if(!req.session.key){
            console.log('Non logged in user tried to post a band');
            res.status(400).end();
            return;
        }
        
        //if the request has no body
        if (!req.body) {
            res.status(400).send('No body sent');
            return;
        }

        var owner = req.body.owner;
        //connect to the db
        database.connect(db => {
            console.log("Got in database connect");
            //instance of db for beats
            var merch = db.db('marketplace').collection('merch');
            //check to see if the user laready exists
            merch.find({"owner":owner}, (err, obj) => {
                if (err) {
                    console.error(`User find request from ${req.ip} (for ${username}) returned error: ${err}`)
                    res.status(500).end()
                    db.close();
                } 
                res.status(200).send(obj).end();	
            })
        }, err => {
            console.warn("Couldn't connect to database: " + err)
            res.status(500).end()
        });
    })

    //get merch by band
    router.post('/market/getMerchByBand', (req,res)=>{
        //if the user is not signed in
        if(!req.session.key){
            console.log('Non logged in user tried to post a band');
            res.status(400).end();
            return;
        }
        
        //if the request has no body
        if (!req.body) {
            res.status(400).send('No body sent');
            return;
        }

        var band = req.body.band;
        //connect to the db
        database.connect(db => {
            console.log("Got in database connect");
            //instance of db for beats
            var merch = db.db('marketplace').collection('merch');
            //check to see if the user laready exists
            merch.find({"bandFor":band}, (err, obj) => {
                if (err) {
                    console.error(`User find request from ${req.ip} (for ${username}) returned error: ${err}`)
                    res.status(500).end()
                    db.close();
                } 
                res.status(200).send(obj).end();	
            })
        }, err => {
            console.warn("Couldn't connect to database: " + err)
            res.status(500).end()
        });
    })

    //get merch by gig
    router.post('/market/getMerchByGig', (req,res)=>{
        //if the user is not signed in
        if(!req.session.key){
            console.log('Non logged in user tried to post a band');
            res.status(400).end();
            return;
        }
        
        //if the request has no body
        if (!req.body) {
            res.status(400).send('No body sent');
            return;
        }

        var gig = req.body.gig;
        //connect to the db
        database.connect(db => {
            console.log("Got in database connect");
            //instance of db for beats
            var merch = db.db('marketplace').collection('merch');
            //check to see if the user laready exists
            merch.find({"gigFor":gig}, (err, obj) => {
                if (err) {
                    console.error(`User find request from ${req.ip} (for ${username}) returned error: ${err}`)
                    res.status(500).end()
                    db.close();
                } 
                res.status(200).send(obj).end();	
            })
        }, err => {
            console.warn("Couldn't connect to database: " + err)
            res.status(500).end()
        });
    })

    //generates a unique batch id for the merch iteam
    function createBatchID(type, color, price, creator, band, gig){
        return "this will be an id";
    }

    //calls the stripe api to create a transaction
    function chargeUser(req, price, marketID, cb){
        console.log('PRICE IN CHARGE: ' + price);
    
        //setup variables for user info
        var username = req.session.key;
        var chargeAmount = Math.trunc(100*BANDA_CUT*price); // this puts it into cents.
    
        console.log('BANDA CASH: ' + chargeAmount);
    
        //get the user that is to be charged
        database.connect(db=>{
          db.db('users').collection('stripe_customers').findOne({'username':username}, (err9, stripe_user)=>{
            if(err9){
              console.log('There was an error finding username: ' + username + ' in the stripe_customers' + err9);
              cb(err9);
              return;
            }
            console.log('stripe_user is: ' + JSON.stringify(stripe_user));
    
            //create a stripe transaction
            stripe.charges.create({
              //stripe variables
              amount: chargeAmount,
              currency: 'usd',
              customer: stripe_user.stripe_id,
              description: "For a band from Banda, for your event.",
            }, function(stripe_error, charge) {
    
              //catch errors in the api
                if(stripe_error){
                  console.log('There was an error createing chage with stripe: ' + stripe_error.message);
                  cb(stripe_error);
                }
                else{
                  console.log('THe charge is: ' + JSON.stringify(charge));
    
                  //intialize the db variables for the charge
                  var chageForDB={'charge_id':charge.id, 'amount':charge.amount, 'marketID':marketID, 'transfer':false};
    
                  //store the charge in the database
                  db.db('users').collection('stripe_customers').updateOne({'username':username}, {$push:{'charges':chageForDB}}, (result11, err11)=>{
                    if (err11){
                      console.log('There was an error adding the charge to user: '+username+' charges array.');
                      cb(err11);
                      db.close();
                    }
                    else{
                      //complete and log the history of the charge
                      console.log('Added charge to db and charge was successful. We charged user: ' +username+' '+chargeAmount);
                      cb();
                      db.close();
                    }
                  })
                }
              });
          });
        }, err=>{
          cb(err)
        });
    }
    
    function fillOrders(obj){
        console.log("this function will fill orders for the batch and remove the orders from preorders")
    }
    
    
    } /* end module.exports */
    