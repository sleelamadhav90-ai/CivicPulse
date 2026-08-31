const fs = require('fs');
const https = require('https');

https.get('https://raw.githubusercontent.com/divya-akula/GeoJson-Data-India/master/India_State_District.geojson', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('public/india_districts.geojson', data);
    console.log('GeoJSON downloaded successfully. Size:', data.length);
  });
}).on('error', (e) => {
  console.error(e);
});
