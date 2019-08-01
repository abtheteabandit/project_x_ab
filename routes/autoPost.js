module.exports = router =>{
  const database = require('../database.js');
  const spawn = require("child_process").spawn;

  router.post('/autoSocial', (req, res)=>{
    if (!req.session.key){
      console.log('Nom signed in user tried to auto post.')
      res.status(404).end()
    }
    if (!req.body){
      console.log('missing body for  auto post.')
      res.status(401).end()
    }
    else{
      var {mode, promo, coupon, media} = req.body;
      if (!mode || !promo || !media){
        console.log('missing fields for  auto post.')
        res.status(401).end()
      }
      else{
        database.connect(db=>{
          db.db('users').collection('users').findOne({'username':req.session.key}, (err, user)=>{
            if (err){
              console.log('THere was an error fidnign user: ' + req.session.key + err);
              res.status(200).send('Hmmm...it seems you are not a user on our site yet. Sign up on "landing".')
              db.close();
            }
            else{
              console.log('USER: ' + JSON.stringify(user))
              if (!user.hasOwnProperty('facebook')){
                console.log('User ' + req.session.key + ' has not given us explicit permission so we will not post.');
                res.status(200).send('Sorry, it seems you have not given us permission to post on your ' + media + '. Please enable posting to '+mode+' so Banda can post this for you!');
                db.close();
              }
              else{
                var permission = ''
                if (mode=='post'){
                  permission = 'post_permission'
                }
                if (!user.facebook.hasOwnProperty('permissions')){
                  console.log('User ' + req.session.key + ' has not given us explicit permission so we will not post.');
                  res.status(200).send('Sorry, it seems you have not given us permission to post on your ' + media + '. Please enable posting to '+mode+' so Banda can post this for you!');
                  db.close();
                }
                else{

                  if (!user.facebook.permissions.hasOwnProperty(permission)){
                    console.log('User ' + req.session.key + ' has not given us explicit permission so we will not post.');
                    res.status(200).send('Sorry, it seems you have not given us permission to post on your ' + media + '. Please enable posting to '+mode+' so Banda can post this for you!');
                    db.close();
                  }
                  else{
                    if (!user.facebook.permissions[permission]){
                      console.log('User ' + req.session.key + ' has not given us explicit permission so we will not post.');
                      res.status(200).send('Sorry, it seems you have not given us permission to post on your ' + media + '. Please enable posting to '+mode+' so Banda can post this for you!');
                      db.close();
                    }
                    else{
                      console.log('GOT INTO DRIVER')
                      var message = promo.caption;
                			//format the message and cupoun
                      console.log('mess cap: ' + message)
                      if (coupon==null){
                        if (!(promo.handles==undefined)){
                          message= message+'\n'+promo.handles;
                          console.log('coupon null handles: ' + message)
                        }
                      }
                      else{
                        console.log('coupon not null: ' + message)
                        if (!(promo.handles==undefined)){
                          message= message+'\n'+promo.handles;
                          console.log('coupon not null handles: ' + message)
                        }
                        if (coupon.hasOwnProperty('details')){
                          if (coupon.details == null || coupon.details == "" || coupon.details == " " ){
                            message = message +'\n'+coupon.details;
                          }
                        }

                        if (coupon.hasOwnProperty('link')){
                          message= message + '\n'+coupon.link;
                          console.log('coupon not null link: ' + message)
                        }
                      }
                      //testing
                      console.log('SRC: ' + promo.imgURL);
                      var url = promo.imgURL.replace('www.banda-inc.com//', '')
                      url = url.replace('uploads/PromoPics/', '')
                      console.log('url: ' + url);
                    //  url = 'Users/Bothe/Desktop/project_x_ab/static/assets/Promo/bandaLogo.png';
                      message = message + '\n'+'(posted from https://www.banda-inc.com where artists rise, venues grow, and music-lovers band together!)'
                      console.log('Final message: ' + message)
                       postToFacebook(user.facebook.username, user.facebook.password, message, url, cb=>{
                         if (cb.includes('error')){
                           console.log('THere was a python error posting to faceboom for user: ' + user.facebook.username + cb)
                           res.status(200).send('Hmmm...there was an error on our end. Please refresh and try again.')
                           db.close();
                         }
                         else{
                           console.log('*****')
                           console.log('\n')
                           console.log('DATA FROM PY: ' + cb)
                           res.status(200).send('We have posted this promotion to your facebook.')
                           db.close();
                         }
                       });
                    }
                  }
                }
              }
            }
          })
        }, dbErr=>{
          console.log('There was an error connecting to mongo: ' + dbErr);
          res.status(500).end()
        })

      }
    }
  })

  function postToFacebook(username, password, message, imgPath, cb){
    console.log('spawing python')
    var pythonProcess = spawn('python',["./nebulous/social.py", 'post','facebook', username, password, message, imgPath]);
    console.log(pythonProcess)
    pythonProcess.stdout.on('data', function(data){
          var str = data.toString();
          console.log("DATA FROM PY: " + str)
          cb(str);
        });
  }
} //end of exports
