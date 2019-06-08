// Globals
var createCouponState = false;

function init(){
  setUpStepTwo();
}

function setUpStepTwo(){
  document.getElementById("left-step").addEventListener("click",function(){
    if(!createCouponState){
      // already creating a promo, do nothing.
    }
    else{
      createCouponState = false;
      document.getElementById("right-step").classList.toggle('selected');
      document.getElementById("left-step").classList.toggle('selected');
      document.getElementById("coupon-div").style.display = 'none';
      document.getElementById("promo-div").style.display = 'block';
    }
  });
  document.getElementById("right-step").addEventListener("click",function(){
    if(createCouponState){
      // already creating a coupon, do nothing.
    }
    else{
      createCouponState = true;
      document.getElementById("right-step").classList.toggle('selected');
      document.getElementById("left-step").classList.toggle('selected');
      document.getElementById("promo-div").style.display = 'none';
      document.getElementById("coupon-div").style.display = 'block';
    }
  });
  document.getElementById("promo-file-preview").addEventListener("click",function(){
    $("#promo-file").trigger('click');
  });
}

function linkFacebook(){
  // TODO
}

function linkSnapchat(){
  // TODO
}

function linkTwitter(){
  // TODO
}

function linkInstagram(){
  // TODO
}

function userClickStart(){
  var btn = document.getElementById('get-started-btn');
  btn.onclick = "";
  document.getElementById('step-1-content').style.display = 'block';
  document.getElementById("step-1-h1").classList.toggle('deactivated');
  document.getElementById("step-1-h2").classList.toggle('deactivated');
  document.getElementById("step-1").classList.toggle('deactivated-step');
  document.getElementById('step-1').scrollIntoView(true);
}

function finishStepOne(){
  // show step 2
  document.getElementById("step-2").classList.toggle('deactivated-step');
  document.getElementById('step-2-content').style.display = 'block';
  document.getElementById("step-2-h1").classList.toggle('deactivated');
  document.getElementById("left-step").classList.toggle('deactivated');
  document.getElementById("right-step").classList.toggle('deactivated');
  if(createCouponState){
    document.getElementById("right-step").classList.toggle('selected');
    document.getElementById("coupon-div").style.display = 'block';
  }else{
    document.getElementById("left-step").classList.toggle('selected');
    document.getElementById("promo-div").style.display = 'block';
  }
  // deactivate step 1
  document.getElementById("step-1").classList.toggle('deactivated-step');
  document.getElementById('step-1-content').style.display = 'none';
  document.getElementById("step-1-h1").classList.toggle('deactivated');
  document.getElementById("step-1-h2").classList.toggle('deactivated');
  document.getElementById('step-2').scrollIntoView(true);

}

function goBackToStepOne(){
  document.getElementById("step-2").classList.toggle('deactivated-step');
  document.getElementById('step-2-content').style.display = 'none';
  document.getElementById("step-2-h1").classList.toggle('deactivated');
  document.getElementById("right-step").classList.toggle('deactivated');
  document.getElementById("left-step").classList.toggle('deactivated');
  if(createCouponState){
    document.getElementById("right-step").classList.toggle('selected');
  }else{
    document.getElementById("left-step").classList.toggle('selected');
  }

  document.getElementById("step-1").classList.toggle('deactivated-step');
  document.getElementById('step-1-content').style.display = 'block';
  document.getElementById("step-1-h1").classList.toggle('deactivated');
  document.getElementById("step-1-h2").classList.toggle('deactivated');

  document.getElementById('step-1').scrollIntoView(true);
}

function finishStepTwo(){
  document.getElementById("step-2").classList.toggle('deactivated-step');
  document.getElementById('step-2-content').style.display = 'none';
  document.getElementById("step-2-h1").classList.toggle('deactivated');
  document.getElementById("right-step").classList.toggle('deactivated');
  document.getElementById("left-step").classList.toggle('deactivated');
  if(createCouponState){
    document.getElementById("right-step").classList.toggle('selected');
  }else{
    document.getElementById("left-step").classList.toggle('selected');
  }

  document.getElementById("step-3").classList.toggle('deactivated-step');
  document.getElementById('step-3-content').style.display = 'block';
  document.getElementById("step-3-h1").classList.toggle('deactivated');
  document.getElementById("step-3-h2").classList.toggle('deactivated');

  document.getElementById("step-3").scrollIntoView(true);

}

function goBackToStepTwo(){
  document.getElementById("step-3").classList.toggle('deactivated-step');
  document.getElementById('step-3-content').style.display = 'none';
  document.getElementById("step-3-h1").classList.toggle('deactivated');
  document.getElementById("step-3-h2").classList.toggle('deactivated');

  document.getElementById("step-2").classList.toggle('deactivated-step');
  document.getElementById('step-2-content').style.display = 'block';
  document.getElementById("step-2-h1").classList.toggle('deactivated');
  document.getElementById("right-step").classList.toggle('deactivated');
  document.getElementById("left-step").classList.toggle('deactivated');
  if(createCouponState){
    document.getElementById("right-step").classList.toggle('selected');
  }else{
    document.getElementById("left-step").classList.toggle('selected');
  }

  document.getElementById("step-2").scrollIntoView(true);
}

function finishStepThree(){
  // Todo
}


//Minh CODE:
function displayUploadImage(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#upload-image')
                .attr('src', e.target.result)
                .width(200)
                .height(200);
        };

        reader.readAsDataURL(input.files[0]);
    }
}

function showCreatePromo(){
    var promo =  document.getElementById("create-your-promotion-body");
    if (promo.style.display === "none") {
        promo.style.display = "block";
      } else {
        promo.style.display = "none";
      }
}

function showCreateSpecialPromo(){
    var promo =  document.getElementById("create-special-promo-body");
    if (promo.style.display === "none") {
        promo.style.display = "block";
      } else {
        promo.style.display = "none";
      }
}

function parseURL(url){
  var parser = document.createElement('a'),
       searchObject = {},
       queries, split, i;
   // Let the browser do the work
   parser.href = url;
   // Convert query string to object
   queries = parser.search.replace(/^\?/, '').split('&');
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

function submit_promotion(){

}
function submit_coupon(){

}
function checkUserSocials(){
  $.get('/user_has_socials', {'name':'anything'}, res=>{
    console.log(res);
    if(res.success){

      console.log('SOCIALS FRO USER IS (true means we already have their info for that social): ' + JSON.stringify(res.data));
    }
    else{
      console.log('There was an error using this route');
      return;
    }
  });
}

function requestSupport(){
  var supportText = document.getElementById("request-support-textarea").value;
  console.log("User has requested support, text is: ");
  console.log(supportText);
  if (supportText == "" || supportText == " " || supportText == null){
    alert('Please enter some text to send to us if you would like to receive help. Thank You!');
    return;
  }
  $.post('/contact_support', {message: supportText}, res=>{
    alert(res);
    var modal = document.getElementById("modal-wrapper-support");
    modal.style.display = "none";
  });
}
