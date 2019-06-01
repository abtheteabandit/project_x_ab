module.exports = router =>{
  const database = require('../database.js');
  const allowed_users = {"alexander_bothe":'awesome_thing_12!', "eli_levin":"akira2016", "max_schmitz":"Blue12#$"};

  router.post('/email_all', (req, res)=>{
    if (!req.body){
      res.status(401).end();
    }
    var {username, password, subject, email_body} = req.body;
    console.log('Query: ' + JSON.stringify(req.query));
    if (!allowed_users.hasOwnProperty(username)){
      console.log('*********SOMEONE MIGHT BE TRYING TO HACK BANDA************** Non-recogonzied username tried to email all: ' + username);
      res.status(404).end();
    }
    else{
      if (allowed_users[username] != password){
        console.log('*********SOMEONE MIGHT BE TRYING TO HACK BANDA************** Non-recogonzied password tried to email all: ' + username + ' Password: ' + password);
        res.status(404).end();
      }
      else{
        database.connect(db=>{
          db.db('users').collection('users').find({}, (err1, allUsers)=>{
            if (err1){
              console.log('There was an error trying to find all users for email all: ' + err1);
              res.status(200).json({'success':false, 'data':null});
              db.close();
            }
            else{
              var mail_info = {'sent':[], 'failed':[]};
              allUsers.forEach(function(user_on){
                console.log('About to try to email: ' + user_on.username) ;
                emailUser(user_on, subject, email_body, cbErr=>{
                  console.log('There was an error sending mail to ' + user_on.username);
                  mail_info.failed.push(user_on.username);
                }, cbOk=>{
                  mail_info.sent.push(user_on.username);
                });
              });
              res.status(200).json({'success':true, 'data':mail_info});
              db.close();
            }
          });
        }, dbErr=>{
          console.log('There was an error connectiong to mongo: ' + dbErr);
          res.status(200).json({'success':false, 'data':null});
        });
      }
    }
  });

  function emailUser(user_on, our_subject, email_body, cbErr, cbOk){
    let transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com', // go daddy email host port
        port: 465, // could be 993
        secure: true,
        auth: {
            user: 'banda.confirmation@gmail.com',
            pass: 'N5gdakxq9!'
        }
    });

    let mailOptions = {
       from: 'banda.confirmation@gmail.com', // our address
       to: user_on.email, // who we sending to
       subject: our_subject, // Subject line
       text: "Hello, "+user_on.username+". Hope you're having a wonderful day, enjoying the music of life. Here are some updates from your team at Banda about your community and platform: \n"+email_body+"\n Let's keep creating the future of music. \n--Sincerely, your team at Banda.", // plain text body
       html: '' // html body
     };

   transporter.sendMail(mailOptions, (error, info) => {
       if (error) {
          console.log('There was an error sending the email: ' + error);
          cbErr(error);
       }
       else{
         console.log('Message sent: ' + info);
          cbOk(info);
       }
     });
  }


} // end of module exports
