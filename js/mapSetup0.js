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

  return map;
};

export const addBuildingLayer = (map) => {
  map.addSource('custom-buildings', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  });

  map.addLayer({
    id: 'custom-3d-buildings',
    source: 'custom-buildings',
    type: 'fill-extrusion',
    paint: {
      'fill-extrusion-color': 'orange',
      'fill-extrusion-height': ['get', 'height'],
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': 0.8
    }
  });
};