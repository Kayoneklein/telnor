var replyid = 0;
var hashvalue = '';

$(document).ready(function ()
{
  pcrypt.jsonrpc(pcrypt.urldomain + pcrypt.urlpath + 'lib/contact/contact.php', 'gethash', 'whitehat', {}, 0, function(result, error, id) 
  {
    if(error)
    {
      hashvalue = false;
      alert('Unable to retrieve hashvalue');
    }
    else
    {
      hashvalue = result.hash;
      replyid = parseInt(result.replyid);
    }
  });

  if(!document.getElementById('name'))
    return; // Needed when the confirmation or error is shown because many elements is not there

  if(validlogin())
  {
    document.getElementById('email').value = pcrypt.getvalue('email');
    document.getElementById('email').setAttribute('humanfocus', '1'); // for the human test
  }

  document.getElementById('name').onfocus = sethumanfocus;
  document.getElementById('email').onfocus = sethumanfocus;
  document.getElementById('contact-text').onfocus = sethumanfocus;

  document.getElementById('name').onkeydown = setnextfocus;
  document.getElementById('email').onkeydown = setnextfocus;

  document.getElementById('actionsubmitcontactform').onclick = function (event)
  {
    if(loader())
      return;

    loader(true);
    sendContact();
    loader(false);
  };

  loader(false);
});

function sethumanfocus(event)
{
  event.currentTarget.setAttribute('humanfocus', '1');
}

function posttourl(path, params, method)
{
    method = method || "post"; // Set method to post by default if not specified.

    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for(var key in params)
    {
        if(params.hasOwnProperty(key))
        {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();
}

function sendContact()
{
	var location = pcrypt.urldomain + pcrypt.urlpath + 'lib/contact/contact.php';
	var namefield = document.getElementById('name');
	var emailfield = document.getElementById('email');
	var textfield = document.getElementById('contact-text');
	// var hashvalue = document.getElementById('hashvalue').value;

  if(!hashvalue)
  {
    return; 
  }

	if(namefield.value.length == 0)
	{
        namefield.focus();
		modalalert(g.lang.contactjs.PCCONTACTMISSINGNAME, g.lang.default.PCPROGRAMTITLE);
		return;
	}

	if(!validemail(emailfield.value))
	{
        emailfield.focus();
		modalalert(g.lang.contactjs.PCCONTACTINVALIDEMAIL, g.lang.default.PCPROGRAMTITLE);
		return;
	}

	if(textfield.value.length == 0)
	{
        textfield.focus();
		modalalert(g.lang.contactjs.PCCONTACTMISSINGTEXT, g.lang.default.PCPROGRAMTITLE);
		return;
	}

	// Test for human actions
	var humanfocus = false;

	if((namefield.attributes.humanfocus)
	  && (emailfield.attributes.humanfocus)
      && (textfield.attributes.humanfocus))
    if((namefield.attributes.humanfocus.value == '1')
      && (emailfield.attributes.humanfocus.value == '1')
      && (textfield.attributes.humanfocus.value == '1'))
    humanfocus = true;

  if(humanfocus == false)
  {
    modalalert('All fields must have focus - mandatory for human input');
    return;
  }

  var name = pcrypt.utf8encode(namefield.value);
  var email = pcrypt.utf8encode(emailfield.value);
  var text = pcrypt.utf8encode(textfield.value);

	// Use cpu time and generate hash number
	hashnumber = generatehashcash(name + email + text, hashvalue);

	if(!hashnumber)
	{
    throw new Error('Unable to calculate hashcash number');
  }

  var params = {};
  params["name"] = urlencode(namefield.value);
  params["email"] = urlencode(emailfield.value);
  params["text"] = urlencode(textfield.value);
  params["number"] = urlencode(hashnumber);
  params["replyid"] = (replyid);

  pcrypt.jsonrpc(pcrypt.urldomain + pcrypt.urlpath + 'lib/contact/contact.php', 'submitcontactform', 'whitehat', params, 0, function(result, error, id) {
    if (typeof result.status != 'undefined') 
    {
      if (result.status == 1) 
      {
        $('#center-text').html(g.lang.contactjs.PCCONTACTCONFIRMATION); //'Thank you for your enquiry. We will get back to you shortly.
      }
    }
    if (error) 
    {
      $('#center-text').html('There was an error sending your enquiry. Please contact support at support@pcrypt.org with the following error message: ' + result);
    }
  });
}
