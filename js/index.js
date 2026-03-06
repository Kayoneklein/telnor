var g = {}; // Global name space
g.lang = null;

$(document).ready(function ()
{
    /* Get Overlay for Tour */
    //$('body').append('<div class="tour-background"></div>');
    /* Tour Auto Initialize here */
/*     if ( $('.tour-background').length ) {
        pageScroll();
    }  */

  var currentpage = getUrlParameter('page');
  
  if(typeof pcrypt.getvalue() !== undefined)
  {
    var opts = pcrypt.getvalue('options');
  }
  else
  {
    var opts = false;
  }

  loader(true); // loader have to be cleared in the loaded JS file;

  if (opts && opts.isglobaladmin)
  {
    // showing administration menu icon if user is global admin
    var headerNavAdminElement = $('#header-nav__administration');
    headerNavAdminElement.show();
    setTimeout(function() {
      headerNavAdminElement.show();
    }, 50);
  }

  if(typeof currentpage !== 'string')
    currentpage = 'login';

  switch (currentpage) 
  {
    case 'information':

      if((opts !== undefined || opts !== false) && opts.disableinfopage === true) 
      {
        currentpage ='passwords';
        var htmlfile = './html/' + currentpage + '.html?v=PCRYPTVERSION';
        var jsfile = './js/' + currentpage + '.js?v=PCRYPTVERSION';
        break;
      }
      else if(opts != 'undefined' && opts.disableinfopage == true && opts.force2fa == true && pcrypt.getvalue('totpsecurity') === false) 
      {
        pcrypt_securitystatus(pcrypt.getvalue('session'), 0, function securitystatusfunc (data, error, id)
        {
          if (error)
          {
            switch (error)
            {
              case 14:
                pcrypt.flushvalues();

                modalalert(g.lang.default.PCUSERSESSIONINVALID, g.lang.default.PCPROGRAMTITLE, function callback ()
                {
                  testvalidlogin();
                });
                return;

              default:
                handlepcrypterror(error, data);
                return;
            }
          }
          pcrypt.setvalue('totpsecurity', data.totp);
        });
        redirect2fa();
        break;
      }
      else
      {
        var htmlfile = './html/' + currentpage + '.html?v=PCRYPTVERSION';
        var jsfile = './js/' + currentpage + '.js?v=PCRYPTVERSION';
        break;
      }
      
    
    case 'passwords':

      if((opts != undefined || opts !== false) && opts.force2fa == true && pcrypt.getvalue('totpsecurity') === false)
      {
        $('#sidebar-nav').hide(); // Hide these elements, if a user is able to click on their content, they can see the passwords table.
        $('#div_contentframe').hide();
        currentpage = 'account&to2fa=true';
        window.location.replace('./index.html?page='+currentpage);
        var htmlfile = './html/' + currentpage + '.html?v=PCRYPTVERSION';
        var jsfile = './js/' + currentpage + '.js?v=PCRYPTVERSION';
        break;
      }

      if((opts != undefined || opts !== false) && opts.disablepasswords == true)
      {
        currentpage = 'messages';
        $('#sidebar-nav').hide();
        $('#div_contentframe').hide();
        window.location.replace('./index.html?page=' + currentpage);
        var htmlfile = './html/' + currentpage + '.html?v=PCRYPTVERSION';
        var jsfile = './js/' + currentpage + '.js?v=PCRYPTVERSION';
        break;
      }
      else
      {
        var htmlfile = './html/' + currentpage + '.html?v=PCRYPTVERSION';
        var jsfile = './js/' + currentpage + '.js?v=PCRYPTVERSION';
        break;
      }
    
    case 'messages':

      if((opts != undefined || opts !== false) && opts.disableteams === true)
      {
        currentpage ='passwords';
        var htmlfile = './html/' + currentpage + '.html?v=PCRYPTVERSION';
        var jsfile = './js/' + currentpage + '.js?v=PCRYPTVERSION';
        break;
      }

      if((opts != undefined || opts !== false) && opts.disablemessages == true && opts.force2fa === false)
      {
        currentpage = 'account';
        window.location.replace('./index.html?page=account');
        var htmlfile = './html/' + currentpage + '.html?v=PCRYPTVERSION';
        var jsfile = './js/' + currentpage + '.js?v=PCRYPTVERSION';
        break;
      }
      else if( (opts != undefined || opts !== false) && opts.force2fa === true && pcrypt.getvalue('totpsecurity') === false)
      {
        currentpage = 'account';
        window.location.replace('./index.html?page=account&to2fa=true');
        var htmlfile = './html/' + currentpage + '.html?v=PCRYPTVERSION';
        var jsfile = './js/' + currentpage + '.js?v=PCRYPTVERSION';
        break;
      }
      else
      {
        var htmlfile = './html/' + currentpage + '.html?v=PCRYPTVERSION';
        var jsfile = './js/' + currentpage + '.js?v=PCRYPTVERSION';
      }

    case 'team':
      if((opts != undefined || opts !== false) && opts.disableteams === true)
      {
        currentpage ='passwords';
        var htmlfile = './html/' + currentpage + '.html?v=PCRYPTVERSION';
        var jsfile = './js/' + currentpage + '.js?v=PCRYPTVERSION';
        break;
      }

    case 'account':
      var twoFaUrlParam = JSON.parse(getUrlParameter('to2fa'));
      $('.top-menu').hide(); // Hide elements so users won't see them when the redirect happens.
      $('.user-info').hide();
      
      // If a user attemps to enter the account page, with force2fa enabled and no 2fa setup for their account, redirect to 2fa. Else just allow them to access the account page.
      if(opts.force2fa === true && twoFaUrlParam === false && pcrypt.getvalue('totpsecurity') === false)
      {
        $('.top-menu').hide();
        window.location.replace('./index.html?page=account&to2fa=true');
        var htmlfile = './html/' + currentpage + '.html?v=PCRYPTVERSION';
        var jsfile = './js/' + currentpage + '.js?v=PCRYPTVERSION';
        break;
      }

    default:
      $('.top-menu').show();
      $('.user-info').show();
      var htmlfile = './html/' + currentpage + '.html?v=PCRYPTVERSION';
      var jsfile = './js/' + currentpage + '.js?v=PCRYPTVERSION';
      break;
  }

  document.getElementsByTagName('body')[0].className = currentpage;

  // Change title, and capitlize first letter of currentpage
  document.title = document.title + ' :: ' + currentpage.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});

  // Add class-name to content div element
  document.getElementById('content').className = currentpage;

  loadHtmlPage(htmlfile, function htmlfilecallback(content)
  {
    document.getElementById('content').innerHTML = content;

    getlanguage(getUrlParameter('language'), function getlanguagefunc(language, langcode, availlang, update)
    {
      if(!language)
      {
        alert('Unable to load language text.');
        return;
      }

      if(update)
      {
        if(validlogin())
          pcrypt_setemaillanguage(pcrypt.getvalue('session'), langcode, 0, function(data, error, id){});
      }

      g.lang = language;
      setdomlanguage(g.lang, currentpage, false);

      // If user is premium OR if the createddate + 30 is above the current date, the user has free premium.
      if($("#header_premium_bar"))
      {
        if(opts && opts.globalpremium === true)
        {
          document.querySelector('#header_premium_bar').classList.add('hidden');
        }
        else
        {
          if(pcrypt.getvalue('premium')>0)
          {
            var createdDate = new Date();

            createdDate.setFullYear(pcrypt.getvalue('created').substr(0,4), pcrypt.getvalue('created').substr(5,2)-1, pcrypt.getvalue('created').substr(8, 2));
            if(pcrypt.getvalue('created') && (Date.parse(createdDate)+2592000000<Date.parse(Date())))
            {
              $("#header_premium_bar")[0].childNodes[1].children[2].innerHTML = g.lang.topmenu.PCTOPMENUPREMIUMTRUE;
            }
            else
            {
              $('#header_premium_bar')[0].childNodes[1].children[2].innerHTML = g.lang.topmenu.PCTOPMENUPREMIUMTRIAL;
            }
          }
          else
          {
            $("#header_premium_bar").addClass('noPremAnim');
            $("#header_premium_bar")[0].childNodes[1].children[2].innerHTML = g.lang.topmenu.PCTOPMENUPREMIUMFALSE;
          }
        }
      }

      // Check if Live Chat should come up
      if (currentpage != "login")
      {
        if(opts && opts.enablelivechat !== false)
        {
          $('#live-chat').append('<div id="button" data-testid="widgetButton" class="chat-closed mobile-size__large"><div class="buttonWave"></div><a href="' + opts.enablelivechat + '" rel="noreferrer noopener" id="button-body" data-testid="widgetButtonBody" class="buttonlink chrome" target="_blank" aria-label="Open chat widget" style="color: rgb(0, 125, 252); background: linear-gradient(135deg, rgb(0, 182, 191), rgb(155, 230, 141)); box-shadow: rgba(2, 6, 16, 0.2) 0px 4px 24px;"><i class="material-icons type1 for-closed active" style="color: rgb(255, 255, 255);"><svg id="ic_bubble" fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path><path d="M0 0h24v24H0z" fill="none"></path></svg></i><i class="material-icons type2 for-closed active"><svg id="ic_create" fill="blue" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path><path d="M0 0h24v24H0z" fill="none"></path></svg></i><i class="material-icons type1 for-opened " style="color: rgb(255, 255, 255);"><svg id="ic_send" fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path><path d="M0 0h24v24H0z" fill="none"></path></svg></i><i class="material-icons type2 for-opened "><svg id="ic_send" fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path><path d="M0 0h24v24H0z" fill="none"></path></svg></i></a></div>');
          $('#live-chat').addClass('active');
        }
      }

      loadjscssfile(jsfile, 'js', function(e)
      {
        var forumicon = document.getElementById('icon_forum');
        var authsession = pcrypt.getvalue('authsession');
        var email = pcrypt.getvalue('email'); // TODO - we need to urlencode email

        if(forumicon && email && authsession) // for some pages it is not shown (need to be logged in)
        {
          var url = 'https://pcrypt.dk/phpBB/forum.php?email=' + email + '&auth=' + authsession;

          forumicon.onclick = function (event)
          {
            event.preventDefault();
            window.open(url, 'pcryptforum', ''); // does not create a handle on mobile devices as they open in external browser
          };
        }

        // Set share marks again
        var unreadmails = pcrypt.getvalue('unreadmails');
        var unreadshares = pcrypt.getvalue('unreadshares');

        if(unreadmails > 0)
        {
          $('#check-mail-counter').html(unreadmails);
          $('#check-mail-counter').css('display', 'block');
        }
        else
        {
          $('#check-mail-counter').css('display', 'none');
        }

        if(unreadshares > 0)
        {
          $('#check-password-counter').html(unreadshares);
          $('#check-password-counter').css('display', 'block');
        }
        else
        {
          $('#check-password-counter').css('display', 'none');
        }
      });
    });
  });
  
  // Currently removes the forum button. 
  if(opts && opts.disableinfopage == true)
  {
    if(document.getElementById('header-nav__forum'))
    {
      document.getElementById('header-nav__forum').remove();
    }
  }

  if(opts && opts.disablepasswords == true)
  {
    if(document.getElementById('header_passwords_bar'))
    {
      document.getElementById('header_passwords_bar').remove();
    }
  }
  else
  {
    if(document.getElementById('header_passwords_bar'))
    {
      document.getElementById('header_passwords_bar').removeAttribute('style');
    }
  }
});
