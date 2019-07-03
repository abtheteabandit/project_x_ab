module.exports = router =>{

  const database = require ('../database'),
        matching = require('../algs/matching.js'),
        QRCODE = require('qrcode'),
        OUR_ADDRESS = "banda.confirmation@gmail.com";

  var passwordHash = require('password-hash')
  var passwordValidator = require('password-validator');
  var validator = require("email-validator");
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
      var {promoterName, posterName, medias, promoID} =req.body;
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
                  //res.status(200).send('Congratulations! We have posted this promotion to your selected socials. You should ask ' +promoterName+ ' to post one of your promotions. Just click the cross-promotion button next to ' +promoterName+ ' in your contact list. You must first create a promotion by clicking "promotions" if you have not already.')
                  db.db('promotions').collection('promotions').findOne({'_id':database.objectId(promoID)}, (err5, ourPromo)=>{
                    if (err5){
                      console.log('There as an error trying to find promo: ' + promoID+ ' error was: ' + err5);
                      res.status(500).end();
                      db.close();
                    }
                    else{
                      if (!ourPromo){
                        console.warn('WATCH OUT SOMEONE MAY BE TRYING TO HACK BANDA. Our promo: ' + promoID + ' was null even though we got through four checks. Names: ' +promoterName + ' is sketch as is, more so the second one: ' + posterName );
                        res.status(200).send('Sorry, it seems that ' + promoterName + ' accidently sent you a promtoion to post that he/she does not have access to. Please ignore this request.');
                        db.close();
                      }
                      else{
                        db.db('promotions').collection('discounts').findOne({'promoID':promoID}, (err6, ourCoupon)=>{
                          if (err6){
                            console.log('There was an error fidning a coupon wit promoID: ' + promoID);
                            res.status(500).end();
                            db.close();
                          }
                          var wantsTwitter = false;
                          var twitterOk = false;
                          var facebookOk = false;
                          var wantsFB = false;
                          var wantsInstagram = false;
                          if (ourCoupon){
                            //there is a coupon
                            console.log('We have a coupon with this promo: ' + promoID);

                            for (var m in medias){
                              var mediaOn = medias[m];
                              if (mediaOn=='twitter'){
                                wantsTwitter=true;
                                if (poster.hasOwnProperty('twitter')){
                                  if (poster.twitter.hasOwnProperty('access_token')){
                                    if (poster.twitter.hasOwnProperty('token_secret')){
                                      if (!(poster.twitter.access_token == null || poster.twitter.token_secret==null)){
                                        twitterOk=true;
                                      }
                                    }
                                  }
                                }
                              }
                              if (mediaOn=='facebook'){
                                var mediaOn = medias[m];
                                  wantsFB=true;
                                  if (poster.hasOwnProperty('facebook')){
                                    if (poster.facebook.hasOwnProperty('access_token')){
                                      if (poster.facebook.hasOwnProperty('token_secret')){
                                        if (!(poster.facebook.access_token == null || poster.facebook.token_secret==null)){
                                          facebookOk=true;
                                        }
                                      }
                                    }
                                  }
                              if (mediaOn=='instagram'){
                                wantsInstagram=true;

                              }
                            }
                          }
                          var data = {'twitter':{'wanted':wantsTwitter, 'ok':twitterOk}, 'facebook':{'wanted':wantsFB, 'ok':facebookOk}, 'instagram':{'wants':wantsInstagram, 'ok':false}, 'coupon':ourCoupon, 'promo':ourPromo};
                          res.status(200).json({'success':true, 'data':data});
                          db.close();
                        }
                          else{
                            //there is not a coupon
                            console.log('We do not have a coupon with this promo: ' + promoID);

                            for (var m in medias){
                              var mediaOn = medias[m];
                              if (mediaOn=='twitter'){
                                wantsTwitter=true;s
                                if (poster.hasOwnProperty('twitter')){
                                  if (poster.twitter.hasOwnProperty('access_token')){
                                    if (poster.twitter.hasOwnProperty('token_secret')){
                                      if (poster.twitter.access_token == null || poster.twitter.token_secret==null){
                                        twitterOk=true;
                                      }
                                    }
                                  }
                                }
                              }
                              if (mediaOn=='facebook'){
                                var mediaOn = medias[m];
                                if (mediaOn=='twitter'){
                                  wantsFB=true;
                                  if (poster.hasOwnProperty('facebook')){
                                    if (poster.facebook.hasOwnProperty('access_token')){
                                      if (poster.facebook.hasOwnProperty('token_secret')){
                                        if (poster.facebook.access_token == null || poster.facebook.token_secret==null){
                                          facebookOk=true;
                                        }
                                      }
                                    }
                                  }
                              }
                            }
                              if (mediaOn=='instagram'){
                                wantsInstagram=true;
                              }
                            }
                            var data = {'twitter':{'wanted':wantsTwitter, 'ok':twitterOk}, 'facebook':{'wanted':wantsFB, 'ok':facebookOk}, 'instagram':{'wants':wantsInstagram, 'ok':false}, 'coupon':null, 'promo':ourPromo};
                            res.status(200).json({'success':true, 'data':data});
                            db.close();

                            //ed code, post this promotion to posters selected socials, post a combination of cuopon shit and promo shit

                          }
                        });
                      }
                    }
                  });

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
      db.db('promotions').collection('promotions').insertOne({'creator':req.session.key, 'name':name, 'imgURL':imgURL, 'caption':caption, 'location':location, 'handles':handles, 'mode':mode, 'medias':medias}, (err2, res2)=>{
        if (err2){
          console.log('There was an error setting promotion: '+name+' for user: ' +req.session.key+' Error: ' + err2);
          res.status(500).end();
          db.close();
        }
        else{
          console.log('Set promotion ' +name+ ' for user: '+req.session.key);
          res.status(200).json({data:res2, message:'Congratulations, you have added this promotion to Banda! You can change what promotion you would like to use at anytime simply by changing the information here and clicking "save". To begin running this promo simply go to you contacts and hit the promotion button next to a names. If they accept it will be autmatically posted to their social medias.'});
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
      db.db('promotions').collection('promotions').find({'creator':req.session.key}).toArray((err10, res10)=>{
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
            if(res10.length==0){
              console.log('There was no promotions for creator: ' + req.session.key);
              res.status(200).json({success:false, data:'Sorry, you must create a promotion first to be able to search for promoters.'});
              db.close();
            }
            else{
              var promoSearchingAs = res10[res10.length-1];
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

  //post request to search for a promo

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

  //route for a promoter to add a promotion that users can apply for through our website with a given code
  router.post('/createDiscountPromo', (req, res)=>{
    var {name, details, gigID, location, medias, promoID} = req.body;
    console.log('$$$*$*$*$*$*$*$*$*$*$ got promo ID: ' + promoID);
    var code = createPromoCode();
      database.connect(db=>{
        //store the promotion in the database
        db.db('promotions').collection('discounts').updateOne({'promoID':promoID},{$set:{
          'details':details,
          'gigID':gigID,
          'code':code,
          'promoID':promoID}}, {upsert:true}, (err2, res2)=>{
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
                   var data = "http://localhost:1600/customerQRCode?promoID="+promoID+"&gigID="+gigID;  // for testing
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
    console.log('aUserPromo had no query');
    req.status(401).end();
  }
  else{
    var {creator} = req.query;
    if (!creator){
      creator = req.session.key;
    }
    database.connect(db=>{
      db.db('promotions').collection('promotions').find({'creator':creator}).toArray((err2, res2)=>{
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
          if (res2.length==0){
            res.status(200).json({success:false, data:null});
            db.close();
            return;
          }
          else{
            console.log('Got promos');
            res.status(200).json({success:true, data:res2});
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
    console.log('getContactRequests had no query');
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
    var {asker, promoter, promoID} = req.body;
    database.connect(db=>{
      db.db('promotions').collection('promotions').findOne({'_id':database.objectId(promoID)}, (err1, ourPromo)=>{
        if (err1){
          console.log('There was an err getting promos for user: ' + asker + ' error: ' + err1);
          res.status(200).json({'success':false, 'data':null});
          db.close();
        }
        else{
            if (ourPromo==null){
              console.log('User: ' + asker + ' did nto have nay promos');
              res.status(200).json({'success':false, 'data':'Hmmm... there was an error on our end. Please refresh your page and try again. If this problem persits please let us know, via our support tab (from the banda "b")'});
              db.close();
            }
            else{
                console.log('Our promo is: ' + JSON.stringify(ourPromo));
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
    var {promoID, username} = req.query;
    database.connect(db=>{
      db.db('promotions').collection('promotions').findOne({'_id':database.objectId(promoID)}, (err1, ourPromo)=>{
        if (err1){
          console.log('THere was an error finding promos for user: ' + username + " error: " + err1);
          res.status(200).json({'success':false, 'data':'Hmmm... there was an error on our end. Please refresh your page and try again. If this problem persits please let us know, via our support tab (from the banda "b")'});
          db.close();
        }
        else{
            if (ourPromo==null){
              console.log('User: ' + username+ ' didnt have nay promos.');
              res.status(200).json({'success':false, 'data':'Sorry, you must create a promotion to be able to cross promote. Just click "promotions" on your home page to get started.'});
              db.close();
            }
            else{
                res.status(200).json({'success':true, 'data': ourPromo});
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
router.get('/customerQRCode', (req, res)=>{
  console.log('Got a customer using a qr code');
  res.render('customerQRCode.html');
})

router.post('/couponRegister', (req, res)=>{
  if (!req.body){
    console.log('No req body in couponRegister');
    res.status(403).end();
  }
  if (req.session.key) {
    console.info(`User ${req.session.key} from ${req.ip} attempted to register whilst logged in`);
    req.session.key=req.session.key
    res.status(200).send('Already logged in');
    return;
  }

  else{
    var {username, email, password, confirm_password, promoID} = req.body;
    if (!promoID){
      res.status(403).end();
    }
  	console.log("GOT user name, email and passowrd they are: " + username + " " + email + " " + password + " " + confirm_password);
    if(password != confirm_password){
  	  res.status(200).send('Passwords do not match')
  		return;
  	}
    if (!username) {
  		return res.status(400).send('No username supplied')
  	} else if (!password) {
  		return res.status(400).send('No password supplied')
  	} else if (!email) {
  		return res.status(400).send('No email supplied')
  	}
    if(!validator.validate(email)){
  		console.log("password is not valid")
  	  res.status(200).send('Please enter a valid email').end();
  		return;
  	}
    if (validatePassword(password) == false) {
  		console.log("password is not valid")
  	  res.status(200).send('Your password must contain atleast 8 characters, a number, a lower case character, an upper case character, and no spaces').end();
  		return;
  	}
    else{
      password = hashPassword(password);
      database.connect(db=>{
        db.db('users').collection('users').findOne({ $or: [{'email': email}, {'username': username}]}, (err1, user)=>{
          if (err1){
            console.log('There wsa an error fidning user with username: ' + username + ' Error: ' + err1);
            res.status(500).end();
            db.close();
          }
          else{
            if (user){
              console.log('That username or email already exists sending that info back.')
      				res.status(200).send('Username or email already exists');
              db.close();
            }
            else{
              db.db('users').collection('users').insertOne({ email: email, username: username, password: password, contacts:[]}, (err2, obj) => {
      					if (err2) {
      						console.error(`Register request from ${req.ip} (for ${username}, ${email}, ${password}) returned error: ${err}`);
      						res.status(200).send('Sorry, there was an error on our end creating your account. Please refresh and try again.  If this problem persists please email banda.customers.help@gmail.com.');
      						db.close();
      					}
                else {
      						//booth code, testing how to store usernames in sessions//
      						req.session.key = username;
      						console.log('Req session key after inserting user for register is: ' + req.session.key);
                  db.db('promotions').collection('discounts').updateOne({'promoID':promoID},{$push:{'users':{'username':username, 'password':password}}}, (err3, coupon)=>{
                    if (err3){
                      console.log('There was an error finding coupon with promoID: ' + promoID);
                      res.status(200).send('You have signed up, however we could not find the coupon for this event. Please try to login on this page and try again. If this problem persists please email banda.customers.help@gmail.com.');
                      db.close();
                    }
                    else{
                      console.log('Instered user: ' + username + ' into coupon with promoID: ' + promoID);
                      db.db('gigs').collection('gigs').findOne({'_id':database.objectId(coupon.gigID)}, (err4, theGig)=>{
                        if (err4){
                          console.log('error finding gig with id: ' + coupon.gigID + ' Error: ' + err4);
                          res.status(200).send('You have signed up, however we could not find the event for this coupon. Please try to login on this page and try again. If this problem persists please email banda.customers.help@gmail.com.');
                          db.close();
                        }
                        else{
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
                             from: OUR_ADDRESS, // our address
                             to: email, // who we sending to
                             subject: "Coupon From Banda For "+theGig.name+"", // Subject line
                             text: "", // plain text body
                             html: "<div><h1>Hello, "+username+".</h1> Here is your code for the coupon for the event "+theGig.name+".<h3>Verfied: </h3> \n -----------------  ACCEPTED COUPON FOR "+theGig.name+" FROM BANDA  -----------------  You will need to scan the qr code at the event and enter your username and password to verify this coupon. We do this to ensure there are no fradulant transactions. \n Enjoy the music and thank you for using Banda. \n —Your team at Banda.</div>"// html body
                          };

                          transporter.sendMail(mailOptions, (error, info) => {
                             if (error) {
                                console.log('There was an error sending the email: ' + error);
                                res.status(200).send('Hmmm...it seems there was an issue emailing the coupon to you. Please login and try again.');
                                db.close();
                             }
                             console.log('Message sent: ' + JSON.stringify(info));
                             console.log('mail options: ' + mailOptions.html)
                             res.status(200).send('Congratulations, you have been emailed a coupon code for this coupon! At the event, '+theGig.name+', you should look for a qr code to scan it may be printed and posted somewhere or avaible to you in some fashion. This code will direct you to a page, on which you should enter your username and password. Which will then show an accepted page. Show this page to the bartender or event manager and have them press the "use" button to redeem this coupon. Keep checking www.banda-inc.com for new features, exclusive events, coupons and much, much more! If you are an artist, venue owner, promoter, studio owner, or in the music-industry in any way, please contact our support team (banda.cusotmers.help@gmail.com) to find out how we can help your career or business!');
                             db.close();
                           });
                        }
                      });
                    }
                  });
      					}
      				});
            }
          }
        });
      }, dbErr=>{
        console.warn("Couldn't connect to database: " + dbErr);
        res.status(500).end();
      });
    }
  }
});
router.post('/couponLogin', (req,res)=>{
  if (req.session.key) {
		console.info(`User ${req.session.key} from ${req.ip} attempted to login whilst logged in`);
		req.session.key = req.session.key;
	  res.status(402).send('Already logged in').end();
	}
  if (!req.body){
    res.status(403).end();
  }
  else{
    var {username, password, promoID} = req.body;
  	console.log("////////////////////////////////////////////////////////////////////////////////////");
  	console.log("GOt username it is : " + username);
  	console.log(" ");
  	console.log("////////////////////////////////////////////////////////////////////////////////////");
  	console.log("GOt password it is : " + password);
  	console.log(" ");
  	if (!username) {
  	  res.status(200).send('No username supplied')
  	} else if (!password) {
  	  res.status(200).send('No password supplied')
  	}
    database.connect(db => {
  		console.log("Got in database connect");
  		//find the user in the db
  		db.db('users').collection('users').findOne({'username': username}, (err, obj) => {
  			console.log("Got in find one");
  			console.log(JSON.stringify(obj));
  			if (err) {
  				console.error(`Login request from ${req.ip} (for ${username}) returned error: ${err}`)
  				res.status(500).end()
  			} else if (!obj) {
  				console.log('No user with that username');
  				res.status(200).send('Hmmm...It seems there is no user with that username on record, please try again.')

  			} else {
          if(passwordHash.verify(password, obj.password)){
            var hashedPass = hashPassword(password)
            db.db('promotions').collection('discounts').findOneAndUpdate({'promoID':promoID}, {$push:{'users':{'username':username, 'password':hashedPass}}}, (err4, data)=>{
              if (err4){
                req.session.key=null;
                console.log('There was an error finding promo for this promo: ' + promoID + err4);
                res.status(200).send('Sorry, there we could not find a coupon for this link. Please refresh your page and try again. If this problem perists please email banda.customers.help@gmail.com to speak with our 24/7 support team.');
                db.close();
              }
              else{
                var coupon = data.value;
                console.log('//')
                console.log('COUPON: ' + JSON.stringify(coupon));
                console.log('gig id form cop is: ' + coupon.gigID);
                db.db('gigs').collection('gigs').findOne({'_id':database.objectId(coupon.gigID)}, (err5, theGig)=>{
                  if (err5){
                    req.session.key=null;
                    console.log('There was an error finding promo for this promo: ' + coupon.gigID + err5);
                    res.status(200).send('Sorry, there we could not find an event for this coupon. Please refresh your page and try again. If this problem perists please email banda.customers.help@gmail.com to speak with our 24/7 support team.');
                    db.close();
                  }
                  else{
            					console.log("////////////////////////////////////////////////////////////////////////////////////");
            					req.session.key = username;
            					console.log('In the login, just made the session key from obj key and it is: ' + req.session.key);
                      var email = obj.email;
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
                         from: OUR_ADDRESS, // our address
                         to: email, // who we sending to
                         subject: "Coupon From Banda For "+theGig.name+"", // Subject line
                         text: "", // plain text body
                         html: "<div><h1>Hello, "+username+".</h1> Here is your code for the coupon for the event "+theGig.name+".<h3>Verfied: </h3> \n -----------------  ACCEPTED COUPON FOR "+theGig.name+" FROM BANDA  -----------------  You will need to scan the qr code at the event and enter your username and password to verify this coupon. We do this to ensure there are no fradulant transactions. \n Enjoy the music and thank you for using Banda. \n —Your team at Banda.</div>"// html body
                      };

                      transporter.sendMail(mailOptions, (error, info) => {
                         if (error) {
                            console.log('There was an error sending the email: ' + error);
                            res.status(200).send('Hmmm...it seems there was an issue emailing the coupon to you. Please refresh your page and try again.');
                            db.close();
                         }
                         console.log('Message sent: ' + JSON.stringify(info));
                         console.log('mail options: ' + mailOptions.html)
                         res.status(200).send('Congratulations, you have been emailed a coupon code for this coupon! At the event, '+theGig.name+', you should look for a qr code to scan it may be printed and posted somewhere or avaible to you in some fashion. This code will direct you to a page, on which you should enter your username and password. Which will then show an accepted page. Show this page to the bartender or event manager and have them press the "use" button to redeem this coupon. Keep checking www.banda-inc.com for new features, exclusive events, coupons and much, much more! If you are an artist, venue owner, promoter, studio owner, or in the music-industry in any way, please contact our support team (banda.cusotmers.help@gmail.com) to find out how we can help your career or business!');
                         db.close();
                       });
                  }
                });
              }
            });
          }
          else{
            console.log('got in else meaning passwordhas veirfy returned false for username: ' + username + 'passowrd: ' + password)
            res.status(200).send('Not a valid login')
            db.close();
          }
        }
  		});
  	}, err => {
  		console.warn("Couldn't connect to database: " + err)
  		res.status(500).end()
  	});
  }
});

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

function hashPassword(password) {
	password = passwordHash.generate(password);
	return password;
}
router.get('/discounts', (req, res)=>{
  database.connect(db=>{
    db.db('promotions').collection('discounts').find({}).toArray((err2, res2)=>{
      if (err2){
        console.log('**%**@#**@#$(*$*$**) error: ' + err2);
        res.status(500).end();
        db.close();
      }
      else{
        console.log('DISOCUNTS: ' + JSON.stringify(res2));
        res.status(200).json(res2);
        db.close();
      }
    });
  }, err=>{
    res.status(500).end();
  });
});
router.post('/applyCoupon', (req, res)=>{
  if (!req.body){
    console.log('No req body in apply coupon.');
    res.status(401).end();
  }
  else{
    var {promoID, username, password} = req.body;
    if ((!promoID) || (!username) || (!password)){
      console.log('Missing a required field in applyCoupon');
      res.status(401).end();
    }
    else{
      database.connect(db=>{
        db.db('promotions').collection('discounts').findOne({'promoID':promoID}, (err1, promo)=>{
          if (err1){
            console.log('There was an error trying to find promo: ' + promoID + ' Error: ' + err1);
            res.status(200).json({'success':false, 'data':'Sorry, we could not find a coupon for this link. Please refresh and try again or email our customer support team at banda.customers.help@gmail.com. We have real people live to help 24/7. Sorry for this inconvience. '});
            db.close();
          }
          else{
            if (promo==null){
              console.log('There was an error trying to find promo ---- was null.');
              res.status(200).json({'success':false, 'data':'Sorry, we could not find a coupon for this link. Please refresh and try again or email our customer support team at banda.customers.help@gmail.com. We have real people live to help 24/7. Sorry for this inconvience. '});
              db.close();
            }
            else{
              if (promo.hasOwnProperty('users')){
                if (promo.users==null){
                  console.log('No users signed up for promo: ' + promoID);
                  res.status(200).json({'success':false, 'data':'Sorry, it seems you are not registered for this coupon. Check www.banda-inc.com regularly to find coupons, exclusive events, amazing bands and much, much more. We constanly release awesome updates. If you are a artist, venue owner, promoter or in the music industry in anyway Banda is your home! \n---Enjoy the music'});
                  db.close();
                }
                else{
                  if (promo.users.length==0){
                    console.log('No users signed up for promo: ' + promoID);
                    res.status(200).json({'success':false, 'data':'Sorry, it seems you are not registered for this coupon. Check www.banda-inc.com regularly to find coupons, exclusive events, amazing bands and much, much more. We constanly release awesome updates. If you are a artist, venue owner, promoter or in the music industry in anyway Banda is your home! \n---Enjoy the music'});
                    db.close();
                  }
                  else{
                    var ourUser=null;
                    for (var u in promo.users){
                      var user = promo.users[u];
                      if (user.username==username){
                        ourUser=user;
                      }
                    }
                    if(ourUser){
                      if(passwordHash.verify(password, user.password)){
                        if (ourUser.used){
                          console.log('User: ' + username + ' already used the coupon for promo: ' + promoID);
                          res.status(200).json({'success':true, 'data':'Sorry, it seems you have already used this coupon. Check www.banda-inc.com regularly to find coupons, exclusive events, amazing bands and much, much more. We constanly release awesome updates. If you are a artist, venue owner, promoter or in the music industry in anyway Banda is your home! \n---Enjoy the music'});
                          db.close();
                        }
                        else{
                          console.log('Valid user: ' + username + ' for coupon with promo: ' + promoID);
                          res.status(200).json({'success':true, 'data':'valid'});
                          db.close();
                        }
                      }
                      else{
                        console.log('User: ' + username + ' did sign up for coupon. But password: ' + password + ' was incorrect.');
                        res.status(200).json({'success':true, 'data':'Sorry, it seems '+username+' is registered for this coupon, but the password you supplied is incorrect, please try again. Thank you!'});
                        db.close();
                      }
                    }
                    else{
                      console.log('User: ' + username + ' did not sign up for coupon.');
                      res.status(200).json({'success':true, 'data':'Sorry, it seems you are not registered for this coupon. Check www.banda-inc.com regularly to find coupons, exclusive events, amazing bands and much, much more. We constanly release awesome updates. If you are a artist, venue owner, promoter or in the music industry in anyway Banda is your home! \n---Enjoy the music'});
                      db.close();
                    }
                  }
                }
              }
              else{
                console.log('No users signed up for promo: ' + promoID);
                res.status(200).json({'success':false, 'data':'Sorry, it seems you are not registered for this coupon. Check www.banda-inc.com regularly to find coupons, exclusive events, amazing bands and much, much more. We constanly release awesome updates. If you are a artist, venue owner, promoter or in the music industry in anyway Banda is your home! \n---Enjoy the music'});
                db.close();
              }
            }
          }
        });
      }, dbErr=>{
        console.log('There was an error connecting to mogno: ' + dbErr);
        res.status(500).end();
      })
    }
  }
})

router.post('/useCoupon', (req, res)=>{
  if (!req.body){
    console.log('no body use coupon');
    res.status(401).end();
  }
  else{
    var {username, promoID} = req.body;
    if ((!username) || (!promoID)){
      console.log('missing a field');
      res.status(401).end();
    }
    else{
      database.connect(db=>{
        db.db('promotions').collection('discounts').findOne({'promoID':promoID}, (err1, coupon)=>{
          if (err1){
            console.log('There was an error finding coupon with promoid: ' + promoID);
            res.status(500).end();
            db.close();
          }
          else{

            if (coupon.hasOwnProperty('users')){
              if (coupon.users==null){
                console.warn('Someone might be trying to HACK BANDA username: ' + username +' this user clicekd use coupon for a discount with no registered users.');
                res.status(200).send('invalid');
                db.close();
              }
              else{
                if (coupon.users.length==0){
                  console.warn('Someone might be trying to HACK BANDA username: ' + username +' this user clicekd use coupon for a discount with no registered users.');
                  res.status(200).send('invalid');
                  db.close();
                }
                else{
                  var ourUser = null;
                  var couponUsers = [];
                  for (var u in coupon.users){
                    if (coupon.users[u].username==username){
                      ourUser=coupon.users[u];
                      ourUser['used']=true;
                      couponUsers.push(ourUser);
                    }
                    else{
                      couponUsers.push(coupon.users[u]);
                    }
                  }
                  if (ourUser){
                    db.db('promotions').collection('discounts').updateOne({'promoID':promoID}, {$set:{'users':couponUsers}}, (err6, res6)=>{
                      if (err6){
                        console.log('There was an error tryign to set used for user: ' + username+ ' for coupon with promoID: ' + promoID + err6);
                        res.status(200).send('Congratulations! We have noted that you have used this coupon. Keep checking www.banda-inc.com for exclusive events, deals and artists. We add new features all the time. Thank you for being a part of the movement and keep Banding Together! \n---Enjoy the music');
                        db.close();
                      }
                      else{
                        res.status(200).send('Congratulations! We have noted that you have used this coupon. Keep checking www.banda-inc.com for exclusive events, deals and artists. We add new features all the time. Thank you for being a part of the movement and keep Banding Together! \n---Enjoy the music');
                        db.close();
                      }
                    })
                  }
                  else{
                    console.warn('Someone might be trying to HACK BANDA username: ' + username +' this user clicekd use coupon for a discount with no registered users.');
                    res.status(200).send('invalid');
                    db.close();
                  }
                }
              }
            }
            else{
              console.warn('Someone might be trying to HACK BANDA username: ' + username +' this user clicekd use coupon for a discount with no registered users.');
              res.status(200).send('invalid');
              db.close();
            }

          }
        })
      }, dbErr=>{
        console.log('There was an error connecting to mogno: ' + dbErr);
        res.status(500).end();
      })
    }
  }
});

router.post('/pull', (req,res)=>{
  if (!req.session.key){
    console.log('Non logged in user tried to add pull.');
    res.status(404).end();
  }
  if (!req.body){
    console.log('add pull--no body in req');
    res.status(401).end();
  }
  else{
    var {id, mode, name, caption, medias} = req.body;
    if (!(mode== 'bands'|| mode=='gigs')){
      console.warn("non-recogonized mode: " + mode + ' BANDA MIGHT BE GETTING HACKED by user: ' + req.session.key);
      res.status(401).end();
    }
    else{
      var link = 'https://www.banda-inc.com/add_pull?mode='+mode+'&id='+id
      var postableCaption = caption + '\n You can help '+name+' by clicking on this link: \n'+link
      var imgURL = 'https://www.banda-inc.com/static/assets/Promo/bandapromo1.2.png';
      database.connect(db=>{
        db.db('users').collection('users').findOne({'username':req.session.key}, (err1, ourUser)=>{
          if (err1){
            console.log('There was an error finding user: ' + req.session.key+ ' Error: ' + err1);
            res.status(500).end();
          }
          else{

            // ourUser should contain tokens and such
            console.log('Our User in post to pull: ' + JSON.stringify(ourUser));

            medias.forEach(function(media){
              if (media=='twitter'){
                //post to twitter
                //Ed

              }
              if (media=='facebook'){
                //post to Facebook


              }
            });

            //move this inward later putting it here for testing purposes rn
            res.status(200).send('Congratulations! We have posted this "Add Pull" to your selected social medias! ');
          }
        });
      }, dbErr=>{
        console.log('There was an error connecting to mogno: ' + dbErr);
        res.status(500).end();
      });

    }
  }
});
router.get('/userSocialData', (req,res)=>{
  if (!req.session.key){
    console.log('No logged in user tried to find pull.');
    res.status(401).end();
  }
  if (!req.query){
    console.log('No query in a user pull');
    res.status(401).end();
  }
  else{
    var {username}=req.query;
    if(!username){
      username=req.session.key;
    }
    database.connect(db=>{
      db.db('users').collection('users').findOne({'username':username}, (err1, ourUser)=>{
        if (err1){
          console.log('There was an error finding user: ' + username+ ' Error: ' + err1);
          res.status(200).json({'success':false, 'data':'none'});
        }
        else{
          var pull = 0;
          if(ourUser.hasOwnProperty('pull')){
            pull=ourUser.pull;

          }
          else{
            var totalFollowers = 0;
            var totalEngament = 0;
            var socialsEngUsed = 0;
            if (ourUser.hasOwnProperty('twitter')){
              if (ourUser.twitter.hasOwnProperty('followers')){
                totalFollowers+=ourUser.twitter.followers;
              }
              if (ourUser.twitter.hasOwnProperty('engagment')){
                totalEngament+=ourUser.twitter.engagment;
                socialsEngUsed+=1;
              }
            }
            if (ourUser.hasOwnProperty('facebook')){
              if (ourUser.facebook.hasOwnProperty('followers')){
                totalFollowers+=ourUser.facebook.followers;
              }
              if (ourUser.facebook.hasOwnProperty('engagment')){
                totalEngament+=ourUser.facebook.engagment;
                socialsEngUsed+=1;
              }
            }
            if (ourUser.hasOwnProperty('instagram')){
              if (ourUser.instagram.hasOwnProperty('followers')){
                totalFollowers+=ourUser.instagram.followers;
              }
              if (ourUser.instagram.hasOwnProperty('engagment')){
                totalEngament+=ourUser.instagram.engagment;
                socialsEngUsed+=1;
              }
            }
            if (ourUser.hasOwnProperty('snapchat')){
              if (ourUser.snapchat.hasOwnProperty('followers')){
                totalFollowers+=ourUser.snapchat.followers;
              }
              if (ourUser.snapchat.hasOwnProperty('engagment')){
                totalEngament+=ourUser.snapchat.engagment;
                socialsEngUsed+=1;
              }
            }
            if (socialsEngUsed==0){
              eng = 0;
            }
            else{
              var eng = totalEngament/socialsEngUsed;
            }
            res.status(200).json({'success':true, 'data':{'pull':ourUser.pull, 'engament':eng, 'followers':totalFollowers}});
            db.close();
          }
        }
      })
    }, dbErr=>{
      console.log('There was an error connecting to mogno: ' + dbErr);
      res.status(500).end();
    })

  }
});

router.get('/bandPull', (req,res)=>{
  if (!req.session.key){
    console.log('No logged in user tried to find bandpull.');
    res.status(401).end();
  }
  if (!req.query){
    console.log('No query in a band pull');
    res.status(401).end();
  }
  else{
    var {id} = req.query;
    database.connect(db=>{
      db.db('bands').collection('bands').findOne({'_id':database.objectId(id)}, (err1, ourBand)=>{
        if (err1){
          console.log('There was an error fidnig band with id: ' + id+ ' Error: '+err1);
          res.status(200).json({'success':false, 'data':'none'});
          db.close();
        }
        else{
          if (ourBand.hasOwnProperty('pull')){
            res.status(200).json({'success':true, 'data':ourBand.pull});
            db.close();
          }
          else{
            res.status(200).json({'success':false, 'data':'none'});
            db.close();
          }
        }
      });
    }, dbErr=>{
      console.log('There was an error connecting to mogno: ' + dbErr);
      res.status(500).end();
    })
  }
});

router.get('/gigPull', (req,res)=>{
  if (!req.session.key){
    console.log('No logged in user tried to find bandpull.');
    res.status(401).end();
  }
  if (!req.query){
    console.log('No query in a band pull');
    res.status(401).end();
  }
  else{
    var {id} = req.query;
    database.connect(db=>{
      db.db('gigs').collection('gigs').findOne({'_id':database.objectId(id)}, (err1, ourGig)=>{
        if (err1){
          console.log('There was an error fidnig gig with id: ' + id+ ' Error: '+err1);
          res.status(200).json({'success':false, 'data':'none'});
          db.close();
        }
        else{
          if (ourGig.hasOwnProperty('pull')){
            res.status(200).json({'success':true, 'data':ourGig.pull});
            db.close();
          }
          else{
            res.status(200).json({'success':false, 'data':'none'});
            db.close();
          }
        }
      });
    }, dbErr=>{
      console.log('There was an error connecting to mogno: ' + dbErr);
      res.status(500).end();
    })
  }
});
} //end of exports
