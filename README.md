# CalTopo-Bearings-JS

- Basic UI for uploading GeoJSON formatted CalTopo exports
- Parses class "Marker"
- Calculates bearing and distance recursively through all iterations of parsed Markers

## Usage

1. Export your CalTopo map as GeoJSON file
2. Upload JSON file to interface

## Setup

### From Repo

1. `npm install`
2. `node app.js`
3. Service default runs on (http://localhost:8080)[http://localhost:8080]

### From Dockerfile

1. `docker build -t calbear:latest .`
2. `docker run --name calbear --rm -p 8080:8080 -d calbear:latest`
3. Service default runs on (http://localhost:8080)[http://localhost:8080]