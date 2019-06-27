module.exports = router=>{
  const OUR_ADDRESS = 'banda.confirmation@gmail.com',
        database = require ('../database')
        /*
  router.post('/newGigNotification', (req, res)=>{
    if (!req.session.key){
      console.log('No logged in user tried to check for gig notification');
      res.status(401).end();
    }
    if (!req.body){
      console.log('No body gig notification');
      res.status(401).end();
    }
    else{
      var {id} = req.body;
      if (!id){
        console.log('no id');
        res.status(401).end();
      }
      else{
        database.connect(db=>{
          db.db('gigs').collection('gigs').findOne({'_id':database.objectId(id)}, (err1, ourGig)=>{
            if (err1){
              console.log('There was an error finding gig with id: ' + id + ' Error: ' + err1);
              res.status(500).end();
              db.close();
            }
            else{
              if (ourGig){
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
                                    sendBandNewGigText(bandUser, ourGig, cbErr=>{
                                      console.log('There was an error sending SMS to bandUser: ' + username + ' with phone: ' + bandUser.phone + ' Error: ' + cbErr);
                                      //send email
                                      sendBandNewGigEmail(bandUser, ourGig, cbErr2=>{
                                        console.log('There was an error sending email to bandUser: ' + username + ' with email: ' + bandUser.email + ' Error: ' + cbErr2);

                                      }, cbOk2=>{
                                        console.log('Sent email to bandUser: ' + username + ' with email: ' + bandUser.email);

                                      });

                                    }, cbOk=>{
                                      console.log('Sent SMS to bandUser: ' + username + ' with phone: ' + bandUser.phone);
                                      //send Email
                                      sendBandNewGigEmail(bandUser, ourGig, cbErr2=>{
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
                                  sendBandNewGigText(bandUser, ourGig, cbErr=>{
                                    console.log('There was an error sending SMS to bandUser: ' + username + ' with phone: ' + bandUser.phone + ' Error: ' + cbErr);
                                    //send email
                                    sendBandNewGigEmail(bandUser, ourGig, cbErr2=>{
                                      console.log('There was an error sending email to bandUser: ' + username + ' with email: ' + bandUser.email + ' Error: ' + cbErr2);

                                    }, cbOk2=>{
                                      console.log('Sent email to bandUser: ' + username + ' with email: ' + bandUser.email);

                                    });

                                  }, cbOk=>{
                                    console.log('Sent SMS to bandUser: ' + username + ' with phone: ' + bandUser.phone);
                                    //send Email
                                    sendBandNewGigEmail(bandUser, ourGig, cbErr2=>{
                                      console.log('There was an error sending email to bandUser: ' + username + ' with email: ' + bandUser.email + ' Error: ' + cbErr2);

                                    }, cbOk2=>{
                                      console.log('Sent email to bandUser: ' + username + ' with email: ' + bandUser.email);

                                    });

                                  });
                                }
                              }
                              else{
                                // no phone just email
                                sendBandNewGigEmail(bandUser, ourGig, cbErr2=>{
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

  function sendBandNewGigText(ourUser, theGig, cbOk, cbErr){
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
       to: ourUser.phone+'@SMS_GATEWAY', // who we sending to
       subject: "QR Coupon Code From Banda For "+theGig.name+"", // Subject line
       text: "", // plain text body
       html: "<div><h1>Hello, "+req.session.key+".</h1> Here is your QR code for the coupon you created for the event "+theGig.name+". You can print this page or set it up at your bar to let customers redeem their coupon. If a customer can display a page that says, '"+theGig.name+"\n Coupon Verified' it is from this coupon, as they can only display that page via entering the password they created through this promotion after scanning this QR Code. If you have any questions at all simply reply to this email. Enjoy the music and thank you for using Banda. —Your team at Banda.</div> <h1>QR Code Attached</h1>>"// html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
       if (error) {
          console.log('There was an error sending the email: ' + error);
       }

       console.log('Message sent: ' + JSON.stringify(info));
       console.log('mail options: ' + mailOptions.html)
     });
  }
  function sendBandNewGigEmail(recUser, gig, cbOk, cbErr){

  }
*/
var textbelt = require('textbelt');

  router.post('/testSMS', (req, res)=>{
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
       to: '4146904606'+'@txt.att.net', // who we sending to
       subject: "", // Subject line
       text: "HELLO", // plain text body
       html: ""// html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
       if (error) {
          console.log('There was an error sending the email: ' + error);
       }
       console.log('Message sent: ' + JSON.stringify(info));
       res.status(200).send('AIDS');
     });
  });
}
