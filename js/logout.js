"use strict";

var session = pcrypt.getvalue('session');
var keycrypt = pcrypt.getvalue('keycrypt');
var gidshown = pcrypt.getvalue('gidshown');
var email = pcrypt.getvalue('email');

pcrypt.flushvalues();

loader(false);

if(session)
{
  window.localStorage.removeItem('popupRead'); // No use storing after logout
  window.localStorage.removeItem('passwarning');
  pcrypt.setdata(session, keycrypt, 'setting.gidshown', gidshown, false, 0, function savesettings(data, error, id)
  {
    pcrypt_logout(session, 0, function logoutfunc(data, error, id)
    {
      if(error)
      switch(error)
      {
        default:
          handlepcrypterror(error, data);
        return;

        case 14: // User already logged out
        return;
      }

      function extcallback(result)
      {
        if(result && gpcrypt.extension.version) // Is extension installed
        {
          extsendmessage({sender: 'desktop', target: 'background', method: "logout", email: email}, function (response)
          {
            if(response && response.result === true) // test if extension accept the credentials
            {
              //alert('SAME LOGIN OUT');
            }
          });
        }
      }

      if(!gpcrypt.extension.version)
      {
        // In this case we have to wait for the extension listener to install (maybe too quick logic for it to return as normal)
        extinstalllistener(extcallback);
      }
      else
      {
        extcallback(true);
      }
    });
  });
}

//document.cookie = "pcryptauthsession=''; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;" // This is for forum phpBB
//document.cookie = "pcryptemail=''; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;" // This is for forum phpBB

setTimeout(function()
{
  window.location.replace(window.location.protocol + '//' + window.location.host + removefilefrompath(window.location.pathname) + '/index.html');
}, 2000);
