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
      var {mode, username, password, promo, coupon} = req.body;
      if (!mode || !username || !password || !promo){
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
                res.status(200).send('Sorry, it seems you have not given us permission to post on your ' + mode + '. Please enable posting to '+mode+' so Banda can post this for you!');
                db.close();
              }
              else{
                var permission = ''
                if (mode=='post'){
                  permission = 'post_permission'
                }
                if (!user.facebook.hasOwnProperty(permission)){
                  console.log('User ' + req.session.key + ' has not given us explicit permission so we will not post.');
                  res.status(200).send('Sorry, it seems you have not given us permission to post on your ' + mode + '. Please enable posting to '+mode+' so Banda can post this for you!');
                  db.close();
                }
                else{
                  //user has given us permisson to post to the specifed mode so we will proceed and post

                  console.log('GOT INTO DRIVER')
                  var message = promo.caption;
            			var link=promo.imgURL;
            			//format the message and cupoun
                  if (coupon==null){
                    if (!(promo.handles==undefined)){
                      message= message+'\n'+promo.handles;
                    }
                  }
                  else{
                    if (!(promo.handles==undefined)){
                      message= message+'\n'+promo.handles;
                    }
                    message = message + '\n' + coupon.details;
                    if (coupon.hasOwnProperty('link')){
                      message= message + '\n'+coupon.link;
                    }
                  }
                  //testing
                  imgPath = '/Users/Bothe/Desktop/project_x_ab/static/assets/Promo/bandaLogo.png';
                  message = message + '\n\n'+'(posted from https://www.banda-inc.com where artists rise, venues grow, and music-lovers band together!)'

                   postToFacebook(username, password, message, imgPath, cb=>{
                     if (cb.includes('error')){
                       console.log('THere was a python error posting to faceboom for user: ' + username + cb)
                       res.status(200).send('Hmmm...there was an error on our end. Please refresh and try again.')
                       db.close();
                     }
                     else{
                       res.status(200).send('We have posted this promotion to your facebook.')
                       db.close();
                     }
                   });
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
