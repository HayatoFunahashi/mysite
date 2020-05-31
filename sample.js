var map;
var tokyo;
var osaka;

function initMap() {
  tokyo = new google.maps.LatLng(35.689614,139.691585);
  osaka = new google.maps.LatLng(34.686272,135.519649);

  var opts = {
    zoom: 15,
    center: tokyo
  };

  map = new google.maps.Map(document.getElementById("map"), opts);
}

function setTokyo() {
  map.setCenter(tokyo);
}

function setOsaka() {
  map.setCenter(osaka);
}
