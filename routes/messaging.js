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
}
