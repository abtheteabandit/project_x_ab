module.exports = router =>{

  const database = require ('../database'),
        matching = require('../algs/matching.js'),
        QRCODE = require('qrcode'),
        OUR_ADDRESS = "banda.confirmation@gmail.com";


  //request to make a cross promotion
  router.post('/cross_promote', (req, res)=>{
    //if the user does not have a session
    if (!req.session.key){
      console.log('No logged in user tried to cross promote');
      req.status(404).end();
    }
    //if the post request has no content
    if (!req.body){
      console.log('Cross promote had no body');
      req.status(401).end();
    }
    else{
      //get content of body
      var {promoterName, posterName, medias, promoName} =req.body;
      database.connect(db=>{
        //get the promoter from the db
        db.db('users').collection('users').findOne({'username':promoterName}, (err, promoter)=>{
          if (err){
            console.log('THere was an error finding the promoter user: ' + promoterName);
            res.status(500).end();
            db.close();
          }
          //success case
          else{
            console.log('Promoter User: ' + promoterName + ' is ' + JSON.stringify(promoter));
            //get the poster's of the promotions profile
            db.db('users').collection('users').findOne({'username':posterName}, (err2, poster)=>{
              if (err2){
                console.log('THere was an error finding the poster user: ' + posterName);
                res.status(500).end();
                db.close();
              }
              else{
                //if the promoter has the contact
                var posterKnowsPromoter = false;
                for (var contact in poster.contacts){
                  if (poster.contacts[contact]['name']==promoterName){
                    posterKnowsPromoter=true;
                  }
                }

                //make post to social
                if(posterKnowsPromoter){
                  res.status(200).send('Congratulations! We have posted this promotion to your selected socials. You should ask ' +promoterName+ ' to post one of your promotions. Just click the cross-promotion button next to ' +promoterName+ ' in your contact list. You must first create a promotion by clicking "promotions" if you have not already.')
                  //get promotion from poster
                  /*
                  for (var m in medias){
                    var mediaOn = medias[m];
                    if (mediaOn=='twitter'){

                    }
                    if (mediaOn=='facebook'){

                    }
                    if (mediaOn=='instagram'){

                    }
                  }
                  */
                  //ed code, post this promotion to posters selected socials
                }
                //if the promoter is not in the list, do not make the post
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

  //post request to add a mutual contact
  router.post('/add_mutual_contact', (req, res)=>{
    //if not session exists
    if (!req.session.key){
      console.log('No logged in user tried to cross promote');
      req.status(404).end();
    }

    //if no body exists
    if (!req.body){
      console.log('Cross promote had no body');
      req.status(401).end();
    }
    else{
      //store variables
      var {acceptorName, senderName} = req.body;
      database.connect(db=>{
        //get the acceptor's profile
        db.db('users').collection('users').findOne({'username':acceptorName}, (err, acceptor)=>{
          if (err){
            console.log("There was an error getting user: " + acceptorName + ' error: ' + err);
            res.status(500).end();
            db.close();
          }
          else{
            //get the senders profile
            db.db('users').collection('users').findOne({'username':senderName}, (err2, sender)=>{
              if (err2){
                console.log("There was an error getting user: " + senderName + ' error: ' + err2);
                res.status(500).end();
                db.close();
              }
              //success case
              else{
                var senderHasAcceptor = false;
                var acceptorHasSender = false;
                //check for contacts
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
                //if the two know eachother already
                if (senderHasAcceptor && acceptorHasSender){
                  console.log('One of the two parties in add mutual contacts knows eachother.');
                  res.status(200).send('Sorry, it seems that you and ' +senderName+ ' already have eachother in your contacts');
                  db.close();
                }
                //add to acceptor's contacts if need be
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
                //add to sender's contact if needed
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
                //add to both personsons contacts
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

router.post('/promotion', (req, res)=>{
  if (!req.session.key){
    console.log('No logged in user tried to cross promote');
    req.status(404).end();
  }
  if (!req.body){
    console.log('promotion had no body');
    req.status(401).end();
  }
  else{
    var {name, imgURL, caption, handles, location, mode, medias} = req.body;
    console.log('IN POST PROMO NAME IS: ' + name + ' and imgURL is: ' + imgURL);
    database.connect(db=>{
      db.db('promotions').collection('promotions').updateOne({'creator':req.session.key}, {$push:{'promotions':{'name':name, 'imgURL':imgURL, 'caption':caption, 'location':location, 'handles':handles, 'mode':mode, 'medias':medias}}}, {upsert:true}, (err2, res2)=>{
        if (err2){
          console.log('There was an error setting promotion: '+name+' for user: ' +req.session.key+' Error: ' + err2);
          res.status(500).end();
          db.close();
        }
        else{
          console.log('Set promotion ' +name+ ' for user: '+req.session.key);
          res.status(200).json({data:res2,message:'Congratulations, you have added this promotion to Banda! You can change what promotion you would like to use at anytime simply by changing the information here and clicking "save". To begin running this promo simply go to you contacts and hit the promotion button next to a names. If they accept it will be autmatically posted to their social medias.'});
        }
      });
    }, dbErr=>{
      console.log('There was an error connecting to mongo: ' + dbErr);
      res.status(500).end();
    });
  }
});

router.get('/search_promos', (req, res)=>{
  if (!req.session.key){
    console.log('No logged in user tried to cross promote');
    req.status(404).end();
  }
  if (!req.query){
    console.log('Cross promote had no body');
    req.status(401).end();
  }
  else{
    var {lat, lng, searchText} = req.query;
    database.connect(db=>{
      db.db('promotions').collection('promotions').findOne({'creator':req.session.key}, (err10, res10)=>{
        if (err10){
          console.log('There was an error finding promos for creator: '+creator +' error: ' + err10);
          res.status(200).json({success:false, data:'Sorry, there was an error on our end. Please try searching again. If this error persits please notify us via our support tab on the Banda "b"'});
          db.close();
        }
        else{
          if (res10==null){
            console.log('There was no promotions for creator: ' + req.session.key);
            res.status(200).json({success:false, data:'Sorry, you must create a promotion first to be able to search for promoters.'});
            db.close();
          }
          else{
            if(res10.promotions.length==0){
              console.log('There was no promotions for creator: ' + req.session.key);
              res.status(200).json({success:false, data:'Sorry, you must create a promotion first to be able to search for promoters.'});
              db.close();
            }
            else{
              var promoSearchingAs = res10.promotions[res10.promotions.length-1];
              matching.findCrossPromoters(req.session.key, promoSearchingAs, lat, lng, searchText, db, errCB=>{
                console.log('There was an error : ' + errCB);
                if (errCB=="Internal Server Error"){
                  res.status(200).json({success:false, data:'Sorry, there was an error on our end. Please try searching again. If this error persits please notify us via our support tab on the Banda "b"'});
                  db.close();
                }
                else{
                  res.status(500).json({success:false, data:errCB});
                  db.close();
                }
              }, okCB=>{
                console.log('Got in ok CB');
                res.status(200).json({success: true, data:okCB});
                db.close();
              });
            }
          }
        }
      });
    }, dbErr=>{
      console.log('There was an error connectiong to mongo: ' + dbErr);
      res.status(500).end();
    });
  }
});

router.post('/user_socials', (req, res)=>{
  if (!req.session.key){
    console.log('No logged in user tried to cross promote');
    req.status(404).end();
  }
  if (!req.body){
    console.log('promotion had no body');
    req.status(401).end();
  }
  else{
    var {id, mode, medias, imageURL, caption, handles, location} = req.body;
    database.connect(db=>{
      for (var key in medias){
        //post our thign to that media

      }
    }, errDB=>{
      console.log('There was an error connectiong to mongo: ' + errDB);
      res.status(500).end();
    });
  }
});

router.post('/add_pull', (req, res)=>{
  //this is the route that gets called from outside our site, such that our bands can quantify their clout.
  if (!req.body){
    console.log('request had no body');
    req.status(401).end();
  }
  else{
    var {id, mode} = req.body;
    database.connect(db=>{
      switch(mode){
        // adds 1 pull to a band, gig or user depending on what mode we recieved. That mode should be set in the route above
        case "bands":
        db.db('bands').collection('bands').updateOne({'_id':database.objectId(id)}, {$inc:{'pull':1}}, (err1, res1)=>{
          if (err1){
            console.log('There was an an error incrementing pull for band:: ' + err1);
            res.status(500).end();
            db.close();
          }
          else{
            console.log('Set promotion ' +name+ ' for user: '+req.session.key);
            res.redirect('/about');
            db.close();
          }
        });
        case "gigs":
        db.db('gigs').collection('gigs').updateOne({'_id':database.objectId(id)}, {$inc:{'pull':1}}, (err1, res1)=>{
          if (err1){
            console.log('There was an an error incrementing pull for band:: ' + err1);
            res.status(500).end();
            db.close();
          }
          else{
            console.log('Set promotion ' +name+ ' for user: '+req.session.key);
            res.redirect('/about');
            db.close();
          }
        });
        break;
        default:
        console.log('On recognized mode in pull.' + mode);
        res.status(404).end();
        db.close();
        break;
        }
      }, dbErr=>{
        console.log('There was an error connecting to mongo: ' + dbErr);
        res.status(500).end();
      });
    }
  });

  //post request to search for a promo
  router.get('/search_promos', (req, res)=>{
    if (!req.session.key){
      console.log('No logged in user tried to cross promote');
      req.status(404).end();
    }
    if (!req.query){
      console.log('Cross promote had no body');
      req.status(401).end();
    }
    //success case
    else{
      var {lat, lng, searchText} = req.query;
      database.connect(db=>{
        //match the cross promoters
        matching.findCrossPromoters(req.session.key, lat, lng, searchText, db, errCB=>{
          console.log('There was an error : ' + errCB);
          if (errCB=="Internal Server Error"){
            res.status(200).json({success:false, data:'Sorry, there was an error on our end. Please try searching again. If this error persits please notify us via our support tab on the Banda "b"'});
            db.close();
          }
          else{
            //no matchs
            res.status(500).json({success:false, data:errCB});
            db.close();
          }
        }, okCB=>{
          //matchs found
          console.log('Got in ok CB');
          res.status(200).json({success: true, data:okCB});
          db.close();
        });
      }, dbErr=>{
        console.log('There was an error connectiong to mongo: ' + dbErr);
        res.status(500).end();
      });
    }
  });

  //post request for social media
  router.post('/user_socials', (req, res)=>{
    if (!req.session.key){
      console.log('No logged in user tried to cross promote');
      req.status(404).end();
    }
    if (!req.body){
      console.log('promotion had no body');
      req.status(401).end();
    }
    else{
      var {id, mode, medias, imageURL, caption, handles, location} = req.body;
      database.connect(db=>{
        //post reqiest for each media
        for (var key in medias){
          //post our thign to that media

        }
      }, errDB=>{
        console.log('There was an error connectiong to mongo: ' + errDB);
        res.status(500).end();
      });
    }
  });

  //meethod for admins to take inventory on db
  router.post('/add_pull', (req, res)=>{
    //this is the route that gets called from outside our site, such that our bands can quantify their clout.
    if (!req.body){
      console.log('request had no body');
      req.status(401).end();
    }
    else{
      var {id, mode} = req.body;
      database.connect(db=>{
        switch(mode){
          // adds 1 pull to a band, gig or user depending on what mode we recieved. That mode should be set in the route above
          case "bands":
          db.db('bands').collection('bands').updateOne({'_id':database.objectId(id)}, {$inc:{'pull':1}}, (err1, res1)=>{
            if (err1){
              console.log('There was an an error incrementing pull for band:: ' + err1);
              res.status(500).end();
              db.close();
            }
            else{
              console.log('Incremented pull of band: ' + id);
              res.redirect('/about');
              db.close();
            }
          });
          break;
          case 'gigs':
          db.db('gigs').collection('gigs').updateOne({'_id':database.objectId(id)}, {$inc:{'pull':1}}, (err1, res1)=>{
            if (err1){
              console.log('There was an error incrementing pull for gig: ' + err1);
              res.status(500).end();
              db.close();
            }
            else{
              console.log('Incremented pull of gig: ' + id);
              res.redirect('/about');
              db.close();
            }
          });
          break;
          case 'users':
          db.db('users').collection('users').updateOne({'username':id}, {$inc:{'pull':1}}, (err1, res1)=>{
            if (err1){
              console.log('There was an error incrementing pull for user: ' + err1);
              res.status(500).end();
              db.close();
            }
            else{
              console.log('Incremented pull of user: ' + id);
              res.redirect('/about');
              db.close();
            }
          });
          break;
          default:
          console.log('No recognized mode in add_pull: ' + mode);
          res.status(401).end();
          db.close();
          break
        }
      }, errDB=>{
        console.log('There was an error connectiong to mongo: ' + errDB);
        res.status(500).end();
      })
    }
  });

  var fs  = require('fs');
  //route for a promoter to add a promotion that users can apply for through our website with a given code
  router.post('/createDiscountPromo', (req, res)=>{
    var {name, details, gigID, location, medias, promoID} = req.body;
    var code = createPromoCode();
      database.connect(db=>{
        //store the promotion in the database
        db.db('promotions').collection('discounts').insertOne({
          'details':details,
          'gigID':gigID,
          'code':code,
          'promoID':promoID}, (err2, res2)=>{
          if (err2){
            console.log('There was an error setting coupon: '+promoID+' for user: ' +req.session.key+' Error: ' + err2);
            res.status(500).end();
            db.close();
          }
          else{
            console.log('Set coupon with code ' +code+ ' for user: '+req.session.key);
            db.db('gigs').collection('gigs').findOne({'_id':database.objectId(gigID)}, (err4, theGig)=>{
              if (err4){
                console.log('There was an error fidning gig with id: ' + gigID + ' into db. Error: ' + err4);
                res.status(200).send('Hmmm... there was an error on our end. Please refresh your page and try again. If this problem persits let us know by emailing banda.help.cusotmers@gmail.com');
                db.close();
              }
              else{
                db.db('users').collection('users').findOne({'username':req.session.key},(err5, ourUser)=>{
                  if (err5){
                    console.log('There was an error fidning users: ' + req.session.key + ' in db. Error: ' + err5);
                    res.status(200).send('Hmmm... there was an error on our end. Please refresh your page and try again. If this problem persits let us know by emailing banda.help.cusotmers@gmail.com');
                    db.close();
                  }
                  else{
                   var data = "http://localhost:1600/customerQRCode";  // for testing
                  //  var data = 'https://banda-inc.com/customerQRCode?gigID='+gigID+'&code='+code
                    QRCODE.toDataURL(data, (err6, img)=>{
                      if (err6){
                        console.log('there was an error creating qr code for promo with ID: ' + promoID);
                        res.status(200).send('Hmmm...there was an error on our end. Please refresh your page and try again. If this problem persits let us know by emailing banda.help.cusotmers@gmail.com');
                        db.close();
                      }
                      else{
                        console.log('IMG ******************;::::::::::::::::::::::::::: is ;::::' + img);
                        var now = new Date().toString();
                        var cleanNow = now.replace(" ", "_");
                        var imgURL = 'http://localhost:1600/public/uploads/CouponQrs/'+code;
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
                           attachments : [{'path':img}],
                           from: OUR_ADDRESS, // our address
                           to: ourUser.email, // who we sending to
                           subject: "QR Coupon Code From Banda For "+theGig.name+"", // Subject line
                           text: "", // plain text body
                           html: "<div><h1>Hello, "+req.session.key+".</h1> Here is your QR code for the coupon you created for the event "+theGig.name+". You can print this page or set it up at your bar to let customers redeem their coupon. If a customer can display a page that says, '"+theGig.name+"\n Coupon Verified' it is from this coupon, as they can only display that page via entering the password they created through this promotion after scanning this QR Code. If you have any questions at all simply reply to this email. Enjoy the music and thank you for using Banda. —Your team at Banda.</div> <h1>QR Code Attached</h1>>"// html body
                        };

                        transporter.sendMail(mailOptions, (error, info) => {
                           if (error) {
                              console.log('There was an error sending the email: ' + error);
                              res.status(200).send('Hmmm...it seems there was an issue emailing the coupon QR Code to you. Please try again.');
                              db.close();
                           }

                           console.log('Message sent: ' + JSON.stringify(info));
                           console.log('mail options: ' + mailOptions.html)
                           res.status(200).send('Congratulations, you have created a coupon for your promotion! Check your email for the QRCODE you will need so coupon-cusomters can validate themselves at the time of the event. Now you can find promoters to post this coupon with our search feature below.');
                           db.close();
                         });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }, dbErr=>{
        console.log('There was an error connecting to mongo: ' + dbErr);
        res.status(500).end();
      });
  })

  //returns a random sequence of 7 characters
  function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;

    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

  //route for generating a discount code for a user from an existing promo code
  router.post('createDiscountCode', (req, res) => {
    var code = req.body.code;
    database.connect(db => {
      db.db('promotions').collection('discounts').find({'code': code}).toArray(function(err2, result) {
        if (err2){
          console.warn("Couldnt get gigs: " + err2);
          res.status(500).end();
          db.close();
        }
        else{
          //print and set values
          console.log(result);
          const customerCode = makeid(7)
          const code = result[0].code

          //store the customers code in the db with the promotion code to look up the promo later
          db.db('promotions').collection('customer_discounts').insertOne({
            'customerCode': customerCode,
            'code': code
          }, (err2, res2)=>{
            if (err2){
              console.log('There was an error setting promotion: '+name+' for user: ' +req.session.key+' Error: ' + err2);
              res.status(500).end();
              db.close();
            }
            else{
              //send the user the code to redeem their discount
              res.status(200).send({'customerCode': customerCode, 'code': code})
            }
          });
          res.status(200).send(result);
          db.close();
        }
      });
    }, err => {
      console.warn("Couldn't connect to database: " + err)
      res.status(500).end()
    });
  })

  //route to verify a customer's code with a code base in the promotionis db
  router.post('verifyAndReturnDiscount', (req, res) => {
    var code = req.body;
    database.connect(db => {
      //find the exact discount code using the customer code
      db.db('promotions').collection('customer_discounts').find({'customerCode': customerCode}).toArray(function(err2, result) {
        if (err2){
          console.warn("Couldnt get gigs: " + err2);
          res.status(500).end();
          db.close();
        }
        else{
          //print and set values
          console.log(result);
          const customerCode = result[0].customerCode
          const code = result[0].code

          //find and return the discount from the discount's code
          db.db('promotions').collection('discounts').find({'code': code}).toArray(function(err2, result) {
            if (err2){
              console.log('There was an error setting promotion: '+name+' for user: ' +req.session.key+' Error: ' + err2);
              res.status(500).end();
              db.close();
            }
            else{
              //send the full discount object to the user
              res.status(200).send(result[0]);
              db.close();
            }
          });
        }
      });
    }, err => {
      console.warn("Couldn't connect to database: " + err)
      res.status(500).end()
    });
  })

  router.get('/user_has_socials', (req, res)=>{
    if (!req.session.key){
      console.log('No logged in user tried to see if it has socials');
      req.status(404).end();
    }
    if (!req.query){
      console.log('user_has_socials had no query');
      req.status(401).end();
    }
    else{
      database.connect(db=>{
        db.db('users').collection('users').findOne({'username':req.session.key}, (err1, ourUser)=>{
          if (err1){
            console.log('there was an error finding user: ' + req.session.key+' Error: ' + err1);
            res.status(500).json({'success':false, 'data':null});
            db.close();
          }
          else{
            var socials = {'twitter':false, 'facebook':false, 'instagram':false, 'snapchat':false};
            if (ourUser.hasOwnProperty('twitter')){
              socials['twitter']=true;
            }
            if (ourUser.hasOwnProperty('facebook')){
              socials['facebook']=true;
            }
            if (ourUser.hasOwnProperty('instagram')){
              socials['instagram']=true;
            }
            if (ourUser.hasOwnProperty('snapchat')){
              socials['snapchat']=true;
            }
            res.status(200).json({'success':true, 'data':socials});
            db.close();
          }
        });
      }, dbErr=>{
        console.warn("Couldn't connect to database: " + err)
        res.status(500).json({'success':false, 'data':null});
      });
    }

  });

router.get('/aUserPromo', (req, res)=>{
  if (!req.session.key){
    console.log('No logged in user tried to see if it has socials');
    req.status(404).end();
  }
  if (!req.query){
    console.log('user_has_socials had no query');
    req.status(401).end();
  }
  else{
    var {creator} = req.query;
    if (!creator){
      creator = req.session.key;
    }
    database.connect(db=>{
      db.db('promotions').collection('promotions').findOne({'creator':creator}, (err2, res2)=>{
        if (err2){
          console.log('There was err2 getting a promo for creator: '+creator + err2);
          res.status(200).json({success:false, data:null});
          db.close();
        }
        else{
          if (res2==null){
            res.status(200).json({success:false, data:null});
            db.close();
            return
          }
          if (res2.promotions.length==0){
            res.status(200).json({success:false, data:null});
            db.close();
            return;
          }
          else{
            res.status(200).json({success:true, data:res2.promotions[0]});
            db.close();
          }
        }
      })
    }, dbErr=>{
      console.warn("Couldn't connect to database: " + err)
      res.status(200).json({'success':false, 'data':null});
    })
  }
});

function createPromoCode(){
  var x = Math.random();
  var y = Math.random();
  var code = Math.random(x).toString(36).replace('0.', '');
  code += "Zk!ks31l"
  code += Math.random(y).toString(36).replace('0.', '');
  console.log('Random Code: ' + code);
  return code;
}

function makeQRCode(mode, data, cbOk, cbErr){

}

router.get('/getContactRequests', (req, res)=>{
  if (!req.session.key){
    console.log('No logged in user tried to see if it has socials');
    req.status(404).end();
  }
  if (!req.query){
    console.log('user_has_socials had no query');
    req.status(401).end();
  }
  else{
    database.connect(db=>{
      db.db('users').collection('users').findOne({'username':req.session.key}, (err1, ourUser)=>{
        if (err1){
          console.log('There was an error getting user: ' + req.session.key + ' out of db: ' + err1);
          res.status(200).json({'success':false, 'data':null});
          db.close();
        }
        else{
          db.db('messages').collection('messages').find({'recieverID':ourUser._id}).toArray((err2, messages)=>{
            if (err2){
              console.log('there was an error getting our user: ' + req.session.key + " 's messgaes : " + err2);
              res.status(200).json({'success':false, 'data':null});
              db.close();
            }
            else{
              var requests = []
              for (var m in messages){
                var message = messages[m];
                console.log()
                console.log('******************************************************* message on: ' + JSON.stringify(message))
                if (message.body.includes('wants to connect with you')){
                  requests.push(message);
                }
              }
              res.status(200).json({'success':true, 'data':requests});
              db.close();
            }
          });
        }
      });
    }, errDB=>{
      console.warn("Couldn't connect to database: " + err)
      res.status(200).json({'success':false, 'data':null});
    });
  }
});
router.post('/askToPromote', (req, res)=>{
  if (!req.session.key){
    console.log('No logged in user tried to see if it has socials');
    req.status(404).end();
  }
  if (!req.body){
    console.log('user_has_socials had no query');
    req.status(401).end();
  }
  else{
    var {asker, promoter} = req.body;
    database.connect(db=>{
      db.db('promotions').collection('promotions').findOne({'creator':asker}, (err1, res1)=>{
        if (err1){
          console.log('There was an err getting promos for user: ' + asker + ' error: ' + err1);
          res.status(200).json({'success':false, 'data':null});
          db.close();
        }
        else{
          if (res1.hasOwnProperty('promotions')){
            if (res1.promotions==null){
              console.log('User: ' + asker + ' did nto have nay promos');
              res.status(200).json({'success':false, 'data':'Hmmm... there was an error on our end. Please refresh your page and try again. If this problem persits please let us know, via our support tab (from the banda "b")'});
              db.close();
            }
            else{
              if (res1.promotions.length==0){
                console.log('User: ' + asker + ' did nto have nay promos');
                res.status(200).json({'success':false, 'data':'Sorry, you must create a promotion to be able to cross promote. Just click "promotions" on your home page to get started.'});
                db.close();
              }
              else{
                var ourPromo = res1.promotions[res1.promotions.length-1];
                console.log('Our promo is: ' + ourPromo);
                db.db('users').collection('users').findOne({'username':promoter}, (err2, res2)=>{
                  if (err2){
                    console.log('There was an error finding our other user: ' +promoter+ ' error: ' + err2);
                    res.status(200).json({'success':false, 'data':'Hmmm... there was an error on our end. Please refresh your page and try again. If this problem persits please let us know, via our support tab (from the banda "b")'});
                    db.close();
                  }
                  else{
                    var conExists=false;
                    for (var con in res2.contacts){
                      if (asker==res2.contacts[con].name){
                        conExists=true
                      }
                    }
                    if (conExists){
                      console.log('All checks out procceeding with promo');
                      res.status(200).json({'success':true, 'data':ourPromo});
                      db.close();
                    }
                    else{
                      console.log('contact doesnt exist');
                      res.status(200).json({'success':false, 'data':'Sorry, it seems '+promoter+' does not have you in their contacts. You can ask them to connect by searching for them by username at the bottom of our promotions page. Just click "promotions" to get started.'});
                      db.close();
                    }
                  }
                });
              }
            }
          }
          else{
            console.log('User: ' + asker + ' did nto have nay promos');
            res.status(200).json({'success':false, 'data':'Hmmm... there was an error on our end. Please refresh your page and try again. If this problem persits please let us know, via our support tab (from the banda "b")'});
            db.close();
          }
        }
      });
    }, dbErr=>{
      console.warn("Couldn't connect to database: " + dbErr);
      res.status(200).json({'success':false, 'data':'Hmmm... there was an error on our end. Please refresh your page and try again. If this problem persits please let us know, via our support tab (from the banda "b")'});
    })
  }
});

router.get('/aPromo', (req, res)=>{
  if (!req.session.key){
    console.log('No logged in user tried to see if it has socials');
    req.status(404).end();
  }
  if (!req.query){
    console.log('user_has_socials had no query');
    req.status(401).end();
  }
  else{
    var {promoName, username} = req.query;
    database.connect(db=>{
      db.db('promotions').collection('promotions').findOne({'creator':username}, (err1, res1)=>{
        if (err1){
          console.log('THere was an error finding promos for user: ' + username + " error: " + err1);
          res.status(200).json({'success':false, 'data':'Hmmm... there was an error on our end. Please refresh your page and try again. If this problem persits please let us know, via our support tab (from the banda "b")'});
          db.close();
        }
        else{
          if (res1.hasOwnProperty('promotions')){
            if (res1.promotions==null){
              console.log('User: ' + username+ ' didnt have nay promos.');
              res.status(200).json({'success':false, 'data':'Sorry, you must create a promotion to be able to cross promote. Just click "promotions" on your home page to get started.'});
              db.close();
            }
            else{
              if (res1.promotions.length==0){
                console.log('User: ' + username+ ' didnt have nay promos.');
                res.status(200).json({'success':false, 'data':'Sorry, you must create a promotion to be able to cross promote. Just click "promotions" on your home page to get started.'});
                db.close();
              }
              else{
                var ourPromo = res1.promotions[res1.promotions.length-1];
                for (var p in res1.promotions){
                  if (res1.promotions[p].name==promoName){
                    ourPromo = res1.promotions[p];
                  }
                }
                res.status(200).json({'success':true, 'data': ourPromo});
                db.close();
              }
            }
          }
          else{
            console.log('User: ' + username+ ' didnt have nay promos.');
            res.status(200).json({'success':false, 'data':'Sorry, you must create a promotion to be able to cross promote. Just click "promotions" on your home page to get started.'});
            db.close();
          }
        }
      });
    }, dbErr=>{
      console.warn("Couldn't connect to database: " + dbErr);
      res.status(200).json({'success':false, 'data':'Hmmm... there was an error on our end. Please refresh your page and try again. If this problem persits please let us know, via our support tab (from the banda "b")'});
    });
  }
});
router.get('/couponFromSocial',(req,res)=>{
  //redirect to email page
  //res.redirect()
});
router.post('/sendQrCode', (req, res)=>{
  if (!req.body){
    res.status(403).end();
  }
  else{
    var {username} = req.body;

  }
});
router.get('/customerQRCode', (req, res)=>{
  console.log('Got a customer using a qr code');
  res.render('customerQRCode.html');
})
} //end of exports
