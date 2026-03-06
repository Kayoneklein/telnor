"use strict";

var gpcrypt = {}; // Global name space

gpcrypt.basefolder = pcrypt.urldomain + pcrypt.urlpath + "lib/other/";
gpcrypt.sgid =
{
  "undef" : "0",
  "all" : "-1",
  "loc" : "-2",
  "own" : "-3",
  "outshare" : "-4", // shared by me
  "inshare" : "-5", // shared to me
  "newshare" : "-6", // newly shared passwords.
  "security" : "-7", // Security check of password values
  "alarm" : "-8", // Alarm date is before now for a password
  "shares" : "-100" // Specific user shares
}; // special group ids

function validatecryptoperation(dataarray) 
{
  let returnvalue = true;

  for (let i = dataarray.length - 1; i >= 0 ; i--) 
  {
    if(Array.isArray(dataarray[i]))
    {
      returnvalue = validatecryptoperation(dataarray[i]); 
    }
    else
    {
      if(dataarray[i] === false)
      {
        returnvalue = false;
        console.log('Crypt error at index: ' + i);
        dataarray.remove(i);
      }
    }
  }
  return returnvalue;
}

// This is to handle encrypt/decrypt in a worker (message return handling)
pcrypt.workermessages(function workercallback(evt)
{
  //console.log(evt.data);
  pcrypt.workercall({method: 'spinner_response', value: true});
  switch(evt.data.method)
  {
    case 'response':
    {
      validatecryptoperation(evt.data.value); // We need to test for errors in the decrypt/encrypt procedure (false is returned)

      switch(evt.data.id)
      {
        case "updatekeybinarydecrypt": // Used when we update the password
        {
          pcrypt.workercall({method: 'encrypt', id: 'updatekeybinaryencrypt', param: evt.data.param, filedata: evt.data.value, keydata: pcrypt.getvalue('newkeycrypt')});
        }
        break;

        case "updatekeybinaryencrypt":
        case 'storefilesandshare':
        case 'storefiles':
        {
          pcrypt_setbinary(pcrypt.getvalue('session'), evt.data.param, evt.data.value, 0, function setbinaryfunc(data, error, id)
          { 
            if(error)
            { 
              switch(error)
              {
                case 23:
                  alert('The server config is not in sync with the client config for max file size:' + data);
                break;

                default:     
                  handlepcrypterror(error, data);
                break;
              }
              return;
            }

            if(evt.data.id == 'storefilesandshare') // If this is true we now have to share data and files
            {
              buildShareData(g.pass, g.teamobject, true); // In this case we know that there are new files
            }
            
            if(evt.data.id == 'updatekeybinaryencrypt') // This is needed when we change master password
            {
              postMessage({method: 'nextupdatekeybinary_response', value: 'test'});
            }
          });
        }
        break;

        case "buildsharedatabinarydecrypt":
        {
          // Decryption is done and we need to encrypt the data 
          // We have to build a special structure for the keys  

          let userfiledata = evt.data.value;
          let usernewfiles = evt.data.param.user.newfiles;

          if(usernewfiles.length)
          {
            if(usernewfiles.length !== userfiledata.length)
            {
              console.log("Files available and user file shares does not have same size");
            }

            let userkeydata = new Array(userfiledata.length);

            for(let f = 0, len_f = userkeydata.length; f < len_f; f++) // f = file
            {
              if(!usernewfiles[f] || !Array.isArray(usernewfiles[f].sharekeys))
              {
                console.log("Invalid file index: " + f);
                userkeydata[f] = false;
                continue;
              }

              userkeydata[f] = new Array(usernewfiles[f].sharekeys.length);

              for(let k = 0, len_k = usernewfiles[f].sharekeys.length; k < len_k; k++) // k = key
              {
                if(!usernewfiles[f].sharekeys[k])
                {
                  console.log("Invalid share index: " + k);
                  userkeydata[f][k] = false;
                  continue;
                }

                userkeydata[f][k] = usernewfiles[f].sharekeys[k]
              }
            }

            pcrypt.workercall({method: 'encrypt', id: 'buildsharedatabinaryencryptuser', param: evt.data.param, filedata: userfiledata, keydata: userkeydata});
          }
          else
          {
            // In case there is no new files we just call worker thread to get to save response
            pcrypt.workercall({method: 'encrypt', id: 'buildsharedatabinaryencryptuser', param: evt.data.param, filedata: false, keydata: false});
          }

          // Now handle team files

          let teamnewfiles = evt.data.param.team.newfiles;

          if(teamnewfiles.length)
          {
            let teamfiledata = evt.data.value;

            if(teamnewfiles.length !== teamfiledata.length)
            {
              console.log("Files available and team file shares does not have same size");
            }

            let teamkeydata = new Array(teamfiledata.length);

            for(let f = 0, len_f = teamkeydata.length; f < len_f; f++) // f = file
            {
              if(!teamnewfiles[f] || !Array.isArray(teamnewfiles[f].sharekeys))
              {
                console.log("newfiles index is not valid: " + f);
                continue;
              }

              teamkeydata[f] = new Array(teamnewfiles[f].sharekeys.length);

              for(let k = 0, len_k = teamnewfiles[f].sharekeys.length; k < len_k; k++) // k = key
              {
                teamkeydata[f][k] = teamnewfiles[f].sharekeys[k]
              }
            }

            pcrypt.workercall({method: 'encrypt', id: 'buildsharedatabinaryencryptteam', param: evt.data.param, filedata: teamfiledata, keydata: teamkeydata});
          }
          else
          {
            // In case there is no new files we just call worker thread to get to save response
            pcrypt.workercall({method: 'encrypt', id: 'buildsharedatabinaryencryptteam', param: evt.data.param, filedata: false, keydata: false});
          }
        }
        break;

        case "buildsharedatabinaryencryptuser":
        {
          // Encryption for users are done and we need to store the data

          let newfiles = evt.data.param.user.newfiles;
          let nodelsource = evt.data.param.user.nodelsource;
          let filedata = evt.data.value;

          if(newfiles.length || Object.keys(nodelsource).length)
          {
            let toid = [];
            //let dataname = [];
            let sourcename = [];
            let datastring = [];

            newfiles.forEach(function (file, findex)
          	{
              file.fileids.forEach(function (name, nindex)
            	{
                if(filedata[findex] && filedata[findex][nindex] !== false)
                {
                  toid.push(file.toids[nindex]);
                  sourcename.push(file.fileids[nindex]);
                  datastring.push(filedata[findex][nindex]);
                }
                else
                {
                  console.log('Unable to store shared file (file list index error)');
                }
            	});
          	});
          
            // Save data (may also delete some)
            pcrypt_teamsetbinary(pcrypt.getvalue('session'), toid, sourcename, datastring, nodelsource, 0, function setbinaryfunc(data, error, id)
            {
              if(error)
              { 
                switch(error)
                {
                  case 23:
                    alert('The server config is not in sync with the client config for max file size:' + data);
                  break;

                  default:     
                    handlepcrypterror(error, data);
                  break;
                }
                return;
              }
            });
          }
        }
        break;

        case "buildsharedatabinaryencryptteam":
        {
          // Encryption for teams are done and we need to store the data

          let newfiles = evt.data.param.team.newfiles;
          let nodelsource = evt.data.param.team.nodelsource;
          let filedata = evt.data.value;

          if(newfiles.length || Object.keys(nodelsource).length)
          {
            let teamid = [];
            let keyid = [];
            let sourcename = [];
            let datastring = [];

            newfiles.forEach(function (file, findex)
            {
              file.teamids.forEach(function (id, nindex)
              {
                if(filedata[findex] && filedata[findex][nindex] !== false)
                {
                  teamid.push(id);
                  keyid.push(file.keyids[nindex]);
                  //dataname.push(name);
                  sourcename.push(file.fileids[nindex]);
                  datastring.push(filedata[findex][nindex]);
                }
                else
                {
                  console.log('Unable to store shared file (file list index error)');
                }
              });
            });
          
            // Save data (may also delete some)
            //pcrypt_teamsetteambinary(pcrypt.getvalue('session'), teamid, keyid, sourcename, dataname, datastring, nodelsource, 0, function setteambinaryfunc(data, error, id)
            pcrypt_teamsetteambinary(pcrypt.getvalue('session'), teamid, keyid, sourcename, datastring, nodelsource, 0, function setteambinaryfunc(data, error, id)
            {
              if(error)
              { 
                switch(error)
                {
                  case 23:
                    alert('The server config is not in sync with the client config for max file size:' + data);
                  break;

                  default:     
                    handlepcrypterror(error, data);
                  break;
                }
                return;
              }
            });
          }
        }  
        break;
      }
    }
    break;
  }
});

function validatedataarray(dataarr, validatefunc)
{
  if(!Array.isArray(dataarr))
    return false;

  for (var i = dataarr.length - 1; i >= 0; i--)
  {
    if(typeof dataarr[i] === 'object')
    {
      //validatefunc(dataarr[i], dataarr);
      validatefunc(dataarr[i]);
    }
    else
    {
      dataarr.remove(i);
    }
  }
}

function validatepass(pass)
{  
  if(typeof(pass.id) != 'string')
    pass.id = randomString(pcrypt.randomidlength);

  if(typeof(pass.cre) != 'number')
		pass.cre = (new Date()).getTime();

	if(typeof(pass.upd) != 'number')
		pass.upd = (new Date()).getTime();
    
  // We have to maintain backward compability so we only change type
  if(Array.isArray(pass.gid) != true)
  {
    switch(typeof pass.gid)
    {
      default:
        pass.gid = [];
      break;

      case 'number':
        pass.gid = [pass.gid.toString()];
      break;

      case 'string':
        pass.gid = [pass.gid];
      break;
    }
  }
  else
  {
    pass.gid.forEach((groupId, index) => 
    {
      if(groupId && typeof groupId != 'string')
      {
        pass.gid[index] = groupId.toString();
      }
    });
  }  

	if(typeof(pass.name) != 'string')
		if(pass.name) pass.name = pass.name.toString();
		else pass.name = '';

	if(typeof(pass.user) != 'string')
		if(pass.user) pass.user = pass.user.toString();
		else pass.user = '';

	if(typeof(pass.pass) != 'string')
		if(pass.pass) pass.pass = pass.pass.toString();
		else pass.pass = '';

	if(typeof(pass.url) != 'string')
		if(pass.url) pass.url = pass.url.toString();
		else pass.url = '';

	if(pass.url.length)
	{
		pass.url = pass.url.replace(/ /g,'');    // remove space

		if(pass.url.indexOf('://') === -1)
			pass.url = 'http://' + pass.url;
	}

  if(typeof pass.urlpath != 'boolean')
    if(pass.urlpath) pass.urlpath = (pass.urlpath === 'true') ? true : false;
    else pass.urlpath = false;

	if(typeof(pass.note) != 'string')
		if(pass.note) pass.note = pass.note.toString();
		else pass.note = '';

  if(!Array.isArray(pass.pos))
    pass.pos = [];
  else
    validatedataarray(pass.pos, validatepasspos);

	if(!Array.isArray(pass.files))
	  pass.files = [];

  if(typeof(pass.alarm) != 'number')
    pass.alarm = null;

  // validatepassfiles(files)

	if(Array.isArray(pass.shares) || (typeof(pass.shares) !== 'object'))
    pass.shares = {};

  if(pass.sharechanges) // Not allowed after sharing
    delete pass.sharechanges;

  // validatepassshares(shares)

	if(pass.name.length > 64)
		pass.name = pass.name.substring(0, 63);
	if(pass.user.length > 64)
		pass.user = pass.user.substring(0, 63);
	if(pass.pass.length > 64)
		pass.pass = pass.pass.substring(0, 63);
	if(pass.url.length > 256)
		pass.url = pass.url.substring(0, 255);
	if(pass.note.length > 8096)
    pass.note = pass.note.substring(0, 8095);
  if(pass.pos.length > pcrypt.posmax)
    pass.pos.length = pcrypt.posmax;
  if(pass.files.length > pcrypt.filemax)
    pass.files.length = pcrypt.filemax;

	return true;
}

function validatepasspos(locinfo)
{  
  if(typeof locinfo != "object" || Array.isArray(locinfo))
    locinfo = {};

  if(Number(locinfo.lat) < -90)
    locinfo.lat = "-90";

  if(Number(locinfo.lat) > 90)
    locinfo.lat = "90";

  if(Number(locinfo.long) < -180)
    locinfo.long = "-180";

  if(Number(locinfo.long) > 180)
    locinfo.long = "180";

  if(typeof locinfo.lat != "string") 
      locinfo.lat = locinfo.lat.toString();

  if(typeof locinfo.long != "string") 
      locinfo.long = locinfo.long.toString();

  if(isNaN(locinfo.acc))
    locinfo.acc = "1";

  locinfo.acc = Math.round(locinfo.acc).toString();

  if(!locinfo.text || typeof locinfo.text != "string")
    locinfo.text = locinfo.lat + "," + locinfo.long + "," + locinfo.acc;
  else if(locinfo.text.length > 64)
    locinfo.text = locinfo.text.substring(0, 63);

  if(locinfo.lat.length > 16)
    locinfo.lat = locinfo.lat.substring(0, 15);

  if(locinfo.long.length > 16)
    locinfo.long = locinfo.long.substring(0, 15);

  if(locinfo.long.length > 16)
    locinfo.long = locinfo.long.substring(0, 15);
}

function validatepassfiles(files)
{
  // TODO
}

function validatepassshares(shares)
{
  // TODO
}

function validategroup(group)
{		
	if(typeof(group.id) != 'string')
  {
    if(typeof(group.id) != 'number' || group.id < 0)
    {
      group.id = randomString(pcrypt.randomidlength);
    }
    else
    {
      // We have to maintain backward compability so we only change type
      group.id = group.id.toString();
    }
  }

  if(typeof(group.cre) != 'number')
		group.cre = (new Date()).getTime();

	if(typeof(group.upd) != 'number')
		group.upd = (new Date()).getTime();

	if(typeof(group.name) != 'string')
		if(group.name) group.name = group.name.toString();
		else group.name = '';

	if(group.name.length > 64)
		group.name = group.name.substring(0, 63);

	return true;
}

function validatemail(mail)
{
	if(!mail.data || typeof(mail.data) != 'object') // Seen that it can be false if decrytion fails
	  mail.data = {};

	if(typeof(mail.data.cre) != 'number')
		mail.data.cre = (new Date()).getTime();

  if(Array.isArray(mail.data.shares) || (typeof(mail.data.shares) !== 'object'))
	  mail.data.shares = {};

	if(typeof(mail.data.sub) != 'string')
		if(mail.data.sub) mail.data.sub = mail.data.sub.toString();
		else mail.data.sub = '';

  if(typeof(mail.data.note) != 'string')
		if(mail.data.note) mail.data.note = mail.data.note.toString();
		else mail.data.note = '';

	if(mail.data.sub.length > 64)
		mail.data.sub = mail.data.sub.substring(0, 63);

	if(mail.data.note.length > 8096)
    mail.data.note = mail.data.note.substring(0, 8095);

  //callback(true);

	return true;
}


function groupidisvalid(gid, dbgarray, dbsarray)
{
	if(gid.length > 0)
	{
    if(dbgarray)
    {
      for (var i = 0, len_i = dbgarray.length; i < len_i; ++i)
      {
        for(var j = 0, len_j = gid.length; j < len_j; j++)
        {
          if(dbgarray[i].id == gid[j])
            return true;
        } 
	    }
	  }
  }
	else
	{
	  if(dbsarray)
	  {
      for (var i = 0, len_i = dbsarray.length; i < len_i; ++i)
      {
        var sharegid = -(dbsarray[i].userid) + gpcrypt.sgid.shares;
        for(var j = 0, len_j = gid.length; j < len_j; j++)
        {
          if(sharegid == gid[j])
            return true;
        } 

	    }
	  }
	}

	return false;
}

function showthispasstext(pass, searchtext)
{
  if ((typeof searchtext !== "string") || (searchtext.length == 0))
    return false;

  var keys = Object.keys(pass);

  for (var i = 0, i_len = keys.length ; i < i_len ; i++)
  {
    var val = pass[keys[i]];

    if ((typeof val == "string") && (val.toLowerCase().indexOf(searchtext.toLowerCase()) !== -1))
      return true;
  }

  return false;
}

function showthispassgid(gid, pass, sharearray, grouparray, locinfo, currenttime, teamobject)
{
  switch(gid)
	{
	  case gpcrypt.sgid.all:
	    return true;
	  break;

	  case pass.gid[0]:
	    return true;
    break;
    
    case pass.gid[1]:
      return true;
    break;

    case pass.gid[2]:
      return true;
    break;

	  case gpcrypt.sgid.own:
	    if(pass.passindex !== undefined) // pass.passindex exists only for passwords created by the user
	      return true;
	  break;

	  case gpcrypt.sgid.inshare:
	    if(pass.share !== undefined)
	      return true;
	  break;

	  case gpcrypt.sgid.outshare:
      if((typeof pass.shares === 'object') && (!Array.isArray(pass.shares))) // Simple test for object
      {
        var keys = Object.keys(pass.shares); // Keys is now an array of userids that we share this with
        var keyslength = keys.length;

        // Need to test that at least 1 users are still in the team so run through all shares
        for (var i = 0, i_len = keys.length ; i < i_len ; i++)
        {
          if(teamobject[keys[i]])
            return true;
        }
      }
	  break;

	  case gpcrypt.sgid.undef:
	    if(!groupidisvalid(pass.gid, grouparray, sharearray))
	      return true;
    break;
    
	  case gpcrypt.sgid.newshare:
      if (pass.share && !!pass.share.change) 
      {
        return true;
      }
	  break;


	  case gpcrypt.sgid.loc:
	    if(locinfo && locationarrayatpoint(pass.pos, locinfo.lat, locinfo.long, locinfo.acc))
	      return true;
    break;

    case gpcrypt.sgid.security:
      
      if(pass.passindex === undefined || pass.passindex === null) // Only passwords created by the user has the passindex value.
      {
        return false;
      }

      if(!pass.pass || pass.pass.length<1)
      {
        return false;
      }

      var occurrenceTest = false;
      var reoccurring = getPassOccurrence(g.pass);
      if(reoccurring.length>1)
      {
        for(var i = 0; i < reoccurring.length; i++)
        {
          if(reoccurring[i].pass == pass.pass && reoccurring[i].count > 1)
          {
            occurrenceTest = true;
            i = reoccurring.length;
          }
        }

        if(occurrenceTest)
        {
          return true;
        }
      }
      
      if(passwordstrength(pass.pass)<3)
      {
        return true;
      }

    break;

    case gpcrypt.sgid.alarm:
      
      if(pass.alarm && (pass.alarm <= currenttime))
      {
        return true;
      }

    break;
    
  }
	return false;
}
/**
 * @description Check if a pass.share is 'undefined' and related to the chosen g.gidshown value.
 * If true it should return a boolean of true
 * @param {String} pass The password in question being tested
 * @returns {boolean} true if a share value can be found equal to the g.gidshown.
 */
function showThisOutshare(pass)
{
  var isValid = false;
  
  for(var i = 0; i<pass.gid.length; i++)
  {
    if(pass.gid[i] === Number(g.gidshown))
    {
      isValid = true;
    }
  }

  if(pass.shares)
  {
    for(var key in pass.shares)
    { 
      if(key !== 'undefined')
      {
        if(parseInt(key, 10) == Math.abs(Number(g.gidshown)+100))
        {
          isValid = true;
        }
      }
    }
  }

  return isValid;
}

function getlanguage(newlangcode, callback)
{
  var lang = pcrypt.jsonparse(localStorage['language']);
  var langavail = pcrypt.jsonparse(localStorage['languageavail']);
  var langcode = localStorage['languagecode'];
  var langver = localStorage['languagever'];
  var langtime = Number(localStorage['languagetime']);
  var curtime = (new Date()).getTime();
  var update = false;

  try
  {
    if((typeof lang !== "object") || (Object.keys(lang).length == 0))
      update = true;

    if((typeof langavail !== "object") || (Object.keys(langavail).length == 0))
      update = true;

    if(!langcode || (typeof langcode !== "string"))
      update = true;

    if(curtime > (langtime + 2592000000))
      update = true;

    if(langver == '')
      update = true;

    if(newlangcode)
      update = true;
  }
  catch(err)
  {
    update = true;
  }

  if(!update)
  {
    pcrypt.setvalue('languagecode', langcode, false);
    callback(lang, langcode, langavail, update);

    // Test if we already have made this test in this session
    if(!pcrypt.existvalue('languagever'))
    {
      // Test if there is a new version - and mark language for update
      jslang.strings(langcode, 'default', 'VERSION', 0, function languagecallback(data, error, id)
      {
        if(error)
        {
          console.log(error, data); // may because of missing internet connection (not so important)
          return;
        }

        // Set value as indication that the test have been made
        pcrypt.setvalue('languagever', data.default.VERSION, false);

        if(langver != data.default.VERSION)
        {
          console.log('Pcrypt language update requested');
          localStorage['languagever'] = ''; // just erase the text to update
          location.reload(true); // TODO - We also like to refresh cache while we are at it
        }
      });
    }
  }
  else
  {
    if(newlangcode && (typeof newlangcode === "string"))
    {
      langcode = newlangcode;
    }
    else if(typeof langcode !== "string")
    {
      langcode = navigator.language || navigator.userLanguage;
    }

    jslang.available(0, function(availlang, error, id)
    {
      if(error)
      {
        handlepcrypterror(error, availlang);
        callback(false, false, false, false);
        return;
      }

      if(!availlang[langcode])
      {
        if(langcode.length > 2) // test if we have major code and use this
        {
          langcode = langcode.substring(0, 2);

          if(!availlang[langcode])
            langcode = 'en';
        }
      }

      jslang.strings(langcode, null, null, 0, function languagecallback(data, error, id)
      {
        if(error)
        {
          handlepcrypterror(error, data);
          callback(false, false, false, false);
          return;
        }

        console.log('Pcrypt language updated');

        localStorage['language'] = pcrypt.jsonstringify(data);
        localStorage['languageavail'] = pcrypt.jsonstringify(availlang);
        localStorage['languagecode'] = langcode;
        localStorage['languagetime'] = curtime;
        localStorage['languagever'] = data.default.VERSION;
        pcrypt.setvalue('languagecode', langcode, false);
        pcrypt.setvalue('languagever', data.default.VERSION, false);
        callback(data, langcode, availlang, update);
      });
    });
  }

  return {language: langcode, update: update};
}

function validlogin() // user may have opened a new tab (not legal as it erases sessionStorage for the new tab)
{
  var session = false;

  if(pcrypt.existvalue('session'))
  {
    session = pcrypt.getvalue('session');
  }

	if(session)
    return true;
  else
    return false;
}

function validdomain(domain, element)
{
  //var domainPattern = /^(?!.*?_.*?)(?!(?:[\d\w]+?\.)?\-[\w\d\.\-]*?)(?![\w\d]+?\-\.(?:[\d\w\.\-]+?))(?=[\w\d])(?=[\w\d\.\-]*?\.+[\w\d\.\-]*?)(?![\w\d\.\-]{254})(?!(?:\.?[\w\d\-\.]*?[\w\d\-]{64,}\.)+?)[\w\d\.\-]+?(?<![\w\d\-\.]*?\.[\d]+?)(?<=[\w\d\-]{2,})(?<![\w\d\-]{25})$/;
  
  // This works on safari
  var domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/

  if(domainPattern.test(String(domain).toLowerCase()))
  {
    if(element && element.style)
      element.style.backgroundColor = 'rgba(77, 165, 255, 0.19)';
    return true;
  }
  else
  {
    if(element && element.style)
      element.style.backgroundColor = '';
    return false;
  }
}

function validemail(email, element)
{
	var emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  
	if(emailPattern.test(String(email).toLowerCase()))
	{
	  if(element && element.style)
		  element.style.backgroundColor = 'rgba(77, 165, 255, 0.19)';
	  return true;
	}
	else
	{
	  if(element && element.style)
		  element.style.backgroundColor = '';
	  return false;
	}
}

function passwordstrength(pass, element)
{
	// thanks to tm_lv http://stackoverflow.com/a/11268104/329496

	if ((typeof pass !== 'string') || (pass.length == 0))
	{
		if(element && element.style)
		  element.style.backgroundColor = '';
		return 0; // length is zero (empty)
	}

	if (pass.length < pcrypt.passwordminimumlength)
	{
		if(element && element.style)
		  element.style.backgroundColor = '';
		return 1; // too short
	}

  var score = 0;

  // award every unique letter until 5 repetitions
  var letters = new Object();
  for (var i=0; i<pass.length; i++)
  {
      letters[pass[i]] = (letters[pass[i]] || 0) + 1;
      score += 5.0 / letters[pass[i]];
  }

  // bonus points for mixing it up
  var variations =
  {
      digits: /\d/.test(pass),
      lower: /[a-z]/.test(pass),
      upper: /[A-Z]/.test(pass),
      nonWords: /\W/.test(pass),
  }

  var variationCount = 0;
  for (var check in variations)
  {
      variationCount += (variations[check] == true) ? 1 : 0;
  }

  score += (variationCount - 1) * 10;

  if(score < pcrypt.passwordgoodqualityscore)
  {
    if(element && element.style)
		  element.style.backgroundColor = '#fbffde';
    return 2; // must be a weak password
  }

  if(element && element.style)
    element.style.backgroundColor = 'rgba(77, 165, 255, 0.19)';
  return 3; // strong password
}

function setnextfocus(event)
{
  if (event.keyCode == 13)
  {
    event.preventDefault();
    document.getElementById(event.currentTarget.getAttribute('nextfocus')).focus();
    return false;
  }
}

function shufflearray(array)
{
    var i = array.length;
    var randomseeds = pcrypt_randombytes(i);
    var temp;
    var j;

    while (i--)
    {
        j = Math.floor((randomseeds.charCodeAt(i) / (256)) * (i+1));

        // swap randomly chosen element with current element
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function randomString(length, options)
{
	// We avoid 0oO (user unable to see the diff)
	// Unique ID's need a length of 22 char when using default options to be colission secure according to RFC 4122 (only 59 chars to select from)
	var ualphas = "ABCDEFGHIJKLMNPQRSTUVWXTZ"; //25
	var lalphas = "abcdefghijklmnpqrstuvwxyz"; //25
	var numbers = "123456789"; //9
	var specials = "()!@#$%&*=\/<>+-_{}[]:;?"; // 24 - Do not use " or ' as this can give problems with html display or replaced by htmlspecialchars
	var chars = "";
	var stringindex;
	var randomarray = [];

	if(!length || length < 4)
    length = 4;

  var randomseeds = pcrypt_randombytes(length);

  if (typeof options !== 'object')
  {
    options = {};
    options.lalphas = true;
    options.ualphas = true;
    options.numbers = true;
    options.specials = false;
  }

  if(options.lalphas)
  {
    stringindex = Math.floor((randomseeds.charCodeAt(randomarray.length) / (256)) * lalphas.length);
    randomarray.push(lalphas.charAt(stringindex));
    chars += lalphas;
  }

  if(options.ualphas)
  {
    stringindex = Math.floor((randomseeds.charCodeAt(randomarray.length) / (256)) * ualphas.length);
    randomarray.push(ualphas.charAt(stringindex));
    chars += ualphas;
  }

  if(options.numbers)
   {
    stringindex = Math.floor((randomseeds.charCodeAt(randomarray.length) / (256)) * numbers.length);
    randomarray.push(numbers.charAt(stringindex));
    chars += numbers;
  }

  if(options.specials)
   {
    stringindex = Math.floor((randomseeds.charCodeAt(randomarray.length) / (256)) * specials.length);
    randomarray.push(specials.charAt(stringindex));
    chars += specials;
  }

  for(var i = randomarray.length, i_len = randomseeds.length ; i < i_len ; i++)
	{
    stringindex = Math.floor((randomseeds.charCodeAt(i) / (256)) * chars.length);
    randomarray[i] = chars.charAt(stringindex);
	}

	randomarray = shufflearray(randomarray);

	return randomarray.join(''); // faster this way for long strings
}

/**
 * 
 * @param {*} parentelem 
 * @param {*} readonly 
 */
function toggledisabled(parentelem, readonly)
{
  var allChildNodes = document.getElementById(parentelem).getElementsByTagName('*');
  var hidelist = document.getElementsByClassName("alwayshide");

  if(hidelist)
  for(var i = 0; i < hidelist.length; i++)
  {
    if(readonly)
      hidelist[i].classList.add("disable");
    else
      hidelist[i].classList.remove("disable");
  }

  for(var i = 0; i < allChildNodes.length; i++)
  {
    var element = allChildNodes[i];

    if(element.classList.contains('alwaysshow'))
      continue;

    switch(element.tagName)
    {
      default:
        element.disabled = readonly;
      break;

      case 'OPTION':
        var parent = element.parentElement;
        if(parent.classList.contains('alwaysshow'))
          continue;
        element.readOnly = readonly;
      break;

      case 'SELECT':
        element.readOnly = readonly;
      break;

      case 'IMG':
        if(readonly)
          element.classList.add("disable");
        else
          element.classList.remove("disable");
      break;

      case 'INPUT':
        switch(element.type)
        {
          default:
            element.readOnly = readonly;
          break;

          case 'button':
            if(readonly)
              element.classList.add("disable");
            else
              element.classList.remove("disable");
          break;

          case 'file':
            if(readonly)
            {
              element.classList.add('disable');
              element.disabled = true;
              if(element.parentElement.classList.contains('hideiconwrapper'))
              {
                element.parentElement.classList.add('disable')
              }
            }
            else
            {
              element.classList.remove('disable');
              element.disabled = false;
              if(element.parentElement.classList.contains('hideiconwrapper'))
              {
                element.parentElement.classList.remove('disable');
              }
            }
          break;
        }
      break;

      case 'TEXTAREA':
          if(readonly)
          {
            element.setAttribute('readonly', '');
          }
          else
          {
            element.removeAttribute('readonly');
          }
      break;

    }
  }
}

function passToShare(pass, teams)
{
  if(!Array.isArray(teams))
    return false;

  // We need this as object assignment is by reference
  let copypass = pcrypt.jsonparse(pcrypt.jsonstringify(pass), true);

  var share = {};

  share.cre = copypass.cre;
  share.upd = copypass.upd;
  share.alarm = copypass.alarm;
  share.id = copypass.id;
  share.name = copypass.name;
  share.user = copypass.user;
  share.pass = copypass.pass;
  share.url = copypass.url;
  share.note = copypass.note;
  share.pos = copypass.pos;
  share.files = copypass.files;
  share.shareteams = teams; // Is it not better to not include this info in the password (how to do it then)

  return share;
}

function shareToPass(shareuser, shareindex, sharedataindex, hidepass, gid)
{
  var pass = {};
  var share = shareuser.data[sharedataindex];

  pass.gid = [gid];

  pass.cre = share.cre;
  pass.upd = share.upd;
  pass.alarm = share.alarm;
  pass.id = share.id;
  pass.name = share.name;
  pass.user = share.user;
  pass.pass = share.pass;
  pass.url = share.url;
  pass.note = share.note;
  pass.pos = share.pos;
  pass.files = share.files;

  pass.share = {};
  pass.share.change = share.sharechange; // Only set for shares
  pass.share.teams = share.shareteams; // Only set for shares
  pass.share.index = shareindex; // Only set for shares (index in original share array from server)
  pass.share.dataindex = sharedataindex; // Only set for shares (index in original share array from server)
  pass.share.hidepass = hidepass; // Only set for shares (hide password);
  pass.share.userid = shareuser.userid; // Only set for shares;
  pass.share.type = shareuser.type; // Only set for shares (after team functionallity);
  pass.share.teamid = shareuser.teamid; // Only valid for team shares (to decrypt files);
  pass.share.keyid = shareuser.keyid; // Only valid for team shares (to decrypt files);

  return pass;
}

/**
 *  This is to remove all members that have not been approved etc.
 *  Clean up teammembers, remove unapproved team and team we are not approved in
 * */ 
function cleanmembers(members, teamobject)
{
  if(!Array.isArray(members))
    return false;

  var myid = pcrypt.getvalue('userid');

  if(!myid)
    return false;

  if(!teamobject[myid])
    return false;

  var myteams = teamobject[myid];

  for (var i = members.length - 1 ; i >= 0 ; --i)
  {
	  let member = members[i];

	  /*
	  if(member.approved != 1)
	  {
	    members.remove(i)
	    continue;
	  }
	  */

	  if(member.userid == null)
	  {
	    members.remove(i)
	    continue;
	  }

	  if(!myteams[member.teamid] || (myteams[member.teamid].approved != 1)) // Are we ourself approved in this team (other people is approved but we are not so we also need to remove them)
	  {
	    members.remove(i)
	    continue;
	  }
  }

	return members;
}
/**
 * converts teammembers from the members object into a team object
 * @param {*} members 
 * @returns teamobject
 */
function convertteammembers(members)
{
  if(!Array.isArray(members))
    return false;

  let myid = pcrypt.getvalue('userid');
  let teamobject = {};
  teamobject[0] = {}; // Special for team shares

  for (const member of members)
  {
    if(!member.userid) // We avoid all users that have not created an account
      continue;
        
    // If the team object doesn't have a member entry with the userid, generate a new object at that entry
    if(!teamobject[member.userid])
    {
      teamobject[member.userid] = {};

      // Set some properties on top level as it is global for all teams (more easy access);
      teamobject[member.userid].publickey = member.publickey;
      teamobject[member.userid].email = member.email;
      teamobject[member.userid].userid = member.userid;
      teamobject[member.userid].name = member.name;
      teamobject[member.userid].department = member.department;
    }
  
    teamobject[member.userid][member.teamid] = member;

    if(myid == member.userid)
    {
      teamobject[0][member.teamid] = 
      {
        teamhidepass: member.teamhidepass,
        teamid: member.teamid, 
        teamkeysdata: member.teamkeysdata,
        teamkeysfromid: member.teamkeysfromid,
        teamname: member.teamname,
        teamonlyadminshare: member.teamonlyadminshare
      };
    }
    
  }

  return teamobject;
}

function createteammemberlist(members)
{
 if(!Array.isArray(members))
   return false;

 var teamlength = members.length;
 var memberobject = {};

 for(var i = 0 ; i < teamlength ; i++)
 {
   let member = members[i];

   if(!memberobject[member.teamid])
   {
     memberobject[member.teamid] = [];
   }

   memberobject[member.teamid].push(member);
 }

 return memberobject;
}

/**
 * 
 * @param {*} sharedata 
 * @param {object} teamobject 
 * @param {*} privatekey 
 * @param {*} myemail 
 * @returns {object} objectshare
 */
function decryptShareData(sharedata, teamobject, privatekey, myemail)
{
  if(!Array.isArray(sharedata))
    return false;

  if(typeof(teamobject) != 'object')
    return false;

  let publickey;
  let sharedkey;
  //let objectshare = {};
  //let idobject = {};
  let teamarray = [];

  // Build up a list of user teams
  for (let i = 0, len_i = g.teammembers.length; i < len_i; ++i)
  {
    let teamid = g.teammembers[i].teamid;

    if(teamarray.indexOf(teamid) === -1)
      teamarray.push(teamid);
  }

  // We call this one time for all shared teams (faster as to avoid calling it multiple times for each relevant password and team)
  let teamkeys = handleTeamKeys(teamarray, false, false, false);

  // Decrypt shares for each userid
  for (let i = sharedata.length - 1; i >= 0; i--)
  {
    let share = sharedata[i];

    if(typeof share.data !== "string")
    {
      console.log("Invalid share data detected");
      sharedata.remove(i); continue;
    }

    if(share.data.length == 0) // No share data
    {
      sharedata.remove(i); continue;
    }

    if(pcrypt.sha256(share.data) !== share.hash)
	  {
      console.log("Invalid share hash detected");
      sharedata.remove(i); continue;
    }

    if(share.email == myemail)
		{
      sharedata.remove(i); continue;
    }

    var userid = share.userid;

    switch(share.type)
    {
      default:
      case 'usershare':  

    		if(!teamobject[userid])
    		{
          sharedata.remove(i); continue;
        }

        try
    		{
    		  publickey = pcrypt.decodeasymetrickeys(teamobject[userid].publickey);
          sharedkey = pcrypt.getsharedsecret(privatekey, publickey);

          if(sharedkey === false)
          {
              console.log("Invalid share key: " + userid);
              sharedata.remove(i); continue;
          }

          share.data = pcrypt.decryptdata(sharedkey, share.data);

          // We need to test if share is still part of relevant teams (user is still a member)
          for (var x = share.data.length - 1; x >= 0; x--)
          {
            let shareteams = share.data[x].shareteams;

            if(shareteams && Array.isArray(shareteams))
            {
              let isinteam = false;

              for(var y = 0, len = shareteams.length; y < len; y++)
              {
                if(teamobject[userid] && teamobject[userid][shareteams[y]])
                  isinteam = true;
              }

              if(isinteam == false)
                sharedata.data.remove(x); // Remove this share as the user properly is not member of the share team any more
            }
          }
        }
        catch(err)
        {
          console.log("Invalid share data: " + err.message);
          sharedata.remove(i); continue;
        }
      break;

      case 'teamshare': 

        if(!validNestedObj(teamkeys, share.teamid, share.keyid))
        {
          console.log("Invalid team share key: " + share.teamid + ":" + share.keyid);
          sharedata.remove(i); continue;
        }

        share.data = pcrypt.decryptdata(teamkeys[share.teamid][share.keyid], share.data, false);
        
      break;
    }

    /*
    for (let j = share.data.length - 1; j >= 0; j--)
    {
      let data = share.data[j];
      let hash = pcrypt.sha256(pcrypt.jsonstringify(data)).substring(0, 16);

      if(!data.id) // We have to support old shares that do not have any ID value
      {
        console.log('Share without ID detected');
        data.id = hash; // Limit length for security and speed/memory
      }

      idobject[data.id] = hash; // Limit length for security and speed/memory (can be set twice by user and teamshare)
    }
    */

    //objectshare[userid] = share;
    //objectshare[userid].datahash = {};

    // Run tru all shares and build hash data
    /*
    for (var j = share.data.length - 1; j >= 0; j--)
    {
      let data = share.data[j];
      let hash = pcrypt.sha256(pcrypt.jsonstringify(data));
      share.datahash[hash.substring(0,16)] = data;  // We limit the length so it can not be used in an attack (not likely as this is only on client and everything is stored encrypted)
    }
    */
  }

  //return objectshare;
  return true;
}

function findShareChanges(oldshares, newshares)
{
  if(Array.isArray(oldshares) || (typeof(oldshares) !== 'object')) // Test if it is not object
    return {};

  if(Array.isArray(newshares) || (typeof(newshares) !== 'object')) // Test if it is not object
    return {};

  let sharechanges = {};

  // Find out what to remove
  for (let userid in oldshares)
  {
    if(!Array.isArray(sharechanges[userid]))
      sharechanges[userid] = [];

    sharechanges[userid] = oldshares[userid].filter(function(team) 
    {
      if(!newshares[userid])
        return true;

      if(newshares[userid].includes(team))
      {
        return false;
      }
      else
      {
        return true;
      }
    });

    // Make them negative to indicate that they need to be removed
    for(let team = 0, team_len = sharechanges[userid].length ; team < team_len; ++team) 
    {
      sharechanges[userid].push(-Math.abs(sharechanges[userid][0]))
      sharechanges[userid].remove(0); 
    }
  }

  // Find out what to add
  for (let userid in newshares)
  {
    if(!Array.isArray(sharechanges[userid]))
      sharechanges[userid] = [];

    sharechanges[userid] = sharechanges[userid].concat(newshares[userid].filter(function(team) 
    {
      if(!oldshares[userid])
        return true;

      if(oldshares[userid].includes(team))
      {
        return false;
      }
      else
      {
        return true;
      }
    }));
  }

  //console.log(sharechanges);

  return sharechanges;
}

/**
 * @description Nice function to avoid the following situation
 * if(!a || !a.b || |a.b.c etc)
 * can now be made this way
 * if(validNestedObj(a, 'b', 'c'))
 * @param {Object} obj Object to check nested values for
 * @param {String} level the object-, or attribute-reference to check for 
 * @param  {...any} rest Other objects, attributes, etc.
 */
function validNestedObj(obj, level,  ...rest) 
{
  if (obj === undefined) 
  {
    return false;
  }

  if (rest.length == 0 && obj.hasOwnProperty(level))
  {
    return true;
  }

  return validNestedObj(obj[level], ...rest);
}

/*
teamid: Array of team id to get/save
createnew: Boolean if new key shall be created (for all teams) or Pcryptarray with the keys to save
userids: Array of user id that shall get keys (false or undefined means all users in team)
*/
function handleTeamKeys(teamids, setteamkeys, createnew, userids)
{
  let myid = pcrypt.getvalue('userid');
  let privatekey = pcrypt.getvalue('privatekey');
  let symmetrickey = pcrypt.getvalue('keycrypt');
  let teamkeys = {}; // Hold all keys for each team
  let saveteamkeys = {}; // The keys to save for each team
  let newkeysstatus = {}; // Hold info about why a new key was created
  let missingkeys = {}; // Users that are missing keys for each team (current user have the keys)

  if(!Array.isArray(teamids))
  {
    alert("teamids is not array");
    return false;
  }

  if(!g.teammembers)
  {
    alert("g.teammembers not available");
    return false;
  }

  if(!g.teamobject)
    g.teamobject = convertteammembers(g.teammembers);
  
  if(!g.memberobject)
    g.memberobject = createteammemberlist(g.teammembers);

  // Do not call cleanmembers as it remove some users that give problems in teams.js

  // To make it more easy to code and overview we limit the functionality to a single team when we create a new key
  if((createnew || Array.isArray(userids)) && (teamids.length > 1))
  {
    alert("When createnew or userids is set only a single team is supported");
    return false;
  }

  if(createnew && Array.isArray(userids))
  {
    alert("Do not use createnew and userids at the same time");
    return false;
  }


  // Build up an object with array of keys
  for (let i = 0, len_i = teamids.length; i < len_i; ++i)
  {
    let teamid = teamids[i];

    // if negative we shall ignore it (team is about to be removed)
    if(Math.sign(teamid) === -1)
      continue;

    if(!teamkeys[teamid])
      teamkeys[teamid] = new Pcryptarray;

    if(!newkeysstatus[teamid])
      newkeysstatus[teamid] = false;

    let team = g.teamobject[myid][teamid];

    if(!team)
      continue;

    if((team.teamkeysdata !== null) && (team.teamkeysfromid !== null))
    {
      // Get public key from share user
      let shareuser = g.teamobject[team.teamkeysfromid];
      let publickey, sharedkey;

      if(!shareuser || !shareuser.userid)
      {
        continue; // Can be because user have not approved team
      }

      if(shareuser.userid == myid) // Do not do it for yourself (but symmetric decrypt)
      {
        Object.assign(teamkeys[teamid], pcrypt.decryptdata(symmetrickey, team.teamkeysdata));
      }
      else
      {
        publickey = pcrypt.decodeasymetrickeys(shareuser.publickey);
        sharedkey = pcrypt.getsharedsecret(privatekey, publickey);

        if(sharedkey === false)
        {
          alert("Invalid decrypt share key for user id: " + shareuser.userid); 
          teamkeys[teamid] = false;
          continue;
        }

        Object.assign(teamkeys[teamid], pcrypt.decryptdata(sharedkey, team.teamkeysdata));
      }

      // If userids is set we always/just need to save the data for these users
      if(Array.isArray(userids))
      {
        missingkeys[teamid] = userids;
      }
      else if(team.admin && g.teamobject)
      {
        // Test that all users have keys as we have a key and is admin
        for (let j = 0, len_j = g.memberobject[teamid].length; j < len_j; ++j)
        {
          let user = g.memberobject[teamid][j];

          if(!user || !user.userid)
          {
            continue; // Can be because user have not approved team
          }

          if((user.teamkeysdata === null) || (user.teamkeysfromid === null))
          {
            if(!missingkeys[teamid])
              missingkeys[teamid] = [];

            missingkeys[teamid].push(user.userid);
          }
        }
      }

      if(missingkeys[teamid])
      {
        saveteamkeys[teamid] = teamkeys[teamid];
      }
    }
    else if(teamkeys[teamid].length() == 0)
    {
      if(team.admin) 
      {
        if(!saveteamkeys[teamid])
          saveteamkeys[teamid] = new Pcryptarray;

        // When we are admin we can create a new key (needed for users own teams)
        // But this is a problem if a (unknown to system) user is created with admin rights by another team admin
        // We detect this in callback below because we check if there is existing keys in use for the team 
        // TODO - What if other admin remove his own admin rights before this user is logged on (problem)
        // This is the reasons teamkeys is not set (can contain a wrong key - updated after they are sync by another admin)

        saveteamkeys[teamid].push(pcrypt_randombytes(pcrypt.keylength)); 
        newkeysstatus[teamid] = 2; // new key because of missing keys
      }
      else
      {
        // This is possible when for example a new user is created in a team (admin do not know the public key of the new user at this point in time)
        // After the user is created the admin need to login to generate teamkeys for the new user

        console.log("No keys created for team id: " + teamid);
        teamkeys[teamid] = false;
        continue; 
      }
    }
    else
    {
      alert("Invalid existing team keys for team id: " + teamid);
      teamkeys[teamid] = false;
      continue; 
    }

    if(typeof setteamkeys === 'object') // If we need to set specific keys
    {
      if(saveteamkeys[teamid])
      {
        console.log("Existing user key for team is set for all members: " + teamid);
      }

      saveteamkeys[teamid] = setteamkeys[teamid];
      newkeysstatus[teamid] = 3; // new forced keys
    } 
    
    if(createnew) // Generate a new key
    {
      if(team.admin)
      {
        if(!saveteamkeys[teamid])
          saveteamkeys[teamid] = new Pcryptarray;

        teamkeys[teamid].push(pcrypt_randombytes(pcrypt.keylength)); // We store the new index this way
        saveteamkeys[teamid] = teamkeys[teamid];
        newkeysstatus[teamid] = 1; // new key forced
      }
      else
      {
        console.log("Unable to create new key as user is not team admin for team id: " + teamid);
      }
    }

    if(saveteamkeys[teamid] && (saveteamkeys[teamid].length() === 0))
    {
      console.log("No keys to save for team id: " + teamid);
      delete saveteamkeys[teamid];
      continue; 
    }
  } 
  
  let saveteamkeysarray = Object.keys(saveteamkeys);

  if(saveteamkeysarray.length) // Check if we shall save keys on server!
  {
    // Get key ID in use from server (this call get all key ID for all teams we are a member of)
    pcrypt_teamgetteamkeysinuse(pcrypt.getvalue('session'), 0, function teamgetteamkeysinusefunc(keysinuse, error, id) 
    {
      if (error)
      {
        handlepcrypterror(error, data);
        return;
      }

      let privatekey = pcrypt.getvalue('privatekey');
      let publickey, sharedkey;
      let encryptedteamkeys = {}; 
      //g.teammembers = cleanmembers(g.teammembers, g.teamobject);
      //g.memberobject = createteammemberlist(g.teammembers);

      for (let i = 0, len_i = saveteamkeysarray.length; i < len_i; ++i)
      {
        let teamid = saveteamkeysarray[i];
        //let keyarray = Object.keys(teamkeys[teamid]);
        let keyarray = Object.keys(saveteamkeys[teamid]);

        // Delete key if not is use on server - Last key shall not be removed as it is the new active key
        for (let x = keyarray.length - 2; x >= 0 ; --x)
        {
          if(keysinuse[teamid] && keysinuse[teamid].indexOf(Number(keyarray[x])) === -1)
          {
            //console.log(keysinuse[teamid].indexOf(Number(keyarray[x])));
            //console.log(teamkeys[teamid][x]);
        
            delete saveteamkeys[teamid][x]; // This is a special object - Pcryptarray
          }
        }

        // This is a special case where we detect that user have made keys for a team because of no keys but keys are in use on server?
        // So we shall not overwrite keys and have to get them from another admin
        if(isset(keysinuse[teamid]) && isset(saveteamkeys[teamid]) && newkeysstatus[teamid] == 2)
        {
          console.log("Existing keys for team id: " + teamid);
          delete saveteamkeys[teamid];
          continue;
        }

        encryptedteamkeys[teamid] = {};

        // Encrypt key data for all users in team
        for (let j = 0, len_j = g.memberobject[teamid].length; j < len_j; ++j)
        {          
          let user = g.memberobject[teamid][j];

          if(!user || !user.userid)
          {
            continue; // Can be because user have not approved team
          }

          // If we have found that a user is missing keys and we have not generated a new key for the team 
          // This is also used when a new user unknown to the system is added to a team 
          // Team admin has to generate teamkeys for the user after the user is created in the system
          if((newkeysstatus[teamid] !== 1) && missingkeys[teamid])
          {
            if(missingkeys[teamid].indexOf(user.userid) === -1)
            {
              continue;
            }
          }

          if(user.userid == myid) // Do not do it for yourself (but symmetric encrypt)
          {
            encryptedteamkeys[teamid][user.userid] = pcrypt.encryptdata(symmetrickey, saveteamkeys[teamid], false);
            continue;
          }

          publickey = pcrypt.decodeasymetrickeys(user.publickey);
          sharedkey = pcrypt.getsharedsecret(privatekey, publickey);

          if(sharedkey === false)
          {
            alert("Invalid encrypt share key for user id: " + user.userid);
            encryptedteamkeys[teamid][user.userid] =false;
            continue;
          }
          
          encryptedteamkeys[teamid][user.userid] = pcrypt.encryptdata(sharedkey, saveteamkeys[teamid], false);
        }
      }

      // Now save the data on server
      let datastring = pcrypt.jsonstringify(encryptedteamkeys);
      let hash = pcrypt.sha256(datastring);
      let newkeysstring = pcrypt.jsonstringify(newkeysstatus);

      pcrypt_teamsetteamkeys(pcrypt.getvalue('session'), datastring, hash, newkeysstring, 0, function teamsetteamkeysfunc(data, error, id) 
      {
        if (error)
        {
          handlepcrypterror(error, data);
          return;
        }

        // return g.teammembers to avoid extra API call
        g.teammembers = data;
        g.teamobject = convertteammembers(g.teammembers);
        pcrypt.setvalue('teamchanges', 1); // force update other places as pcrypt.getteammembers have a local cache (refresh in password page can generate new keys)
        // Do not call cleanmembers as it remove some users that give problems in teams.js
      });
    });
  }

  return teamkeys;
}

function shareTeamData(teamdata, teamobject, filechanges, serverfiledata, newfileids, newfiledata)
{
  let saveteamdata = {};
  let teamarray = [];
  let teamfiles = {};

  teamfiles.nodelsource = {};
  teamfiles.newfiles = [];

  // Build up a list of teams we have to work with first
  for (let i = 0, len_i = teamdata.length; i < len_i; ++i)
  {
    teamarray = teamarray.merge(teamdata[i].shareteams);
  }

  // We call this one time for all shared teams (faster as to avoid calling it multiple times for each relevant password and team)
  let teamkeys = handleTeamKeys(teamarray, false, false, false);

  for (let i = 0, len_i = teamdata.length; i < len_i; ++i)
  {
    let shareteams = teamdata[i].shareteams;

    if(!Array.isArray(shareteams))
      continue; 

    // Process each team we need to work with
    for (let j = 0, len_j = shareteams.length; j < len_j; ++j)
    {      
      let teamid = shareteams[j];      

      if(Math.sign(teamid) === -1)
        continue;

      if(!teamkeys[teamid])
        continue;

      let keyid = teamkeys[teamid].lastindex();

      if(keyid === -1)
        continue;

      if(!saveteamdata[teamid])
      {
        saveteamdata[teamid] = {};
        saveteamdata[teamid].keyid = keyid;
        saveteamdata[teamid].data = [];
      }

      let saveteamdatalength = saveteamdata[teamid].data.push(pcrypt.jsonparse(pcrypt.jsonstringify(teamdata[i]), true)); // As we modify below we like to make a deep copy

      saveteamdata[teamid].data[saveteamdatalength - 1].shareteams = [teamid]; // Set only current team for teamshares
    }

    //debugger;

    // Test if we need to remove some shares (have to be here outside the prior loop)
    for (let j = 0, len_j = shareteams.length; j < len_j; ++j)
    { 
      let teamid = shareteams[j];

      // If negative we need to encrypt the data
      if(Math.sign(teamid) === -1)
      {
        let teamidpos = Math.abs(teamid); // Make team id positive again

        if(!teamfiles.nodelsource.hasOwnProperty(teamidpos))
          teamfiles.nodelsource[teamidpos] = []; // Will delete all files for this user 

        if(!saveteamdata[teamidpos]) // Test if it has been used in the prior loop (if defined no need to remove it)
        {
          saveteamdata[teamidpos] = false;
        }
      }
    }
  }

  // Encrypt data
  Object.keys(saveteamdata).forEach((teamid, index) =>
  {
    let team = saveteamdata[teamid];

    // Test if we need to encrypt it (not false)
    if(team && (typeof team.data === 'object'))
    {
      // Build up file data if we have file changes
      if(filechanges)
      {
        team.data.forEach(function(pass) 
        {
          pass.files.forEach(function(file)
          {
            if(!file.fileid)
              return; // Must be old integrated format

            if(serverfiledata && serverfiledata[teamid] && serverfiledata[teamid][file.fileid])
            {
              // This is a file that is already on the server

              if(!teamfiles.nodelsource.hasOwnProperty(teamid))
                teamfiles.nodelsource[teamid] = [];

              teamfiles.nodelsource[teamid].push(file.fileid);
            }
            else
            {
              // This is a new file that is not on the server

              let fileindex = newfileids.indexOf(file.fileid);

              if((fileindex < 0) || (fileindex > newfileids.length))
              {
                console.log("Unable to locate fileid in newfiles: " + file.fileid);
                return;
              }

              if(typeof teamfiles.newfiles[fileindex] === 'undefined')
              {
                  teamfiles.newfiles[fileindex] = {};
                  teamfiles.newfiles[fileindex]['sharekeys'] = [];
                  teamfiles.newfiles[fileindex]['keyids'] = [];
                  teamfiles.newfiles[fileindex]['fileids'] = [];
                  teamfiles.newfiles[fileindex]['teamids'] = [];
                  teamfiles.newfiles[fileindex]['index'] = fileindex;
                  //teamfiles.newfiles[fileindex]['sourceid'] = file.sourceid;
                  //teamfiles.newfiles[fileindex]['fileids'] = file.fileid;
              }

              teamfiles.newfiles[fileindex]['sharekeys'].push(teamkeys[teamid][team.keyid]);
              teamfiles.newfiles[fileindex]['keyids'].push(team.keyid);
              teamfiles.newfiles[fileindex]['fileids'].push(file.fileid);
              teamfiles.newfiles[fileindex]['teamids'].push(teamid);
            }
          });
        });
      }

      team.data = pcrypt.encryptdata(teamkeys[teamid][team.keyid], team.data, false);
    }
  })  

  for (let teamid in saveteamdata)
  {
    if(saveteamdata[teamid]) // Test if it has been used in the above loop (we may need to remove some files)
    {
      if(!teamfiles.nodelsource.hasOwnProperty(teamid))
        teamfiles.nodelsource[teamid] = []; // Will delete all files for this user (new files excluded)
    }
  }  

  //console.log('Team: ', saveteamdata, teamfiles);

  let datastring = pcrypt.jsonstringify(saveteamdata);
  let hash = pcrypt.sha256(datastring);

  // Save data to server
  pcrypt_teamsetteamshares(pcrypt.getvalue('session'), datastring, hash, 0, function teamsetteamsharesfunc(data, error, id) 
  {
    if (error)
    {
      handlepcrypterror(error, data);
    }
  }); 

  return teamfiles;
}

function shareUserData(userdata, teamobject, filechanges, serverfiledata, newfileids, newfiledata)
{
  let privatekey = pcrypt.getvalue('privatekey'); // Get private key from login
  let myemail = pcrypt.getvalue('email');
  let publickey;
  let sharedkey;
  let userfiles = {};

  userfiles.nodelsource = {};
  userfiles.newfiles = [];

  // Encrypt shares for each user
  for (let userid in userdata)
  {
    if(userid == 0) // Avoid possible team shares (should not be needed - but anyway)
    {
      continue;
    }

    if(typeof userdata[userid] === "string") // Test if the data is already encrypted (other team with same email)
    {
      continue;
    }

    if(userdata[userid].length === 0) // We shall not share anything (array is empty)
    {
      userdata[userid] = ""; // Will delete any old shares still stored in the database
      if(!userfiles.nodelsource.hasOwnProperty(userid))
        userfiles.nodelsource[userid] = []; // Will delete all files for this user
      continue;
    }

    try
    {
      if(!teamobject[userid])
      {
        alert("Unknow teamobject userid specified: " + userid);
        continue;
      }

      publickey = pcrypt.decodeasymetrickeys(teamobject[userid].publickey);
      sharedkey = pcrypt.getsharedsecret(privatekey, publickey);

      if(sharedkey === false)
      {
        alert("Invalid sharedkey for user: " + userid);
        delete userdata[userid]; // Invalidate data
        continue;
      }

      // Build up file data if we have file changes
      if(filechanges)
      {
        userdata[userid].forEach(function(pass)
        {
          pass.files.forEach(function(file)
          {
            if(!file.fileid)
              return; // Must be old integrated format

            if(serverfiledata && serverfiledata[userid] && serverfiledata[userid][file.fileid])
            {
              // This is a file that is already on the server

              if(!userfiles.nodelsource.hasOwnProperty(userid))
                userfiles.nodelsource[userid] = [];

              userfiles.nodelsource[userid].push(file.fileid);
            }
            else
            {
              // This is a new file that is not on the server

              let fileindex = newfileids.indexOf(file.fileid);

              if((fileindex < 0) || (fileindex > newfileids.length))
              {
                console.log("Unable to locate fileid in newfiles: " + file.fileid);
                return;
              }

              if(typeof userfiles.newfiles[fileindex] === 'undefined')
              {
                  userfiles.newfiles[fileindex] = {};
                  userfiles.newfiles[fileindex]['sharekeys'] = [];
                  userfiles.newfiles[fileindex]['fileids'] = [];
                  userfiles.newfiles[fileindex]['toids'] = [];
                  userfiles.newfiles[fileindex]['index'] = fileindex;
                  //userfiles.newfiles[fileindex]['sourceid'] = file.sourceid;
                  //userfiles.newfiles[fileindex]['fileids'] = file.fileid;
              }

              userfiles.newfiles[fileindex]['sharekeys'].push(sharedkey);
              userfiles.newfiles[fileindex]['fileids'].push(file.fileid);
              userfiles.newfiles[fileindex]['toids'].push(userid);
            }
          });
        });
      }

      userdata[userid] = pcrypt.encryptdata(sharedkey, userdata[userid], false);
    }
    catch(err)
    {
      alert("Invalid share data build: " + err.message);
      delete userdata[userid]; // Invalidate data
      continue;
    }
  }

  for (let userid in userdata)
  {
    if(userdata[userid]) // Test if it has been used in the above loop (we may need to remove some files)
    {
      if(!userfiles.nodelsource.hasOwnProperty(userid))
        userfiles.nodelsource[userid] = []; // Will delete all files for this user (new files excluded)
    }
  }

  //console.log('Member: ', userdata, userfiles);

  // Save share data so the other users can see it at logon
  pcrypt.setteamshares(pcrypt.getvalue('session'), userdata, 0, function updateusersharefunc(data, error, id)
  {
    if(error)
    switch(error)
    {
      case 14:
        pcrypt.flushvalues();
        redirectinvalidlogin();
      return;

      default:
        handlepcrypterror(error, data);
      return;
    }
  });

  return userfiles;
}


// filechanges is a variable that stop all update of files (limit server traffic when only a single password i edited)
/**
 * @name buildShareData
 * @description builds the user share data of (a) given password(s)
 * @param {*} gpass 
 * @param {*} members 
 * @param {Boolean} filechanges 
 * @param {Boolean} spinnerCall 
 * @param {function} callback 
 */
function buildShareData(gpass, teamobject, filechanges, callback)
{
  // We have to build all for each user/team as the server can not merge items for the same user/team (do not know what it work with after encryption)
  // Teams have to handled in a special way as they are userid 0 but need the complete rebuild pr team
  // TODO - this really can use some Async/Await

  if(!Array.isArray(gpass))
    return false;

  if(typeof teamobject !== 'object' || teamobject === null)
    return false;

  if(filechanges)
  {
    pcrypt_teamgetbinaryinfo2(pcrypt.getvalue('session'), 0, teamgetbinaryinfocallback);
  }
  else
  {
    // no files to download just call callback function
    teamgetbinaryinfocallback({}, null, 0);
  }    

  function teamgetbinaryinfocallback(serverfiledata, error, id)
	{
    if(error)
    {
      handlepcrypterror(error, serverfiledata);
      return;
    }

    // We need to find all users and teams in sharechanges for all passwords
    // This is needed because if something is changed for a password share also the existing shares for the same user or team need to be included
    // So globalsharechanges contain all changes to teams pr. user for all passwords (userid 0 == team share)
    var globalsharechanges = {};

    for (const pass of gpass)
    {
      if(Array.isArray(pass.sharechanges) || (typeof(pass.sharechanges) !== 'object')) // Test if it is not object
        continue;

      for (let userid in pass.sharechanges)
      {
        if(!Array.isArray(globalsharechanges[userid]))
          globalsharechanges[userid] = [];

        if(!Array.isArray(pass.sharechanges[userid]))
            continue;

        // We convert negative (remove) team to positive as we only want to look at the ones we like to include because of changes
        globalsharechanges[userid] = globalsharechanges[userid].merge(pass.sharechanges[userid].map(n => Math.abs(n)));
      }
    }
    
    var sharedata = {};
    var newfileids = []; // Needed files to download and process
    
    // This just to find and test if shares are valid
    for (const pass of gpass)
    {
      if(Array.isArray(pass.shares) || (typeof(pass.shares) !== 'object')) // Test if it is not object
        continue;

      // We test if user is member of the teams (but shares can be left behind if team is deleted or user removed)
      // But because we keep old shares and user is added to the team again he will have the shares again unless shares are rebuild in between
      // (so not a completely secure way to to delete a user from a team)
      for (let userid in pass.shares)
      {          
        if(!teamobject[userid])
        {
          console.log('Userid not found in teamobject: ' + userid);
          continue;
        }

        const shareteams = pass.shares[userid];

        if(!Array.isArray(shareteams))
        {
          console.log('Password shares is not array for userid: ' + userid);
          continue;
        }

        let testteams = [];

        if(globalsharechanges[userid] && globalsharechanges[userid].length) // Only work with passwords that have new changes globally for this specific user (team)
        {
          if(userid == 0) // If teamshare we need special handling as userid is always 0 and we need to look at the shared teams
          {
            testteams = shareteams.intersection(globalsharechanges[userid]); // Here we remove teams that have no global change

            if((typeof(pass.sharechanges) === 'object') && Array.isArray(pass.sharechanges[userid])) // Test that it have valid array data
            {
              testteams = testteams.merge(pass.sharechanges[userid]); // We need it this way as the negative remove team id's need to be there
            }
          }
          else
          {
            testteams = shareteams; 
          }
        }

        if(testteams.length == 0)
        {
          continue;
        }

        let validteams = [];

        // This loop will remove the shares where user is no longer member of the team
        for (const teamid of testteams)
        {
          if(teamobject[userid][Math.abs(teamid)]) // We have to test positive numbers
          {
            validteams.push(teamid);
          }
        }

        if(validteams.length == 0)
        {
          continue;
        }

        if(!Array.isArray(sharedata[userid]))
        {
          sharedata[userid] = [];
        }

        sharedata[userid].push(passToShare(pass, validteams));    

	      // Handle possible files (only if changes to the password)
        if(filechanges && pass.sharechanges) 
        {
          pass.files.forEach(function(file)
          {
            if(file.fileid)
            {
              if(serverfiledata)
              { 
                if(userid == 0) // if team share (special handling)
                {
                  // Loop teams
                  for (const teamid of validteams)
                  {
                    if(Math.sign(teamid) == -1) // Avoid teams that is to be removed
                      continue;

                    if(serverfiledata.team && (!serverfiledata.team[teamid] || !serverfiledata.team[teamid][file.fileid]))
                    {
                      if(!newfileids.includes(file.fileid))
                      {
                        newfileids.push(file.fileid);
                      }
                    }
                  }
                }
                else if(!newfileids.includes(file.fileid))
                {
                  if(serverfiledata.user && (!serverfiledata.user[userid] || !serverfiledata.user[userid][file.fileid]))
                  {
                    newfileids.push(file.fileid);
                  }
                }
              }
            }
          }); 
        }        
      }

      // Test if we need to remove some shares (have to be here outside the other loop as pass.shares can be empty)
      for (let userid in pass.sharechanges)
      {
        if(pass.sharechanges[userid] && !pass.shares[userid])
        {
          if(!sharedata[userid]) // Test if it has been used in the above loop (if defined no need to remove it)
          {
            sharedata[userid] = []; // This alone will remove user shares for this password
          }

          if(userid == 0) // We need to handle team sharing in a special way 
          {
            sharedata[userid].push(passToShare(pass, pass.sharechanges[0]));
          }
        }      
      }

      delete pass.sharechanges;
    } 

    //debugger;

    // sharedata now contain all needed password info for sharing (what need to be shared)
    // newfileids contains the new files we need to share

    // Get external files and handle everything in a callback from here on !!
    if(newfileids.length)
    {
      pcrypt_getbinary(pcrypt.getvalue('session'), newfileids, 0, downloadsharedfilescallback);
    }
    else
    {
      // no files to download just call callback function
      downloadsharedfilescallback({}, null, 0);
    }

    function downloadsharedfilescallback(newfiledata, error, id)
  	{
  	  if(error)
      {
  		  handlepcrypterror(error, filedata);
        return;
      }

      let sharefiles = {};

      if(sharedata[0]) // Any team share changes
      {
        sharefiles.team = shareTeamData(sharedata[0], teamobject, filechanges, serverfiledata.team, newfileids, newfiledata);        // Move the encryption info to the top for both cases (similar handling)
        delete sharedata[0]; // This is needed !!
      }
      else
      {
        sharefiles.team = {};
        sharefiles.team.nodelsource = {};
        sharefiles.team.newfiles = [];
      }

      sharefiles.user = shareUserData(sharedata, teamobject, filechanges, serverfiledata.user, newfileids, newfiledata);

      // Decrypt new source files and encrypt with correct key to store in DB (background process to allow quick UI)
      if(filechanges && 
      (
           sharefiles.user.newfiles.length 
        || sharefiles.team.newfiles.length 
        || Object.keys(sharefiles.user.nodelsource).length 
        || Object.keys(sharefiles.team.nodelsource).length
      ))
      {
        pcrypt.workercall({method: 'decrypt', id: 'buildsharedatabinarydecrypt', param: sharefiles, filedata: Object.values(newfiledata), keydata: pcrypt.getvalue('keycrypt')});
      }
      
      if(callback)
      {
        callback(sharedata);
      }
    }
  };
}

function hidesharepassvalid(userid, shareuser, sharedata, teamobject)
{
  let returnvalue = true;

  if(sharedata.shareteams && Array.isArray(sharedata.shareteams))
  {
    try
    {
      let shareteams;

      shareteams = getShareTeams(sharedata);

      if(!shareteams)
        return false;

      for(var i = 0, len = shareteams.length; i < len; i++)
      {
        if(returnvalue && teamobject[shareuser.userid] && teamobject[shareuser.userid][shareteams[i]]) // Valid team for receiver
        {
          if(!teamobject[shareuser.userid][shareteams[i]].teamhidepass)
            returnvalue = false;

          if(teamobject[userid][shareteams[i]].userhidepass)
            returnvalue = true;  
        }
      }
    }
    catch(err)
    {
      return true;
    }
  }

  return returnvalue;
}

function addCheckboxClickToGrid(gridID, skipHeader) 
{
  if(grid === undefined)
  {
    var grid = document.getElementById(gridID);
  }
  else
  {
    grid = document.getElementById(gridID);
  }

  // Start at 1 to skip the "header" row
  for(var i = skipHeader ? 1 : 0; i < grid.rows.length; i++)
  {
    grid.rows[i].addEventListener('click', function (event)
    {
      let target = event.target;
      if(target.type)
      {
        if(target.type === 'button')
        {
          return;
        }

        if(target.type === 'checkbox')
        {
          return;
        }

      }

      if(target.hasAttribute('aria-sort') === false)
      {
        
        if(target.parentElement === grid.rows[0] )
        {
          event.preventDefault();
          let selallcheckbox = grid.rows[0].querySelector('input[type="checkbox"');
          selallcheckbox.click();
          selallcheckbox.checked = !selallcheckbox.checked;
        }
        
        let tr = target.parentElement
        let rowcheckbox = tr.querySelector('input[type="checkbox"]');
        if(rowcheckbox)
        {
          let checked = rowcheckbox.checked;
          rowcheckbox.checked = !checked;
        }
      }

      // Specifically for the password grid, if any checkbox is turned on show highlights on menu.
      // If the last checkbox is turned off deactivate the element again.
      switch (gridID) 
      {
        case 'passwordgrid':
          document.querySelectorAll('ul.navigation .canchange').forEach(function (element)
          {
            if(element !== undefined)
            {
              if(element.classList.contains('canchange'))
              {
                if(element.classList.contains('deactivated') && getselectedpass().length>0)
                {
                  element.classList.remove('deactivated');
                }
                else if(element.classList.toString().indexOf('deactivated') === -1 && getselectedpass().length === 0)
                {
                  element.classList.add('deactivated');
                }
              }
            }
          });
          break;

          case 'adminusersgrid':
            var usercheckboxes = document.querySelectorAll('input[type="checkbox"][name="selectedUsers[]"]');
            var msgsSelected = false;
            for(var i = 0, i_len = usercheckboxes.length; i < i_len; i++)
            {
              if(usercheckboxes[i].checked === true)
              {
                msgsSelected = true;
                i = i_len;
              }
            }

            if(msgsSelected)
            {
              document.querySelectorAll('#menu-admin-users ul.subnav .canchange').forEach(function (changeElement)
              {
                changeElement.classList.remove('deactivated');
              });
            }
            else
            {
              document.querySelectorAll('#menu-admin-users ul.subnav .canchange').forEach(function (changeElement)
              {
                changeElement.classList.add('deactivated');
              });
            }
          break;

          case 'globalmsgAdmingrid':
            var globalmsgcheckboxes = document.querySelectorAll('input[type="checkbox"].messagecheckbox');
            var msgsSelected = false;
            for(var i = 0, i_len = globalmsgcheckboxes.length; i < i_len; i++)
            {
              if(globalmsgcheckboxes[i].checked === true)
              {
                msgsSelected = true;
                i = i_len;
              }
            }

            if(msgsSelected)
            {
              document.querySelectorAll('#menu-admin-globalmsgs ul.subnav .canchange').forEach(function (changeElement)
              {
                changeElement.classList.remove('deactivated');
              });
            }
            else
            {
              document.querySelectorAll('#menu-admin-globalmsgs ul.subnav .canchange').forEach(function (changeElement)
              {
                changeElement.classList.add('deactivated');
              });
            }
          break;
      
        default:
          break;
      }

    });
  }
}

function sortgrouparray(a, b)
{
	//http://www.javascriptkit.com/javatutors/arraysort.shtml

	var nameA, nameB;

	if(a.name)
		nameA = a.name.toUpperCase();
	else
		nameA = "";

	if(b.name)
		nameB = b.name.toUpperCase();
	else
		nameB = "";

	if (nameA < nameB) //sort string ascending
	  return -1
	if (nameA > nameB)
	  return 1
	return 0 //default return value (no sorting)
}

function sortpassarray(a, b)
{
	//http://www.javascriptkit.com/javatutors/arraysort.shtml

	var nameA, nameB;

	if(a.name)
		nameA = a.name.toUpperCase();
	else
		nameA = "";

	if(b.name)
		nameB = b.name.toUpperCase();
	else
		nameB = "";

	if (nameA < nameB) //sort string ascending
	  return -1;
	if (nameA > nameB)
	  return 1;

	return 0; //default return value (no sorting)
}
/**
 * Fill out the group select element on the passwords page.
 * @param {Object} selelement the group select object 
 * @param {Int} selectedid id of the selected groupselect option
 * @param {*} addall 
 * @param {*} addundef 
 * @param {*} addpos 
 * @param {*} addown 
 * @param {*} addoutshare 
 * @param {*} addinshare 
 * @param {*} addgroups 
 * @param {*} addshares  
 * @param {Boolean} addnewtag 
 * @param {Boolean} addSharesFromUser
 * @param {Boolean} addShareChanged
 */
function fillgroupselect(selelement, selectedid, showoptions)
//  addall, addundef, addpos, addown, addoutshare, addinshare, addgroups, addshares, security, addnewtag, addSharesFromUser, addNewShares)
{
  if(!selelement || (selelement.options === undefined))
  {
    return;
  }

  if(typeof showoptions !== 'object' || showoptions === null)
  {
    console.log('showoptions not object');
    return;
  }

  selelement.length = 0; // remove all elements

  if(showoptions.all)
  {
    var selected = gpcrypt.sgid.all == selectedid ? true : false;
    var op = new Option(showoptions.all, gpcrypt.sgid.all, selected, selected);
    op.style.color = "#3f4851";
    op.style.cursor = "pointer";
    op.style.backgroundColor = "#d8d8d8";
    selelement.options[selelement.options.length] = op;
  }

  if(showoptions.pos)
  {
    var selected = gpcrypt.sgid.loc == selectedid ? true : false;
    var op = new Option(showoptions.pos, gpcrypt.sgid.loc, selected, selected);
    op.style.color = "#3f4851";
    op.style.cursor = "pointer";
    op.style.backgroundColor = "#d8d8d8";
    selelement.options[selelement.options.length] = op;
  }

  if(showoptions.undef)
  {
    var selected = gpcrypt.sgid.undef == selectedid ? true : false;
    var op = new Option(showoptions.undef, gpcrypt.sgid.undef, selected, selected);
    op.style.color = "#3f4851";
    op.style.cursor = "pointer";
    op.style.backgroundColor = "#d8d8d8";
    selelement.options[selelement.options.length] = op;
  }

  if(showoptions.own)
  {
    var selected = gpcrypt.sgid.own == selectedid ? true : false;
    var op = new Option(showoptions.own, gpcrypt.sgid.own, selected, selected);
    op.style.color = "#3f4851";
    op.style.cursor = "pointer";
    op.style.backgroundColor = "#d8d8d8";
    selelement.options[selelement.options.length] = op;
  }

  if(showoptions.outshare)
  {
    var selected = gpcrypt.sgid.outshare == selectedid ? true : false;
    var op = new Option(showoptions.outshare, gpcrypt.sgid.outshare, selected, selected);
    op.style.color = "#3f4851";
    op.style.cursor = "pointer";
    op.style.backgroundColor = "#d8d8d8";
    selelement.options[selelement.options.length] = op;
  }

  if(showoptions.inshare)
  {
    var selected = gpcrypt.sgid.inshare == selectedid ? true : false;
    var op = new Option(showoptions.inshare, gpcrypt.sgid.inshare, selected, selected);
    op.style.color = "#3f4851";
    op.style.cursor = "pointer";
    op.style.backgroundColor = "#d8d8d8";
    selelement.options[selelement.options.length] = op;
  }


  if(showoptions.newshare) 
  {
    var selected = gpcrypt.sgid.newshare == selectedid ? true : false;
    var op = new Option(showoptions.newshare, gpcrypt.sgid.newshare, selected, selected);
    op.style.color = "#3f4851";
    op.style.cursor = "pointer";
    op.style.backgroundColor = "#d8d8d8";
    selelement.options[selelement.options.length] = op;
  }
  
  if(showoptions.security)
  {
    var selected = gpcrypt.sgid.security == selectedid ? true : false;
    var op = new Option(showoptions.security, gpcrypt.sgid.security, selected, selected);
    op.style.color = "#3f4851";
    op.style.cursor = "pointer";
    op.style.backgroundColor = "#d8d8d8";
    selelement.options[selelement.options.length] = op;
  }

  if(showoptions.alarm)
  {
    var selected = gpcrypt.sgid.alarm == selectedid ? true : false;
    var op = new Option(showoptions.alarm, gpcrypt.sgid.alarm, selected, selected);
    op.style.color = "#3f4851";
    op.style.cursor = "pointer";
    op.style.backgroundColor = "#d8d8d8";
    selelement.options[selelement.options.length] = op;
  }

  if(showoptions.groups && Array.isArray(showoptions.groups))
  {
    //groups.sort(sortgrouparray); // Just to be sure

    for (var i = 0, len_i = showoptions.groups.length; i < len_i; ++i)
    {
      let group = showoptions.groups[i];

      validategroup(group);

      var selected = group.id == selectedid ? true : false;
      var op = new Option(group.name, group.id, selected, selected);
      op.style.color = "#3f4851";
      op.style.cursor = "pointer";
      op.style.backgroundColor = "#FFFFFF";
      selelement.options[selelement.options.length] = op;
    }
  }

  // Now we show all email that we share something with (both ways)

  let selectshares = {};

  // Find inshare emails and id's
  if(showoptions.shares && Array.isArray(showoptions.shares))
  {
    for (var i = 0, len_i = showoptions.shares.length; i < len_i; ++i)
    {
      let share = showoptions.shares[i];

      if(!share.data)
        continue; 

      var gid = -(share.userid) + Number(gpcrypt.sgid.shares);
      var selected = gid == selectedid ? true : false;

      selectshares[share.userid] = {email: share.email, gid: gid, selected: selected};
    }
  }

  // Find outshare emails and id's
  if(showoptions.pass && Array.isArray(showoptions.pass))
  {
    for (var i = 0, len_i = showoptions.pass.length; i < len_i; ++i)
    {
      let pass = showoptions.pass[i];

      if(Array.isArray(pass.shares) || (typeof(pass.shares) !== 'object')) // Test if it is not object
        continue;

      for (let userid in pass.shares) // for/of not supported in IE11
      {
        let intuserid = Number(userid);

        if(intuserid === 0) // we do not like team shares
          continue;

        if(!g.teamobject[intuserid])
          continue;

        let user = g.teamobject[intuserid];

        var gid = -(intuserid) + Number(gpcrypt.sgid.shares);
        var selected = gid == selectedid ? true : false;

        selectshares[intuserid] = {email: user.email, gid: gid, selected: selected};
      }
    }
  }

  for (let id in selectshares) 
  {
    let selectoption = selectshares[id];

    var op = new Option(htmlspecialchars(selectoption.email, ['ENT_QUOTES']), selectoption.gid, selectoption.selected, selectoption.selected);
    op.style.color = "#3f4851";
    op.style.cursor = "pointer";
    op.style.backgroundColor = "#E1EEF4";
    selelement.options[selelement.options.length] = op;
  }
}

// Purpose is to collect teamshares of the same password in different teams (nothing is deleted)
function filterShareData(dbsarray)
{
  let shareidobject = {}; // hold file id that have been included (team shares have a copy pr team they are shared with)
  
  if(!dbsarray)
  {
    return;
  }

  for (let i = 0, len_i = dbsarray.length; i < len_i; ++i)
  {
    let share = dbsarray[i];

    if(share.type !== 'teamshare')
      continue;

    if(!Array.isArray(share.data))
    {
      console.log("Share data is not array");
      continue;
    }

    for (let j = 0, len_j = share.data.length; j < len_j; ++j)
    {
      let sharedata = share.data[j];

      sharedata.filter = {};      

      if(shareidobject[sharedata.id])
      {
        // Add team to original
        shareidobject[sharedata.id].filter.shareteams.push(share.teamid);

        sharedata.filter.shareteams = [];
        sharedata.filter.teamhide = true;
        continue;
      }
      else
      {
        sharedata.filter.teamhide = false;
        sharedata.filter.shareteams = [share.teamid]; 

        shareidobject[sharedata.id] = sharedata; // Store pass here for easy access
      }
    }
  }
}

function addSharesToPass(dbparray, dbsarray, teamobject, gidstart)
{
  if(!Array.isArray(dbparray))
    return false;

  let newarray = pcrypt.jsonparse(pcrypt.jsonstringify(dbparray), true); // Do not modify original password array so we make a deep copy

  for (let i = 0, len_i = newarray.length; i < len_i; ++i)
  {
    newarray[i].passindex = i;
  }

  if(!Array.isArray(dbsarray))
    return newarray;

  let myid = pcrypt.getvalue('userid');

  for (let i = 0, len_i = dbsarray.length; i < len_i; ++i)
  {
    if(!Array.isArray(dbsarray[i].data))
    {
      console.log("Share data is not array");
      continue;
    }

    for (let j = 0, len_j = dbsarray[i].data.length; j < len_j; ++j)
    {
      let share = dbsarray[i];
      let sharedata = share.data[j];

      if(sharedata.filter && sharedata.filter.teamhide)
        continue;

      let hidepass = hidesharepassvalid(myid, share, sharedata, teamobject);

      newarray.push(shareToPass(share, i, j, hidepass, -(share.userid) + gidstart));
    }
  }
  return newarray;
}

function reversegeocode(locinfo, callback)
{
  // Google sadly only support single calls for address

  validatepasspos(locinfo);

  let latlng = locinfo.lat + "," + locinfo.long;

  pcrypt.jsoncom('POST', gpcrypt.basefolder + 'georcode.php?auth=' + pcrypt.getvalue('authsession'), latlng, function jsonrpcgeoreply(http)
  {
    if(http.status == 200)
    {
      try
      {
        var tmpObjreply = JSON.parse(http.responseText);

        if(tmpObjreply.status !== "OK" || tmpObjreply.results.length < 1)
        {
          throw tmpObjreply;
        }

        if(!tmpObjreply.results[0].formatted_address)
        {
          throw tmpObjreply;
        }

        callback(tmpObjreply.results[0].formatted_address);  
      }
      catch(e)
      {
        console.log("Reverse geocoding error", e);
        callback(locinfo.lat + "," + locinfo.long + "," + locinfo.acc);  
      }    
    }
  });
}

function geocodeaddressdialog(callback)
{
  modalprompt(g.lang.passwordeditjs.PCPELOCSEARCHTITLE, g.lang.default.PCPROGRAMTITLE, "", "", 64, null, function(address)
  {
    if(address !== false)
    {
      if(address)
      pcrypt.jsoncom('POST', gpcrypt.basefolder + 'geocode.php?auth=' + pcrypt.getvalue('authsession'), address, function jsonrpcreply(http)
      {
        if(http.status == 200)
        {
          try
          {
             var tmpObjreply = JSON.parse(http.responseText);

             switch(tmpObjreply.results.length)
              {
                case 0:
                  modalalert(g.lang.passwordeditjs.PCPELOCSEARCHRETURN0, g.lang.default.PCPROGRAMTITLE);
                break;

                case 1:
                  var distance = 200;

                  switch(tmpObjreply.results[0].geometry.location_type)
                  {
                    case "ROOFTOP":
                      distance = 50;
                    break;

                    case "APPROXIMATE":
                      var bounds;

                      if(tmpObjreply.results[0].geometry.bounds) // some times it is missing?
                        bounds = tmpObjreply.results[0].geometry.bounds;
                      else
                        bounds = tmpObjreply.results[0].geometry.viewport;

                      distance = getdistance(bounds.northeast.lat, bounds.northeast.lng, bounds.southwest.lat, bounds.southwest.lng)/2;
                    break;
                  }

                  callback({lat: tmpObjreply.results[0].geometry.location.lat, long: tmpObjreply.results[0].geometry.location.lng, acc: distance});
                break;

                default:
                  modalalert(g.lang.passwordeditjs.PCPELOCSEARCHRETURNMANY, g.lang.default.PCPROGRAMTITLE);
                break;
              }
          }
          catch(e)
          {
            alert(http.responseText);
          }
        }
        else
        {
          if(typeof(http) == 'object')
            modalalert('Geocode returned status: ' + http.status, g.lang.default.PCPROGRAMTITLE);
          else if(typeof(http) == 'string')
            modalalert('Geocode returned string status: ' + http, g.lang.default.PCPROGRAMTITLE);
          else
            modalalert('Geocode returned unknown error', g.lang.default.PCPROGRAMTITLE);
        }
      });
      callback(false);
    }
  });
}

/**
 * @description add a location to a password, logic differs for free and premium users.
 * @param {*} field 
 * @param {*} locinfo 
 * @todo restrict one location per password for non premium users
 */
function addselectlocation(field, locinfo)
{
  if(!locinfo)
  {
    modalalert(g.lang.mobilejs.PCAPPNOPOSITION, g.lang.default.PCPROGRAMTITLE);
    return;
  }

  var selectfield = document.getElementById(field);

  if(!selectfield)
  {
    alert('No select field found');
    return;
  }

  let maxpos;

  // If a user has not reached the maximum allowed positions per password, allow addition of positions up to the value of premRes.posax.
  if( pcrypt.getvalue('premium') > 0 )
  {
    maxpos = premRes.posMax;
  }
  else
  {
    maxpos = premRes.posMaxFree;
  }

  if(!selectfield.options || (selectfield.options.length > maxpos ))
  {
    modalalert(g.lang.passwordeditjs.PCPESELECTMAXIMUMENTRIES + ' ' + maxpos, g.lang.default.PCPROGRAMTITLE);
  }

  function reversegeocodecallback(text)
  {        
    selectfield.options[selectfield.length] = new Option(htmlspecialchars(text, ['ENT_QUOTES']), locinfo.lat + "," + locinfo.long + "," + Math.round(locinfo.acc));
    selectfield.selectedIndex = selectfield.length - 1;
    selectfield['data-modified'] = true;  
  };

  if(locinfo.text)
  {
    reversegeocodecallback(locinfo.text);
  }
  else
  {
    reversegeocode(locinfo, reversegeocodecallback);
  }
}

/**
 * Edit a select location at a given elementId.
 * @param {*} field 
 * @param {*} callback 
 */
function editselectlocation(field, callback)
{
  let selectfield = document.getElementById(field);

  if(!selectfield.options.length)
  {
    modalalert(g.lang.passwordeditjs.PCPESELECTNOITEMS, g.lang.default.PCPROGRAMTITLE);
    return;
  }

  let option = selectfield.options[selectfield.selectedIndex];
  let locarray = option.value.split(',', 3);
  let html = "";

  // TODO - Translate
  // <button type="button" class="btn-default btn" name="button-1581890926454" access="false" style="default" id="button-1581890926454">Button</button>

  html += '<label for="title" class="">' + g.lang.passwordeditjs.PCPELOCEDITLOCTEXTTITLE + '</label><input type="text" value="' + option.text + '" class="" name="title" access="false" id="title">';
  html += '<label for="lat" class="">' + g.lang.passwordeditjs.PCPELOCEDITLOCLATTITLE + '</label><input type="text" value="' + locarray[0] + '" class="" name="lat" access="false" id="lat">';
  html += '<label for="long" class="">' + g.lang.passwordeditjs.PCPELOCEDITLOCLONGTITLE + '</label><input type="text" value="' + locarray[1] + '" class="" name="long" access="false" id="long">';
  html += '<label for="acc" class="">' + g.lang.passwordeditjs.PCPELOCEDITLOCACCTITLE + '</label><input type="text" value="' + locarray[2] + '" class="" name="acc" access="false" id="acc">';

  modalhtml(html, 350, g.lang.passwordeditjs.PCPELOCEDITTITLE, true, false, function (form) 
  {
    if (form === false)
    {
      if(callback)
        callback(false);
      return;
    }

    let locinfo = {};

    locinfo.text = htmlspecialchars(form.title, ['ENT_QUOTES']);
    locinfo.lat = htmlspecialchars(form.lat, ['ENT_QUOTES']);
    locinfo.long = htmlspecialchars(form.long, ['ENT_QUOTES']);
    locinfo.acc = htmlspecialchars(form.acc, ['ENT_QUOTES']);

    validatepasspos(locinfo);

    option.text = locinfo.text;
    option.value = locinfo.lat + "," + locinfo.long + "," + locinfo.acc;
    selectfield['data-modified'] = true;

    if(callback)
      callback(true);
  });
}

function deleteselectlocation(field, callback)
{
  var selectfield = document.getElementById(field);

  if(!selectfield.options.length)
  {
    modalalert(g.lang.passwordeditjs.PCPESELECTNOITEMS, g.lang.default.PCPROGRAMTITLE);
    if(callback)
      callback(false);
    return;
  }

  modalconfirm(g.lang.passwordeditjs.PCPELOCDELETETITLE + htmlspecialchars(selectfield.options[selectfield.selectedIndex].text, ['ENT_QUOTES']), g.lang.default.PCPROGRAMTITLE, function(result)
  {
    if(result)
    {
      selectfield.remove(selectfield.selectedIndex);
      selectfield['data-modified'] = true;
      //sumoSelectReload(selectfield);
    }

    if(callback)
      callback(result);
  });
}

function showselectlocations(field, locinfo, windowname)
{
  var selectfield = document.getElementById(field);
  var url = gpcrypt.basefolder + 'geoshow.php?auth=' + pcrypt.getvalue('authsession');

  if(selectfield)
  {
    if(selectfield.options.length)
    {
      var locArray = [];

      for (var i = 0, len_i = selectfield.options.length; i < len_i; ++i)
      {
          locArray.push(selectfield.options[i].value);
      }

      url += '&points=' + locArray.join(';');
    }
    else
    {
      modalalert(g.lang.passwordeditjs.PCPESELECTNOITEMS, g.lang.default.PCPROGRAMTITLE);
      return;
    }
  }

  if(locinfo)
  {
    url += '&currenttext=' + g.lang.passwordeditjs.PCPELOCMYLOCATION + '&current=' + locinfo.lat + ',' + locinfo.long + ',' + locinfo.acc;
  }

  var newWin = window.open(url, windowname, ''); // TODO - does not create a handle on mobile devices as they open in external browser

	if(!newWin || newWin.closed || typeof newWin.closed=='undefined') 
	{ 
	    modalalert(g.lang.default.PCPOPUPBLOCKED, g.lang.default.PCPROGRAMTITLE);
	}
}

function getselectlocations(selectfield, pass)
{
  if(pass.pos)
  {
    if(selectfield['data-modified'] === false)
      return;

    pass.pos.length = 0;
  }
  else
  {
    pass.pos = [];
  }

  if(selectfield.options.length)
  {
    for (let i = 0, len_i = selectfield.options.length; i < len_i; ++i)
    {
        let locarray = selectfield.options[i].value.split(',', 3);
        let locinfo = {};

        locinfo.text = selectfield.options[i].text;
        locinfo.lat = locarray[0];
        locinfo.long = locarray[1];
        locinfo.acc = locarray[2];

        pass.pos.push(locinfo);
    }
  }
}

function setselectlocations(selectfield, locarray)
{
  selectfield.length = 0;

  if(locarray && locarray.length)
  {
    for (let i = 0, len_i = locarray.length; i < len_i; ++i)
    {
      let locinfo = locarray[i];
      let text;

      if(locinfo.text)
        text = locinfo.text;
      else
        text = locinfo.lat + "," + locinfo.long + "," + locinfo.acc;

      let op = new Option(text, locinfo.lat + "," + locinfo.long + "," + locinfo.acc);
      selectfield.options[i] = op;
    }
  }

  selectfield['data-modified'] = false;

  return true;
}

// File functions below
function arrayBufferToBase64(buffer, type) // TODO - can in the future be replaced with TextEncoding
{
    var binary = '';

    if(!(buffer instanceof Uint8Array))
      buffer = new Uint8Array(buffer);

    var len = buffer.byteLength;

    for (var i = 0; i < len; i++)
    {
        binary += String.fromCharCode( buffer[ i ] );
    }

    return {info: 'pcrypt', type: type, ver: 1, enc: 'base64', data: window.btoa( binary )};
}

function base64ToTypeBuffer(base64obj) // TODO - can in the future be replaced with TextEncoding
{
    if(!base64obj)
      throw "ENC info missing";

	  if(base64obj.info !== 'pcrypt') // data
		  throw "ENC info with unknown info";

	  if(base64obj.type === 'encoding') // type from old version
		  base64obj.type = null;

	  if(base64obj.ver !== 1) // version test
		  throw "ENC info with unknown version";

	  if(base64obj.enc !== 'base64') // encoding test
		  throw "ENC info with unknown encoding";

    var binary_string =  window.atob(base64obj.data);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)
    {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return {type: base64obj.type, buffer: bytes.buffer};
}

function stringToTypeBuffer(string, type) // TODO - can in the future be replaced with TextEncoding
{
    var len = string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)
    {
        bytes[i] = string.charCodeAt(i);
    }
    return {type: type, buffer: bytes.buffer};
}

function handleFileStoringAndSharing(filedata, passdata)
{
  if(filedata) 
  {
    // is data arrays;
    if(!Array.isArray(filedata.fileid))
    {
      console.log('Fileid not array');
      return;
    }

    if(!Array.isArray(filedata.data))
    {
      console.log('Data not array');
      return;
    }

    // Same count in the 2 arrays
    if(filedata.fileid.length !== filedata.data.length)
    {
      console.log('Array lengths does not match');
      return;
    }
  }

  if(passdata.shares && Object.keys(passdata.shares).length) // If we have somebody that share the data
  {
    passdata.sharechanges = findShareChanges({}, passdata.shares);

    if(filedata == false) // If no files to store just share right away
    {
      buildShareData(g.pass, g.teamobject, filedata);
      return;
    }

    // Encrypt all new files and store in DB (background process to allow quick UI)
    pcrypt.workercall({method: 'encrypt', id: 'storefilesandshare', param: filedata.fileid, filedata: filedata.data, keydata: pcrypt.getvalue('keycrypt')});

    return;
  }  

  if(filedata) // Not shared data
  {
    // Encrypt all new files and store in DB (background process to allow quick UI)
    pcrypt.workercall({method: 'encrypt', id: 'storefiles', param: filedata.fileid, filedata: filedata.data, keydata: pcrypt.getvalue('keycrypt')});
  }
}

function getselectfiles(selectfield, pass)
{
  // TODO
  // Add compression parameter to pcrypt.setdata and pcrypt.getdata (set to true for big files)
  // Test limit of HTML data-* Attributes size (if we need to handle it in some other way)
  // Change text for to many bytes to store
  // Change logic so the system check number of files added before file select box


  if(selectfield['data-modified'] !== true)
  {
    //buildShareData(g.pass, g.teamobject, false);
    return false;
  }

  pass.files = [];

  var arrayname = [];
  var arraydata = [];

  // Find new files added
  for (var i = 0, len_i = selectfield.options.length; i < len_i; ++i)
  {
    var op = selectfield.options[i];
    var fileinfo = {};

    fileinfo.name = op.text;

    if(op['data-file']) // New file or old system
    {
		  // Special handling when storing files
		  var dataobj = op['data-file'];

		  fileinfo.fileid = randomString(pcrypt.randomidlength); // Generate random ID
		  fileinfo.filetype = dataobj.type;

		  arrayname.push(fileinfo.fileid);
		  arraydata.push(window.atob(dataobj.data)); // This is needed to allow it to be part of a json structure but increase size :-(
	  }
	  else
	  {
      fileinfo.fileid = op['data-fileid'];
		  fileinfo.filetype = op['data-filetype'];
	  }

	  pass.files.push(fileinfo);
  }

  // Find fileid's that has been deleted and flag them in the array
  if(Array.isArray(selectfield['data-delete']))
  {
    let datadelete = selectfield['data-delete'];

    for (var i = 0, len_i = datadelete.length; i < len_i; ++i)
    {
      arrayname.push(datadelete[i]);
      arraydata.push(null);
    }
  }

  return {fileid: arrayname, data: arraydata};
}

function setselectfiles(selectfield, pass)
{
  selectfield.length = 0;

  if(Array.isArray(pass.files))
  {
    for (var i = 0, len_i = pass.files.length; i < len_i; ++i)
    {
      let file = pass.files[i];

      if(typeof file === "object")
      {
        var op = new Option(file.name);

        if(file.data)
        {
          op['data-file'] = file.data;  // Old system where file is saved with password
        }
        else
        {
          if(file.sourceid)
          {
            op['data-fileid'] = file.sourceid; // Needed for backward compability because of new DB structure after teamshare (1/1-2021)
          }
          else
          {
            op['data-fileid'] = file.fileid;
          } 

		      op['data-filetype'] = file.filetype;
        }

        selectfield.options[i] = op;
      }
    }

    if(pass.share) // Detection of shares (have to be like this to maintain backward compabillity after team sharing)
    {
      selectfield['data-shareuserid'] = pass.share.userid;
      selectfield['data-sharetype'] = pass.share.type;      

      switch(pass.share.type)
      {
        default:
        case 'usershare':
          selectfield['data-sharekeyid'] = false;
          selectfield['data-shareteamid'] = false;
        break;

        case 'teamshare':
          selectfield['data-sharekeyid'] = pass.share.keyid;
          selectfield['data-shareteamid'] = pass.share.teamid;;
        break;
      }
    }
    else
    {
      selectfield['data-shareuserid'] = false;
    }

    selectfield['data-modified'] = false;
    selectfield['data-delete'] = false;
  }
  else
  {
    return false;
  }

  return true;
}

/**
 * Function for uploading files
 * @param {String} field the HTML element to look for
 * @param {String} name the name of the file
 * @param {any} type file type
 * @param {object} arrayBuffer UInt8Array Object
 */
function selectuploadfile(field, name, type, arrayBuffer)
{
  var opts = pcrypt.getvalue('options');

  if(opts.disablefiles === true)
  {
    modalalert(g.lang.default.PCNOFEATUREACCESS, g.lang.default.PCPROGRAMTITLE);
    return;
  }

  var selectfield = document.getElementById(field);
  var totalFiles = g.pass.reduce(function(accumulator, currentValue) // Count files user owns
  { 
    return accumulator + currentValue.files.length
  }, 0);

  if (!selectfield)
  {
    return;
  }

  if(pcrypt.getvalue('premium')>0 && selectfield.options.length >= premRes.fileMax)
  {
    modalalert('<div class="popup">'+g.lang.passwords.PCMAXFILESPREMIUM+'</div>', g.lang.default.PCPROGRAMTITLE);
    return;
  }

  if(pcrypt.getvalue('premium')<1 && selectfield.options.length >= premRes.filePerPassFree)
  {
    modalalert('<div class="popup">'+g.lang.passwords.PCFILEPERPASSFREE+'</div>', g.lang.default.PCPROGRAMTITLE);
    return;
  }

  if(pcrypt.getvalue('premium')<1 && totalFiles >= premRes.fileMax)
  {
    modalalert('<div class="popup">'+g.lang.passwords.PCMAXTOTALFILESFREE+'</div>', g.lang.default.PCPROGRAMTITLE);
    return;
  }

  var selected = new Option(name);
  loader(true);

  var arrayBuffer = new Uint8Array(arrayBuffer);

  selected['data-file'] = arrayBufferToBase64(arrayBuffer, type);

  selectfield.options[selectfield.length] = selected;
  selectfield.selectedIndex = selectfield.length - 1;
  //sumoSelectReload(selectfield);

  selectfield['data-modified'] = true;

  loader(false);
}

function selectdeletefile(field, callback)
{
  var opts = pcrypt.getvalue('options');
  
  if(opts.disablefiles === true)
  {
    modalalert('<div class="popup">'+g.lang.passwords.PCNOFEATUREACCESS+'</div>', g.lang.default.PCPROGRAMTITLE);
    return;
  }

  var selectfield = document.getElementById(field);

  if(!selectfield.options.length)
  {
    modalalert('<div class="popup">'+g.lang.passwordeditjs.PCPESELECTNOITEMS+'</div>', g.lang.default.PCPROGRAMTITLE);
    if(callback)
      callback(false);
    return;
  }

  var selected = selectfield.options[selectfield.selectedIndex];

  modalconfirm(g.lang.passwordeditjs.PCPEFILEDELETETITLE + htmlspecialchars(selected.text, ['ENT_QUOTES']), g.lang.default.PCPROGRAMTITLE, function(result)
  {
    if(result)
    {
      if(selected['data-fileid'])
      {
        if(!Array.isArray(selectfield['data-delete']))
          selectfield['data-delete'] = [];

        selectfield['data-delete'].push(selected['data-fileid']);
      }

      selectfield.remove(selectfield.selectedIndex);
      selectfield['data-modified'] = true;
    }

    if(callback)
      callback(result);
  });
}

function selectdownloadfile(field)
{
  initfilescallback(field, 'notused', "save");
}

function selectshowfile(field, windowname)
{
  initfilescallback(field, windowname, "show");
}

function initfilescallback(field, windowname, fileaction)
{
  var opts = pcrypt.getvalue('options');

  if(opts.disablefiles === true)
  {
    modalalert('<div class="popup">'+g.lang.default.PCNOFEATUREACCESS+'</div>', g.lang.default.PCPROGRAMTITLE);
    return;
  }

  var selectfield = document.getElementById(field);

  if(!selectfield.options.length)
  {
    modalalert(g.lang.passwordeditjs.PCPESELECTNOITEMS, g.lang.default.PCPROGRAMTITLE);
    return;
  }

  loader(true);

  var selected = selectfield.options[selectfield.selectedIndex];
  let fileinfolabel = randomString(pcrypt.randomidlength); // Just to send fileinfo struct to callback

  if(selected['data-file']) // Detect old integrated format
  {
    var myTypeBuffer = base64ToTypeBuffer(selected['data-file']);

    switch(fileaction)
    {
      default:
      case 'save':
        saveDataAsFile(selected.text, 'application/octet-binary', myTypeBuffer.buffer);
      break;

      case 'show':
        showDataInBrowser(windowname, myTypeBuffer.type, myTypeBuffer.buffer);
      break;
    }

    loader(false);
  }
  else if(selected['data-fileid'])
  {
    if(selectfield['data-shareuserid']) // Have to maintain backward compability (this was the old way to detect shares)
    {
      switch(selectfield['data-sharetype'])
      {
        default:
        case 'usershare':
          pcrypt.setvalue(fileinfolabel, 
          {
            fileid: selected['data-fileid'],
            filetype: selected['data-filetype'], 
            filename: selected.text,
            action: fileaction, 
            windowname: windowname, 
            type: selectfield['data-sharetype'], 
            userid: selectfield['data-shareuserid']
          });
          pcrypt_teamgetbinary(pcrypt.getvalue('session'), selectfield['data-shareuserid'], selected['data-fileid'], fileinfolabel, handlefilescallback);
        break;

        case 'teamshare':
          pcrypt.setvalue(fileinfolabel, 
          {
            fileid: selected['data-fileid'],
            filetype: selected['data-filetype'],
            filename: selected.text, 
            action: fileaction, 
            windowname: windowname, 
            type: selectfield['data-sharetype'], 
            teamid: selectfield['data-shareteamid'], 
            keyid: selectfield['data-sharekeyid']
          });

          pcrypt_teamgetteambinary(pcrypt.getvalue('session'), selectfield['data-shareteamid'], selected['data-fileid'], fileinfolabel, handlefilescallback);
        break;
      }
    }
    else
    {
      pcrypt.setvalue(fileinfolabel, 
      {
        fileid: selected['data-fileid'],
        filetype: selected['data-filetype'], 
        filename: selected.text,
        action: fileaction, 
        windowname: windowname, 
        type: 'private'
      });
      pcrypt_getbinary(pcrypt.getvalue('session'), selected['data-fileid'], fileinfolabel, handlefilescallback);
    }
  }
  else
  {
    console.log("No file handle found");
    loader(false);
  }
}

function handlefilescallback(data, error, fileinfolabel)
{
  if(error)
  {
    handlepcrypterror(error, data);
    return;
  }

  let fileinfo = pcrypt.getvalue(fileinfolabel);
  pcrypt.deletevalue(fileinfolabel);

  if(!fileinfo) // Test if it is a share
  {
    console.log("Invalid fileinfo: ", fileinfo);
    loader(false);
    return;
  }

  var encryptkey = false;
  var dataptr = false;
    
  switch(fileinfo.type)
  {
    default:
    case 'private':
      encryptkey = pcrypt.getvalue('keycrypt');
      dataptr = data[fileinfo.fileid];
    break;

    case 'usershare':
      if(!g.teamobject[fileinfo.userid] || !g.teamobject[fileinfo.userid].publickey)
      {
        console.log("Invalid public key: ", fileinfo);
        loader(false);
        return;
      }

      let publickey = pcrypt.decodeasymetrickeys(g.teamobject[fileinfo.userid].publickey);

      encryptkey = pcrypt.getsharedsecret(pcrypt.getvalue('privatekey'), publickey);
      dataptr = data[fileinfo.fileid];
    break;

    case 'teamshare':            
      if(data[fileinfo.fileid] && isset(data[fileinfo.fileid].keyid) && (data[fileinfo.fileid].teamid == fileinfo.teamid)) // NB: Keyid can be different for password vs files
      {
        let teamkeys = handleTeamKeys([fileinfo.teamid], false, false, false);

        if(teamkeys[fileinfo.teamid] && teamkeys[fileinfo.teamid][data[fileinfo.fileid].keyid])
          encryptkey = teamkeys[fileinfo.teamid][data[fileinfo.fileid].keyid];

        dataptr = data[fileinfo.fileid].data;
      }
      else
      {
        console.log("Invalid team or file info: ", fileinfo);
      }
    break; 
  }

  if(!dataptr)
  {
    console.log("No data returned from server: ", fileinfo);
    loader(false);
    return;
  }

  if(encryptkey === false)
  {
    console.log("Invalid decrypt key: ", fileinfo);
    loader(false);
    return;
  }

  var decryptString = pcrypt.decryptstring(encryptkey, dataptr);

  if(decryptString === false)
  {
    console.log(pcrypt.sha256(encryptkey));          
    console.log("Error during decryption: ", fileinfo);
    loader(false);
    return;
  }

  var myTypeBuffer = stringToTypeBuffer(decryptString, fileinfo.filetype);
  
  switch(fileinfo.action)
  {
    default:
    case 'save':
      saveDataAsFile(fileinfo.filename, 'application/octet-binary', myTypeBuffer.buffer);
    break;

    case 'show':
      showDataInBrowser(fileinfo.windowname, myTypeBuffer.type, myTypeBuffer.buffer);
    break;
  }

  loader(false);
}

function showDataInBrowser(windowName, dataType, dataToShow)
{
    if(!dataType)
    {
      modalalert(g.lang.passwordeditjs.PCPEUNKNOWNFILETYPE, g.lang.default.PCPROGRAMTITLE);
      return;
    }

    var mimeArray = dataType.split("/");
    var validMimeType = false;

    switch(mimeArray[0])
    {
      case 'image':
      case 'text':
      case 'audio':
      case 'video':
        validMimeType = true;
      break;

      case 'application':
        
        // Test special case
        if(dataType == 'application/pdf') // navigator.mimeTypes is empty in Firefox for some reason (but supported by all desktop browsers)
        {
          validMimeType = true;
        }
        else if(navigator.mimeTypes && navigator.mimeTypes[dataType] && navigator.mimeTypes[dataType].enabledPlugin)
        {
          validMimeType = true;
        }

      break;
    }

    if(validMimeType === false)
      dataType = null;

    if(dataType)
    {
      //var dataView = new DataView(myArrayBuffer.buffer);
      //var file = new Blob([dataView], {type: myArrayBuffer.type});

      var FileAsBlob = new Blob([dataToShow], {type: dataType});

      var fileURL = URL.createObjectURL(FileAsBlob);
      var newWin = window.open(fileURL, windowName, ''); // TODO -does not create a handle on mobile devices as they open in external browser

    	if(!newWin || newWin.closed || typeof newWin.closed=='undefined') 
    	{ 
    	    modalalert(g.lang.default.PCPOPUPBLOCKED, g.lang.default.PCPROGRAMTITLE);
    	}
    }
    else
    {
      modalalert(g.lang.passwordeditjs.PCPEUNKNOWNFILETYPE, g.lang.default.PCPROGRAMTITLE);
      return;
    }
}

function saveDataAsFile(fileName, dataType, dataToWrite)
{
    var FileAsBlob = new Blob([dataToWrite], {type: dataType});

    function destroyClickedElement(event)
    {
	    document.body.removeChild(event.target);
    }

    var downloadLink = document.createElement("a");
    downloadLink.download = fileName;
    downloadLink.innerText = "Download File";
    if (window.URL != null)
    {
        // Chrome allows the link to be clicked
        // without actually adding it to the DOM.
        downloadLink.href = window.URL.createObjectURL(FileAsBlob);
    }
    else
    {
        // Firefox requires the link to be added to the DOM
        // before it can be clicked.
        downloadLink.href = window.URL.createObjectURL(FileAsBlob);
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
    }

    downloadLink.click();
}

/**
 * @description 
 * Calls the api to get icon data from DB.
 * If unforced will also check against time if the icons data should be updated now.
 * If forced will attempt to get favicon data from DB regardless of time.
 * @param {Array} passArray password object array.
 * @param {Boolean} force Optional boolean to force update.
 */
function getfavicons(passArray, force)
{
  if(!Array.isArray(passArray) || passArray.length<1)
  {
    return false;
  }
  
  if(pcrypt.getvalue('icons') && Object.getOwnPropertyNames(JSON.parse(pcrypt.getvalue('icons'))).length > 0 && force !== true)
  {
    var timeNow = new Date();
    if(timeNow <= new Date(pcrypt.getvalue('nextIconUpdate')))
    {
      g.icons = JSON.parse(pcrypt.getvalue('icons'));
      return false;
    }
  }

  var faviconURLs = [];
  for(var i = 0; i < passArray.length; i++)
  {
    if(passArray[i] && passArray[i].url)
    {
      // Test if valid url, if not, continue
      if(!faviconURLs.includes(parseUri(passArray[i].url).host))
      {
        faviconURLs.push(parseUri(passArray[i].url).host);
      }
    }
  }

  pcrypt_getfavicon(pcrypt.getvalue('session'), faviconURLs, 0, function(data, error)
  {
    if(error)
    {
      handlepcrypterror(error, data);
      g.icons = {};
    }

    if(data)
    {
      var timeForNextUpdate = new Date(new Date().getTime()+3600000);
      g.icons = data;
      pcrypt.setvalue('icons', JSON.stringify(data));
      pcrypt.setvalue('nextIconUpdate', timeForNextUpdate);
    }
  });
}

function getdistance(lat1,lon1,lat2,lon2)
{
  var R = 6371000; // Radius of the earth in meters
  var dLat = (lat2-lat1).toRad();  // Javascript functions in radians
  var dLon = (lon2-lon1).toRad();
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c); // Distance in meters
}

function locoverlap(lat1, lon1, acc1, lat2, lon2, acc2)
{
  if(typeof lat1 != 'number')
    lat1 = Number(lat1);

  if(typeof lon1 != 'number')
    lon1 = Number(lon1);

  if(typeof acc1 != 'number')
    acc1 = Number(acc1);

  if(acc1 <= 0)
    acc1 = 100;

  if(typeof lat2 != 'number')
    lat2 = Number(lat2);

  if(typeof lon2 != 'number')
    lon2 = Number(lon2);

  if(typeof acc2 != 'number')
    acc2 = Number(acc2);

  if(acc2 <= 0)
    acc2 = 100;

  var distmeters = getdistance(lat1,lon1,lat2,lon2);

  if((acc1 + acc2) >= distmeters)
    return true;
  else
    return false;
}

function locationarrayatpoint(locarray, lat, long, acc)
{
  if(locarray)
  {
    for (var i = 0, len_i = locarray.length; i < len_i; ++i)
    {
      try
      {
        if(locoverlap(lat, long, acc, locarray[i].lat, locarray[i].long, locarray[i].acc))
        {
          return true;
        }
      }
      catch(err)
      {
        return false;
      }
    }
  }

  return false;
}

function getShareTeams(sharedata)
{
  let shareteams;

  // This is to handle teamshares (not to show multiple copies)
  if(sharedata.filter && sharedata.filter.shareteams)
    shareteams = sharedata.filter.shareteams;
  else
    shareteams = sharedata.shareteams;

  if(!shareteams || !Array.isArray(shareteams))
    return false;

  return shareteams;
}


/**
 * @description function for showing share info
 * @param {*} dbshares 
 * @param {*} index0 
 * @param {*} index1 
 * @param {*} teamobject 
 * @param {*} callback 
 */
function showshareinfo(dbshares, index0, index1, teamobject, callback)
{
  if(dbshares.length <= index0)
    return false;

  if(dbshares[index0].data.length <= index1)
    return false;

  var shareuser = dbshares[index0];
  var sharedata = shareuser.data[index1];
  var sharetext = "";
  var teamsarray = new Array();
  var email = htmlspecialchars(shareuser.email, ['ENT_QUOTES']);
  //var name = teamobject[shareuser.userid][sharedata.shareteams[0]].name;
  //var department = teamobject[shareuser.userid][sharedata.shareteams[0]].department;

  if(sharedata.shareteams && Array.isArray(sharedata.shareteams))
  {
  	let userinfo = {};
    let teamlabel = '';
    let shareteams;

    shareteams = getShareTeams(sharedata);

    if(!shareteams)
      return false;

    for(var i = 0, len = shareteams.length; i < len; i++)
    {
      if(teamobject[shareuser.userid] && teamobject[shareuser.userid][shareteams[i]])
      {
        teamsarray.push(htmlspecialchars(teamobject[shareuser.userid][shareteams[i]].teamname, ['ENT_QUOTES']));// +
        userinfo = teamobject[shareuser.userid][shareteams[i]];
      }
    }

    switch(shareuser.type)
    {
        default:
        case 'usershare':
          teamlabel = g.lang.passwordsjs.PCPASSWORDSSHARETEXT2;
        break;

        case 'teamshare':
          teamlabel = g.lang.passwordsjs.PCPASSWORDSSHARETEXT2TEAM;
        break;
    }

    // Shared with everybody in teams
    // Shared with you through teams

    if(teamsarray-length === 0)
        teamsarray.push('#');

    let popoverInfoContent = getPopoverContent(userinfo);

    sharetext = g.lang.passwordsjs.PCPASSWORDSSHARETEXT1 + ": <a href='index.html?page=messages&email=" + email + "' data-toggle='popover' data-placement='bottom' title='Information' data-html='true' data-content='" + popoverInfoContent + "' data-trigger='hover'>" + getMailNameFromId(teamobject, shareuser.userid) + "</a>" +
    "<hr>" + teamlabel + ":<ul class='list'><li>" + teamsarray.join("<li>") + "</ul><br><br>";

/*
    sharetext = g.lang.passwordsjs.PCPASSWORDSSHARETEXT1 + ": <a href='mailto:" + email + "?subject=" + g.lang.default.PCTEAMMAILTITLE + "'>" + email + "</a>" +
    "<br><br>" + g.lang.passwordsjs.PCPASSWORDSSHARETEXT2 + ":<ul><li>" + teamsarray.join("<li>") + "</ul>";
*/
    modalalert(sharetext, g.lang.passwordsjs.PCPASSWORDSTITLESHAREINFO, callback);

    return true;
  }
  else
  {
    console.log('Unabel to show share info as shareteams is not valid');
  }

  return false;
}

function decryptmaildata(data, teamobject)
{
  var datalength;

  if(!data)
    return false;

  if(!data.from)
    return false;

  if(!Array.isArray(data.from))
    return false;

  if(typeof teamobject !== 'object')
    return false;

  datalength = data.from.length;
  for (var i = 0; i < datalength; i++)
  {
    data.from[i].data = pcrypt.decryptdata(pcrypt.getvalue('keycrypt'), data.from[i].data);
  }

  if(!data.to)
    return false;

  if(!Array.isArray(data.to))
    return false;

  var privatekey = pcrypt.getvalue('privatekey');

  datalength = data.to.length;
  for (var i = datalength - 1; i >= 0; i--)
  {
    if(!teamobject[data.to[i].remoteid]) // is user still part of that team
    {
      // Do not delete it on server as the user may be part of team later on again
      data.to.remove(i);
      continue;
    }

    var publickey = pcrypt.decodeasymetrickeys(teamobject[data.to[i].remoteid].publickey);
    var sharedkey = pcrypt.getsharedsecret(privatekey, publickey);

    data.to[i].data = pcrypt.decryptdata(sharedkey, data.to[i].data);
  }

  return data;
}

function initpcryptnotification(delay, callback)
{
  var session = pcrypt.getvalue('session');

  if(session && (pcrypt.getvalue('options').disableteams === false))
  {
    setTimeout(function() // We have to read in the shares first
    {
      if(typeof(EventSource) !== "undefined") // Is SSE supported!
      {
        gpcrypt.esource = new EventSource(pcrypt.urlsse + '?auth=' + pcrypt.getvalue('authsession'));

        gpcrypt.esource.addEventListener('error', function(e)
        {
    			//console.log(e);
    		}, false);

        gpcrypt.esource.addEventListener('open', function(e)
        {
          // Connection was opened.
          //console.log(e);
        }, false);

        gpcrypt.esource.addEventListener('ping', function(e)
        {
          //var data = JSON.parse(e.data);
          //console.log(e);
        }, false);

        gpcrypt.esource.addEventListener('message', function(e)
        {
          if(e.origin !== pcrypt.urldomain)
          {
            console.log("SSE wrong domain");
            return;
          }

          // Test if user is still logged in (stop if false)
          if(!validlogin())
          {
            gpcrypt.esource.close();
            console.log("SSE no login");
            return;
          }

          var dataobj = null;

          try
          {
            //console.log(e.data);
            dataobj = pcrypt.jsonparse(e.data);
          }
          catch (e)
          {
            console.log("SSE JSON parse error");
          }
          finally
          {
            if(dataobj)
              checksharenotification(dataobj, callback);
          }
        }, false);
      }
      else
      {
        // Check regualy with longer interval if SSE is not supported
        gpcrypt.checksharetimer = setInterval(function() { checksharenotification(null, callback); }, 900000); // 15 minutes interval check
      }
     }, delay);

     return true;
  }
  else
  {
    return false;
  }
}

function checksharenotification(dataobj, callback)
{
  // TODO - delete language text PCLOGINNEWMESSAGES (not used anymore)

  var session = pcrypt.getvalue('session');

  if(session)
  {
    if(dataobj)
    {
        //console.log(dataobj);
        callback(dataobj);
    }
    else
    {
      if(pcrypt.getvalue('options').disableteams !== true)
      {
        pcrypt_teamcheckshare(session, 0, function checkteamsharefunc(data, error, id)
        {
          if(error)
          {
            clearInterval(gpcrypt.checksharetimer);

            switch(error)
            {
              case 14:
                pcrypt.flushvalues();
                redirectinvalidlogin();
              return;

              default:
                console.log(data);
              return;
            }
          }

          callback(data);

         });
       }
    }
  }
}

/**
 * Clear input field with "Clear"-icon
 * @param id
 * @param onClearFunction
 */
function addClearSearchIcon(id, onClearFunction)
{
  let clearSelector = ".clear-search.cs-" + id;
  let inputSelector = "#" + id;

	$( "<div class='clear-search cs-" + id + "'></div>" ).insertAfter( "#" + id );
	$(inputSelector).on('change input paste keyup mouseup', function()
	{
		if ($(this).val() === "")
		{
			$('.clear-search.cs-' + id).hide();
		}
		else
		{
			$('.clear-search.cs-' + id).show();
		}
	});

	// Show from start, if value is set
	if ($(inputSelector).val() !== "")
	{
    $(clearSelector).show();
	}

	$(clearSelector).click(function()
	{
    let inputSelector = "#" + id;
		$(inputSelector).val('');
		$(this).hide();
		onClearFunction();
		$(inputSelector).focus();
	});
}

/**
 * Remove the "Clear"-icon
 * @param id
 */
function removeClearSearchIcon(id) {
  let clearSelector = ".clear-search.cs-" + id;
  $('#' + id).off('change input paste keyup mouseup');
  $(clearSelector).off();
  $(clearSelector).remove();
}

function timeout(func, ms) {
	if (typeof ms == 'undefined') {
		ms = 10;
	}
	setTimeout(func, ms);
}

/**
 * Remove data from user object in objshares and only keep hash values
 * @param {object} objshares 
 */
/*
function removeDataFromShares(objshares)
{
  for(var user in objshares)
  {
    delete objshares[user].data;

    // This is needed because it is not a reference after convertion to JSON
    for(var hash in objshares[user].datahash)
      objshares[user].datahash[hash] = {};
  }
}
*/

/**
 * @description Marks new shares, used to indicate for a user that a password is new
 * @param {array} sharedata 
 * @param {object} oldshareid 
 * @returns {object} of share changes
 */
function markNewShares(sharedata, oldshareids)
{
  //let sharechanges = 0;
  let idobject = {};

  if((typeof oldshareids !== 'object') || Array.isArray(oldshareids))
    return false;

  if(!Array.isArray(sharedata))
    return false;

  for (let i = sharedata.length - 1; i >= 0; i--)
  {
    let share = sharedata[i];

    for (let j = share.data.length - 1; j >= 0; j--)
    {
      let data = share.data[j];
      let id;

      if(data.filter && data.filter.teamhide) // Do not include hidden shares
        continue;

      //debugger;

      // Make a copy to exclude shareteams in the hash

      let datahash = pcrypt.sha256(pcrypt.jsonstringify(data)).substring(0, pcrypt.randomidlength); // Limit length for security and speed/memory

      if(!data.id) // We have to support old shares that do not have any ID value
      {
        console.log('Old shares without ID detected');
        id = datahash; 
      }
      else
      {
        id = pcrypt.sha256(data.id + share.type).substring(0, pcrypt.randomidlength); // We need to get 2 different entries based on type (same pass can be shown 2 times)
      }

      data.sharechange = false; // No change as default value

      if(oldshareids[id])
      {
        if(oldshareids[id] !== datahash)
        {
          data.sharechange = true;
        }
      }
      else
      {
        data.sharechange = true;
      }

      idobject[id] = datahash;
    }
  }

  return idobject;
}

function findNewAlarms(passdata)
{
  let alarms = 0;
  let currenttime = (new Date()).getTime();
  let startalarm, nextalarm;

  startalarm = nextalarm = currenttime + 31556952000; // Add one year

  for(let i = 0, len_i = g.pass.length; i<len_i; ++i)
  {
    let pass = g.pass[i];

    if(!pass.alarm)
      continue;

    if(pass.alarm <= currenttime)
    {
      alarms++;
    }
    else if (pass.alarm < nextalarm)
    {
      nextalarm = pass.alarm;
    }
  }

  // Save next alarm on server unencrypted
  if(startalarm > nextalarm)
  {
    let datastring = pcrypt.jsonstringify(nextalarm);

    pcrypt_setdata(pcrypt.getvalue('session'), 'nextpassalarm', datastring, pcrypt.sha256(datastring), false, 0, function(){}); 
  }

  return alarms;
}

// Performed at the first login
function checkLoginAction(session, first, callback)
{
  //first = true;

  if(!first)
  {
    if(callback)
      callback(first);

    return false;
  }

  // Test that there is no current saved data (extra test)
  pcrypt_getlist(session, false, 0, function getlistcallback(data, error, id)
  {
    if(!error && (data.length === 0))
    {
      // [{id: 0, cre: "", upd: "", name: "Privat"},{id: 1, cre: "", name: "Arbejde"},{id: 2, cre: "", name: "Sociale medier"}];
      var defaultgroups = pcrypt.jsonparse(g.lang.default.PCDEFAULTGROUPJSON);
      if(defaultgroups)
      {
        validatedataarray(defaultgroups, validategroup); // Will set timestamps
        pcrypt.setdata(session, pcrypt.getvalue('keycrypt'), 'groups', defaultgroups, true, 0);
      }

      // {name: "Dit første team", contact: "Dit navn skal angives her", email: pcrypt.getvalue('email')};
      var defaultteam = pcrypt.jsonparse(g.lang.default.PCDEFAULTTEAMJSON);
      if(defaultteam)
      {        
        if(g.options && g.options.disableuserdefaultteams == false)
        {
          defaultteam.email = pcrypt.getvalue('email');
          pcrypt_teamcreate(session, defaultteam.name, defaultteam.contact, defaultteam.email, 0, 0, function teamcreatecallback(data, error, id)
          {
            if(callback)
              callback(first);
          });
        }
      }
      else
      {
        if(callback)
          callback(first);
      }
    }
    else if(callback)
      callback(false);
  });

  return true;
}

function getMailNameFromId(teamobject, id, noemail, onlymail)
{
  if(teamobject && teamobject[id])
  {
    var username = htmlspecialchars(teamobject[id].name, ['ENT_QUOTES']);
    var email = htmlspecialchars(teamobject[id].email, ['ENT_QUOTES']);

    if((typeof username !== 'string') || (username.length == 0))
      return email;

    if (typeof noemail != 'undefined' && noemail)
    {
      return username;
    }
    else
    {
      if (typeof onlymail != 'undefined' && onlymail)
      {
        return email;
      }
      else
      {
        return htmlspecialchars(username + ' <' + email + '>', ['ENT_QUOTES']);
      }
    }
  }
}

function getAllMailRecipients(myshares, onlymails)
{
	var names = '';
	$.each(myshares, function(index, item)
	{
    if(g.teamobject[index])
    {
      names += getMailNameFromId(g.teamobject, index, false, onlymails) + ', ';
    }
    else
    {
      names += g.lang.mailjs.PCMAILUNKNOWNTEAM + ', ';
    }
	});
	names = names.substring(0, (names.length - 2));
	return names;
}

/**
 * @name buildRecievedShares
 * @description Builds an array of userids which represents the people a user has shared passwords with.
 * @param {Int} counter Simply used to count how many accounts a given password is shared with 
 * @param {Array} recievedSharesEmails Empty Array to contain user ids with whom one has shared.
 * @returns {Array} Array of userids
 */
function buildRecievedShares(counter, recievedSharesEmails)
{
  // For iterating through the g.pass[].shares objects
  for(var i = 0, len_i = g.pass.length; i<len_i; ++i)
  {
    // Reset counter and uniqueEmail boolean at each iteration
    counter = 0;
    var uniqueEmail = true;
    // Count how many shares a given password has
    Object.keys(g.pass[i].shares).forEach( function ()
    {
      counter = counter + 1;
    });
    // Ensure that pass in question has shares.
    if(g.teamobject[Object.getOwnPropertyNames(g.pass[i].shares)[0]] !== undefined)
    {
      for(var j = 0, len_j = counter; j < len_j; ++j)
      {
        var sharedToEmail = Object.getOwnPropertyNames(g.pass[i].shares)[j];
        
        // If email already exist go to the next iteration
        // If email is unique add to array (or map)
        recievedSharesEmails.forEach(function ()
        {
            // Should the email have an equal, it cannot be unique
          for(var z = 0, len_z = recievedSharesEmails.length; z < len_z; ++z)
          {
            if(recievedSharesEmails[z] === sharedToEmail)
            {
              uniqueEmail = false;
            }
          }
        }); // If email is unique push to array.
        if(uniqueEmail === true)
        {
          recievedSharesEmails.push(sharedToEmail);
        }
      }
    }
  }
  return recievedSharesEmails;
}

// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri(str)
{
    var o = parseUri.options,
		m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i = 14;

    while (i--) uri[o.key[i]] = m[i] || "";

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
        if ($1) uri[o.q.name][$1] = $2;
    });

    return uri;
}

function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = htmlspecialchars(html, ['EN_QUOTES']);
    return txt.value;
}

/**
 * @name redirect2fa
 * @description redirects the user to the 2fa setup page until this has been setup.
 */
function redirect2fa() 
{
  var opts = pcrypt.getvalue('options');
  var twoFa = pcrypt.getvalue('totpsecurity');

  if(twoFa == false && opts.force2fa == true)
  { // TODO change on setting up to or live page.
    window.location.replace('../index.html?page=account&to2fa=true');
  }
}
/**
 * @name hideButtonpane
 * @description hides the buttonpanes from dialogs such as the popups for premium restrictions
 */
function hideButtonpane()
{
  if(document.getElementsByClassName('ui-dialog-buttonpane').length > 0)
  {
    var buttonpaneId = document.getElementsByClassName('ui-dialog-buttonpane').length - 1;
    document.getElementsByClassName('ui-dialog-buttonpane')[buttonpaneId].hidden = true;
  }
  else
  {
    document.getElementsByClassName('ui-dialog-buttonpane')[0].hidden = true;
  }
}

parseUri.options =
{
    strictMode: false,
    key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
    q: {
        name: "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
};

function addHttpsToUrl(url)
{
  if(typeof url !== 'string')
  {
    url = '';
    return url;
  }

  var regExValidURL = /(?:[a-zA-Z]+\.(?:[a-zA-Z])+)/gm

  if(regExValidURL.test(url))
  {
    if(!url.startsWith("https://") && !url.startsWith("http://") )
    {
      url = "https://" + url;
    }
    
    if(url.lastIndexOf('/')+1!== url.length)
    {
      url = url + '/';
    }
  }

  return url;

}

function isMimeImage(mimetag) 
{
  var parts = mimetag.split('/');
  var ext = parts[parts.length - 1];

  // Have to be supported by PHP image functions

  switch(ext.toLowerCase()) 
  {
    case 'jpeg':
    case 'gif':
    case 'bmp':
    case 'png':
      //etc
      return true;
  }
  return false;
}
