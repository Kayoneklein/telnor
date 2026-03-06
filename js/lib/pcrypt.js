/*

    pcrypt - Javascript encryption for privacy and security in cloud computing
    Copyright (C) 2010 Benny Nissen.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

"use strict";

/*
if (typeof pcrypt === 'undefined')
{
  var pcrypt = {}; // Namespace

  pcrypt.version = '1.1';

  pcrypt.method = 'POST'; // Method to communicate with for the API

  //pcrypt.urldomain = 'https://pcrypt.org'; // Server to communicate with for the API
  //pcrypt.urlpath = '/lib/'; // Server path to communicate with for the API
  pcrypt.urldomain = 'https://beast.dk'; // Server to communicate with for the API
  pcrypt.urlpath = '/passdev_ibay/lib/'; // Server path to communicate with for the API

  pcrypt.urlscript = 'pcrypt.php'; // Server script to communicate with for the API
  pcrypt.urlscriptsse = 'pushshares.php'; // Server SSE script to communicate with for the API

  pcrypt.url = pcrypt.urldomain + pcrypt.urlpath + pcrypt.urlscript; // Server script to communicate with for the API
  pcrypt.urlsse = pcrypt.urldomain + pcrypt.urlpath + pcrypt.urlscriptsse; // SSE script to communicate with for the API
}
*/

// Special options for teams
pcrypt.teamoptions = {
    realemail: 0x01, // If true use real e-mail address as sender for message notifications
    hidepass: 0x02, // Hide shared passwords for user
    onlyadminshare: 0x04 // Only admins can share passwords
};

// Special options for users
pcrypt.useroptions = {
    notused: 0x01,
    hidepass: 0x02,
    noshare: 0x04,
};

pcrypt.jsonrpc = function(url, method, session, data, id, callback) {
    var tmpObj = {};

    tmpObj.method = method;
    tmpObj.session = session;
    tmpObj.data = data;
    tmpObj.id = id;

    if(!navigator.onLine)
    {
      callback('pcrypt.jsonrpc connection failure', 'internet', null);
      return;
    }

    pcrypt.jsoncom(pcrypt.method, url, pcrypt.jsonstringify(tmpObj), function(http) 
    {
        if (http.status == 200) 
        {
            
            try 
            {
                var tmpObjreply = JSON.parse(http.responseText);
            } 
            catch (e) 
            {
                if (callback)
                {
                  callback('pcrypt.jsonrpc parsing exception: ' + e.message, 'json', null);
                }

                console.log("pcrypt.jsonrpc parsing exception: " + e.message);
                console.log(http.responseText);

                return;
            }

            if (callback)
                callback(tmpObjreply.result, tmpObjreply.error, tmpObjreply.id);
            else
                console.log("pcrypt.jsonrpc no callback specified");
        } 
        else 
        {
            
            if (callback) 
            {
                if (typeof(http) == 'object')
                {
                    
                    callback('pcrypt.jsonrpc http status error: ' + http.status, 'http', null);
                }
                
                else if (typeof(http) == 'string')
                    callback('pcrypt.jsonrpc http status error: ' + http, 'http', null);
                else
                    callback('pcrypt.jsonrpc http status error: unknown', 'http', null);
            }

            console.log("pcrypt.jsonrpc http status error: " + http);
            
        }
    });
};

pcrypt.jsoncom = function(method, url, data, dofunc) 
{    
    try 
    {        
        var http = new XMLHttpRequest();        
        http.open(method, url, true);        

        // Send the proper header information along with the request
        http.setRequestHeader("Content-type", "application/json");
        
        //http.setRequestHeader("Content-type", "application/octet-stream");

        http.onreadystatechange = function() // Call a function when the state changes.
        {
            if (dofunc && http.readyState == 4)
            {
                dofunc(http);
            }
        }
            
        http.send(data);        
        
    } catch (e) 
    {        
        dofunc(e.message);
    }
};

pcrypt.getteaminfo = function(session, forceserver, dataname, id, callback) {
    if (!forceserver && pcrypt.existvalue(dataname)) {
        callback(pcrypt.getvalue(dataname, true, true), null, id);
        return true;
    } else {
        pcrypt_teaminfo(session, id, function teammembersfunc(data, error, id) {
            if (error) {
                callback(data, error, id);
                return;
            }

            if (!pcrypt.setvalue(dataname, data, true, true)) {
                callback('Exception in storing value', 'teaminfo', id);
                return;
            }

            callback(data, error, id);

        });
        return false;
    }
};

pcrypt.getteammembers = function(session, forceserver, dataname, id, callback) 
{
    if (!forceserver && pcrypt.existvalue(dataname)) 
    {
        callback(pcrypt.getvalue(dataname, true, true), null, id);
        return true;
    } 
    else 
    {
        pcrypt_teammembers(session, id, function teammembersfunc(data, error, id) 
        {
            if (error) 
            {
                callback(data, error, id);
                return;
            }

            if (!pcrypt.setvalue(dataname, data, true, true)) 
            {
                callback('Exception in storing value', 'teammembers', id);
                return;
            }

            callback(data, error, id);

        });
        return false;
    }
};

pcrypt.getteamshares = function(session, forceserver, dataname, id, callback) {
    if (!forceserver && pcrypt.existvalue(dataname)) {
        callback(pcrypt.getvalue(dataname, true, true), null, id);
        return true;
    } else {
        pcrypt_teamgetshares(session, id, function teamgetsharesfunc(data, error, id) {
            if (error) {
                callback(data, error, id);
                return;
            }

            if (!pcrypt.setvalue(dataname, data, true, true)) {
                callback('Exception in storing value', 'teamshares', id);
                return;
            }

            callback(data, error, id);

        });
        return false;
    }
};

pcrypt.getteammail = function(session, forceserver, dataname, id, callback) {

    if (!forceserver && pcrypt.existvalue(dataname)) {
        callback(pcrypt.getvalue(dataname, true, true), null, id);
        return true;
    } else {
        pcrypt_teamgetmail(session, id, function teammailsfunc(data, error, id) {
            if (error) {
                callback(data, error, id);
                return;
            }

            if (!pcrypt.setvalue(dataname, data, true, true)) {
                callback('Exception in storing value', 'teammembers', id);
                return;
            }

            callback(data, error, id);

        });
        return false;
    }
};
/*
pcrypt.getautoincrement = function(session, dataname, dataarray, id, callback) 
{
  var nextid = 0;

  if(dataarray && Array.isArray(dataarray))
  {
    for (var i = 0, len_i = dataarray.length; i < len_i; ++i)
    {
       let myid = dataarray[i].id;

       if(myid > nextid)
         nextid = myid;
    }
  }

  pcrypt_getautoincrement(session, dataname, nextid, id, function autoincrementfunc(data, error, id)
  {
    callback(data, error, id);
  });  

  return true;
};
*/
pcrypt.getdata = function(session, forceserver, cryptkey, dataname, id, callback) 
{
    if (!forceserver && pcrypt.existvalue(dataname)) 
    {
        var datastring = pcrypt.getvalue(dataname, false, false);
        datastring = pcrypt.decryptstring(cryptkey, datastring);
        callback(pcrypt.jsonparse(datastring), null, id);
        return true;
    } 
    else
    {
        pcrypt_getdata(session, dataname, id, function getdatafunc(data, error, id) 
        {
            if (error) 
            {
                callback(data, error, id);
                return;
            }

            var tmpobj;

            try 
            {
                // test hash
                if (pcrypt.sha256(data.datastring) !== data.hash) 
                {
                    callback('Server checksum hash is not correct', 'getdata', null);
                    return;
                }

                pcrypt.setvalue(dataname, data.datastring, false, false);
                var datastring = pcrypt.decryptstring(cryptkey, data.datastring);

                if (datastring === false) 
                {
                    callback('Exception in decryption', 'getdata', id);
                    return;
                }

                tmpobj = pcrypt.jsonparse(datastring);

            } 
            catch (e) 
            {
                callback('Exception in parsing', 'getdata', id);
                return;
            }

            callback(tmpobj, error, id);

        });
        return false;
    }
};

pcrypt.setdata = function(session, cryptkey, dataname, data, backup, id, callback) {
    var datastring;

    try {
        datastring = pcrypt.jsonstringify(data);
        datastring = pcrypt.encryptstring(cryptkey, datastring, false);

        if (datastring === false) {
            if (callback)
                callback('Exception in encryption', 'setdata', id);
            return false;
        }
    } catch (e) {
        if (callback)
            callback('Exception in stringify', 'setdata', id);
        return false;
    }

    pcrypt.setvalue(dataname, datastring, false, false);
    pcrypt_setdata(session, dataname, datastring, pcrypt.sha256(datastring), backup, id, callback);
    return true;
};

pcrypt.deletedata = function(session, cryptkey, dataname, id, callback) {
        pcrypt.deletevalue(dataname);
        pcrypt_setdata(session, dataname, null, null, false, id, callback);
        return true;
    }
    /*
    pcrypt.getbinary = function (session, cryptkey, dataname, id, callback)
    {
    	pcrypt_getbinary(session, dataname, id, function getdatafunc(data, error, id)
    	{
    		if(error)
    		{
    		  callback(data, error, id);
    		  return;
    		}

    		try
    		{
    		  // test hash
    		  if(pcrypt.sha256(data.datastring) !== data.hash)
    		  {
    			  callback('Server checksum hash is not correct', 'getdata', null);
    			  return;
    		  }

    		  var datastring = pcrypt.decryptstring(cryptkey, data.datastring);

    		  if(datastring === false)
    	    {
    	      callback('Exception in decryption', 'getdata', id);
    	      return;
    	    }
    		}
    		catch(e)
    		{
    		  callback('Exception in parsing', 'getdata', id);
    		  return;
    		}

    		callback(datastring, error, id);

    	});
      return false;
    };

    pcrypt.setbinary = function (session, cryptkey, dataname, type, binary, id, callback)
    {
    	var datastring;

    	try
    	{
    		datastring = pcrypt.encryptstring(cryptkey, binary, false);

    		if(datastring === false)
    		{
    		  if(callback)
    		    callback('Exception in encryption', 'setdata', id);
    		  return false;
    		}
    	}
    	catch(e)
    	{
    		if(callback)
    		  callback('Exception in stringify', 'setdata', id);
    		return false;
    	}

    	pcrypt_setbinary(session, dataname, datastring, pcrypt.sha256(datastring), id, callback);
    	return true;
    };
    */
pcrypt.setteamshares = function(session, data, id, callback) {
    /*
    The parameter data need to have the following format: {userid: [passwords]}
    */

    var datastring;

    try {
        datastring = pcrypt.jsonstringify(data);
    } catch (e) {
        if (callback)
            callback('Exception in stringify', 'getdata', id);
        return false;
    }

    pcrypt_teamsetshares(session, datastring, pcrypt.sha256(datastring), id, callback);
    return true;
};

pcrypt.sessionstorageexist = function() {
    try {
        if (typeof(localStorage) == 'undefined') // for some strange reason we need to test on localStorage if cookies is disabled (sessionStorage is in a way undefined - but unable to test in firefox)
            return false;

        return 'sessionStorage' in window && window['sessionStorage'] !== null;
    } catch (e) {
        return false;
    }
};

pcrypt.setlocalencryption = function(key) {
    if (!pcrypt.sessionstorageexist())
        return false;

    try {
        return pcrypt.settopname('encryptkey', key);
    } catch (e) {
        return false;
    }
};

pcrypt.settopname = function(key, value) 
{
    try 
    {
        var tmpObj = pcrypt.jsonparse(top.name);

        if (!tmpObj)
            tmpObj = {};

        tmpObj[key] = value;

        top.name = pcrypt.jsonstringify(tmpObj);

        return true;
    } catch (e) {
        return false;
    }

};

pcrypt.gettopname = function(key) 
{
    try 
    {
        if (!top.name.length)
            return false;

        var tmpObj = pcrypt.jsonparse(top.name);

        if (!tmpObj)
            return false;

        return tmpObj[key];
    } catch (e) {
        return false;
    }
};

pcrypt.setvalue = function(key, value, encryption, json)
{
  try 
  {
    if(typeof encryption == 'undefined')
      encryption = true;

    if (typeof json == 'undefined')
      json = true;

    if(json)
      value = pcrypt.jsonstringify(value);

    if(pcrypt.sessionstorageexist()) 
    {
        if(encryption) 
        {
          var encryptkey = pcrypt.gettopname('encryptkey');

          if(encryptkey)
            sessionStorage[key] = pcrypt.encryptstring(encryptkey, value, false);
          else
            return false;
        }
        else
        {
          sessionStorage[key] = value;
        }

      return true;
    }

    return false;

  } 
  catch (e) 
  {
    return false;
  }
};

pcrypt.getvalue = function(key, encryption, json) 
{
    try {
        if (typeof encryption == 'undefined')
            encryption = true;

        if (typeof json == 'undefined')
            json = true;

        if (pcrypt.sessionstorageexist()) {
            var datastring;

            if (encryption) {
                var encryptkey = pcrypt.gettopname('encryptkey');

                if (!encryptkey)
                    return false;

                datastring = pcrypt.decryptstring(encryptkey, sessionStorage[key]);

            } else {
                datastring = sessionStorage[key];
            }

            if (json)
                return pcrypt.jsonparse(datastring);
            else
                return datastring;
        }

        return false;

    } catch (e) {
        return false;
    }
};

pcrypt.existvalue = function(key) {
    try {
        if (pcrypt.sessionstorageexist()) {
            return (sessionStorage.getItem(key) !== null);
            //return (sessionStorage[key] != undefined);
        }

        return false;
    } catch (e) {
        return false;
    }
};

pcrypt.deletevalue = function(key) {
    try {
        if (pcrypt.sessionstorageexist()) {
            delete sessionStorage[key];
            return true;
        }

        return false;
    } catch (e) {
        return false;
    }
};

pcrypt.flushvalues = function() {
    if (pcrypt.sessionstorageexist()) {
        sessionStorage.clear()
    }

    top.name = ""; // also delete possible internal encrypt key
};

pcrypt.jsonparse = function(string, noerror) {
    // JSON.parse fail with empty string so we need this

    if ((typeof string === "string") && string.length > 0) 
    {
        try 
        {
            // Data Link Escape char have been seen and need to be removed
            string = string.replace(/\x10/g, "");

            return JSON.parse(string, function reviver(key, value) 
            {
                if (typeof value === "string") // We have to unescape special characters
                {
                    // replaces unicode values for non-ascii characters (like \u2762)
                    return value.replace(/\\u([\d\w]{4})/gi, function(match, hex) 
                    {
                        return String.fromCharCode(parseInt(hex, 16));
                    });
                }
                return value;
            });
        } 
        catch (err) 
        {
            if (noerror)
                console.log('JSON.parse error: ' + err.message);
            else
                window.onerror('JSON.parse error: ' + err.message, 'pcrypt.js');
            
            return null;
        }
    } else 
    {
        return null;
    }
};

pcrypt.jsonstringify = function(obj) 
{
    return JSON.stringify(obj, function replacer(key, value) {
        if (typeof value === "string") // We have to escape special characters as some above 0xFF gives parse errors (unexpected token f.ex u2019)
        {
            return value.replace(/[\u0100-\uffff]/g, function(c) {
                return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
            });
        }
        return value;
    });
};

pcrypt.generatekeys = function(password, salt) 
{
    // Generate keys based on a key derivation/expansion function (use time)
    // Note: a key size of 32 bytes will use AES-256 - only work as byte string
    let key = forge.pkcs5.pbkdf2(password, salt, 15000, 2*pcrypt.keylength, forge.md.sha256.create());

    return { aes: key.substring(0, pcrypt.keylength), srp: key.substring(pcrypt.keylength, 2*pcrypt.keylength) };
};

pcrypt.utf8encode = function(text) 
{
    return forge.util.encodeUtf8(text);
};

pcrypt.utf8decode = function(text) 
{
    return forge.util.decodeUtf8(text);
};

pcrypt.sha256 = function(text, enc) 
{
    let md = forge.md.sha256.create();
    md.update(text, enc);
    return md.digest().toHex();
};

pcrypt.encryptdata = function(keycrypt, data, compression) 
{
    if (!data)
        return "";

    try {
        let text = pcrypt.jsonstringify(data);
        return pcrypt.encryptstring(keycrypt, text, compression);
    } catch (e) {
        return false;
    }
};

pcrypt.decryptdata = function(keycrypt, data) 
{
    if (!data)
        return "";

    if (data.length == 0) // special case
        return "";

    try {
        let datastring = pcrypt.decryptstring(keycrypt, data);

        if (datastring === false)
            return false;

        return pcrypt.jsonparse(datastring, true);
    } catch (e) {
        return false;
    }
};

pcrypt.encryptstring = function(keycrypt, text, compression) 
{
    try 
    {
        if (typeof compression == 'undefined')
            compression = false;

        if (compression)
            throw "Compression not implemented";

        // TODO - compression of data (need multitasking)
        //var out = new Uint8Array(buffer.byteLength);
        //var len = jslzjb.compress(buffer, out);
        // cryptObj.comp = 'jslzjb';

        let iv = forge.random.getBytesSync(16);

        // encrypt some bytes using GCM mode
        let cipher = forge.cipher.createCipher('AES-GCM', keycrypt);

        cipher.start(
        {
            iv: iv,
            additionalData: 'pcrypt-encoded-string',
            tagLength: 128
        });

        cipher.update(forge.util.createBuffer(text));

        if (!cipher.finish())
            throw "Encrypt returned error";

        // store it in JSON with some more info
        let cryptObj = {};

        cryptObj.info = 'pcrypt';
        cryptObj.type = 'symmetric';
        cryptObj.ver = 1;
        cryptObj.enc = 'base64';
        cryptObj.comp = 'none'; // Compression not implemented
        cryptObj.algo = 'AES-GCM';
        cryptObj.iv = forge.util.encode64(iv);
        //cryptObj.tag = forge.util.encode64(cipher.mode.tag.getBytes());
        cryptObj.tag = forge.util.encode64(cipher.mode.tag.data);
        //cryptObj.data = forge.util.encode64(cipher.output.getBytes());
        cryptObj.data = forge.util.encode64(cipher.output.data);
        cryptObj.hash = pcrypt.sha256(cryptObj.data); // Only used to detect changes at server level (checksum)

        return pcrypt.jsonstringify(cryptObj);
    } 
    catch (e) 
    {
        console.log('Encrypt error: ', e);
        return false;
    }
};

pcrypt.decryptstring = function(keycrypt, text) 
{
    if (!text)
        return "";

    if (text.length == 0) // special case
        return "";

    try 
    {
        let cryptObj = pcrypt.jsonparse(text);

        if (!cryptObj)
            throw "ENC info missing";

        if (cryptObj.info !== 'pcrypt') // data
            throw "ENC info with unknown info";

        if (cryptObj.type !== 'symmetric') // type test
            throw "ENC info with unknown type";

        if (cryptObj.ver !== 1) // version test
            throw "ENC info with unknown version";

        if (cryptObj.enc !== 'base64') // encoding test
            throw "ENC info with unknown encoding";

        let iv = (forge.util.decode64(cryptObj.iv));
        let encrypted = forge.util.createBuffer(forge.util.decode64(cryptObj.data));
        let decipher = forge.cipher.createDecipher(cryptObj.algo, keycrypt);
/*
        var iv = (forge.util.decode64(cryptObj.iv));
        var decrypted = forge.util.createBuffer(forge.util.decode64(cryptObj.data));
        var decipher = forge.cipher.createDecipher(cryptObj.algo, keycrypt);
*/
        switch (cryptObj.algo) 
        {
            default: throw "ENC info with unknown libmode";

            case 'AES-CTR':
                decipher.start(
                {
                    iv: iv
                });
                break;

            case 'AES-GCM':
                if (!cryptObj.tag)
                    throw "TAG info missing";

                let tag = new forge.util.ByteBuffer();
                tag.putBytes(forge.util.decode64(cryptObj.tag));

                decipher.start(
                {
                    iv: iv,
                    additionalData: 'pcrypt-encoded-string',
                    tagLength: 128,
                    tag: tag
                });
                break;
        }

	     decipher.update(encrypted);

        if (!decipher.finish())
        {
          throw "Decrypt returned error (wrong key)";
        }

        // TODO - decompression of data

        //return decipher.output.getBytes();
        return decipher.output.data;
    } 
    catch(e) 
    {
        console.log('Decrypt error: ', e);
        return false;
    }
};
/*
pcrypt.encryptbinary = function (keycrypt, binary, filetype, compression) // NB: Binary string
{
  try
	{
    if(typeof compression == 'undefined')
      compression = false;

    var mainObj = {};

    if(compression)
    {
      // TODO - compression of data

      //var out = new Uint8Array(buffer.byteLength);
      //var len = jslzjb.compress(buffer, out);
      // mainObj.comp = 'jslzjb';
    }
    else
    {
      mainObj.comp = 'none';
    }

	  var iv = forge.random.getBytesSync(16);

	  // encrypt some bytes using GCM mode
	  var cipher = forge.cipher.createCipher('AES-GCM', keycrypt);

    cipher.start({
      iv: iv,
      additionalData: 'pcrypt-encoded-binary',
      tagLength: 128
    });

	  cipher.update(forge.util.createBuffer(binary));

	  if(!cipher.finish())
	    throw "Encrypt returned error";

	  mainObj.info = 'pcrypt';
	  mainObj.type = 'symmetric';
    mainObj.filetype = 'filetype';
	  mainObj.ver = 1;
	  mainObj.enc = 'binary';
    if(compression)
      mainObj.comp = 'jslzjb';
    else
      mainObj.comp = 'none';
    mainObj.algo = 'AES-GCM';
	  mainObj.iv = forge.util.encode64(iv);
	  mainObj.tag = forge.util.encode64(cipher.mode.tag.data);
    mainObj.hash = pcrypt.sha256(cipher.output.data); // Only used to detect changes at server level (checksum)

    var strjson = pcrypt.jsonstringify(mainObj);
    var datatext = new TextEncoder("utf-8").encode("12345" + strjson + cipher.output.data); // Uint8Array (ArrayBuffer);
    var dataview = new DataView(datatext.buffer, 0);
    dataview.setUint8(0, 255); // Indication of this format
    dataview.setUint32(1, strjson.length + 5); // max unsigned 32-bit integer (Endiness is not a problem as it is always set the same way with these functions - parameter)

	  return datatext.buffer;
	}
	catch(e)
  {
    return false;
  }
};

pcrypt.decryptbinary = function (keycrypt, data)
{
  if(!data)
		return "";

	if(data.length == 0) // special case
		return "";

  try
  {
    var datastring = pcrypt.decryptstring(keycrypt, data);

    if(datastring === false)
      return false;

	  return pcrypt.jsonparse(datastring, true);
  }
  catch(e)
  {
    return false;
  }
};
*/

pcrypt.encodeasymetrickeys = function(type, enc, curvedh, keydh, curvesign, keysign) {
    // http://safecurves.cr.yp.to/ and http://pqcrypto.org/

    // because we use different curves for encoding and signing but like to store it nicely in the same DB field
    var cryptObj = {};
    var dhObj = {};
    var signObj = {};

    cryptObj.info = 'pcrypt';
    cryptObj.algo = 'ECC';
    cryptObj.ver = 1;
    cryptObj.type = type;
    cryptObj.enc = enc;

    dhObj.curve = curvedh;
    dhObj.data = keydh;
    cryptObj.ecdh = dhObj;

    signObj.curve = curvesign;
    signObj.data = keysign;
    cryptObj.ecdsa = signObj;

    return pcrypt.jsonstringify(cryptObj);
};

pcrypt.decodeasymetrickeys = function(asymkey) {
    return pcrypt.jsonparse(asymkey);
};

pcrypt.getsharedsecret = function(privatekey, publickey) {
    try {
        if (!privatekey)
            throw "ASYM private key not valid";

        if (!publickey)
            throw "ASYM public key not valid";

        if (privatekey.info !== 'pcrypt')
            throw "ASYM info with unknown info";

        if (privatekey.algo !== 'ECC')
            throw "ASYM info with unknown algo";

        if (privatekey.ver !== 1)
            throw "ASYM info with unknown version";

        if (privatekey.enc !== 'pcrypt')
            throw "ASYM info with unknown encoding";

        if (privatekey.type != "private")
            throw "ASYM private key is not private";

        if (!privatekey.ecdh || !privatekey.ecdh.data)
            throw "ASYM private key is invalid";

        if(parseInt(privatekey.ecdh.data, 16) === NaN) // May be that the private key is not decrypted
            throw "ASYM private key data is NaN";

        if (publickey.type != "public")
            throw "ASYM public key is not public";

        if (publickey.enc !== 'hex')
            throw "ASYM info with unknown encoding";

        if (publickey.info != privatekey.info)
            throw "ASYM info are not the same";

        if (publickey.algo != privatekey.algo)
            throw "ASYM algo are not the same";

        if (publickey.ver != privatekey.ver)
            throw "ASYM version are not the same";

        if (publickey.ecdh.curve != privatekey.ecdh.curve)
            throw "ASYM curves are not the same";

        // Initiate a new EC context for DH key exchange
        var eccdh = new elliptic.ec(privatekey.ecdh.curve);

        // Get the shared keys/points
        var keypointprivate = eccdh.keyFromPrivate(privatekey.ecdh.data, 'hex');
        var keypointpublic = eccdh.keyFromPublic(publickey.ecdh.data, 'hex');
        var validation = keypointprivate.validate(keypointpublic);

        if (validation.result !== true)
            throw "ECC public key validation failed";

        // Get the shared secret as a BN (is 32 bytes in length)
        var sharedsecret = keypointprivate.derive(keypointpublic.getPublic());

        // Convert to byte string
        return forge.util.hexToBytes(pcrypt.sha256(sharedsecret.toString(16)));
    } catch (e) {
        console.log('Unable to find shared secret');
        return false;
    }
};

pcrypt.workermessages = function(callback) 
{
    if (!pcrypt.worker) {
        pcrypt.worker = new Worker('js/lib/pcrypt.worker.js');
    }

    pcrypt.worker.addEventListener("message", callback, false);
};

pcrypt.workerkillmessages = function(callback) 
{
    //pcrypt.worker.terminate();
    //delete pcrypt.worker;

    pcrypt.worker.removeEventListener("message", callback);

    return true;
};

pcrypt.workercall = function(message) 
{
    // Test that it is an object and has the right properties
    // TODO set progress indicator here?
    postMessage({method: 'spinner_response', value: true});
    pcrypt.worker.postMessage(message);
    
    return true;
};






/*

pcrypt.workercrypt = function ()
{
  sha256 = function (text, enc)
  {
  	var md = forge.md.sha256.create();
  	md.update(text, enc);
  	return md.digest().toHex();
  };

  jsonparse = function (string)
  {
    if((typeof string === "string") && string.length > 0)
    {
      try
      {
        return JSON.parse(string, function reviver(key, value)
        {
          if(typeof value === "string") // We have to unescape special characters
          {
            return value.replace(/\\u([\d\w]{4})/gi, function (match, hex)
            {
              return String.fromCharCode(parseInt(hex, 16));
            });
          }
          return value;
        });
      }
      catch(err)
      {
        throw 'JSON.parse error: ' + err.message, 'pcrypt.js';
        return null;
      }
    }
    else
    {
      return null;
    }
  };

  jsonstringify = function (obj)
  {
    return JSON.stringify(obj, function replacer(key, value)
    {
      if(typeof value === "string") // We have to escape special characters as some above 0xFF gives parse errors (unexpected token f.ex u2019)
      {
        return value.replace(/[\u0100-\uffff]/g, function (c)
        {
          return '\\u'+('0000'+c.charCodeAt(0).toString(16)).slice(-4);
        });
      }
      return value;
    });
  };

  importScripts(systempath + 'js/lib/forge.min.js'); // systempath + 'js/lib/elliptic.min.js');

  addEventListener("error", function (evt)
  {
      postMessage({method: 'error', value: evt});
  }, false);

  addEventListener("message", function (evt)
  {
    //debugger;

    switch(evt.data.method)
    {
      default:
        postMessage({method: 'response', id: evt.data.id, value: false});
      break;

      case 'encrypt' :

        var iv = forge.random.getBytesSync(16);

        // encrypt some bytes using GCM mode
        var cipher = forge.cipher.createCipher('AES-GCM', evt.data.keycrypt);

        cipher.start({
          iv: iv,
          additionalData: 'pcrypt-encoded-string',
          tagLength: 128
        });

        cipher.update(forge.util.createBuffer(evt.data.text));

        if(!cipher.finish())
          throw "Encrypt returned error";

        // store it in object with some more info
        var cryptObj = {};

        cryptObj.info = 'pcrypt';
        cryptObj.type = 'symmetric';
        cryptObj.ver = 1;
        cryptObj.enc = 'base64';
        cryptObj.comp = 'none'; // Compression not implemented
        cryptObj.algo = 'AES-GCM';
        cryptObj.iv = forge.util.encode64(iv);
        cryptObj.tag = forge.util.encode64(cipher.mode.tag.data);
        cryptObj.data = forge.util.encode64(cipher.output.data);
        cryptObj.hash = sha256(cryptObj.data); // Only used to detect changes at server level (checksum)

        postMessage({method: 'response', id: evt.data.id, value: jsonstringify(cryptObj)});
      break;

      case 'decrypt' :
        if(!evt.data.text)
          return "";

        if(evt.data.text.length == 0) // special case
          return "";

        try
        {
          var cryptObj = jsonparse(evt.data.text);

          if(!cryptObj)
            throw "ENC info missing";

          if(cryptObj.info !== 'pcrypt') // data
            throw "ENC info with unknown info";

          if(cryptObj.type !== 'symmetric') // type test
            throw "ENC info with unknown type";

          if(cryptObj.ver !== 1) // version test
            throw "ENC info with unknown version";

          if(cryptObj.enc !== 'base64') // encoding test
            throw "ENC info with unknown encoding";

          var iv = (forge.util.decode64(cryptObj.iv));
          var decrypted = forge.util.createBuffer(forge.util.decode64(cryptObj.data));
          var decipher = forge.cipher.createDecipher(cryptObj.algo, evt.data.keycrypt);

          switch(cryptObj.algo)
          {
            default:
              throw "ENC info with unknown libmode";

            case 'AES-CTR':
              decipher.start({
                iv: iv
              });
            break;

            case 'AES-GCM':
              if(!cryptObj.tag)
                throw "TAG info missing";

              var tag = new forge.util.ByteBuffer();
              tag.putBytes(forge.util.decode64(cryptObj.tag));

              decipher.start({
                iv: iv,
                additionalData: 'pcrypt-encoded-string',
                tagLength: 128,
                tag: tag
              });
            break;
          }

          decipher.update(decrypted);

          if(!decipher.finish())
            throw "Decrypt returned error";

          postMessage({method: 'response', id: evt.data.id, value: decipher.output.data});
        }
        catch(e)
        {
          postMessage({method: 'response', id: evt.data.id, value: e.message});
        }
      break;
    }
  }, false);
};

pcrypt.workerstart = function (workerfunc, folder, callback)
{
  // https://www.developer.com/lang/jscript/7-things-you-need-to-know-about-web-workers.html
  // Debug - chrome://inspect/#workers

  var workercode = "var systempath = '" + folder + "';";
  var workerstring = workerfunc.toString();

  workercode += workerstring.substring(workerstring.indexOf("{")+1, workerstring.lastIndexOf("}"));

  var workerblob = new Blob([workercode], {type: "application/javascript"});
  var worker = new Worker(URL.createObjectURL(workerblob));

  if(callback)
  {
    worker.addEventListener("message", function (evt)
    {
      callback(evt.data);
    }, false);
  }

  return worker;
};


// Use like this


      var worker = pcrypt.workerstart(pcrypt.workercrypt, pcrypt.urldomain + pcrypt.urlpath, function (data)
      {
          console.log(data);
      });

      var key = forge.random.getBytesSync(16);

      worker.onmessage = function (evt)
      {
        if(evt.data.method === 'response')
        {
          switch(evt.data.id)
          {
            case 'encrypt':
              worker.postMessage({method: 'decrypt', id: 'decrypt', text: evt.data.value, keycrypt: key});
            break;
          }
        }
      };

      worker.postMessage({method: 'encrypt', id: 'encrypt', text: 'dette er en test', keycrypt: key});

      return;
*/

pcrypt.getadminmaildata = function(session, forceserver, dataname, id, callback) 
{
  pcrypt_adminusers(session, id, function usersfunc(data, error, id) 
  {
    if(error) 
    {
      callback(data, error, id);
      return;
    }

    if(!pcrypt.setvalue(dataname, data, true, true)) 
    {
      callback('Exception in storing value', 'users', id);
      return;
    }
    callback(data, error, id);
  });

  return false;
}

pcrypt.getalladminusers = function (session, id, callback) 
{
  pcrypt_adminusers(session, id, 0, 0, 'email', function(data, error, id)
  {
    if(error)
    {
      if(callback)
      {
        callback(data, error, id);
        return;
      }
    }

    callback(data, error, id);
  });
}

pcrypt.getadminusers = function(session, forceserver, dataname, id, order, callback) 
{
  if(!pcrypt.getvalue('options').isglobaladmin) 
  {
    return;
  }

  if(!forceserver && pcrypt.existvalue(dataname)) 
  {
    callback(pcrypt.getvalue(dataname, true, true), null, id);
    return true;
  } 
  else 
  {
    // default values
    var restriction = 50;
    var page = 0;
    var displayNElement = document.getElementById('display-n-users');
    var displayN = Number(displayNElement.options[displayNElement.selectedIndex].value);
    var pageSelected = Number(document.getElementById('display-n-page').innerText)-1;
    
    if(typeof displayN === 'number')
    {
      restriction = displayN; 
    }

    if(typeof pageSelected === 'number')
    {
      page = pageSelected;
    }

    pcrypt_adminusers(session, id, restriction, page, order, function usersfunc(data, error, id) 
    {
      if(error) 
      {
        callback(data, error, id);
        return;
      }
      if(!pcrypt.setvalue(dataname, data, true, true)) 
      {
        callback('Exception in storing value', 'users', id);
        return;
      }
      callback(data, error, id);
    });
    return false;
  }
}

pcrypt.admindeleteusers = function(session, id, users, callback) 
{
  if(!pcrypt.getvalue('options').isglobaladmin) 
  {
    return;
  }

  pcrypt_admindeleteusers(session, id, users, function(data, error, id) 
  {
    callback(data, error, id);
  });

}

pcrypt.adminusersearch = function (session, id, search, restriction, page, order, callback) 
{
  if(!pcrypt.getvalue('options').isglobaladmin)
  {
    return;
  }

  var restriction = 50;
  var page = 0;
  var displayNElement = document.getElementById('display-n-users');
  var displayN = Number(displayNElement.options[displayNElement.selectedIndex].value);
  var pageSelected = Number(document.getElementById('display-n-page').innerText)-1;
  
  if(typeof displayN === 'number')
  {
    restriction = displayN; 
  }

  if(typeof pageSelected === 'number')
  {
    page = pageSelected;
  }

  pcrypt_adminusersearch(session, id, search, restriction, page, order, function (data, error, id)
  {
    callback(data, error, id);
  });
  
}

pcrypt.adminusercount = function(session, id, callback)
{
  if(!pcrypt.getvalue('options').isglobaladmin)
  {
    return;
  }

  pcrypt_admincountusers(session, id, function (data, error, id) 
  {
    callback(data, error, id);
  });
}

pcrypt.adminusercountsearch = function (session, search, id, callback)
{
  if(!pcrypt.getvalue('options').isglobaladmin)
  {
    return;
  }

  pcrypt_admincountuserssearch(session, id, search, function (data, error, id) 
  {
    callback(data, error, id);
  });
}

pcrypt.emergencysetup = function(session, email, receiveremail, emailtimer, languagecode, id, callback)
{
  pcrypt_setupemergency(session, email, receiveremail, emailtimer, languagecode, id, function(data, error, id)
  {
    callback(data, error, id);
  });
}

pcrypt.emergencykeyupdate = function (session, id, callback)
{
  pcrypt_emergencykeyupdate(session, id, function (data, error, id)
  {
    callback(data, error, id);
  });
}

pcrypt.emergencysetupresend = function(session, index, languagecode, id, callback)
{
  pcrypt_emergencysetupresend(session, index, languagecode, id, function(data, error, id)
  {
    callback(data, error, id);
  });
}

pcrypt.setemergencydata = function(session, data, id, callback) 
{
  pcrypt_setemergencydata(session, data, id, function(data, error, id)
  {
    callback(data, error, id);
  });
}

pcrypt.emergencycheckdata = function(session, data, id, callback)
{
  pcrypt_emergencycheckdata(session, data, id, function(data, error, id)
  {
    callback(data, error, id);
  });
}

pcrypt.deleteemergency = function(session, index, languagecode, id, callback)
{
  pcrypt_deleteemergency(session, index, languagecode, id, function(data, error, id)
  {
    callback(data, error, id);
  });
};

pcrypt.updateemergency = function(session, data, id, callback)
{
  pcrypt_updateemergencydata(session, data, id, function(data, error, id)
  {
    callback(data, error, id);
  });
}

pcrypt.requestemergencyaccess = function (session, index, languagecode,  id, callback)
{
  pcrypt_requestemergencydata(session, index,  languagecode, id, function(data, error, id)
  {
    callback(data, error, id);
  });
}

pcrypt.getemergencydata = function (session, data, id, callback)
{
  pcrypt_getemergencydata(session, data, id, function(data, error, id)
  {
    callback(data, error, id);
  });
}

pcrypt.makelogentry = function (session, message, shown, id, callback)
{
  pcrypt_makelogentry(session, message, shown, id, function(data, error, id)
  {
    callback(data, error, id);
  });
}

pcrypt.getextension2fastate = (session, id, callback) => 
{
  pcrypt_getextension2fastate(session, id, (data, error, id) => 
  {
    callback(data, error, id);
  });
}

pcrypt.toggleextension2fa = (session, id, callback) => 
{
  pcrypt_toggleextension2fa(session, id, (data, error, id) => {
    callback(data, error, id);
  });
}