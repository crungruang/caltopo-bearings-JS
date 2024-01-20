const express = require('express');
const multer = require('multer');
const fs = require('fs');
const geolib = require('geolib');

const app = express();
const port = 8080;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/upload', upload.single('jsonFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const filePath = req.file.path;

  // Read and parse the uploaded JSON file
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading the file.');
    }

    try {
      const jsonData = JSON.parse(data);
      // Filter and extract coordinates of type "Point" with class "Marker"
      const points = jsonData.features.filter(
        feature => feature.geometry.type === 'Point' &&
          feature.properties.class === 'Marker'
      );

      // Calculate bearing and distance for each combination of coordinates and titles
      const result = calculateBearingAndDistance(points);

      // Sort the result alphabetically by title and destination
      const sortedResult = Object.keys(result).sort().reduce((acc, key) => {
        acc[key] = result[key].sort((a, b) => {
          const destinationComparison = a.to.localeCompare(b.to);
          return destinationComparison !== 0 ? destinationComparison : a.from.localeCompare(b.from);
        });
        return acc;
      }, {});

      // Format the result as a JSON response with new lines
      let formattedResponse = '';

      Object.keys(sortedResult).forEach(title => {
      formattedResponse += `${title}:\n`;
      sortedResult[title].forEach(entry => {
      formattedResponse += `  - From: ${entry.from}, To: ${entry.to}, Bearing: ${entry.bearing.toFixed(2)}, Distance: ${entry.distance}\n`;
      });
    });

res.setHeader('Content-Type', 'text/plain'); // Set content type to plain text
res.send(formattedResponse);
      // Delete the uploaded file after processing
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        } else {
          console.log('File has been deleted successfully.');
        }
      });
    } catch (error) {
      return res.status(400).send('Invalid JSON format.');
    }
  });
});

// Calculate bearing and distance for each combination of coordinates and titles
function calculateBearingAndDistance(points) {
  const result = {};

  for (const start of points) {
    const from = start.properties.title;
    result[from] = [];

    for (const next of points) {
      if (start !== next) {
        const bearing = geolib.getRhumbLineBearing(
          start.geometry.coordinates,
          next.geometry.coordinates
        );
        const distance = geolib.getDistance(
          start.geometry.coordinates,
          next.geometry.coordinates
        );
        const to = next.properties.title;

        result[from].push({
          from,
          to,
          bearing: Number(bearing.toFixed(2)), // Round bearing to 2 decimal places
          distance,
        });
      }
    }
  }

  return result;
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
