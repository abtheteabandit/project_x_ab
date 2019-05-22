//declare router and configure the database
module.exports = router => {
const database = require('../database.js');

//post request to make a gig
router.post('/gig', (req, res) => {
  console.log(req);
  console.log("got into post gigs on router");

  //check if the user is logged in
  if(!req.session.key){
    console.log('Non logged in user tried to post a band');
    res.status(400).end();
  }

  //if the request is invalid
  if (!req.body) {
     res.status(400).send('No body sent').end();
  }

  //values for requests
  var {name, address, price, picture, zipcode, day, startTime, date, endTime, applications, lat, lng, categories, description} = req.body;
  var creator = req.session.key;

  console.log("Received body for gig: " + req.body.name);

    //database query
  database.connect(db => {
    let gigs = db.db('gigs').collection('gigs');
    let confirmCode=createGigConfirmCode(name);
    
    //insert a gig into the database
    gigs.insertOne({'name' : name, 'confirmed':false, 'creator' : creator, 'address': address, 'zipcode':zipcode, 'startTime':startTime, 'price': price, 'date' : date, 'day':day, 'endTime' : endTime, 'applications' : [], 'lat' : lat, 'lng':lng, 'categories' : categories, 'description':description, 'isFilled':false, 'bandFor' : "", 'confirmationCode':confirmCode, 'picture':picture}, (err, result) => {
      if (err){
        console.warn("Couldnt get insert gig into database: " + err);
        res.status(500).end();
        db.close();
      } else {
        console.log("gig inserted result: " + result["ops"][0]["_id"]);
        res.status(200).send(result["ops"][0]["_id"]);
        db.close();
      }
    });
  }, 
  //catch any errors in the database
  err => {
    console.warn("Couldn't connect to database: " + err);
    res.status(500).end();
  });
});

//post request to create a new band
router.post('/band', (req, res) => {
  console.log(req);
  console.log("got into post bands on router");

  //if the user is not signed in
  if(!req.session.key){
    console.log('Non logged in user tried to post a band');
    res.status(400).end();
  }

  //if the request has no body
  if (!req.body) {
		 res.status(400).send('No body sent').end();
  }
  
  //variables set by the request
	var {name, address, zipcode, maxDist, price, openDates, application, lat, lng, picture, categories, description, sample} = req.body;
  var creator=req.session.key;

	console.log("Received body for band: " + req.body.name);

  //database query
	database.connect(db => {
    let bands = db.db('bands').collection('bands');
    //insert a band into the database
		bands.insertOne({'name' : name, 'creator':creator, 'maxDist':maxDist, 'address': address, 'zipcode':zipcode, 'price': price, 'rating':null, 'openDates':openDates, 'applicationText':application, 'lat' : lat, 'lng':lng, 'categories' : categories, 'description': description, 'appliedGigs':[], 'upcomingGigs':[], 'finishedGigs':[], 'interestedGigs':[], 'audioSamples':[sample], 'videoSample':[], 'picture': picture, 'noShows':0, 'showsUp':null}, (err, result) => {
			if (err){
				console.warn("Couldnt get insert band into database: " + err);
				res.status(500).end();
        db.close();
			} else {
				console.log("band inserted with cats as : " + JSON.stringify(categories));
				res.status(200).send(result);
        db.close();

			}
		});
	}, err => {
		console.warn("Couldn't connect to database: " + err);
		res.status(500).end();
	});
});

//generates a random code for gig confirmttation
function createGigConfirmCode(name){
    var x = Math.random();
    var y = Math.random();
    var code = Math.random(x).toString(36).replace('0.', '');
    code += "XkB!s7l5"
    code += Math.random(y).toString(36).replace('0.', '');
    console.log('Random Code: ' + code);
    return code;
}

} // end of module exports
