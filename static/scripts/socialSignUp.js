console.log('GOT IT')
var urlJSON = parseURL(document.location);
var promoID = urlJSON.searchObject.promoID;
console.log('promoID: ' + promoID);
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

function register(){
  console.log('Clicked reg');
  var email = document.getElementById('reg_email').value;
  var confirm = document.getElementById('reg_confirm').value;
  var password = document.getElementById('reg_password').value;
  var username = document.getElementById('reg_username').value;
  if (password != confirm){
    alert('Sorry, your confirm password and password did not match. Please try again.');
    return;
  }
  if (email=="" || email==" " || (!email.includes('@')) || password=="" || password==" " || username=="" || username==" " || confirm=="" || confirm==" "){
    alert('Sorry, you must fill out the enitre form with non-blank fields to get your coupon.');
    return
  }
  else{
    $.post('/couponRegister', {'email':email, 'password':password, 'confirm_password':confirm, 'username':username, 'promoID':promoID}, res=>{
      alert(res);
    });
  }
}
function loginCoupon(){
  var password = document.getElementById('loginPassword').value;
  var username = document.getElementById('loginUsername').value;
  if (password=="" || password==" " || username=="" || username==" "){
    alert('Sorry, you must fill out the enitre form with non-blank fields to get your coupon.');
    return
  }
  else{
    $.post('/couponLogin', {'password':password, 'username':username, 'promoID':promoID}, res2=>{
      alert(res2);
    });
  }
}

function regToLogin(){
  document.getElementById('modal-wrapper-register').style.display='none';
  document.getElementById('modal-wrapper-login').style.display='block';
}
function loginToReg(){
  document.getElementById('modal-wrapper-login').style.display='none';
  document.getElementById('modal-wrapper-register').style.display='block';
}
