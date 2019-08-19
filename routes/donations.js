module.exports = router=>{
  router.post('/donation', (req, res)=>{
    console.log('\n*****DONATION******\n')
    var stripe_private_key = process.env.STRIPE_SECRET_KEY || 'sk_test_t6hlsKu6iehEdJhV9KzITmxm00flbTdrG5';
    var stripe = require('stripe')(stripe_private_key);
    if (!req.body){
      console.log('no body sent!')
      res.status(200).send('Sorry, it seems there was an issue on our end.').end();
    }
    else{
      

    }
  })
}
