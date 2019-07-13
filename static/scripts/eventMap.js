console.log('Axript loaded');
const pinSRC = '/assets/Home/banda_b.png';
var event_interesed = null;
function initMap() {
  getLocationAndShowPosition();
}
function getLocationAndShowPosition() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPositionAndEvents);
  } else {
    console.log("browser doesnt support geolocator api");
  }
}

function showPositionAndEvents(position) {
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
    event_interesed.tickets=true;
    //
    if (event_interesed.hasOwnProperty('ticekts')){
      //if the gig is selling tickets: do stripe stuff
      // open ticket modal with options to promote the tickets, reffered link gives the promoter money

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

//  var stripe = Stripe('pk_live_DNKY2aDxqfPlR6EC7SVd0jmx00f1BVUG0b');
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
  console.log('got card: ' + card);
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
