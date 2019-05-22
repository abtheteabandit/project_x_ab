var genreBank=["blues","classic rock","country","dance","disco","funk","grunge",
 "hip-hop","hiphop","hip hop","rap","jazz","metal","new age","oldies","other","pop","r&b","r and b","randb",
 "rap","reggae","rock","techno","industrial","alternative","ska",
 "death metal","death-metal","pranks","soundtrack","euro-techno","ambient",
 "trip-hop","triphop","trip hop","vocal","jazz+funk","jazzfunk","funk","fusion","trance","classical",
 "instrumental","acid","house","game","gospel",
 "noise","alternrock","alternative rock","alternative","bass","soul","punk","space","meditative",
 "instrumental pop","instrumental rock","ethnic","gothic",
 "darkwave","techno-industrial","electronic","pop-folk","pop folk",
 "eurodance","dream","southern rock","comedy","cult","gangsta",
 "top 40","christian rap","pop/funk","jungle","native american",
 "cabaret","new wave","psychadelic","rave","showtunes","trailer",
 "lo-fi","tribal","acid punk","acid jazz","polka","retro",
 "musical","rock & roll","rock and roll"."hard rock","folk","folk-rock","folk rock",
 "national folk","swing","fast fusion","bebop","latin","revival",
 "celtic","bluegrass","avantgarde","gothic rock","progressive rock",
 "psychedelic rock","symphonic rock","slow rock","big band",
 "chorus","easy listening","acoustic","humour","speech","chanson",
 "opera","chamber music","sonata","symphony","booty bass","primus",
 "porn groove","satire","slow jam","club","tango","samba",
 "folklore","ballad","power ballad","Rrythmic soul","freestyle",
 "duet","punk rock","drum solo","acapella","euro-house","dance hall","edm","grime","dubstep","drum and bass","drum&bass","cover","covers"];

var instBank=["accordion","bagpipes","banjo","bass guitar","bass","bassoon","berimbau","dj","d.j.","singer","rapper","mc","bongo","freestyler","cello",
 "clarinet","cornet","cymbal","didgeridoo","double bass","upright","drum kit","drums","percussion","flute","french horn","glass harmonica","gong",
 "guitar","acoustic","electronic","harmonica","harp","harpsichord","hammered dulcimer","synth","tambourine","hurdy gurdy","jew’s harp",
 "lute","lyre","mandolin","marimba","melodica","oboe","ocarina","octobass","organ","sound system","pan pipes","piano","piccolo","recorder","saxophone",
 "sitar","synthesizer","timpani","triangle","trombone","trumpet","theremin","tuba","poet","vocals","viola","violin","whamola","xylophone","zither"];

var gigTypeBank=["birthday","party","fraternity","frat","bar","concert","corporate","kids","adult","adults","highschool","college","retirement","sorority",
 "gay","pride","festival","radio","hall","dance","bachelor","bachelorette","show","talent","chill","kickback","hangout","mobile","car","house","home","parade",
 "street","theater","exhibition","show","event","wedding","funeral","burial","eccentric","church","synagouge","mosque","temple","circle","meditation","studio session",
 "performance","rally","march","protest","ceremony","holiday","christmas","new years","halloween","valentines","bash","mosh","orgy","date","night out","night in",
 "night-in","service","store","opening","closing","buisness","booth","meeting","introduction","orientation","graduation"];

var vibeBank=["anthem","aria","ariose","arioso","assonance","atmospheric","background","banging","banger","bangers","baroque","beat","bell-like","bombastic",
 "booming","boomy","bop","breath","breathy","bright","bass","cadence",
 "call","canorous","canticle","cappella","carol","catchy","chamber","chant","cheerful","chime",
 "choral","chorale","classical","clear","consonant","contemporary","danceable","deep","descant","ditty",
 "dramatic","dulcet","dynamic","eclectic","electronic","energetic","entertaining","euphonic","euphonious","evensong",
 "evergreen","experimental","explosive","facile","fast","funky","happy","harmonic","harmonious","headbanging","headbanger","head banging","healing",
 "heroic","high-flown","high-sounding","high","hit","homophonic","honeyed","hook","hymn",
 "flawless","fluid","forte","fresh","fugue","full","full-toned","fuses", "golden","grand","groovy","covers","covers","jazzy","lay",
 "hyped","hype","hypnotic","hi-fi","improvised","in tune","inflection","instrumental","intonation","intricate","intro","jam","jaunty",
 "lied","light","lilt","lilting","liquid","live","lively","lofty","lyric","lyrical",
 "magniloquent","major","masterful","mellifluous","mellow","melodic","melodious","melody","minor","modern","monophonic","musical","musicality",
 "muzak","ode","opera","orchestral","orotund","paean","passionate","percussive",
 "pianissimo","piece","piping","plainsong","playful","pleasant","poetic","polyphonic","pompous",
 "popular","progressive","psalm","recitative","refined","refrain","resonance","resonant","resounding",
 "reverberant","rhythmic","rhythmical","rich","ringing","riveting","rockin’","rockin","rollicking","romantic","round","shout",
 "silver-toned","silvery","sing","soft","song","songful","sonic",
 "session","shrill","singable","singing","soprano","soulful","staccato","stentorian","stentorious","strain","strong","sweet-sounding",
 "sweet-toned","swing","symphonic",
 "sonorous","soothing","sophisticated","symphonious","symphony","tubular","tumid","tuned","tuneful","unison","up-tempo","unified","uplifting","","",
 "sweet","throbbing","tight","timeless","tonal","atonal","treble","warble","wobble","wavey","warm","wet","dry","wild","woodnote","western",
 "upbeat","vibrant","vocal","high-volume","low-volume","loud","soft","hard","hardcore","west-coast","east-coast","chopper","vibes",
 "angry","melancholy","blue","new","old","young","difuse","nasty","raunchy","ridiculous","real","dumb"
 ,"evil","godly","zealous","functional","stupid","purple","green","gnarly","fun","forceful","fucking","fuck","fucked up","crazy","sloppy","disgusting"];
//this is so i can commit;
var genreMult=1;
var ratingMult=1;
var instMult=1;
var distMult=1;
var typeMult=1;
var priceMult=1;
var vibeMult=1;
var timeMult=1;
var timeEqualizer=1000;
var priceEQ=10;


//call this for a band searching for a gig, myBand is a json band and
// gigs is an array of gig jsons and
//query String is the string they typed in search bar (i handled parsing)
function findGigsForBand(myBand, queryStr, db){
//  var sortedGigs=[];
  return db.db('gigs').collection('gigs').find({}).toArray(function(err,result){
    if (err){
      console.log("There was error getting gigs from db:" + err);
      return [];
    }
    else{
      var gigs=result;
      var genresFromStr=[];
      var instsFromStr=[];
      var gigTypesFromStr=[];
      var vibesFromStr=[];
      var gigsToScore=[];
      var bandsToScore=[];
      var categories={"genres":[genreBank,genresFromStr,genreMult], "insts":[instsBank,instsFromStr,instMult],"vibes":[vibesBank,vibesFromStr,vibeMult],"gigTypes":gigTypeBank,gigTypesFromStr,typeMult]};

      var categories = parseQueryString(queryStr, categories);
      var queryStrScore = 0;


      for (theGig in gigs){
        for (key in categories){
          if categories.hasOwnProperty(key){
            if (theGig.hasOwnProperty(key)){
              var contents = categories[key];
              var fromStr=contents[1];
              var mult=contents[2];
              for (word in fromStr){
                if (theGig[key].includes(word)){
                  queryStrScore+=(1*mult);
                }
              }
            }
          }
        }

          var priceDiff=Math.abs((theGig.price-myBand.price));
          var priceScore= (-(priceDiff/priceEQ)*priceMult);
          var diffX=Math.pow((theGig.lat-myBand.lat),2);
          var diffY=Math.pow((theGig.lng-myBand.lng),2);
          var distance = Math.pow((diffX+diffY),0.5);
          var distScore = -(distance*distMult);
          var dateDiffs=[];
          for (date in myBand.openDates){
            var timeDiff=diff_minutes(myBand.openDates[0],myGig.startDate);
            dateDiffs.push(timeDiff);
          }
          var minDiff = dateDiffs[0];
          for (diff in dateDiffs){
            if (diff < minDiff) {
              minDiff = diff;
            }
          }

          var timeDiff = minDiff / timeEqualizer;
          var timeScore= -timeDiff*timeMult;
          var score = timeScore+distScore+priceScore+queryStrScore;

          gigsToScore.push([theGig,score]);
        }
        var sortedGigs=sortDict(gigsToScore);
        db.close();
        return sortedGigs;
    }
  });
}

function findBandsForGig(myGig, categories, db){
  return db.db('bands').collection('bands').find({}).toArray(function(err,result){
    if (err){
      console.log("There was error getting gigs from db:" + err);
      return [];
    }
    else{
      var bands = result;
      var categories = parseQueryString(queryStr,categories);
      for (theBand in bands){
        for (key in categories){
          if categories.hasOwnProperty(key){
            if theGig.hasOwnProperty(key){
              var contents = categories[key];
              var fromStr=contents[1];
              var mult=contents[2];
              for (word in fromStr){
                if (theBand[key].includes(word)){
                  queryStrScore+=(1*mult);
                }
              }
            }
          }
        }
        var priceDiff = Math.abs( (myGig.price-  theBand.price) );
        var priceScore = (-(priceDiff/priceEQ) * priceMult);
        var dateDiffs = [];
        for (date in theBand.openDates){
          var timeDiff=diff_minutes(myBand.openDates[0],myGig.startDate);
          dateDiffs.push(timeDiff);
        }
        var minDiff = dateDiffs[0];
        for (diff in dateDiffs){
          if (diff < minDiff){
            minDiff=diff;
          }
        }
        var timeDiff = (minDiff) / timeEqualizer;
        var timeScore = -timeDiff * timeMult;
        var ratingScore = theBand.rating*ratingMult;
        var score = timeScore+priceScore+queryStrScore+ratingScore;
        bandsToScore.push([theBand,score]);
      }
      var sortedBands=sortDict(bandsToScore);
      return sortedBands;
    }
  });
}

function parseQueryString(queryStr, categories){
  var lowerCased = queryStr.toLowerCased();
  //iterates through the categories and pushes tmatchign
  //words from the query string in the appropaite collection of words
  for (var key in categories){
      if (categories.hasOwnProperty(key)){
          var contents = categories[key];
          for (word in contents[0]){
            if (queryStr.includes(word)){
              contents[1].push(word);
            }
          }
          categories[key]=contents;
      }
  }
  return categories;
}

function diff_minutes(dt2, dt1) {
  var diff =(dt2.getTime() - dt1.getTime()) / 1000;
  diff /= 60;
  return Math.abs(Math.round(diff));
 }

function sortDict(dict){
   dict.sort(function(first, second) {
     return second[1]-first[1];
   });
   return dict;
 }
