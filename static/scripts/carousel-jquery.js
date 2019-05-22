$(document).ready(function(){
  // Create wrapper divs & the <ul>
  var $wrapper = $("<div class='wrapper'></div>"),
  $carouselWrapper = $("<div class='jcarousel-wrapper'></div>"),
  $carousel = $("<div class='jcarousel'></div>"),
  $list = $("<ul></ul>");

  $wrapper.append($carouselWrapper);
  $carouselWrapper.append($carousel);
  $carousel.append($list);

  // fill the <ul>
  var i = 6;  // number of things to add
  while(i > 0){
    var $newItem = $("<li class='carousel-li'></li>");
    var $newImg = $("<img class='carousel-img' src='../static/assets/Home/Art/3.jpeg' alt='Image 3'>");
    $newItem.append($newImg);
    $carousel.append($newItem);
    i--;
  }

  var $prev = $("<a href='#' class='jcarousel-control-prev'>&lsaquo;</a>")
  var $next = $("<a href='#' class='jcarousel-control-next'>&rsaquo;</a>")
  $carousel.after($prev, $next);

  $("#contacts-sidebar").after($wrapper);
});
