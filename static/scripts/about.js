getLocation();

function init(){
  screen.orientation.lock();
}

function flipTicker(){
	console.log("got into flip ticker func");
	$("#flip-box-inner0").flip({
		 trigger: 'manual',
		 axis:'x'
	});
	$('#flip-box-inner0').flip('toggle');
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
}

function parseQueryString(str){
  var categoriesFromStr={};
  var lowerCased = str.toLowerCase();
  for (key in categories){
    if (categories.hasOwnProperity(key)){
      console.log("banks are " + categories[key]);
      for (word in categories[key]['wordBank']){
        if (lowerCased.includes(word)){
          categoriesFromStr[key]['fromQueryStr'].push(word);
        }
      }
    }
  }
  console.log("in parse from str, the categories from str are now" + categoriesFromStr);
  return categoriesFromStr;
}


/*
//this is the function to handle the search bar
function searchHit(type){
	var content = { type: type, query: $("#search_input").val() };
	var method;
	switch(type) {
		case "find_musicians": case "find_gigs":
			method = $.get;
			break;
		case "post_gig":
			method = $.post;
			break
	}

	(method)("/search", content, result => {
		if (result.success) {
			alert(`success! result: ${result.result}.`)
		} else {
			alert(`failure! cause: ${result.cause}.`)
		}
	});
	alert("search was hit!");
	var bands=[];
	var gigs=[];
	searchText=searchField.value;
	switch(searchMode){
		case "bands":
		$.get('/bands', {query:searchText}, function(data){
			$.each(data, function(key,val){
				var band = new Band(val);
				bands.push(band);
			});
		});
		//Now we gotta take this the bands a pass them to the next page, and display them
		break;
		case "gigs":
		$.get('/gigs', {query:searchText}, function(data){
			$.each(data, function(key,val){
				var gig = new Gig(val);
				gigs.push(gig);
			});
		});
		//Now we gotta take this the gigs a pass them to the next page, and display them
		break;
		case "postEvent":
		$.post('/gigs', {query:searchText});
		break;
	}
};

*/
