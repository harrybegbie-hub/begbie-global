// force redeploy 29apr
exports.handler = async function(event) {
exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
 
  try {
    var fields = JSON.parse(event.body);
    console.log('Received fields:', JSON.stringify(fields));
    console.log('Token present:', !!process.env.AIRTABLE_TOKEN);
    console.log('Token prefix:', process.env.AIRTABLE_TOKEN ? process.env.AIRTABLE_TOKEN.substring(0,10) : 'MISSING');
 
    var response = await fetch(
      'https://api.airtable.com/v0/app2lyNSjkuhDAhgK/Orders',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + process.env.AIRTABLE_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields: fields })
      }
    );
 
    var data = await response.json();
    console.log('Airtable response status:', response.status);
    console.log('Airtable response:', JSON.stringify(data));
 
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, id: data.id, airtableResponse: data })
    };
  } catch (err) {
    console.log('Error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
 
