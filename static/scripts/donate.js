console.log('DONATE SCRIPT LOADED')



function prepareCardElement(){
  document.getElementById('modal-wrapper-credit-tickets').style.display='block';
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

    var email = document.getElementById('doante-email').value;
    if (!email || email =='' || email==' ' || !email.includes('@')){
      alert('Sorry, you must submit a valid email for your security.')
    }
    else{
      attemptCreditSubmission(token.id, email);
      console.log('email is: ' + email)
    }
   // Insert the token ID into the form so it gets submitted to the server
   /*
   var form = document.getElementById('payment-form');
   var hiddenInput = document.createElement('input');
   hiddenInput.setAttribute('type', 'hidden');
   hiddenInput.setAttribute('name', 'stripeToken');
   hiddenInput.setAttribute('value', token.id);
   form.appendChild(hiddenInput);
   */

   // Submit the form
//   form.submit();
  }
}

function attemptCreditSubmission(token_id, email){

  //var creditNum = document.getElementById("card-elem").value;
  document.getElementById("loader-new-card").style.display = "inline";
  console.log();
  console.log('TOKEN ID for card is: ' + token_id);
  amount = document.getElementById('donate-amount').value;
  if (!amount || amount=='' || amount==' '){
    alert('Sorry, you must enter an amount.');
    return
  }
  if (amount<1){
    alert('Sorry, for us to use Stripe we must transfer at least 1 dollar. If you would like to donate less, no problem! You can Venmo us.\nThank You!')
    return
  }
  //gigID, username, email, passsord, card_token, referal
  $.post('/createDonator', {'card_token':token_id, 'email':email}, res=>{
    alert(res);
    $.post('/makeDonation',{'email':email, "amount":amount}, res2=>{
      if (res2){
        alert('Sorry, it seems there was an error on our end. Please refresh and try again. Thank you so much for you patience.');
      }
      else{
        alert('Thank you so much for your help in making this dream a reality. If you want check https://banda-inc.com regularly to see our latest updates and soloutions for the music industry!\nWe truely appreciate it.\nYou have been emailed a certificate.')
      }
    })

  });
}

prepareCardElement();
