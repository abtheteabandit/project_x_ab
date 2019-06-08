// Globals
var createCouponState = false;
//user has logged in to these socials
var hasSnap = false;
var hasInsta = false;
var hasFB = false;
var hasYT = false;
var hasTwitter = false;

// user has created a promo targeting these socials
var promotionOnSocial1 = false;
var promotionOnSocial2 = false;
var promotionOnSocial3 = false;
var promotionOnSocial4 = false;

// for seeing if we have enoguh info to do a coupon
var promoCreated = false;
function init(){
  setUpStepTwo();
  checkUserSocials();
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

//BOOTH CODE SECTION
function displayUploadImage(input) {
  console.log('GOT IN DISPLAY')
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#promo-file-preview')
                .attr('src', e.target.result)
                .width(200)
                .height(200);
        };

        reader.readAsDataURL(input.files[0]);
    }
}

function submit_promotion(){
  console.log('SAVE PROMO HIT')
  var name = document.getElementById('promo-name').value;
  console.log('PROMO NAME: ' + name)
  if (name == " " || name == null){
    alert('Sorry, you must give your promotion a name to save it.');
    return;
  }
  var loc = document.getElementById('promo-loc').value;
  if (name == " " || name == null){
    alert('Sorry, you must give your promotion a location to save it.');
    return;
  }
  var url_text = document.getElementById('promo-url').value;
  if (url_text == " " || url_text == null){
    alert('Sorry, you must give your promotion a name to save it. This url is what user traffic will be driven to.');
    return;
  }
  var desc = document.getElementById('promo-description').value;
  if (desc == " " || desc == null){
    alert('Sorry, you must give your promotion a caption to save it.');
    return;
  }
  if(!($("#promo-file")[0].files && $("#promo-file")[0].files[0])){
    alert('Sorry, you must give your promotion a image or video to save it.');
    return;
  }
  else{
    console.log('FILE IS: '+ JSON.stringify($("#promo-file")[0].files[0]));
    if (!($("#promo-file")[0].files[0].type=='image/jpeg' || $("#promo-file")[0].files[0].type=='image/png' || $("#promo-file")[0].files[0].type=='video/mp4')){
      alert('Sorry, the file you select must be a valid image ending with .jpeg or .png or a valid video ending with .mp4');
      return;
    }
  }
  if (!promotionOnSocial1 && !promotionOnSocial2 && !promotionOnSocial3 && !promotionOnSocial4){
    alert('Sorry, you must select at least one social media to target with this pomotion. You can click on your targted medias at the bottom of the form.');
    return;
  }
  var medias = []
  if (promotionOnSocial1){
    medias.push('facebook');
  }
  if (promotionOnSocial2){
    medias.push('snapchat');
  }
  if (promotionOnSocial3){
    medias.push('twitter');
  }
  if (promotionOnSocial4){
    medias.push('instagram');
  }
  var formdata = new FormData;
  var promoPic = $("#promo-file")[0].files[0];
  formdata.append('promoPic', promoPic);
  $.ajax({
      url: '/uploadPromoPic',
      data: formdata,
      contentType: false,
      processData: false,
      type: 'POST',
      'success':function(data){
        if (data){
          if (data == "Wrong mimeType"){
            alert('Sorry, currently we only support .png or .jpeg files for promotions.');
            return;
          }
          else{
            var imageURL = 'www.banda-inc.com/'+data;
            console.log('GOT RES FROM UPLOAD: ' + imageURL);
            $.post('/promotion', {'name':name, 'caption':desc, 'location':loc, 'medias':medias, 'imageURL':imageURL, 'handles':url_text}, res=>{
              alert(res);
              promoCreated = true;
            });
          }
        }
        else{
          alert('Hmmm...it seems something went wrong with uploading your file. Please refresh the page and try again. If this problem persists please email us using "support" from the Banda "b". Thank you.')
          return;
        }
      }
    });
  //


}
//CLICKS for selecting socials for promo
function clickedSocial1(){
  promotionOnSocial1 = true;
}
function clickedSocial2(){
  promotionOnSocial2 = true;
}
function clickedSocial3(){
  promotionOnSocial3 = true;
}
function clickedSocial4(){
  promotionOnSocial4 = true;
}

function submit_coupon(){
  console.log('clicked submit coupon');
}
function checkUserSocials(){
  $.get('/user_has_socials', {'name':'anything'}, res=>{
    console.log(res);
    if(res.success){
      if(res.data.twitter){
        hasTwitter=true;
      }
      if(res.data.facebook){
        hasFB=true;
      }
      if(res.data.instagram){
        hasInsta=true;
      }
      if(res.data.snapchat){
        hasSnap=true;
      }
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
