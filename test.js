module.exports = router=>{
  router.get('/qrcodetes', (req, res)=>{
    console.log(req);
    console.log(JSON.stringify(req.session))
    res.download('./static/test1.swift')
  })
}
