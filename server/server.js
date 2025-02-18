const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Middleware to parse XML data from the request body
app.use(express.text({ type: 'application/xml' }));

// Serve static files from the project folder
app.use(express.static(path.join(__dirname, '../')));

// Endpoint to update the buildings.xml file
app.post('/update-buildings', (req, res) => {
  const xmlContent = req.body;

  // Write the updated XML content to the buildings.xml file
  fs.writeFile(path.join(__dirname, '../buildings.xml'), xmlContent, (err) => {
    if (err) {
      console.error('Error writing to buildings.xml:', err);
      return res.status(500).send('Failed to update XML file');
    }

    console.log('buildings.xml updated successfully');
    res.sendStatus(200);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});