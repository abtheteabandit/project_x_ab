//start router for exporting
module.exports = router => {
    database = require('../database.js');
    stripe_private_key = process.env.STRIPE_SECRET_KEY || 'sk_test_t6hlsKu6iehEdJhV9KzITmxm00flbTdrG5';
    var stripe = require('stripe')(stripe_private_key);
    const BANDA_CUT = 0.05;
    const OUR_ADDRESS = "banda.confirmation@gmail.com";
    
    
    //post request for creating a new song on the marketplace
    router.post('/market/createMusic', (req, res) => {
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
        var {mediaType, song, price, description, zipcode, picture, genre, songName, band} = req.body;
        
        //connect to the db
        database.connect(db => {
            console.log("Got in database connect");
            //place the song in the db
            let market = db.db('market').collection('songs');
            market.insertOne({ 'owner': req.session.key, 'songName': songName, 'band': band, 'mediaType': mediaType, 'song': song, 'genre': genre, 'price': price, 'zipcode': zipcode, 'description': description, 'picture': picture, 'date': new Date(), 'numDownloads': 0}, (err, obj) => {
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
    
    //post request for creating a new design on the marketplace
    router.post('/market/createDesign', (req, res) => {
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
        var {mediaType, designFile, price, description, zipcode, picture, designName, band} = req.body;
        
        //connect to the db
        database.connect(db => {
            console.log("Got in database connect");
            //place the song in the db
            let market = db.db('market').collection('designs');
            market.insertOne({ 'owner': req.session.key, 'designName': designName,'band': band,  'mediaType': mediaType, 'designFile':designFile, 'price': price, 'zipcode': zipcode, 'description': description, 'picture': picture, 'date': new Date(), 'numDownloads': 0}, (err, obj) => {
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
    
    //post request for creating a new beat
    router.post('/market/createBeat', (req, res) => {
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
        var {mediaType, beat, price, description, zipcode, picture, genre, beatName, band} = req.body;
        
        //connect to the db
        database.connect(db => {
            console.log("Got in database connect");
            //place the song in the db
            let market = db.db('market').collection('beats');
            market.insertOne({ 'owner': req.session.key, 'beatName': beatName, 'mediaType': mediaType, 'band': band, 'beat': beat, 'genre': genre, 'price': price, 'zipcode': zipcode, 'description': description, 'picture': picture, 'date': new Date(), 'numDownloads': 0}, (err, obj) => {
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
    
    
    
    
    
    //get music by owner
    router.post('/market/getMusicByOwner', (req, res) =>{
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
        var {owner} = req.body;
        
        //connect to the db
        database.connect(db => {
            console.log("Got in database connect");
            //place the song in the db
            let market = db.db('market').collection('songs');
            db.db('market').collection('songs').findOne({ 'owner': owner}, (err, obj) => {
                console.log("Got in find one");
                console.log(JSON.stringify(obj));
                if (err) {
                    console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                    res.status(500).end()
                } 
                db.close();
                res.send(obj.data);
                return;       
            })
        }, err => {
            console.warn("Couldn't connect to database: " + err)
            res.status(500).end()
        });
    })
    
    //get music by band
    router.post('/market/getMusicByBand', (req, res) =>{
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
        var {band} = req.body;
        
        //connect to the db
        database.connect(db => {
            console.log("Got in database connect");
            //get the song from the db
            let market = db.db('market').collection('songs');
            db.db('market').collection('songs').findOne({ 'band': band}, (err, obj) => {
                if (err) {
                    console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                    res.status(500).end()
                } 
                db.close();
                res.send(obj.data);
                return;       
            })
        }, err => {
            console.warn("Couldn't connect to database: " + err)
            res.status(500).end()
        });
    })
    
    //get music by name
    router.post('/market/getMusicByName', (req, res) =>{
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
        var {songName} = req.body;
        
        //connect to the db
        database.connect(db => {
            console.log("Got in database connect");
            //place the song in the db
            let market = db.db('market').collection('songs');
            db.db('users').collection('users').findOne({ 'songName': songName}, (err, obj) => {
                console.log("Got in find one");
                console.log(JSON.stringify(obj));
                if (err) {
                    console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                    res.status(500).end()
                } 
                db.close();
                res.send(obj.data);
                return;       
            })
        }, err => {
            console.warn("Couldn't connect to database: " + err)
            res.status(500).end()
        });
    })
    
    
    
    
    
    //get beat by band
    router.post('/market/getBeatByBand', (req, res) =>{
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
        var {band} = req.body;
    
        //connect to the db
        database.connect(db => {
            //place the song in the db
            let market = db.db('market').collection('beats');
            market.findOne({ 'band': band}, (err, obj) => {
                if (err) {
                    console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                    res.status(500).end()
                } 
                db.close();
                res.send(obj.data);
                return;       
            })
        }, err => {
            console.warn("Couldn't connect to database: " + err)
            res.status(500).end()
        });
    })
    
    //get beat by name
    router.post('/market/getBeatByName', (req, res) =>{
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
        var {beatName} = req.body;
    
        //connect to the db
        database.connect(db => {
            //place the song in the db
            let market = db.db('market').collection('beats');
            market.findOne({'beatName': beatName}, (err, obj) => {
                if (err) {
                    console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                    res.status(500).end()
                } 
                db.close();
                res.send(obj.data);
                return;       
            })
        }, err => {
            console.warn("Couldn't connect to database: " + err)
            res.status(500).end()
        });
    })
    
    //get beat by owner
    router.post('/market/getBeatByOwner', (req, res) =>{
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
    var {owner} = req.body;
    
    //connect to the db
    database.connect(db => {
        //place the song in the db
        let market = db.db('market').collection('beats');
        market.findOne({ 'owner': owner}, (err, obj) => {
            if (err) {
                console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                res.status(500).end()
            } 
            db.close();
            res.send(obj.data);
            return;       
        })
    }, err => {
        console.warn("Couldn't connect to database: " + err)
        res.status(500).end()
    });
    })
    
    
    
    
    
    //get design by name
    router.post('/market/getDesignByName', (req, res) =>{
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
        var {designName} = req.body;
    
        //connect to the db
        database.connect(db => {
            //place the song in the db
            let market = db.db('market').collection('designs');
            market.findOne({ 'designName': designName }, (err, obj) => {
                if (err) {
                    console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                    res.status(500).end()
                } 
                db.close();
                res.send(obj.data);
                return;       
            })
        }, err => {
            console.warn("Couldn't connect to database: " + err)
            res.status(500).end()
        });
    })
    
    //get design by band
    router.post('/market/getDesignByBand', (req, res) =>{
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
        var {band} = req.body;
    
        //connect to the db
        database.connect(db => {
            //place the song in the db
            let market = db.db('market').collection('designs');
            market.findOne({ 'band': band}, (err, obj) => {
                if (err) {
                    console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                    res.status(500).end()
                } 
                db.close();
                res.send(obj.data);
                return;       
            })
        }, err => {
            console.warn("Couldn't connect to database: " + err)
            res.status(500).end()
        });
    })
    
    //get design by owner
    router.post('/market/getDesignByOwner', (req, res) =>{
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
        var {owner} = req.body;
    
        //connect to the db
        database.connect(db => {
            //place the song in the db
            let market = db.db('market').collection('designs');
            market.findOne({ 'owner': owner}, (err, obj) => {
                if (err) {
                    console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                    res.status(500).end()
                } 
                db.close();
                res.send(obj.data);
                return;       
            })
        }, err => {
            console.warn("Couldn't connect to database: " + err)
            res.status(500).end()
        });
    })
    
    
    
    
    //transfer owner of design with stripe integeration
    router.post('/market/changeOwnerOfDesign', (req, res)=>{
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
    
        //store the parameters
        const newOwner = req.session.key;
        const {oldOwner, band, designName} = req.body;
    
        //connect to the db
        database.connect(db => {
            //place the song in the db
            let market = db.db('market').collection('designs');
            market.findOne({ 'owner': oldOwner, 'band': band, 'designName': designName}).toArray((err, result)=>{
                if (err) {
                    console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                    res.status(500).end()
                } 
                const price = result[0].price;
                const marketID = result[0]._id;
    
                console.log("Gig with id: "+ gigID + 'is not filled');
                var newValues = {$set: {'owner':req.session.key}};
    
                //transfer ownership and charge the user
                market.updateOne({'_id':marketID}, newValues, (err2, result)=>{
                    if (err2){
                        console.log('There was an error tryign to append set gig stuff, error was: ' + err2);
                        res.status(500).end();
                        db.close();
    
                    }
                    else{
                        //charge the user if the owner is changed
                        console.log('got gig set with the band' + bandID);
                        console.log(JSON.stringify(result));
                        chargeUser(req, price, marketID, (ourError)=>{
                        if(ourError){
                            console.log('We had an error chraging customer: ' + ourError);
                        }
                        res.status(200).send('Success').end();	
                        });
                    }
                });
    
                
            })
        }, err => {
            console.warn("Couldn't connect to database: " + err)
            res.status(500).end()
        });
       
    })
    
    //transfer owner of song with stripe integration
    router.post('/market/changeOwnerOfSong', (req,res)=>{
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
    
        //store the parameters
        const newOwner = req.session.key;
        const {oldOwner, band, songName} = req.body;
    
        //connect to the db
        database.connect(db => {
            //place the song in the db
            let market = db.db('market').collection('songs');
            market.findOne({ 'owner': oldOwner, 'band': band, 'songName': songName}).toArray((err, result)=>{
                if (err) {
                    console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                    res.status(500).end()
                } 
                const oldBeatOwner = result[0].owner;
                const price = result[0].price;
                const marketID = result[0]._id;
    
                console.log("Gig with id: "+ gigID + 'is not filled');
                var newValues = {$set: {'owner':req.session.key}};
    
                //transfer ownership and charge the user
                market.updateOne({'_id':marketID}, newValues, (err2, result)=>{
                    if (err2){
                        console.log('There was an error tryign to append set gig stuff, error was: ' + err2);
                        res.status(500).end();
                        db.close();
    
                    }
                    else{
                        //charge the user if the owner is changed
                        console.log('got gig set with the band' + bandID);
                        console.log(JSON.stringify(result));
                        chargeUser(req, price, marketID, (ourError)=>{
                        if(ourError){
                            console.log('We had an error chraging customer: ' + ourError);
                        }
                        res.status(200).send('Success').end();	
                        });
                    }
                });
    
                
            })
        }, err => {
            console.warn("Couldn't connect to database: " + err)
            res.status(500).end()
        });
    
    })
    
    //transfer owner of beat with stripe integration
    router.post('/market/changeOwnerOfBeat', (req, res) =>{
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
    
        //store the parameters
        const newOwner = req.session.key;
        const {oldOwner, band, beatName} = req.body;
    
        //connect to the db
        database.connect(db => {
            //place the song in the db
            let market = db.db('market').collection('beats');
            market.findOne({ 'owner': oldOwner, 'band': band, 'beatName': beatName}).toArray((err, result)=>{
                if (err) {
                    console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                    res.status(500).end()
                } 
                const oldBeatOwner = result[0].owner;
                const price = result[0].price;
                const marketID = result[0]._id;
    
                console.log("Gig with id: "+ gigID + 'is not filled');
                var newValues = {$set: {'owner':req.session.key}};
    
                //transfer ownership and charge the user
                market.updateOne({'_id':marketID}, newValues, (err2, result)=>{
                    if (err2){
                        console.log('There was an error tryign to append set gig stuff, error was: ' + err2);
                        res.status(500).end();
                        db.close();
    
                    }
                    else{
                        //charge the user if the owner is changed
                        console.log('got gig set with the band' + bandID);
                        console.log(JSON.stringify(result));
                        chargeUser(req, price, marketID, (ourError)=>{
                        if(ourError){
                            console.log('We had an error chraging customer: ' + ourError);
                        }
                        res.status(200).send('Success').end();	
                        });
                    }
                });
    
                
            })
        }, err => {
            console.warn("Couldn't connect to database: " + err)
            res.status(500).end()
        });
    })
    
    
    
    //creates a new merch item (merchType determinese type  of merch)
    //valid types of merch are: hoody, hat, sweatpant, tshirt, longSleeveShirt, sticker, poster
    router.post('/market/createMerch', (req,res)=>{
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
    
        //store the parameters
        const {band, design, text, description, price, merchType, picture, zipcode, color} = req.body;
        
        //connect to the db
        database.connect(db => {
            console.log("Got in database connect");
            //place the song in the db
            let market = db.db('market').collection('merch');
            market.insertOne({ 'owner': req.session.key, 'date': new Date(), 'totalSales': 0, 'band': band, 'design': design, 'text':text, 'description':description, 'price': price, 'merchType': merchType, 'picture': picture, 'zipcode':  zipcode, 'color': color}, (err, obj) => {
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
    
    
    //route to place an order for merch, todo: determine if the user should be charged when the order is filled or placed
    router.post('/market/orderMerch', (req,res)=>{
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
    
        //store the parameters
        const {sizes, colors, quantity, cost, design, itemIds, band, gig, address, merchType} = req.body;
        
        //connect to the db
        database.connect(db => {
            console.log("Got in database connect");
            //place the order in the mercg orders collection
            let market = db.db('market').collection('activeMerchOrders');
            market.insertOne({ 'owner': req.session.key,
             'date': new Date(),
              'size': sizes,
               'colors': colors,
                'quantity': quantity,
                 'cost': cost,
                  'design': design,
                   'itemIds':itemIds,
                    'band': band,
                     'gig': gig,
                      'address': address,
                        'type':merchType,
                            'owner': req.session.key,
                                'date': new Date()
                                }, (err, obj) => {
                        if (err) {
                            console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                            res.status(500).end()
                        } 
                        //chrage the user for the preorder
                        chargeUser(req, cost, obj._id, (ourError)=>{
                            if(ourError){
                                console.log('We had an error chraging customer: ' + ourError);
                            }
                            //update the merch sale stats
                            let merch = db.db('market').collection('merch');
                            for(let id in itemIds){
                                merch.findOne({ '_id': itemId}, (err, obj2) => {
                                    console.log("Got in find one");
                                    console.log(JSON.stringify(obj2));
                                    if (err) {
                                        console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                                        res.status(500).end()
                                    }
                                    ++obj2.totalSales;
                                    merch.update({'_id':id}, {$set:{'totalSales':obj2.totalSales}}, {upsert:true}, (err4, res4)=>{
                                        if (err4){
                                            res.status(500).end();
                                            db.close();
                                        }
                                        else{
                                            db.close();
    
                                        }
                                });
                            })
                        }
                        res.status(200).send('Success').end();
                        });
                    })
                }, err => {
                    console.warn("Couldn't connect to database: " + err)
                    res.status(500).end()
            });
    })
    
    //route to place an order for a hoody
    router.post('/market/orderHoody', (req,res)=>{
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
    
        //store the parameters
        const {size, color, quantity, cost, design, itemId, band, gig, address, merchType} = req.body;
        
        //connect to the db
        database.connect(db => {
            console.log("Got in database connect");
            //place the order in the mercg orders collection
            let market = db.db('market').collection('hoodyOrders');
            market.insertOne({ 'owner': req.session.key,
             'date': new Date(),
              'size': size,
               'color': color,
                'quantity': quantity,
                 'cost': cost,
                  'design': design,
                   'itemId':itemId,
                    'band': band,
                     'gig': gig,
                      'address': address,
                        'type':merchType,
                            'owner': req.session.key,
                                'date': new Date()
                                }, (err, obj) => {
                        if (err) {
                            console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                            res.status(500).end()
                        } 
                        //chrage the user for the preorder
                        chargeUser(req, cost, obj._id, (ourError)=>{
                            if(ourError){
                                console.log('We had an error chraging customer: ' + ourError);
                            }
                            //update the merch sale stats
                            let merch = db.db('market').collection('merch');
                            merch.findOne({ '_id': itemId}, (err, obj2) => {
                                console.log("Got in find one");
                                console.log(JSON.stringify(obj2));
                                if (err) {
                                    console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                                    res.status(500).end()
                                }
                                ++obj2.totalSales;
                                merch.update({'_id':id}, {$set:{'totalSales':obj2.totalSales}}, {upsert:true}, (err4, res4)=>{
                                    if (err4){
                                        res.status(500).end();
                                        db.close();
                                    }
                                    else{
                                        db.close();
                                        res.status(200).send('Success').end();
                                    }
                            });
                        })
                        });
                    })
                }, err => {
                    console.warn("Couldn't connect to database: " + err)
                    res.status(500).end()
            });
    })
    
    //route to place an order for a hat
    router.post('/market/orderHat', (req,res)=>{
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
    
        //store the parameters
        const {color, quantity, cost, design, itemId, band, gig, address, merchType} = req.body;
        
        //connect to the db
        database.connect(db => {
            console.log("Got in database connect");
            //place the order in the mercg orders collection
            let market = db.db('market').collection('hatOrders');
            market.insertOne({ 'owner': req.session.key,
             'date': new Date(),
               'color': color,
                'quantity': quantity,
                 'cost': cost,
                  'design': design,
                   'itemId':itemId,
                    'band': band,
                     'gig': gig,
                      'address': address,
                        'type':merchType,
                            'owner': req.session.key,
                                'date': new Date()
                                }, (err, obj) => {
                        if (err) {
                            console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                            res.status(500).end()
                        } 
                        //chrage the user for the preorder
                        chargeUser(req, cost, obj._id, (ourError)=>{
                            if(ourError){
                                console.log('We had an error chraging customer: ' + ourError);
                            }
                            //update the merch sale stats
                            let merch = db.db('market').collection('merch');
                            merch.findOne({ '_id': itemId}, (err, obj2) => {
                                console.log("Got in find one");
                                console.log(JSON.stringify(obj2));
                                if (err) {
                                    console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                                    res.status(500).end()
                                }
                                ++obj2.totalSales;
                                merch.update({'_id':id}, {$set:{'totalSales':obj2.totalSales}}, {upsert:true}, (err4, res4)=>{
                                    if (err4){
                                        res.status(500).end();
                                        db.close();
                                    }
                                    else{
                                        db.close();
                                        res.status(200).send('Success').end();
                                    }
                            });
                        })
                        });
                    })
                }, err => {
                    console.warn("Couldn't connect to database: " + err)
                    res.status(500).end()
            });
    })
    
    //route to place an order for sweatpants
    router.post('/market/orderHoody', (req,res)=>{
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
    
        //store the parameters
        const {size, color, quantity, cost, design, itemId, band, gig, address, merchType} = req.body;
        
        //connect to the db
        database.connect(db => {
            console.log("Got in database connect");
            //place the order in the mercg orders collection
            let market = db.db('market').collection('hoodyOrders');
            market.insertOne({ 'owner': req.session.key,
             'date': new Date(),
              'size': size,
               'color': color,
                'quantity': quantity,
                 'cost': cost,
                  'design': design,
                   'itemId':itemId,
                    'band': band,
                     'gig': gig,
                      'address': address,
                        'type':merchType,
                            'owner': req.session.key,
                                'date': new Date()
                                }, (err, obj) => {
                        if (err) {
                            console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                            res.status(500).end()
                        } 
                        //chrage the user for the preorder
                        chargeUser(req, cost, obj._id, (ourError)=>{
                            if(ourError){
                                console.log('We had an error chraging customer: ' + ourError);
                            }
                            //update the merch sale stats
                            let merch = db.db('market').collection('merch');
                            merch.findOne({ '_id': itemId}, (err, obj2) => {
                                console.log("Got in find one");
                                console.log(JSON.stringify(obj2));
                                if (err) {
                                    console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                                    res.status(500).end()
                                }
                                ++obj2.totalSales;
                                merch.update({'_id':id}, {$set:{'totalSales':obj2.totalSales}}, {upsert:true}, (err4, res4)=>{
                                    if (err4){
                                        res.status(500).end();
                                        db.close();
                                    }
                                    else{
                                        db.close();
                                        res.status(200).send('Success').end();
                                    }
                            });
                        })
                        });
                    })
                }, err => {
                    console.warn("Couldn't connect to database: " + err)
                    res.status(500).end()
            });
    })
    
    //route to place an order for tshirts
    router.post('/market/orderTshirt', (req,res)=>{
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
    
        //store the parameters
        const {size, color, quantity, cost, design, itemId, band, gig, address, merchType} = req.body;
        
        //connect to the db
        database.connect(db => {
            console.log("Got in database connect");
            //place the order in the mercg orders collection
            let market = db.db('market').collection('tshirtOrders');
            market.insertOne({ 'owner': req.session.key,
             'date': new Date(),
              'size': size,
               'color': color,
                'quantity': quantity,
                 'cost': cost,
                  'design': design,
                   'itemId':itemId,
                    'band': band,
                     'gig': gig,
                      'address': address,
                        'type':merchType,
                            'owner': req.session.key,
                                'date': new Date()
                                }, (err, obj) => {
                        if (err) {
                            console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                            res.status(500).end()
                        } 
                        //chrage the user for the preorder
                        chargeUser(req, cost, obj._id, (ourError)=>{
                            if(ourError){
                                console.log('We had an error chraging customer: ' + ourError);
                            }
                            //update the merch sale stats
                            let merch = db.db('market').collection('merch');
                            merch.findOne({ '_id': itemId}, (err, obj2) => {
                                console.log("Got in find one");
                                console.log(JSON.stringify(obj2));
                                if (err) {
                                    console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                                    res.status(500).end()
                                }
                                ++obj2.totalSales;
                                merch.update({'_id':id}, {$set:{'totalSales':obj2.totalSales}}, {upsert:true}, (err4, res4)=>{
                                    if (err4){
                                        res.status(500).end();
                                        db.close();
                                    }
                                    else{
                                        db.close();
                                        res.status(200).send('Success').end();
                                    }
                            });
                        })
                        });
                    })
                }, err => {
                    console.warn("Couldn't connect to database: " + err)
                    res.status(500).end()
            });
    })
    
    //route to place an order for long sleeve shirt
    router.post('/market/orderLongSleeve', (req,res)=>{
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
    
        //store the parameters
        const {size, color, quantity, cost, design, itemId, band, gig, address, merchType} = req.body;
        
        //connect to the db
        database.connect(db => {
            console.log("Got in database connect");
            //place the order in the mercg orders collection
            let market = db.db('market').collection('longSleeveOrders');
            market.insertOne({ 'owner': req.session.key,
             'date': new Date(),
              'size': size,
               'color': color,
                'quantity': quantity,
                 'cost': cost,
                  'design': design,
                   'itemId':itemId,
                    'band': band,
                     'gig': gig,
                      'address': address,
                        'type':merchType,
                            'owner': req.session.key,
                                'date': new Date()
                                }, (err, obj) => {
                        if (err) {
                            console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                            res.status(500).end()
                        } 
                        //chrage the user for the preorder
                        chargeUser(req, cost, obj._id, (ourError)=>{
                            if(ourError){
                                console.log('We had an error chraging customer: ' + ourError);
                            }
                            //update the merch sale stats
                            let merch = db.db('market').collection('merch');
                            merch.findOne({ '_id': itemId}, (err, obj2) => {
                                console.log("Got in find one");
                                console.log(JSON.stringify(obj2));
                                if (err) {
                                    console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                                    res.status(500).end()
                                }
                                ++obj2.totalSales;
                                merch.update({'_id':id}, {$set:{'totalSales':obj2.totalSales}}, {upsert:true}, (err4, res4)=>{
                                    if (err4){
                                        res.status(500).end();
                                        db.close();
                                    }
                                    else{
                                        db.close();
                                        res.status(200).send('Success').end();
                                    }
                            });
                        })
                        });
                    })
                }, err => {
                    console.warn("Couldn't connect to database: " + err)
                    res.status(500).end()
            });
    })
    
    //route to place an order for a sticker
    router.post('/market/orderSticker', (req,res)=>{
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
    
        //store the parameters
        const {color, quantity, cost, design, itemId, band, gig, address, merchType} = req.body;
        
        //connect to the db
        database.connect(db => {
            console.log("Got in database connect");
            //place the order in the mercg orders collection
            let market = db.db('market').collection('stickerOrders');
            market.insertOne({ 'owner': req.session.key,
             'date': new Date(),
               'color': color,
                'quantity': quantity,
                 'cost': cost,
                  'design': design,
                   'itemId':itemId,
                    'band': band,
                     'gig': gig,
                      'address': address,
                        'type':merchType,
                            'owner': req.session.key,
                                'date': new Date()
                                }, (err, obj) => {
                        if (err) {
                            console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                            res.status(500).end()
                        } 
                        //chrage the user for the preorder
                        chargeUser(req, cost, obj._id, (ourError)=>{
                            if(ourError){
                                console.log('We had an error chraging customer: ' + ourError);
                            }
                            //update the merch sale stats
                            let merch = db.db('market').collection('merch');
                            merch.findOne({ '_id': itemId}, (err, obj2) => {
                                console.log("Got in find one");
                                console.log(JSON.stringify(obj2));
                                if (err) {
                                    console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
                                    res.status(500).end()
                                }
                                ++obj2.totalSales;
                                merch.update({'_id':id}, {$set:{'totalSales':obj2.totalSales}}, {upsert:true}, (err4, res4)=>{
                                    if (err4){
                                        res.status(500).end();
                                        db.close();
                                    }
                                    else{
                                        db.close();
                                        res.status(200).send('Success').end();
                                    }
                            });
                        })
                        });
                    })
                }, err => {
                    console.warn("Couldn't connect to database: " + err)
                    res.status(500).end()
            });
    })
    
    
    router.post('/market/shipMerch', (req, res) =>{
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
    
        //store the parameters
        const {quantity, merchType} = req.body;
        //hoody, hat, sweatpants, tshirt, longSleeveShirt, sticker, poster
        if(merchType == 'hoody'){
            shipHoodies(quantity);
        }else if(merchTypee == 'hat'){
    
        }else if(merchType == 'sweatpants'){
    
        }else if(merchType == 'tshirt'){
    
        }else if(merchType ==  'longSleeveShirt'){
    
        }else if(merchType == 'sticker'){
    
        }else if(merchType == 'poster'){
    
        }
    
    })
    
    
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
    
    //ships the oldest orders of hoodies in the collection
    function shipHoodies(quantity){
        //if the user is not signed in
        if(!req.session.key){
            console.log('Non logged in user tried to post a band');
            res.status(400).end();
            return;
        }
    
        //if the request has no body 
        //change
        if (!req.body) {
                res.status(400).send('No body sent');
            return;
        }
    
        
        // //connect to the db
        // database.connect(db => {
        // 	console.log("Got in database connect");
        //     //place the order in the mercg orders collection
        //     let market = db.db('market').collection('hoodyOrders');
        //     market.find( (err, obj) => {
        //                 if (err) {
        //                     console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
        //                     res.status(500).end()
        //                 } 
        //                 //chrage the user for the preorder
                        
        // 	        })
        //         }, err => {
        // 	        console.warn("Couldn't connect to database: " + err)
        // 	        res.status(500).end()
        //     });
    }
    
    } /* end module.exports */
    