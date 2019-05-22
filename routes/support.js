module.exports = router => {
  var database = require('../database.js');

  router.post('/contact_support', (req, res)=>{
    if (!req.session.key){
      console.log("No logged in user tried to contact support.")
      res.status(404).end();
    }
    if(!req.body){
      console.log('Req had no body for contact support')
      res.status(401).end();
    }
    else{
      var {message} = req.body
      database.connect(db=>{
        db.db('users').collection('users').findOne({'username':req.session.key}, (err2, myUser)=>{
          if (err2){
            console.log('THere was an error finding user with username: ' + req.session.key + "error: " + err2);
            res.status(500).end();
            db.close();
          }
          else{
              console.log('GOt user: ' + JSON.stringify(myUser));
              var user_email = myUser.email;
              console.log('USer email is: ' + user_email);
              let transporter = nodeMailer.createTransport({
                  host: 'smtp.gmail.com', // gmail email
                  port: 465, // could be 993
                  secure: true,
                  auth: {
                      user: 'banda.confirmation@gmail.com',
                      pass: 'N5gdakxq9!'
                  }
              });
              var today = new Date();
              var today_str = today.toString();
              mailOptions = {
                 from: 'banda.confirmation@gmail.com', // our address
                 to: 'banda.help.customers@gmail.com', // who we sending to
                 subject: "HELP! "+req.session.key+" has asked for support: " +today_str+"", // Subject line
                 text: message + "                                                                 USER EMAIL: " + user_email, // plain text body
                 html: '' // html body
             };
             transporter.sendMail(mailOptions, (error, info) => {
                 if (error) {
                    console.log('There was an error sending the email: ' + error);
                    res.status(200).send('Sorry, we had some issues sending reaching our support team. Please try calling one of the numbers listed below to speak with a real person.')
                 }
                 console.log('Message sent: ' + info);
                    res.status(200).send('We have logged your message and will do our very best to help you. Expect a response soon via email. Thank you for working with us.')
                });
          }
        });
      }, errDB=>{
        console.log('There was an error connecting mongo');
        res.status(500).end();
      });


    }
  });
}
