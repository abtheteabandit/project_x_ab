//firebase stuff//
var config = {
  apiKey: "AIzaSyDNAWHxs10dH56XndO55LwoqR-sfvNXzEY",
  authDomain: "bandawebsite-199ac.firebaseapp.com",
  databaseURL: "https://bandawebsite-199ac.firebaseio.com",
  projectId: "bandawebsite-199ac",
  storageBucket: "",
  messagingSenderId: "1062956348605"
};
firebase.initializeApp(config);
var database = firebase.database();
var selectedApplicant=null;
var selectedGig=null;
var myUserName="Deadalus";
getMessages();
//messagingstuff//

//getApplicants//

//aplicant objects will have the user's name in the obj//

function sendMessage(){
  var today = new Date();
  var text = $("#textBar").val();
  if (text==""||text==" "||text.includes('@')||text.includes(myUserName)){
    return;
  }
  if (selectedGig==null && selectedApplicant==null){
    return;
  }
  else{
    var messageData={};

    if (selectedGig==null){
       messageData = {
        'sender':myUserName,
        'reciever':selectedApplicant,
        'text':text,
        'dateSent': today.toString();
    }
      else {
         messageData = {
          'sender':myUserName;
          'reciever':selectedGig.userName,
          'text':text,
          'dateSent': today.toString();
        }
        var newPostKey = firebase.database().ref().child('messages').child(selectedGig.userName).push().key;
        var updates = {};
        updates['/messages/' + selectedGig.userName + newPostKey] = postData;
        return firebase.database().ref().update(updates);
    }
  }
function getMessages(){
  document.getElementById("messagesList").innderHTML="";
  if (selectedGig==null && selectedApplicant==null){
    console.log("no user was selected");
    return
  }
  var messages = firebase.database().ref('messages/' + myUserName + postId);
  starCountRef.on('value', function(snapshot) {
    var data = snapshot.val();
    if (data==null){
      console.log("Firebase says messages at messages/" + myUserName + postId + "was null");
    }
    else{
      for (var message in data){
        if (selectedGig==null){
          if (message.sender==selectedApplicant){
            var node = document.createElement("LI");                 // Create a <li> node
            var textnode = document.createTextNode(message.text);         // Create a text node
            node.appendChild(textnode);                              // Append the text to <li>
            document.getElementById("messagesList").appendChild(node);
          }
        }
        else{
          if (message.sender==selectedGig){
            var node = document.createElement("LI");                 // Create a <li> node
            var textnode = document.createTextNode(message.text);         // Create a text node
            node.appendChild(textnode);                              // Append the text to <li>
            document.getElementById("messagesList").appendChild(node);
          }

        }

      }
    }
  });
}
