module.exports = router =>{

    const database = require ('../database')
    
    router.post('/send_sms_ad', (req, res)=>{
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
            //todo: add twillio message and upgrade account past trial
            const accountSid = 'AC8af05f7a1441f6a7127fb41a5ad62211';
            const authToken = 'f2dc878b43d278ceb950967f82f63920';
            const client = require('twilio')(accountSid, authToken);
            const receiver = req.body.receiver
            
            //send message
            client.messages
            .create({
                body: 'This is a text sent from the soon to be available Banda reccomendation feature!',
                from: '+13146288955',
                to: receiver
            })
            .then(message =>{
                console.log(message.sid)
                res.send("message sent")
            });
        }
      });
  
  } //end of exports