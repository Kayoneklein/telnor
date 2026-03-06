/*
  Please change url to reflect your server and layout
*/

if (typeof jslang === 'undefined')
{
  var jslang = {}; // Namespace
}

jslang.version = '1.0';
jslang.method = 'POST'; // Method to communicate with for the API
/*
jslang.defaulturldomain = 'https://pcrypt.org';
jslang.defaulturldomain = ''https://beast.dk/passdev_ibay
jslang.urlpath 			= '/lib/lang/'; // Server path to communicate with for the API
jslang.urlscript 		= 'languagedb.php'; // Server script to communicate with for the API

jslang.url 				= jslang.defaulturldomain + jslang.urlpath + jslang.urlscript; // Server script to communicate with for the API
*/

jslang.available = function (id, callback)
{
  jslang.internal('languages', null, null, null, id, callback);
}

jslang.strings = function (code, index, name, id, callback)
{
  jslang.internal('strings', code, index, name, id, callback);
}

jslang.internal = function (method, code, index, name, id, callback)
{
	var tmpObj = {};

	tmpObj.method = method;
	tmpObj.code = code;
	tmpObj.index = index;
	tmpObj.name = name;
	tmpObj.id = id;

	jslang.jsoncom(jslang.method, jslang.url, JSON.stringify(tmpObj), function(http)
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

        console.log("jslang.jsoncom parsing exception: " + e.message);

				return;
			}

			if(callback)
				callback(tmpObjreply.result, tmpObjreply.error, tmpObjreply.id);
      else
        console.log("jslang.jsoncom no callback specified");
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

      console.log("jslang.jsoncom http status error: " + http);
		}
	});
}

jslang.jsoncom = function (method, url, data, dofunc)
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
