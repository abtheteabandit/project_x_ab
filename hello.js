var http = require("http");

http.createServer(function (request, response) {
   // Send the HTTP header 
   // HTTP Status: 200 : OK
   // Content Type: text/plain
   response.writeHead(200, {'Content-Type': 'text/plain'});
   
   // Send the response body as "Hello World"
   response.end("Due to an overwhelming response from users, we are having to make a few finishing touches to the website. Please check back later today!");
}).listen(3000);

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');