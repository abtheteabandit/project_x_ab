

function parseURL(url){
  var parser = document.createElement('a'),
       searchObject = {},
       queries, split, i;
   // Let the browser do the work
   parser.href = url;
   // Convert query string to object
   queries = parser.search.replace(/^\?/, '').split('&');
   for( i = 0; i < queries.length; i++ ) {
       split = queries[i].split('=');
       searchObject[split[0]] = split[1];
   }
   return {
       protocol: parser.protocol,
       host: parser.host,
       hostname: parser.hostname,
       port: parser.port,
       pathname: parser.pathname,
       search: parser.search,
       searchObject: searchObject,
       hash: parser.hash
   };
}

function submit_promotion(){

}
function submit_coupon(){

}
function checkUserSocials(){
  $.get('/user_has_socials', {'name':'anything'}, res=>{
    console.log(res);
    if(res.success){

      console.log('SOCIALS FRO USER IS (true means we already have their info for that social): ' + JSON.stringify(res.data));
    }
    else{
      console.log('There was an error using this route');
      return;
    }
  });
}
