function addRating(id, newRating){
  $.post('/bandRating', {'id':id, 'newRating':newRating}, result=>{
    console.log("New Rating posted here is result: " + JSON.stringify(result));
  });
}

//create band
//name, address, zipcode, price, openDates, application, lat, lng, audioSamples, videoSamples, picture, categories

function createBand(){
  $.post('/band', {'name':"Deadalus", 'creator':'xxx', 'address':"N27 W5230", 'zipcode': 53012, 'price': 33, 'rating':null, 'openDates':["2019-01-26T14:22"], 'application':"We are a good band", 'lat': 100.1, 'lng': 109.2, 'audioSamples':[], 'videoSamples':[], 'picture':"no jpeg yet", 'appliedGigs':['gigneat23', 'gigawesome12'], 'categories':{'genres':[],'vibes':[],'insts':[],'gigTypes':[]}}, result => {
    console.log("got cb from post /band");
    alert(`result is ${result}`);
  });
}

//GIG creation stuff//
function cleanGigInput(){
  console.log("got into post gig");
  var name = $('#gig_name_input').val();
  console.log("name from gig form is: " + name);
  var address = $('#gig_address_input').val();
  var price = $('#gig_price_input').val();
  var description = $('#gig_desc_input').val();
  var startDate = $('#gig_start_input').val();
  var endDate = $('#gig_end_input').val();
  var zipcode = $('#gig_zip_input').val();
  if (zipcode==null || zipcode == "" || zipcode == " " || zipcode == "Enter Zipcode"){
  $('#errorMessages').html("Please enter a valid zipcode");
  }
  if (price==null || price == "" || price == " " || price == "Enter Price"){
  $('#errorMessages').html("Please enter a valid price (no dollar sign");
  }
  if (address==null || address == "" || address == " " || address == "Enter Address"){
  $('#errorMessages').html("Please enter a valid address");
  }
  if (startDate==null || startDate == "" || startDate == " " || startDate == "Enter Date"){
  $('#errorMessages').html("Please enter a valid start date<");
  }
  if (endDate==null || endDate == "" || endDate == " " || endDate == "Enter Date"){
  $('#errorMessages').html("Please enter a valid end date");
  }
  if (description==null || description == "" || description == " " || description.includes("description")){
    $('#errorMessages').html("Please enter a description, with genres, vibes, and your gig's type (i.e. birthday party, bar, etc.) and instruments if you would like");
  }
  if (name==null || name == "" || name == " " || name == "Enter Gig Name"){
    $('#errorMessages').html("Please Enter A Unqiue Gig Name");
  }
  else{
    $("#errorMessages").remove();
    convertZip();
  }
}

function convertZip(){
  var zipcode = $('#gig_zip_input').val();
  $.getJSON('http://api.openweathermap.org/data/2.5/weather?zip='+zipcode+',us&APPID=f89469b4b424d53ac982adacb8db19f6').done(function(data){
    console.log(JSON.stringify(data));
    var lat = data.coord.lat;
    var lng = data.coord.lon;
    post_gig(lat,lng);
  });
}


function post_gig(lat,lng) {
  console.log("got into post gig");
  var name = $('#gig_name_input').val();
  console.log("name from gig form is: " + name);
  var address = $('#gig_address_input').val();
  var price = $('#gig_price_input').val();
  var description = $('#gig_desc_input').val();
  var startDate = $('#gig_start_input').val();
  var endDate = $('#gig_end_input').val();
  var zipcode = $('#gig_zip_input').val();
  var creator='test123';
  //must implment getting user name out of session
  var gig = {'name':name,
            'creator':creator,
            'address': address,
            'price': price,
            'startDate': startDate,
            'endDate': endDate,
            'applications': [],
            'lat': lat,
            'lng': lng,
            'zipcode' : zipcode,
            'createdBy' : "a user"
            };
  var categoriesFromStr = parseQueryString(description);
  gig['categories'] = categoriesFromStr;
  console.log(gig);
	$.post('/gig', {'name':name, 'creator':creator, 'address':address, 'zipcode': zipcode, 'price': price, 'startDate': startDate, 'endDate': endDate, 'applications': [], 'lat': lat, 'lng': lng, 'categories':categoriesFromStr, 'isFilled':true, 'bandFor':'none'}, result => {
    console.log("got cb from post /gig");
		alert(`result is ${result}`);
	});
}

function stringToDate(str){
  var date = new Date(str);
  console.log("in string to date and adate is " + date);
  return date;
}

function getPicture(picID){
  $.get('/picture', {'picID':picID}, result=>{
    console.log('Got a result for get picture: ' + JSON.stringify(result));
  });
}
function postPicture(){

}

function haversineDistance(coords1, coords2, isMiles) {
  function toRad(x) {
    return x * Math.PI / 180;
  }

  var  = coords1[0];
  var lat1 = coords1[1];

  var lon2 = coords2[0];
  var lat2 = coords2[1];

  var R = 6371; // km

  var x1 = lat2 - lat1;
  var dLat = toRad(x1);
  var x2 = lon2 - lon1;
  var dLon = toRad(x2)
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;

  d /= 1.60934;

  return d;
}
