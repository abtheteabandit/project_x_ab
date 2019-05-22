module.exports = router =>{
  const database = require('../database.js');
  const allowed_users = {"alexander_bothe":'awesome_thing_12!', "eli_levin":"akira2016", "max_schmitz":"Blue12#$", "miccah_round":"cheese12345", "AB_Brooks":"ABTheTeaBandit"}

  //get a count for the users in teh database
  router.get('/count', (req, res)=>{
    console.log('Got count request')
    if (!req.query){
      res.status(401).end();
    }
    var {username, password, data_type, filter, filter_crit} = req.query
    console.log('Query: ' + JSON.stringify(req.query));
    if (!allowed_users.hasOwnProperty(username)){
      res.status(404).end();
    }
    else{
      if (allowed_users[username] != password){
        res.status(404).end();
      }
      else{
        //success case, query database
        database.connect(db=>{
          switch(data_type){
            //return count for gigs
            case "gigs":
            findGigCount(db, filter, filter_crit, (count_error, res3)=>{
              if(count_error){
                res.status(500).end();
                db.close();
              }
              else{
                res.status(200).send({body:res3});
                db.close();
              }
            });
            break
            //return count for bands
            case "bands":
            findBandCount(db, filter, filter_crit, (count_error, res3)=>{
              if(count_error){
                res.status(500).end();
                db.close();
              }
              else{
                res.status(200).send({body:res3});
                db.close();
              }
            });
            break
            //return count for transactions
            case "transactions":
            findTransCount(db, filter, filter_crit, (count_error, res3)=>{
              if(count_error){
                res.status(500).end();
                db.close();
              }
              else{
                res.status(200).send({body:res3});
                db.close();
              }
            });
            break
            //return count for users
            case "users":
            findUserCount(db, filter, filter_crit, (count_error, res3)=>{
              if(count_error){
                res.status(500).end();
                db.close();
              }
              else{
                console.log('Res is: ' + res3)
                res.status(200).send({body:res3});
                db.close();
              }
            });
            break
            default:
            res.status(401).send("The data type you submitted, does not match any of database we have.");
            db.close();
            break;
          }
        }, err=>{
          console.log('There was an error connectiong to mongo: ' + err);
        })
      }
    }
  });

  //helpoer function to count gigs
  function findGigCount(db, filter, filter_crit, cb){
    switch(filter){
      case "none":
      //query for the count of gigs
      db.db('gigs').collection('gigs').count().then(count=>{
        console.log('Number of gigs is: ' + count);
        cb(null,count)
      });
      break;
      //query for the price of gigs
      case "price":
      db.db('gigs').collection('gigs').find({'price':{$gt:filter_crit}}).toArray((err2, res2)=>{
        if (err2){
          console.log('There was an error finding gigs with '+filter+' = '+filter_crit);
          cb(err2, null);
        }
        else{
          console.log('Got gigs out of db with filter: ' +filter+' = ' +filter_crit);
          cb(null, res2.length);
        }
      });
      break;
      //query for the area codes for gigs
      case "zipcode":
      db.db('gigs').collection('gigs').find({'zipcode':filter_crit}).toArray((err2, res2)=>{
        if (err2){
          console.log('There was an error finding gigs with '+filter+' = '+filter_crit);
          cb(err2, null);
        }
        else{
          console.log('Got gigs out of db with filter: ' +filter+' = ' +filter_crit);
          cb(null, res2.length);
        }
      });
      break;

      //query for the descirptions of the gigs
      case "description":
      db.db('gigs').collection('gigs').find().toArray((err2, res2)=>{
        if (err2){
          console.log('There was an error finding bands with confirmed true: ' + err2);
          cb(err2, null);
        }
        else{
          var allMatchers = [];
          for (var gig in res2){
            var aGig = res2[gig];
            if (aGig.description.includes(filter_crit)){
              allMatchers.append(aGig);
            }
          }
          cb(null, allMatchers.length);
        }
      });
      break;

      default:
      console.log('Unrecongized filter');
      cb("Unrecongized filter", null);
      break;
    }
  }

  //funciton to get stats for the bands
  function findBandCount(db, filter, filter_crit, cb){
    switch(filter){
      //count all bands
      case "none":
      db.db('bands').collection('bands').count().then(count=>{
        console.log('Number of bands is: ' + count);
        cb(null,count)
      });
      break;
      //query the prices
      case "price":
      db.db('bands').collection('bands').find({'price':{$gt:filter_crit}}).toArray((err2, res2)=>{
        if (err2){
          console.log('There was an error finding bands with '+filter+' = '+filter_crit);
          cb(err2, null);
        }
        else{
          console.log('Got bands out of db with filter: ' +filter+' = ' +filter_crit);
          cb(null, res2.length);
        }
      });
      break;
      //query the zipcodes/area codes of the bands
      case "zipcode":
      db.db('bands').collection('bands').find({'zipcode':filter_crit}).toArray((err2, res2)=>{
        if (err2){
          console.log('There was an error finding bands with '+filter+' = '+filter_crit);
          cb(err2, null);
        }
        else{
          console.log('Got bands out of db with filter: ' +filter+' = ' +filter_crit);
          cb(null, res2.length);
        }
      });
      break;
      //query by the max distance
      case "maxDist":
      db.db('bands').collection('bands').find({'maxDist':{$gt:filter_crit}}).toArray((err2, res2)=>{
        if (err2){
          console.log('There was an error finding bands with '+filter+' = '+filter_crit);
          cb(err2, null);
        }
        else{
          console.log('Got bands out of db with filter: ' +filter+' = ' +filter_crit);
          cb(null, res2.length);
        }
      });
      break;
      //query by the description
      case "description":
      db.db('bands').collection('bands').find().toArray((err2, res2)=>{
        if (err2){
          console.log('There was an error finding bands with confirmed true: ' + err2);
          cb(err2, null);
        }
        else{
          var allMatchers = [];
          for (var band in res2){
            var aBand = res2[band];
            if (aBand.description.includes(filter_crit)){
              allMatchers.append(aBand);
            }
          }
          cb(null, allMatchers.length);
        }
      });
      break;
      default:
      console.log('Unrecongized filter');
      cb("Unrecongized filter", null);
      break;
    }
  }

  //function to fget the transaction stats
  function findTransCount(db, filter, filter_crit, cb){
    if (filter=="none"){
      //return the count for the gigs
      db.db('gigs').collection('gigs').find({'confirmed':{$eq:true}}).toArray(function(err2, res2){
        if(err2){
          console.log('There was an error finding filled gigs');
          cb(err2,null);
        }
        else{
          console.log('Number of confirmed gigs is: ' + res2.length);
          cb(null, res2.legnth)
        }
      });
    }
    else{
      switch(filter){
        //query the gigs by price
        case "price":
        db.db('gigs').collection('gigs').find({'confirmed':{$eq:true}, 'price':{$gt:filter_crit}}).toArray((err2, res2)=>{
          if (err2){
            console.log('There was an error trying to find gigs with confirmed true and price >' + filter_crit);
            cb(err2, null)
          }
          else{
            cb(null, res2.length);
          }
        });
        break;

        //query the gigs by zipcode
        case "zipcode":
        db.db('gigs').collection('gigs').find({'confirmed':{$eq:true}, 'zipcode':filter_crit}).toArray((err2, res2)=>{
          if (err2){
            console.log('There was an error trying to find gigs with confirmed true and price >' + filter_crit);
            cb(err2, null)
          }
          else{
            cb(null, res2.length);
          }
        });
        break;

        //query the gigs by description
        case "description":
        db.db('gigs').collection('gigs').find({'confirmed':{$eq:true}}).toArray((err2, res2)=>{
          if (err2){
            console.log('There was an error finding bands with confirmed true: ' + err2);
            cb(err2, null);
          }
          else{
            var allMatchers = [];
            for (var gig in res2){
              var aGig = res2[gig];
              if (aGig.description.includes(filter_crit)){
                allMatchers.append(aGig);
              }
            }
            cb(null, allMatchers.length);
          }
        });
        break;
        //return error if not filter is specified
        default:
        console.log('User submitted a filter we dont recognize');
        cb("We do not recognize that fitler", null);
        break;
      }
    }
  }

  //functino to return the count of all users
  function findUserCount(db, filter, filter_crit, cb){
    if (filter=="none"){
      db.db('users').collection('users').count().then(count=>{
        console.log('Number of users is: ' + count);
        cb(null, count);
      });
    }
    else{
      cb("Filter: " + filter+" not currenlty supported.", null);
    }

  }

  //report the average statistics
  router.get('/average', (req, res)=>{
    if (!req.query){
      res.status(401).end();
    }
    var {username, password, data_type, data_to_avg, filter, filter_crit} = req.query
    if (!allowed_users.hasOwnProperty(username)){
      res.status(404).end();
    }
    else{
      //if the user is not allowed
      if (allowed_users[username] != password){
        res.status(404).end();
      }
      else{
        //query the database
        database.connect(db=>{
          switch(data_type){
            //filter for users
            case "users":
              getAvgUsers(db, data_to_avg, filter, filter_crit, (avg_error, avg)=>{
                if(avg_error){
                  res.status(500).end()
                  db.close();
                }
                else{
                  res.status(200).send({body:avg})
                  db.close();
                }
              });
            break;
            //filter for gigs
            case "gigs":
            getAvgGigs(db, data_to_avg, filter, filter_crit, (avg_error, avg)=>{
              if(avg_error){
                res.status(500).end()
                db.close();
              }
              else{
                res.status(200).send({body:avg})
                db.close();
              }
            });
            break;
            //filter for bands
            case "bands":
            getAvgBands(db, data_to_avg, filter, filter_crit, (avg_error, avg)=>{
              if(avg_error){
                res.status(500).end()
                db.close();
              }
              else{
                res.status(200).send({body:avg})
                db.close();
              }
            });
            break;
            //filter for transactions
            case "transactions":
            getAvgTransactions(db, data_to_avg, filter, filter_crit, (avg_error, avg)=>{
              if(avg_error){
                res.status(500).end()
                db.close();
              }
              else{
                res.status(200).send({body:avg})
                db.close();
              }
            });
            break;
            //if not recognized
            default:
            console.log('Unrecongized data type: ' + data_type)
            res.status(401).end();
            db.close();
            break;
          }
        }, err=>{
          console.log('There was an error connectiong to mongo: ' + err);
          res.status(500).end();
        });

      }
    }
  });

  //helper function for average with user filter
  function getAvgUsers(db, data_to_avg, filter, filter_crit, cb){
    switch(data_to_avg){
      //data for bands of a user
      case "bands":
        if(filter=="none"){
          db.db('users').collection('users').count(count=>{
            db.db('bands').collection('bands').count(band_count=>{
              var avg_bands_per_user = band_count/count;
              cb(null, avg_bands_per_user)
            });
          });
        }
        else{
          cb("Sorry we do not support filters for users yet.", null)
        }
      break;
      //data for the gigs of a user
      case "gigs":
      if(filter=="none"){
        db.db('users').collection('users').count(count=>{
          db.db('gigs').collection('gigs').count(band_count=>{
            var avg_bands_per_user = band_count/count;
            cb(null, avg_bands_per_user)
          });
        });
      }
      else{
        cb("Sorry we do not support filters for users yet.", null)
      }
      break;
      //data for the completed gigs of a user
      case "completed_gigs":
      if(filter=="none"){
        db.db('users').collection('users').count(count=>{
          db.db('gigs').collection('gigs').find({'confirmed':{$eq:true}}).toArray((err2, res2)=>{
            var avg_bands_per_user = res2.length/count;
            cb(null, avg_bands_per_user)
          });
        });
      }
      else{
        cb("Sorry we do not support filters for users yet.", null)
      }
      break;
      //data for the revenuse of users
      case "revenue":
      if(filter=="none"){
        db.db('users').collection('users').count(count=>{
          db.db('gigs').collection('gigs').find({'confirmed':{$eq:true}}).toArray((err2, res2)=>{
            var total_price=0
            for (var g in res2){
              total_price+=res2[g].price
            }
            var banda_rev = total_price*.05
            var avg_rev_user = banda_rev/count;
            cb(null, avg_rev_user)
          });
        });
      }
      else{
        cb("Sorry we do not support filters for users yet.", null)
      }
      break;

      default:
      cb("Sorry we do not support that type of average yet", null);
      break;
    }
  }

  //get the average tranaction
  function getAvgTransactions(db, data_to_avg, filter, filter_crit, cb){
    //finf all transactions
    findTransCount(db, filter, filter_crit, (count_error, count)=>{
      if (count_error){
        cb(count_error, null)
      }
      else{
        switch(data_to_avg){
          //get the prices for the gigs
          case "price":
          switch(filter){
            case "price":
            db.db('gigs').collection('gigs').find({'confirmed':{$eq:true}, 'price':{$gt:filter_crit}}).toArray((err4, res4)=>{
              if (err4){
                console.log('There was an error finding confirmed gigs: ' + err4);
                cb(err4, null)
              }
              else{
                var total_price = 0;
                for (var gig in res4){
                  total_price+=parseInt(res4[gig].price)
                }
                var avg_price = total_price/count;
                cb(null, avg_price);
              }
            });
            break;
            //get the zipcodes for the gigs
            case "zipcode":
            db.db('gigs').collection('gigs').find({'confirmed':{$eq:true}, 'zipcode':filter_crit}).toArray((err4, res4)=>{
              if (err4){
                console.log('There was an error finding confirmed gigs: ' + err4);
                cb(err4, null)
              }
              else{
                var total_price = 0;
                for (var gig in res4){
                  total_price+=parseInt(res4[gig].price)
                }
                var avg_price = total_price/count;
                cb(null, avg_price);
              }
            });
            break;
            //get the description for the gigs
            case "description":
            db.db('gigs').collection('gigs').find({'confirmed':{$eq:true}}).toArray((err4, res4)=>{
              if (err4){
                console.log('There was an error finding confirmed gigs: ' + err4);
                cb(err4, null)
              }
              else{
                var total_price = 0;
                for (var gig in res4){
                  if (res4[gig].description.includes(filter_crit)){
                    total_price+=parseInt(res4[gig].price)
                  }
                }
                var avg_price = total_price/count;
                cb(null, avg_price);
              }
            });
            break;
            //if not filer is applied, average the count of the gigs
            case "none":
            db.db('gigs').collection('gigs').find({'confirmed':{$eq:true}}).toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  total_count+=parseInt(res6[b].price)
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;
            default:
            cb("We did not recognize that filter", null)
            break;

          }
          break;
          default:
          cb("We did not recognize that avg", null);
          break;
        }
      }
    });
  }
  //helper funciton for the average gigs
  function getAvgGigs(db, data_to_avg, filter, filter_crit, cb){
    findGigCount(db, filter, filter_crit, (count_error, count)=>{
      if(count_error){
        cb(count_error, null);
      }
      else{
        switch(data_to_avg){
          //average by price
          case "price":
          switch(filter){
            case "price":
            db.db('gigs').collection('gigs').find({'price':{$gt:filter_crit}}).toArray((err5, res5)=>{
              if (err5){
                console.log('There was an error finding gigs with price filter: ' + err5);
              }
              else{
                var totalPrice = 0
                for (var gig in res5){
                  totalPrice+=parseInt(res5[gig].price)
                }
                 var avg_price = totalPrice/count;
                 cb(null, avg_price)
              }
            });
            break;
            //average by zipcode
            case "zipcode":
            db.db('gigs').collection('gigs').find({'zipcode':filter_crit}).toArray((err5, res5)=>{
              if (err5){
                console.log('There was an error finding gigs with price filter: ' + err5);
              }
              else{
                var totalPrice = 0
                for (var gig in res5){
                  totalPrice+=parseInt(res5[gig].price)
                }
                 var avg_price = totalPrice/count;
                 cb(null, avg_price)
              }
            });
            break;
            //average by descirption
            case "description":
            db.db('gigs').collection('gigs').find().toArray((err5, res5)=>{
              if (err5){
                console.log('There was an error finding gigs with price filter: ' + err5);
              }
              else{
                var totalPrice = 0
                for (var gig in res5){
                  if (res5[gig].description.inlcudes(filter_crit)){
                    totalPrice+=parseInt(res5[gig].price)
                  }
                }
                 var avg_price = totalPrice/count;
                 cb(null, avg_price)
              }
            });
            break;
            //if no filter, average gig counts
            case "none":
            db.db('gigs').collection('gigs').find().toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  total_count+=parseInt(res6[b].price)
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;
            default:
            cb('Sorry, we do not support that filter currently', null)
            break;

          }
          break;
          //filter for applicants
          case "applicants":
          switch(filter){
            //average by price of applicants
            case "price":
            db.db('gigs').collection('gigs').find({'price':{$gt:filter_crit}}).toArray((err5, res5)=>{
              if (err5){
                console.log('There was an error finding gigs with price filter: ' + err5);
              }
              else{
                var totalPrice = 0
                for (var gig in res5){
                  totalPrice+=res5[gig].applications.length
                }
                 var avg_price = totalPrice/count;
                 cb(null, avg_price)
              }
            });
            break;
            //average the zipcodes of gigs
            case "zipcode":
            db.db('gigs').collection('gigs').find({'zipcode':filter_crit}).toArray((err5, res5)=>{
              if (err5){
                console.log('There was an error finding gigs with price filter: ' + err5);
              }
              else{
                var totalPrice = 0
                for (var gig in res5){
                  totalPrice+=res5[gig].applications.length
                }
                 var avg_price = totalPrice/count;
                 cb(null, avg_price)
              }
            });
            break;
            //average the description of gigs
            case "description":
            db.db('gigs').collection('gigs').find().toArray((err5, res5)=>{
              if (err5){
                console.log('There was an error finding gigs with price filter: ' + err5);
              }
              else{
                var totalPrice = 0
                for (var gig in res5){
                  if (res5[gig].description.inlcudes(filter_crit)){
                    totalPrice+=res5[gig].applications.length
                  }
                }
                 var avg_price = totalPrice/count;
                 cb(null, avg_price)
              }
            });
            break;
            //if no filter, average the count of gigs
            case "none":
            db.db('gigs').collection('gigs').find().toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  total_count+=res6[b].applications.length
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;
            default:
            cb('Sorry, we do not support that filter currently', null)
            break;
          }
          break;
          default:
          cb('Sorry we do not support that avg.', null)
          break;
        }
      }
    })

  }

  //helper function to averrage the band statistics
  function getAvgBands(db, data_to_avg, filter, filter_crit, cb){
    //find the count for the band
    findBandCount(db, filter, filter_crit, (count_error, count)=>{
      if (count_error){
        cb(count_error, null)
      }
      else{
        //switch case for the average
        switch(data_to_avg){
          //averate the applied gigs
          case "appliedGigs":
          switch(filter){
            //find the max distance
            case "maxDist":
            db.db('bands').collection('bands').find({'maxDist':{$gt:filter_crit}}).toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  total_count+=res6[b].appliedGigs.length
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;
            //average based on zipcode
            case "zipcode":
            db.db('bands').collection('bands').find({'zipcode':filter_crit}).toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  total_count+=res6[b].appliedGigs.length
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;

            //average based on description
            case "description":
            db.db('bands').collection('bands').find().toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  if (res6[b].description.inlcudes(filter_crit)){
                    total_count+=res6[b].appliedGigs.length
                  }
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;

            //average based on price
            case "price":
            db.db('bands').collection('bands').find({'price':{$gt:filter_crit}}).toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  total_count+=res6[b].appliedGigs.length
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;

            //else no filterm average the count of bands
            case "none":
            db.db('bands').collection('bands').find().toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  total_count+=res6[b].appliedGigs.length
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;
            default:
            cb('Sorry we dont support that filter', null)
            break;

          }
          break;
          //case for the finished gigs
          case "finishedGigs":
          switch(filter){
            case "maxDist":
            //get the max distance of the bands
            db.db('bands').collection('bands').find({'maxDist':{$gt:filter_crit}}).toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  total_count+=res6[b].finishedGigs.length
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;
            //average by the zipcode for the bands
            case "zipcode":
            db.db('bands').collection('bands').find({'zipcode':filter_crit}).toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  total_count+=res6[b].finishedGigs.length
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;
            //average by description
            case "description":
            db.db('bands').collection('bands').find().toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  if (res6[b].description.inlcudes(filter_crit)){
                    total_count+=res6[b].finishedGigs.length
                  }
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;
            //average the price of finished gigs
            case "price":
            db.db('bands').collection('bands').find({'price':{$gt:filter_crit}}).toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  total_count+=res6[b].finishedGigs.length
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;
            //otherwise average the count of finished gigs
            case "none":
            db.db('bands').collection('bands').find().toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  total_count+=res6[b].finishedGigs.length
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;
            default:
            cb('Sorry we dont support that filter', null)
            break;

          }
          break;

          //upcoming gigs case
          case "upcomingGigs":
          switch(filter){
            //average the maxi distance of upcoming gigs
            case "maxDist":
            db.db('bands').collection('bands').find({'maxDist':{$gt:filter_crit}}).toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  total_count+=res6[b].upcomigGigs.length
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;
            //average the zip code of the upcoming gigs
            case "zipcode":
            db.db('bands').collection('bands').find({'zipcode':filter_crit}).toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  total_count+=res6[b].upcomigGigs.length
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;

            //filter for descirption of upcoming gigs
            case "description":
            db.db('bands').collection('bands').find().toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  if (res6[b].description.inlcudes(filter_crit)){
                    total_count+=res6[b].upcomigGigs.length
                  }
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;
            //filter for price of upcoming gigs
            case "price":
            db.db('bands').collection('bands').find({'price':{$gt:filter_crit}}).toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  total_count+=res6[b].upcomigGigs.length
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;
            //no filter for upcoming gigs
            case "none":
            db.db('bands').collection('bands').find().toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  total_count+=res6[b].upcomigGigs.length
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;
            default:
            cb('Sorry we dont support that filter', null)
            break;

          }
          break;
          //max distance filter for upcoming gigs
          case "maxDist":
          switch(filter){
            case "maxDist":
            db.db('bands').collection('bands').find({'maxDist':{$gt:filter_crit}}).toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  total_count+=parseInt(res6[b].maxDist)
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;
            //filer for zipcode for upcoming gigs
            case "zipcode":
            db.db('bands').collection('bands').find({'zipcode':filter_crit}).toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  total_count+=parseInt(res6[b].maxDist)
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;
            //filter for desciption for upcoming gigs
            case "description":
            db.db('bands').collection('bands').find().toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  if (res6[b].description.inlcudes(filter_crit)){
                    total_count+=parseInt(res6[b].maxDist)
                  }
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;

            //filter for price for upcoming gigs
            case "price":
            db.db('bands').collection('bands').find({'price':{$gt:filter_crit}}).toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  total_count+=parseInt(res6[b].maxDist)
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;
            //no filter for upcoming gigs
            case "none":
            db.db('bands').collection('bands').find().toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  total_count+=parseInt(res6[b].maxDist)
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;
            default:
            cb('Sorry we dont support that filter', null)
            break;

          }
          break;
          //filter for price
          case "price":
          switch(filter){
            //max distance for price filter
            case "maxDist":
            db.db('bands').collection('bands').find({'maxDist':{$gt:filter_crit}}).toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  total_count+=parseInt(res6[b].price)
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;
            //zipcode and price filter
            case "zipcode":
            db.db('bands').collection('bands').find({'zipcode':filter_crit}).toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  total_count+=parseInt(res6[b].price)
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;
            //description filter for price
            case "description":
            db.db('bands').collection('bands').find().toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  if (res6[b].description.inlcudes(filter_crit)){
                    total_count+=parseInt(res6[b].price)
                  }
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;
            //price filter for price
            case "price":
            db.db('bands').collection('bands').find({'price':{$gt:filter_crit}}).toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  total_count+=parseInt(res6[b].price)
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;
            //no filter for price case
            case "none":
            db.db('bands').collection('bands').find().toArray((err6, res6)=>{
              if(err6){
                cb(err6, null);
              }
              else{
                var total_count = 0
                for (var b in res6){
                  total_count+=parseInt(res6[b].price)
                }
                var avg = total_count/count
                cb(null, avg);
              }
            });
            break;
            default:
            cb('Sorry we dont support that filter', null)
            break;

          }
          break;
          default:
          cb('Sorry we do not suppor that type of avg.', null)
          break;
        }
      }
    });
  }
} // end of exports
