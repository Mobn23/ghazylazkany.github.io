import { updateXML, exportXML } from './xmlUpdater.js';

// Conversion factors
const METERS_PER_DEGREE_LAT = 111320; // 1 degree of latitude ≈ 111,320 meters
const METERS_PER_DEGREE_LNG = (lat) => 111320 * Math.cos((lat * Math.PI) / 180); // 1 degree of longitude ≈ 111,320 * cos(latitude) meters

export const setupBuildingEditor = (map) => {
  const editor = document.getElementById('editor');
  const heightInput = document.getElementById('height');
  const widthSlider = document.getElementById('width');
  const lengthSlider = document.getElementById('length');
  const rotationSlider = document.getElementById('rotation');
  const dragToggleButton = document.getElementById('drag-toggle');
  const closeEditorButton = document.getElementById('close-editor');
  const lockBuildingButton = document.getElementById('lock-building');
  const exportXmlButton = document.getElementById('export-xml');
  let selectedBuildingId = null;
  let selectedBuilding = null;
  let isDragModeActive = false;

  // Show the editor when a building is clicked
  map.on('click', 'custom-3d-buildings', (e) => {
    if (isDragModeActive) return; // Skip if drag mode is active

    selectedBuildingId = e.features[0].properties.id;
    selectedBuilding = e.features[0];
    const height = e.features[0].properties.height;
    const width = e.features[0].properties.width || 20; // Default width
    const length = e.features[0].properties.length || 20; // Default length
    const rotation = e.features[0].properties.rotation || 0; // Default rotation
    const locked = e.features[0].properties.locked ?? true; // Default locked

    // Populate the form with the building's current properties
    heightInput.value = height;
    widthSlider.value = width;
    lengthSlider.value = length;
    rotationSlider.value = rotation;
    lockBuildingButton.textContent = locked ? 'Unlock Building' : 'Lock Building';

    // Show the editor panel
    editor.style.display = 'block';
  });

  // Real-time updates for sliders
  const updateBuilding = () => {
    if (selectedBuildingId && selectedBuilding) {
      const source = map.getSource('custom-buildings');
      const data = source._data;

      // Update the selected building's properties
      const building = data.features.find(f => f.properties.id === selectedBuildingId);
      if (building) {
        building.properties.height = parseFloat(heightInput.value);
        building.properties.width = parseFloat(widthSlider.value);
        building.properties.length = parseFloat(lengthSlider.value);
        building.properties.rotation = parseFloat(rotationSlider.value);

        // Update the building's coordinates based on the new width, length, and rotation
        const center = getPolygonCenter(building.geometry.coordinates[0]);
        const lat = center[1];
        const lng = center[0];

        // Convert width and length from meters to degrees
        const widthDeg = building.properties.width / METERS_PER_DEGREE_LNG(lat);
        const lengthDeg = building.properties.length / METERS_PER_DEGREE_LAT;

        // Calculate rotated coordinates
        const angle = (building.properties.rotation * Math.PI) / 180; // Convert degrees to radians
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);

        const corners = [
          [lng - widthDeg / 2, lat - lengthDeg / 2],
          [lng + widthDeg / 2, lat - lengthDeg / 2],
          [lng + widthDeg / 2, lat + lengthDeg / 2],
          [lng - widthDeg / 2, lat + lengthDeg / 2],
        ];

        const rotatedCorners = corners.map(([x, y]) => {
          const dx = x - lng;
          const dy = y - lat;
          return [
            lng + dx * cosAngle - dy * sinAngle,
            lat + dx * sinAngle + dy * cosAngle,
          ];
        });

        // Close the polygon
        rotatedCorners.push(rotatedCorners[0]);

        // Update the building's coordinates
        building.geometry.coordinates = [rotatedCorners];

        // Update the source data
        source.setData(data);

        // Update the XML file
        updateXML(data);

        console.log('Building updated:', building);
      }
    }
  };

  // Add event listeners for real-time updates
  heightInput.addEventListener('input', updateBuilding);
  widthSlider.addEventListener('input', updateBuilding);
  lengthSlider.addEventListener('input', updateBuilding);
  rotationSlider.addEventListener('input', updateBuilding);

  // Close the editor panel
  closeEditorButton.addEventListener('click', () => {
    editor.style.display = 'none';
  });

  // Toggle drag mode
  dragToggleButton.addEventListener('click', () => {
    isDragModeActive = !isDragModeActive;
    dragToggleButton.textContent = isDragModeActive ? 'Enable Drag Mode' : 'Disable Drag Mode';
    map.getCanvas().style.cursor = isDragModeActive ? 'grab' : 'pointer';

    // Enable or disable map interactions
    if (isDragModeActive) {
      // Disable map rotating and panning
      map.dragRotate.disable();
      map.dragPan.disable();
      map.touchZoomRotate.disable();
    } else {
      // Enable map rotating and panning
      map.dragRotate.enable();
      map.dragPan.enable();
      map.touchZoomRotate.enable();
    }
  });

  // Toggle building lock
  lockBuildingButton.addEventListener('click', () => {
    if (selectedBuildingId && selectedBuilding) {
      const source = map.getSource('custom-buildings');
      const data = source._data;

      // Update the selected building's lock state
      const building = data.features.find(f => f.properties.id === selectedBuildingId);
      if (building) {
        building.properties.locked = !building.properties.locked;
        lockBuildingButton.textContent = building.properties.locked ? 'Unlock Building' : 'Lock Building';

        // Update the building's color based on lock state
        map.setPaintProperty('custom-3d-buildings', 'fill-extrusion-color', [
          'case',
          ['==', ['get', 'locked'], true],
          'green',
          'orange'
        ]);

        // Update the source data
        source.setData(data);

        // Update the XML file
        updateXML(data);

        console.log('Building lock toggled:', building);
      }
    }
  });

  // Export XML
  exportXmlButton.addEventListener('click', () => {
    const source = map.getSource('custom-buildings');
    exportXML(source._data);
  });

  // Enable dragging and moving buildings
  let isDragging = false;
  let currentBuilding = null;

  map.on('mousedown', 'custom-3d-buildings', (e) => {
    if (!isDragModeActive) return; // Skip if drag mode is not active

    isDragging = true;
    currentBuilding = e.features[0];
    map.getCanvas().style.cursor = 'grabbing';
  });

  map.on('mousemove', (e) => {
    if (isDragging && currentBuilding) {
      const newCenter = [e.lngLat.lng, e.lngLat.lat];
      const source = map.getSource('custom-buildings');
      const data = source._data;

      // Update the building's coordinates
      const building = data.features.find(f => f.properties.id === currentBuilding.properties.id);
      if (building) {
        const width = building.properties.width || 20;
        const length = building.properties.length || 20;

        // Convert width and length from meters to degrees
        const lat = newCenter[1];
        const widthDeg = width / METERS_PER_DEGREE_LNG(lat);
        const lengthDeg = length / METERS_PER_DEGREE_LAT;

        // Calculate new coordinates based on the center
        building.geometry.coordinates = [
          [
            [newCenter[0] - widthDeg / 2, newCenter[1] - lengthDeg / 2],
            [newCenter[0] + widthDeg / 2, newCenter[1] - lengthDeg / 2],
            [newCenter[0] + widthDeg / 2, newCenter[1] + lengthDeg / 2],
            [newCenter[0] - widthDeg / 2, newCenter[1] + lengthDeg / 2],
            [newCenter[0] - widthDeg / 2, newCenter[1] - lengthDeg / 2] // Close the polygon
          ]
        ];

        // Update the source data
        source.setData(data);
      }
    }
  });

  map.on('mouseup', () => {
    if (isDragging && currentBuilding) {
      isDragging = false;
      currentBuilding = null;
      map.getCanvas().style.cursor = 'grab';

      // Update the XML file after dragging
      const source = map.getSource('custom-buildings');
      updateXML(source._data);
    }
  });
};

// Helper function to calculate the center of a polygon
const getPolygonCenter = (coordinates) => {
  const lngs = coordinates.map(coord => coord[0]);
  const lats = coordinates.map(coord => coord[1]);

  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
};