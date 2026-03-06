"use strict";

g.srpclient = null;
g.hexhash = false;

function performAction(urlaction, urlemail)
{
  if(urlaction && (typeof urlaction === 'string')) // Click on some component after initialisation or initial urlaction
  {
    switch (urlaction)
    {
      case "create":

        if (pcrypt.redirectoncreation !== false) // This is for the SaaS at pcrypt.org to track users
        {
          let _langcode = localStorage.getItem('languagecode');
          let string = pcrypt.redirectoncreation;
          let _url = string.replace("[LANG]", _langcode);
          _url = _url + '?email=' + urlemail;
          window.location.href = _url;
        }
        else
        {
          modalalert(g.lang.loginjs.PSLOGINACCOUNTACTIVATED, g.lang.default.PCPROGRAMTITLE, function() 
          {
            setTimeout(function() 
            {
              $('#login-form__password').focus();
            }, 200);
          });
        }

        break;

      case "updateid":
        modalalert(g.lang.loginjs.PCLOGINACCOUNTUPDATED, g.lang.default.PCPROGRAMTITLE, function() 
        {
          setTimeout(function() 
          {
            $('#login-form__password').focus();
          }, 200);
        });
        break;

      case "delete":
        modalalert(g.lang.loginjs.PCACCOUNTCONFIRMDELETE, g.lang.default.PCPROGRAMTITLE);
        break;

      case "delete2":
        modalalert(g.lang.loginjs.PCACCOUNTCONFIRMDELETE2, g.lang.default.PCPROGRAMTITLE);
        break;

      case "teamincludeuser":
        modalalert(g.lang.loginjs.PCACCOUNTTEAMINCLUDEUSER, g.lang.default.PCPROGRAMTITLE);
        break;

      case "scimcreateuser":
      case "teamcreateuser":
        $('.change-form--register').trigger('click');
        modalalert(g.lang.loginjs.PCACCOUNTTEAMCREATEUSER, g.lang.default.PCPROGRAMTITLE);
        break;

      case "scimcreatedone":
      case "teamcreatedone":
        modalalert(g.lang.loginjs.PCACCOUNTTEAMCREATEDONE, g.lang.default.PCPROGRAMTITLE);
        break;

      case "emergencyapprove":
        modalalert(g.lang.loginjs.EMERGENCYSETUPAPPROVE, g.lang.default.PCPROGRAMTITLE);
        break;

      case "emergencyaccessrequest":
        modalalert(g.lang.loginjs.EMERGENCYREQUESTDONE, g.lang.default.PCPROGRAMTITLE);
      break;
      
      case "emergencyaccessdenial":
        modalalert(g.lang.loginjs.PCEMERGENCYDENIALDONE, g.lang.default.PCPROGRAMTITLE);
      break;

      case "register":
        $('.change-form--register').trigger('click');
        modalalert(g.lang.loginjs.PSLOGINREGISTERTEXT, g.lang.default.PCPROGRAMTITLE);
        break;

      case "sessionlogout":
        modalalert(g.lang.default.PCUSERSESSIONINVALID, g.lang.default.PCPROGRAMTITLE);
        break;
    }

    return;
  }
}

function setupUI()
{
  let urlaction = getUrlParameter('action');
  let urlemail = getUrlParameter('email');
  let urlerrorid = getUrlParameter('errorid');
  let urlerrorstring = getUrlParameter('errorstring');
  let urlautologinid = getUrlParameter('autologinid');
  let urlsource = getUrlParameter('source');
  let urltopremium = getUrlParameter('logintoprem');
  let urlpaymentReceived = getUrlParameter('paymentreceived');

  // Clear Address URL in browser - Remove the message from the url.
  window.history.replaceState(null, null, window.location.pathname);

  // Get all elements here to avoid calling it multiple times below
  let elmEmail = document.getElementById('login-form__email');
  let elmPass = document.getElementById('login-form__password');
  let elmPassConfirm = document.getElementById('login-form__password-confirm');
  let elmTimeout = document.getElementById('login-form__timeout');
  let elmPrivacy = document.getElementsByClassName('footer__privacy');
  let elmContact = document.getElementsByClassName('footer__contact');
  let elmFooter = document.getElementsByClassName('login-footer');
  let elmYear = document.getElementById('login-copyright-year');
  let elmShowPassword = document.getElementById('show-password-button');

  // Set correct copyright year
  if (elmYear)
  {
    elmYear.textContent = (new Date()).getFullYear();
  }

  if (g.options)
  {
    if (g.options.disableusercreate === false) 
    {
      // Include CREATE USER tab or not
      if (urlaction != 'teamcreateuser') 
      {
        $(".change-form--register").show();
      }
    }

    if (g.options.disableuserdelete === false) 
    {
      // Include CREATE USER tab or not
      if (urlaction != 'teamcreateuser') 
      {
        $(".change-form--remove").show();
      }
    }

    if(g.options.disablefooter === false)
    {
      elmFooter[0].hidden = false;

      // Added for future changes (and because it looks a bit better.)
      elmContact[0].style = '';

      // if disableprivacy page is true it completely removes the element.
      if(g.options.disableprivacypage == true)
      { 
        elmPrivacy[0].remove();
      }
      else
      { // Otherwise simply make the style shown.
        elmPrivacy[0].style = '';
      }
    }
    else
    {
      elmFooter[0].hidden = true;

    }
  }

  // Show payment received dialog ?
  if (urlpaymentReceived == "1")
  {
    modaldiv('#dialog-payment-receipt', 400, 'Thank you', true, true, function () {}, function (result) 
    {
      if (result) 
      {
        window.parent.location.reload();
        window.close();
      }
    });
  }   

  // Test if we can login from extension right away
  if (typeof urlautologinid === 'string') 
  {
    function extcallback(response) 
    {
      if (response && response.result && response.method) // we get a reply back
      {
        switch (response.method) 
        {
          default:
            console.log('Unknown postMessage method: ' + response.method);
            break;

          case 'version': // Extension is installed because inject send this message when page is loaded completely
            extsendmessage(
            {
              sender: 'desktop',
              target: 'background',
              method: "getautologin",
              rand: urlautologinid
            }, (response) => {
              if(response && response.result === true)
              {
                
              }
            });
            break;

          case 'response': // A reply from a prior request
            switch (response.responseto) 
            {
              default:
                console.log('Unknown postMessage responseto: ' + response.responseto);
                break;

              case 'getautologin':
                elmEmail.value = response.user;
                delmPass.value = response.pass;
                SystemLogin(null);
                break;
            }
            break;
        }
      } else {
        console.log('Invalid or false postMessage reply: ' + response);
      }
    }

    if(!gpcrypt.extension.version) 
    {
      // We have to wait for the extension listener to install (too quick logic for it to return as normal)
      extinstalllistener(extcallback);
    } 
    else 
    {
      console.log('Error - default extinstalllistener installed');
    }
  }

  // Do we need to display an error
  if (typeof urlerrorid === 'string')
  {
    switch (urlerrorid)
    {
      default:
        modalalert(urlerrorstring, g.lang.default.PCPROGRAMTITLE);
        break;

      case "8":
        modalalert(g.lang.loginjs.PSLOGINCONFIRMIDNOTFOUND, g.lang.default.PCPROGRAMTITLE);
        break;
    }
  }

  if(urltopremium)
  {
    g.options.logintopremium = true;
    //pcrypt.setvalue('logintopremium', true, false, false);
  }

  if (typeof urlsource === 'string')
  {
    if(!pcrypt.existvalue('registersource'))
    {
      let sessionVar = randomString(pcrypt.randomidlength);

      pcrypt_registersource(sessionVar, urlsource, 0, 0, function(data, error, id)
      {
        if(error)
        {
          console.log(data);
          return;
        }

        pcrypt.setvalue('registersource', {id: sessionVar, source: urlsource}, false, false);
      });
    }
  } 

  // Set timeout dropdown index from localStorage
  var timeoutvalue = localStorage['pcrypttimeout'];

  for (var i = 0, j = elmTimeout.options.length; i < j; ++i) 
  {
    if (elmTimeout.options[i].value == timeoutvalue) 
    {
      elmTimeout.selectedIndex = i;
      break;
    }
  }

  // Test if we can fill in email from url
  if (typeof urlemail === 'string') 
  {
    elmEmail.value = urlemail;
  } 
  else 
  {
    // Get username/email from cookie
    let username = localStorage['pcryptusername'];

    if (username)
    {
      elmEmail.value = username;
    }
  }

  validemail(elmEmail.value, elmEmail); // Sets backgroupd color

  if (elmEmail.value.length)
  {
    elmPass.focus();
  }
  else
  {
    elmEmail.focus();
  }

  // Automatic login from extension
  if (!localStorage['alert-extensionhide'] && !modalvisible()) // Only do action below if a dialog is not shown?
  {

    document.getElementById('alert-extension-btn-decline').onclick = function (event) {
      localStorage['alert-extensionhide'] = true;
      hidealertextension();
    };

    setTimeout(function () {
      hidealertextension();
    }, 33000);

    // We have to wait for the extension inject script to work if installed
    setTimeout(function ()
    {
      var parser = new UAParser().getResult();

      if (parser.device.type == 'mobile' || parser.device.type == 'tablet') // is mobile or tablet
      {
        document.getElementById('alert-extension-text').innerHTML = g.lang.loginjs.PCLOGINQUESTIONMOBILE;

        switch (parser.os.name)
        {
          case 'Android':
            positionalertextension();
            // $('#alert-extension').addClass('active');
            document.getElementById('alert-extension-btn-accept').onclick = function (event)
            {
              hidealertextension();
              window.open("https://play.app.goo.gl/?link=https://play.google.com/store/apps/details?id%3Dorg.pcrypt.app2%26ddl%3D1%26pcampaignid%3Dweb_ddl_1");
            };
            break;

          case 'iOS':
            positionalertextension();
            // $('#alert-extension').addClass('active');
            document.getElementById('alert-extension-btn-accept').onclick = function (event)
            {
              hidealertextension();
              window.open("https://itunes.apple.com/dk/app/password-crypt/id1168532892?&mt=8");
            };
            break;

          case 'Windows':
            console.log('Windows');
            break;
        }
      } 
      else if (!pcrypt.disableextensionalert && !gpcrypt.extension.version && !parser.device.type)
      {
        document.getElementById('alert-extension-text').innerHTML = g.lang.loginjs.PCLOGINQUESTIONEXT;

        if (parser.browser.name !== 'Safari') // Safari not yet supported
          switch (parser.engine.name) 
          {
            case 'WebKit':
              positionalertextension();
              // $('#alert-extension').addClass('active');
              document.getElementById('alert-extension-btn-accept').onclick = function (event)
              {
                hidealertextension();
                window.open("https://chrome.google.com/webstore/detail/password-crypt/bbmopijofiecgpghgljiokdejeffbmdo");
              };
              break;

            case 'Gecko':
              // positionalertextension(); // Turned off until the extension is back up. Privacy policy + new build 
              // // $('#alert-extension').addClass('active');
              // document.getElementById('alert-extension-btn-accept').onclick = function (event)
              // {
              //   console.log('Gecko');
              // };
              break;
          }
      }
    }, 3000);
  }

  loader(false);

  /*
   * Only event handlers below
   */

  // Set scroll down button event handler
  $(".scroll-arrow").click(function () 
  {
    $(".main__sellingpoints")[0].scrollIntoView({behavior: "smooth", block: "start"});
  });

  $('.change-form--login').click(function (ev) 
  {
    ev.preventDefault();

    document.querySelector('.login-form').className = 'login-form login-form--login';
    $('h3.login-heading').html(g.lang.login.PCLOGINLOGINBUTTON);
    $('#PCLOGINLOGINBUTTON').html(g.lang.login.PCLOGINLOGINBUTTON);
    $('.change-form--register').show();
    $('.change-form--remove').show();
    $('.change-form--login').hide();
    $('#password-eye-wrapper').show();
  });

  $('.change-form--register').click(function (ev) 
  {
    ev.preventDefault();

    document.querySelector('.login-form').className = 'login-form login-form--register';
    $('#PCLOGINLOGINBUTTON').html(g.lang.login.PCLOGINSIGNUP);
    $('h3.login-heading').html(g.lang.login.PCLOGINSIGNUP);
    $('.change-form--login').show();
    $('.change-form--remove').show();
    $('.change-form--register').hide();
    $('#password-eye-wrapper').show();
  });

  $('.change-form--remove').click(function (ev)
  {
    ev.preventDefault();
    
    document.querySelector('.login-form').className = 'login-form login-form--remove';
    $('.change-form--login').show();
    $('.change-form--register').show();
    $('.change-form--remove').hide();
    $('h3.login-heading').html(g.lang.login.PCLOGINREMOVEACCOUNT);
    $('#PCLOGINLOGINBUTTON').html(g.lang.login.PCLOGINREMOVEACCOUNT);
    $('#password-eye-wrapper').hide();
  });

  // Toggle Password / Text field
  elmShowPassword.onclick = function (event) 
  {
    if (elmPass.getAttribute('type') === "text")
    {
      elmPass.setAttribute('type', 'password');
    }
    else 
    {
      elmPass.setAttribute('type', 'text');
    }
    event.preventDefault();
  };

  elmEmail.onkeydown = function (ev) 
  {
    if (ev.keyCode == 13)
    {    
      validemail(ev.target.value, ev.target);

      if($('.login-form--login')[0])
      {
        if($('#login-form__password').val() == "")
        {
          $('#login-form__password').focus();
        }
        else
        {
          loader(false);
          SystemLogin(ev);
        }
      }
      else if ( $('.login-form--register')[0] )
      {
        if ($('#login-form__password').val() == "")
        {
          $('#login-form__password').focus();
        }
        else if ($('#login-form__password-confirm').val() == "")
        {
          $('#login-form__password-confirm').focus();
        }
        else
        {
          loader(false);
          CreateAccountCheck(ev);
        }
      }
      else if ( $('.login-form--remove')[0] ) 
      {
        loader(false);
        DeleteAccount(ev);
      }      
    } 
  };

  elmPass.onkeydown = function (ev) 
  {
    if (ev.keyCode == 13) 
    {
      if ( $('.login-form--login')[0] ) 
      {
        SystemLogin(ev);
      }
      else if ( $('.login-form--register')[0] ) 
      {
        //CreateAccountCheck(ev);
        $('#login-form__password-confirm').focus();
      }
      else if ( $('.login-form--remove')[0] ) 
      {
        DeleteAccount(ev);
      }
    }
  };

  elmPassConfirm.onkeydown = function (ev) 
  {
    if (ev.keyCode == 13) 
    {
      if ( $('.login-form--login')[0] ) 
      {
        SystemLogin(ev);
      }
      else if ( $('.login-form--register')[0] ) 
      {
        CreateAccountCheck(ev);
      }
      else if ( $('.login-form--remove')[0] ) 
      {
        DeleteAccount(ev);
      }
    }
  };

  elmPass.onkeyup = function (event) 
  {
    passwordstrength(this.value, this);
  };

  elmTimeout.onkeydown = function (event) 
  {
    if (event.keyCode == 13) 
    {
      event.preventDefault();

      SystemLogin(event);
    }
  };

  $('.login-form__submit').click(function (ev) 
  {
    if ( $('.login-form--login')[0] ) 
    {
      SystemLogin(ev);
    }
    else if ( $('.login-form--register')[0] ) 
    {
      CreateAccountCheck(ev);
    }
    else if ( $('.login-form--remove')[0] ) 
    {
      DeleteAccount(ev);
    }
  });

  performAction(urlaction, urlemail);
}

pcrypt.flushvalues(); // When this windows is shown we are logged out

$(document).ready(function () 
{
  setupUI();
});

function CreateAccountCheck(e) 
{  
  if (loader())
  {
    return;
  }

  if(pcrypt.getvalue('options') !== null && pcrypt.getvalue('options').disableusercreate === true)
  {
    modalalert('You can not create users', g.lang.default.PCPROGRAMTITLE);
    return;
  }

  var email = pcrypt.utf8encode(document.getElementById('login-form__email').value);
  var pwd = pcrypt.utf8encode(document.getElementById("login-form__password").value);

  if ((email.length == 0) || (pwd.length == 0)) 
  {
    modalalert(g.lang.loginjs.PCLOGINMISSINGCREATEDATA, g.lang.default.PCPROGRAMTITLE);
    return;
  }


  if (pwd !== pcrypt.utf8encode($('#login-form__password-confirm').val())) 
  {
    modalalert(g.lang.default.PCPASSWORDSDONOTMATCH, g.lang.default.PCPROGRAMTITLE);
    return;
  }

  loader(true);

  switch (passwordstrength(pwd)) 
  {
    default: // Below required length
      modalalert(g.lang.default.PCPASSWORDSHORT, g.lang.default.PCPROGRAMTITLE);
      break;

    case 2: // Not so random
      if (pcrypt.passwordonlyallowgoodquality == false) 
      {
        modalconfirm(g.lang.default.PCWEAKPASSWORDSELECTED, g.lang.default.PCPROGRAMTITLE, function (result) {
          if (!result)
            return;

          CreateAccount(email, pwd);
        });
      }
      else
      {
        modalalert(g.lang.default.PCPASSWORDSHORT, g.lang.default.PCPROGRAMTITLE);
      }
      break;

    case 3:
      CreateAccount(email, pwd);
    break;
  }
}

function CreateAccount(email, pwd) 
{
  // get some random bytes salt synchronously (hex to make it more easy to store and export from DB)
  // Have to be at least the size of the output (before it is converted to hex)
  var salt = pcrypt_bytestohex(pcrypt_randombytes(64));

  var keys = pcrypt.generatekeys(pwd, salt);

  var srpclient = new SRP6JavascriptClientSessionSHA256();
  var srpsalt = srpclient.generateRandomSalt();
  var srpverifier = srpclient.generateVerifier(srpsalt, email.toLowerCase(), keys.srp);

  // NB: pcrypt.getvalue('languagecode', false) does not work here as sessionstorage is not set
  var langcode = localStorage['languagecode'] || navigator.language || navigator.userLanguage || 'en';

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

  if(g.options && g.options.ldapintegration)
  {
    // Actual call to create the user
    pcrypt_ldap_create(email, srpsalt, srpverifier, salt, keypublic, keyprivate, langcode, {ldapuser: email}, 0, function createuserfunc(data, error, id)
    {
      if (error)
      {
        switch (error)
        {
          case 6:
            modalalert(g.lang.accountjs.PCACCOUNTUSEREXIST, g.lang.default.PCPROGRAMTITLE);
            return;

          case 20:
            modalalert(g.lang.accountjs.PCACCOUNTNOTVALIDEMAIL, g.lang.default.PCPROGRAMTITLE);
            return;

          case 32:
          case 33:
            modalalert(g.lang.loginjs.PCLOGINLDAPAUTHFAIL, g.lang.default.PCPROGRAMTITLE);
            return;

          default:
            handlepcrypterror(error, data);
            return;
        }
      }

      //loader(false);

      switch (data) 
      {
        default:
          var html = '<h3>'+ g.lang.accountjs.PCACCOUNTNEWCREATED + '</h3><div class="line-height-1">' + g.lang.accountjs.PCACCOUNTCREATED + '</div>';

          modalalert(html, g.lang.default.PCPROGRAMTITLE, function modalalertreturn(value)
          {
            // Erase password
            var pwdelem = document.getElementById("login-form__password");
            var pwdelem2 = document.getElementById("login-form__password-confirm");

            pwdelem.value = "";
            pwdelem2.value = "";

            passwordstrength(pwdelem.value, pwdelem);
            passwordstrength(pwdelem2.value, pwdelem2);
          });
          break;

        case 3:
        case 4:
          modalalert(g.lang.accountjs.PCACCOUNTCREATEDTEAM, g.lang.default.PCPROGRAMTITLE, function modalalertreturn(value) 
          {
            SystemLogin(null);
          });
          break;
      }
    });
  }
  else
  {
    // Actual call to create the user
    pcrypt_create(email, srpsalt, srpverifier, salt, keypublic, keyprivate, langcode, 0, function createuserfunc(data, error, id)
    {
      if (error)
      switch (error)
      {
        case 6:
          modalalert(g.lang.accountjs.PCACCOUNTUSEREXIST, g.lang.default.PCPROGRAMTITLE);
          return;

        case 20:
          modalalert(g.lang.accountjs.PCACCOUNTNOTVALIDEMAIL, g.lang.default.PCPROGRAMTITLE);
          return;
        
        default:
          handlepcrypterror(error, data);
          return;
      }   

      if(pcrypt.existvalue('registersource'))
      {
        let registersource = pcrypt.getvalue('registersource', false, false);

        pcrypt_registersource(registersource.id, registersource.source, 1, 0, function(data, error, id)
        //pcrypt_registersource(pcrypt.getvalue('registersession', false, false), pcrypt.getvalue('registersource', false, false), 1, 0, function(data, error, id)
        {
          if(error)
          {
            console.log(data);
            return;
          }

          //pcrypt.deletevalue('registersource');
        });
      }
  
      switch (data) 
      {
        default:
          var html = '<h3>'+ g.lang.accountjs.PCACCOUNTNEWCREATED + '</h3><div class="line-height-1">' + g.lang.accountjs.PCACCOUNTCREATED + '</div>';
  
          modalalert(html, g.lang.default.PCPROGRAMTITLE, function modalalertreturn(value)
          {
            // Erase password
            var pwdelem = document.getElementById("login-form__password");
            var pwdelem2 = document.getElementById("login-form__password-confirm");
  
            pwdelem.value = "";
            pwdelem2.value = "";
  
            passwordstrength(pwdelem.value, pwdelem);
            passwordstrength(pwdelem2.value, pwdelem2);
          });
          break;
   
        case 3:
        case 4:
          modalalert(g.lang.accountjs.PCACCOUNTCREATEDTEAM, g.lang.default.PCPROGRAMTITLE, function modalalertreturn(value) 
          {
            SystemLogin(null);
          });
          break;
      }
    });
  }
}

function SystemLogin(e) 
{    
  if (loader())
    return;

  var email = pcrypt.utf8encode(document.getElementById('login-form__email').value);
  var pwd = pcrypt.utf8encode(document.getElementById("login-form__password").value);

  if (e) 
  {
    e.preventDefault();

    if (email.length && !e.ctrlKey) 
    {
      localStorage['pcryptusername'] = email;
    } 
    else 
    {
      localStorage.removeItem('pcryptusername');
    }
  }

  if ((email.length == 0) || (pwd.length == 0)) {
    modalalert(g.lang.loginjs.PCLOGINMISSINGDATA, g.lang.default.PCPROGRAMTITLE);
    return;
  }

  loader(true);

  if(g.options && g.options.ldapintegration)
  {
    pcrypt_ldap_login1(email, {ldapuser: email}, g.hexhash, 0, login1func);
  }
  else
  {
    pcrypt_login1(email, g.hexhash, 0, login1func);
  }
}

function login1func(data, error, id) {
  
  if (error)
  {
    switch (error)
    {
      case 7:
        modalalert(g.lang.loginjs.PCLOGINUNKNOWNUSER, g.lang.default.PCPROGRAMTITLE);
        return;

      case 9:
        modalalert(g.lang.loginjs.PCLOGINEMAILNOTVALIDATED, g.lang.default.PCPROGRAMTITLE);
        return;

      case 32:
      case 33:
        modalalert(g.lang.loginjs.PCLOGINLDAPAUTHFAIL, g.lang.default.PCPROGRAMTITLE);
        return;

      default:
        handlepcrypterror(error, data);
        return;
    }
  }

  
  var pwd = pcrypt.utf8encode(document.getElementById("login-form__password").value);
  
  if (pwd.length == 0) {
    modalalert(g.lang.loginjs.PCLOGINMISSINGDATA, g.lang.default.PCPROGRAMTITLE);
    return;
  }
  
  var keys = pcrypt.generatekeys(pwd, data.salt);

  pcrypt.flushvalues(); // delete all prior stored values (also delete language)

  g.srpclient = new SRP6JavascriptClientSessionSHA256();

  if (data.case) // TODO - this may be removed in the future (backward compatility)
  {
    g.srpclient.step1(data.email, keys.srp);
  } 
  else 
  {
    g.srpclient.step1(data.email.toLowerCase(), keys.srp);
  }

  if (!pcrypt.setlocalencryption(pcrypt_randombytes(32))) {
    throw new Error('Unknown local data storage error');
  }

  if (!pcrypt.setvalue('keycrypt', keys.aes)) {
    // Does not work on iOS in private mode
    alert('sessionStorage is not available - unable to continue');
  }

  var credentials = g.srpclient.step2(data.srpsalt, data.srpb);

  if (data.pincode == true) // detect if totp (two factor authorization) is enabled
  {
    modalprompt(g.lang.loginjs.PCLOGING2FACTORTEXT + '<br><br>', g.lang.loginjs.PCLOGING2FACTORTITLE, '', g.lang.loginjs.PCLOGINWRITEPINCODE, 64, null, function pincodecallback(pincode) {
      if (pincode != false) {
        pcrypt_login2(data.email, credentials.A, credentials.M1, pincode, false, 0, login2func);
      }
    });
  } 
  else 
  {
    pcrypt_login2(data.email, credentials.A, credentials.M1, null, g.hexhash, 0, login2func);
  }
}

function login2func(data, error, id)
{
  if (error) 
  {

    switch (error) 
    {
      case 15:
        modalalert(g.lang.loginjs.PCLOGINLONGTIMEUSED, g.lang.default.PCPROGRAMTITLE);
        return;

      case 16:
      case 22:
        modalalert(g.lang.loginjs.PCLOGINWRONGPASSWORD, g.lang.default.PCPROGRAMTITLE);
        return;

      default:
        handlepcrypterror(error, data);
        return;
    }
  }

  if (!g.srpclient.step3(data.srpM2)) 
  {
    modalalert("Server do not know the correct srp6a verifier (please contact developers and do not use the system)", g.lang.default.PCPROGRAMTITLE);
    return;
  }

  pcrypt.setvalue('session', g.srpclient.getSessionKey());
  pcrypt.setvalue('authsession', data.authsession);
  pcrypt.setvalue('authid', data.authid);
  pcrypt.setvalue('saltcrypt', data.salt);
  pcrypt.setvalue('srpsalt', data.srpsalt);
  pcrypt.setvalue('created', data.created);
  pcrypt.setvalue('email', data.email);
  pcrypt.setvalue('userid', data.userid);
  pcrypt.setvalue('username', data.name);
  pcrypt.setvalue('userdepartment', data.department);
  pcrypt.setvalue('useravatar', data.avatar);
  pcrypt.setvalue('useravatardefault', data.avatardefault);
  pcrypt.setvalue('options', data.options);
  pcrypt.setvalue('emailconfirm', data.emailconfirm);
  pcrypt.setvalue('premium', data.premium);
  pcrypt.setvalue('logins', data.logins);
  pcrypt.setvalue('trialpremium', data.trialpremium);
  //pcrypt.setvalue('publickey', pcrypt.decodeasymetrickeys(data.publickey)); // Is not encrypted
  //pcrypt.setvalue('encprivatekey', data.privatekey);

  delete g.srpclient; // Just to be on the safe side

  // decode private keys
  var privatekeyobj = pcrypt.decodeasymetrickeys(data.privatekey);
  privatekeyobj.ecdh.data = pcrypt.decryptstring(pcrypt.getvalue('keycrypt'), privatekeyobj.ecdh.data);
  privatekeyobj.ecdsa.data = pcrypt.decryptstring(pcrypt.getvalue('keycrypt'), privatekeyobj.ecdsa.data);
  pcrypt.setvalue('privatekey', privatekeyobj);

  var timeoutselect = document.getElementById('login-form__timeout');
  var timeout = timeoutselect.options[timeoutselect.selectedIndex].value;

  //var expdate = new Date();
  //expdate.setMonth(expdate.getMonth() + 3);

  //document.cookie = "pcryptauthsession=" + pcrypt.getvalue('authsession') + "; path=/" + "; expires=" + expdate.toUTCString(); // This is for forum phpBB
  //document.cookie = "pcryptemail=" + pcrypt.getvalue('email') + "; path=/" + "; expires=" + expdate.toUTCString(); // This is for forum phpBB

  localStorage.pcrypttimeout = timeout; // This is for the login screen

  if (timeout > 0)
  {
    pcrypt.setvalue('pcrypttimeout', timeout * 60000);
  }

  pcrypt.setvalue('pcrypttimeouturl', window.location.protocol + '//' + window.location.host + removefilefrompath(window.location.pathname) + '/index.html?page=logout');

  var defaulturl = window.location.protocol + '//' + window.location.host + removefilefrompath(window.location.pathname);

  // Try to see if extension use same credentials to activate yellow mode (only return valid result if installed)
  extsendmessage({
    sender: 'desktop',
    target: 'background',
    method: "login",
    email: pcrypt.getvalue('email')
  },
  function (response) 
  {
    if (response && response.result === true) // test if extension accept the credentials
    {
      // no action
    }
  });

  // TODO - See if security question has been set (or ask for it)


  // Test if the account is used for the first time (only one log entry)
  checkLoginAction(pcrypt.getvalue('session'), (data.logcount <= 5), function firstlogincallback(first) 
  {  	
    localStorage['firstlogin'] = first.toString();
    let url = defaulturl + '/index.html?page=passwords';
    
    if(g.options && g.options.logintopremium)
    //if(pcrypt.existvalue('logintopremium'))
    {
      url = defaulturl + '/index.html?page=account&toPrem=true';
      delete g.options.logintopremium;
      //pcrypt.deletevalue('logintopremium');
    }

    if (data.newshare || data.newmail)
    {
      var text = g.lang.loginjs.PCLOGINNEWSHARES.slice(0);
      text = text.replace("[newshare]", data.newshare);
      text = text.replace("[newmail]", data.newmail);
      

      modalalert(text, g.lang.default.PCPROGRAMTITLE, function () 
      {
        window.location.assign(url);
      });
    }
    else
    {
      window.location.assign(url);
    }

  });
}

function positionalertextension() 
{
  if (!$('#alert-extension').hasClass('active')) 
  {
    //$('#alert-extension').css('top', '-' + $('#alert-extension').height());
    $('#alert-extension').attr('class', 'active');
  }
}

function hidealertextension() 
{
  if ($('#alert-extension').hasClass('active')) 
  {
    $('#alert-extension').attr('class', '');
  }
}

function DeleteAccount(e) 
{
  if (e) 
  {
    e.preventDefault();

    loader(true);

    pcrypt_hashvalue(0, function hashvaluefunc(data, error, id) 
    {
      if (error) 
      {
        handlepcrypterror(error, data);
        return;
      }

      let email = pcrypt.utf8encode(document.getElementById('login-form__email').value);
      let hashnumber = generatehashcash(email, data.hashvalue);

      if (!hashnumber) 
      {
        throw new Error('Unable to calculate hashcash number');
      }

      // NB: pcrypt.getvalue('languagecode', false) does not work here as sessionstorage is not set
      var langcode = localStorage['languagecode'] || navigator.language || navigator.userLanguage || 'en';

      pcrypt_delete2(email, langcode, data.hashid, hashnumber, new Date().getTimezoneOffset(), 0, function deleteuserfunc(data, error, id) 
      {
        if (error) // Unknown user is not reported
        {
          handlepcrypterror(error, data);
          return;
        }

        loader(false);

        modalalert(g.lang.loginjs.PCACCOUNTCONFIRMDELETE2, g.lang.default.PCPROGRAMTITLE, function modalalertreturn(value)
        {

        });
      });
    });
  }
}
