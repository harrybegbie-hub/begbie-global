const https = require('https');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    var fields = JSON.parse(event.body);
    var token = process.env.AIRTABLE_TOKEN;
    var payload = JSON.stringify({ fields: fields });

    var result = await new Promise(function(resolve, reject) {
      var options = {
        hostname: 'api.airtable.com',
        path: '/v0/app2lyNSjkuhDAhgK/Orders',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      var req = https.request(options, function(res) {
        var body = '';
        res.on('data', function(chunk) { body += chunk; });
        res.on('end', function() { resolve({ status: res.statusCode, body: body }); });
      });

      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, airtable: result.status })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
