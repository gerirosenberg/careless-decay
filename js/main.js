/* Javascript by Geri, Will, and Matt 2019 */

// Debounce to increase speeds
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

var debounceFire = debounce(function() {
}, 250);

// change map center for mobile
function mapCenter (){
  if (window.innerWidth > 600) {return [37.8, -96]}
  else {return [40, -98]}
};

// change map zoom level based on screensize
function mapZoom (){
  var d = [3, 3.6]
  if (window.innerWidth > 600) {return d[1]}
  else {return d[0]}
};

// scroll listener for map
document.getElementById("map").addEventListener("scroll", function(e) {
  console.log(e);
});

// create scroll monitor watchers
var introWatcher = scrollMonitor.create($('#intro'));
var alaskaWatcher = scrollMonitor.create($('#alaska'));
var westWatcher = scrollMonitor.create($('#wv'));
var fullMapWatcher = scrollMonitor.create($('#full-extent'));
//Map Style for Poverty and Healthcare Coverage Layers
 //Section for Poverty Layer-------------
//assign state outline style
  var stateStylePoverty = {
    'weight': 2,
    'opacity': 1,
    'color': '#9D828C',
    'fillOpacity': 0	  
  };
 
  //get colors for poverty layer
  function getColor2(e) {
	  return d > 28 ? '#993404' :
           d > 20 ? '#d95f0e' :
           d > 14 ? '#fe9929' :
           d > 8 ? '#fed98e' :
           d > 0 ? '#ffffd4' :
                    '#ffffff' ;
  };
function choroplethPoverty(feature) {
  return {
    fillColor: getColor2(feature.properties.Percent_below_poverty_level),
    weight: 0.5,
    opacity: 0.3,
    color: '#fbb4b9',
    fillOpacity: 0.7
  };
};

// get colors for choropleth
function getColor(d) {
  return d > 1200 ? '#993404' :
         d > 575 ? '#d95f0e' :
         d > 250 ? '#fe9929' :
         d > 70 ? '#fed98e' :
         d > 1 ? '#ffffd4' :
                  '#ffffff' ;

};

// assign state outline style
var stateStyle = {
  'weight': 2,
  'opacity': 1,
  'color': '#fbb4b9',
  'fillOpacity': 0
};

// assign colors to county data
function choropleth(feature) {
  return {
    fillColor: getColor(feature.properties.Wscore),
    weight: 0.5,
    opacity: 0.3,
    color: '#fbb4b9',
    fillOpacity: 0.7
  };
};

// event listener to highlight
function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 1,
    opacity: 1,
    color: '#666',
    fillOpacity: 0.7
  });

  layer.bringToFront();

  // update info box
  info.update(layer.feature.properties);
};

// event listener to unhighlight
function resetHighlight(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 0.5,
    opacity: 0.3,
    color: '#fbb4b9',
    fillOpacity: 0.7
  })

  layer.bringToBack();

  // update info box
  info.update();
};

// add listeners to county data
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    // click: zoomToFeature
  });
};

// function to fix capitalization for info box
function titleCase(string) {
  var splitString = string.toLowerCase().split(' ')
  for (var i = 0; i < splitString.length; i++) {
    splitString[i] = splitString[i].charAt(0).toUpperCase()
                     + splitString[i].substring(1);
  };
  return splitString.join(' ');
};

// info box
var info = L.control();

info.onAdd = function (map) {
  // new div
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
};

// update info box
info.update = function (props) {
  this._div.innerHTML = '<h4>Dental shortage score: </h4>' + '<h2>'
    + (props ? + props.Wscore + '</h2><br/><h3></h3>'
	+ '<h4>Poverty % :</h4>' + props.Percent_be + '</h2><br/><h3></h3>'
    + '<h4>Medicaid Reliance % :</h4>' + props.Percent_wi + '</h2><br/><h3></h3>'
    + titleCase(props.NAME) + ' County, '+ titleCase(props.STATE)
    + '<br/># of HSPAs: ' + props.HSPACount + '<br/>'
    : '<h4>Hover over a county</h4>');
};

// create the map
var map = L.map('map', {
  container: 'map',
  center: mapCenter (),
  zoom: mapZoom (),
  zoomControl: false,
	//layers: [poverty, dental]
  gestureHandling: true
});

// add OSM base tilelayer
L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicHNteXRoMiIsImEiOiJjaXNmNGV0bGcwMG56MnludnhyN3Y5OHN4In0.xsZgj8hsNPzjb91F31-rYA', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 7,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibWF0dHJvZGUiLCJhIjoiY2pzdWdsNnJvMDJuODQ5b2VydTBuYWF4dCJ9.4RfNabbj_uH0TcKSACZ_Lw'
}).addTo(map);

introWatcher.enterViewport(function () {
  // changes the scale and zoom to continental US
  map.flyTo(new L.LatLng(37.8, -96), mapZoom (), {animate: true});
});

alaskaWatcher.enterViewport(function () {
  // changes the scale and zoom to Alaska
  map.flyTo(new L.LatLng(63.8,-151.5), 4, {animate: true});
});

westWatcher.enterViewport(function () {
  // changes the scale and zoom to WV
  map.flyTo(new L.LatLng(38.4,-80.9), 6, {animate: true});
});

fullMapWatcher.enterViewport(function () {
  // changes the scale and zoom to continental US
  map.flyTo(new L.LatLng(37.8, -96), mapZoom (), {animate: true});
});

//use d3.queue to parallelize asynchronous data loading
d3.queue()
  // load pphc data
  .defer(d3.json, "data/pphc.geojson")
  // load county data
  .defer(d3.json, "data/CountyHSPA.geojson")
  // load state outlines
  .defer(d3.json, "data/states.geojson")
  .await(callback);

// add callback function
function callback(error, pphcData, counties, stateOutlines){

  // psuedo-global variables
  var attrArray = ["Wscore", "Percent_below_poverty_level", "Percent_with_public_health_coverage"];

  // define attributes
  var score = attrArray[0];
  var poverty = attrArray[1];
  var medicaid = attrArray[2];

  // turn off scrollwheel zoom
  map.scrollWheelZoom.disable();

  // create geojson variable
  var geojson;

  // add data layers to map
  geojson = L.geoJson(counties, {
    style: choropleth,
    onEachFeature: onEachFeature
  }).addTo(map);

  L.geoJson(stateOutlines, {style: stateStyle, interactive: false}).addTo(map);

  info.addTo(map);
  legend.addTo(map);

  // Enlist debounce
  window.addEventListener("scroll", debounceFire ());
};

// create legend
var legend = L.control({position: 'bottomright'});

legend.onAdd = function(map) {
  var div = L.DomUtil.create('div', 'info legend'),
  scores = [0, 1, 70, 250, 575, 1200],
  labels = [];

  // generate labels and squares for each interval
  for (var i = 0; i < scores.length; i++) {
    div.innerHTML +=
      '<i style="background:' + getColor(scores[i] + 1) + '"></i> ' +
      scores[i] + (scores[i + 1] ? '&ndash;' + scores[i + 1] + '<br>' : '+');
  }

  return div;
};