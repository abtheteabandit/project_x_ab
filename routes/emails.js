module.exports => router{

    //post request to send email verification
  router.post('/send_email', (req, res)=>{

    //set up options for hosting
    let transporter = nodeMailer.createTransport({
        host: 'smtpout.secureserver.net', // go daddy email host port
        port: 465, // could be 993
        secure: true,
        auth: {
            user: 'xxx@xx.com',
            pass: 'xxxxx'
        }
    });

    //setup variables for the mail options
    let mailOptions = {
        from: OUR ADDRESS // our address
        to: req.body.to, // who we sending to
        subject: req.body.subject, // Subject line
        text: req.body.body, // plain text body
        html: '<b>TEST TEST TEST</b>' // html body
    };

    //transporter to send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
            res.render('index');
      });
  });
}
