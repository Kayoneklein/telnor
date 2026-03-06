"use strict";

var gpcrypt = {}; // Global name space

gpcrypt.basefolder = pcrypt.urldomain + pcrypt.urlpath + "lib/other/";
gpcrypt.sgid =
{
  "undef" : 0,
  "all" : -1,
  "loc" : -2,
  "own" : -3,
  "outshare" : -4, // shared by me
  "inshare" : -5, // shared to me
  "new" : -6, // newly shared passwords.
  "shares" : -100 // Specific user shares
}; // special group ids


// This is to handle encrypt/decrypt in a worker (message handling)
pcrypt.workermessages(function workercallback(evt)
{
  //console.log(evt.data);
  // TODO clear progress indicator somehow
  switch(evt.data.method)
  {
    case 'response':
      switch(evt.data.id)
      {
        case 'getselectfilesencrypt':

          //arraydata = evt.data.value; // May not be needed (pointer)

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
          });

        break;

        case "buildsharedatabinarydecrypt":

          var keycrypt = [];

          // Build keycrypt data
          evt.data.param.newfiles.forEach(function (file, findex)
        	{
            keycrypt[findex] = [];

            file.sharekeys.forEach(function (key, kindex)
          	{
              keycrypt[findex][kindex] = key;
          	});
        	});

          pcrypt.workercall({method: 'encrypt', id: 'buildsharedatabinaryencrypt', param: evt.data.param, value: evt.data.value, keycrypt: keycrypt});
        break;

        case "buildsharedatabinaryencrypt":

          var toid = [];
          var dataname = [];
          var sourcename = [];
          var datastring = [];

          evt.data.param.newfiles.forEach(function (file, findex)
        	{
            file.fileids.forEach(function (name, nindex)
          	{
              if(evt.data.value[findex] && evt.data.value[findex][nindex] !== false)
              {
                toid.push(file.toids[nindex]);
                dataname.push(name);
                sourcename.push(file.sourceid);
                datastring.push(evt.data.value[findex][nindex]);
              }
          	});
        	});

          // Save data (delete some)
          pcrypt_teamsetbinary(pcrypt.getvalue('session'), toid, sourcename, dataname, datastring, evt.data.param.nodelsource, 0, function setbinaryfunc(data, error, id)
          {
            if(error)
            {
              handlepcrypterror(error, data);
              return;
            }
          });
          
        break;
      }
    break;
  }

});

function validatedataarray(dataarr, testfunc)
{
  if(!Array.isArray(dataarr))
    return false;

  var nextid = findnextid(dataarr);

  for (var i = dataarr.length - 1; i >= 0; i--)
  {
    if(typeof dataarr[i] === 'object')
    {
      nextid = testfunc(dataarr[i], nextid);
    }
    else
    {
      passarr.remove(i);
    }
  }
}

function validatepass(pass, nextid)
{
	if(typeof(pass.cre) != 'number')
		pass.cre = (new Date()).getTime();

	if(typeof(pass.upd) != 'number')
		pass.upd = (new Date()).getTime();

	if(typeof(pass.gid) != 'number')
		if(pass.gid) pass.gid = Number(pass.gid);
		else pass.gid = 0;

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
    if(pass.urlpath) pass.urlpath = pass.urlpath.toString();
    else pass.urlpath = 'false';

	if(typeof(pass.note) != 'string')
		if(pass.note) pass.note = pass.note.toString();
		else pass.note = '';

	if(!Array.isArray(pass.pos))
	  pass.pos = [];

	if(!Array.isArray(pass.files))
	  pass.files = [];

  if(typeof(pass.filesid) != 'string')
		if(pass.filesid) pass.filesid = pass.filesid.toString();

	if(Array.isArray(pass.shares) || (typeof(pass.shares) !== 'object'))
    pass.shares = {};

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

	return nextid;
}

function validategroup(group, nextid)
{
	if(nextid)
	{
	  if(typeof(group.id) != 'number')
		  group.id = nextid++;
	  else if(group.id < 0)
	    group.id = nextid++;
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

	return nextid;
}

function validatemail(mail, nextid)
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

	return nextid;
}

function findnextid(array)
{
	var nextid = 0;

	if(array)
	for (var i = 0, len_i = array.length; i < len_i; ++i)
	if(array[i].id > nextid)
		nextid = array[i].id;

	return nextid + 1;
}

function groupidisvalid(gid, dbgarray, dbsarray)
{
	if(gid > 0)
	{
    if(dbgarray)
    {
      for (var i = 0, len_i = dbgarray.length; i < len_i; ++i)
      {
        if(dbgarray[i].id == gid)
	        return true;
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

        if(sharegid == gid)
	        return true;
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

function showthispassgid(gid, pass, sharearray, grouparray, locinfo, teamobject)
{
  switch(Number(gid))
	{
	  case gpcrypt.sgid.all:
	    return true;
	  break;

	  case pass.gid:
	    return true;
	  break;

	  case gpcrypt.sgid.own:
	    if(pass.gid > gpcrypt.sgid.shares)
	      return true;
	  break;

	  case gpcrypt.sgid.inshare:
	    if(pass.gid <= gpcrypt.sgid.shares)
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
    
	  case gpcrypt.sgid.new:
      if (!!pass.sharechange) {
        return true;
      }
	  break;


	  case gpcrypt.sgid.loc:
	    if(locinfo && locationarrayatpoint(pass.pos, locinfo.lat, locinfo.long, locinfo.acc))
	      return true;
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
  for(var key in pass.shares)
  {
    if(key !== 'undefined')
    {
      if(parseInt(key, 10) == Math.abs(g.gidshown+100))
      {
        return true;
      }
    }
    else 
    {
      return false;
    }
  }
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
          localStorage['languagever'] = ''; // just erease the text to update
          location.reload(true); // TODO - We also like to refresh cache while we are at it
        }
      });
    }
  }
  else
  {
    if(newlangcode && (typeof newlangcode === "string"))
      langcode = newlangcode;
    else if(typeof langcode !== "string")
      langcode = navigator.language || navigator.userLanguage;

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
		  element.style.backgroundColor = '#f6edff';
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
        }
      break;
    }
  }
}

function passToShare(pass, teams)
{
  if(!Array.isArray(teams))
    return false;

  // We need this as array and objects are by reference
  let copypass = pcrypt.jsonparse(pcrypt.jsonstringify(pass), true);

  var share = {};

  share.cre = copypass.cre;
  share.upd = copypass.upd;
  share.name = copypass.name;
  share.user = copypass.user;
  share.pass = copypass.pass;
  share.url = copypass.url;
  share.note = copypass.note;
  share.pos = copypass.pos;
  share.files = copypass.files;
  share.shareteams = teams;

  //share.sharechange = change;

  return share;
}

function shareToPass(shareuser, shareindex, sharedataindex, sharehide, gid)
{
  var pass = {};
  var share = shareuser.data[sharedataindex];

  pass.gid = gid;

  pass.cre = share.cre;
  pass.upd = share.upd;
  pass.name = share.name;
  pass.user = share.user;
  pass.pass = share.pass;
  pass.url = share.url;
  pass.note = share.note;
  pass.pos = share.pos;
  pass.files = share.files;
  pass.sharechange = share.sharechange; // Only set for shares
  pass.shareindex = shareindex; // Only set for shares
  pass.sharedataindex = sharedataindex; // Only set for shares
  pass.sharehide = sharehide; // Only set for shares;
  pass.shareuserid = shareuser.userid; // Only set for shares;

  return pass;
}

/**
 *  This is to remove all members that have not been approved etc.
 *  Clean up teammembers, remove unapproved team and team we are not approved in
 * */ 
function cleanmembers(members)
{
  if(!Array.isArray(members))
    return false;

  var teamobject = convertteammembers(members); // TODO - can this be passed as parameter to avoid the conversion
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

  var teamlength = members.length;
  var teamobject = {};

  for(var i = 0 ; i < teamlength ; i++)
  {
    let member = members[i];
    
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
  }

  return teamobject;
}

/**
 * 
 * @param {*} sharedata 
 * @param {*} teamobject 
 * @param {*} privatekey 
 * @param {*} myemail 
 */
function decryptShareData(sharedata, teamobject, privatekey, myemail)
{
  if(!Array.isArray(sharedata))
    return false;

  if(typeof(teamobject) != 'object')
    return false;

  var publickey;
  var sharedkey;
  var objectshare = {};

  // Decrypt shares for each userid
  for (var i = sharedata.length - 1; i >= 0; i--)
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

      if(objectshare)
      {
        objectshare[share.userid] = share;
        objectshare[share.userid].datahash = {};

        // Run tru all shares and build hash data
        for (var j = share.data.length - 1; j >= 0; j--)
        {
          let data = share.data[j];
          let hash = pcrypt.sha256(pcrypt.jsonstringify(data));
          share.datahash[hash.substring(0,16)] = data;  // We limit the length so it can not be used in an attack (not likely as everything is stored encrypted)
        }
      }
    }
    catch(err)
    {
      console.log("Invalid share data: " + err.message);
      sharedata.remove(i); continue;
    }
  }

  return objectshare;
}

function findShareChanges(oldshares, newshares)
{
  if(Array.isArray(oldshares) || (typeof(oldshares) !== 'object')) // Test if it is not object
    return {};

  if(Array.isArray(newshares) || (typeof(newshares) !== 'object')) // Test if it is not object
    return {};

  let changeShares = {};

  for (let userid in oldshares) // for/of not supported in IE11
  {
    if(!newshares[userid])
      changeShares[userid] = true;
  }

  for (let userid in newshares) // for/of not supported in IE11
  {
    if(!oldshares[userid])
      changeShares[userid] = true;

  }

  return changeShares;
}

// filechanges is a global variable that stop all update of files (limit server traffic when only a single password i edited)
/**
 * @name buildShareData
 * @description builds the share data of (a) given password(s)
 * @param {*} gpass 
 * @param {*} members 
 * @param {Boolean} filechanges 
 * @param {Boolean} spinnerCall 
 * @param {function} callback 
 */
function buildShareData(gpass, members, filechanges, callback)
{
  //  We have to build all for each user as the server can not merge items for the same user (do not know what it work with after encryption)
  // TODO - this really can use some Async/Await

  if(!Array.isArray(gpass))
    return false;

  if(!Array.isArray(members))
    return false;


  if(filechanges)
  {
    pcrypt_teamgetbinaryinfo(pcrypt.getvalue('session'), 0, teamgetbinaryinfocallback);
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
      handlepcrypterror(error, filedata);
      return;
    }

    var useridchange = {}; // This will hold all userid that have a change

    // This just to find all remote userid in pass where there are changes
    for (let i = 0, len_i = gpass.length; i < len_i; ++i)
    {
      let pass = gpass[i];

      if(Array.isArray(pass.sharechanges) || (typeof(pass.sharechanges) !== 'object')) // Test if it is not object
        continue;

      for (let userid in pass.sharechanges)
      {
        if(!useridchange[userid])
          useridchange[userid] = true;
      }
    }
    
    var sharedata = {};
    var newfileids = [];
    var oldfileids = [];
    var teamobject = convertteammembers(members); // TODO - can this be passed as parameter to avoid the conversion

    // This just to find and test if shares are valid
    for (let i = 0, len_i = gpass.length; i < len_i; ++i)
    {
      let pass = gpass[i];

      if(Array.isArray(pass.shares) || (typeof(pass.shares) !== 'object')) // Test if it is not object
        continue;

      // Test if user is member of the teams (shares can be left behind if team is deleted or user removed)
      // But we keep old shares if user is added to the team again (so not a completely secure way to to delete a user from a team)
      for (let userid in pass.shares) // for/of not supported in IE11
      {
        if(useridchange[userid])
        {
          if(teamobject[userid])
          {
            let teams = pass.shares[userid];
            let validteams = [];

            if(!Array.isArray(sharedata[userid]))
              sharedata[userid] = [];

            if(Array.isArray(teams))
            {
              for (var j = 0, len_j = teams.length; j < len_j; j++)
              {
                let teamid = teams[j];

                if(teamobject[userid][teamid])
                {
                  validteams.push(teamid);
                }
                else
                {
                  // TODO - Here code can be added to remove the usershare from passwords if team is deleted
                }
              }

              sharedata[userid].push(passToShare(pass, validteams));

  			      pass.files.forEach(function(file)
              {
                if(file.fileid && !newfileids.includes(file.fileid))
                {
                  if(!serverfiledata || !serverfiledata[userid] || !serverfiledata[userid][file.fileid])
                    newfileids.push(file.fileid);
                  else
                    oldfileids.push(file.fileid);
                }
              });
            }
          }
          else
          {
            // TODO - Here code can be added to remove the usershare from passwords if user is removed
          }
        }
      }

      if(Array.isArray(pass.sharechanges) || (typeof(pass.sharechanges) !== 'object')) // Test if it is not object
        continue;

      // Test if we need to remove some shares
      for (let userid in pass.sharechanges)
      {
        if(!sharedata[userid])
          sharedata[userid] = [];
      }

      delete pass.sharechanges;
    }

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

    function downloadsharedfilescallback(filedata, error, id)
  	{
  	  if(error)
      {
  		  handlepcrypterror(error, filedata);
        return;
      }

      // Get private key from login
      var privatekey = pcrypt.getvalue('privatekey');
      var myemail = pcrypt.getvalue('email');
      var publickey;
      var sharedkey;
      var arrayname = {};

      arrayname.nodelsource = {};
      arrayname.newfiles = [];

      //console.log(sharedata);

      // Encrypt shares for each user
      for (var i = 0, len_i = members.length; i < len_i; ++i)
      {
        var userid = members[i].userid;

        // See if we share or remove something for this user
        if(sharedata[userid])
        {
          if(typeof sharedata[userid] === "string") // Test if the data is already encrypted (other team with same email)
            continue;

          if(sharedata[userid].length === 0) // We shall not share anything (array is empty)
          {
            sharedata[userid] = ""; // Will delete any old shares still stored in the database
            if(!arrayname.nodelsource.hasOwnProperty(userid))
              arrayname.nodelsource[userid] = []; // Will delete all files for this user
            continue;
          }

          try
    		  {
            publickey = pcrypt.decodeasymetrickeys(members[i].publickey);
            sharedkey = pcrypt.getsharedsecret(privatekey, publickey);

            if(sharedkey === false)
            {
              alert("Invalid sharedkey for user: " + userid);
              delete sharedata[userid]; // Invalidate data
              continue;
            }

            // Build up file data if we have file changes
            if(filechanges) sharedata[userid].forEach(function(pass)
            {
              pass.files.forEach(function(file)
              {
                if(!file.fileid)
                  return; // Must be old integrated format

                file.sourceid = file.fileid;

                if(!filedata.hasOwnProperty(file.fileid))
                {
                  // This is a file that is already on the server

                  if(serverfiledata[userid] && serverfiledata[userid][file.sourceid])
                  {
                    if(!arrayname.nodelsource.hasOwnProperty(userid))
                      arrayname.nodelsource[userid] = [];

                    arrayname.nodelsource[userid].push(file.sourceid);

                    file.fileid = serverfiledata[userid][file.sourceid].name;
                  }
                  else
                  {
                    console.log("Missing fileid to share1: " + file.sourceid);
                    return;
                  }
                }
                else
                {
                  // This is a new file that is not on the server

                  let fileindex = newfileids.indexOf(file.sourceid);

                  if(fileindex < 0)
                  {
                    console.log("Missing fileid to share2: " + file.sourceid);
                    return;
                  }

                  file.fileid = randomString(pcrypt.randomidlength);

                  if(typeof arrayname.newfiles[fileindex] === 'undefined')
                  {
                      arrayname.newfiles[fileindex] = {};
                      arrayname.newfiles[fileindex]['sharekeys'] = [];
                      arrayname.newfiles[fileindex]['fileids'] = [];
                      arrayname.newfiles[fileindex]['toids'] = [];
                      arrayname.newfiles[fileindex]['index'] = fileindex;
                      arrayname.newfiles[fileindex]['sourceid'] = file.sourceid;
                  }

                  arrayname.newfiles[fileindex]['sharekeys'].push(sharedkey);
                  arrayname.newfiles[fileindex]['fileids'].push(file.fileid);
                  arrayname.newfiles[fileindex]['toids'].push(userid);
                }
              });
            });

            sharedata[userid] = pcrypt.encryptdata(sharedkey, sharedata[userid], false);
          }
          catch(err)
          {
            alert("Invalid share data build: " + err.message);
            delete sharedata[userid]; // Invalidate data
            continue;
          }
        }
      }

      // Save share data so the other user can see it	when he logon
      pcrypt.setteamshares(pcrypt.getvalue('session'), sharedata, 0, function updatesharefunc(data, error, id)
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

      // Encrypt all new files and store in DB (background process to allow quick UI)
      if(filechanges)
        pcrypt.workercall({method: 'decrypt', id: 'buildsharedatabinarydecrypt', param: arrayname, value: Object.values(filedata), keycrypt: pcrypt.getvalue('keycrypt')});
      
      if(callback)
      {
        callback(sharedata);
      }
      else
      {
        console.log('no callback in buildShareData');
      }
    }
  };
}

function hidesharepassvalid(userid, shareuser, sharedata, teamobject)
{
  if(sharedata.shareteams && Array.isArray(sharedata.shareteams))
  {
    try
    {
      for(var i = 0, len = sharedata.shareteams.length; i < len; i++)
      {
        if(teamobject[shareuser.userid][sharedata.shareteams[i]].teamhidepass)
          return true;

        if(teamobject[userid][sharedata.shareteams[i]].userhidepass)
          return true;
      }
    }
    catch(err)
    {
      return true;
    }
  }

  return false;
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
function fillgroupselect(selelement, selectedid, addall, addundef, addpos, addown, addoutshare, addinshare, addgroups, addshares, addnewtag, addSharesFromUser, addNewShares)
{
  selelement.length = 0; // remove all elements

  if (addnewtag) 
  {
    var op = new Option(g.lang.default.PCADDNEWTAG, 'addnewtag', false, false);
    op.style.color = "#3f4851";
    op.style.cursor = "pointer";
    op.style.fontWeight = "bold";
    op.style.backgroundColor = "#FFFFFF";
    selelement.options[selelement.options.length] = op;
  }

  if(addall)
  {
    var selected = gpcrypt.sgid.all == selectedid ? true : false;
    var op = new Option(addall, gpcrypt.sgid.all, selected, selected);
    op.style.color = "#3f4851";
    op.style.cursor = "pointer";
    op.style.backgroundColor = "#d8d8d8";
    selelement.options[selelement.options.length] = op;
  }

  if(addpos)
  {
    var selected = gpcrypt.sgid.loc == selectedid ? true : false;
    var op = new Option(addpos, gpcrypt.sgid.loc, selected, selected);
    op.style.color = "#3f4851";
    op.style.cursor = "pointer";
    op.style.backgroundColor = "#d8d8d8";
    selelement.options[selelement.options.length] = op;
  }

  if(addundef)
  {
    var selected = gpcrypt.sgid.undef == selectedid ? true : false;
    var op = new Option(addundef, gpcrypt.sgid.undef, selected, selected);
    op.style.color = "#3f4851";
    op.style.cursor = "pointer";
    op.style.backgroundColor = "#d8d8d8";
    selelement.options[selelement.options.length] = op;
  }

  if(addown)
  {
    var selected = gpcrypt.sgid.own == selectedid ? true : false;
    var op = new Option(addown, gpcrypt.sgid.own, selected, selected);
    op.style.color = "#3f4851";
    op.style.cursor = "pointer";
    op.style.backgroundColor = "#d8d8d8";
    selelement.options[selelement.options.length] = op;
  }

  if(addoutshare)
  {
    var selected = gpcrypt.sgid.outshare == selectedid ? true : false;
    var op = new Option(addoutshare, gpcrypt.sgid.outshare, selected, selected);
    op.style.color = "#3f4851";
    op.style.cursor = "pointer";
    op.style.backgroundColor = "#d8d8d8";
    selelement.options[selelement.options.length] = op;
  }

  if(addinshare)
  {
    var selected = gpcrypt.sgid.inshare == selectedid ? true : false;
    var op = new Option(addinshare, gpcrypt.sgid.inshare, selected, selected);
    op.style.color = "#3f4851";
    op.style.cursor = "pointer";
    op.style.backgroundColor = "#d8d8d8";
    selelement.options[selelement.options.length] = op;
  }


  if (addNewShares) {
    var selected = gpcrypt.sgid.new == selectedid ? true : false;
    var op = new Option(g.lang.default.PCSHOWNEWSHARES, -6, selected, selected);
    op.style.color = "#3f4851";
    op.style.cursor = "pointer";
    op.style.backgroundColor = "#d8d8d8";
    selelement.options[selelement.options.length] = op;
  }

  if(addgroups && Array.isArray(addgroups))
  {
    //addgroups.sort(sortgrouparray); // Just to be sure

    for (var i = 0, len_i = addgroups.length; i < len_i; ++i)
    {
      validategroup(addgroups[i]);

      var selected = addgroups[i].id == selectedid ? true : false;
      var op = new Option(addgroups[i].name, addgroups[i].id, selected, selected);
      op.style.color = "#3f4851";
      op.style.cursor = "pointer";
      op.style.backgroundColor = "#FFFFFF";
      selelement.options[selelement.options.length] = op;
    }
  }

  if(addshares && Array.isArray(addshares))
  {
    for (var i = 0, len_i = addshares.length; i < len_i; ++i)
    {
      if(!addshares[i].data)
        continue;

      var gid = -(addshares[i].userid) + gpcrypt.sgid.shares;

      var selected = gid == selectedid ? true : false;
      var op = new Option(htmlspecialchars(addshares[i].email, ['ENT_QUOTES']), gid, selected, selected);
      op.style.color = "#3f4851";
      op.style.cursor = "pointer";
      op.style.backgroundColor = "#E1EEF4";
      selelement.options[selelement.options.length] = op;
    }
  }

  if(addSharesFromUser === true)
  {
    var counter = 0;
    var recievedSharesEmails = [];
    var AnOption = false;
    
    buildRecievedShares(counter, recievedSharesEmails);

    for(var i = 0, len_i = recievedSharesEmails.length; i < len_i; ++i)
    { 
      let user = g.teamobject[recievedSharesEmails[i]];

      if(!user)
        continue;

      // Reset AnOption at each iteration
      AnOption = false;
      Object.keys(selelement.options).forEach(function (key)
      { 
        if(user && parseInt(selelement.options[key].value) === (-user.userid+gpcrypt.sgid.shares))
        {
          AnOption = true;
        }
      });
      // If false, i.e. not an option, add it to the groupselect list.
      if(AnOption === false)
      {
        var gid = -user.userid+gpcrypt.sgid.shares;
        var selected = gid == selectedid ? true : false;
        var op = new Option(htmlspecialchars(user.email, ['ENT_QUOTES']), gid, selected, selected);
        op.style.color = "#3f4851";
        op.style.cursor = "pointer";
        op.style.backgroundColor = "#E1EEF4";
        selelement.options[selelement.options.length] = op;
      }
    }
  }
}

function addSharesToPass(dbparray, dbsarray, teamobject, gidstart)
{
  if(!Array.isArray(dbparray))
    return false;

  var newarray = dbparray.slice(); // Do not modify original array

  for (var i = 0, len_i = newarray.length; i < len_i; ++i)
  {
    newarray[i].passindex = i;
  }

  if(!Array.isArray(dbsarray))
    return newarray;

  var myid = pcrypt.getvalue('userid');

  for (var i = 0, len_i = dbsarray.length; i < len_i; ++i)
  {
    if(!Array.isArray(dbsarray[i].data))
    {
      console.log("Share data is not array");
      continue;
    }

    for (var j = 0, len_j = dbsarray[i].data.length; j < len_j; ++j)
    {
      var shareuser = dbsarray[i];
      var sharedata = shareuser.data[j];
      var sharehide = hidesharepassvalid(myid, shareuser, sharedata, teamobject);

      newarray.push(shareToPass(shareuser, i, j, sharehide, -(shareuser.userid) + gidstart));
    }
  }
  return newarray;
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

  
  // If premium user
  if( pcrypt.getvalue('premium') > 0 )
  {
    // If a user has not reached the maximum allowed positions per password, allow addition of positions up to the value of premRes.posax.
    if(selectfield && ( selectfield.options.length < premRes.posMax ))
    {
      selectfield.options[selectfield.length] = new Option(locinfo.lat + "," + locinfo.long + "," + Math.round(locinfo.acc));
      selectfield.selectedIndex = selectfield.length - 1;
      selectfield['data-modified'] = true;
      sumoSelectReload(selectfield);
    }
    else
    {
      modalalert(g.lang.passwordeditjs.PCPESELECTMAXIMUMENTRIES + ' ' + premRes.posMax, g.lang.default.PCPROGRAMTITLE);
      hideButtonpane();
    }
  }
  else
  // If free user
  if(pcrypt.getvalue('premium') < 1)
  {
    // If a user does not have a position bound to a given password, allow the user to add ONE position.
    if(selectfield && (selectfield.options.length < premRes.posMaxFree))
    {
      selectfield.options[selectfield.length] = new Option(locinfo.lat + "," + locinfo.long + "," + Math.round(locinfo.acc));
      selectfield.selectedIndex = selectfield.length - 1;
      selectfield['data-modified'] = true;
      sumoSelectReload(selectfield);
    }
    else
    {
      modalalert(g.lang.passwordeditjs.PCPESELECTMAXIMUMENTRIES + ' ' + premRes.posMaxFree, g.lang.default.PCPROGRAMTITLE);
      hideButtonpane();
    }
  }
}

/**
 * Edit a select location at a given elementId.
 * @param {*} field 
 * @param {*} callback 
 */
function editselectlocation(field, callback)
{
  var selectfield = document.getElementById(field);

  if(!selectfield.options.length)
  {
    modalalert(g.lang.passwordeditjs.PCPESELECTNOITEMS, g.lang.default.PCPROGRAMTITLE);
    return;
  }

  modalprompt(g.lang.passwordeditjs.PCPELOCEDITTITLE, g.lang.default.PCPROGRAMTITLE, selectfield.options[selectfield.selectedIndex].text, 64, null, function(loc)
  {
    var result = false;

    if(loc !== false)
    {
      if(islocationvalid(loc))
      {
        selectfield.options[selectfield.selectedIndex].text = loc;
        selectfield['data-modified'] = true;
        sumoSelectReload(selectfield);
        result = true;
      }
      else
      {
        modalalert(g.lang.passwordeditjs.PCPELOCEDITERROR, g.lang.default.PCPROGRAMTITLE);
      }
    }

    if(callback)
      callback(result);
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

  modalconfirm(g.lang.passwordeditjs.PCPELOCDELETETITLE + selectfield.options[selectfield.selectedIndex].text, g.lang.default.PCPROGRAMTITLE, function(result)
  {
    if(result)
    {
      selectfield.remove(selectfield.selectedIndex);
      selectfield['data-modified'] = true;
      sumoSelectReload(selectfield);
    }

    if(callback)
      callback(result);
  });
}

function decodeaddressdialog(callback)
{
  modalprompt(g.lang.passwordeditjs.PCPELOCSEARCHTITLE, g.lang.default.PCPROGRAMTITLE, "", 64, null, function(address)
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
          locArray.push(selectfield.options[i].text);
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

function islocationvalid(location)
{
  if(location.length)
  {
      var locsplit = location.split(",", 4);

      //Check that latitude is above -90 and below 90 and longitude is above -180 and below 180
      if (locsplit[0] > -90 && locsplit[0] < 90 && locsplit[1] > -180 && locsplit[1] < 180)
      {
        if(locsplit.length > 3)
          return false;
        else
          return true;
      }
      else
      {
        return false;
      }
  }
  return false;
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
    for (var i = 0, len_i = selectfield.options.length; i < len_i; ++i)
    {
        var locarray = selectfield.options[i].text.split(',', 3);
        var locinfo = {};

        locinfo.lat = locarray[0];
        locinfo.long = locarray[1];
        locinfo.acc = locarray[2]

        pass.pos.push(locinfo);
    }
  }
}

function setselectlocations(selectfield, locarray)
{
  selectfield.length = 0;

  if(locarray && locarray.length)
  {
    for (var i = 0, len_i = locarray.length; i < len_i; ++i)
    {
      var op = new Option(locarray[i].lat + "," + locarray[i].long + "," + locarray[i].acc);
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

function getselectfiles(selectfield, pass, callback)
{
  // TODO
  // Add compression parameter to pcrypt.setdata and pcrypt.getdata (set to true for big files)
  // Test limit of HTML data-* Attributes size (if we need to handle it in some other way)
  // Change text for to many bytes to store
  // Change logic so the system check number of files added before file select box


  if(selectfield['data-modified'] !== true)
    return false;

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
		  arraydata.push(window.atob(dataobj.data));
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

  // Encrypt all new files and store in DB (background process to allow quick UI)
  pcrypt.workercall({method: 'encrypt', id: 'getselectfilesencrypt', param: arrayname, value: arraydata, keycrypt: pcrypt.getvalue('keycrypt')});
  return true;
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
          op['data-fileid'] = file.fileid;
		      op['data-filetype'] = file.filetype;
        }

        selectfield.options[i] = op;
      }
    }

    if(pass.shareuserid)
      selectfield['data-shareuserid'] = pass.shareuserid;
    else
      selectfield['data-shareuserid'] = false;

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
    hideButtonpane();
    return;
  }

  if(pcrypt.getvalue('premium')<1 && selectfield.options.length >= premRes.filePerPassFree)
  {
    modalalert('<div class="popup">'+g.lang.passwords.PCFILEPERPASSFREE+'</div>', g.lang.default.PCPROGRAMTITLE);
    hideButtonpane();
    return;
  }

  if(pcrypt.getvalue('premium')<1 && totalFiles >= premRes.fileMax)
  {
    modalalert('<div class="popup">'+g.lang.passwords.PCMAXTOTALFILESFREE+'</div>', g.lang.default.PCPROGRAMTITLE);
    hideButtonpane();
    return;
  }

  var selected = new Option(name);
  loader(true);

  var arrayBuffer = new Uint8Array(arrayBuffer);

  selected['data-file'] = arrayBufferToBase64(arrayBuffer, type);

  selectfield.options[selectfield.length] = selected;
  selectfield.selectedIndex = selectfield.length - 1;
  sumoSelectReload(selectfield);

  selectfield['data-modified'] = true;

  loader(false);
}

function selectdeletefile(field, callback)
{
  var opts = pcrypt.getvalue('options');
  
  if(opts.disablefiles === true)
  {
    modalalert('<div class="popup">'+g.lang.passwords.PCNOFEATUREACCESS+'</div>', g.lang.default.PCPROGRAMTITLE);
    hideButtonpane();
    return;
  }

  var selectfield = document.getElementById(field);

  if(!selectfield.options.length)
  {
    modalalert('<div class="popup">'+g.lang.passwordeditjs.PCPESELECTNOITEMS+'</div>', g.lang.default.PCPROGRAMTITLE);
    hideButtonpane();
    if(callback)
      callback(false);
    return;
  }

  var selected = selectfield.options[selectfield.selectedIndex];

  modalconfirm(g.lang.passwordeditjs.PCPEFILEDELETETITLE + selected.text, g.lang.default.PCPROGRAMTITLE, function(result)
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
      sumoSelectReload(selectfield);
    }

    if(callback)
      callback(result);
  });
}

function selectdownloadfile(field)
{
  var opts = pcrypt.getvalue('options');
  if(opts.disablefiles === true)
  {
    modalalert('<div class="popup">'+g.lang.default.PCNOFEATUREACCESS+'</div>', g.lang.default.PCPROGRAM);
    hideButtonpane();
    return;
  }
  var selectfield = document.getElementById(field);

  if(!selectfield.options.length)
  {
    modalalert('<div class="popup">'+g.lang.passwordeditjs.PCPESELECTNOITEMS+'</div>', g.lang.default.PCPROGRAMTITLE);
    hideButtonpane();
    return;
  }

  loader(true);

  var selected = selectfield.options[selectfield.selectedIndex];

  if(selected['data-file'])
  {
      var myTypeBuffer = base64ToTypeBuffer(selected['data-file']);

      saveDataAsFile(selected.text, 'application/octet-binary', myTypeBuffer.buffer);

      loader(false);
  }
  else if(selected['data-fileid'])
  {

    if(selectfield['data-shareuserid'])
      pcrypt_teamgetbinary(pcrypt.getvalue('session'), selectfield['data-shareuserid'], selected['data-fileid'], selectfield['data-shareuserid'], downloadfilescallback)
    else
      pcrypt_getbinary(pcrypt.getvalue('session'), selected['data-fileid'], 0, downloadfilescallback);

    function downloadfilescallback(data, error, id)
    {
      if(error)
      {
        handlepcrypterror(error, data);
        return;
      }

      var encryptkey;

      if(id)
      {
        var publickey = pcrypt.decodeasymetrickeys(g.teamobject[id].publickey);
        encryptkey = pcrypt.getsharedsecret(pcrypt.getvalue('privatekey'), publickey);

        if(encryptkey === false)
        {
          console.log("Invalid share key: " + id);
          loader(false);
          return;
        }
      }
      else
      {
        encryptkey = pcrypt.getvalue('keycrypt')
      }

      var decryptString = pcrypt.decryptstring(encryptkey, data[selected['data-fileid']] );
      var myTypeBuffer = stringToTypeBuffer(decryptString, selected['data-filetype'])

      saveDataAsFile(selected.text, 'application/octet-binary', myTypeBuffer.buffer);

      loader(false);
    }
  }
}

function selectshowfile(field, windowname)
{
  var opts = pcrypt.getvalue('options');

  if(opts.disablefiles === true)
  {
    modalalert('<div class="popup">'+g.lang.default.PCNOFEATUREACCESS+'</div>', g.lang.default.PCPROGRAMTITLE);
    hideButtonpane();
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

  if(selected['data-file'])
  {
    var myTypeBuffer = base64ToTypeBuffer(selected['data-file']);

    showDataInBrowser(windowname, myTypeBuffer.type, myTypeBuffer.buffer);

    loader(false);
  }
  else if(selected['data-fileid'])
  {
  if(selectfield['data-shareuserid'])
      pcrypt_teamgetbinary(pcrypt.getvalue('session'), selectfield['data-shareuserid'], selected['data-fileid'], selectfield['data-shareuserid'], showfilescallback)
    else
      pcrypt_getbinary(pcrypt.getvalue('session'), selected['data-fileid'], 0, showfilescallback);

    function showfilescallback(data, error, id)
    {
      if(error)
          {
            handlepcrypterror(error, data);
            return;
          }

      var encryptkey;

      if(id)
      {
        var publickey = pcrypt.decodeasymetrickeys(g.teamobject[id].publickey);
        encryptkey = pcrypt.getsharedsecret(pcrypt.getvalue('privatekey'), publickey);

        if(encryptkey === false)
        {
          console.log("Invalid share key: " + id);
          loader(false);
          return;
        }
      }
      else
      {
        encryptkey = pcrypt.getvalue('keycrypt')
      }

      var decryptString = pcrypt.decryptstring(encryptkey, data[selected['data-fileid']] );
      var myTypeBuffer = stringToTypeBuffer(decryptString, selected['data-filetype'])

      showDataInBrowser(windowname, myTypeBuffer.type, myTypeBuffer.buffer);

      loader(false);
    }
  }
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
        // See if browser can display the type (navigator.mimeTypes only show application)
        if(navigator.mimeTypes && (navigator.mimeTypes.length > 0))
        {
          var mimes = navigator.mimeTypes;

          for (var i=0; i < mimes.length; i++)
          {
              if(navigator.mimeTypes[i].type == dataType)
              {
                validMimeType = true;
                break;
              }
          }
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
    downloadLink.innerHTML = "Download File";
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
    for(var i = 0, len = sharedata.shareteams.length; i < len; i++)
    {
      if(teamobject[shareuser.userid] && teamobject[shareuser.userid][sharedata.shareteams[i]])
      {
        teamsarray.push(teamobject[shareuser.userid][sharedata.shareteams[i]].teamname);// +
        //" [" + teamobject[shareuser.userid][sharedata.shareteams[i]].name + " - " + teamobject[shareuser.userid][sharedata.shareteams[i]].department + "]");
        userinfo = teamobject[shareuser.userid][sharedata.shareteams[i]];
      }
    }

    if(teamsarray-length === 0)
        teamsarray.push('#');

    let popoverInfoContent = getPopoverContent(userinfo);

    sharetext = g.lang.passwordsjs.PCPASSWORDSSHARETEXT1 + ": <a href='index.html?page=messages&email=" + email + "' data-toggle='popover' data-placement='bottom' title='Information' data-html='true' data-content='" + popoverInfoContent + "' data-trigger='hover'>" + getMailNameFromId(teamobject, shareuser.userid) + "</a>" +
    "<br><br>" + g.lang.passwordsjs.PCPASSWORDSSHARETEXT2 + ":<ul><li>" + teamsarray.join("<li>") + "</ul><br><br>";

/*
    sharetext = g.lang.passwordsjs.PCPASSWORDSSHARETEXT1 + ": <a href='mailto:" + email + "?subject=" + g.lang.default.PCTEAMMAILTITLE + "'>" + email + "</a>" +
    "<br><br>" + g.lang.passwordsjs.PCPASSWORDSSHARETEXT2 + ":<ul><li>" + teamsarray.join("<li>") + "</ul>";
*/
    modalalert(sharetext, g.lang.passwordsjs.PCPASSWORDSTITLESHAREINFO, callback);

    return true;
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

function initsharenotification(delay, callback)
{
  var session = pcrypt.getvalue('session');

  if(session)
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
          //console.log(data);
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
        // Check regualy for unread mail and shares
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
        callback(dataobj);
    }
    else
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

function addClearSearchIcon(id, onClearFunction)
{
	$( "<div class='clear-search cs-" + id + "'></div>" ).insertAfter( "#" + id );
	$('#' + id).keyup(function() {
		if ($(this).val() == "") {
			$('.clear-search.cs-' + id).hide();
		}
		else {
			$('.clear-search.cs-' + id).show();
		}
	});
	$('.clear-search.cs-' + id).click(function() {
		$('#' + id).val('');
		$(this).hide();
		onClearFunction();
		$('#' + id).focus();
	});
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

/**
 * Marks new shares
 * @param {object} newobjshares 
 * @param {object} oldobjshares 
 * @returns {object} of share changes
 */
function markNewShares(newobjshares, oldobjshares)
{
  var sharechanges = 0;

  for(var user in newobjshares)
  for(var hash in newobjshares[user].datahash)
  {
    if(oldobjshares && oldobjshares[user])
    {
      if(oldobjshares[user].datahash && oldobjshares[user].datahash[hash])
      {
        newobjshares[user].datahash[hash].sharechange = false;
      }
      else
      {
        newobjshares[user].datahash[hash].sharechange = true;
        sharechanges++;
      }
    }
    else
    {
        newobjshares[user].datahash[hash].sharechange = true;
        sharechanges++;
        continue;
    }
  }

  return sharechanges;
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
        pcrypt_getsystemconfig(null, function (pcryptconfig)
        {
          if(pcryptconfig.disableuserdefaultteams == false)
          {
            defaultteam.email = pcrypt.getvalue('email');
            pcrypt_teamcreate(session, defaultteam.name, defaultteam.contact, defaultteam.email, 0, 0, function teamcreatecallback(data, error, id)
            {
              if(callback)
                callback(first);
            });
          }
        });
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
    txt.innerHTML = html;
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
    if (!url.startsWith("https://") && !url.startsWith("http://"))
    {

        url = "https://" + url;

    }else if(url.startsWith("http://")){

        url = url.replace("http", "https");

    }

    return url
}

function sumoSelectReload(selectfield)
{
    if (typeof window.jQuery !== 'undefined')
    {
        if(typeof jQuery.fn.SumoSelect !== 'undefined')
        {
            selectfield.sumo.reload();
        }
    }
}

function initSingleSumo(element_id) {
    var $sTmp = $('#' + element_id);
    if ($sTmp.hasClass('SumoUnder')) {
        $sTmp[0].sumo.unload();
        $sTmp.removeClass('SumoUnder');
    }
    $sTmp.SumoSelect();
}
