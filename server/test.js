import http from 'http';
const options = {
  hostname: 'localhost',
  port: 6001,
  path: '/users',
  method: 'GET'
};
const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  res.on('data', (d) => process.stdout.write(d));
});
req.on('error', (error) => console.error('Error:', error));
req.end();
