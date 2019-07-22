module.exports = router =>{
  const database = require('../database.js');
  const chrome = require('selenium-webdriver/chrome');
  const {Builder, By, Key, until} = require('selenium-webdriver');

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
      var {mode, username, password, promo} = req.body;
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
              if (!user.hasOwnProperty('permissions')){
                console.log('User ' + req.session.key + ' has not given us explicit permission so we will not post.');
                res.status(200).send('Sorry, it seems you have not given us permission to post on your ' + mode + '. Please enable posting to '+mode+' so Banda can post this for you!');
                db.close();
              }
              else{
                if (!user.permissions.hasOwnProperty(mode)){
                  console.log('User ' + req.session.key + ' has not given us explicit permission so we will not post.');
                  res.status(200).send('Sorry, it seems you have not given us permission to post on your ' + mode + '. Please enable posting to '+mode+' so Banda can post this for you!');
                  db.close();
                }
                else{
                  //user has given us permisson to post to the specifed mode so we will proceed and post
                  console.log('GOT INTO DRIVER')

                   postToFacebook(username, password, cb=>{

                   });







                  //res.status(200).send('Success')
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

  async function postToFacebook(username, password, cb){
    const screen = {
      width: 640,
      height: 480
    };
    try{
      var options = new chrome.Options();
      options.setUserPreferences({'profile.default_content_setting_values.notifications': 2});
      let driver = new Builder()
          .forBrowser('chrome')
          .setChromeOptions(options)
          .build();
          //new chrome.Options().headless().windowSize(screen)
        await driver.get('https://facebook.com')
        var email = driver.findElement(By.name('email'))
        var passwordField = driver.findElement(By.name('pass'))
        console.log('found email')
      //  console.log(email)
        //console.log(password)
        email.clear()
        passwordField.clear()
        await email.sendKeys(username);
        await passwordField.sendKeys(password);
        await passwordField.sendKeys(Key.RETURN)
        console.log('return')
        console.log('waitng...')
        setTimeout(async function() {
          console.log('First wait over')
          await driver.findElement(By.tagName('body')).sendKeys(Key.ESCAPE)
          driver.findElements(By.tagName('div')).then(tas=>{
            
            for (t in tas){
              if (tas[t]){
                if (tas[t].getText().includes("what's on your mind")){
                  tas[t].click()
                }
              }
            }
          })
        }, 3000)



    }
    catch(e){
      console.log('there was an error loggin into fb: ' + e)
      cb('Error')
    }

  }

} //end of exports
