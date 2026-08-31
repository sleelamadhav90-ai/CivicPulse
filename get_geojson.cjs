const fs = require('fs');
const https = require('https');

https.get('https://raw.githubusercontent.com/Subhash9325/GeoJson-Data-of-Indian-States/master/Indian_States', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('public/india_states.geojson', data);
    console.log('GeoJSON downloaded successfully. Size:', data.length);
  });
}).on('error', (e) => {
  console.error(e);
});
