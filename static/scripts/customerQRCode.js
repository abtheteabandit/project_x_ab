console.log('GOT IT')
var urlJSON = parseURL(document.location);
var promoID = urlJSON.searchObject.promoID;
var gigID = urlJSON.searchObject.gigID;
console.log('promoID: ' + promoID);

$.get('/aGig', {'gigID':gigID}, res=>{
  if (!res){
    alert('Sorry, could not find the event for this coupon. Please email banda.customers.help@gmail.com for support from our 24/7 team.')
    return;
  }
  else{
    document.getElementById('gig-title-label').innerHTML='Coupon For '+res.name;
    document.getElementById('modal-wrapper-apply-coupon').style.display='block';
  }

});

function apply(){
  var username = document.getElementById('apply-coupon-username').value;
  var password = document.getElementById('apply-coupon-password').value;
  if (username == null || username == "" || username == " "){
    alert('Sorry, you must proivde a non-blank username to apply this coupon.');
    return;
  }
  if (password == null || password == "" || password == " "){
    alert('Sorry, you must proivde a non-blank password to apply this coupon.');
    return;
  }
  else{
    $.post('applyCoupon', {'promoID':promoID, 'username':username, 'password':password}, res=>{
      if (res==""){
        alert('Sorry, there was an error on our end. Please try again. If this problem perists please email banda.customers.help@gmail.com. Sorry for this inconvience!');
        return;
      }
      else{
        if (res.success){
          if (res.data=='valid'){
            document.getElementById('modal-wrapper-apply-coupon').style.display='none';
            document.getElementById('modal-wrapper-accepted-coupon').style.display='block';
          }
          else{
            document.getElementById('modal-wrapper-apply-coupon').style.display='none';
            document.getElementById('modal-wrapper-declined-coupon').style.display='block';
            alert(res.data);
          }
        }
        else{
          alert(res.data);
          return;
        }
      }
    });
  }
}


//window parser
function parseURL(url){
  console.log('URL: ' + url)
  var parser = document.createElement('a'),
       searchObject = {},
       queries, split, i;
   // Let the browser do the work
   parser.href = url;
   // Convert query string to object
   queries = parser.search.replace(/^\?/, '').split('&');
   // Collect search entry and add to search input
   var textForSearchInput = queries[0];
   textForSearchInput = decodeURI(textForSearchInput);
   textForSearchInput = textForSearchInput.replace("query=","");
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
