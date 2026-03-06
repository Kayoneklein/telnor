var g = {}; // Global name space
g.lang = 'en';

//--------------------------------------------------------------------------------------------------

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

function login1func_1(data, pwd) {
  var pass = pcrypt.utf8encode(pwd);
  var keys = pcrypt.generatekeys(pass, data.salt);
  return pcrypt.jsonstringify(keys);
}

function login1func_2(data, keys) {
  g.srpclient = new SRP6JavascriptClientSessionSHA256();
  g.srpclient.step1(data.email.toLowerCase(), keys.srp);
  var result = g.srpclient.step2(data.srpsalt, data.srpb);
  return pcrypt.jsonstringify(result);
}

function login2func(data) {

  if (!g.srpclient.step3(data.srpM2)) {
    return null; //!!! TODO
  }

  return g.srpclient.getSessionKey();
}

//--------------------------------------------------------------------------------------------------


function pcrypt_bytestohex(bytes) {
  return forge.util.bytesToHex(bytes);
}

function CreateAccount(email, pwd) {
  // get some random bytes salt synchronously (hex to make it more easy to store and export from DB)
  // Have to be at least the size of the output (before it is converted to hex)
  var salt = pcrypt_bytestohex(pcrypt_randombytes(64));

  var keys = pcrypt.generatekeys(pwd, salt);

  var srpclient = new SRP6JavascriptClientSessionSHA256();
  var srpsalt = srpclient.generateRandomSalt();
  var srpverifier = srpclient.generateVerifier(srpsalt, email.toLowerCase(), keys.srp);

  // Create and initialize EC context (separate keys for private/public encoding and signing)
  var eccdh = new elliptic.ec('curve25519');
  var eccsig = new elliptic.ec('ed25519');

  // Generate EC asymetric keys
  var asymkeysdh;
  var asymkeyssig;
  var browserrand = window.crypto || window.msCrypto;

  if (browserrand) {
    // Modern browser - use default behavior
    asymkeysdh = eccdh.genKeyPair();
    asymkeyssig = eccsig.genKeyPair();
  } else {
    // Own random bytes to support older browsers - if not used ECC will fail
    var keyoptions1 = {};
    var keyoptions2 = {};

    keyoptions1.entropy = pcrypt_randombytes(512);
    keyoptions2.entropy = pcrypt_randombytes(keyoptions1.entropy.length);

    asymkeysdh = eccdh.genKeyPair(keyoptions1);
    asymkeyssig = eccsig.genKeyPair(keyoptions2);
  }

  // Get the public key as a hex string
  var keypublicdh = asymkeysdh.getPublic(true, 'hex');
  var keyprivatedh = asymkeysdh.getPrivate('hex');

  // Get the private key as a hex string
  var keypublicsig = asymkeyssig.getPublic(true, 'hex');
  var keyprivatesig = asymkeyssig.getPrivate('hex');

  // Encrypt the private key with symmetric encryption before we pass it to the server
  var keyprivatedhenc = pcrypt.encryptstring(keys.aes, keyprivatedh);
  var keyprivatesigenc = pcrypt.encryptstring(keys.aes, keyprivatesig);

  // Encode keys with info about the algorithm
  var keypublic = pcrypt.encodeasymetrickeys('public', 'hex', 'curve25519', keypublicdh, 'ed25519', keypublicsig);
  var keyprivate = pcrypt.encodeasymetrickeys('private', 'pcrypt', 'curve25519', keyprivatedhenc, 'ed25519', keyprivatesigenc);

  var result = new Object();
  result.email = email;
  result.srpsalt = srpsalt;
  result.srpverifier = srpverifier;
  result.salt = salt;
  result.keypublic = keypublic;
  result.keyprivate = keyprivate;
  return pcrypt.jsonstringify(result);
}

//--------------------------------------------------------------------------------------------------

function pcrypt_randombytes(length) {
  return forge.random.getBytesSync(length);
}

function hash(data) {
  return pcrypt.sha256(data);
}

function encodeData(data, cryptkey) {
  var result = pcrypt.encryptstring(cryptkey, data, false);
  return result;
}

function decodeData(data, cryptkey) {
  //  if (pcrypt.sha256(data.data) !== data.hash) {
  //    return false;
  //  }
  var decrypted = pcrypt.decryptstring(cryptkey, pcrypt.jsonstringify(data));
  return decrypted;
}

function unUnicode(data) {
  if (typeof data !== "string") {
    return data;
  }
  return data.replace(/\x10/g, "")
    .replace(/\\\\u([0-9a-f]{4})/g, function(whole, group1) {
      return String.fromCharCode(parseInt(group1, 16));
    });
}


function shufflearray(array) {
  var i = array.length;
  var randomseeds = pcrypt_randombytes(i);
  var temp;
  var j;

  while (i--) {
    j = Math.floor((randomseeds.charCodeAt(i) / (256)) * (i + 1));

    // swap randomly chosen element with current element
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

function randomString(length, options) {
  // We avoid 0oO (user unable to see the diff)
  // Unique ID's need a length of 22 char when using default options to be colission secure according to RFC 4122 (only 59 chars to select from)
  var ualphas = "ABCDEFGHIJKLMNPQRSTUVWXTZ"; //25
  var lalphas = "abcdefghijklmnpqrstuvwxyz"; //25
  var numbers = "123456789"; //9
  var specials = "()!@#$%&*=<>+-_{}[]:;?"; // 24 - Do not use " or ' as this can give problems with html display or replaced by htmlspecialchars
  var chars = "";
  var stringindex;
  var randomarray = [];

  if (!length || length < 4)
    length = 4;

  var randomseeds = pcrypt_randombytes(length);

  if (typeof options !== 'object') {
    options = {};
    options.lalphas = true;
    options.ualphas = true;
    options.numbers = true;
    options.specials = false;
  }

  if (options.lalphas) {
    stringindex = Math.floor((randomseeds.charCodeAt(randomarray.length) / (256)) * lalphas.length);
    randomarray.push(lalphas.charAt(stringindex));
    chars += lalphas;
  }

  if (options.ualphas) {
    stringindex = Math.floor((randomseeds.charCodeAt(randomarray.length) / (256)) * ualphas.length);
    randomarray.push(ualphas.charAt(stringindex));
    chars += ualphas;
  }

  if (options.numbers) {
    stringindex = Math.floor((randomseeds.charCodeAt(randomarray.length) / (256)) * numbers.length);
    randomarray.push(numbers.charAt(stringindex));
    chars += numbers;
  }

  if (options.specials) {
    stringindex = Math.floor((randomseeds.charCodeAt(randomarray.length) / (256)) * specials.length);
    randomarray.push(specials.charAt(stringindex));
    chars += specials;
  }

  for (var i = randomarray.length, i_len = randomseeds.length; i < i_len; i++) {
    stringindex = Math.floor((randomseeds.charCodeAt(i) / (256)) * chars.length);
    randomarray[i] = chars.charAt(stringindex);
  }

  randomarray = shufflearray(randomarray);

  return randomarray.join(''); // faster this way for long strings
}

//--------------------------------------------------------------------------------------------------

/**
 * converts teammembers from the members object into a team object
 * @param {*} members
 * @returns teamobject
 */
function convertteammembers(members, myid)
{
  if(!Array.isArray(members))
    return false;

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

function createteammemberlist(members) {
  if (!Array.isArray(members))
    return false;

  var teamlength = members.length;
  var memberobject = {};

  for (var i = 0; i < teamlength; i++) {
    let member = members[i];
    if (!memberobject[member.teamid]) {
      memberobject[member.teamid] = [];
    }
    memberobject[member.teamid].push(member);
  }

  return memberobject;
}

//--------------------------------------------------------------------------------------------------

/**
 *
 * @param {*} sharedata
 * @param {object} teamobject
 * @param {*} privatekey
 * @param {*} myemail
 * @returns {object} objectshare
 */
function decryptShareData(sharedata, teamobject, teamkeys, privatekey, myemail) {
  if(!Array.isArray(sharedata))
    return false;

  if(typeof(teamobject) != 'object')
    return false;

  let publickey;
  let sharedkey;
  //let objectshare = {};
  //let idobject = {};
  let teamarray = [];

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
  return pcrypt.jsonstringify(sharedata);
}

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

  if((typeof oldshareids !== 'object') || Array.isArray(oldshareids)) {
     console.log('1');
     return false;
  }

  if(!Array.isArray(sharedata)) {
    console.log('2');
    return false;
  }

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
  console.log(idobject);
  return pcrypt.jsonstringify(idobject);
}

//--------------------------------------------------------------------------------------------------

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

/**
 * @name buildShareData
 * @description builds the share data of (a) given password(s)
 * @param {*} gpass
 * @param {*} teamobject
 * @param {*} serverfiledata
 * @param {function} callback
 */

function buildShareData_1(gpass, teamobject, serverfiledata, filechanges) {
    //console.log('gpass -> ' + JSON.stringify(gpass));
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

  var result = {};
  result['sharedata'] = sharedata;
  result['newfileids'] = newfileids;
  return pcrypt.jsonstringify(result);
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

  return pcrypt.jsonstringify(sharechanges);
}

/*
 * Second part
 */
function buildShareData_2(userdata, newfileids, filedata, teamobject, serverfiledata, privatekey, filechanges, teamkeys) {
  var result = {};
  if(userdata[0]) // Any team share changes
  {
    var teamresult = shareTeamData(userdata[0], teamobject, filechanges, serverfiledata['team'], newfileids, teamkeys); // Move the encryption info to the top for both cases (similar handling)
    result['teamdatastring'] = teamresult['datastring'];
    result['teamhash'] = teamresult['hash'];
    result['team'] = teamresult['teamfiles'];

    delete userdata[0];
    var userresult = shareUserData(userdata, teamobject, filechanges, serverfiledata['user'], newfileids, filedata, privatekey);
    result['userdatastring'] = userresult['datastring'];
    result['userhash'] = userresult['hash'];
    result['user'] = userresult['userfiles'];
  }
  else
  {
    var userresult = shareUserData(userdata, teamobject, filechanges, serverfiledata['user'], newfileids, filedata, privatekey);
    result['userdatastring'] = userresult['datastring'];
    result['userhash'] = userresult['hash'];
    result['user'] = userresult['userfiles'];
  }
  return pcrypt.jsonstringify(result);
}

function shareTeamData(teamdata, teamobject, filechanges, serverfiledata, newfileids, teamkeys)
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

      let keyid = lastindex(teamkeys[teamid]);

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

  console.log('Team: ', saveteamdata, teamfiles);
  let datastring = pcrypt.jsonstringify(saveteamdata);
  let hash = pcrypt.sha256(datastring);
  var result = {};
  result['teamfiles'] = teamfiles;
  result['datastring'] = datastring;
  result['hash'] = hash;
  return result;
}

function shareUserData(userdata, teamobject, filechanges, serverfiledata, newfileids, newfiledata, privatekey)
{
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

  console.log('Member: ', userdata, userfiles);
  let datastring = pcrypt.jsonstringify(userdata);
  let hash = pcrypt.sha256(datastring);
  var result = {};
  result['userfiles'] = userfiles;
  result['datastring'] = datastring;
  result['hash'] = hash;
  return result;
}

function lastindex(object)
{
  let keys = Object.keys(object);
  let last = -1;

  keys.forEach((element) =>
  {
    element = Number(element);

    if(element > last)
      last = element;
  })

  return last;
};

//--------------------------------------------------------------------------------------------------
/*
teamid: Array of team id to get/save
createnew: Boolean if new key shall be created (for all teams) or Pcryptarray with the keys to save
userids: Array of user id that shall get keys (false or undefined means all users in team)
*/
function handleTeamKeys(teamids, teammembers, setteamkeys, createnew, userids, myid, privatekey, symmetrickey)
{
  let teamkeys = {}; // Hold all keys for each team
  let saveteamkeys = {}; // The keys to save for each team
  let newkeysstatus = {}; // Hold info about why a new key was created
  let missingkeys = {}; // Users that are missing keys for each team (current user have the keys)

  if (!Array.isArray(teamids)) {
    alert("teamids is not array");
    return false;
  }

  if (!teammembers) {
    alert("teammembers not available");
    return false;
  }

  if (!g.teamobject)
    g.teamobject = convertteammembers(teammembers);

  if (!g.memberobject)
    g.memberobject = createteammemberlist(teammembers);

  // Do not call cleanmembers as it remove some users that give problems in teams.js

  // To make it more easy to code and overview we limit the functionality to a single team when we create a new key
  if ((createnew || Array.isArray(userids)) && (teamids.length > 1)) {
    alert("When createnew or userids is set only a single team is supported");
    return false;
  }

  if (createnew && Array.isArray(userids)) {
    alert("Do not use createnew and userids at the same time");
    return false;
  }

  // Build up an object with array of keys
  for (let i = 0, len_i = teamids.length; i < len_i; ++i) {
    let teamid = teamids[i];

    // if negative we shall ignore it (team is about to be removed)
    if (Math.sign(teamid) === -1)
      continue;

    if (!teamkeys[teamid])
      teamkeys[teamid] = new Pcryptarray;

    if (!newkeysstatus[teamid])
      newkeysstatus[teamid] = false;

    let team = g.teamobject[myid][teamid];

    if (!team)
      continue;

    if ((team.teamkeysdata !== null) && (team.teamkeysfromid !== null)) {
      // Get public key from share user
      let shareuser = g.teamobject[team.teamkeysfromid];
      let publickey, sharedkey;

      if (!shareuser || !shareuser.userid) {
        continue; // Can be because user have not approved team
      }

      if (shareuser.userid == myid) // Do not do it for yourself (but symmetric decrypt)
      {
        Object.assign(teamkeys[teamid], pcrypt.decryptdata(symmetrickey, pcrypt.jsonstringify(team.teamkeysdata)));
      } else {
        publickey = pcrypt.decodeasymetrickeys(shareuser.publickey);
        sharedkey = pcrypt.getsharedsecret(privatekey, publickey);

        if (sharedkey === false) {
          alert("Invalid decrypt share key for user id: " + shareuser.userid);
          teamkeys[teamid] = false;
          continue;
        }

        Object.assign(teamkeys[teamid], pcrypt.decryptdata(sharedkey, pcrypt.jsonstringify(team.teamkeysdata)));
      }

      // If userids is set we always/just need to save the data for these users
      if (Array.isArray(userids)) {
        missingkeys[teamid] = userids;
      } else if (team.admin && g.teamobject) {
        // Test that all users have keys as we have a key and is admin
        for (let j = 0, len_j = g.memberobject[teamid].length; j < len_j; ++j) {
          let user = g.memberobject[teamid][j];

          if (!user || !user.userid) {
            continue; // Can be because user have not approved team
          }

          if ((user.teamkeysdata === null) || (user.teamkeysfromid === null)) {
            if (!missingkeys[teamid])
              missingkeys[teamid] = [];

            missingkeys[teamid].push(user.userid);
          }
        }
      }

      if (missingkeys[teamid]) {
        saveteamkeys[teamid] = teamkeys[teamid];
      }
    } else if (teamkeys[teamid].length() == 0) {
      if (team.admin) {
        if (!saveteamkeys[teamid])
          saveteamkeys[teamid] = new Pcryptarray;

        // When we are admin we can create a new key (needed for users own teams)
        // But this is a problem if a (unknown to system) user is created with admin rights by another team admin
        // We detect this in callback below because we check if there is existing keys in use for the team
        // TODO - What if other admin remove his own admin rights before this user is logged on (problem)
        // This is the reasons teamkeys is not set (can contain a wrong key - updated after they are sync by another admin)

        saveteamkeys[teamid].push(pcrypt_randombytes(pcrypt.keylength));
        newkeysstatus[teamid] = 2; // new key because of missing keys
      } else {
        // This is possible when for example a new user is created in a team (admin do not know the public key of the new user at this point in time)
        // After the user is created the admin need to login to generate teamkeys for the new user

        console.log("No keys created for team id: " + teamid);
        teamkeys[teamid] = false;
        continue;
      }
    } else {
      alert("Invalid existing team keys for team id: " + teamid);
      teamkeys[teamid] = false;
      continue;
    }

    if (typeof setteamkeys === 'object') // If we need to set specific keys
    {
      if (saveteamkeys[teamid]) {
        console.log("Existing user key for team is set for all members: " + teamid);
      }

      saveteamkeys[teamid] = setteamkeys[teamid];
      newkeysstatus[teamid] = 3; // new forced keys
    }

    if (createnew) // Generate a new key
    {
      if (team.admin) {
        if (!saveteamkeys[teamid])
          saveteamkeys[teamid] = new Pcryptarray;

        teamkeys[teamid].push(pcrypt_randombytes(pcrypt.keylength)); // We store the new index this way
        saveteamkeys[teamid] = teamkeys[teamid];
        newkeysstatus[teamid] = 1; // new key forced
      } else {
        console.log("Unable to create new key as user is not team admin for team id: " + teamid);
      }
    }

    if (saveteamkeys[teamid] && (saveteamkeys[teamid].length() === 0)) {
      console.log("No keys to save for team id: " + teamid);
      delete saveteamkeys[teamid];
      continue;
    }
  }
  return pcrypt.jsonstringify(teamkeys);
}