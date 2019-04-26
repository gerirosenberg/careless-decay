/* Javascript by Geri, Will, and Matt 2019 */

// local scope
(function(){

  // variables
  var $header_top = $('.header-top');
  var $nav = $('nav');

  // toggle menu
  $header_top.find('a').on('click', function() {
    $(this).parent().toggleClass('open-menu');
  });

  // fullpage customization
  $('#fullpage').fullpage({
    sectionsColor: ['#d8a146', '#eec561', '#f7e196', '#fbe5c2', '#ffffff'],
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
    this._div.innerHTML = '<h4>Dental shortage score:</h4>' + (props ?
      + props.Wscore + '</b><br />'
      + titleCase(props.NAME) + ' County,<br />'+ titleCase(props.STATE) + '</b><br />'
      + '# of HSPAs: ' + props.HSPACount
      : 'Hover over a county');
  };

  // function to join counties and csv
    function joinData(allCounties, csvData){
      // loop through csv to assign each set of csv attribute values to geojson tract
      for (var i=0; i<csvData.length; i++){
        // current county
        var csvCounty = csvData[i];
        // csv primary key
        var csvKey = csvCounty.AFFGEOID;
        // loop through geojson counties to find correct county
        for (var a=0; a<allCounties.length; a++){
          // current tract geojson properties
          var geojsonProps = allCounties[a].properties;
          // geojson primary key
          var geojsonKey = geojsonProps.AFFGEOID;
          // where primary keys match, transfer csv data to geojson properties object
          if (geojsonKey === csvKey){
            // assign all attributes and values
            attrArray.forEach(function(attr){
              // get csv attribute value
              var val = parseFloat(csvCounty[attr]);
              // assign attribute and value to geojson properties
              geojsonProps[attr] = val;
            });
          };
        };
      };
      return allCounties;
    }

  // create the map
  var map = L.map('section3', {
    center: mapCenter (),
    zoom: mapZoom ()
  });

  // change map center for mobile
  function mapCenter (){
    if (window.innerWidth > 600) {return [37.8, -96]}
    else {return [40, -98]}
  };

  //change map zoom level based on screensize
  function mapZoom (){
    var d = [3, 4]
    if (window.innerWidth > 600) {return d[1]}
    else {return d[0]}
  };

  // add OSM base tilelayer
  L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicHNteXRoMiIsImEiOiJjaXNmNGV0bGcwMG56MnludnhyN3Y5OHN4In0.xsZgj8hsNPzjb91F31-rYA', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 7,
      id: 'mapbox.streets',
      accessToken: 'pk.eyJ1IjoibWF0dHJvZGUiLCJhIjoiY2pzdWdsNnJvMDJuODQ5b2VydTBuYWF4dCJ9.4RfNabbj_uH0TcKSACZ_Lw'
  }).addTo(map);

  //use d3.queue to parallelize asynchronous data loading
  d3.queue()
    // load csv attributes
    .defer(d3.csv, "data/poverty_public_health_coverage.csv")
    // load county data
    .defer(d3.json, "data/CountyHSPA.geojson")
    // load state outlines
    .defer(d3.json, "data/states.geojson")
    .await(callback);

  // add callback function
  function callback(error, csvData, counties, stateOutlines){

    // psuedo-global variables
    var attrArray = ["Wscore", "Percent_below_poverty_level", "Percent_with_public_health_coverage"];

    // define attributes
    var score = attrArray[0];
    var poverty = attrArray[1];
    var medicaid = attrArray[2];

    // join csv data to enumeration units
    allCounties = joinData(counties, csvData);

    // turn off scrollwheel zoom
    map.scrollWheelZoom.disable();

    // create geojson variable
    var geojson;

    // add data layers to map
    geojson = L.geoJson(allCounties, {
      style: choropleth,
      onEachFeature: onEachFeature
    }).addTo(map);

    L.geoJson(stateOutlines, {style: stateStyle, interactive: false}).addTo(map);

    info.addTo(map);
    legend.addTo(map);
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

  // function panMap() {

  // };

})();