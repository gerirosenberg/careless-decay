/* Javascript by Geri, Will, and Matt 2019 */

// debounce to increase speeds
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

// latlng bounds
var southWest = L.latLng(16, -181),
    northEast = L.latLng(74, -64),
    bounds = L.latLngBounds(southWest, northEast);

// change map center for mobile
function mapCenter (){
  if (window.innerWidth > 600) {return [37.8, -96]}
  else {return [40, -98]}
};

// change map zoom level based on screensize
function mapZoom (){
  var d = [3, 4]
  if (window.innerWidth > 600) {return d[1]}
  else {return d[0]}
};

// create scroll monitor watchers
var introWatcher = scrollMonitor.create($('#intro'));
var alaskaWatcher = scrollMonitor.create($('#alaska'));
var westWatcher = scrollMonitor.create($('#wv'));
var fullMapWatcher = scrollMonitor.create($('#full-extent'));

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

// make HSPA single or plural
function hspaNum (props) {
  var single = 'HSPA'
  var plural = 'HSPAs'
  if (props.HSPACount == 1) {
    return single;
  }
  else {
    return plural;
  }
}

// make info box
var info = L.control();

info.onAdd = function (map) {
  // new div
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
};

// update info box
info.update = function (props) {
  this._div.innerHTML =  '<h2>' + (props ? + props.Wscore
    + '</h2><h4>Dental shortage score: </h4><br/><h3></h3>'
    + 'Percent below poverty line: ' + props.Percent_be + '<br/>'
    + 'Percent on Medicaid: ' + props.Percent_wi + '<br/>'
    + titleCase(props.NAME) + ' County, '+ titleCase(props.STATE)
    + '<br/>' + props.HSPACount + ' ' + hspaNum(props) + '<br/>'
    : '<h4>Hover over a county for details</h4>');
};

// create the map
var map = L.map('map', {
  container: 'map',
  center: mapCenter (),
  zoom: mapZoom (),
  maxBounds: bounds,
  zoomControl: false,
	//layers: [poverty, dental]
  gestureHandling: true
});

// add OSM base tilelayer
L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicHNteXRoMiIsImEiOiJjaXNmNGV0bGcwMG56MnludnhyN3Y5OHN4In0.xsZgj8hsNPzjb91F31-rYA', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 8,
    minZoom: 3,
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
  map.flyTo(new L.LatLng(38.4,-80.9), 7, {animate: true});
});

fullMapWatcher.enterViewport(function () {
  // changes the scale and zoom to continental US
  map.flyTo(new L.LatLng(37.8, -96), mapZoom (), {animate: true});
});

// use d3.queue to parallelize asynchronous data loading
d3.queue()
  // load county data
  .defer(d3.json, "data/CountyHSPA.geojson")
  // load state outlines
  .defer(d3.json, "data/states.geojson")
  .await(callback);

// add callback function
function callback(error, counties, stateOutlines){

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

  // enlist debounce
  window.addEventListener("scroll", debounceFire ());
};

// create popups
function createPopup(layer) {
  // add formatted attribute to panel content string
  var popupContent = "Help"

  layer.bindPopup(popupContent);
}

// create legend
var legend = L.control({position: 'bottomleft'});

legend.onAdd = function(map) {
  var div = L.DomUtil.create('div', 'info legend'),
  scores = [0, 1, 70, 250, 575, 1200],
  labels = [];
  div.innerHTML = '<h4>Dental shortage score <a href="#" class="btn btn-primary btn-sm" rel="popover" data-boundary="viewport" data-content="I need a definition" data-original-title="A Title">Help</a></h4>'

  // generate labels and squares for each interval
  for (var i = 0; i < scores.length; i++) {
    div.innerHTML +=
      '<i style="background:' + getColor(scores[i] + 1) + '"></i> ' +
      scores[i] + (scores[i + 1] ? '&ndash;' + scores[i + 1] + '<br>' : '+');
  }

  div.innerHTML += '<div id="best">(Best access)</div>'
                + '<div id="worst">(Worst access)</div>'

  return div;
  $("a[rel=popover]").popover()
  .click(function(e) {
          e.preventDefault();
       });
};


  var helpLink = document.getElementById('help');
  console.log(helpLink);
