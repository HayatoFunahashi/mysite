/*WEB企画アイコンの取得*/
var icon = new google.maps.MarkerImage('icon_webkikaku.png',/*アイコンの場所*/
new google.maps.Size(53,64),/*アイコンのサイズ*/
new google.maps.Point(0,0)/*アイコンの位置*/
);
/*マーカーの設置*/
var markerOptions = {
position: latlng,/*表示場所と同じ位置に設置*/
map: map,
icon: icon,
title: '株式会社WEB企画'/*マーカーのtitle*/
};
var marker = new google.maps.Marker(markerOptions);

function setStyleMap(google.maps.Map {
   var styledMapOptions = { name: '株式会社WEB企画' }
   var sampleType = new google.maps.StyledMapType(styleOptions, styledMapOptions);
   map.mapTypes.set('sample', sampleType);
   map.setMapTypeId('sample');
}
