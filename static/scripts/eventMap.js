

console.log('Axript loaded');
const pinSRC = '/assets/Home/banda_b.png';
var event_interesed = null;
var referal = null;
var loggedIn = false;
checkSession();
getReferer();

function initMap() {
  getLocationAndShowPosition();
}
function getLocationAndShowPosition() {
  if (navigator.geolocation) {
    console.log('nav geo')
    navigator.geolocation.getCurrentPosition(showPosition, posErr, {timeout:10000});
  } else {
    console.log("browser doesnt support geolocator api");
  }
}


function showPosition(position) {
  console.log('In show')
	console.log(position);
	currLat=position["coords"]["latitude"];
	currLng=position["coords"]["longitude"];
  console.log("curr Lat is: " + currLat);
	console.log("curr lng is: " + currLng);
  var myLoc = {lat: currLat, lng: currLng};
  var map = new google.maps.Map(
      document.getElementById('map'), {zoom: 7, center: myLoc});
  // The marker, positioned at Uluru
  var marker = new google.maps.Marker({position: myLoc, map: map});
  var now = new Date().toString();
  checkSession();
  $.get('/map_events', {'time':now, 'lat':currLat, 'lng':currLng}, res=>{
    console.log('Current Events: ' + JSON.stringify(res.data));
    if(res.success){
      var features = []
      for (var e in res.data){
        var curr_event = res.data[e][0];
        document.getElementById('event-list').innerHTML+='<li>'+curr_event.name+'</li>'
        var feature = {'event':curr_event, position: new google.maps.LatLng(curr_event.lat, curr_event.lng)};
        features.push(feature);
      }
      displayMarkers(features, map);
    }
    else{
      alert(res.data);
      return;
    }
  });
}
//this function should open the pin data modal
var displayEventInfo = function(pin){
  console.log('CLICK')
  console.log('PIn: ' + JSON.stringify(pin.data))
   event_interesed = pin.data

  //displau event information
  document.getElementById('map-event-name').innerHTML=pin.data.name;
  if (pin.data.hasOwnProperty('attendies')){
    document.getElementById('attendies-interested').innerHTML='People going: ' + pin.data.attendies;
  }
  document.getElementById('interested-img').src = pin.data.picture;
  document.getElementById('map-event-description').innerHTML=pin.data.description;
  document.getElementById("modal-event").style.display='block'

}
function attendClicked(){
  //this is called when user clicks i want to go
  console.log('User wants to go');
  console.log('to event: ' + JSON.stringify(event_interesed));
  // in creasa the number of attendies
  $.post('/updateGig', {'id':event_interesed._id, 'query':{$inc:{'attendies':1}}}, res=>{
    if (res){
      console.log('Res: ' + JSON.stringify(res));
    }

    //for testing
    //
    if (event_interesed.hasOwnProperty('tickets')){
      console.log('logged in: ' +loggedIn);
      //if the gig is selling tickets: do stripe stuff
      // open ticket modal with options to promote the tickets, reffered link gives the promoter money
      if (loggedIn){
        document.getElementById('buy-ticket-username').hidden=true;
        document.getElementById('buy-ticket-password').hidden=true;
        document.getElementById('buy-ticket-email').hidden=true;
        document.getElementById('buy-ticket-password-confirm').hidden=true;
      }
      prepareCardElement();

    }
  });

  //display ticket modal
}
function displayMarkers(features, map){
  for (var i = 0; i < features.length; i++) {
      var marker = new google.maps.Marker({
        position: features[i].position,
        icon: pinSRC,
        animation:google.maps.Animation.DROP,
        map: map,
        data:features[i].event
    });
    google.maps.event.addListener(marker, 'click', displayEventInfo(marker));

  };
}

//time slider stuff:
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
 // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  console.log('Slider value: ' + slider.value);
}

//stripe card stuff

function prepareCardElement(){
  document.getElementById('modal-wrapper-credit').style.display='block';
  //STRIPE SECTION:
  //https://dashboard.stripe.com/test/dashboard -> dashboard
  //https://simpleprogrammer.com/stripe-connect-ultimate-guide/ -> tutorial for connect
  //https://stripe.com/docs/connect -> doc for connection

  //var stripe = Stripe('pk_live_DNKY2aDxqfPlR6EC7SVd0jmx00f1BVUG0b');
   var stripe = Stripe('pk_test_ZDSEcXSIaHCCNQQFwikWyDad0053mxeMlz');

  // Create an instance of Elements.
  var elements = stripe.elements();

  // Custom styling can be passed to options when creating an Element.
  // (Note that this demo uses a wider set of styles than the guide below.)
  var style = {
   base: {
     color: '#32325d',
     fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
     fontSmoothing: 'antialiased',
     fontSize: '16px',
     '::placeholder': {
       color: '#aab7c4'
     }
   },
   invalid: {
     color: '#fa755a',
     iconColor: '#fa755a'
   }
  };

  // Create an instance of the card Element.
  var card = elements.create('card', {style: style});

  // Add an instance of the card Element into the `card-element` <div>.
  card.mount('#card-element');

  // Handle real-time validation errors from the card Element.
  card.addEventListener('change', function(event) {
   var displayError = document.getElementById('card-errors');
   if (event.error) {
     displayError.textContent = event.error.message;
   } else {
     displayError.textContent = '';
   }
  });

  // Handle form submission.
  var form = document.getElementById('payment-form');
  form.addEventListener('submit', function(event) {
   event.preventDefault();

   stripe.createToken(card).then(function(result) {
     if (result.error) {
       // Inform the user if there was an error.
       var errorElement = document.getElementById('card-errors');
       errorElement.textContent = result.error.message;
     } else {
       // Send the token to your server.
       console.log(' TOKENNNNNN : ' + JSON.stringify(result));
       stripeTokenHandler(result.token);
     }
   });
  });

  // Submit the form with the token ID.
  function stripeTokenHandler(token) {
   // Insert the token ID into the form so it gets submitted to the server
   /*
   var form = document.getElementById('payment-form');
   var hiddenInput = document.createElement('input');
   hiddenInput.setAttribute('type', 'hidden');
   hiddenInput.setAttribute('name', 'stripeToken');
   hiddenInput.setAttribute('value', token.id);
   form.appendChild(hiddenInput);
   */
   attemptCreditSubmission(token.id);
   // Submit the form
//   form.submit();
  }
}

/*
<input id='buy-ticket-username' placeholder="username..."></input>
<input id='buy-ticket-email' placeholder='email...'></input>
<input id='buy-ticket-password' type='password'></input>
<input id='buy-ticket-password-confirm' type='password'></input>
*/
function attemptCreditSubmission(token_id){
  //var creditNum = document.getElementById("card-elem").value;
  document.getElementById("loader-new-card").style.display = "inline";
  console.log();
  console.log('TOKEN ID for card is: ' + token_id);
  if (!loggedIn){
    var username = document.getElementById('buy-ticket-username').value;
    var password = document.getElementById('buy-ticket-password').value;
    var email = document.getElementById('buy-ticket-email').value;
    var confirm = document.getElementById('buy-ticket-password-confirm').value;
    if (!email || email=='' || email == ' '){
      alert('Sorry you must enter your email to buy tickets. You can also sign in or register for an account at https://banda.com/  (if you want to skip this).');
      return;
    }
    if (!password || password=='' || password == ' '){
      alert('Sorry you must enter your password to buy tickets. You can also sign in or register for an account at https://banda.com/  (if you want to skip this).');
      return;
    }
    if (!confirm || confirm=='' || confirm == ' '){
      alert('Sorry you must enter a confirm password to buy tickets. You can also sign in or register for an account at https://banda.com/  (if you want to skip this).');
      return;
    }
    if (!username || username=='' || username == ' '){
      alert('Sorry you must enter a username to buy tickets. You can also sign in or register for an account at https://banda.com/  (if you want to skip this).');
      return;
    }
    if (confirm != password){
      alert('Sorry, your confirm password and password did not match. Please try again. You can also sign in or register for an account at https://banda.com/  (if you want to skip this).')
      return
    }
  }

  //gigID, username, email, passsord, card_token, referal
  if (referal){

  }
  else{
    $.post('/buyTicket', {'gigID':event_interesed._id, 'email':email, 'username':username, 'password':password, 'card_token':token_id}, res=>{
      alert(JSON.stringify(res));
      document.getElementById("loader-new-card").style.display = "none";
      document.getElementById("modal-wrapper-credit").style.display = 'none';
      document.getElementById("modal-wrapper-new-gig").style.display = 'block';
    });
  }

}

//useful fucntions

function parseURL(url){
  var parser = document.createElement('a'),
       searchObject = {},
       queries, split, i;
   // Let the browser do the work
   parser.href = url;
   // Convert query string to object
   queries = parser.search.replace(/^\?/, '').split('&');
   // textForSearchInput = textForSearchInput.substring(1,textForSearchInput.length);
   for( i = 0; i < queries.length; i++ ) {
       split = queries[i].split('=');
       searchObject[split[0]] = split[1];
   }
   return {
       protocol: parser.protocol,
       host: parser.host,
       hostname: parser.hostname,
       port: parser.port,
       pathname: parser.pathname,
       search: parser.search,
       searchObject: searchObject,
       hash: parser.hash
   };

}


function getReferer(){
  var urlJSON = parseURL(window.location)
  var searchObject = null;
  if (urlJSON.hasOwnProperty('searchObject')){
    searchObject = urlJSON.searchObject;

    if (searchObject.hasOwnProperty('referal')){
      var refData = searchObject.referal;
      var refPieces = refData.split('spacerspacer')
      var refUsername = refPieces[0];
      var refCode = refPieces[1]
      referal = {'username':refUsername, 'code':refCode};
    }
  }
}

function posErr(err){
  console.log(err)
  alert("Hmmm...it's taking too long to get your location. We are goign to try again after you click okay.");
  getLocationAndShowPosition();
}

function checkSession(){
  	$.get('/hasSession', {}, res=>{
      if (res.success){
        loggedIn = true;
      }
    });
}
