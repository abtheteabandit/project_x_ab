console.log('Axript loaded');
function initMap() {
  // The location of Uluru
  getLocation();

  // The map, centered at Uluru

}
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    console.log("browser doesnt support geolocator api");
  }
}

function showPosition(position) {
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
}

//time slider stuff:
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
 // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  console.log('Slider value: ' + slider.value);
}

$.get('/current_events', {}, res=>{
  console.log('Current Events: ' + JSON.stringify(res));
  for (var e in res){
    var curr_event = res[e];
    document.getElementById('event-list').innerHTML+='<li>'+curr_event.name+'</li>'
  }
})
