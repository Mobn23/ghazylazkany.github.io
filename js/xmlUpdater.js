export const updateXML = (data) => {
  const buildings = data.features.map(building => {
    const points = building.geometry.coordinates[0]
      .map(coord => `<point>${coord[0]},${coord[1]}</point>`)
      .join('');

    return `
      <building>
        <id>${building.properties.id}</id>
        <coordinates>
          ${points}
        </coordinates>
        <height>${building.properties.height}</height>
        <width>${building.properties.width}</width>
        <length>${building.properties.length}</length>
        <rotation>${building.properties.rotation || 0}</rotation>
		<area>${building.properties.area || 100}</area>
        <locked>${building.properties.locked ?? true}</locked>
      </building>
    `;
  }).join('');

  const xmlContent = `
    <buildings>
      ${buildings}
    </buildings>
  `;

  // Save the updated XML content to the file
  fetch('/update-buildings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml'
    },
    body: xmlContent
  })
    .then(response => {
      if (response.ok) {
        console.log('XML file updated successfully');
      } else {
        console.error('Failed to update XML file');
      }
    })
    .catch(error => console.error('Error updating XML file:', error));
};

export const exportXML = (data) => {
  const buildings = data.features.map(building => {
    const points = building.geometry.coordinates[0]
      .map(coord => `<point>${coord[0]},${coord[1]}</point>`)
      .join('');

    return `
      <building>
        <id>${building.properties.id}</id>
        <coordinates>
          ${points}
        </coordinates>
        <height>${building.properties.height}</height>
        <width>${building.properties.width}</width>
        <length>${building.properties.length}</length>
        <rotation>${building.properties.rotation || 0}</rotation>
		<area>${building.properties.area || 100}</area>
        <locked>${building.properties.locked ?? true}</locked>
      </building>
    `;
  }).join('');

  const xmlContent = `
    <buildings>
      ${buildings}
    </buildings>
  `;

  // Create a Blob and prompt the user to save the file
  const blob = new Blob([xmlContent], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'buildings.xml';
  a.click();
  URL.revokeObjectURL(url);
};