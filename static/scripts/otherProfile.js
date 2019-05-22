
//global vars
var user = null;
var otherGig=null;
var otherBand=null;
var myBand=null;
var myGig = null;
var userContacts = {};
var userMessages={};
var selectedMobileProfile = {};
class SampleCarousel{
  constructor(sampleCarCallback){
    this.carWrap = document.createElement("div");
    this.carWrap.className = "jcarousel-wrapper";
    this.carousel = document.createElement("div");
    this.carousel.className = "jcarousel";
    this.list = document.createElement("ul");
    for(var sample in otherBand.audioSamples){
      var newItem = document.createElement("li");
      newItem.className = "carousel-li";
      newItem.audio = new Audio();
      newItem.audio.src = otherBand.audioSamples[sample].audio;
      newItem.audio.type = "audio/mp3";
      // img
      var newImg = document.createElement("img");
      newImg.className = "carousel-img";
      newImg.src = otherBand.audioSamples[sample].picture;
      // frame
      var newFrame = document.createElement("img");
      newFrame.className = "carousel-frame";
      newFrame.src = "/assets/Control-Center/purplebox.png";
      newItem.imgObj = newImg;
      newItem.append(newImg);
      newItem.append(newFrame);
      this.list.append(newItem);
      newItem.addEventListener("mouseover",function(){
        newItem.imgObj.style.opacity = "0.8";
        var playPromise = newItem.audio.play();
        if(playPromise != undefined){
          playPromise.then(function () {
          	 // console.log('Playing....');
          }).catch(function (error) {
          	 console.log('Failed to play....' + error);
          });
        }
      },false);
      newItem.addEventListener("mouseout",function(){
        newItem.imgObj.style.opacity = "1.0";
        newItem.audio.pause();
      },false);
    }
    this.carousel.append(this.list);
    if(otherBand.audioSamples.length + 1 > 4){
      // only add arrow controls if the carousel has enough data
      this.prev = document.createElement("a");
      this.prev.className = "jcarousel-control-prev";
      this.prev.href = "#";
      this.next = document.createElement("a");
      this.next.className = "jcarousel-control-next";
      this.next.href = "#";
      this.carWrap.append(this.prev);
      this.carWrap.append(this.next);
    }
    this.carWrap.append(this.carousel);
    sampleCarCallback(this);
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

function populateDropDown(myUser, myBands, myGigs){
  console.log(" ");
  console.log("In pop drop down");
  console.log(" *** ");
  console.log("USER: "+JSON.stringify(myUser)+" BANDS: "+JSON.stringify(myBands)+"GIGS: "+JSON.stringify(myGigs));
  console.log(" ");
  if(myUser==null || myUser=="" || myUser==" " || myUser=="null"){
    var selectMenu = document.getElementById('selectDrop');
  //  var userDropTitle = document.createElement('<option value="'+myUser._id+'">'+myUser.username+'</option>');
    var userDropTitle=document.createElement('option');
    userDropTitle.innerHTML=myUser.username;
    userDropTitle.setAttribute('value','user');
    userDropTitle.setAttribute('id', 'userDropTitle');
    selectMenu.appendChild(userDropTitle);

    var newMobileNavA = document.createElement("a");
    newMobileNavA.innerHTML = myUser.username;
    newMobileNavA.href = "#";
    var profilesMobileListDiv = document.getElementById("mobile-profiles-list");
    newMobileNavA.setAttribute('value','user');
    newMobileNavA.setAttribute('id', 'userDropTitleMobile');
    profilesMobileListDiv.append(newMobileNavA);
    var profilesMobileListDivBands = document.getElementById("mobile-profiles-list-bands");
    profilesMobileListDivBands.append(newMobileNavA2);


    return;
  }
  var selectMenu = document.getElementById('selectDrop');
//  var userDropTitle = document.createElement('<option value="'+myUser._id+'">'+myUser.username+'</option>');
  var userDropTitle=document.createElement('option');
  userDropTitle.innerHTML=myUser.username;
  userDropTitle.setAttribute('value','user');
  userDropTitle.setAttribute('id', 'userDropTitle');
  selectMenu.appendChild(userDropTitle);

  var profilesMobileListDiv = document.getElementById("mobile-profiles-list");
  var profilesMobileListDivBands = document.getElementById("mobile-profiles-list-bands");
  var newMobileNavA = document.createElement("a");
  newMobileNavA.innerHTML = myUser.username;
  newMobileNavA.href = "#";
  newMobileNavA.className = "mobile-profiles-list-a-active";
  newMobileNavA.setAttribute('value','user');
  newMobileNavA.dataID = myUser._id;
  newMobileNavA.dataType = "user";
  newMobileNavA.dataName = myUser.username;
  profilesMobileListDiv.append(newMobileNavA);
  newMobileNavA.addEventListener("click",function(){
    selectProfileOnMobile(newMobileNavA);
  });
  var newMobileNavA2 = document.createElement("a");
  newMobileNavA2.innerHTML = myUser.username;
  newMobileNavA2.href = "#";
  newMobileNavA2.className = "mobile-profiles-list-a-active";
  newMobileNavA2.setAttribute('value','user');
  newMobileNavA2.dataID = myUser._id;
  newMobileNavA2.dataType = "user";
  newMobileNavA2.dataName = myUser.username;
  profilesMobileListDivBands.append(newMobileNavA2);
  newMobileNavA2.addEventListener("click",function(){
    selectProfileOnMobile(newMobileNavA2);
  });
  selectedMobileProfile.dataName = myUser.username;
  selectedMobileProfile.dataID = myUser._id;
  selectedMobileProfile.dataType = "user";
  console.log("AB NOTE");

  for (band in myBands){
    var bandTitle=document.createElement('option');
    bandTitle.innerHTML=myBands[band].name;
    bandTitle.setAttribute('value','band');
    bandTitle.setAttribute('data-objID', myBands[band]._id);
    bandTitle.setAttribute('id', 'band'+band+'DropTitle');
    selectMenu.appendChild(bandTitle);

    var newBandMobile = document.createElement("a");
    newBandMobile.innerHTML = myBands[band].name;
    newBandMobile.href = "#";
    newBandMobile.className = "mobile-profiles-list-a";
    newBandMobile.setAttribute('value','band');
    newBandMobile.dataID = myBands[band]._id;
    newBandMobile.dataType = "band";
    newBandMobile.setAttribute('id', 'band'+band+'MobileDropTitle');
    profilesMobileListDiv.append(newBandMobile);
    newBandMobile.addEventListener("click",function(){
      selectProfileOnMobile(newBandMobile);
    });
    var newBandMobile2 = document.createElement("a");
    newBandMobile2.innerHTML = myBands[band].name;
    newBandMobile2.href = "#";
    newBandMobile2.className = "mobile-profiles-list-a";
    newBandMobile2.setAttribute('value','band');
    newBandMobile2.dataID = myBands[band]._id;
    newBandMobile2.dataType = "band";
    newBandMobile2.setAttribute('id', 'band'+band+'MobileDropTitle');
    profilesMobileListDivBands.append(newBandMobile2);
    newBandMobile2.addEventListener("click",function(){
      selectProfileOnMobile(newBandMobile2);
    });
  }
  for (gig in myGigs){
    var gigTitle=document.createElement('option');
    gigTitle.innerHTML=myGigs[gig].name;
    gigTitle.setAttribute('value','gig');
    gigTitle.setAttribute('data-objID', myGigs[gig]._id);
    gigTitle.setAttribute('id', 'gig'+gig+'DropTitle');
    selectMenu.appendChild(gigTitle);

    var newGigMobile = document.createElement("a");
    newGigMobile.innerHTML = myGigs[gig].name;
    newGigMobile.href = "#";
    newGigMobile.className = "mobile-profiles-list-a";
    newGigMobile.setAttribute('value','gig');
    newGigMobile.dataID, myGigs[gig]._id;
    newGigMobile.dataType = "gig";
    newGigMobile.setAttribute('id', 'gig'+gig+'MobileDropTitle');
    profilesMobileListDiv.append(newGigMobile);
    newGigMobile.addEventListener("click",function(){
      selectProfileOnMobile(newGigMobile);
    });
    var newGigMobile2 = document.createElement("a");
    newGigMobile2.innerHTML = myGigs[gig].name;
    newGigMobile2.href = "#";
    newGigMobile2.className = "mobile-profiles-list-a";
    newGigMobile2.setAttribute('value','gig');
    newGigMobile2.dataID, myGigs[gig]._id;
    newGigMobile2.dataType = "gig";
    newGigMobile2.setAttribute('id', 'gig'+gig+'MobileDropTitle');
    profilesMobileListDivBands.append(newGigMobile2);
    newGigMobile2.addEventListener("click",function(){
      selectProfileOnMobile(newGigMobile2);
    });
  }
}

function presentApplicationModal(gigID){
  document.getElementById('modal-wrapper-choose-band-for-app').style.display='block';
  var selectMenu = document.getElementById("selectDropBand");
  selectMenu.gigID = gigID;
}

function populateBandsDropDown(myBands){
  console.log("Bands: "+JSON.stringify(myBands));
  console.log(" ");
  var selectMenu = document.getElementById("selectDropBand");
 //  var userDropTitle = document.createElement("<option value=“"+myUser._id+"“>"+myUser.username+"</option>");
 let selectedGig = null
  for (band in myBands){
    console.log('////////////////////');
    console.log('Band in populate os: ' + JSON.stringify(myBands[band]));
    var bandTitle=document.createElement("option");
    bandTitle.innerHTML=myBands[band].name;
    bandTitle.setAttribute("value","gig");
    bandTitle.dataID = myBands[band]._id;
    bandTitle.setAttribute("id", "band"+band+"DropTitle");
    selectMenu.appendChild(bandTitle);
  }
  selectMenu.addEventListener('change', function(){

  });
}

function populateEventsDropDown(myGigs){
 console.log("GIGS: "+JSON.stringify(myGigs));
 console.log(" ");

 var selectMenu = document.getElementById("selectDropEvent");
//  var userDropTitle = document.createElement("<option value=“"+myUser._id+"“>"+myUser.username+"</option>");
let selectedGig = null
 for (gig in myGigs){
   var gigTitle=document.createElement("option");
   gigTitle.innerHTML=myGigs[gig].name;
   gigTitle.setAttribute("value","gig");
   gigTitle.dataID = myGigs[gig]._id;
   console.log("gigTitle.dataID is: "+myGigs[gig]._id);
   gigTitle.setAttribute("id", "gig"+gig+"DropTitle");
   selectMenu.appendChild(gigTitle);
 }

 // document.getElementById("link-applicaiton-button").addEventListener("click", function(){
 //   // console.log(selectedGig.data-objID);
 // })
}

function submitBand(){
  console.log('submit band')
  var theSelector = document.getElementById("selectDropBand");
  var bandID = theSelector.options[ theSelector.selectedIndex ].dataID;
  var name = theSelector.options[theSelector.selectedIndex].innerHTML;
  var gigID = theSelector.gigID;
  //alert(gigID);
  console.log('IN SUBMIT BAND ID IS :' + bandID);
  console.log('IN SUBMIT GIG ID IS :' + gigID);

  $.post('/apply', {'bandID':bandID, 'gigID':gigID}, result=>{
    alert('Congratulations! You have applied to this event. Check your home page regularly to see whether they accepted your application.');
  });
  document.getElementById('modal-wrapper-choose-band-for-app').style.display='none'
}

function viewGigPage(){
  // handle redirect
}

function submitGig(){
  var theSelector = document.getElementById("selectDropEvent");
  var id = theSelector.options[ theSelector.selectedIndex ].dataID;
  var name = theSelector.options[theSelector.selectedIndex].innerHTML;
  console.log("IN SUBMIT GIG ID IS: "+id);
  var buttonObj = {
    "idForGig":id,
    "nameOfGig":name,
    "idForRec":theSelector.idForRec
  };
  $("#chat-div").chatbox("option", "boxManager").addMsg(username, buttonObj);
  document.getElementById('modal-wrapper-link-application').style.display='none'
}

document.addEventListener('ready', init);
function init(){
  var urlJSON = parseURL(window.location.href);
  var searchObject = urlJSON['searchObject'];
  console.log('Search obj is: ' + JSON.stringify(searchObject));
  getUserInfo(searchObject);


}

function buildWebPage(){
  if (myBand!=null){
    console.log('Viewing as band: ' + JSON.stringify(myBand));
    if (otherBand!=null){
      console.log('Viewing a band: ' + JSON.stringify(otherBand));
      createPageAsBand();
    }
    else{
      console.log('Viewing a gig: ' + JSON.stringify(otherGig));
      createPageAsGig();
    }
  }
  else if(myGig !=null){
    console.log('Viewing as gig: ' + JSON.stringify(myGig));
    if (otherBand!=null){
      console.log('Viewing a band: ' + JSON.stringify(otherBand));
      createPageAsBand();
    }
    else{
      console.log('Viewing a gig: ' + JSON.stringify(otherGig));
      createPageAsGig();
    }
  }
  else{
    console.log('Viewing as user: ' + JSON.stringify(user));
    if (otherBand!=null){
      console.log('Viewing a band: ' + JSON.stringify(otherBand));
      createPageAsBand();
    }
    else{
      console.log('Viewing a gig: ' + JSON.stringify(otherGig));
      createPageAsGig();
    }
  }
}


function hitApply(state){
  console.log('Hit apply');
  switch(state){
    case "desktop":
    if ($('#selectDrop option:selected')){
      var dataFromDrop = $('#selectDrop option:selected').data();
      var myBand = dataFromDrop['objid']
      var kind = $('#selectDrop option:selected').val();
      if(kind != 'band'){
        alert('You can only "Apply" to events as a band. Please select one from the drop down menu and hit apply again. If you have no bands, you can create one on your home page.');
        return;
      }
    }
    if (otherGig==null){
      alert('You can only "Apply" to events. Please go to the search page and search for gigs.');
      return;
    }
    if (myBand==null){
      alert('You can only "Apply" to events as a band. Please select one from your drop down menu and hit apply again. If you have no bands, you can create one on your home page.');
      return;
    }
    else{
      $.post('/apply', {'gigID':otherGig['_id'], 'bandID':myBand}, result=>{
        alert('Congratulations! You have applied to the gig ' +otherGig['name'] + ' as ' +myBand['name'] + '! Hit "home" on the Banda "b" to go to your home page. Check/refresh your home page regularly to see if the event has moved to your upcoming gigs section. If they accept, be sure to check your email associated with this account before the start of the event for the confirmation code. You should give this code to the event manager at the time of the event. You should also recieve a code from him/her at the event, which you should then enter in your upcoming gigs confirmation code field. Make sure you follow our instructions with confirmation codes so that you can get paid. Do NOT share this code with ANYONE before you arrive at the event.');
      });
    }
    break;
    case "mobile":
    var objID = selectedMobileProfile.dataID;
    var kind = selectedMobileProfile.dataType;
    var bandName = selectedMobileProfile.dataName;
    if(kind != 'band'){
      alert('You can only "Apply" to events as a band. Please select one from the drop down menu and hit apply again. If you have no bands, you can create one on your home page.');
      return;
    }
    if (otherGig==null){
      alert('You can only "Apply" to events. Please go to the search page and search for gigs.');
      return;
    }
    if (objID==null){
      alert('You can only "Apply" to events as a band. Please select one from your drop down menu and hit apply again. If you have no bands, you can create one on your home page.');
      return;
    }
    else{
      $.post('/apply', {'gigID':otherGig['_id'], 'bandID':objID}, result=>{
        alert('Congratulations! You have applied to the gig ' +otherGig['name'] + ' as ' +bandName + '! Hit "home" on the Banda "b" to go to your home page. Check/refresh your home page regularly to see if the event has moved to your upcoming gigs section. If they accept, be sure to check your email associated with this account before the start of the event for the confirmation code. You should give this code to the event manager at the time of the event. You should also recieve a code from him/her at the event, which you should then enter in your upcoming gigs confirmation code field. Make sure you follow our instructions with confirmation codes so that you can get paid. Do NOT share this code with ANYONE before you arrive at the event.');
      });
    }
    break;
  }
}
function hitBook(){
  console.log('Hit book');
  if ($('#selectDrop option:selected')){
    var dataFromDrop = $('#selectDrop option:selected').data();
    myGig = dataFromDrop['objid']
    var kind = $('#selectDrop option:selected').val();
    if(kind != 'gig'){
      alert('You can only "Book" bands as an event. Please select one from the drop down menu, and hit book again. If you have no events, you can create one on your home page.');
      return;
    }
  if (otherBand==null){
    alert('You can only "Book" bands. Please go to the search page and search for bands.');
    return;
  }
  if (myGig==null){
    alert('You can only "Book" bands as an event. Please select one from the drop down menu, and hit book again. If you have no events, you can create one on your home page.');
    return;
  }
  else{
    $.post('/accept', {'gigID':myGig, 'bandID':otherBand._id}, result=>{
      alert('Congratulations! You have booked this artist to play at your event. Feel free to notify them with your decision via our built-in messaging feature. Check your account-associated email for the confirmation code to give to the aritst when they arrive at the event. Make sure you recieve a code from them at the event. Do NOT share this code with ANYONE before the artist arrives at the event.');
    });
  }
  }
}
function hitMessage(){
  console.log('Hit message');
  if (otherBand!=null){
    $.post('/addContact', {'contactName':otherBand['creator']}, result=>{
      alert('We have added the creator of this band to your contacts list (click the button in the bottom right corner). You can also send them a request to apply to your event via Banda messaging.')
      document.location.reload();
    });
  }
  else{
    alert('Sorry, before adding the owner of this event to your contacts list, the owner must message you first. We do this to avoid overwhelming the event manager with messages from artists. Feel free to apply as one of your bands for now.')
  }
}
// AB SECTION


var box = null;
var mainContent = null;
var profilesList = null;
var globalMessageArray = null;

function getTitleFontSize(name){
  if(name.length <= 20){
    return "font76";
  }else{
    return "font48";
  }
}

function createPageAsBand(){
  var wrongBottomBar = document.getElementById("bottom-bar-mobile");
  wrongBottomBar.parentNode.removeChild(wrongBottomBar);
  var mainContent = document.getElementById("main-content-wrapper");
  // load the band name
  var profileTitle = document.getElementById("profile-title");
  profileTitle.innerHTML = otherBand.name;
  profileTitle.className = "profile-header-text "+getTitleFontSize(otherBand.name);
  var profileCreator = document.getElementById("profile-creator");
  profileCreator.innerHTML = "created by: "+otherBand.creator;
  var hasReliability = null;
  if(otherBand.showsUp != null){
    hasReliability = true;
    var reliability = document.getElementById("reliability");
    reliability.style.display = "block";
    reliability.innerHTML = "reliability: "+otherBand.showsUp*100+"%";
  }else{
    hasReliability = false;
  }

  // load the band rating into the stars
  var newStars = document.getElementById("user-stars");
  var star1 = "user-star-1";
  var star2 = "user-star-2";
  var star3 = "user-star-3";
  var star4 = "user-star-4";
  var star5 = "user-star-5";
  var stars = [star1,star2,star3,star4,star5];
  loadStars(otherBand.rating, stars);

  // add book/message buttons
  var controls = document.getElementById("profile-controls");
  var newLiOne = document.createElement("li");
  var newAOne = document.createElement("a");
  newAOne.innerHTML = "Message";
  newAOne.href = "#";
  newAOne.addEventListener("click",function(){
    hitMessage();
  });
  var mobileMessageBand = document.getElementById("mobile_message_band_button");
  mobileMessageBand.addEventListener("click",function(){
    hitMessage();
  });
  newLiOne.append(newAOne);
  controls.append(newLiOne);

  // add band image & price
  var bandImg = document.getElementById("profile-img");
  bandImg.src = otherBand.picture;
  var bandFrame = document.getElementById("profile-img-frame");
  bandFrame.src = "/assets/Home/purplebox.png";
  var bandPriceText = document.getElementById("profile-price-text");

  if(hasReliability){
    bandPriceText.innerHTML = "The asking price for this band is";
    bandPriceText.className = "profile-price-text";
    var bandPrice = document.getElementById("profile-price");
    bandPrice.innerHTML = "$"+otherBand.price;
    bandPrice.className ="profile-price";
  }else{
    bandPriceText.innerHTML = "This band has yet to perform any gigs through Banda! The asking price for this band is";
    bandPriceText.className = "profile-price-text-new";
    var bandPrice = document.getElementById("profile-price");
    bandPrice.innerHTML = "$"+otherBand.price;
    bandPrice.className = "profile-price-new";
  }

  // add band clips section
  if(otherBand.hasOwnProperty("audioSamples")){
    if(otherBand.audioSamples != null){
      var bandSamplesWrapper = document.createElement("div");
      bandSamplesWrapper.className = "wrapper";
      new SampleCarousel(res=>{
        bandSamplesWrapper.append(res.carWrap);
        mainContent.append(bandSamplesWrapper);
      });
    }
  }


  // add band info
  var bandInfoSection = document.createElement("div");
  bandInfoSection.className = "band-info-section";
  var descH = document.createElement("h2");
  descH.innerHTML = "description";
  bandInfoSection.append(descH);
  var descP = document.createElement("p");
  descP.className = "description";
  descP.innerHTML = otherBand.description;
  bandInfoSection.append(descP);

  // band info grid
  if(otherBand.categories != null){
    var detailGrid = document.createElement("div");
    detailGrid.className = "band-detail-grid";
    // genres
    if(otherBand.categories.hasOwnProperty("genres")){
      var div1 = document.createElement("div");
      var genreH = document.createElement("h2");
      genreH.innerHTML = "genres";
      div1.append(genreH);
      var genreP = document.createElement("p");
      genreP.className = "genres";
      var genreString = "";
      for(var genre in otherBand.categories.genres){
        genreString += otherBand.categories.genres[genre];
        if(genre < otherBand.categories.genres.length - 1){
          genreString += ", ";
        }
      }
      genreP.innerHTML = genreString;
      div1.append(genreP);
      detailGrid.append(div1);
    }
    if(otherBand.categories.hasOwnProperty("insts")){
      // insts
      var div2 = document.createElement("div");
      var instH = document.createElement("h2");
      instH.innerHTML = "instruments";
      div2.append(instH);
      var instP = document.createElement("p");
      instP.className = "instruments"; //insts
      var instString = " ";
      for(var inst in otherBand.categories.insts){
        instString += otherBand.categories.insts[inst];
        if(inst < otherBand.categories.insts.length - 1){
          instString += ", ";
        }
      }
      instP.innerHTML = instString;
      div2.append(instP);
      detailGrid.append(div2);
    }
    if(otherBand.categories.hasOwnProperty("vibes")){
      // vibes
      var div3 = document.createElement("div");
      var vibesH = document.createElement("h2");
      vibesH.innerHTML = "vibes";
      div3.append(vibesH);
      var vibesP = document.createElement("p");
      vibesP.className = "vibes";
      var vibesString = " ";
      for(var vibe in otherBand.categories.vibes){
        vibesString += otherBand.categories.vibes[vibe];
        if(vibe < otherBand.categories.vibes.length - 1){
          vibesString += ", ";
        }
      }
      vibesP.innerHTML = vibesString;
      div3.append(vibesP);
      detailGrid.append(div3);
    }
    if(otherBand.categories.hasOwnProperty("gigTypes")){
      // good for
      var div4 = document.createElement("div");
      var goodForH = document.createElement("h2");
      goodForH.innerHTML = "good for these events";
      div4.append(goodForH);
      var goodForP = document.createElement("p");
      goodForP.className = "good-for";
      var goodForString = " ";
      for(var good in otherBand.categories.gigTypes){
        goodForString += otherBand.categories.gigTypes[good];
        if(good < otherBand.categories.gigTypes.length - 1){
          goodForString += ", ";
        }
      }
      goodForP.innerHTML = goodForString;
      div4.append(goodForP);
      detailGrid.append(div4);
    }
    bandInfoSection.append(detailGrid);
  }
  mainContent.append(bandInfoSection);
  setupAction();
  var spacer = document.createElement("div");
  spacer.className = "bottom-spacer";
  mainContent.append(spacer);
}

function createPageAsGig(){
  var wrongBottomBar = document.getElementById("bottom-bar-mobile-bands");
  wrongBottomBar.parentNode.removeChild(wrongBottomBar);
  var mainContent = document.getElementById("main-content-wrapper");

  // load the gig name
  var profileTitle = document.getElementById("profile-title");
  profileTitle.innerHTML = otherGig.name;
  profileTitle.className = "profile-header-text "+getTitleFontSize(otherGig.name);
  var profileCreator = document.getElementById("profile-creator");
  profileCreator.innerHTML = "created by: "+otherGig.creator;

  // add apply/message buttons
  var controls = document.getElementById("profile-controls");
  var newLiOne = document.createElement("li");
  var newAOne = document.createElement("a");
  newAOne.innerHTML = "Apply";
  newAOne.href = "#";
  newAOne.addEventListener("click",function(){
    hitApply("desktop");
  });
  var mobileApply = document.getElementById("mobile_apply_button");
  mobileApply.addEventListener("click",function(){
    hitApply("mobile");
  })
  newLiOne.append(newAOne);
  controls.append(newLiOne);
  var newLiTwo = document.createElement("li");
  var newATwo = document.createElement("a");
  newATwo.innerHTML = "Message";
  newATwo.href = "#";
  newATwo.addEventListener("click",function(){
    hitMessage();
  });
  var mobileMessage = document.getElementById("mobile_message_button");
  mobileMessage.addEventListener("click",function(){
    hitMessage();
  });
  newLiTwo.append(newATwo);
  controls.append(newLiTwo);

  // add gig image and price
  var gigImg = document.getElementById("profile-img");
  gigImg.src = otherGig.picture;
  var gigFrame = document.getElementById("profile-img-frame");
  gigFrame.src = "/assets/Home/purplebox.png";
  var gigPriceText = document.getElementById("profile-price-text");
  gigPriceText.innerHTML = "The pay for this event is";
  var gigPrice = document.getElementById("profile-price");
  gigPrice.innerHTML = "$"+otherGig.price;

  // add gig info
  var gigInfoSection = document.createElement("div");
  gigInfoSection.className = "gig-info-section";
  var descH = document.createElement("h2");
  descH.innerHTML = "description";
  gigInfoSection.append(descH);
  var descP = document.createElement("p");
  descP.className = "description";
  descP.innerHTML = otherGig.description;
  gigInfoSection.append(descP);

  var addressH = document.createElement("h2");
  addressH.innerHTML = "address";
  var addressP = document.createElement("p");
  gigInfoSection.append(addressH);
  addressP.className = "gig-address";
  addressP.innerHTML = otherGig.address;
  gigInfoSection.append(addressP);

  var gigDetailGrid = document.createElement("div");
  gigDetailGrid.className = "gig-detail-grid";
  // date
  var div1 = document.createElement("div");
  var dateH = document.createElement("h2");
  dateH.innerHTML = "date";
  div1.append(dateH);
  var dateP = document.createElement("p");
  dateP.className = "date";
  dateP.innerHTML = otherGig.date;
  div1.append(dateP);
  gigDetailGrid.append(div1);
  // num apps
  var div2 = document.createElement("div");
  var appsH = document.createElement("h2");
  appsH.innerHTML = "# of apps";
  div2.append(appsH);
  var appsP = document.createElement("p");
  appsP.className = "num-applicants";
  appsP.innerHTML = otherGig.applications.length;
  div2.append(appsP);
  gigDetailGrid.append(div2);
  // date
  var div3 = document.createElement("div");
  var startH = document.createElement("h2");
  startH.innerHTML = "start time";
  div3.append(startH);
  var startP = document.createElement("p");
  startP.className = "start-time";
  startP.innerHTML = otherGig.startTime;
  div3.append(startP);
  gigDetailGrid.append(div3);
  // date
  var div4 = document.createElement("div");
  var endH = document.createElement("h2");
  endH.innerHTML = "end time";
  div4.append(endH);
  var endP = document.createElement("p");
  endP.className = "end-time";
  endP.innerHTML = otherGig.endTime;
  div4.append(endP);
  gigDetailGrid.append(div4);

  gigInfoSection.append(gigDetailGrid);
  mainContent.append(gigInfoSection);
  var spacer = document.createElement("div");
  spacer.className = "bottom-spacer";
  mainContent.append(spacer);
}



function getUserInfo(searchObject){
  $.get('/user', {'query':'who am i ?'}, result=>{
    console.log("Got result for user and it is : "+JSON.stringify(result));
     user = result;
     console.log('in get info and username is ' + user['username']);
      username = user['username'];
     userContacts = user['contacts'];
     $.get('messages', {'recieverID':user._id}, result=>{
       userMessages=result;
     });
     $.get('/getBands', {'creator':username}, result => {
       console.log("bands from db are: " + JSON.stringify(result));
       var bands = JSON.parse(JSON.stringify(result));
       user['bands']=bands;
       $.get('/getGigs', {'creator':username}, result => {
         console.log("gigs from db are: " + JSON.stringify(result));
         var gigs = JSON.parse(JSON.stringify(result));
         user['gigs']=gigs;
         createContacts(user['contacts'], user.username);
         populateDropDown(user, user['bands'], user['gigs']);
         populateBandsDropDown(user['bands']);
         populateEventsDropDown(user['gigs']);
         if (searchObject['searchingAs']=='undefined' || searchObject['searchingAs']==undefined || searchObject['searchingAs']== null ){
           console.log('seraching as username');

             // messaging socket
             socket.on(user['_id'], (msg)=>{
               console.log('socket.on ////////////////');
               var senderName = null;
               for (var c in userContacts){
                 if (userContacts[c]['id']==msg.senderID){
                   senderName=userContacts[c]['name'];
                 }
               }

               if (msg.body.includes('button')){
                 alert( 'Congratulations! '+senderName + ' has asked you to apply to one of his/her events. Open your contacts list and select '+senderName+' to see the link. Click it, then select one of your artist profiles to automatically apply.');
               }
               else{
                 alert('You recieved a message from: ' + senderName + ' Message: ' +msg.body);
               }
               if(userMessages.hasOwnProperty(msg.senderID)){
                 userMessages[msg.senderID].push(msg);
               }
               else{
                 userMessages[msg.senderID]=[];
                 userMessages[msg.senderID].push(msg);
               }
               if(box != null){
                 var newName = "";
                 for(var contact in userContacts){
                   if(userContacts[contact].id == msg.recieverID){
                     console.log("wow found a name");
                     newName = userContacts[contact].name;
                   }
                 }
                 $("#chat-div").chatbox("option", "boxManager").addMsg(newName, msg.body);
               }
             });


             // determine webpage mode
             if (searchObject['mode']=='gig'){
               $.get('/aGig', {'gigID':searchObject['id']}, result=>{
                 otherGig=result;
                 console.log('The gig is : '+JSON.stringify(otherGig));
                 buildWebPage();
               });
             }
             else{
               $.get('/aBand', {'id':searchObject['id']}, result=>{
                 otherBand=result;
                 console.log('The band is : '+JSON.stringify(otherBand));
                 buildWebPage();
               });
             }
         }
         else{
           console.log('Searching as :' + searchObject['searchingAs']+' WHich is of type: ' + searchObject['searchingType']);
           $.get('/user',{'query':'who am i'}, result=>{
             user=result;
             var type = searchObject['searchingType'];
             var searchingAs = searchObject['searchingAs'];
             if (searchObject['mode']=='gig'){
               $.get('/aGig', {'gigID':searchObject['id']}, result=>{
                 otherGig=result;
                 console.log('The gig is : '+JSON.stringify(otherGig));
                 if (type=='band'){
                   $.get('/aBand', {'id':searchingAs}, res2=>{
                     myBand=searchingAs;
                     buildWebPage();
                   });
                 }
                 else{
                   $.get('/aGig', {'gigID':searchingAs}, result=>{
                     myGig=searchingAs;
                     buildWebPage();
                   });
                 }
               });
             }
             else{
               $.get('/aBand', {'id':searchObject['id']}, result=>{
                 otherBand=result;
                 console.log('The band is : '+JSON.stringify(otherBand));
                 if (type=='band'){
                   $.get('/aBand', {'id':searchingAs}, res2=>{
                     myBand=searchingAs;
                     buildWebPage();
                   });
                 }
                 else{
                   $.get('/aGig', {'gigID':searchingAs}, result=>{
                     myGig=searchingAs;
                     buildWebPage();
                   });
                 }
               });
             }
           });
         }
         // createWebPage(user);
     	});
   	});
  });

}

function loadStars(rating, stars){
  var star1 = document.getElementById(stars[0]);
  var star2 = document.getElementById(stars[1]);
  var star3 = document.getElementById(stars[2]);
  var star4 = document.getElementById(stars[3]);
  var star5 = document.getElementById(stars[4]);
  star1.src = "/assets/Control-Center/star.png";
  star2.src = "/assets/Control-Center/star.png";
  star3.src = "/assets/Control-Center/star.png";
  star4.src = "/assets/Control-Center/star.png";
  star5.src = "/assets/Control-Center/star.png";

  var starVal = rating / 20.0;
  if(starVal == 5){
    star1.style.display = "inline-block";
    star2.style.display = "inline-block";
    star3.style.display = "inline-block";
    star4.style.display = "inline-block";
    star5.style.display = "inline-block";
  }
  else if(starVal < 5 && starVal >= 4.5){
    star1.style.display = "inline-block";
    star2.style.display = "inline-block";
    star3.style.display = "inline-block";
    star4.style.display = "inline-block";
    star5.src = "/assets/Control-Center/half-star.png";
    star5.className = "half-star";
    star5.style.display = "inline-block";
  }
  else if(starVal < 4.5 && starVal >= 4.0){
    star1.style.display = "inline-block";
    star2.style.display = "inline-block";
    star3.style.display = "inline-block";
    star4.style.display = "inline-block";
    star5.style.display = "none";
  }
  else if(starVal < 4.0 && starVal >= 3.5){
    star1.style.display = "inline-block";
    star2.style.display = "inline-block";
    star3.style.display = "inline-block";
    star4.src = "/assets/Control-Center/half-star.png";
    star4.className = "half-star";
    star4.style.display = "inline-block";
    star5.style.display = "none";
  }
  else if(starVal < 3.5 && starVal >= 3.0){
    star1.style.display = "inline-block";
    star2.style.display = "inline-block";
    star3.style.display = "inline-block";
    star4.style.display = "none";
    star5.style.display = "none";
  }
  else if(starVal < 3.0 && starVal >= 2.5){
    star1.style.display = "inline-block";
    star2.style.display = "inline-block";
    star3.src = "/assets/Control-Center/half-star.png";
    star3.className = "half-star";
    star3.style.display = "inline-block";
    star4.style.display = "none";
    star5.style.display = "none";
  }
  else if(starVal < 2.5 && starVal >= 2.0){
    star1.style.display = "inline-block";
    star2.style.display = "inline-block";
    star3.style.display = "none";
    star4.style.display = "none";
    star5.style.display = "none";
  }
  else if(starVal < 2.0 && starVal >= 1.5){
    star1.style.display = "inline-block";
    star2.src = "/assets/Control-Center/half-star.png";
    star2.className = "half-star";
    star2.style.display = "inline-block";
    star3.style.display = "none";
    star4.style.display = "none";
    star5.style.display = "none";
  }
  else if(starVal < 1.5 && starVal >= 1.0){
    star1.style.display = "inline-block";
    star2.style.display = "none";
    star3.style.display = "none";
    star4.style.display = "none";
    star5.style.display = "none";
  }
  else if(starVal < 1.0 && starVal >= 0.5){
    star1.src = "/assets/Control-Center/half-star.png";
    star1.className = "half-star";
    star1.style.display = "inline-block";
    star2.style.display = "none";
    star3.style.display = "none";
    star4.style.display = "none";
    star5.style.display = "none";
  }
  else if(starVal < 0.5 && starVal >= 0.0){
    star1.style.display = "none";
    star2.style.display = "none";
    star3.style.display = "none";
    star4.style.display = "none";
    star5.style.display = "none";
  }
}

//MESSAGING SECTION:
var socket = io();
function sendMessage(body, recID){
  //set body to text from box and rec id to the inteded reciver's user ID
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;
  //replace this with real id from contact menu
  //////

  var myMessage = {
    'senderID':user._id,
    'recieverID': recID,
    'body': body,
    'timeStamp' : dateTime
  };
  if(userMessages.hasOwnProperty(recID)){
    userMessages[recID].push(myMessage);
  }
  else{
    userMessages[recID]=[];
    userMessages[recID].push(myMessage);
  }

  $.post('/messages', {'senderID':user._id, 'recieverID':recID, 'body':body, 'timeStamp':dateTime}, result=>{
    console.log("got result from positn message it is :" + JSON.stringify(result));
  });
}

function createContacts(contacts, yourUsername){
  contacts.sort(function(a, b){
      if(a.name < b.name) { return -1; }
      if(a.name > b.name) { return 1; }
      return 0;
  });

  var list = document.getElementById("contacts-content");

  var letters = {
    "a": false,
    "b": false,
    "c": false,
    "d": false,
    "e": false,
    "f": false,
    "g": false,
    "h": false,
    "i": false,
    "j": false,
    "k": false,
    "l": false,
    "m": false,
    "n": false,
    "o": false,
    "p": false,
    "q": false,
    "r": false,
    "s": false,
    "t": false,
    "u": false,
    "v": false,
    "w": false,
    "x": false,
    "y": false,
    "z": false
  };

  for(var person in contacts){
    var id = contacts[person].id;
    var name = contacts[person].name;
    var lowercaseName = name.toLowerCase();
    if(!letters[lowercaseName.charAt(0)]){
      // add a letter div
      var letterDiv = document.createElement("div");
      letterDiv.className = "contacts-divider";
      var theLetter = document.createElement("h2");
      theLetter.className = "contacts-letter";
      var nameLetter = lowercaseName.charAt(0);
      theLetter.innerHTML = nameLetter;
      letterDiv.append(theLetter);
      var newLine = document.createElement("div");
      newLine.className = "contacts-line";
      letterDiv.append(newLine);
      list.append(letterDiv);
      letters[lowercaseName.charAt(0)] = true;
    }

    new ContactLink(name,id,contactLinkCallBack => {
      contactLinkCallBack.contactLink.addEventListener("click",function(event, ui){

        // if(document.getElementById("select-gig-to-ad").style.visibility == "visible"){
        //       document.getElementById("select-gig-to-ad").style.visibility = "hidden"
        //    }
        // else if(document.getElementById("select-gig-to-ad").style.visibility == "hidden"){
        //     document.getElementById("select-gig-to-ad").style.visibility = "visible"
        //  }

        if(box) {
            document.getElementById("select-gig-to-ad").style.visibility = "hidden";
            box.chatbox("option", "boxManager").toggleBox();
            $(".ui-widget").remove();
            box = null;
            var newDiv = document.createElement("div");
            newDiv.id = "chat-div";
            document.body.append(newDiv);
        }
        else {
            document.getElementById("select-gig-to-ad").style.visibility = "visible";
            document.getElementById("selectDrop").idForRec = contactLinkCallBack.id;
            var recipient = contactLinkCallBack.id;
            console.log('recipient id is '+recipient);
            box = $("#chat-div").chatbox({recID: contactLinkCallBack.id,
                                          user:{ first_name: yourUsername },
                                          title : contactLinkCallBack.name,
                                          messageSent : function(id, user, msg) {
                                              // $("#log").append(id + " said: " + msg + "<br/>");
                                              $("#chat-div").chatbox("option", "boxManager").addMsg(user.first_name, msg);
                                              sendMessage(msg,recipient);
                                          }});
            for(var message in userMessages[recipient]){
              if(userMessages[recipient][message].body.includes("yothisisanewsignalfromthingtocreateabutton")){
                // it's a link to an application!
                var e = document.createElement('div');
                var newStringB = contactLinkCallBack.name + ": ";
                var newNameB = document.createElement("b");
                newNameB.innerHTML = newStringB;
                e.append(newNameB);
                var bodyString = userMessages[recipient][message].body;
                var partsArray = bodyString.split('-');
                var theGigName = partsArray[1];
                var theGigID = partsArray[2];
                console.log("theGigID is: "+theGigID+" for "+theGigName);
                // <a id="baldkjafdlksjfaldksjfalsdkjfads">Apply to my event: A booked gig YEET</a>
                var newButton = document.createElement("a");
                newButton.href = "#";
                newButton.className = "chat-app-link";
                newButton.gigID = theGigID;
                newButton.innerHTML = "Apply to my event: "+theGigName;
                newButton.addEventListener("click",function(){
                  presentApplicationModal(newButton.gigID);
                });
                e.append(newButton);
                e.className = "ui-chatbox-msg";
                $(e).css("maxWidth", $(".ui-chatbox-log").width());
                $(".ui-chatbox-log").append(e);
              }else{
                var e = document.createElement('div');
                var newStringB = contactLinkCallBack.name + ": ";
                var newNameB = document.createElement("b");
                newNameB.innerHTML = newStringB;
                e.append(newNameB);
                var msgElement = document.createElement("i");
                msgElement.innerHTML = userMessages[recipient][message].body;
                e.append(msgElement);
                e.className = "ui-chatbox-msg";
                $(e).css("maxWidth", $(".ui-chatbox-log").width());
                $(".ui-chatbox-log").append(e);
              }
            }
        }
        console.log(contactLinkCallBack.contactLink.id);
      });
    });
  }
}

(function($) {
    $.widget("ui.chatbox", {
        options: {
            id: null, //id for the DOM element
            title: null, // title of the chatbox
            user: null, // can be anything associated with this chatbox
            hidden: false,
            offset: 300, // relative to right edge of the browser window
            width: 300, // width of the chatbox

            messageSent: function(id, user, msg) {
                // override this
                this.boxManager.addMsg(user.first_name, msg);
            },
            boxClosed: function(id) {
              document.getElementById("select-gig-to-ad").style.visibility = "hidden";
              $(".ui-widget").remove();
              var newDiv = document.createElement("div");
              newDiv.id = "chat-div";
              document.body.append(newDiv);
              box = null;
            }, // called when the close icon is clicked
            boxManager: {
                // thanks to the widget factory facility
                // similar to http://alexsexton.com/?p=51
                init: function(elem) {
                    this.elem = elem;
                },
                addMsg: function(peer, msg) {
                    if(msg.hasOwnProperty("nameOfGig")){
                      // you just sent someone an application link!
                      var self = this;
                      var box = self.elem.uiChatboxLog;
                      var e = document.createElement('div');
                      box.append(e);
                      $(e).hide();
                      var systemMessage = false;
                      if(peer){
                        var peerName = document.createElement("b");
                        $(peerName).text(peer + ": ");
                        e.appendChild(peerName);
                      }else{
                        systemMessage = true;
                      }

                      var msgElement = document.createElement("a");
                      msgElement.href = "#";
                      msgElement.className = "chat-app-link";
                      var newMsgString = "Apply to my event: "+msg.nameOfGig;
                      $(msgElement).text(newMsgString);
                      msgElement.id = msg.idForGig;
                      msgElement.gigID = msg.idForGig;
                      msgElement.addEventListener("click",function(){
                        presentApplicationModal(msgElement.gigID);
                      });
                      e.appendChild(msgElement);
                      $(e).addClass("ui-chatbox-msg");
                      $(e).css("maxWidth", $(box).width());
                      $(e).fadeIn();
                      self._scrollToBottom();
                      var newSignalString = "yothisisanewsignalfromthingtocreateabutton-"+msg.nameOfGig+"-"+msg.idForGig;
                      sendMessage(newSignalString,msg.idForRec);
                    }
                    else{
                      if(msg.includes("yothisisanewsignalfromthingtocreateabutton")){
                        // recieved a button with the window open

                        var self = this;
                        var box = self.elem.uiChatboxLog;
                        var e = document.createElement('div');
                        box.append(e);
                        $(e).hide();
                        var systemMessage = false;
                        if(peer){
                          var peerName = document.createElement("b");
                          $(peerName).text(peer + ": ");
                          e.appendChild(peerName);
                        }else{
                          systemMessage = true;
                        }
                        var bodyString = msg;
                        var partsArray = bodyString.split('-');
                        var theGigName = partsArray[1];
                        var theGigID = partsArray[2];
                        // <a id="baldkjafdlksjfaldksjfalsdkjfads">Apply to my event: A booked gig YEET</a>
                        var newButton = document.createElement("a");
                        newButton.className = "chat-app-link";
                        newButton.href = "#";
                        newButton.gigID = theGigID;
                        newButton.innerHTML = "Apply to my event: "+theGigName;
                        newButton.addEventListener("click",function(){
                          presentApplicationModal(newButton.gigID);
                        });
                        e.appendChild(newButton);
                        $(e).addClass("ui-chatbox-msg");
                        $(e).css("maxWidth", $(box).width());
                        $(e).fadeIn();
                        self._scrollToBottom();
                      }else{
                        // just a normal message hehehhhh
                        var self = this;
                        var box = self.elem.uiChatboxLog;
                        var e = document.createElement('div');
                        box.append(e);
                        $(e).hide();

                        var systemMessage = false;

                        if (peer) {
                            var peerName = document.createElement("b");
                            $(peerName).text(peer + ": ");
                            e.appendChild(peerName);
                        } else {
                            systemMessage = true;
                        }

                        var msgElement = document.createElement(
                            systemMessage ? "i" : "span");
                        $(msgElement).text(msg);
                        e.appendChild(msgElement);
                        $(e).addClass("ui-chatbox-msg");
                        $(e).css("maxWidth", $(box).width());
                        $(e).fadeIn();
                        self._scrollToBottom();

                        if (!self.elem.uiChatboxTitlebar.hasClass("ui-state-focus")
                            && !self.highlightLock) {
                            self.highlightLock = true;
                            self.highlightBox();
                        }
                      }
                    }
                },
                highlightBox: function() {
                    var self = this;
                    self.elem.uiChatboxTitlebar.effect("highlight", {}, 300);
                    self.elem.uiChatbox.effect("bounce", {times: 3}, 300, function() {
                        self.highlightLock = false;
                        self._scrollToBottom();
                    });
                },
                toggleBox: function() {
                    this.elem.uiChatbox.toggle();
                },
                _scrollToBottom: function() {
                    var box = this.elem.uiChatboxLog;
                    box.scrollTop(box.get(0).scrollHeight);
                }
            }
        },
        toggleContent: function(event) {
            this.uiChatboxContent.toggle();
            if (this.uiChatboxContent.is(":visible")) {
                this.uiChatboxInputBox.focus();
            }
        },
        widget: function() {
            return this.uiChatbox
        },
        _create: function() {
            var self = this,
            options = self.options,
            title = options.title || "No Title",
            // chatbox
            uiChatbox = (self.uiChatbox = $('<div></div>'))
                .appendTo(document.body)
                .addClass('ui-widget ' +
                          'ui-corner-top ' +
                          'ui-chatbox'
                         )
                .attr('outline', 0)
                .focusin(function() {
                    // ui-state-highlight is not really helpful here
                    //self.uiChatbox.removeClass('ui-state-highlight');
                    self.uiChatboxTitlebar.addClass('ui-state-focus');
                })
                .focusout(function() {
                    self.uiChatboxTitlebar.removeClass('ui-state-focus');
                }),
            // titlebar
            uiChatboxTitlebar = (self.uiChatboxTitlebar = $('<div></div>'))
                .addClass('ui-widget-header ' +
                          'ui-corner-top ' +
                          'ui-chatbox-titlebar ' +
                          'ui-dialog-header' // take advantage of dialog header style
                         )
                .click(function(event) {
                    self.toggleContent(event);
                })
                .appendTo(uiChatbox),
            uiChatboxTitle = (self.uiChatboxTitle = $('<span id="chat_title"></span>'))
                .html(title)
                .appendTo(uiChatboxTitlebar),
            uiChatboxTitlebarClose = (self.uiChatboxTitlebarClose = $('<a href="#"></a>'))
                .addClass('ui-corner-all ' +
                          'ui-chatbox-icon '
                         )
                .attr('role', 'button')
                .hover(function() { uiChatboxTitlebarClose.addClass('ui-state-hover'); },
                       function() { uiChatboxTitlebarClose.removeClass('ui-state-hover'); })
                .click(function(event) {
                    uiChatbox.hide();
                    self.options.boxClosed(self.options.id);
                    return false;
                })
                .appendTo(uiChatboxTitlebar),
            uiChatboxTitlebarCloseText = $('<span id="chat_closer"></span>')
                .addClass('ui-icon ' +
                          'ui-icon-closethick')
                .text('X')
                .appendTo(uiChatboxTitlebarClose),
            uiChatboxContent = (self.uiChatboxContent = $('<div></div>'))
                .addClass('ui-widget-content ' +
                          'ui-chatbox-content '
                         )
                .appendTo(uiChatbox),
            uiChatboxLog = (self.uiChatboxLog = self.element)
                .addClass('ui-widget-content ' +
                          'ui-chatbox-log'
                         )
                .appendTo(uiChatboxContent),
            uiChatboxInput = (self.uiChatboxInput = $('<div></div>'))
                .addClass('ui-widget-content ' +
                          'ui-chatbox-input'
                         )
                .click(function(event) {
                    // anything?
                })
                .appendTo(uiChatboxContent),
            uiChatboxInputBox = (self.uiChatboxInputBox = $('<textarea></textarea>'))
                .addClass('ui-widget-content ' +
                          'ui-chatbox-input-box ' +
                          'ui-corner-all'
                         )
                .appendTo(uiChatboxInput)
                .keydown(function(event) {
                    if (event.keyCode && event.keyCode == $.ui.keyCode.ENTER) {
                      console.log("detected enter");
                        msg = $.trim($(this).val());
                        if (msg.length > 0) {
                            self.options.messageSent(self.options.id, self.options.user, msg);
                        }
                        $(this).val('');
                        return false;
                    }
                })
                .focusin(function() {
                    uiChatboxInputBox.addClass('ui-chatbox-input-focus');
                    var box = $(this).parent().prev();
                    box.scrollTop(box.get(0).scrollHeight);
                })
                .focusout(function() {
                    uiChatboxInputBox.removeClass('ui-chatbox-input-focus');
                });

            // disable selection
            uiChatboxTitlebar.find('*').add(uiChatboxTitlebar).disableSelection();

            // switch focus to input box when whatever clicked
            uiChatboxContent.children().click(function() {
                // click on any children, set focus on input box
                self.uiChatboxInputBox.focus();
            });

            self._setWidth(self.options.width);
            self._position(self.options.offset);

            self.options.boxManager.init(self);

            if (!self.options.hidden) {
                uiChatbox.show();
            }
        },
        _setOption: function(option, value) {
            if (value != null) {
                switch (option) {
                case "hidden":
                    if (value)
                        this.uiChatbox.hide();
                    else
                        this.uiChatbox.show();
                    break;
                case "offset":
                    this._position(value);
                    break;
                case "width":
                    this._setWidth(value);
                    break;
                }
            }
            $.Widget.prototype._setOption.apply(this, arguments);
        },
        _setWidth: function(width) {
            this.uiChatboxTitlebar.width(width + "px");
            this.uiChatboxLog.width(width + "px");
            this.uiChatboxInput.width(width + "px");
            // padding:2, boarder:2, margin:5
            this.uiChatboxInputBox.width(width + "px");
        },
        _position: function(offset) {
            this.uiChatbox.css("right", offset);
        }
    });
}(jQuery));

class ContactLink {
  constructor(name,id, contactLinkCallBack){
    var list = document.getElementById("contacts-content");
    console.log("in constructor");
    this.contactLink = document.createElement("a");
    this.contactLink.href = "#";
    this.contactLink.id = "contact-link-"+id;
    this.contactLink.className = "contacts-link";
    this.contactLink.innerHTML = name;
    this.name = name;
    this.id = id;
    list.append(this.contactLink);
    contactLinkCallBack(this);
  }
}

function setupAction(){
  var jcarousel = $('.jcarousel');

  jcarousel
      .on('jcarousel:reload jcarousel:create', function () {
          var carousel = $(this),
              width = carousel.innerWidth();

          if (width >= 600) {
              width = width / 4;
          } else if (width >= 350) {
              width = width / 2;
          }

          carousel.jcarousel('items').css('width', Math.ceil(width) + 'px');
      })
      .jcarousel({
          wrap: 'circular'
      });

  $('.jcarousel-control-prev')
      .jcarouselControl({
          target: '-=1'
      });

  $('.jcarousel-control-next')
      .jcarouselControl({
          target: '+=1'
      });

  $('.jcarousel-pagination')
      .on('jcarouselpagination:active', 'a', function() {
          $(this).addClass('active');
      })
      .on('jcarouselpagination:inactive', 'a', function() {
          $(this).removeClass('active');
      })
      .on('click', function(e) {
          e.preventDefault();
      })
      .jcarouselPagination({
          perPage: 1,
          item: function(page) {
              return '<a href="#' + page + '">' + page + '</a>';
          }
      });

  $('.carousel-img').hover(
    //Handler In
    function(){
      console.log("enter-img");
    },
    //Handler Out
    function(){
      console.log("exit-img");
    }
  );

  $('.carousel-li').hover(
    //Handler In
    function(){
      console.log("enter-li");
    },
    //Handler Out
    function(){
      console.log("exit-li");
    }
  );
}

var contactsButton = document.getElementById('contacts-button');
var contactsSidebar = document.getElementById('contacts-sidebar');
var open = false;
contactsButton.addEventListener("click",function(){
  console.log("clicked, "+open);
  if(open){
    document.getElementById('contacts-sidebar').style.display = 'none';
  }else{
    document.getElementById('contacts-sidebar').style.display = 'block';
  }
  open = !open;
});
var mobileContactsButton = document.getElementById("contact-button-mobile");
var openMobile = false;
mobileContactsButton.addEventListener("click",function(){
  console.log("clicked, "+openMobile);
  if(openMobile){
    document.getElementById('contacts-sidebar').style.display = 'none';
  }else{
    document.getElementById('contacts-sidebar').style.display = 'block';
  }
  openMobile = !openMobile;
});

function regToLogin(){
	var login = document.getElementById("modal-wrapper-login");
	var register = document.getElementById("modal-wrapper-register");
	register.style.display = "none";
	login.style.display = "block";
}

function loginToReg(){
	var login = document.getElementById("modal-wrapper-login");
	var register = document.getElementById("modal-wrapper-register");
	register.style.display = "block";
	login.style.display = "none";
}

// support

document.getElementById('send_report_button').addEventListener('click', function(){
  var text = document.getElementById('support_text').value;
  console.log("User has requested support, text is: ");
  console.log(text);
  if (text == "" || text == " " || text == null){
    alert('Please enter some text to send to us if you would like to receive help. Thank You!');
    return;
  }
  $.post('/contact_support', {message: text}, res=>{
    alert(res);
    var modal = document.getElementById("modal-wrapper-support");
    modal.style.display = "none";
  });
});

function selectProfileOnMobile(selectA){
  var oldSelected = document.getElementsByClassName("mobile-profiles-list-a-active");
  for (var x in oldSelected){
    oldSelected[x].className = "mobile-profiles-list-a";
  }
  selectA.className = "mobile-profiles-list-a-active";
  selectedMobileProfile = selectA;
}
