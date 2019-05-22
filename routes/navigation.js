module.exports = router => {

//get request for the control center
  router.get('/control-center', (req, res)=>{
    console.log("In control nav and req key is : " + req.session.key);
    if(!req.session.key){
      res.status(401).send("You must be logged in to access your home page");
      return;
    }
    res.render('control-center.html');
  });

  //get request for another profile
  router.get('/otherProfile', (req,res)=>{
    if(!req.session.key){
      console.log('A user tried to view profiles without loggin in');
      res.status(200).send('Sorry, you must login to view profiles.')
    }
    if(!req.query){
      console.log("No query sent with request in other profile router page.");
      res.status(400).end();
    }
    //success case
    else{
      res.render('otherProfile.html');
    }

  });

  //get request for the search page
  router.get('/search_page', (req,res) => {
    res.render('search.html');
  });
}
