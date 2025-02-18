import { initializeMap, addBuildingLayer } from './mapSetup.js';
import { parseBuildingsXML } from './utils.js';
import { setupBuildingEditor } from './buildingEditor.js';

const map = initializeMap();

map.on('load', () => {
  // Add the custom buildings layer
  addBuildingLayer(map);

  // Fetch and parse the buildings.xml file
  fetch('buildings.xml')
    .then(response => response.text())
    .then(xmlString => {
      const features = parseBuildingsXML(xmlString);

      // Add the buildings to the map
      const source = map.getSource('custom-buildings');
      source.setData({
        type: 'FeatureCollection',
        features: features
      });

      console.log('Buildings added:', features);
    })
    .catch(error => console.error('Error fetching buildings.xml:', error));

  // Set up the building editor
  setupBuildingEditor(map);
});