const MAPTILER_KEY = 's44c3cJgUphlOVqUsj58';

export const initializeMap = () => {
  const map = new maplibregl.Map({
    style:  "https://api.maptiler.com/maps/hybrid/style.json?key=s44c3cJgUphlOVqUsj58",
    center: [36.633943, 35.931266],
    zoom: 15.5,
    pitch: 45,
    bearing: -17.6,
    container: 'map',
    canvasContextAttributes: { antialias: true },
    maxBounds: [
      [36.615399, 35.905317],
      [36.662338, 35.946347]
    ]
  });
  const northArrow = document.getElementById('compass');
  map.on('rotate', () => {
    const bearing = map.getBearing(); // Get map's rotation angle
    northArrow.style.transform = `rotate(${-bearing}deg)`; // Fixed template literal
  });
  return map;
};

export const addBuildingLayer = (map) => {
 


const polygons = [
  {
    points: [
      [36.61611851150045,35.93149856836295],
[36.61652796343528,35.92786719478018],
[36.6172332255873,35.92583693764968],
[36.62092846705188,35.92728260404002],
[36.62055673967012,35.92798605877254],
[36.6204201642654,35.92910148873481],
[36.62090118709374,35.93196056333874],
[36.61611851150045,35.93149856836295]

    ],
    color: 'yellow',
    opacity: 0.2,
    label: 'Dabit',
    labelColor: 'black'
  },
  {
    points: [
      [36.40, 35.30],
      [36.41, 35.31],
      [36.42, 35.32],
      [36.43, 35.30],
      [36.41, 35.29],
      [36.39, 35.28]
    ],
    color: 'orange',
    opacity: 0.8,
    label: 'Second',
    labelColor: 'white'
  }
];
function addPolygonsToMap() {
  polygons.forEach((polygon, index) => {
    const polygonId = `polygon-${index}`;

    // Ensure the polygon is closed by repeating the first point
    const closedPoints = [...polygon.points, polygon.points[0]];

    // Add source
    map.addSource(polygonId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [closedPoints]
        }
      }
    });

    // Add fill layer for the polygon
    map.addLayer({
      id: polygonId,
      type: 'fill',
      source: polygonId,
      paint: {
        'fill-color': polygon.color,
        'fill-opacity': polygon.opacity
      }
    });

    // Add label inside the polygon
    map.addLayer({
      id: `${polygonId}-label`,
      type: 'symbol',
      source: polygonId,
      layout: {
        'text-field': polygon.label,
        'text-size': 18,
        'text-anchor': 'center'
      },
      paint: {
        'text-color': polygon.labelColor
      }
    });
	map.addLayer({
  id: `${polygonId}-outline`,
  type: 'line',
  source: polygonId,
  paint: {
    'line-color': 'black',  // Change to desired outline color
    'line-width': 2         // Adjust thickness as needed
  }
});
  });
}

// Call the function when the map loads

addPolygonsToMap();
 map.addSource('custom-buildings', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  });
   map.addLayer({
      id: 'white-overlay',
      type: 'background',
      paint: {
        'background-color': 'white',
        'background-opacity': 0.5, // 25% transparency
      },
    });
  map.addLayer({
    id: 'custom-3d-buildings',
    source: 'custom-buildings',
    type: 'fill-extrusion',
    paint: {
      'fill-extrusion-color': 'Blue',
      'fill-extrusion-height': ['get', 'height'],
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': 0.9,
	  
    }
  });
let glowState = true;
setInterval(() => {
  const newOpacity = glowState ? 0.9 : 0.5;
  const heightAdjustment = glowState ? 20 : 40;
 const colo=glowState ? 'Red' : 'Blue';
  map.setPaintProperty('custom-3d-buildings', 'fill-extrusion-opacity', newOpacity);
  map.setPaintProperty('custom-3d-buildings', 'fill-extrusion-color', colo);


  glowState = !glowState;
}, 500);

};