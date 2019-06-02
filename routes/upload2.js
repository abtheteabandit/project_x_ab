module.exports = router => {

const database = require('../database.js'),
      multer = require('multer'),
    //  logger = require('../logger.js'),
      fs = require('fs');

      //create the paths with multer
      var uploadingGigPics = multer({
          dest: './public/tmp/'
      });

      var uploadingBandPic = multer({
        dest: './public/tmp/'
      });

      var uploadingAudioSample = multer({
        dest: './public/tmp/'
      });
      var uploadingAudioPic = multer({
        dest: './public/tmp/'
      });
      var uploadingPromoPic = multer({
        dest: './public/tmp/'
      });
      var uploadingVideoSample = multer({
        dest: './public/tmp'
      });

      //post request to upload a gig's pic
  router.post('/uploadGigPic', uploadingGigPics.single('image'), function(req, res) {
      if (!req.file){
        console.log('No file sent');
        res.status(200).send('Sorry, you must upload an image for this event.');
        return;
      }
      if (!req.session.key){
        console.log('User tried to upload gig pic while not logged in');
        res.status(401).end();
      }
      //if invalid file
      if (!(req.file.mimetype=='image/jpeg' || req.file.mimetype=='image/png')){
        console.log('Wrong mimetype')
        res.status(200).send("Sorry, you must upload a .jpeg or .png file for your image.");
        return;
      }

      //get file name and store the file
      var fileName = 'static/uploads/GigPics/'+req.file.filename;
      console.log(req.file);      //res.send(req.file);
      fs.rename(req.file.path, fileName, err2=>{
        if(err2){
          console.log('Could not rename file, error: ' + err2);
          res.status(500).end();
        }
        else{
          var finalName = fileName.replace('static', "");
          res.status(200).send(finalName);
        }
      });
  });

  //upload an image for a band avatar
  router.post('/uploadBandAvatar', uploadingBandPic.single('image'), function(req, res){
    if (!req.session.key){
      console.log('User tried to upload gig pic while not logged in');
      res.status(401).end();
      }
      if (!req.file){
        console.log('No file sent');
        res.status(400).end();
      }
      //if not a valid image
      if (!(req.file.mimetype=='image/jpeg' || req.file.mimetype=='image/png')){
        console.log('Wrong mimetype')
        res.status(200).send("Wrong mimeType");
        return;
      }
    console.log(req.file);
    var fileName = 'static/uploads/GigPics/'+req.file.filename;
    console.log(req.file);      //res.send(req.file);

    //store the image
    fs.rename(req.file.path, fileName, err2=>{
      if(err2){
        console.log('Could not rename file, error: ' + err2);
        res.status(500).end();
      }
      else{
        var finalName = fileName.replace('static', "");
        res.status(200).send(finalName);
      }

    });
  });

  //post request to upload a sound byte
  router.post('/uploadSoundByte', uploadingAudioSample.single('soundByte'), function(req, res){
    if (!req.session.key){
      console.log('User tried to upload gig pic while not logged in');
      res.status(401).end();
      }
      if (!req.file){
        console.log('No file sent');
        res.status(400).end();
      }
      //if not a valid file type
      if (!(req.file.mimetype=='audio/mp3' || req.file.mimetype=='audio/wav')){
        console.log('Wrong mimetype')
        res.status(200).send("Wrong mimeType");
        return;
      }

    console.log(req.file);
    var fileName = 'static/uploads/SoundBytes/'+req.file.filename;
    console.log(req.file);      //res.send(req.file);
    //upload the file
    fs.rename(req.file.path, fileName, err2=>{
      if(err2){
        console.log('Could not rename file, error: ' + err2);
        res.status(500).end();
      }
      else{
        var finalName = fileName.replace('static', "");
        res.status(200).send(finalName);
      }
    });
  });

  //post request to upload an audio picture
  router.post('/uploadAudioPic', uploadingAudioPic.single('audioPic'), function(req, res){
    if (!req.session.key){
      console.log('User tried to upload gig pic while not logged in');
      res.status(401).end();
    }
    if (!req.file){
      console.log('No file sent');
      res.status(400).end();
    }
    //check file type
    if (!(req.file.mimetype=='image/jpeg' || req.file.mimetype=='image/png')){
      console.log('Wrong mimetype')
      res.status(200).send("Wrong mimeType");
      return;
    }

    console.log(req.file);
    var fileName = 'static/uploads/AudioPics/'+req.file.filename;
    console.log(req.file);      //res.send(req.file);
    //store the file
    fs.rename(req.file.path, fileName, err2=>{
      if(err2){
        console.log('Could not rename file, error: ' + err2);
        res.status(500).end();
      }
      else{
        var finalName = fileName.replace('static', "");
        res.status(200).send(finalName);
      }

    });
  });

  router.post('/uploadPromoPic', uploadingPromoPic.single('promoPic'), (req,res)=>{
    if (!req.session.key){
      console.log('User tried to upload gig pic while not logged in');
      res.status(401).end();
    }
    if (!req.file){
      console.log('No file sent');
      res.status(400).end();
    }
    if (!(req.file.mimetype=='image/jpeg' || req.file.mimetype=='image/png')){
      console.log('Wrong mimetype')
      res.status(200).send("Wrong mimeType");
      return;
    }
    console.log(req.file);
    var fileName = 'static/uploads/PromoPics/'+req.file.filename;
    console.log(req.file);
    fs.rename(req.file.path, fileName, err2=>{
      if(err2){
        console.log('Could not rename file, error: ' + err2);
        res.status(500).end();
      }
      else{
        var finalName = fileName.replace('static', "");
        console.log('Final name is: ' + finalName);
        res.status(200).send(finalName);
      }
    });
  });
  router.post('/uploadVideoSample', uploadingVideoSample.single('videoSample'), (req,res)=>{
    if (!req.session.key){
      console.log('User tried to upload gig pic while not logged in');
      res.status(401).end();
    }
    if (!req.file){
      console.log('No file sent');
      res.status(400).end();
    }
    if (!(req.file.mimetype=='video/mp4')){
      console.log('Wrong mimetype')
      res.status(200).send("Wrong mimeType");
      return;
    }
    console.log(req.file);
    var fileName = 'static/uploads/VideoSamples/'+req.file.filename;
    console.log(req.file);
    fs.rename(req.file.path, fileName, err2=>{
      if(err2){
        console.log('Could not rename file, error: ' + err2);
        res.status(500).end();
      }
      else{
        var finalName = fileName.replace('static', "");
        console.log('Final name is: ' + finalName);
        res.status(200).send(finalName);
      }
    });
  });

} // end of exports
