export const parseBuildingsXML = (xmlString) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

  const buildings = xmlDoc.getElementsByTagName('building');
  const features = [];

  for (let i = 0; i < buildings.length; i++) {
    const building = buildings[i];
    const coordinates = building.getElementsByTagName('point');
    const height = parseFloat(building.getElementsByTagName('height')[0].textContent);
    const area = parseFloat(building.getElementsByTagName('area')[0].textContent);

    const polygonCoordinates = [];
    for (let j = 0; j < coordinates.length; j++) {
      const [lng, lat] = coordinates[j].textContent.split(',').map(parseFloat);
      polygonCoordinates.push([lng, lat]);
    }

    // Close the polygon by repeating the first point
    polygonCoordinates.push(polygonCoordinates[0]);

    features.push({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [polygonCoordinates]
      },
      properties: {
        id: building.getElementsByTagName('id')[0].textContent,
        height: height,
        area: area
      }
    });
  }

  return features;
};