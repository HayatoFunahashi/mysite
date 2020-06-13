/*
 お店情報取得
*/
function searchGoodPlaces(){

  init();
  var addressInput = document.getElementById("addressInput").value;
  if (addressInput == "") {
    //NULL時は現在地のGPSから
    return getCurrentGPS();
  }else{
    //場所指定時はGoogleでその場所のGPS取得する
    return getInputDataGPS();
  }
}

/*現在値検索有効化*/
function connecttext( textid, ischecked ) {
   if( ischecked == true ) {
      // チェックが入っていたら無効化
      document.getElementById(textid).value = "";
      document.getElementById(textid).disabled = true;
   }
   else {
      // チェックが入っていなかったら有効化
      document.getElementById(textid).disabled = false;
   }
}

/*
 位置情報を使って周辺検索
  latLng : 位置座標インスタンス（google.maps.LatLng）
*/
function startNearbySearch(latLng){
  //alert(latLng);
  //読み込み中表示
  document.getElementById("result").innerHTML = "Now Loading...";
  //mapインスタンス作成
  var map = setMap(latLng);
  // マーカーの新規出力
  new google.maps.Marker( {
      map: map ,
      position: latLng ,
  } ) ;
  //PlacesServiceインスタンス生成
  var service = new google.maps.places.PlacesService(map);
  //入力したKeywordを取得
  var keywordInput = document.getElementById("keywordInput").value;
  //入力した検索範囲を取得
  var obj = document.getElementById("radiusInput");
  var radiusInput = Number(obj.options[obj.selectedIndex].value);

  //周辺検索
  service.nearbySearch(
    {
      location: latLng,
      radius: radiusInput,
      type: ['restaurant'],
      keyword: keywordInput,
      language: 'ja'
    },
    displayResults
  );

  //検索範囲の円を描く
  var circle = new google.maps.Circle(
    {
      map: map,
      center: latLng,
      radius: radiusInput,
      fillColor: '#ff0000',
      fillOpacity: 0.3,
      strokeColor: '#ff0000',
      strokeOpacity: 0.5,
      strokeWeight: 1
    }
  );

}

/*
 周辺検索の結果表示
 ※nearbySearchのコールバック関数
  results : 検索結果
  status ： 実行結果ステータス
  pagination : ページネーション
*/
function displayResults(results, status, pagination) {

  if(status == google.maps.places.PlacesServiceStatus.OK) {

    placesList = placesList.concat(results);
    document.getElementById("PIC").src=placesList[0].icon;
    if (pagination.hasNextPage) {

      //pagination.nextPageで次の検索結果を表示する
      //※連続実行すると取得に失敗するので、1秒くらい間隔をおく
      setTimeout(pagination.nextPage(), 1000);

    //pagination.hasNextPage==falseになったら
    //全ての情報が取得できているので結果を表示する
    } else {

      //ratingが設定されていないものを一旦「-1」に変更する。
      for (var i = 0; i < placesList.length; i++) {
        if(placesList[i].rating == undefined){
          placesList[i].rating = -1;
        }
      }

      //ratingの降順でソート（連想配列ソート）
      placesList.sort(function(a,b){
        if(a.rating > b.rating) return -1;
        if(a.rating < b.rating) return 1;
        return 0;
      });

      //placesList配列をループして、
      //結果表示のHTMLタグを組み立てる
      var resultHTML = "<ol>";

      for (var i = 0; i < placesList.length; i++) {
        place = placesList[i];

        //ratingがないのものは「---」に表示変更
        var rating = place.rating;
        if(rating == undefined) rating = "---";

        //表示内容（評価＋名称）
        var content = "【" + rating + "】 " + place.name;

        //クリック時にMapにマーカー表示するようにAタグを作成
        resultHTML += "<li>";
        resultHTML += "<a href=\"javascript: void(0);\"";
        resultHTML += " onclick=\"createMarker(";
        resultHTML += "'" + place.name + "',";
        resultHTML += "'" + place.vicinity + "',";
        resultHTML += place.geometry.location.lat() + ",";
        resultHTML += place.geometry.location.lng() + ")\">";
        resultHTML += content;
        resultHTML += "</a>";
        resultHTML += "</li>";
      }

      resultHTML += "</ol>";

      //結果表示
      document.getElementById("result").innerHTML = resultHTML;
    }

  } else {
    //エラー表示
    var results = document.getElementById("result");
    if(status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
      results.innerHTML = "検索結果が0件です。";
    } else if(status == google.maps.places.PlacesServiceStatus.ERROR) {
      results.innerHTML = "サーバ接続に失敗しました。";
    } else if(status == google.maps.places.PlacesServiceStatus.INVALID_REQUEST) {
      results.innerHTML = "リクエストが無効でした。";
    } else if(status == google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
      results.innerHTML = "リクエストの利用制限回数を超えました。";
    } else if(status == google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
      results.innerHTML = "サービスが使えない状態でした。";
    } else if(status == google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR) {
      results.innerHTML = "原因不明のエラーが発生しました。";
    }

  }
}

/*
 マーカー表示
  name : 名称
  vicinity : 近辺住所
  lat : 緯度
  lng : 経度
  */
function createMarker(name, vicinity, lat, lng){

  //マーカー表示する位置のMap表示
  var map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: new google.maps.LatLng(lat, lng),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  //マーカー表示
  var marker = new google.maps.Marker({
    map: map,
    position: new google.maps.LatLng(lat, lng)
  });

  //情報窓の設定
  var info = "<div style=\"min-width: 100px\">";
  info += name + "<br />";
  info += vicinity + "<br />";
  info += "<a href=\"https://maps.google.co.jp/maps?q=" + encodeURIComponent(name + " " + vicinity) + "&z=15&iwloc=A\"";
  info += " target=\"_blank\">⇒詳細表示</a><br />";
  info += "<a href=\"https://www.google.com/maps/dir/?api=1&destination=" + lat + "," + lng + "\"";
  info += " target=\"_blank\">⇒ここへ行く</a>";
  info += "</div>";

  //情報窓の表示
  var infoWindow = new google.maps.InfoWindow({
    content: info
  });
  infoWindow.open(map, marker);

  //マーカーのクリック時にも情報窓を表示する
  marker.addListener("click", function(){
    infoWindow.open(map, marker);
  });
}


function getCurrentGPS(){
  // ユーザーの端末がGeoLocation APIに対応しているかの判定
  // 対応している場合
  if( navigator.geolocation )
  {
  	// 現在地を取得
  	navigator.geolocation.getCurrentPosition(

  		// [第1引数] 取得に成功した場合の関数
  		function( position )
  		{
  			// 取得したデータの整理
  			var data = position.coords ;
  			// データの整理
  			var lat = data.latitude ;
  			var lng = data.longitude ;
  			// アラート表示
  		　alert( "あなたの現在位置は、\n[" + lat + "," + lng + "]\nです。" ) ;
  			// 位置情報
  			var latlng = new google.maps.LatLng( lat , lng ) ;
        document.getElementById("result").innerHTML = latlng;
        startNearbySearch(latlng);
  		},
  		// [第2引数] 取得に失敗した場合の関数
  		function( error )
  		{
  			// エラーコード(error.code)の番号
  			// 0:UNKNOWN_ERROR				原因不明のエラー
  			// 1:PERMISSION_DENIED			利用者が位置情報の取得を許可しなかった
  			// 2:POSITION_UNAVAILABLE		電波状況などで位置情報が取得できなかった
  			// 3:TIMEOUT					位置情報の取得に時間がかかり過ぎた…

  			// エラー番号に対応したメッセージ
  			var errorInfo = [
  				"原因不明のエラーが発生しました…。" ,
  				"位置情報の取得が許可されませんでした…。" ,
  				"電波状況などで位置情報が取得できませんでした…。" ,
  				"位置情報の取得に時間がかかり過ぎてタイムアウトしました…。"
  			] ;
  			// エラー番号
  			var errorNo = error.code ;
  			// エラーメッセージ
  			var errorMessage = "[エラー番号: " + errorNo + "]\n" + errorInfo[ errorNo ] ;
  			// アラート表示
  			alert( errorMessage ) ;
  			// HTMLに書き出し
  			document.getElementById("result").innerHTML = errorMessage;
  		} ,
  		// [第3引数] オプション
  		{
  			"enableHighAccuracy": false,
  			"timeout": 8000,
  			"maximumAge": 2000,
  		}

  	) ;
  }
  // 対応していない場合
  else
  {
  	// エラーメッセージ
  	var errorMessage = "お使いの端末は、GeoLacation APIに対応していません。" ;
  	// アラート表示
  	alert( errorMessage ) ;
  	// HTMLに書き出し
  	document.getElementById( 'result' ).innerHTML = errorMessage ;
  }
}


function getInputDataGPS(){
  //検索場所の位置情報を取得
  var geocoder = new google.maps.Geocoder();
  var addressInput = document.getElementById("addressInput").value
  geocoder.geocode(
    {
      address: addressInput
    },
    function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        //取得した緯度・経度を使って周辺検索
        startNearbySearch(results[0].geometry.location);
      }
      else {
        alert(addressInput + "：位置情報が取得できませんでした。");
      }
    });
}


function init(){
  if (!navigator.geolocation){//Geolocation apiがサポートされていない場合
    document.getElementById("result").innerHTML = "<p>Geolocationはあなたのブラウザーでサポートされておりません</p>";
    return;
  }
  //結果表示クリア
  document.getElementById("result").innerHTML = "";
  //placesList配列を初期化
  placesList = new Array();
}

//@getMyplace//
//@現在値を取得//
function searchCurrentGPSArea() {

  function success(position) {
    var latitude  = position.coords.latitude;//緯度
    var longitude = position.coords.longitude;//経度
    var latlng = new google.maps.LatLng( latitude , longitude ) ;
    document.getElementById("result").innerHTML = '<p>緯度 ' + latitude + '° <br>経度 ' + longitude + '°</p>';
    startNearbySearch(latlng);
/*
    document.getElementById("result").innerHTML = '<p>緯度 ' + latitude + '° <br>経度 ' + longitude + '°</p>';
    // 位置情報
    var latlng = new google.maps.LatLng( latitude , longitude ) ;
    // Google Mapsに書き出し
    var map = new google.maps.Map( document.getElementById( 'map' ) , {
        zoom: 15 ,// ズーム値
        center: latlng ,// 中心座標
    } ) ;
    // マーカーの新規出力
    new google.maps.Marker( {
        map: map ,
        position: latlng ,
    } ) ;
    */
  };
  function error() {
    //エラーの場合
    document.getElementById("result").innerHTML = "座標位置を取得できません";
  };
  navigator.geolocation.getCurrentPosition(success, error);//成功と失敗を判断
}

////
function searchInputDataArea(addressInput){
  //検索場所の位置情報を取得
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode(
    {
      address: addressInput
    },
    function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        //取得した緯度・経度を使って周辺検索
        startNearbySearch(results[0].geometry.location);
      }
      else {
        alert(addressInput + "：位置情報が取得できませんでした。");
      }
    });
}

//mapセット用//
function setMap(latlng){
  var myOptions = {
    zoom: 15, /*拡大比率*/
    center: latlng, /*表示枠内の中心点*/
    mapTypeControlOptions: { mapTypeIds: ['noText', google.maps.MapTypeId.ROADMAP] }/*表示タイプの指定*/
  };
  var map = new google.maps.Map(document.getElementById('map'), myOptions);/*マップのID取得*/
  setStyleMap(map);
  return map;
}

//map コールバック関数
function initMap() {
    var latlng = new google.maps.LatLng(35.1750255,136.8860834);/*表示したい場所の経度、緯度*/
    var myOptions = {
      zoom: 15, /*拡大比率*/
      center: latlng, /*表示枠内の中心点*/
      mapTypeControlOptions: { mapTypeIds: ['noText', google.maps.MapTypeId.ROADMAP] }/*表示タイプの指定*/
    };
    var map = new google.maps.Map(document.getElementById('map'), myOptions);/*マップのID取得*/
    setStyleMap(map);
}

function setStyleMap(objmap) {
        // Create a new StyledMapType object, passing it an array of styles,
        // and the name to be displayed on the map type control.
        var styledMapType = new google.maps.StyledMapType(
            [
              {elementType: 'geometry', stylers: [{color: '#ebe3cd'}]},
              {elementType: 'labels.text.fill', stylers: [{color: '#523735'}]},
              {elementType: 'labels.text.stroke', stylers: [{color: '#f5f1e6'}]},
              {
                featureType: 'administrative',
                elementType: 'geometry.stroke',
                stylers: [{color: '#c9b2a6'}]
              },
              {
                featureType: 'administrative.land_parcel',
                elementType: 'geometry.stroke',
                stylers: [{color: '#dcd2be'}]
              },
              {
                featureType: 'administrative.land_parcel',
                elementType: 'labels.text.fill',
                stylers: [{color: '#ae9e90'}]
              },
              {
                featureType: 'landscape.natural',
                elementType: 'geometry',
                stylers: [{color: '#dfd2ae'}]
              },
              {
                featureType: 'poi',
                elementType: 'geometry',
                stylers: [{color: '#dfd2ae'}]
              },
              {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{color: '#93817c'}]
              },
              {
                featureType: 'poi.park',
                elementType: 'geometry.fill',
                stylers: [{color: '#a5b076'}]
              },
              {
                featureType: 'poi.park',
                elementType: 'labels.text.fill',
                stylers: [{color: '#447530'}]
              },
              {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{color: '#f5f1e6'}]
              },
              {
                featureType: 'road.arterial',
                elementType: 'geometry',
                stylers: [{color: '#fdfcf8'}]
              },
              {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [{color: '#f8c967'}]
              },
              {
                featureType: 'road.highway',
                elementType: 'geometry.stroke',
                stylers: [{color: '#e9bc62'}]
              },
              {
                featureType: 'road.highway.controlled_access',
                elementType: 'geometry',
                stylers: [{color: '#e98d58'}]
              },
              {
                featureType: 'road.highway.controlled_access',
                elementType: 'geometry.stroke',
                stylers: [{color: '#db8555'}]
              },
              {
                featureType: 'road.local',
                elementType: 'labels.text.fill',
                stylers: [{color: '#806b63'}]
              },
              {
                featureType: 'transit.line',
                elementType: 'geometry',
                stylers: [{color: '#dfd2ae'}]
              },
              {
                featureType: 'transit.line',
                elementType: 'labels.text.fill',
                stylers: [{color: '#8f7d77'}]
              },
              {
                featureType: 'transit.line',
                elementType: 'labels.text.stroke',
                stylers: [{color: '#ebe3cd'}]
              },
              {
                featureType: 'transit.station',
                elementType: 'geometry',
                stylers: [{color: '#dfd2ae'}]
              },
              {
                featureType: 'water',
                elementType: 'geometry.fill',
                stylers: [{color: '#b9d3c2'}]
              },
              {
                featureType: 'water',
                elementType: 'labels.text.fill',
                stylers: [{color: '#92998d'}]
              }
            ],
            {name: 'Styled Map'});

   objmap.mapTypes.set('map', styledMapType);
   objmap.setMapTypeId('map');
}

//sample style
/*
var styleOptions =
[
{
  "featureType": "landscape.natural",
  "stylers": [
    { "color": "#fff2c2" }
  ]
},{
  "featureType": "road",
  "stylers": [
    { "gamma": 2.61 },
    { "color": "#ffffff" }
  ]
},{
  "featureType": "transit.line",
  "stylers": [
    { "invert_lightness": true },
    { "visibility": "simplified" },
    { "color": "#ffbe00" }
  ]
},{
  "elementType": "labels.icon",
  "stylers": [
    { "visibility": "off" }
  ]
},{
  "featureType": "landscape.man_made",
  "elementType": "geometry",
  "stylers": [
    { "visibility": "simplified" },
    { "color": "#ffce5f" }
  ]
},{
  "featureType": "poi",
  "elementType": "geometry",
  "stylers": [
    { "color": "#ffde5b" }
  ]
},{
  "featureType": "water",
  "stylers": [
    { "color": "#dfe8ff" }
  ]
},{
  "featureType": "transit.station",
  "elementType": "geometry",
  "stylers": [
    { "color": "#fab022" }
  ]
}
];
*/
