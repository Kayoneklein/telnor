var loc = self.location.pathname;
var systempath = loc.substring(0, loc.lastIndexOf('/'));

//debugger;
//console.log(systempath);

importScripts(systempath + '/forge.min.js');
importScripts(systempath + '/elliptic.min.js');
importScripts(systempath + '/pcrypt.config.js');
importScripts(systempath + '/pcrypt.config.loc.js');
importScripts(systempath + '/pcrypt.js'); // TODO - maybe required functions shall be moved to a new file pcrypt.inc.js (a lot is not needed)

addEventListener("error", function (evt)
{
    postMessage({method: 'error', value: evt});
}, false);

addEventListener("message", function (evt)
{
  if(evt.data.method == 'spinner_response')
  {
    return;
  }
  
  let singledimensionkeys = false;
  let filedata = evt.data.filedata; // Array with file data
  let keydata = evt.data.keydata; // Array of array keys (first level array index reference file in filearray)
  // evt.data.method specify encryption or decryption
  // evt.data.param specify pass thru data for further processing
  // evt.data.id specify pass thru id for further processing (what are we doing)
  // return files in the form of array of array binary data (encrypted or not)

  console.log(evt.data.method); //@RASMUS problem med spinner

  if(!Array.isArray(filedata)) // Special case where we just have to get to next step (delete some shared files on server)
  {
    postMessage({method: 'response', id: evt.data.id, param: evt.data.param, value: false});
    return;
  }

  if(!Array.isArray(keydata))
  {
    if(typeof keydata !== 'string')
    {
      console.log('Invalid key type');
      postMessage({method: 'response', id: evt.data.id, param: evt.data.param, value: false});
      return;
    }

    keydata = new Array(filedata.length).fill(keydata); // We allow to use a single key for all data
  }

  var returndata = new Array(filedata.length);

  postMessage({method: 'spinner_response', id: evt.data.id, param: 'worker_status', value: true});

  for(let f = 0, len_f = filedata.length; f < len_f; f++) // f = file
  {
    let file = filedata[f];

    if(file === null)
    {
      returndata[f] = null; // Special case for private files that need to be deleted
      continue;
    }

    if(typeof file !== 'string')
    {
      console.log('Wrong filedata parameter type');
      returndata[f] = false;
      continue;
    }

    if(!Array.isArray(keydata[f]))
    {
      singledimensionkeys = true;
      //console.log('Key extension in second level');
      keydata[f] = new Array(1).fill(keydata[f]); // We allow to use a single key for all data
    }

    returndata[f] = new Array(keydata[f].length);

    for(let k = 0, len_k = keydata[f].length; k < len_k; k++) // k = key
    {       
      let key = keydata[f][k];

      if(typeof key !== 'string')
      {
        console.log('Wrong keydata parameter type');
        returndata[f][k] = false;
        continue;
      }

      switch(evt.data.method)
      {
        case 'encrypt' : 
          returndata[f][k] = pcrypt.encryptstring(key, file, false);
        break;

        case 'decrypt' :
          if(k == 0) // Only a single key is allowed for decryption
          {
            returndata[f][k] = pcrypt.decryptstring(key, file);
          }
        break;
      }

      if(singledimensionkeys) // We may need to remove a level in the return
      {
        returndata[f] = returndata[f][k];
      }
    }
  }

  postMessage({method: 'response', id: evt.data.id, param: evt.data.param, value: returndata});
  postMessage({method: 'spinner_response', id: evt.data.id, param: 'worker_status', value: false});

}, false);
