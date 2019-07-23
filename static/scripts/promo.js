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
//CHANGE TO FLASE
var promoCreated = true;
var the_promo_ID = "";
//if the user has made gigS
var hasGigs = false;
var ourUser = {};


class SearchResult {

  constructor(obj){
    this.id = obj._id;
    this.name = obj.username;
    this.newDiv = document.createElement("div");
    this.newDiv.style.backgroundImage = "url('/assets/Home/Art/12.jpeg')"
    $.get('/picForUser', {'username':this.name}, res2=>{
      console.log('PIC RES:  ' + JSON.stringify(res2))

        if (res2=='None'){
          this.newDiv.style.backgroundImage = "url('/assets/Promo/bandapromo1.2.png')";
        }
        else{
          this.newDiv.style.backgroundImage="url("+res2+")";
        }
    });
    // overlay
    this.newOverlay = document.createElement("div");
    this.newOverlay.className = "result-overlay";
    this.overlayID = "result-overlay-"+this.id;
    this.newOverlay.addEventListener('click', function(){
      // nothing yet
    });
    this.newOverlay.setAttribute("id",this.overlayID);
    // follower count
    this.followerCount = document.createElement("p");
    this.followers = 'unknown';
    $.get('userSocialData',{'username':this.name}, res=>{
      console.log('userSocialData' + JSON.stringify(res));
      if (res.success){
        this.followers = res.data.followers
        this.followerCount.className = "follower-count-p";
        this.followerCount.innerHTML = "followers: "+this.followers;
        if (res.data.engagment != 0){
          console.log('has eng of: ' + res.data.engagment);
          this.engagement = res.data.engagment;
          this.engagementScore.className = "user-engagement-p";
          this.engagementScore.innerHTML = "engagement: "+this.engagement;
        }
        else{
          this.engagement = "unknown";
          this.engagementScore.className = "user-engagement-p";
          this.engagementScore.innerHTML = "engagement: unkown";
        }
      }
    });

    // figure out how many followers there are
    // TODO
    this.followerCount.className = "follower-count-p";
    this.followerCount.innerHTML = "followers: "+this.followers;
    // engage score
    this.engagementScore = document.createElement("p");

    // figure out total user engagement
    // TODO
    this.engagementScore.className = "user-engagement-p";
    this.engagementScore.innerHTML = "engagement: "+this.engagement;
    // button
    this.addContactBtn = document.createElement("input");
    this.addContactBtn.type = "button";
    this.addContactBtn.value = "add contact";
    this.addContactBtn.className = "add-contact-btn";
    // frame
    this.newFrame = document.createElement("img");
    this.newFrame.className = "result-frame";

    //
    this.newFrame.src = "/assets/Control-Center/redbox.png";
    this.newFrame.alt = "frame";
    // name
    this.nameDiv = document.createElement("div");
    this.nameDiv.className = "result-name-div";
    this.nameP = document.createElement("p");
    this.nameP.innerHTML = this.name;
    // appends
    this.newOverlay.appendChild(this.followerCount);
    this.newOverlay.appendChild(this.engagementScore);
    this.newOverlay.appendChild(this.addContactBtn);
    this.newDiv.appendChild(this.newOverlay);
    this.newDiv.appendChild(this.newFrame);
    this.nameDiv.appendChild(this.nameP);
    this.newDiv.appendChild(this.nameDiv);
    theGrid.appendChild(this.newDiv);
    // event listeners data preprocessing
    this.AddEventListeners(this);
  }

  AddEventListeners(obj){
    obj.newDiv.addEventListener("mouseover",function(){
      obj.newOverlay.style.zIndex = "8";
      obj.newOverlay.style.opacity = "1.0";
    },false);
    obj.newDiv.addEventListener("mouseout",function(){
      obj.newOverlay.style.zIndex = "-8";
      obj.newOverlay.style.opacity = "0";
    },false);
    obj.newDiv.addEventListener("click",function(){
      console.log(obj.id);
    },false);
    if(obj.hasOwnProperty('addContactBtn')){
      obj.addContactBtn.addEventListener("click",function(){
        sendContactRequest(obj.id, obj.name);
      });
    }
  }
}

function init(){
  setUpStepTwo();
  //checkUserSocials();
  // disable relevant buttons if they are already connected

  getGigs();
  document.getElementById('modal-wrapper-tos').style.visibility = "hidden";
  document.getElementById("modal-facebook-login-banda-modal-post").style.visibility = "hidden";

  var parsedURL =  parseURL(window.location.href);
  console.log("parsed url is below")

  console.log(JSON.stringify(parsedURL));
  if(parsedURL.hasOwnProperty('searchObject') && parsedURL.searchObject != null){
    console.log("parse url has property!!!!!!!!!!!!")
    if(parsedURL.searchObject.isPromo == 'true'){
      userClickStart();
      console.log(parsedURL)
      if(parsedURL.searchObject.isInsta == true){
        console.log("populating instagram modal")
        populateSelectSocialPageModal(parsedURL.searchObject.pages, true);
      }
      if(parsedURL.searchObject.hasOwnProperty('pages') && !(parsedURL.searchObject.hasOwnProperty('isInsta'))){ //ensure isInsta isn't there, cuz i don't think we set it to false on facebook redirect
        populateSelectSocialPageModal(parsedURL.searchObject.pages, false);
      }
    }
  }


}
function getGigs(){
  $.get('/user', {'query':'nada'}, res=>{
    if (res==""){
      console.log('There was an error finding user info for our user.');
      return;
    }
    else{
      ourUser = res;
      console.log('Our user is: ' + JSON.stringify(ourUser));
      var username = res.username;
      $.get('/getGigs', {'creator':ourUser.username}, res=>{
        if (res==""){
          console.log('There was an error getting our gigs.');
          return;
        }
        else{
          var ourGigs = res;
          populateDropDown(ourGigs);
        }
      });
    }
  });
}

function populateDropDown(ourGigs){
  var selector = document.getElementById('coupon-select');
  if (ourGigs==null){
    hasGigs = false;
    return;
  }
  else{
    hasGigs = true;
    for (var g in ourGigs){
      var currGig = ourGigs[g];
      var gigDropTitle=document.createElement('option');
      gigDropTitle.innerHTML=currGig.name;
      gigDropTitle.setAttribute('value',currGig._id);
      gigDropTitle.setAttribute('id', currGig._id);
      selector.appendChild(gigDropTitle);
    }
  }


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
       queries, split;
   // Let the browser do the work
   if(url.includes('?')){
     let pageURL = window.location.href;
     parser.hash = pageURL;
     var urlAux = pageURL.split('#?');
     var urlVarStr = urlAux[1];
     queries = urlVarStr.split('&');

     // detect Twitter
     if(queries.length == 1){
       var isPromoSplit = queries[0].split('=');
       var isPromo = isPromoSplit[1];
       searchObject['isPromo'] = isPromo;
       return {searchObject: searchObject};
     }

     if(queries[queries.length-1].split('=')[0] == 'isInsta' && queries[queries.length-1].split('=')[1] == 'true'){
       console.log("this is an insta page")
       var pageNumSplit = queries[queries.length-3].split('=');
       var numPages = pageNumSplit[1];
       var isPromoSplit = queries[queries.length-2].split('=');
       var isPromo = isPromoSplit[1];
       searchObject['numPages'] = numPages;
       searchObject['isPromo'] = isPromo;
       searchObject['isInsta'] = true
       searchObject['pages'] = [];
       let i = 0;
       while(i<(2*numPages)){
        console.log('looping a page');
        var nameSplit = queries[i].split('=');
        var idSplit = queries[i+1].split('=');
        var page = {
          'id': idSplit[1],
          'name': nameSplit[1].replace('%20',' ')
        };
        searchObject['pages'].push(page);
        i+=2;
       }
       console.log(searchObject)
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
     var pageNumSplit = queries[queries.length-2].split('=');
     var numPages = pageNumSplit[1];
     var isPromoSplit = queries[queries.length-1].split('=');
     var isPromo = isPromoSplit[1];

     searchObject['numPages'] = numPages;
     searchObject['isPromo'] = isPromo;
     searchObject['pages'] = [];
     console.log(searchObject['numPages'] +  " is the num pages")
     var i = 0;
     while(i<(2*numPages)){
       console.log('looping a page');
       var nameSplit = queries[i].split('=');
       var idSplit = queries[i+1].split('=');
       var page = {
         'id': idSplit[1],
         'name': nameSplit[1].replace('%20',' ')
       };
       searchObject['pages'].push(page);
       console.log(searchObject)
       i+=2;
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
   }else{
     return{
       nothing: 'nothing!'
     };
   }
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
    alert('Sorry, you must give your promotion a image to save it.');
    return;
  }
  else{
    console.log('FILE IS: '+ JSON.stringify($("#promo-file")[0].files[0]));
    if (!($("#promo-file")[0].files[0].type=='image/jpeg' || $("#promo-file")[0].files[0].type=='image/png')){
      alert('Sorry, the file you select must be a valid image ending with .jpeg or .png');
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
    medias.push('instagram');
  }
  if (promotionOnSocial3){
    medias.push('snapchat');
  }
  if (promotionOnSocial4){
    medias.push('twitter');
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
            $.post('/promotion', {'name':name, 'caption':desc, 'location':loc, 'medias':medias, 'imgURL':imageURL, 'handles':url_text}, res=>{
              alert(res.message);
              console.log('PROMO RES: ' + JSON.stringify(res));
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
  document.getElementById("promo-fb").classList.toggle('deactivated-social');
  promotionOnSocial1 = !promotionOnSocial1;
}
function clickedSocial2(){
  document.getElementById("promo-insta").classList.toggle('deactivated-social');
  // promotionOnSocial2 = !promotionOnSocial2;
}
function clickedSocial3(){
  document.getElementById("promo-snap").classList.toggle('deactivated-social');
  // promotionOnSocial3 = !promotionOnSocial3;
}
function clickedSocial4(){
  document.getElementById("promo-twitter").classList.toggle('deactivated-social');
  promotionOnSocial4 = !promotionOnSocial4;
}

function submit_coupon(){
  console.log('clicked submit coupon');
  if (!hasGigs){
    console.log('User has no gigs');
    alert('Sorry, you must create an event to create a coupon. Coupons are tied to a specific event you have created so that we can autofill information and optimize your promotions reach. Go to "home" on the Banda "b" and click "post event" to create an event.');
    return;
  }
    console.log('User has not created a promo on this page yet.');
    $.get('/aUserPromo', {'stuff':'lol'}, res=>{
      if (!res.success){
        console.log('User promo failed');
        alert('Sorry, you must create and save a promotion first in order to create a coupon. We need the information from the promotion form to optimize your coupons reach.');
        return;
      }
      else{
        if (res.data==null){
          alert('Sorry, you must create and save a promotion first in order to create a coupon. We need the information from the promotion form to optimize your coupons reach.');
          return;
        }
        else{
          if (res.data.length==0){
            alert('Sorry, you must create and save a promotion first in order to create a coupon. We need the information from the promotion form to optimize your coupons reach.');
            return;
          }
          else{
            var thePromo = res.data[res.data.length-1];
            var promoID = thePromo._id;
            var coupBody = document.getElementById("coupon-text").value;
            if (coupBody == "" || coupBody == " "){
              alert('Sorry, you must write a non-blank description for your coupon to save it. The description is where you write the details of what the coupon grants a customer, (ex. "5% off your first drink of the night").')
              return;
            }
            else{
              var selectedGig = $('#coupon-select option:selected').data();
              console.log('options: ' + JSON.stringify($('#coupon-select option:selected')));
              console.log('GIG: ' + JSON.stringify(selectedGig));
              selectedGig=selectedGig['id'];
              console.log('Seleced gig: ' + selectedGig);
              var gigID = $('#coupon-select option:selected').val();
              console.log('gigID for promo: ' + gigID);
              $.post('/createDiscountPromo', {'gigID':gigID, 'promoID':promoID, 'details':coupBody}, res2=>{
                console.log('got in res for create coupon')
                if (res2==null){
                  alert('Hmmm....something went wrong on our end. Please refreash the page an try again. If this problem persits contact our live support tean by clicking on the Banda "b" and then clicking "support".');
                  return;
                }
                else if (res2=="" || res2==" "){
                  alert('Hmmm....something went wrong on our end. Please refreash the page an try again. If this problem persits contact our live support tean by clicking on the Banda "b" and then clicking "support".');
                  return;
                }
                else{
                  alert(res2);
                  return;
                }
              });
            }

          }
        }

      }
    });
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
      if(hasTwitter){
        document.getElementById('connect-twitter-button').href = "#";
        document.getElementById('connect-twitter-button').className = 'deactivated-social-buttons';
      }
      if(hasFB){
        document.getElementById('connect-fb-button').href = "#";
        document.getElementById('connect-fb-button').className = 'deactivated-social-buttons';
      }
      if(hasInsta){
        document.getElementById('connect-insta-button').href = "#";
        document.getElementById('connect-insta-button').className = 'deactivated-social-buttons';
      }
    }
    else{
      console.log('There was an error using this route');
      return;
    }
  });
}
document.getElementById("search-bar-input").addEventListener('keyup', function(e){
  console.log('KEY UP code: ' + e.keyCode);
  var keyCode = e.keyCode || e.which;
  if (keyCode === 13) {
    e.preventDefault();
    promoSearch();
  }
});

var theGrid = null;

function promoSearch(){
  theGrid = document.getElementById("grid-container");
  theGrid.style.display = "grid";
  while(theGrid.hasChildNodes()){
    console.log("removing children");
    theGrid.removeChild(theGrid.lastChild);
  }
  console.log('PErform serach');
  var searchText = $("#search-bar-input").val();
  console.log('SEARCH: ' + searchText);
  if (searchText==" " || searchText==''){
    alert('Sorry, you must eneter search text to perform a search.');
    return;
  }
  var zipcode = $('#step-3-zip').val();
  if (zipcode=="" || zipcode==" " ){
    alert('Sorry, you must enter a zipcode to perform a promoter search. We do this to let you target specific areas.');
    return;
  }
  var mySearch = {'zipcode':zipcode, 'text':searchText};
  convertZip(mySearch);
  console.log('searchText: ' + searchText);

}

function convertZip(mySearch){
  var zipcode = mySearch.zipcode;
  if (!(zipcode.length==5)){
    alert('Please enter a valid zipcode.');
    return;
  }
  var success = false;
  setTimeout(function() {
    if (!success)
    {
        // Handle error accordingly
        console.log("Got error with zipcode");
        alert("Please enter a valid zipcode.");
        return;
    }
  }, 5000);
    $.getJSON('https://api.openweathermap.org/data/2.5/weather?zip='+zipcode+',us&APPID=f89469b4b424d53ac982adacb8db19f6').done(function(data){
      console.log(JSON.stringify(data));
      success=true;
      var lat = data.coord.lat;
      var lng = data.coord.lon;
      $.get('/search_promos', {'lat':lat, 'lng':lng, 'searchText':mySearch.text}, res3=>{
        if (res3['data']['overallMatchers']==undefined || res3['data']['overallMatchers']==null){
          alert('Sorry, you must create a promotion to search for promoters.');
          return;
        }
        fillResultsTable(res3['data']['overallMatchers']);
         console.log(JSON.stringify(res3['data']['overallMatchers']));
      });
  });
}

function fillResultsTable(resArr){
  console.log("RESULTS ARRAY: ");
  console.log(resArr);
  var results = [];
  for(user in resArr){
    results[user] = new SearchResult(resArr[user][0]);
  }
}
function sendContactRequest(recieverID, name){
  var now = new Date().toString();
  console.log('about to send contact request: sender id: ' + ourUser._id)
  console.log('reciever id is: ' + recieverID);
  $.post('/messages', {'senderID':ourUser._id, 'recieverID':recieverID, 'body':'<button class="chat-wants-connect-btn" id="'+recieverID+'">'+ourUser.username+'wants to connect with you.</button>', 'timeStamp':now}, res=>{
    alert('We have sent your contact request to ' + name + ' check your contacts tab often to see if they have accepted, and been added to your contacts.');
    $.post('/connectNotification', {'askerID':ourUser._id, 'friendID':recieverID}, res2=>{
      if (res2){
        if (!(res2=="")){
          alert(res2);
        }
      }
    })
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

function populateSelectSocialPageModal(data, isInsta){
  console.log(data);
  if(isInsta){
    console.log("this is an insta route request button!!!!!!!!!!")
    var selector = document.getElementById("ssp-insta-select");
    jQuery(function($) {
      $('#ssp-insta-select').change(function () {
        var optionSelected = $(this).find("option:selected");
        var valueSelected  = optionSelected.val();
        var textSelected   = optionSelected.text();
        console.log(optionSelected)
        console.log("VALUE SELECTED IS: "+valueSelected);
        console.log("TEXT SELECTED IS: "+textSelected);
      });
    });
    for(var index in data){
      console.log(data)
      var page = document.createElement('option');
      page.value = data[index].id;
      page.innerHTML = data[index].name;
      selector.append(page);
    }
    document.getElementById('ssp-submit').style.display = 'none';
    document.getElementById('ssp-submit-inst').style.display = 'block'
    document.getElementById('modal-wrapper-select-social-page-insta').style.display = 'block';
  }else{
    var selector = document.getElementById("ssp-select");
    jQuery(function($) {
      $('#ssp-select').change(function () {
        var optionSelected = $(this).find("option:selected");
        var valueSelected  = optionSelected.val();
        var textSelected   = optionSelected.text();
        console.log("VALUE SELECTED IS: "+valueSelected);
        console.log("TEXT SELECTED IS: "+textSelected);
      });
    });
    for(var index in data){
      var page = document.createElement('option');
      page.value = data[index].id;
      page.innerHTML = data[index].name;
      selector.append(page);
    }
    document.getElementById('ssp-submit').style.display = 'block';
    document.getElementById('ssp-submit-inst').style.display = 'none'
    document.getElementById('modal-wrapper-select-social-page').style.display = 'block';
  }
}

function selectMainFacebookPage(){
  // ED LOOK HERE
  jQuery(function($) {
    var optionSelected = $("#ssp-select").find("option:selected");
    var valueSelected  = optionSelected.val(); // the page ID
    var textSelected   = optionSelected.text(); // the page name
    console.log("VALUE SELECTED IS: "+valueSelected);
    console.log("TEXT SELECTED IS: "+textSelected);
    console.log("this will post to the facebook route")

    //make post request to store the page token and page statistics
    $.post('https://www.banda-inc.com/getFBPageToken', {pageId: valueSelected, pageName: textSelected}, res=>{
      alert(res);
      document.getElementById("modal-wrapper-select-social-page").style.display = "none";
      document.getElementById('modal-wrapper-tos').style.visibility = "visible";
    });
  });
}

function selectMainInstagramPage(){
  jQuery(function($) {
    var optionSelected = $("#ssp-select").find("option:selected");
    console.log(optionSelected);
    var valueSelected  = optionSelected.val(); // the page ID
    var textSelected   = optionSelected.text(); // the page name
    var instagramUsername = document.getElementById("instagramUsername").value;
    console.log("VALUE SELECTED IS: " + valueSelected);
    console.log("TEXT SELECTED IS: " + textSelected);
    if(instagramUsername == ''){
      alert("Please enter your instagram username!")
      return;
    }
    console.log("this will post request the insta route")
    // //make post request to store the page token and page statistics
    console.log(valueSelected +  " Is the page id");
    $.post('https://www.banda-inc.com/storeInstData', {pageId: valueSelected, pageName: textSelected, username: instagramUsername}, res=>{
      alert(res);
      document.getElementById("modal-wrapper-select-social-page-insta").style.display = "none";
      document.getElementById("modal-wrapper-select-social-page").style.display = "none";
    });
  });
}

function postFacebookLoginSubmit(){
  //boothe look here for post
  const facebookUsername = $("#facebookPostingEmail").val();
  const facebookPassword = $("#facebookPostingPassword").val();
  const requestObject = {"post_permission":true, "data_permission" :true, "username":facebookUsername, "password": facebookPassword };
  // todo: post the request object to the  server, hash the  password and store it
}
//document.getElementById("modal-facebook-login-banda-modal-post").style.visibility