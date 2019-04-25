/* Javascript by Geri, Will, and Matt 2019 */

// variables
var $header_top = $('.header-top');
var $nav = $('nav');

// toggle menu
$header_top.find('a').on('click', function() {
  $(this).parent().toggleClass('open-menu');
});

// fullpage customization
$('#fullpage').fullpage({
  sectionsColor: ['#0d3c87', '#0d3c87', '#0d3c87', '#0d3c87', '#0d3c87'],
  sectionSelector: '.vertical-scrolling',
  navigation: true,
  slidesNavigation: true,
  controlArrows: false,
  anchors: ['firstSection', 'secondSection', 'thirdSection', 'fourthSection'],
  menu: '#menu',
  normalScrollElements: 'section3',
  paddingTop: '70px',

  afterLoad: function(anchorLink, index) {
    $header_top.css('background', 'rgba(0, 47, 77, .3)');
    $nav.css('background', 'rgba(0, 47, 77, .25)');
    if (index == 4) {
        $('#fp-nav').hide();
      }
  },

  onLeave: function(index, nextIndex, direction) {
    if(index == 4) {
      $('#fp-nav').show();
    }
  },

  afterSlideLoad: function( anchorLink, index, slideAnchor, slideIndex) {
    if(anchorLink == 'fourthSection' && slideIndex == 1) {
      $.fn.fullpage.setAllowScrolling(false, 'up');
      $header_top.css('background', 'transparent');
      $nav.css('background', 'transparent');
      $(this).css('background', '#374140');
      $(this).find('h2').css('color', 'white');
      $(this).find('h3').css('color', 'white');
      $(this).find('p').css(
        {
          'color': '#DC3522',
          'opacity': 1,
          'transform': 'translateY(0)'
        }
      );
    }
  },

  onSlideLeave: function( anchorLink, index, slideIndex, direction) {
    if(anchorLink == 'fourthSection' && slideIndex == 1) {
      $.fn.fullpage.setAllowScrolling(true, 'up');
      $header_top.css('background', 'rgba(0, 47, 77, .3)');
      $nav.css('background', 'rgba(0, 47, 77, .25)');
    }
  }
});

// get colors for choropleth
function getColor(d) {
  return d > 1038 ? '#cc4c02' :
         d > 551 ? '#fe9929' :
         d > 239 ? '#fed98e' :
         d > 67 ? '#ffffd4' :
                  '#ffffff' ;

};

// assign state outline style
var stateOutlines = {
  'weight': 2,
  'opacity': 1,
  'color': '#fbb4b9',
  'fillOpacity': 0
};

// assign colors to county data
function choropleth(feature) {
  return {
    fillColor: getColor(feature.properties.Wscore),
    weight: 0.7,
    opacity: 0.7,
    color: 'white',
    fillOpacity: 0.7
  };
};

// event listener to highlight
function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 1,
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
    color: 'white',
    fillOpacity: 0.7
  })

  layer.bringToBack();

  // update info box
  info.update();
};

// click listener to zoom to stat
// function zoomToFeature(e) {
//   map.fitBounds(e.target.getBounds());
// };

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
  this._div.innerHTML = '<h4>HSPA Weighted Score:</h4>' + (props ?
    '<b>' + props.Wscore + '</b><br />'
    + titleCase(props.NAME) + ' County,<br />'+ titleCase(props.STATE) + '</b><br />'
    + '# of HSPAs: ' + props.HSPACount
    : 'Hover over a county');
};

// create the map
var map = L.map('section3', {
    center: [37.8, -96],
    zoom: 4
});

// turn off scrollwheel zoom
map.scrollWheelZoom.disable();

// create geojson variable
var geojson;

// add data layers to map
geojson = L.geoJson(countyHSPA, {
  style: choropleth,
  onEachFeature: onEachFeature
}).addTo(map);

L.geoJson(statesData, {style: stateOutlines, interactive: false}).addTo(map);

// add OSM base tilelayer
L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicHNteXRoMiIsImEiOiJjaXNmNGV0bGcwMG56MnludnhyN3Y5OHN4In0.xsZgj8hsNPzjb91F31-rYA', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibWF0dHJvZGUiLCJhIjoiY2pzdWdsNnJvMDJuODQ5b2VydTBuYWF4dCJ9.4RfNabbj_uH0TcKSACZ_Lw'
}).addTo(map);

info.addTo(map);

