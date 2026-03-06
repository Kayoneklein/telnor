/*
  Please change url to reflect your server and layout
*/

if (typeof jserror === 'undefined')
{
  var jserror = {}; // Namespace
}

jserror.version = '1.0';
jserror.method = 'POST'; // Method to communicate with for the API

/*
//jserror.urldomain = 'https://pcrypt.org'; // Server to communicate with for the API
jserror.urldomain = 'https://beast.dk/passdev_ibay'; // Server to communicate with for the API
jserror.urlpath = '/lib/jserror/'; // Server path to communicate with for the API
jserror.urlscript = 'jserror.php'; // Server script to communicate with for the API

jserror.url = jserror.urldomain + jserror.urlpath + jserror.urlscript; // Server script to communicate with for the API
*/

jserror.new = function (generator, msg, url, line, stack, useragent, language, id, callback)
{
	var tmpObj = {};

	tmpObj.generator = generator;
	tmpObj.msg = msg;
	tmpObj.url = url;
	tmpObj.line = line;
  tmpObj.stack = stack;
	tmpObj.useragent = useragent;
	tmpObj.language = language;
	tmpObj.id = id;

  console.log(tmpObj); // Also show it in the console

	jserror.jsoncom(jserror.method, jserror.url, JSON.stringify(tmpObj), function(http)
	{
		if(http.status == 200)
		{
			try
			{
				 var tmpObjreply = JSON.parse(http.responseText);
			}
			catch(e)
			{
				if(callback)
					callback('Exception in parsing: ' + e.message, 'jsonrpc', null);

        console.log("jserror.jsoncom parsing exception: " + e.message);

				return;
			}

			if(callback)
				callback(tmpObjreply.result, tmpObjreply.error, tmpObjreply.id);
      else
        console.log("jserror.jsoncom no callback specified");
		}
		else
		{
			if(callback)
			{
        if(typeof(http) == 'object')
          callback('HTTP returned status: ' + http.status, 'http', null);
        else if(typeof(http) == 'string')
          callback('HTTP returned string status: ' + http, 'http', null);
        else
          callback('HTTP returned unknown error,', 'http', null);
      }

      console.log("jserror.jsoncom http status error: " + http);
		}
	});
}

jserror.jsoncom = function (method, url, data, dofunc)
{
  try
	{
    var http = new XMLHttpRequest();

    http.open(method, url, true);

    //Send the proper header information along with the request
    http.setRequestHeader("Content-type", "application/json");

    http.onreadystatechange = function() // Call a function when the state changes.
    {
      if(dofunc)
      if(http.readyState == 4)
      {
        dofunc(http);
      }
    }
    http.send(data);
  }
  catch(e)
  {
    dofunc(e.message);
  }
}
