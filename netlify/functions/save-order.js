exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    var fields = JSON.parse(event.body);

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

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, id: data.id })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
