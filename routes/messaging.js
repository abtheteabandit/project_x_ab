module.exports = router => {
  const database = require('../database.js');

  //get request for messages
  router.get('/messages', (req, res)=>{
    if (!req.query) {
       console.log("No body recived for messaging");
       res.status(400).send('No body sent').end();
    }

    //query the database
    var {recieverID} = req.query;
      database.connect(db=>{
        //find all messages for the user
        let messages = db.db('messages').collection('messages');
        messages.find({$or : [{'recieverID':recieverID}, {'senderID':recieverID}]}).toArray(function(err2, result) {
          if (err2){
            console.warn("Couldnt get messages: " + err2);
            res.status(500).end();
            db.close();
          }
          else{
            //set variables
            var myID = recieverID;
            var messages = {};
            console.log("Got messages out!");
            console.log(JSON.stringify(result));
            //for all the results
            for (var m in result){
              var message = result[m];
              //if the user is the sender
              if (message.senderID==myID){
                if (messages.hasOwnProperty(message.recieverID)){
                  messages[message.recieverID].push(message);
                }
                else{
                  messages[message.recieverID]=[];
                  messages[message.recieverID].push(message);
                }
              }
              //if the user is the reciever
              else{
                if (messages.hasOwnProperty(message.senderID)){
                  messages[message.senderID].push(message);
                }
                else{
                  messages[message.senderID]=[];
                  messages[message.senderID].push(message);
                }
              }
            }
            res.status(200).send(messages);
            db.close();
          }
        });
      }, err=>{
        console.log("Couldn't connec to mongo with error: "+err);
        res.status(500).end();
      });
  });
  router.post('/seenMessage', (req,res)=>{
    if (!req.session.key){
      console.log('No logged in user tried to say theyve seeb a message');
      res.status(404).end();
    }
    if (!req.body){
      console.log('No body sent in seen message');
      res.status(403).end();
    }
    else{
      var {id, forUser} = req.body;
      database.connect(db=>{
        db.db('messages').collection('messages').updateOne({'_id':database.objectId(id)}, {$set:{'hasDisplayed':true}}, (err1, res1)=>{
          if (err1){
            console.log('There was an error editing message with id: ' + id + ' for user: ' + forUser + ' Error: ' + err1);
            res.status(200).send('Hmmm... there was an error on our end. You may have to see this message again. Just hot the "x" to get rid of it for now. Sorry about that. Please try again later, or contact support using the support option after clicking the banda "b" (top left).')
            db.close();
          }
          else{
            res.status(200).send('You have declined this connect request.');
            db.close();
          }
        })
      }, dbErr=>{
        onsole.log("Couldn't connec to mongo with error: "+dbErr);
        res.status(500).end();
      })
    }
  });
}
