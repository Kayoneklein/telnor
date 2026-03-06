/*
  Please change url to reflect your server and layout
*/

if (typeof jspremium === 'undefined')
{
  var jspremium = {}; // Namespace
}

jspremium.version = '1.0';
jspremium.method = 'POST'; // Method to communicate with for the API

/*
//jspremium.urldomain = 'https://pcrypt.org'; // Server to communicate with for the API
jspremium.urldomain = 'https://beast.dk/passdev_ibay'; // Server to communicate with for the API
jspremium.urlpath = '/lib/premium/'; // Server path to communicate with for the API
jspremium.urlscript = 'premium.php'; // Server script to communicate with for the API

jspremium.url = jspremium.urldomain + jspremium.urlpath + jspremium.urlscript; // Server script to communicate with for the API
*/

/*
[Description]
Set language used in e-mails for notification etc.

[Parameters]
payinfo: json structure for all fields:
  cardexpmonth,
  cardexpyear
  cardnumber
  city
  company
  country
  lastpaydate
  repaydate
  state
  street
  subscriptionid
  vat
  zip
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: True on success
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/

jspremium.sessionvalues = function (session, payid, payperiod, renew, code, id, callback)
{
	var argn = arguments.length, arge = 9;
  if((argn > arge) || (argn < (arge-2))) console.log('Wrong number of parameters [' + argn + '] in premium API: ' + new Error().stack);

  jspremium.internal('sessionvalues', session, {payid: payid, payperiod: payperiod, renew: renew, code: code}, id, callback);
};

jspremium.createpay = function (session, payinfo, id, callback)
{
	var argn = arguments.length, arge = 4;
  if((argn > arge) || (argn < (arge-2))) console.log('Wrong number of parameters [' + argn + '] in premium API: ' + new Error().stack);

  jspremium.internal('createpremiumpay', session, {payinfo: payinfo}, id, callback);
};

jspremium.editpay = function (session, payid, payinfo, id, callback)
{
	var argn = arguments.length, arge = 5;
  if((argn > arge) || (argn < (arge-2))) console.log('Wrong number of parameters [' + argn + '] in premium API: ' + new Error().stack);

  jspremium.internal('editpremiumpay', session, {payid: payid, payinfo: payinfo}, id, callback);
};

jspremium.createurl = function (session, payid, url, urlnumber, id, callback)
{
	var argn = arguments.length, arge = 6;
  if((argn > arge) || (argn < (arge-2))) console.log('Wrong number of parameters [' + argn + '] in premium API: ' + new Error().stack);

  jspremium.internal('createpremiumurl', session, {payid: payid, url: url, urlnumber: urlnumber}, id, callback);
};

jspremium.editurl = function (session, urlid, payid, url, urlnumber, id, callback)
{
	var argn = arguments.length, arge = 7;
  if((argn > arge) || (argn < (arge-2))) console.log('Wrong number of parameters [' + argn + '] in premium API: ' + new Error().stack);

  jspremium.internal('editpremiumurl', session, {urlid: urlid, payid: payid, url: url, urlnumber: urlnumber}, id, callback);
};

jspremium.deleteurl = function (session, urlid, id, callback)
{
	var argn = arguments.length, arge = 4;
  if((argn > arge) || (argn < (arge-2))) console.log('Wrong number of parameters [' + argn + '] in premium API: ' + new Error().stack);

  jspremium.internal('deletepremiumurl', session, {urlid: urlid}, id, callback);
};

jspremium.get = function (session, id, callback)
{
	var argn = arguments.length, arge = 3;
  if((argn > arge) || (argn < (arge-2))) console.log('Wrong number of parameters [' + argn + '] in premium API: ' + new Error().stack);

  jspremium.internal('getpremium', session, {}, id, callback);
};

jspremium.pay = function (session, payid, amount, tag, promoCode, id, callback)
{
	var argn = arguments.length, arge = 7;
  if((argn > arge) || (argn < (arge-2))) console.log('Wrong number of parameters [' + argn + '] in premium API: ' + new Error().stack);

  jspremium.internal('paypremium', session, {payid: payid, amount: amount, tag: tag, code: promoCode}, id, callback);
};

jspremium.valid = function (session, email, id, callback)
{
	var argn = arguments.length, arge = 4;
  if((argn > arge) || (argn < (arge-2))) console.log('Wrong number of parameters [' + argn + '] in premium API: ' + new Error().stack);

  jspremium.internal('validpremium', session, {email: email}, id, callback);
};

jspremium.giftcardvalid = function (session, code, id, callback)
{
  var argn = arguments.length, arge = 4;
  if((argn > arge) || (argn < (arge-2))) console.log('Wrong number of parameters [' + argn + '] in premium API: ' + new Error().stack);

  jspremium.internal('giftcardvalid', session, {code: code}, id, callback);
};

jspremium.internal = function (method, session, data, id, callback)
{
	var tmpObj = {};

  tmpObj.authsession = session;
  tmpObj.method = method;
	tmpObj.data = data;
	tmpObj.id = id;

	jspremium.jsoncom(jspremium.method, jspremium.url, JSON.stringify(tmpObj), function(http)
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

        console.log("jspremium.jsoncom parsing exception: " + e.message);

				return;
			}

			if(callback)
				callback(tmpObjreply.result, tmpObjreply.error, tmpObjreply.id);
      else
        console.log("jspremium.jsoncom no callback specified");
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

      console.log("jspremium.jsoncom http status error: " + http);
		}
	});
};

jspremium.jsoncom = function (method, url, data, dofunc)
{
  try
	{
    var http = new XMLHttpRequest();

    http.open(method, url + '?time=' + new Date().getTime(), true);

    // We can not accept cache on this request
    http.setRequestHeader('cache-control', 'no-cache, must-revalidate, post-check=0, pre-check=0');
    http.setRequestHeader('cache-control', 'max-age=0');
    http.setRequestHeader('expires', '0');
    http.setRequestHeader('expires', 'Tue, 01 Jan 1980 1:00:00 GMT');
    http.setRequestHeader('pragma', 'no-cache');

    //Send the proper header information along with the request
    http.setRequestHeader("Content-type", "application/json");

    http.onreadystatechange = function() // Call a function when the state changes.
    {
      if(dofunc)
      {
        if ( http.readyState == 4 )
        {
          dofunc( http );
        }
      }
    };
    http.send(data);
  }
  catch(e)
  {
    dofunc(e.message);
  }
};
