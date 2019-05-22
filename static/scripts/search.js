/*************************************************************************
 *
 * BANDA CONFIDENTIAL
 * __________________
 *
 *  Copyright (C) 2019
 *  Banda Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Banda Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Banda Incorporated
 * and its suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Banda Incorporated.
 *
*************************************************************************/
function getUserInfo(){
  $.get('/user', {'query':'who am i ?'}, result=>{
    console.log("Got result for user and it is : "+JSON.stringify(result));
    var myUser = result;
    $.get('/getBands', {'creator':result['username']}, bandsResult0=>{
      console.log("Got result for getting our user's bands, here it is :" + JSON.stringify(bandsResult0));
      var myBands = bandsResult0;
      $.get('/getGigs', {'creator':myUser['username']}, gigResult0=>{
        console.log("Got result for getting our user's bands, here it is :" + JSON.stringify(gigResult0));
        var myGigs = gigResult0;
        populateDropDown(myUser, myBands, myGigs);
      });
    });
  });
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
    return;
  }
  var selectMenu = document.getElementById('selectDrop');
//  var userDropTitle = document.createElement('<option value="'+myUser._id+'">'+myUser.username+'</option>');
  var userDropTitle=document.createElement('option');
  userDropTitle.innerHTML=myUser.username;
  userDropTitle.setAttribute('value','user');
  userDropTitle.setAttribute('id', 'userDropTitle');
  selectMenu.appendChild(userDropTitle);
  for (band in myBands){
    var bandTitle=document.createElement('option');
    bandTitle.innerHTML=myBands[band].name;
    bandTitle.setAttribute('value','band');
    bandTitle.setAttribute('data-objID', myBands[band]._id);
    bandTitle.setAttribute('id', 'band'+band+'DropTitle');
    selectMenu.appendChild(bandTitle);
  }
  for (gig in myGigs){
    var gigTitle=document.createElement('option');
    gigTitle.innerHTML=myGigs[gig].name;
    gigTitle.setAttribute('value','gig');
    gigTitle.setAttribute('data-objID', myGigs[gig]._id);
    gigTitle.setAttribute('id', 'gig'+gig+'DropTitle');
    selectMenu.appendChild(gigTitle);
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
   // Collect search entry and add to search input
   var textForSearchInput = queries[0];
   textForSearchInput = decodeURI(textForSearchInput);
   textForSearchInput = textForSearchInput.replace("query=","");
   document.getElementById("search_input").value = textForSearchInput;
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

var hasCreditCard = false;

function init(){
  /*
  if the user has a credit card
    hasCreditCard = true;
  */
  var urlJSON = parseURL(window.location.href);
  getUserInfo();
  console.log(JSON.stringify(urlJSON));
  performSearch(urlJSON);

  var theGrid = document.getElementById("grid-container");
  /*
  var images = ["1.jpg","2.jpeg","3.jpeg","4.jpeg","5.jpeg","6.jpeg","7.jpeg","8.jpeg","9.jpeg","10.jpeg","11.jpeg","12.jpeg","13.jpeg","14.jpeg","15.jpeg","16.jpeg","17.jpeg","18.jpeg","19.jpeg","20.jpeg"];
  for(i in images){
    var newDiv = document.createElement("div");
    newDiv.style.backgroundImage = "url(/assets/Home/Art/"+images[i]+")";
    // var newImg = document.createElement("img");
    // newImg.src = "../static/assets/Home/Art/"+images[i];
    // newDiv.appendChild(newImg);
    var nameDiv = document.createElement("div");
    nameDiv.className = "result-name-div";
    var nameP = document.createElement("p");
    nameP.innerHTML = images[i];
    // nameDiv.className = "result-name-p";
    // nameDiv.innerHTML = images[i];
    nameDiv.appendChild(nameP);
    newDiv.appendChild(nameDiv);
    theGrid.appendChild(newDiv);
    console.log("appended");
  }
  */
}

var state = 0;

function changeState(newState){
  if(newState == state){
    // do nothing
  }else{
    var m = document.getElementById("m");
    var mv = document.getElementById("mv");
    var v = document.getElementById("v");

    switch(newState){
      case 0:
        m.src = "/assets/Search/m_filter_selected.png";
        mv.src = "/assets/Search/mv_filter.png"
        v.src = "/assets/Search/v_filter.png"
        state = 0;
        filterResults();
        break;
      case 1:
        m.src = "/assets/Search/m_filter.png";
        mv.src = "/assets/Search/mv_filter_selected.png"
        v.src = "/assets/Search/v_filter.png"
        state = 1;
        filterResults();
        break;
      case 2:
        m.src = "/assets/Search/m_filter.png";
        mv.src = "/assets/Search/mv_filter.png"
        v.src = "/assets/Search/v_filter_selected.png"
        state = 2;
        filterResults();
        break;
    }
  }
}


function filterResults(){
  console.log(state);
}

function doesContainID(id, arr){
  console.log("IN CONATINS ID and id is : "  +  id);
  for (item in arr){
    console.log("IN CONATINS ID and id in for loop is : "  +  arr[item]);
    if (arr[item]==id){
      return true;
    }
  }
  return false;
}
var theGird = null;
function performSearch(json){
  theGrid = document.getElementById("grid-container");
  while(theGrid.hasChildNodes()){
    console.log("removing children");
    theGrid.removeChild(theGrid.lastChild);
  }

  console.log('In PERFORM SEARCH and json is : ' + JSON.stringify(json));
  var mode = json['searchObject']['mode'];
  var searchTxt = json["searchObject"]['query'];
  var gigName = json["searchObject"]['gigName'];
  var bandName = json["searchObject"]['bandName'];
  bandName = String(bandName);
  bandName=bandName.replace(/%20/g, " ");
  bandName=bandName.replace(/%22/g, "");
  gigName = String(gigName);
  gigName=gigName.replace(/%20/g, " ");
  gigName=gigName.replace(/%22/g, "");
  if (mode==null){
    console.log("Error: there was no mod supplied");
    return;
  }
  if (searchTxt==null){
    console.log("Error: there was no search Text supplied");
    return;
  }
   searchTxt=String(searchTxt);
   searchTxt=searchTxt.replace(/%20/g, " ");
   searchTxt=searchTxt.replace(/%22/g, "");
   if (mode=='findGigs'){
     if(bandName==null || bandName=='null'){
       console.log('got in first if gig for search');
       $.get("/searchNoName", { 'mode': "findGigs", 'query': searchTxt}, result => {
   		    // alert(`result is ${JSON.stringify(result)}`);
          showResults(mode, null, result);
   	    });
     }
     else{
       $.get("/search", { 'mode': "findGigs", 'query': searchTxt, 'bandName': bandName }, result => {
     		  // alert(`result is ${JSON.stringify(result)}`);
           showResults(mode, null, result);
     	  });
     }
   }
   else{
     if(gigName==null || gigName=='null'){
       $.get("/searchNoName", { 'mode': "findBands", 'query': searchTxt}, result => {
           // alert(`result is ${JSON.stringify(result)}`);
           showResults(mode, result, null);
        });
     }
     else{
       $.get("/search", { 'mode': "findBands", 'query': searchTxt, 'gigName': gigName}, result => {
       		// alert(`result is ${JSON.stringify(result)}`);
           showResults(mode, result, null);
       	});
     }
   }
}

function showResults(mode, bands, gigs){
  var loaderPage = document.getElementById("loader-page");
  loaderPage.style.display = "none";
  theGrid = document.getElementById("grid-container");
  /*
  AB
  ******************8\*******************************************************************************************
  CLEAR ALL THE RESULTS FROM THE GRIDDDDDD
  heres how i tried:
  while (theGird.firstChild){
    theGrid.removeChild(theGrid.firstChild);
  }
  but it don't workkk:
  ******************8\*******************************************************************************************
  AB
  */
  // check for no results
  console.log('bands: ' + JSON.stringify(bands) + 'gigs: ' + JSON.stringify(gigs));
  if (bands == null && gigs == null ){
    console.log('both gigs and bands were null')
    var noResP = document.getElementById("no-res-p");
      noResP.innerHTML = "Sorry, we could not find any results. Try searching again with different keywords, or searching as one of your bands or events. For example, 'band with guitar for a birthday party' as an event.";
      noResP.style.display = "block";
  }
  else if (bands!=null){
    if(bands.data.queryMatchers.length==0 && bands.data.overallMatchers.length==0){
      var noResP = document.getElementById("no-res-p");
        noResP.innerHTML = "Sorry, we could not find any results. Try searching again with different keywords, or searching as one of your bands or events. For example, 'band with guitar for a birthday party' as an event.";
        noResP.style.display = "block";
        return;
    }
  }
  else if (gigs!=null){
    if(gigs.data.queryMatchers.length==0 && gigs.data.overallMatchers.length==0){
      var noResP = document.getElementById("no-res-p");
        noResP.innerHTML = "Sorry, we could not find any results. Try searching again with different keywords, or searching as one of your bands or events. For example, 'band with guitar for a birthday party' as an event.";
        noResP.style.display = "block";
        return;
    };
  }
  if(bands==null){
    var mixedGigArr=[];
    var idsInMix = [];
    var j = 0;
    for (gig in gigs['data']['queryMatchers']){
      if (doesContainID(gigs['data']['queryMatchers'][gig][0]._id, idsInMix)){

      }
      else{
        mixedGigArr.push(gigs['data']['queryMatchers'][gig]);
        idsInMix.push(gigs['data']['queryMatchers'][gig][0]._id);
      }
      if (j<gigs['data']['overallMatchers'].length){
        if (doesContainID(gigs['data']['overallMatchers'][j][0]._id, idsInMix)){

        }
        else{
          mixedGigArr.push(gigs['data']['overallMatchers'][j]);
          idsInMix.push(gigs['data']['overallMatchers'][j][0]._id);
        }
        j=j+1;
      }
    }
    while (j<gigs['data']['overallMatchers'].length){
      mixedGigArr.push(gigs['data']['overallMatchers'][j]);
      j=j+1;
    }
    var results=[];
    for (gig in mixedGigArr){
    /*  var newDiv = document.createElement("div");
    //  newDiv.style.backgroundImage = "url(/assets/Home/Art/"+testBands.data.overallMatchers[gig][0].picture+")";
      var nameDiv = document.createElement("div");
      nameDiv.className = "result-name-div";
      var nameP = document.createElement("p");
      nameP.innerHTML = mixedGigArr[gig][0].name;
      nameDiv.appendChild(nameP);
      newDiv.appendChild(nameDiv);
      theGrid.appendChild(newDiv);
      console.log("appended");
      */
      results[gig] = new GigCell(mixedGigArr[gig][0], gig);
    }
  }
  else if(bands != null){
    var mixedBandArr = [];
    var idsInMixBands = [];
    var results=[];
    var i = 0;
    for (band in bands['data']['queryMatchers']){
      if (doesContainID(bands['data']['queryMatchers'][band][0]._id, idsInMixBands)){

      }
      else{
      mixedBandArr.push(bands['data']['queryMatchers'][band]);
      idsInMixBands.push(bands['data']['queryMatchers'][band][0]._id);
      }
      if (i<bands['data']['overallMatchers'].length){
        if (doesContainID(bands['data']['overallMatchers'][i][0]._id, idsInMixBands)){

        }
        else{
          mixedBandArr.push(bands['data']['overallMatchers'][i]);
          idsInMixBands.push(bands['data']['overallMatchers'][i][0]._id);
        }
        i=i+1;
      }
    }
    while (i<bands['data']['overallMatchers'].length){
      mixedBandArr.push(bands['data']['overallMatchers'][i]);
      i=i+1;
    }
    for(band in mixedBandArr){
      results[band] = new BandCell(mixedBandArr[band][0], band);

      /*
      var newDiv = document.createElement("div");
      //newDiv.style.backgroundImage = "url(assets/Home/Art/"+mixedBandArr[band].picture+")";
      var nameDiv = document.createElement("div");
      nameDiv.className = "result-name-div";
      var nameP = document.createElement("p");
      nameP.innerHTML = mixedBandArr[band][0].name;
      nameDiv.appendChild(nameP);
      newDiv.appendChild(nameDiv);
      theGrid.appendChild(newDiv);
      console.log("appended");
      */
    }
    var bodyContainer = document.getElementById("body-container");
    var newDiv = document.createElement("div");
    var newBR = document.createElement("br");
    newDiv.append(newBR);
    newDiv.append(newBR);
    newDiv.append(newBR);
    bodyContainer.append(newDiv);
  }
}

//NEW AB STUFF:

function searchForBands(){
  console.log('in serach for bands');
  var m = document.getElementById("m");
  var mv = document.getElementById("mv");
  var v = document.getElementById("v");
  //m.src = "/assets/Search/m_filter_selected.png";
  //mv.src = "/assets/Search/mv_filter.png";
  //v.src = "/assets/Search/v_filter.png";
  var noResP = document.getElementById("no-res-p");
    noResP.innerHTML = "Sorry, we could not find any results. Try searching again with different keywords, or searching as one of your bands or events. For example, 'band with guitar for a birthday party' as an event.";
    noResP.style.display = "none";

  var searchAsName = $('#selectDrop option:selected').data();
  console.log(JSON.stringify(searchAsName));
  searchAsName=searchAsName['objid']
  console.log('Data from drop down is : '+searchAsName);
  var serachAsType = $('#selectDrop option:selected').val();
  var searchText = $('#search_input').val();

  if (searchText==null || searchText=="" || searchText==" " ){
    alert('Please enter a value in the search bar if you would like to perform a search.');
    return;
  }
  console.log('search as name : '+searchAsName);
  console.log('search as type : '+serachAsType);

  if (serachAsType=='band'){
    alert("You can't search for bands as a band. Please select one of your events or your username in the drop down menu.");
    return;
  }
  else if (serachAsType=='gig'){
    console.log('in else for search as gig');


    var mode = 'findBands';
    var searchObject = {
      'mode':mode,
      'query':searchText,
      'bandName':null,
      'gigName':searchAsName
    };
    var jsonForSearch = {
      'searchObject':searchObject
    };
    performSearch(jsonForSearch);
  }
  else{
    console.log('in else for no name');


    var mode = 'findBands';
    var searchObject = {
      'mode':mode,
      'query':searchText,
      'bandName':null,
      'gigName':null
    };
    var jsonForSearch = {
      'searchObject':searchObject
    };
    performSearch(jsonForSearch);
  }

  /*
  var mode = json['searchObject']['mode'];
  var searchTxt = json["searchObject"]['query'];
  var gigName = json["searchObject"]['gigName'];
  var bandName = json["searchObject"]['bandName'];
  */

}

function searchForGigs(){
  var m = document.getElementById("m");
  var mv = document.getElementById("mv");
  var v = document.getElementById("v");
  /*
  m.src = "/assets/Search/m_filter.png";
  mv.src = "/assets/Search/mv_filter.png";
  v.src = "/assets/Search/v_filter_selected.png";
  */
var noResP = document.getElementById("no-res-p");
  noResP.innerHTML = "Sorry, we could not find any results. Try searching again with different keywords, or searching as one of your bands or events. For example, 'band with guitar for a birthday party' as an event.";
  noResP.style.display = "none";
  var searchAsName = $('#selectDrop option:selected').data()['objid'];
  var serachAsType = $('#selectDrop option:selected').val();
  var searchText = $('#search_input').val();

  if (searchText==null || searchText=="" || searchText==" " ){
    alert('Please enter a value in the search bar if you would like to perform a search.');
    return;
  }
  console.log('search as name : '+searchAsName);
  console.log('search as type : '+serachAsType);

  if (serachAsType=='gig'){
    alert("You can't search for events as an event. Please select one of your bands or your username in the drop down menu.");
    return;
  }
  else if (serachAsType=='band'){
    console.log('in else');


    var mode = 'findGigs';
    var searchObject = {
      'mode':mode,
      'query':searchText,
      'bandName':searchAsName,
      'gigName':null
    };
    var jsonForSearch = {
      'searchObject':searchObject
    };
    performSearch(jsonForSearch);
  }
  else{
    console.log('in else');


    var mode = 'findGigs';
    var searchObject = {
      'mode':mode,
      'query':searchText,
      'bandName':null,
      'gigName':null
    };
    var jsonForSearch = {
      'searchObject':searchObject
    };
    performSearch(jsonForSearch);
  }
}

function doesContainID(id, arr){
  console.log("IN CONATINS ID and id is : "  +  id);
  for (item in arr){
    console.log("IN CONATINS ID and id in for loop is : "  +  arr[item]);
    if (arr[item]==id){
      return true;
    }
  }
  return false;
}

class BandCell {

  constructor(band,id){
    this.id = id;
    this.bandID = band._id;
    this.newDiv = document.createElement("div");
    this.newDiv.style.backgroundImage = "url("+band.picture+")";
    // overlay
    this.newOverlay = document.createElement("div");
    this.newOverlay.className = "result-overlay";
    this.overlayID = "result-overlay-"+id;
    this.newOverlay.name = band['_id'];
    this.newOverlay.addEventListener('click', function(){
      if ($('#selectDrop option:selected')){
        var searchAsName = $('#selectDrop option:selected').data();
        searchAsName=searchAsName['objid']
        var searchAsType = $('#selectDrop option:selected').val();
        window.location.href='otherProfile?id='+this.name+'&mode=band&searchingAs='+searchAsName+'&searchingType='+searchAsType;
      }
      else{
        alert('You must sign in to view profiles.');
      }
    });
    this.newOverlay.setAttribute("id",this.overlayID);
    this.priceText = document.createElement("p");
    this.priceText.innerHTML = "$"+band.price;
    // audio
    this.newDiv.audio = new Audio();
    var audioSample = band['audioSamples'][0]['audio'];
    this.newDiv.audio.src = audioSample;
    this.newDiv.audio.type='audio/mp3';
    // frame
    this.newFrame = document.createElement("img");
    this.newFrame.className = "result-frame";
    this.newFrame.src = "/assets/Control-Center/purplebox.png";
    this.newFrame.alt = "frame";
    // name
    this.nameDiv = document.createElement("div");
    this.nameDiv.className = "result-name-div";
    this.nameP = document.createElement("p");
    this.nameP.innerHTML = band.name;
    // appends
    this.newOverlay.appendChild(this.priceText);
    this.newDiv.appendChild(this.newOverlay);
    this.newDiv.appendChild(this.newFrame);
    this.nameDiv.appendChild(this.nameP);
    this.newDiv.appendChild(this.nameDiv);
    theGrid.appendChild(this.newDiv);
    this.AddEventListeners(this);
  }

  AddEventListeners(obj){
    this.newDiv.addEventListener("mouseover",function(){
      obj.newOverlay.style.zIndex = "8";
      obj.newOverlay.style.opacity = "1.0";
      var playPromise = obj.newDiv.audio.play();
      if (playPromise !== undefined) {
        playPromise.then(function () {
        	 console.log('Playing....');
        }).catch(function (error) {
        	 console.log('Failed to play....' + error);
        });
 		  }
    },false);
    this.newDiv.addEventListener("mouseout",function(){
      obj.newOverlay.style.zIndex = "-8";
      obj.newOverlay.style.opacity = "0";
      obj.newDiv.audio.pause();
    },false);
    this.newDiv.addEventListener("click",function(){
      console.log(obj.bandID);
    },false);
  }
}

class GigCell{

  constructor(gig,id){
    this.id = id;
    this.gigID = gig._id;
    console.log("id: "+id);
    this.newDiv = document.createElement("div");
    console.log("pic: "+gig.picture);

    this.newDiv.style.backgroundImage = 'url('+gig.picture+')';
    // overlay
    this.newOverlay = document.createElement("div");
    this.newOverlay.className = "result-overlay";
    this.overlayID = "result-overlay-"+id;
    this.newOverlay.setAttribute("id",this.overlayID);
    this.priceText = document.createElement("p");
    this.priceText.innerHTML = "$"+gig.price;
    // frame
    this.newFrame = document.createElement("img");
    this.newFrame.className = "result-frame";
    this.newFrame.src = "/assets/Control-Center/orangebox.png";
    this.newFrame.alt = "frame";
    // name
    this.nameDiv = document.createElement("div");
    this.nameDiv.className = "result-name-div";
    this.nameP = document.createElement("p");
    if(hasCreditCard){
      this.nameP.innerHTML = gig.name;
      console.log("not blurring");
    }else{
      console.log("blurring it");
      this.nameP.innerHTML = this.GenerateString(gig.name.length);
      this.nameP.className = "result-p-blurred";
    }
    // appends
    this.newOverlay.appendChild(this.priceText);
    this.newOverlay.name = gig['_id'];
    this.newOverlay.addEventListener('click', function(){
      if($('#selectDrop option:selected')){
        var searchAsName = $('#selectDrop option:selected').data();
        searchAsName=searchAsName['objid']
        var searchAsType = $('#selectDrop option:selected').val();
        window.location.href='otherProfile?id='+this.name+'&mode=gig&searchingAs='+searchAsName+'&searchingType='+searchAsType;
      }
      else{
        alert('You must sign in to view profiles.');
      }

    });
    this.newDiv.appendChild(this.newOverlay);
    this.newDiv.appendChild(this.newFrame);
    this.nameDiv.appendChild(this.nameP);
    this.newDiv.appendChild(this.nameDiv);
    theGrid.appendChild(this.newDiv);
    this.AddEventListeners(this);
  }

  GenerateString(length){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  AddEventListeners(obj){
    this.newDiv.addEventListener("mouseover",function(){
      obj.newOverlay.style.zIndex = "8";
      obj.newOverlay.style.opacity = "1.0";
    },false);
    this.newDiv.addEventListener("mouseout",function(){
      obj.newOverlay.style.zIndex = "-8";
      obj.newOverlay.style.opacity = "0";
    },false);
    this.newDiv.addEventListener("click",function(){
      console.log(obj.gigID);
    },false);
  }
}

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
