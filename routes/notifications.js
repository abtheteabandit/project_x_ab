module.exports = router=>{
  const OUR_ADDRESS = 'banda.confirmation@gmail.com',
        database = require ('../database')

  router.post('/newGigNotification', (req, res)=>{
    if (!req.session.key){
      console.log('Non logged in user tried to check for gig notification');
      res.status(401).end();
    }
    if (!req.body){
      console.log('No body gig notification');
      res.status(401).end();
    }
    else{
      var {creator} = req.body;
      if (!creator){
        console.log('no creator');
        res.status(401).end();
      }
      else{
        database.connect(db=>{
          db.db('gigs').collection('gigs').find({'creator':creator}).toArray((err1, ourGigs)=>{
            if (err1){
              console.log('There was an error finding gigs with creator: ' + creator + ' Error: ' + err1);
              res.status(500).end();
              db.close();
            }
            else{
              if (ourGigs){
                var ourGig = ourGigs[ourGigs.length-1];
                db.db('bands').collection('bands').find({'zipcode':ourGig.zipcode}).toArray((err2, allBands)=>{
                  if (err2){
                    console.log('There was an error finding bands with zipcode: ' + zipcode + ' Error: ' + err2);
                    res.status(500).end();
                    db.close();
                  }
                  else{
                    var bandsSorted = [];
                    allBands.forEach((band, i)=>{
                      if (i>=allBands.length-1){

                        res.status(200).send('success');
                        db.close();
                      }
                      else{
                        db.db('users').collection('users').findOne({'username':band.creator}, (err3, bandUser)=>{
                          if (err3){
                            console.log('There was an error finding user: ' + band.creator + ' Error: ' + err3);
                            res.status(500).end();
                            db.close();
                          }
                          else{
                            if (bandUser){
                              if (bandUser.hasOwnProperty('phone')){
                                if (bandUser.hasOwnProperty('newGigNotifications')){
                                  if (bandUser.newGigNotifications){
                                    sendBandNewGigText(bandUser, band, ourGig, cbErr=>{
                                      console.log('There was an error sending SMS to bandUser: ' + username + ' with phone: ' + bandUser.phone + ' Error: ' + cbErr);
                                      //send email
                                      sendBandNewGigEmail(bandUser, band, ourGig, cbErr2=>{
                                        console.log('There was an error sending email to bandUser: ' + username + ' with email: ' + bandUser.email + ' Error: ' + cbErr2);

                                      }, cbOk2=>{
                                        console.log('Sent email to bandUser: ' + username + ' with email: ' + bandUser.email);

                                      });

                                    }, cbOk=>{
                                      console.log('Sent SMS to bandUser: ' + username + ' with phone: ' + bandUser.phone);
                                      //send Email
                                      sendBandNewGigEmail(bandUser, band, ourGig, cbErr2=>{
                                        console.log('There was an error sending email to bandUser: ' + username + ' with email: ' + bandUser.email + ' Error: ' + cbErr2);

                                      }, cbOk2=>{
                                        console.log('Sent email to bandUser: ' + username + ' with email: ' + bandUser.email);

                                      });

                                    });
                                  }
                                  else{
                                    //dont send text
                                    //send Email
                                  }
                                }
                                else{
                                  //send text
                                  sendBandNewGigText(bandUser, band, ourGig, cbErr=>{
                                    console.log('There was an error sending SMS to bandUser: ' + username + ' with phone: ' + bandUser.phone + ' Error: ' + cbErr);
                                    //send email
                                    sendBandNewGigEmail(bandUser, band, ourGig, cbErr2=>{
                                      console.log('There was an error sending email to bandUser: ' + username + ' with email: ' + bandUser.email + ' Error: ' + cbErr2);

                                    }, cbOk2=>{
                                      console.log('Sent email to bandUser: ' + username + ' with email: ' + bandUser.email);

                                    });

                                  }, cbOk=>{
                                    console.log('Sent SMS to bandUser: ' + username + ' with phone: ' + bandUser.phone);
                                    //send Email
                                    sendBandNewGigEmail(bandUser, band, ourGig, cbErr2=>{
                                      console.log('There was an error sending email to bandUser: ' + username + ' with email: ' + bandUser.email + ' Error: ' + cbErr2);

                                    }, cbOk2=>{
                                      console.log('Sent email to bandUser: ' + username + ' with email: ' + bandUser.email);

                                    });

                                  });
                                }
                              }
                              else{
                                // no phone just email
                                sendBandNewGigEmail(bandUser, band, ourGig, cbErr2=>{
                                  console.log('There was an error sending email to bandUser: ' + username + ' with email: ' + bandUser.email + ' Error: ' + cbErr2);

                                }, cbOk2=>{
                                  console.log('Sent email to bandUser: ' + username + ' with email: ' + bandUser.email);

                                });

                              }

                            }
                          }
                        });
                      }
                    });
                  }
                });
              }else{
                console.log('No gig with id: ' + id);
                res.status(200).send('no gig');
                db.close();
              }
            }
          });
        }, dbErr=>{
          console.log('There was an error connecting to Mongo: ' + dbErr);
          res.status(500).end();
        });

      }
    }
  });

  function sendBandNewGigText(ourUser, theBand, theGig, cbOk, cbErr){

    var genres = ""
    if (theGig.hasOwnProperty('catagories')){
      var cats = theGig.categories

      if (cats.hasOwnProperty('genres')){

        for (var g in cats.genres){
          var newG = cats.genres[g]+', '
          genres += newG;
        }
      }
    }
    if (genres==""){
      var body = 'Message From Banda:\nHello '+ourUser.username+',\n a new gig was just added in your area! It might be good for your band, '+theBand.name+'. You should login into www.banda-inc.com, search for an event, and apply as one of your bands now! Thank you and keep Banding Together. \n (You can disable these notifications in settings on your Home page).'

    }
    else{
      var body = 'Message From Banda:\nHello '+ourUser.username+',\n a new gig with genres: '+genres+'was just added in your area! It might be good for your band, '+theBand.name+'. You should login into www.banda-inc.com, search for an event, and apply as one of your bands now! Thank you and keep Banding Together. \n (You can disable these notifications in settings on your Home page).'
    }
    var phone = ourUser.phone;
    if (!(phone.length==10)){
      cbErr('Phone number: '+phone+' was incorrect length for user: ' + ourUser.username);
    }
    else{
      sendSMS(phone, body, cb=>{
        console.log('Got cb from sendSMS.');
        cbOk(cb);
      });
    }
  }

  function sendBandNewGigEmail(recUser, theBand, gig, cbOk, cbErr){
    let transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com', // go daddy email host port
        port: 465, // could be 993
        secure: true,
        auth: {
            user: 'banda.confirmation@gmail.com',
            pass: 'N5gdakxq9!'
        }
    });
    var cats = gig.categories
    if (cats.hasOwnProperty('genres')){
      var genres = ""
      for (var g in cats.genres){
        var newG = cats.genres[g]+', '
        genres += newG;
      }
    }
    if (genres==""){
      var body = 'Hello '+recUser.username+',\n a new gig was just added in your area! It might be good for your band, '+theBand.name+'. You should login into www.banda-inc.com, search for an event, and apply as one of your bands now! Thank you and keep Banding Together.\nSincerely,\nyour team at Banda.'

    }
    else{
      var body = 'Hello '+recUser.username+',\n a new gig with genres: '+genres+'was just added in your area! It might be good for your band, '+theBand.name+'. You should login into www.banda-inc.com, search for an event, and apply as one of your bands now! Thank you and keep Banding Together.\nSincerely,\nyour team at Banda.'
    }

    var mailOptions = {
       from: OUR_ADDRESS, // our address
       to: recUser.email, // who we sending to
       subject: "New Gig Added In Your Area!", // Subject line
       text: body, // plain text body
       html: ""// html body
    };

    transporter.sendMail(mailOptions, (error5, info5) => {
       if (error5) {
          console.log('There was an error sending the email: ' + error5);
          cbErr(error5);
       }
       else{
         console.log('Message sent: ' + JSON.stringify(info5));
         cbOk(info5);
       }
     });
  }



  function sendSMS(phone, body, cb){
    let transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com', // go daddy email host port
        port: 465, // could be 993
        secure: true,
        auth: {
            user: 'banda.confirmation@gmail.com',
            pass: 'N5gdakxq9!'
        }
    });

    //AT&T
    var mailOptions = {
       from: OUR_ADDRESS, // our address
       to: phone+'@txt.att.net', // who we sending to
       subject: "", // Subject line
       text: body, // plain text body
       html: ""// html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
       if (error) {
          console.log('There was an error sending the email: ' + error);
       }
       console.log('Message sent: ' + JSON.stringify(info));

       //verizon
       mailOptions.to = phone+'@vtext.com';
       transporter.sendMail(mailOptions, (error2, info1) => {
          if (error2) {
             console.log('There was an error sending the email: ' + error2);
          }
          console.log('Message sent: ' + JSON.stringify(info1));

          //sprint
          mailOptions.to = phone+'@messaging.sprintpcs.com';
          transporter.sendMail(mailOptions, (error3, info2) => {
             if (error3) {
                console.log('There was an error sending the email: ' + error3);
             }
             console.log('Message sent: ' + JSON.stringify(info2));

             //TMobile
             mailOptions.to = phone+'@tmomail.net';
             transporter.sendMail(mailOptions, (error4, info4) => {
                if (error4) {
                   console.log('There was an error sending the email: ' + error4);
                }
                console.log('Message sent: ' + JSON.stringify(info4));

                //US Cellular
                mailOptions.to = phone+'@email.uscc.net';
                transporter.sendMail(mailOptions, (error5, info5) => {
                   if (error5) {
                      console.log('There was an error sending the email: ' + error5);
                      cb('Error5: ' + error5);
                   }
                   else{
                     console.log('Message sent: ' + JSON.stringify(info5));
                     cb(info5);
                   }
                 });
              });
           });
        });
     });
  }

  router.post('/bookingNotification', (req, res)=>{
    if (!req.session.key){
      console.log('Non logged in user tried to check for booking notification');
      res.status(401).end();
    }
    if (!req.body){
      console.log('No body booking notification');
      res.status(401).end();
    }
    else{
      var {gigID, bandID} = req.body
      if (!gigID || !bandID){
        res.status(401).end();
      }
      else{
        database.connect(db=>{
          db.db('gigs').collection('gigs').findOne({'_id':database.objectId(gigID)}, (err1, ourGig)=>{
            if (err1){
              console.log('THere was an error finding gig: ' + gigID + ' Error: ' + err1);
              res.status(500).end();
              db.close();
            }
            else{
              db.db('bands').collection('bands').findOne({'_id':database.objectId(bandID)}, (err2, ourBand)=>{
                if (err2){
                  console.log('THere was an error finding band: ' + bandID + ' Error: ' + err2);
                  res.status(500).end();
                  db.close();
                }
                else{
                  db.db('users').collection('users').findOne({'username':ourBand.creator}, (err3, recUser)=>{
                    if (err3){
                      console.log('THere was an error finding user: ' + ourBand.creator + ' Error: ' + err3);
                      res.status(500).end();
                      db.close();
                    }
                    else{
                      sendBookingNotificationEmail(recUser, ourBand, ourGig, cb=>{
                        if (recUser.hasOwnProperty('phone')){
                          if (recUser.hasOwnProperty('notificationForBooking')){
                            if (recUser.notificationForBooking){
                              var body = 'Message from Banda:\nCongratulations! Your band, '+ourBand.name+' was just booked for the event, '+ourGig.name+'. This event is scheduled for '+ourGig.date+'. Login into www.banda-inc.com and click "home" to see the event under '+ourBand.name+'. Thank you, good luck, and keep Banding Together! --- \n Sincerely,,\nyour team at Banda.'
                              sendSMS(recUser.phone, body, cb=>{
                                res.status(200).send('We have notified ' +ourBand.name+' that you booked them.');
                                db.close();
                              });
                            }
                            else{
                              res.status(200).send('We have notified ' +ourBand.name+' that you booked them.');
                              db.close();
                            }
                          }
                          else{
                            var body = 'Message from Banda:\nCongratulations! Your band, '+ourBand.name+' was just booked for the event, '+ourGig.name+'. This event is scheduled for '+ourGig.date+'. Login into www.banda-inc.com and click "home" to see the event under '+ourBand.name+'. Thank you, good luck, and keep Banding Together! --- \n Sincerely,,\nyour team at Banda.'
                            sendSMS(recUser.phone, body, cb=>{
                              res.status(200).send('We have notified ' +ourBand.name+' that you booked them.');
                              db.close();
                            });
                          }
                        }
                        else{
                          res.status(200).send('We have notified ' +ourBand.name+' that you booked them.');
                          db.close();
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }, dbErr=>{
          console.log('There was an error connecting to Mongo: ' + dbErr);
          res.status(500).end();
        });
      }
    }
  });

  function sendBookingNotificationEmail(recUser, ourBand, ourGig, cb){
    let transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com', // go daddy email host port
        port: 465, // could be 993
        secure: true,
        auth: {
            user: 'banda.confirmation@gmail.com',
            pass: 'N5gdakxq9!'
        }
    });
    var body = 'Congratulations! Your band '+ourBand.name+' was just booked for the event '+ourGig.name+'. This event is scheduled for '+ ourGig.date+'. Login to www.banda-inc.com and click "home" to go your home page to see the event under '+ourBand.name+'. Thank you, good luck, and keep Banding Together! --- \n Sincerely,,\nyour team at Banda.';
    var mailOptions = {
       from: OUR_ADDRESS, // our address
       to: recUser.email, // who we sending to
       subject: "Congratulations, you have booked an event!", // Subject line
       text: body, // plain text body
       html: ""// html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
       if (error) {
          console.log('There was an error sending the email: ' + error);
          cb(error);
       }
       else{
         console.log('Message sent: ' + JSON.stringify(info));
         cb(info);
       }
     });

  }

router.post('/applicationNotification', (req, res)=>{
  if (!req.session.key){
    console.log('Non logged in user tried to check for booking notification');
    res.status(401).end();
  }
  if (!req.body){
    console.log('No body booking notification');
    res.status(401).end();
  }
  else{
    var {bandID, gigID} = req.body;
    if (!bandID || !bandID){
      console.log('Missing band or gig id');
      res.status(403).end();
    }
    else{
      database.connect(db=>{
        db.db('gigs').collection('gigs').findOne({'_id':database.objectId(gigID)}, (err1, ourGig)=>{
          if (err1){
            console.log('There was an error finding gig: ' + gigID + ' Error: ' + err1);
            res.status(500).end();
            db.close();
          }
          else{
            db.db('bands').collection('bands').findOne({'_id':database.objectId(bandID)}, (err2, ourBand)=>{
              if (err2){
                console.log('there was an error trying to find band: ' + bandID + 'Error: ' + err2);
                res.status(500).end();
                db.close();
              }
              else{
                db.db('users').collection('users').findOne({'username':ourGig.creator}, (err3, recUser)=>{
                  if (err3){
                    console.log('there was an error trying to gig creator: ' + ourGig.creator + 'Error: ' + err3);
                    res.status(500).end();
                    db.close();
                  }
                  else{
                    var body = 'Hello, '+recUser.username+'\nYou have just recieved an application from a band for your event, '+ourGig.name+' on ' +ourGig.date+'. Login to your account at www.banda-inc.com and click home on the Banda "b" to view this application. Thank you for using Banda and keep Banding Together.\nSincerely,,\nyour team at Banda.';
                    var subject = 'You recieved an application for '+ourGig.name;
                    sendEmail(recUser.email, body, subject, cb=>{
                      if (recUser.hasOwnProperty('phone')){
                        if (recUser.hasOwnProperty('notifyApplications')){
                          if (recUser.notifyApplications){
                            body+='\n(you can silence SMS notifications on the settings tab on your home page on Banda)'
                            sendSMS(recUser.phone, body, cb2=>{
                             res.status(200).send('We have emailed and texted '+recUser.username+', the owner of: '+ourGig.name+', for you!');
                             db.close();
                            });
                          }
                          else{
                            res.status(200).send('We have emailed '+recUser.username+', the owner of: '+ourGig.name+', for you!');
                            db.close();
                          }
                        }
                        else{
                           body+='\n(you can silence SMS notifications on the settings tab on your home page on Banda)';
                          sendSMS(recUser.phone, body, cb2=>{
                            res.status(200).send('We have emailed and texted '+recUser.username+', the owner of: '+ourGig.name+', for you!');
                            db.close();
                          });
                        }
                      }
                      else{
                        res.status(200).send('We have emailed '+recUser.username+', the owner of: '+ourGig.name+', for you!');
                        db.close();
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }, dbErr=>{
        console.log('There was an error connecting to Mongo: ' + dbErr);
        res.status(500).end();
      });
    }
  }
});

router.post('/promotionNotification', (req, res)=>{
  if (!req.session.key){
    console.log('Non logged in user tried to check for booking notification');
    res.status(401).end();
  }
  if (!req.body){
    console.log('No body booking notification');
    res.status(403).end();
  }
  else{
    var {askerName, promoterName} = req.body;
    if (!askerName || !promoterName){
      console.log('Missing promoter or asker name');
      res.status(403).end();
    }
    else{
      console.log('AKSER: ' + askerName + ' promoter: ' + promoterName);
      database.connect(db=>{
        db.db('users').collection('users').findOne({'username':askerName}, (err1, asker)=>{
          if (err1){
            console.log('There was an error finding asker user: ' + askerName + ' Error: ' + err1);
            res.status(500).end();
            db.close();
          }
          else{
            db.db('users').collection('users').findOne({'username':promoterName}, (err2, promoter)=>{
              if (err2){
                console.log('there was an error trying to find promoter user: ' + promoterName + 'Error: ' + err2);
                res.status(500).end();
                db.close();
              }
              else{
                var body = 'Hello ' +promoter.username+',\nYou have been asked to post something made by '+ asker.username+' on Banda. Login in to www.banda-inc.com and use the Banda "b" (top left corner) to navigate to your Home page, then click contacts (bottom right corner), then click on '+askerName+', then scroll to the bottom of the chat window and click view promotion. Posting takes very little time and really helps the community. Remember, a little kidness goes a long way! Thank you and keep Banding Together.\nSincerely,\nyour team at Banda.'
                var subject = 'You have been asked to promote something on Banda!';
                sendEmail(promoter.email, body, subject, cb=>{
                  if (promoter.hasOwnProperty('phone')){
                    if (promoter.hasOwnProperty('notifyPromotions')){
                        if (promoter.notifyPromotions){
                          body+='\n(you can silence SMS notifications on the settings tab on your home page on Banda)';
                          sendSMS(promoter.phone, body, cb2=>{
                           res.status(200).send('We have emailed and texted '+promoter.username+' for you!');
                           db.close();
                          });
                        }
                        else{
                          res.status(200).send('We have emailed '+promoter.username+' for you!');
                          db.close();
                        }

                    }
                    else{
                       body+='\n(you can silence SMS notifications on the settings tab on your home page on Banda)';
                      sendSMS(promoter.phone, body, cb2=>{
                        res.status(200).send('We have emailed and texted '+promoter.username+' for you!');
                        db.close();
                      });
                    }
                  }
                  else{
                    res.status(200).send('We have emailed '+promoter.username+' for you!');
                    db.close();
                  }
                });
              }
            });
          }
        });
      }, dbErr=>{
        console.log('There was an error connecting to Mongo: ' + dbErr);
        res.status(500).end();
      });
    }
  }
});

router.post('/connectNotification', (req, res)=>{
  if (!req.session.key){
    console.log('Non logged in user tried to check for booking notification');
    res.status(401).end();
  }
  if (!req.body){
    console.log('No body booking notification');
    res.status(403).end();
  }
  else{
    var {askerID, friendID} = req.body;
    if (!askerID || !friendID){
      console.log('Missing friend or asker id');
      res.status(403).end();
    }
    else{
      database.connect(db=>{
        db.db('users').collection('users').findOne({'_id':database.objectId(askerID)}, (err1, asker)=>{
          if (err1){
            console.log('There was an error finding asker user: ' + askerID + ' Error: ' + err1);
            res.status(500).end();
            db.close();
          }
          else{
            db.db('users').collection('users').findOne({'_id':database.objectId(friendID)}, (err2, newFriend)=>{
              if (err2){
                console.log('there was an error trying to find friend user: ' + friendID + 'Error: ' + err2);
                res.status(500).end();
                db.close();
              }
              else{
                var body = 'Hello ' +newFriend.username+',\nYou have been asked to connect by '+ asker.username+' on Banda. Login in to www.banda-inc.com and use the Banda "b" (top left corner) to navigate to your Home page, and a modal should appear. Remember, a new contact can mean a lot in this industry! Thank you and keep Banding Together.\nSincerely,\nyour team at Banda.'
                var subject = 'You have been asked to connect on Banda!';
                sendEmail(newFriend.email, body, subject, cb=>{
                  if (newFriend.hasOwnProperty('phone')){
                    if (newFriend.hasOwnProperty('notifyConnect')){
                      if (newFriend.notifyConnect){
                        body+='\n(you can silence SMS notifications on the settings tab on your home page on Banda)';
                       sendSMS(newFriend.phone, body, cb2=>{
                         res.status(200).send('We have emailed and texted '+newFriend.username+' for you!');
                         db.close();
                       });
                      }
                      else{
                        res.status(200).send('We have emailed '+newFriend.username+' for you!');
                        db.close();
                      }
                    }
                    else{
                       body+='\n(you can silence SMS notifications on the settings tab on your home page on Banda)';
                      sendSMS(newFriend.phone, body, cb2=>{
                        res.status(200).send('We have emailed and texted '+newFriend.username+' for you!');
                        db.close();
                      });
                    }
                  }
                  else{
                    res.status(200).send('We have emailed '+newFriend.username+' for you!');
                    db.close();
                  }
                });
              }
            });
          }
        });
      }, dbErr=>{
        console.log('There was an error connecting to Mongo: ' + dbErr);
        res.status(500).end();
      });
    }
  }
});

  function sendEmail(email, body, theSubject, cb,){
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
       subject: theSubject, // Subject line
       text: body, // plain text body
       html: ""// html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
       if (error) {
          console.log('There was an error sending the email: ' + error);
          cb(error);
       }
       else{
         console.log('Message sent: ' + JSON.stringify(info));
         cb(info);
       }
     });
  }
}// end of exports
