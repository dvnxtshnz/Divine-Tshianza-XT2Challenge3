// mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiZHZueHRzaG56IiwiYSI6ImNsMWo5YXNwMjBsM20za3JwNWp5N285ajIifQ.uoKIOl0GplJciR66xPN8RQ'; // API key mapbox

var map = new mapboxgl.Map ({
  container: 'map', // ID van de container in HTML waar de kaart wordt ingeladen
  style: 'mapbox://styles/dvnxtshnz/cl1j9uz5x003014n53geqd8gu', // URL van eigen gestijlde kaart
  center: [-95.712891, 37.09024], // start positie geladen kaart
  zoom: 2.3 // hoever de kaart is ingezoomd bij het laden
});

// toont zoekbalk
map.addControl (
  new MapboxGeocoder ({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl
  })
);

// toont navigatiebuttons
var nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'bottom-right'); // navigatiebuttons komen rechtsonder in de kaart

// OpenWeather
var openWeatherMapUrl = 'https://api.openweathermap.org/data/2.5/weather'; // url OpenWeather
var openWeatherMapApiKey = '61cb9cb478fceb77846e347cc8ca6458'; // API key OpenWeather

// locaties waar het weer getoont moet worden
var locations = [
  {
    name: 'Kennedy Space Center',
    coordinates: [-80.651070, 28.573469]
  },
  {
    name: 'Edwards Air Force Base',
    coordinates: [-117.8912085, 34.9240314]
  },
  {
    name: 'White Sands Space Harbor',
    coordinates: [-106.41993, 32.944408]
  },
  {
    name: 'Atlantic City International Airport',
    coordinates: [-74.5730, 39.4545]
  },
  {
    name: 'Lincoln Airport',
    coordinates: [-96.681679, 40.806862]
  },
];

// weer icoon
function placeWeatherIcon(icon, location) {
  map.loadImage (
    // iconen uit OpenWeather inladen
    'https://openweathermap.org/img/wn/' + icon + '@2x' + '.png',
    function (error, image) {
      if (error) throw error;

      map.addImage("weatherIcon" + location.name, image);
      map.addSource("pin" + location.name, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: location.coordinates
            }
          }]
        }
      });
      
      map.addLayer ({ // toont de pins van de locaties in de vorm van een weer icoon
        id: "pins" + location.name,
        type: "symbol",
        source: "pin" + location.name,
        layout: {
          "icon-image": "weatherIcon" + location.name,
          "icon-size": 0.5
        }
      });
    }
  );
}

// kaart met gepinde locaties wordt geladen als alles binnen {} is uitgevoerd
map.on('load', function() {
  // loopt door de variable locations heen
  locations.forEach(function(location) {
    var request = openWeatherMapUrl + '?' + 'appid=' + openWeatherMapApiKey + '&lon=' + location.coordinates[0] + '&lat=' + location.coordinates[1];
    // haalt huidige weer op aan de hand van de coördinaten van de locaties
    fetch(request)
    .then(function(response) {
      if(!response.ok) throw Error(response.statusText);
      return response.json();
    })
    .then(function(response) {
      // plaats juiste icoon aan de hand van het weer per locatie
      placeWeatherIcon(response.weather[0].icon, location)
    })
    .catch(function(error) {
      console.log('ERROR', error);
    });
  });
});

// popup tekst per locatie die getoont moet worden
// functie werk alleen helaas niet
map.on('load', function() {
  map.addSource('popupText', {
    'type': 'geojson',
    'data': {
      'type': 'FeatureCollection', 
      'features': [
      {
          'type': 'Feature',
          'properties': {
            'description': '<h2>Kennedy Space Center</h2><p><strong>Adres:</strong> Florida 32899, Verenigde Staten</p>'
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [-80.651070, 28.573469]
          }
        },
        {
          'type': 'Feature',
          'properties': {
            'description': '<h2>Edwards Air Force Base</h2><p><strong>Adres:</strong> 305 E. Popson Ave. Edwards AFB, CA 93524, Verenigde Staten</p>'
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [-117.8912085, 34.9240314]
          }
        },
        {
          'type': 'Feature',
          'properties': {
            'description': '<h2>White Sands Space Harbor</h2><p><strong>Adres:</strong> 12600 NASA Rd, Las Cruces, NM 88012, Verenigde Staten</p>'
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [-106.41993, 32.944408]
          }
        },
        {
          'type': 'Feature',
          'properties': {
            'description': '<h2>Atlantic City International Airport</h2><p><strong>Adres:</strong> 101 Atlantic City International Airport, Egg Harbor Township, NJ 08234, Verenigde Staten</p>'
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [-74.5730, 39.4545]
          }
        },
        {
          'type': 'Feature',
          'properties': {
            'description': '<h2>Lincoln Airport</h2><p><strong>Adres:</strong> 2400 W Adams St, Lincoln, NE 68524, Verenigde Staten</p>'
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [-96.681679, 40.806862]
          }
        }
      ]
    }
  });

  map.addLayer({
    'id': 'popupText',
    'type': 'symbol',
    'source': 'popupText',
    'layout': {
      'icon-allow-overlap': true
    }
  });

  // maakt popup aan, maar maakt deze niet zichtbaar
  var popup = new mapboxgl.Popup ({
    closeButton: false, // close button voor de popup is er niet
    closeOnClick: false // klikfunctie om de popup te laten verschijnen is er niet
  });

  // deze functie wordt aangeroepen als je over een locatie heen hovert
  map.on('mouseenter', 'popupText', function(e) {
    map.getCanvas().style.cursor = 'pointer'; // veranderd de stijl van cursor naar een pointer als je over een locatie heen hovert

    var coordinates = e.features[0].geometry.coordinates.slice(); // haalt de coördinaten van een locatie op
    var description = e.features[0].properties.description; // haalt de beschrijving van een locatie op

    // zorgt voor de goede coördinaten en beschrijving in de kaart
    popup.setLngLat(coordinates).setHTML(description).addTo(map);
  });

  map.on('mouseleave', 'popupText', function (e) {
      map.getCanvas().style.cursor = '';  // veranderd de pointer naar een cursor wanneer je van een locatie af gaat
      popup.remove(); // / haalt de popup weg als je de muis verwijderd van een locatie
  });

  // centreert de kaart op de coördinaten van elke aangeklikte locatie
  map.on('click', 'popupText', function(e) {
    map.flyTo ({
      center: e.features[0].geometry.coordinates
    });
  });
});