"use strict";

g.pass = []; // My passwords
g.groups = []; // Groups or index for passwords
g.shares = []; // Shares that I have from other users
g.objshares = {}; // Shares that I have from other users (another representation)
g.teammembers = []; // All members of teams I belong to
g.teamobject = null; // Other way to present g.teammembers as object
g.gidshown = null;
g.filter = {}; // To contain active filters
g.passrecordcount = null;
g.passtotalrecordcount = null;
g.sharediv = null;
g.importdiv = null;
g.importformatsave = null;
g.memberrecordcount = null;
g.icons = {};
g.globalMessages = {}; // Global messages the user can see (Only admins should see non-public messages)
g.importformats = {
  pcrypt2016:
  {
    name: g.lang.import.PCIMPORTSUBMITPCRYPT2016,
    titleline: true,
    newlinechar: false,
    type: 'csv',
    fields:
    [
      { text: g.lang.importjs.PCIMPORTFIELDNAME, value: 'name' },
      { text: g.lang.importjs.PCIMPORTFIELDUSERNAME, value: 'user' },
      { text: g.lang.importjs.PCIMPORTFIELDPASSWORD, value: 'pass' },
      { text: g.lang.importjs.PCIMPORTFIELDURL, value: 'url' },
      { text: g.lang.importjs.PCIMPORTFIELDNOTE, value: 'note' },
      { text: g.lang.importjs.PCIMPORTFIELDPOS, value: 'pos' }
    ]
  },
  lastpass:
  {
    name: g.lang.import.PCIMPORTSUBMITLASTPASS,
    titleline: true,
    newlinechar: false,
    type: 'csv',
    fields: [
      { text: g.lang.importjs.PCIMPORTFIELDURL, value: 'url' },
      { text: g.lang.importjs.PCIMPORTFIELDUSERNAME, value: 'user' },
      { text: g.lang.importjs.PCIMPORTFIELDPASSWORD, value: 'pass' },
      { text: g.lang.importjs.PCIMPORTFIELDNOTE, value: 'note' },
      { text: g.lang.importjs.PCIMPORTFIELDNAME, value: 'name' },
        //{text: g.lang.importjs.PCIMPORTFIELDPOS, value: 'pos'}
    ]
  },
  dashlane:
  {
    name: g.lang.import.PCIMPORTSUBMITDASHLANE,
    titleline: true,
    newlinechar: false,
    type: 'csv',
    fields:
    [
      {text: g.lang.importjs.PCIMPORTFIELDNAME, value: 'name'},
      {text: g.lang.importjs.PCIMPORTFIELDURL, value: 'url'},
      {text: g.lang.importjs.PCIMPORTFIELDIGNORE, value: 'empty'},
      {text: g.lang.importjs.PCIMPORTFIELDUSERNAME, value: 'user'},
      {text: g.lang.importjs.PCIMPORTFIELDIGNORE, value: 'empty'},
      {text: g.lang.importjs.PCIMPORTFIELDPASSWORD, value: 'pass'},

      //{text: g.lang.importjs.PCIMPORTFIELDPOS, value: 'pos'}
    ]
  },
  keepersecurity:
  {
    name: g.lang.import.PCIMPORTSUBMITKEEPERSECURITY,
    titleline: false,
    newlinechar: false,
    type: 'csv',
    fields:
    [
     {text: g.lang.importjs.PCIMPORTFIELDIGNORE, value: 'empty'},
      {text: g.lang.importjs.PCIMPORTFIELDNAME, value: 'name'},
      {text: g.lang.importjs.PCIMPORTFIELDUSERNAME, value: 'user'},
      {text: g.lang.importjs.PCIMPORTFIELDPASSWORD, value: 'pass'},
      {text: g.lang.importjs.PCIMPORTFIELDURL, value: 'url'},
      {text: g.lang.importjs.PCIMPORTFIELDIGNORE, value: 'empty'},
      {text: g.lang.importjs.PCIMPORTFIELDIGNORE, value: 'empty'},

      //{text: g.lang.importjs.PCIMPORTFIELDPOS, value: 'pos'}
    ]
  }
};

g.fillgroupoptions = {
  all: g.lang.passwordsjs.PCPASSWORDSGROUPALL,
  filter: "filter", // TODO add lang
  pos: g.lang.passwordsjs.PCPASSWORDSGROUPLOCATION,
  undef: g.lang.passwordsjs.PCPASSWORDSGROUPUNDEFINED,
  own: g.lang.passwordsjs.PCPASSWORDSGROUPOWN,
  outshare: g.lang.passwordsjs.PCPASSWORDSGROUPSHAREDOUT,
  inshare: g.lang.passwordsjs.PCPASSWORDSGROUPSHAREDIN,
  newshare: g.lang.passwordsjs.PCPASSWORDSGROUPNEWSHARES,
  security: g.lang.passwordsjs.PCPASSWORDSGROUPINSECURE,
  alarm: g.lang.passwordsjs.PCPASSWORDSGROUPALARM,
  pass: null, // Initialised later
  groups: null, // Initialised later
  shares: null // Initialised later
};

/**
 * Asynchronus on session error
 * If an error occurs the system generates a modalalert for the user to let them know something went wrong.
 * @param {*} data
 * @param {*} error
 * @param {*} id
 */
var asyncpass_onerror = function(data, error, id) 
{
  switch (error)
  {
    case 14:
      pcrypt.flushvalues();
      redirectinvalidlogin();
      return;

    default:
      handlepcrypterror(error, data);
      return;
  }
};

/**
 * Asynchronus on success
 *
 * @param {*} varobj
 */
var asyncpass_onsuccess = function(varobj)
{
  // teaminfo not needed here directly (used in fillteamselect)
  let unreadshares = pcrypt.getvalue('unreadshares');
  let oldshareids = pcrypt.getvalue('lastshareslocal');
  let passwordsinit = false;
  g.gidshown = gpcrypt.sgid.all;

  if(pcrypt.getvalue('options').disableteams === true)
  {
    g.teammembers = null; // members to null
  }
  else
  {
    g.teammembers = varobj['members'];
  }
  
  g.shares = varobj.shares;
  g.pass = varobj.pass;
  g.groups = varobj.groups;

  if(!oldshareids) 
  {
    oldshareids = varobj.lastshares;
    pcrypt.setvalue('lastshareslocal', oldshareids);
    passwordsinit = true; // Indication that this is the first time it is running in this session as no local variables
  }

  if((typeof(oldshareids) != 'object') || (oldshareids == null)) // Test if we have something valid
  {
    oldshareids = {};
  }

  g.teamobject = convertteammembers(g.teammembers);
  g.teammembers = cleanmembers(g.teammembers, g.teamobject);
  decryptShareData(g.shares, g.teamobject, pcrypt.getvalue('privatekey'), pcrypt.getvalue('email'));
  filterShareData(g.shares); // Have to be before we test for changes (markNewShares)

  let newshareids = markNewShares(g.shares, oldshareids);

  if(passwordsinit || unreadshares)
  {
    pcrypt.setdata(pcrypt.getvalue('session'), pcrypt.getvalue('keycrypt'), 'lastshares', newshareids, false, 0, function(){}); // save last objshares at server to detect changes later
    //pcrypt.setvalue('lastshareslocal', newshareids);
    pcrypt.setvalue('unreadshares', 0);
  }

  if(!g.pass || (g.pass.length == 0))
  {
    g.pass = [];
  }

  if(!g.groups || (g.groups.length == 0))
  {
    g.groups = [];
  }

  validatedataarray(g.pass, validatepass);
  validatedataarray(g.groups, validategroup);

  g.fillgroupoptions.pass = g.pass;
  g.fillgroupoptions.groups = g.groups;
  g.fillgroupoptions.shares =  g.shares;

  fillgroupselect(document.getElementById('groupselect'), g.gidshown, g.fillgroupoptions);

  generateTagCheckboxes();

  $('#check-password-counter').css('display', 'none'); // Remove counter as we read in above

  //if(true !== pcrypt.getvalue('passwordsinit'))
  if(passwordsinit) // First run in this session?
  {
    //pcrypt.setvalue('passwordsinit', true);

    let dbarray = addSharesToPass(g.pass, g.shares, g.teamobject, Number(gpcrypt.sgid.shares));

    getfavicons(dbarray);

    if(findNewAlarms(dbarray)) // check for alarms  
    {
      modalconfirm(g.lang.passwordsjs.PCPASSWORDSSHOWALARMSTEXT, g.lang.default.PCPROGRAMTITLE, function(r) 
      {
        if(r)
        {
          g.gidshown = gpcrypt.sgid.alarm;
          showgroup(g.gidshown);
        }
      });
    }
  }

  showgroup(g.gidshown);

};

if (redirectinvalidlogin() && !pcrypt.getvalue('options').disablepasswords)
{
  pcrypt_securitystatus(pcrypt.getvalue('session'), 0, function securitystatusfunc(data, error, id) 
  {
    if (error) {
      switch (error) {
        case 14:
          pcrypt.flushvalues();
          redirectinvalidlogin();
          return;

        default:
          handlepcrypterror(error, data);
          return;
      }
    }
    pcrypt.setvalue('totpsecurity', data.totp);
    pcrypt.setvalue('notificationsecurity', data.notification);
    pcrypt.setvalue('sessionsecurity', data.iplock);
    redirect2fa();
  });
  
  var opts = pcrypt.getvalue('options');
  if (opts && opts.force2fa && pcrypt.getvalue('totpsecurity') === false)
  {
    $('#sidebar-nav').hide(); // Hide these elements, if a user is able to click on their content, they can see the passwords table.
    $('#div_contentframe').hide();
    var currentpage = 'account&to2fa=true';
    window.location.replace('./index.html?page=' + currentpage);
    var htmlfile = './html/' + currentpage + '.html?v=PCRYPTVERSION';
    var jsfile = './js/' + currentpage + '.js?v=PCRYPTVERSION';
  }

  if (opts && opts.disablepasswords && !opts.disablemessages)
  {
    $('#sidebar-nav').hide();
    $('#div_contentframe').hide();
    var currentpage = 'messages';
    window.location.replace('./index.html?page=' + currentpage);
    var htmlfile = './html/' + currentpage + '.html?v=PCRYPTVERSION';
    var jsfile = './js/' + currentpage + '.js?v=PCRYPTVERSION';
  }
  else if(opts && opts.disablepasswords && opts.disablemessages)
  {
    $('#sidebar-nav').hide();
    $('#div_contentframe').hide();
    var currentpage = 'account';
    window.location.replace('./index.html?page=' + currentpage);
    var htmlfile = './html/' + currentpage + '.html?v=PCRYPTVERSION';
    var jsfile = './js/' + currentpage + '.js?v=PCRYPTVERSION';
  }

  $(document).ready(function() 
  {
    $('.container-hidden').show();

    var session = pcrypt.getvalue('session');
    var keycrypt = pcrypt.getvalue('keycrypt');
    var unreadshares = pcrypt.getvalue('unreadshares'); // Have already been read in pcrypt_desktop
    var teamchanges = pcrypt.getvalue('teamchanges');
    g.gidshown = pcrypt.getvalue('gidshown');
    var passasync;
    var syncs = 5; // number of sync calls

    if (typeof g.gidshown != 'number')
    {
      g.gidshown = gpcrypt.sgid.all;
    }

    // This is to make some logic in the onsuccess handler
    //pcrypt.setvalue('unreadshares', unreadshares);
    if (pcrypt.getvalue('options').disableteams === true) // This way we can further restrict the calls in the future using methods like this
    {
        syncs = syncs - 2;
    }

    passasync = new pcrypt_async(syncs);

    passasync.onsuccess = asyncpass_onsuccess;
    passasync.onerror = asyncpass_onerror;

    if (pcrypt.getvalue('options').disableteams === false) // If true these should not be callable.
    {
        //pcrypt.getteaminfo(session, teamchanges || unreadshares, 'pcryptteaminfo', 'teaminfo', passasync.callback);
        pcrypt.getteammembers(session, teamchanges || unreadshares, 'pcryptteammembers', 'members', passasync.callback);
        pcrypt.getteamshares(session, unreadshares, 'pcryptteamshares', 'shares', passasync.callback);
    }

    pcrypt.getdata(session, false, keycrypt, 'passwords', 'pass', passasync.callback);
    pcrypt.getdata(session, false, keycrypt, 'groups', 'groups', passasync.callback);
    pcrypt.getdata(session, false, keycrypt, 'lastshares', 'lastshares', passasync.callback);

    //pcrypt.setvalue('unreadshares', 0); // Is now handled in the onsuccess handler
    pcrypt.setvalue('teamchanges', 0);

    $('.new-row').each(function() {
        $(this).parents('tr').addClass('new-row-tr');
    });

    // Do not close the filter menus when a user clicks on the input filter
    $('#filter_search').on('click', function(event) {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();
    });

    $('#buttonfilter').click((event) => {
      event.preventDefault();
      event.target.classList.contains('on') ? event.target.classList.remove('on') : event.target.classList.add('on');

      if($('#dialog-filterpassmenu').hasClass('hidden'))
      {
        let filtermenuElem = $('#dialog-filterpassmenu');
        let buttonFilterElem = document.getElementById('buttonfilter');
        let coords = buttonFilterElem.getBoundingClientRect();
        filtermenuElem.css('top', coords.y);
        filtermenuElem.css('left', coords.x + coords.width);
        filterMenuUpdateCounters();
        $('#dialog-filterpassmenu').removeClass('hidden');
      }
      else
      {
        $('#dialog-filterpassmenu').addClass('hidden');
        togglefilterpass();
      }
    });

    function filtersearch()
    {
      let filterSearch = document.getElementById('filter_search');
      let searchText = filterSearch.value.toLowerCase();
      let filterList = document.getElementById('filter_list-container');
      let filterListChildren = filterList.children;
      for(let i = 0, i_len = filterListChildren.length; i < i_len; i++)
      {
        let filterChild = filterListChildren[i];
        if(filterChild.innerText.toLowerCase().indexOf(searchText) < 0)
        {
          filterChild.classList.add('hidden');
        }
        else
        {
          filterChild.classList.remove('hidden');
        }
      }
    }

    addClearSearchIcon('filter_search', filtersearch);

    document.getElementById('filter_search').onkeyup = function(event) 
    {
      event.preventDefault();
      filtersearch();
    };
    
    $('#dialog-filterpassmenu').mouseover((event) => {
      event.preventDefault();
      let filtermenuElem = $('#dialog-filterpassmenu');
      filtermenuElem.removeClass('hidden');
    });

    $('#filtermenu-all').click((event) => {
      event.preventDefault();
      clearfilter();
      document.getElementById('searchtext').parentElement.querySelector('div:nth-child(2)').click();
      document.getElementById('searchtext').blur();
      removeHighlightOnMenuItems();
    });

    $('#filtermenu-pos').click((event) => 
    {
      event.preventDefault();
      togglefilterpass('pos');
      if(!event.ctrlKey)
      {
        document.getElementById('dialog-filterpassmenu').classList.add('hidden');
      }
    });

    $('#filtermenu-tags').click((event) => 
    {
      event.preventDefault();
      togglefilterpass('tags');
    });

    $('#filtermenu-teamshares').click((event) => {
      event.preventDefault();
      togglefilterpass('teamshares');
    });

    $('#filtermenu-usershares').click((event) => {
      event.preventDefault();
      togglefilterpass('usershares');
    });

    $('#filtermenu-other').click((event) => {
      event.preventDefault();
      togglefilterpass('other');
    });

    $('#buttontoggleselectmenu').click((event) => {
      event.preventDefault();
      let target = event.target;
      
      if(target.classList && target.classList.contains('deactivated')  === true)
      {
        document.getElementById("pass-selected-menu").classList.add('hidden');
        return;
      }

      let filtermenuElem = $('#pass-selected-menu');
      let buttonFilterElem = document.getElementById('buttontoggleselectmenu');
      let coords = buttonFilterElem.getBoundingClientRect();
      filtermenuElem.css('top', coords.y);
      filtermenuElem.css('left', coords.x + coords.width);
      document.getElementById("pass-selected-menu").classList.toggle('hidden');
    });

    $('#buttonaddnew').click(function(event) 
    {
      event.preventDefault();

      // This is made for general testing of new functionallity
      if((event.ctrlKey || event.metaKey) && pcrypt.debug)
      {
        //pcrypt.setvalue('teamsharing', true);
        //return;
      }

      showgroup(g.gidshown);
      highlightMenuItem('buttonaddnew');
      $("#menu-passwords-import").slideUp();
      showpassfunc(null, false, true);
    });

    $('#buttontools').click((e) => {
      let toolsMenu = $("#tools-menu");
      let buttonTools = document.getElementById('buttontools') ;
      let coords = buttonTools.getBoundingClientRect();
      toolsMenu.css('top', coords.y);
      toolsMenu.css('left', coords.x + coords.width);
      toolsMenu.toggleClass('hidden');
    });

    $("#buttonsecuritytools").click((e) => {
      let securityMenu = $("#security-menu");
      let buttonSecurity = document.getElementById('buttonsecuritytools');
      let coords = buttonSecurity.getBoundingClientRect();
      securityMenu.css('top', coords.y);
      securityMenu.css('left', coords.x + coords.width);
      securityMenu.toggleClass('hidden');
    })

    $('#buttonimport').click(function(e) {
      e.preventDefault();
      highlightMenuItem('buttonimport');

      loadDialog(g.importdiv, "import", true, false, function importcallback(importdiv)
      {
        if (importdiv !== false)
          g.importdiv = importdiv;

        if (!pcimport) {
          console.log("Import JS file not ready!");
          return;
        }

        pcimport.show(g.importdiv, '90%', g.lang.passwords.PCPASSWORDSUSERMENUIMPORT, false, false, function()
        {
            pcimport.init(g.importformats, function functest(settings, importtext)
            {
              return pcryptimport(false, settings, importtext);
            },
            function funcimport(settings, importtext)
            {
              return pcryptimport(true, settings, importtext);
            });
        },
        function(result)
        {
          if (result)
          {
            g.importformatsave = pcimport.getimportvalues();
          } else {
            if (g.importformatsave)
              pcimport.setimportvalues(g.importformatsave);
          }
        });
      });
    });

    document.getElementById('buttongroup').onclick = function (event)
    {
      event.preventDefault();
      highlightMenuItem('buttongroup');
      //showgroup(g.gidshown);
      groupcheck();
    };

      document.getElementById('buttonshare').onclick = function(event)
      {
        if (parseInt(pcrypt.getvalue('emailconfirm')) === 0)
        {
          popupCall('unverified');
          document.getElementById('PCPOPUPBUTTONCHANGE').innerHTML = g.lang.popup.PCPOPUPBUTTONCHANGE;
          document.getElementById('resendEmailBtn').innerHTML = g.lang.popup.PCPOPUPBUTTONRESEND;
          return;
        }
        event.preventDefault();
        highlightMenuItem('buttonshare');
        $("#menu-passwords-import").slideUp();
        //showgroup(g.gidshown);
        sharecheck();
      };

      document.getElementById('buttondelete').onclick = function(event)
      {
        highlightMenuItem('buttondelete');
        //showgroup(g.gidshown);
        event.preventDefault();
        delcheck();
      };

      document.getElementById('buttonunshare').onclick = function(event)
      {
        event.preventDefault();
        highlightMenuItem('buttonunshare');
        unshareCheck();
      };

      document.getElementById('buttonsecurity').onclick = event =>
      {
        event.preventDefault();
        if(!event.ctrlKey)
        {
          document.getElementById('security-menu').classList.add('hidden');
        }
        securityPassGridCheck();
      }

      document.getElementById('buttonexport').onclick = function(event) 
      {
        event.preventDefault();
        highlightMenuItem('buttonexport');
        //showgroup(g.gidshown);
        exportcheck();
      };

      document.getElementById('buttonpwn').onclick = function(event) 
      {
        event.preventDefault();
        highlightMenuItem('buttonpwn');
        if(!event.ctrlKey)
        {
          document.getElementById('security-menu').classList.add('hidden');
        }
        pwncheck();
      };

      addClearSearchIcon('searchtext', searchtable);
      document.getElementById('searchtext').onkeyup = function(event) 
      {
        event.preventDefault();
        searchtable();
      };

      // Edit dialog below
      document.getElementById('passfield').oninput = function(event) 
      {
        var passStrength = passwordstrength(this.value, this);
        editPassSecurityCheck()
      };

      document.getElementById('buttongeneratepass').onclick = function(event) 
      {
        generatepassword();
        passwordstrength(document.getElementById('passfield').value, document.getElementById('passfield'));
        editPassSecurityCheck();
      };

      document.getElementById('atozupper').onchange = function(event)
      {
        generatepassword();
        passwordstrength(document.getElementById('passfield').value, document.getElementById('passfield'));
        editPassSecurityCheck();
      };

      document.getElementById('atozlower').onchange = function(event)
      {
        generatepassword();
        passwordstrength(document.getElementById('passfield').value, document.getElementById('passfield'));
        editPassSecurityCheck();
      };

      document.getElementById('numbers').onchange = function(event)
      {
        generatepassword();
        passwordstrength(document.getElementById('passfield').value, document.getElementById('passfield'));
        editPassSecurityCheck();
      };

      document.getElementById('specialchars').onchange = function(event)
      {
        generatepassword();
        passwordstrength(document.getElementById('passfield').value, document.getElementById('passfield'));
        editPassSecurityCheck();
      };

      document.getElementById('editpass-search-tag').oninput = function(event)
      {
        editpasssearchtags(this.value);
      };
      
      addClearSearchIcon('editpass-search-tag', editpasssearchtags);

      document.getElementById('buttondecodeaddress').onclick = function(event) 
      {

        var fieldElement = document.getElementById('locselect');
        var maxpos = premRes.posMaxFree;
        var isPremium = pcrypt.getvalue('premium');

        if(isPremium)
        {
          maxpos = premRes.posMax
        }
        
        if(fieldElement.children.length >= maxpos)
        {
          modalalert(g.lang.passwordeditjs.PCPESELECTMAXIMUMENTRIES + ' ' + maxpos, g.lang.default.PCPROGRAMTITLE);
          return;
        }

        geocodeaddressdialog(function callback(location) 
        {
          if (location)
            addselectlocation('locselect', location);
        });
      };
      
      document.getElementById('buttonaddcurrentlocation').onclick = function(event) 
      {
        addcurrentlocation('locselect');
      };
  
      // Edit location
      document.getElementById('buttoneditlocation').onclick = function(event) {
        editselectlocation('locselect');
      };

      // Delete location
      document.getElementById('buttondeletelocation').onclick = function(event) {
        deleteselectlocation('locselect');
      };

      // Show locations on map
      document.getElementById('buttonshowlocation').onclick = function(event) 
      {
        getcurrentlocation(function callback(locinfo) 
        {
          if (locinfo) {
            showselectlocations('locselect', locinfo, 'pcryptmapwindow');
          }
        });
      };

      // File handling
      document.getElementById('inputfileupload').onchange = function(event)
      {
          /**
           * Check if password in question has shares
           */
          var hasShare = false;
          var atPass = g.pass[premRes.passFocused];

          if (atPass !== undefined)
          {
            Object.keys(atPass.shares).forEach(function(key)
            {
              if (atPass.shares[key].length > 0)
              {
                return hasShare = true;
              }
            });
          }

          // Check for premium status, if free user allow only if they have only one file on their password.
          // Passwords with shares should not be able to attach files.
          if (pcrypt.getvalue('premium') > 0 || (pcrypt.getvalue('premium') < 1 && event.target.files.length < 2) && hasShare === false)
          {
            var files = event.target.files; // FileList object

              for (var i = 0, f; f = files[i]; i++) { /* If user is premium and the file size is below or at the allowed value */

                if (f.size > premRes.filesizemax && pcrypt.getvalue('premium') > 0) 
                {
                  var filesize = Math.floor(premRes.filesizemax / 1024) + " KB";

                  modalalert('<div class="popup">' + g.lang.importjs.PCIMPORTTOOBIG +
                      ' ' + filesize + '</div>', g.lang.default.PCPROGRAMTITLE);
                  continue;
                } /* If user is free and the file size is below or at the allowed value */
                else if (f.size > premRes.filesizemaxFree && pcrypt.getvalue('premium') < 1) 
                {
                  var filesize = (premRes.filesizemaxFree / 1024) + "KB";

                  modalalert('<div class="popup">' + g.lang.importjs.PCIMPORTTOOBIG +
                      ' ' + filesize + g.lang.passwords.PCFILESIZEFREE + '<div>', g.lang.default.PCPROGRAMTITLE);
                  continue;
                }

                  var reader = new FileReader();

                  // Closure to capture the file information.
                  reader.onload = (function(theFile) 
                  {
                    var fileName = theFile.name;
                    var fileType = theFile.type;

                    return function(e) 
                    {
                      selectuploadfile('fileselect', fileName, fileType, e.target.result);
                    };
                  })(f);

                  // Read in the binary file as ArrayBuffer data.
                  reader.readAsArrayBuffer(f);

                  this.value = ""; // Reset the element
              }
          } 
          else
          {
              modalalert('<div class="popup">' + g.lang.passwords.PCFILESHAREDPASSPREMIUMONLY + '</div>', g.lang.default.PCPROGRAMTITLE);
          }
          event.target.value = null;
      };

      document.getElementById('buttonfiledownload').onclick = function(event) 
      {
        selectdownloadfile('fileselect');
      };

      document.getElementById('buttonfileshow').onclick = function(event) 
      {
        selectshowfile('fileselect', 'pcryptshowwindow');
      };

      document.getElementById('buttonfiledelete').onclick = function(event) 
      {
        selectdeletefile('fileselect');
      };

      // Checkboxes activate left menu
      function checkPasswordCheckboxChecked() 
      {
        var passwordCheckboxChecked = false;
        $('#passwordgrid input[type="checkbox"]').each(function() 
        {
          if ($(this).is(':checked')) 
          {
            passwordCheckboxChecked = true;
          }
        });

        if (passwordCheckboxChecked) 
        {
          $('ul.navigation .canchange').removeClass('deactivated');
        } else {
          $('ul.navigation .canchange').addClass('deactivated');
        }
      }

      $('#div_contentframe').on('click', 'input[type="checkbox"]', function() 
      {
        checkPasswordCheckboxChecked();
      });

      // Group dialog below
      document.getElementById('buttongroups-edit').onclick = function(event) 
      {
        showgroup(g.gidshown);
        $("#menu-passwords-import").slideUp();
        highlightMenuItem('buttongroups-edit');
        updategroups(event);
      };

      document.getElementById('buttonaddgroup').onclick = function(event) 
      {
        if (pcrypt.getvalue('premium') > 0) 
        {
          addgroup('group-edit', false);
        }
        else if (pcrypt.getvalue('premium') < 1 && (document.getElementById('group-edit').rows.length-1 < premRes.tagsMaxFree)) 
        {
          addgroup('group-edit', false);
        } 
        else 
        {
          modalalert('<div class="popup">' + g.lang.passwords.PCMAXTAGSFREE + '</div>', g.lang.default.PCPROGRAMTITLE);
        }
      };

      document.getElementById('buttoneditgroup').onclick = function(event) 
      {
        editgroup('group-edit');
      };

      document.getElementById('buttondeletegroup').onclick = function(event) 
      {
        deletegroup('group-edit');
      };
      
      var clipboard = new Clipboard('.copybtn');

      clipboard.on('success', function(e) 
      {
        e.clearSelection();
      });
      
      clipboard.on('error', function(e) 
      {
        modalprompt(g.lang.passwordsjs.PCPASSWORDSCLIPBOARDDISABLED + "<br><br>" + g.lang.passwordsjs.PCPASSWORDSCOPYPROCEDURE, g.lang.default.PCPROGRAMTITLE, e.text, "", 64);
      });

      document.onclick = event => 
      {
        // Hide unused side-nav menus and submenus and remove highlights if neccesary

        let target = event.target;

        // Do not close anything if the clicked target is a filter_search sibling
        let targetfilterSearch = (target.previousSibling && target.previousSibling.id == "filter_search") ? true : false;

        if(target == null || target.id !== "buttontools")
        {
          if((target.parentElement == null || target.parentElement.id !== "buttontools") && !targetfilterSearch)
          {
            document.getElementById('tools-menu').classList.add('hidden');
          }
        } 

        if((target == null || target.id !=="buttontoggleselectmenu") && (target.parentElement == null  || target.parentElement.id !== "buttontoggleselectmenu") && !targetfilterSearch)
        {
          document.getElementById("pass-selected-menu").classList.add('hidden');
        }

        if((target == null || target.id !== "buttonsecuritytools") && ( target.parentElement == null || target.parentElement.id !== "buttonsecuritytools" ) && !targetfilterSearch)
        {
          let securityList = document.getElementById('security-menu');
          securityList.classList.add('hidden');
        }

        if((target == null || target.id !== "dialog-filterpassmenu") && (target.parentElement == null || target.parentElement.id !== "filterpass-select") && !targetfilterSearch)
        {
          let filterpassmenu = document.querySelector("#dialog-filterpassmenu");
          let filterpassselect = document.querySelector("#filterpass-select");
          let buttonfilter = document.querySelector('#buttonfilter');
          let hidden = "hidden";

          while(target.parentElement)
          {
            if(target == filterpassmenu || (event.ctrlKey && target == filterpassselect) || target == buttonfilter)
            { 
              return;
            }
            target = target.parentElement;
          }

          filterpassmenu.classList.add(hidden);
          filterpassselect.classList.add(hidden);
          document.getElementById('buttonfilter').classList.remove('on');
        }
      };

      // Tabs on shares
      $('#tabs-teammembershare').tabs();

      var id = getUrlParameter('id');

      if (id)
      {
        document.getElementById(id).click();
      } 
      else 
      {
        // Should we start tour?
        if (localStorage['firstlogin'] === "true") 
        {
          localStorage['firstlogin'] = "false";
          startTour();
        }
        // Event handler on tour
        $('#start-tour-guide').click(function(e)
        {
          e.preventDefault();
          startTour();
          return false;
        });
      }

      disableoptionscheck();
  });
} 
else if (pcrypt.getvalue('options').disablepasswords && !pcrypt.getvalue('options').force2fa)
{
  window.location.replace('./index.html?page=account');
} 
else
{
  window.location.replace('./index.html?page=account&to2fa=true');
}

function highlightMenuItem(menuitem)
{
  $('ul.navigation li a').removeClass('on');
  $('#' + menuitem).addClass('on');
}

function removeHighlightOnMenuItems()
{
  $('ul.navigation li a').removeClass('on');
  $('ul.navigation li a').addClass('deactivated');
}

function getPassOccurrence(pass)
{
  var tempArr = [];
  pass.forEach(function(pass) 
  {
    if(pass.pass.length <= 0) // Skip empty password values
    {
      return;
    }

    var passOccurred = false;

    for(var i = 0; i < tempArr.length; i++)
    {
      if(tempArr[i].pass === pass.pass)
      {
        passOccurred = true;
        tempArr[i].count = tempArr[i].count+1;
        tempArr[i].occurrences.push(pass.id);
      }
    }
    
    if(!passOccurred)
    {
      tempArr[tempArr.length] = {}
      tempArr[tempArr.length-1].pass ? true : tempArr[tempArr.length-1].pass = pass.pass;
      tempArr[tempArr.length-1].count ? tempArr[tempArr.length-1].count = tempArr[tempArr.length-1].count+1 : tempArr[tempArr.length-1].count = 1;
      tempArr[tempArr.length-1].occurrences ? tempArr[tempArr.length-1].occurrences.push(pass.id) : tempArr[tempArr.length-1].occurrences = [pass.id];
    }
  });

  return tempArr;
}

function checkMultiplePassOccurrences(occurrenceArray)
{
  var multipleOccurrences = false;
  occurrenceArray.forEach(function(element)
  {
    if(element.count > 1)
    {
      multipleOccurrences = true;
    }
  });
  return multipleOccurrences;
}

// Member functions below
function showgroup(gid, event) 
{
  g.gidshown = gid;

  pcrypt.setvalue('gidshown', g.gidshown);

  // Set correct select option to show
  // document.getElementById('groupselect').value = gid;

  var locinfo = pcrypt.getvalue('locinfo');

  if ((gid == gpcrypt.sgid.loc) && !locinfo) 
  {
    document.getElementById('statustext').innerHTML = g.lang.passwordsjs.PCPASSWORDSGETLOCATIONWAIT;

    getcurrentlocation(function callback(locinfo) 
    {
      if (locinfo) 
      {
        showgroup(gpcrypt.sgid.loc);
      }
    });
    return;
  }
  showpass(gid);
}

/**
 * Function for displaying the password(s)
 * @param {number} gid group select
 * @param {boolean} security Should it display weak and reoccuring passwords?
 */
function showpass(gid) 
{
  loader(true);
  if ((g.pass.length == 0) && (g.shares.length == 0)) 
  {
    g.passrecordcount = g.passtotalrecordcount = 0;
    document.getElementById('div_contentframe').innerHTML = g.lang.passwordsjs.PCPASSWORDSPRETEXT;
  } 
  else
  {
    var tablearrayheader = [
        ["<input type='checkbox' id='selall' name='selall' value='1'>", "data-sort-method='none' style='width: 22px;'"],
        [g.lang.passwordsjs.PCPASSWORDSSCOLUMNNAME, ""],
        [g.lang.passwordsjs.PCPASSWORDSSCOLUMNUSER, ""],
        [g.lang.passwordsjs.PCPASSWORDSSCOLUMNPASSWORD, ""],
        [g.lang.passwordsjs.PCPASSWORDSSCOLUMNURL, ""],
        [g.lang.passwordsjs.PCPASSWORDSCOLUMNACTION, "data-sort-method='none'"]
    ];
    document.getElementById('div_contentframe').innerHTML = buildtable(tablearrayheader, null, buildpasshtmlarray(g.pass, g.shares, g.teamobject, g.groups, gid), 'passwordgrid', 'passwords table table-bordered');

    var passgrid = document.getElementById('passwordgrid');

    // Do not store the sort object as we have no further use for it
    new Tablesort(passgrid);
    // We have to paint the row backgrounds after sort/search as there may be hidden rows (sadly - but no other way)
    passgrid.addEventListener('afterSort', function() { tablesetbackgroundcolor(passgrid); });

    document.getElementById('selall').addEventListener('click', function(event) {
        selallfunc(event, 'selall', 'selid');
    });

  addCheckboxClickToGrid(passgrid.id);

  // We have to paint the row backgrounds after sort/search as there may be hidden rows (sadly - but no other way)
  passgrid.addEventListener('afterSort', function() 
  { 
    tablesetbackgroundcolor(passgrid); 
  });

  for(var i = 0 ; i < g.passrecordcount ; i++)
  {
    if(document.getElementById('togglepass'+i))
    {
      document.getElementById('togglepass'+i).onclick = togglebuttonfunc;
    } 
    // This does not exist for shares
    if(document.getElementById('update'+i))
    {
      document.getElementById('update'+i).onclick = function (e)
      {
        eventpassfunc(e, false, true);
        // Initialize passFocused for use
        premRes.passFocused = parseInt(e.target.name);
      };
      document.getElementById('share'+i).onclick = sharebuttonfunc;
      document.getElementById('delete'+i).onclick = deletebuttonfunc;
      document.getElementById('show'+i).onclick = function(e) 
      {
        eventpassfunc(e, true, true);
      };
    }
    else
    {
      document.getElementById('shareshow'+i).onclick = shareshowbuttonfunc;
      document.getElementById('shareinfo'+i).onclick = shareinfobuttonfunc;
    }
  }

  // we have to call this after the array has been build
  $(document).ready(function()
  {
    if(!$.fn.bs3tooltip && $.fn.tooltip.noConflict)
      $.fn.bs3tooltip = $.fn.tooltip.noConflict(); // This will prevent conflict between BS3 and Jquery UI Tooltip

    $("a.popupboxstyle").tooltip(
    {
      content: function () 
      {
        return this.getAttribute("title");
      }
    });
  });

    $('.new-row').each(function() {
      $(this).parents('tr').addClass('new-row-tr');
    });
  }

  document.getElementById('statustext').innerHTML = g.lang.passwordsjs.PCPASSWORDSRECORDCOUNTTEXT + ": " + g.passrecordcount + '/' + g.passtotalrecordcount;
  
  if(document.getElementById('searchtext').value.length > 0)
  {
    searchtable();
  }
  
  loader(false);
}

function generateTagCheckboxes()
{
  var grouptaglist = document.getElementById('editpass-taglist');
  var isolatedIDs = [];
  
  while (grouptaglist.firstChild) 
  {
    grouptaglist.removeChild(grouptaglist.firstChild);
  }

  var tagElement = document.createElement('li');
  var tagCheckbox = document.createElement('input');
  var tagLabel = document.createElement('label')
  tagCheckbox.type = 'checkbox';

  var groupselectlist = document.getElementById('groupselectlistmenu').children;
  for(var i = 0, i_len = groupselectlist.length; i < i_len; i++)
  {
    isolatedIDs.push(groupselectlist[i].dataset.gid);
  }

  for(var i = 0; i < g.groups.length; i++)
  {
    var tagElementClone = tagElement.cloneNode();
    tagElementClone.style.margin = '5px';
    tagElementClone.style.display = 'flex';

    var tagCheckboxClone = tagCheckbox.cloneNode();
    tagCheckboxClone.value = g.groups[i].id;
    tagCheckboxClone.classList.add('tag-checkbox');

    var labelClone = tagLabel.cloneNode();
    labelClone.innerText = g.groups[i].name;
    labelClone.classList.add('label-clone');

    var selectedGroup = false;
    for(var j = 0, j_len = isolatedIDs.length; j < j_len; j++)
    {
      if(g.groups[i].id === isolatedIDs[j])
      {
        selectedGroup = true;
      }
    }
    if(selectedGroup)
    {
      tagCheckboxClone.checked = selectedGroup;
    }

    tagElementClone.appendChild(tagCheckboxClone);
    tagElementClone.appendChild(labelClone);
    
    tagCheckboxClone.onchange = function (e) 
    {
      var groupName = getGroupNameFromId(e.target.value);
      var groupselectlistmenu = document.getElementById('groupselectlistmenu');
      var preexistingLabel = document.querySelector('p[data-gid="'+e.target.value+'"]');
      var checkboxesToTest = document.getElementsByClassName('tag-checkbox');
      var tagsChecked = 0;
      for(var i = 0; i<checkboxesToTest.length; i++)
      {
        if(checkboxesToTest[i].checked)
        {
          tagsChecked += 1;
        }
      }

      if (tagsChecked>3) 
      {
        modalalert(g.lang.passwords.PCMAXTAGSPERPASS, g.lang.default.PCPROGRAMTITLE);
        if(e.target.classList.value === 'tag-checkbox')
        {
          e.target.checked = false;
        }
      }
      else
      {
        
        if(e.target.checked === true)
        {
          var newpassdata  = groupselectlistmenu.innerText.indexOf(g.lang.passwords.PCPASSWORDEDITTAGS);
          var oldpassdata  = groupselectlistmenu.innerText.indexOf(g.lang.passwordsjs.PCPASSWORDSGROUPUNDEFINED);
          
          if(newpassdata > -1 || oldpassdata > -1)
          {
            groupselectlistmenu.innerText = null;
          }
          
          if(preexistingLabel) // Special case when a new tag is added in the editpass dialog
          {
            preexistingLabel.remove();
          }

          var htmltagname = document.createElement('P');
          htmltagname.innerText = groupName;
          htmltagname.title = groupName;
          htmltagname.classList.add('tag-selected');
          htmltagname.dataset.gid = e.target.value;
          groupselectlistmenu.appendChild(htmltagname);
        }
        else
        {
          var selected = event.target.value;
          var tagToRemove = document.querySelectorAll('p[data-gid=\"'+selected+'\"]');
          
          for(var j = 0, j_len = tagToRemove.length; j < j_len;j++)
          {
            groupselectlistmenu.removeChild(tagToRemove[j]);
          }
          if(groupselectlistmenu.children.length < 1)
          {
            groupselectlistmenu.innerText = g.lang.passwordsjs.PCPASSWORDSGROUPUNDEFINED;
          }
        }
      }
    }

    labelClone.addEventListener('click', function(event)
    {
      event.preventDefault();

      if(event.target.parentElement.firstChild.checked === true)
      {
        if(event.target.type !== 'checkbox')
        {
          event.target.parentElement.firstChild.click();
        }
      }
      else
      {
        if(event.target.type !== 'checkbox')
        {
          event.target.parentElement.firstChild.click();
        }
      }
    });
    grouptaglist.appendChild(tagElementClone);
  }
}

function searchtable()
{
  var shownrecords = tablesearch(document.getElementById('passwordgrid'), null, document.getElementById('searchtext').value);
  document.getElementById('statustext').innerHTML = g.lang.passwordsjs.PCPASSWORDSRECORDCOUNTTEXT + ": " + shownrecords + '/' + g.passtotalrecordcount;
}

function sortgrouparray(a, b) 
{
  //http://www.javascriptkit.com/javatutors/arraysort.shtml

  var nameA, nameB;

  if (a.name)
    nameA = a.name.toLowerCase();
  else
    nameA = "";

  if (b.name)
    nameB = b.name.toLowerCase();
  else
    nameB = "";

  if (nameA < nameB) //sort string ascending
    return -1
  if (nameA > nameB)
    return 1
  return 0; //default return value (no sorting)
}

function sortpassarray(a, b) 
{
  //http://www.javascriptkit.com/javatutors/arraysort.shtml

  var nameA, nameB;

  if (a.name)
    nameA = a.name.toLowerCase();
  else
    nameA = "";

  if (b.name)
    nameB = b.name.toLowerCase();
  else
    nameB = "";

  if (nameA < nameB) //sort string ascending
    return -1;
  if (nameA > nameB)
    return 1;

  return 0; //default return value (no sorting)
}
/**
 * @description Builds the table to show depending on which gid is chosen.
 * @param {*} dbparray pass
 * @param {*} dbsarray shares
 * @param {*} teamobject teamobject
 * @param {*} dbgarray groups
 * @param {*} gid groupid shown
 */
function buildpasshtmlarray(dbparray, dbsarray, teamobject, dbgarray, gid)
{
  var htmlarray = new Array();
  // var locationarray;
  // var location;
  var countshown = 0;
  var locinfo = pcrypt.getvalue('locinfo');
  let currenttime = (new Date()).getTime();
  var dbarray = addSharesToPass(dbparray, dbsarray, teamobject, Number(gpcrypt.sgid.shares)); // create new array including shares
  dbarray.sort(sortpassarray); // sort combined array - for correct display

  for (var i = 0, len_i = dbarray.length; i < len_i; ++i)
  {
    let pass = JSON.parse(JSON.stringify(dbarray[i])); // Object.assign({}, dbarray[i]); does not work in IE
    //let pass = Object.assign({}, dbarray[i]); // We copy it to be on the safe side
    var showthispassgidValue = showthispassgid(gid, pass, dbsarray, dbgarray, locinfo, currenttime, teamobject);
    var showThisOutshareValue = showThisOutshare(pass);
    let passedFilter = filterCheck(pass);
    if(!passedFilter)
    {
      continue;
    }
    // Test if pass in question should be displayed.
    if(showthispassgidValue || showThisOutshareValue)
    {
      // To protect against possible XSS in shares and wrong error html
      pass.name = htmlspecialchars(pass.name, ['ENT_QUOTES']);
      pass.user = htmlspecialchars(pass.user, ['ENT_QUOTES']);
      pass.pass = htmlspecialchars(pass.pass, ['ENT_QUOTES']);
      pass.url = htmlspecialchars(pass.url, ['ENT_QUOTES']);
      pass.note = htmlspecialchars(pass.note, ['ENT_QUOTES']);
      pass.note = htmlspecialchars(pass.note, ['ENT_QUOTES'], "", true); // We have to enable double encoding to protect against JS injection in popup (innerHTML convert single encoding without &amp; in front back to normal tags)
      pass.note = pass.note.replace(/(?:\r\n|\r|\n)/g, '<br>'); // Show newlines by converting to <br>

      let htmlarrayrow = new Array(6);

      if(typeof pass.share !== 'undefined') // Test if row is share
      {
        let iconsharetype = "";

        htmlarrayrow[0] = (pass.share.change) ? '<div class="new-row"></div>' : '';
        
        switch(pass.share.type)
        {
          default:
          case 'usershare':
            iconsharetype = "icon_shareinfouser";
          break;

          case 'teamshare':
            iconsharetype = "icon_shareinfoteam";
          break;
        }

        htmlarrayrow[5] = "<input id='shareinfo" + countshown + "' name='" + pass.share.index + "," + pass.share.dataindex + "' title='" + g.lang.passwordsjs.PCPASSWORDSBUTTONSHAREINFO + "' type='button' class='" + iconsharetype + "'>";      
        htmlarrayrow[5] += "<input id='shareshow" + countshown + "' name='" + pass.share.index + "," + pass.share.dataindex + "' title='" + g.lang.passwordsjs.PCPASSWORDSBUTTONSHOWNSHARE + "' type='button' class='icon_show'>";
      }
      else
      {
        var passindex = pass.passindex;
        var amountShares = validsharenumber(pass.shares, teamobject);

        htmlarrayrow[0] = "<input type='checkbox' id='selid" + countshown + "' name='" + passindex + "' value='1'>";
        htmlarrayrow[5] = "<input id='delete" + countshown + "' name='" + passindex + "' title='" + g.lang.passwordsjs.PCPASSWORDSBUTTONDELETE + "' type='button' class='icon_delete'>";

        // Grey-out the share icon if the user isn't premium and has a file attached to the password.
        if(pcrypt.getvalue('premium') > 0 || ( pcrypt.getvalue('premium') < 1 && g.pass[passindex].files.length < 1 ))
        {
          // Normal html generation
          htmlarrayrow[5] +=
          "<input id='share" + countshown +
            "' name='" + passindex +
            "' title='" + g.lang.passwordsjs.PCPASSWORDSBUTTONSHARE +
            "' type='button' class='icon_share" + ((amountShares) ?
            " active" : "") +
            "'>";
        }
        else
        {
          // the share icon gets an opacity of 0.5
          htmlarrayrow[5] +=
          "<input id='share" + countshown +
            "' name='" + passindex +
            "' style='opacity:0.5" +
            "' title='" + g.lang.passwordsjs.PCPASSWORDSBUTTONSHARE +
            "' type='button' class='icon_share" + ((amountShares) ?
            " active" : "") +
            "'>";
        }

        htmlarrayrow[5] += "<input id='update" + countshown + "' name='" + passindex + "' title='" + g.lang.passwordsjs.PCPASSWORDSBUTTONEDIT + "' type='button' class='icon_edit'>";
        htmlarrayrow[5] += "<input id='show" + countshown + "' name='" + passindex + "' title='" + g.lang.passwordsjs.PCPASSWORDSSHOWTITLE + "' type='button' class='icon_show'>";
      }

      if(pass.note.length)
        htmlarrayrow[1] = "<a class='popupboxstyle' title='" + pass.note + "'></a>" + pass.name;
      else
        htmlarrayrow[1] = pass.name;

      htmlarrayrow[2] = "<input type='button' class='copybtn icon_copy' id='copyuser" + countshown + "' data-clipboard-text='" + pass.user + "' title='" + g.lang.passwordsjs.PCPASSWORDSCOPYTITLE + "'></input> ";
      htmlarrayrow[2] += pass.user;

      if (pass.share && pass.share.hidepass) 
      {
        htmlarrayrow[3] = "&#149&#149&#149&#149&#149&#149&#149&#149";
      } 
      else 
      {
        htmlarrayrow[3] = 
        "<input type='button' class='copybtn icon_copy' " + 
          " id='copypass" + countshown + 
            "' data-clipboard-text='" + pass.pass + 
            "' title='" + g.lang.passwordsjs.PCPASSWORDSCOPYTITLE + 
          "'></input>";
        htmlarrayrow[3] += "<input type='button' id='togglepass" + countshown + "' name='" + countshown + "' title='" + g.lang.passwordsjs.PCPASSWORDSSHOWTITLE + "' class='icon_show'></input>&nbsp ";
        htmlarrayrow[3] += "<span id='showpassid" + countshown + "' class='showpassid floatLeft' style='display:none;'>";
        htmlarrayrow[3] += pass.pass;
        htmlarrayrow[3] += "</span>";
        htmlarrayrow[3] += "<span id='hidepassid" + countshown + "' class='showpassid floatLeft' style='display:inline-block;'>";
        htmlarrayrow[3] += str_repeat("&#149", pass.pass.length);
        htmlarrayrow[3] += "</span>";
      }

      var url = pass.url;
      if (url.length > 25)
          url = url.substr(0, 25) + '...';

      htmlarrayrow[4] =
          "<a id='url" + countshown + "' name='" + countshown + "' title='" + g.lang.passwordsjs.PCPASSWORDSOPENLINKTITLE + "' target='_blank' href='" + pass.url + "'>" +
          url +
          "</a>";

      htmlarray.push(htmlarrayrow);

      countshown++;
    }
  }

  g.passrecordcount = htmlarray.length;
  g.passtotalrecordcount = dbarray.length;

  return htmlarray;
}

/**
 * @description Generate an array of the html content for group table.
 * @param {*} groups 
 */
function buildGroupHtmlArray(groups) 
{
  if(!groups || typeof groups !== "object" || Array.isArray(groups) !== true)
  {
    return;
  }

  var htmlArray = new Array();

  groups.forEach(function (group, index) 
  {
    if(typeof group.id === 'string')
    {
      // Sanitize
      group.name = htmlspecialchars(group.name, ['ENT_QUOTES']);
      let htmlArrayRow = new Array(2);

      htmlArrayRow[0] = "<input type='checkbox' id='selTagId" + index + "' name='" + group.name + "' value='"+group.id+"'>";

      if (group.name) 
      {
        htmlArrayRow[1] = group.name;
      }

      htmlArray.push(htmlArrayRow);
    } 
  });

  return htmlArray;
}

function editpasssearchtags(searchtext)
{
  var editpasstaglistItems = document.getElementById('editpass-taglist').children;
  var searchLower = '';
  
  if(searchtext)
  {
    searchLower = searchtext.toLowerCase();
  }
  else
  {
    searchtext = '';
  }

  for(var i = 0, i_len = editpasstaglistItems.length; i < i_len; i++)
  {
    var checktagname = editpasstaglistItems[i].children[1].innerText.toLowerCase();
    if(searchtext && searchtext.length > 0 && checktagname.indexOf(searchLower) === -1)
    {
      editpasstaglistItems[i].classList.add('hidden');
    }
    else
    {
      editpasstaglistItems[i].classList.remove('hidden');
    }
  }
}

/**
 * @description When a user checks a password in the password list add it's name to a list of items.
 * Then sort them to ensure shares of the same name aren't overwritten
 * @returns {Array} an array of selected passwords.
 */
function getselectedpass() {
    // Array to contain selected items
    var selectedPasswords = [];

    for (var i = 0; i < g.passrecordcount; i++) 
    {
      var selelem = document.getElementById('selid' + i);

      if (selelem && selelem.checked)
        selectedPasswords.push(selelem.name);
    }

    // We need to sort them as shares with same name may be in between
    selectedPasswords.sort(function compareNumbers(a, b) 
    {
      return a - b;
    });

    return selectedPasswords;
}

/**
 * @description return array of passwords displayed in the password grid.
 * I.e. if a filter or search is active, only the shown passwords should be part of the array.
 * @returns {array} an array of g.pass index values for passwords displayed in the password grid.
 */
function getdisplayedpass() 
{
  let displayedPasswords = []; // Contain displayed passwords
  let displayedInputs;
  let passwordTable = document.getElementById('passwordgrid');
  
  try 
  {
    displayedInputs = passwordTable.querySelectorAll("tr:not([style='display: none;']) td input[type='checkbox']");
  } 
  catch (e) 
  {
    return new Error(e);
  }

  if(displayedInputs)
  {
    for(let i = 0, i_len = displayedInputs.length; i < i_len; i++)
    {
      let input = displayedInputs[i];
      
      if(input.name)
      {
        displayedPasswords.push([input.name]);
      }
    }
  }
  
  return displayedPasswords;
}

function getSelectTeammembers() 
{
  var selectedTeammembers = [];

  for (var i = 0; i < document.getElementById('unshare-table').rows.length; i++) 
  {
      var selectedTeamemmber = document.getElementById('selUnshareId' + i);
      if (selectedTeamemmber && selectedTeamemmber.checked) 
      {
        selectedTeammembers.push(selectedTeamemmber);
      }
  }

  return selectedTeammembers;

}

function groupcheck() 
{
  var items = getselectedpass();

  if (items.length == 0) 
  {
    modalalert(g.lang.passwordsjs.PCPASSWORDSNOSELECTIONTEXT, g.lang.default.PCPROGRAMTITLE);
    return;
  }

  var selectfield = document.getElementById('group-select');
  var headerArray = [];
  
  headerArray = [
    ["<input type='checkbox' id='selectTagAll' name='selecttagall' value='1'>", "data-sort-method='none' style='width: 22px;'"],
    [g.lang.passwordsjs.PCPASSWORDSSCOLUMNGROUP],
  ];

  selectfield.innerHTML = buildtable(headerArray, null, buildGroupHtmlArray(g.groups), 'group-select', 'tagtable table-bordered');
  document.getElementById('selectTagAll').addEventListener('change',
  function(event)
  {
    selallfunc(event, 'selectTagAll', 'selTagId')
  });

  addCheckboxClickToGrid('group-select');

  modaldiv(
    '#dialog-group-select', 
    500, 
    g.lang.passwordsjs.PCPASSWORDSGROUPMULTICHANGE + " (" + items.length + ")", 
    false, 
    false, 
    function() {}, 
    function(result) 
    {
        if (result) 
        {
          var locinfo = pcrypt.getvalue('locinfo');
          var groupselectRows = document.getElementById('group-select').rows;

          for (var i = 0; i < items.length; i++)
          {
            var upditem = g.pass[items[i]];
            upditem.upd = (new Date()).getTime();

            // Clear groups before adding
            upditem.gid = [];
            
            for(var j = 1; j < groupselectRows.length; j++)
            {
              var possibleGroupSelected =groupselectRows[j].children[0].children[0];
              // group is selected and does not exist in the pass.gid array
              if(possibleGroupSelected.checked === true && upditem.gid.includes(possibleGroupSelected.value) === false)
              {
                if(Number(possibleGroupSelected.value) != gpcrypt.sgid.loc)
                {
                  if(upditem.gid.length<3)
                  {
                    upditem.gid.push(possibleGroupSelected.value);
                  }
                }
                else if(locinfo)
                {
                  if(upditem.pos.length < premRes.posMax)
                  {
                    upditem.pos.push(locinfo);
                  }
                }
              }
              else if(possibleGroupSelected.checked !== true && upditem.gid.includes(possibleGroupSelected.value))
              {
                var pos = upditem.gid.indexOf(possibleGroupSelected.value);
                upditem.gid.splice(pos, 1);
              }
            }
          }
        loader(true);
        pcrypt.setdata(pcrypt.getvalue('session'), pcrypt.getvalue('keycrypt'), 'passwords', g.pass, true, 0, updatefunc);
      }
    }
  );
}

function sharecheck() 
{
    var items = getselectedpass();

    if (items.length == 0)
    {
      modalalert(g.lang.passwordsjs.PCPASSWORDSNOSELECTIONTEXT, g.lang.default.PCPROGRAMTITLE);
      return;
    }
    sharebuttonfunc(items);
}

function delcheck() 
{
  var items = getselectedpass();

  if (items.length == 0) 
  {
    modalalert(g.lang.passwordsjs.PCPASSWORDSNOSELECTIONTEXT, g.lang.default.PCPROGRAMTITLE);
    return;
  }

  modalconfirm(g.lang.passwordsjs.PCPASSWORDSGROUPMULTIDELETE + " (" + items.length + ")", g.lang.default.PCPROGRAMTITLE, function(r) 
  {
    if (r) 
    {
      loader(true); // Will be cleared in updatefunc

      let buildshares = false;
      let fileids = [];

      // First find share changes
      for (var i = items.length - 1; i >= 0; i--) // Start from the end
      {
        let pass = g.pass[items[i]]

        for (var j = pass.files.length - 1; j >= 0; j--) // Start from the end
        {
          fileids.push(pass.files[j].fileid);
        }

        if (Object.keys(pass.shares).length) 
        {
          buildshares = true;
          pass.sharechanges = findShareChanges(pass.shares, {});
          pass.shares = {};
        }
      }

      let hasFiles = deletePassFiles(fileids);

      if (buildshares) 
      {
        // Build share data
        buildShareData(g.pass, g.teamobject, hasFiles, deletePassCallback.bind(this, items));
      }
      else
      {
        deletePassCallback(items);
      }
    }
  });
}

function deletePassFiles(fileids)
{
  let filedata = {};

  if(!Array.isArray(fileids))
  {
    console.log('Fileids not array');
    return false;
  }

  if(fileids.length == 0)
    return false;

  filedata.fileid = fileids;
  filedata.data = new Array(fileids.length).fill(null); // null remove private files for DB

  pcrypt.workercall({method: 'encrypt', id: 'storefiles', param: filedata.fileid, filedata: filedata.data, keydata: pcrypt.getvalue('keycrypt')});

  return true;
}

function deletePassCallback(items)
{
  // Delete items (shares and files need to be removed before this)

  for (var i = items.length - 1; i >= 0; i--) // Remove from the end
  {
    g.pass.remove(items[i]);
  }

  //validatedataarray(g.pass, validatepass);

  pcrypt.setdata(pcrypt.getvalue('session'), pcrypt.getvalue('keycrypt'), 'passwords', g.pass, true, 0, updatefunc);
}      

/**
 * Checks for whether a specific user is selected 
 */
function unshareCheck() 
{ 
  if(g.teamobject == null)
  {
    return;
  }
  
  unshareButtonFunc();
}

/**
 * @param {String} id 
 * @returns {String} groupName
 */
function getGroupNameFromId(id)
{
  var groupName = null;
  for(var i = 0; i < g.groups.length; i++)
  {
    if(g.groups[i].id === id)
    {
      groupName = g.groups[i].name;
      break;
    }
  }
  return groupName;
}

/**
 * @description Function for checking if a user has been "pwned".
 * Free users should not be able to use this.
 */
function pwncheck() 
{
    // var items = getselectedpass();
    let items = getdisplayedpass();
    //console.log(items);
    // console.log(getdisplayedpass());
    // If nothing has been selected
    if (items.length < 1 && pcrypt.getvalue('premium') > 0) {
        removeHighlightOnMenuItems();
        modalalert(g.lang.passwordsjs.PCPASSWORDSNOPASSDISPLAYED, g.lang.default.PCPROGRAMTITLE);

        return;
    } else if (pcrypt.getvalue('premium') <= 0) {
        removeHighlightOnMenuItems();
        modalalert('<div class="popup">' + g.lang.passwords.PCHACKCHECKFREE + '</div>', g.lang.default.PCPROGRAMTITLE);
        return;
    }

    var outputList = {};
    //var pwnUrl = 'https://haveibeenpwned.com/api/v2/breachedaccount/';
    for (var i = 0; i < items.length; i++) {
        var obj = g.pass[items[i]];
        if (validemail(obj.user) && obj.user != '') 
        {
            outputList[obj.user] = {};
            outputList[obj.user].breaches = [];
        }
    }

    var totalRequests = Object.keys(outputList).length;
    if (totalRequests == 0) 
    {
        modalalert(g.lang.passwordsjs.PCPASSWORDSNOUSERASEMAIL, g.lang.default.PCPROGRAMTITLE);
        return;
    }

    loader(true);

    Object.keys(outputList).forEach(function(key, index) 
    {
        //curlpwncheck(key).then(function(obj) 
        curlpwncheck(key, function curlpwncheckcallback(obj) 
        {
            for (var j = 0; j < obj.length; j++) 
            {
                var resp = obj[j];
                outputList[key].breaches.push({ name: resp.Name, breachDate: resp.BreachDate, description: resp.Description });
            }

            totalRequests--;
            if (totalRequests == 0) {
                pwncheckDialog(outputList);
            }
        });
    });
}

function pwncheckDialog(outputList) 
{
    //console.log('output list here');
    //console.log(outputList);
    var foundBreaches = g.lang.passwordsjs.PCPASSWORDSFOUNDBREACHES;

    var xssfilter = new xssFilter();
    //xssfilter.options({escape: true});    

    var html = '<p class="border-bottom">' + foundBreaches + '<br><br></p><ul>';

    Object.keys(outputList).forEach(function(key, index) 
    {
        html += '<li><strong>' + htmlspecialchars(key, ['ENT_QUOTES']) + '</strong><div class="breach-wrapper">';
        if (outputList[key].breaches.length) {
            for (var i = 0; i < outputList[key].breaches.length; i++) 
            {
                var obj = outputList[key].breaches[i];
                html +=
                    '<div>' +
                    '<span class="breach-name">' +
                    xssfilter.filter(obj.name) +
                    '</span>' +
                    ' <span class="breach-date">(' +
                    xssfilter.filter(obj.breachDate) + ')' +
                    '</span>' +
                    ' <span class="breach-description-icon" data-id="' + i + '">' +
                    '</span>' +
                    '<br>' +
                    '<div class="breach-description bd' + i + '">' +
                    xssfilter.filter(obj.description) +
                    '</div>' +
                    '</div>';
            }
        } else 
        {
            html += g.lang.passwordsjs.PCPASSWORDSNOBREACHESREC;
        }
        html += '</div></li>';
    });
    html += '</ul>';
    $('#pwn-frame').html(html);

    $('.breach-description-icon').click(function() {
        var _id = $(this).data('id');
        console.log(_id);
        $('.breach-description.bd' + _id).slideToggle();
    });

    modaldiv('#dialog-pwn', 500, g.lang.passwordsjs.PCPASSWORDSBREACHREPORT, true, true, function() {}, function(response) {

    });

    scrollLock(false);
    loader(false);

}

function disableoptionscheck()
{
  var opts = pcrypt.getvalue('options');
  if (opts && opts.disableexport && !opts.isglobaladmin)
  {
    $('#listitem-buttonexport').hide();
  }
}

function exportcheck()
{
  var items = getselectedpass();

  if (!items.length)
  {
    removeHighlightOnMenuItems();
    modalalert(g.lang.passwordsjs.PCPASSWORDSNOSELECTIONTEXT, g.lang.default.PCPROGRAMTITLE);
    return;
  }

  modalprompt(g.lang.default.PCPASSWORDSCONFIRMPASSWORDTEXT, g.lang.default.PCPROGRAMTITLE, 'PASSWORD', "", 64, null, function(pass) 
  {
    if (pass) 
    {
      var keys = pcrypt.generatekeys(pass, pcrypt.getvalue('saltcrypt'));

      if (keys.aes !== pcrypt.getvalue('keycrypt')) 
      {
        modalalert(g.lang.default.PCPASSWORDSWRONGPASSWORD, g.lang.default.PCPROGRAMTITLE);
        return;
      }

      saveDataAsFile('pcryptexport.txt', 'text/plain', exportcsv(g.pass, items, { columns: ["name", "user", "pass", "url", "note", "pos"], json: ["note", "pos"] }));
    }
  });
}

function togglebuttonfunc(e) 
{
  var id = Number((e.srcElement || e.target).name);

  var shownpassid = 'showpassid' + id;
  var hidepassid = 'hidepassid' + id;
  var buttontoggleid = 'togglepass' + id;

  if (document.getElementById(buttontoggleid).title == g.lang.passwordsjs.PCPASSWORDSSHOWTITLE)
  {
    document.getElementById(buttontoggleid).title = g.lang.passwordsjs.PCPASSWORDSHIDETITLE;
    document.getElementById(buttontoggleid).className = 'icon_hide';
    document.getElementById(shownpassid).style.display = 'inline';
    document.getElementById(hidepassid).style.display = 'none';
  } 
  else 
  {
    document.getElementById(buttontoggleid).title = g.lang.passwordsjs.PCPASSWORDSSHOWTITLE;
    document.getElementById(buttontoggleid).className = 'icon_show';
    document.getElementById(shownpassid).style.display = 'none';
    document.getElementById(hidepassid).style.display = 'inline';
  }
}

/**
 * @name eventpassfunc
 * @description A function for deciding whether a user is allowed to edit or only read the contents of a given password.
 * @param {event} e event, e.g. mouseclicks
 * @param {boolean} readonly boolean, If readonly = true, user is only allowed to read. If readonly = false, a user is allowed to edit the password
 */
function eventpassfunc(e, readonly, allowedit) {
    var index = Number((e.srcElement || e.target).name);

    if (index < 0)
        return;

    showpassfunc(g.pass[index], readonly, allowedit);
}


$('#passlengthslider').on('input', function() 
{
  var value = document.getElementById("passlengthslider").value;
  document.getElementById("passlengthlabel").innerHTML = value;
  generatepassword();
  editPassSecurityCheck();
});

$("#show_password_options").on('click', function() {
  if ($("#passwordoptionslist").is(":visible")) {
    // div is shown when the height is 0, otherwise it wont.
    $("#passwordoptionslist").hide();
  } else {
    $("#passwordoptionslist").show();
  }
});

function setpassgenlocalstorage(options) {

  var data = {
    'length': options.length,
    'canUseUpper': options.ualphas.toString(),
    'canUseLower': options.lalphas.toString(),
    'canUseNumbers': options.numbers.toString(),
    'canUseSpecialChars': options.specials.toString()
  };

  localStorage.setItem("passwordgeneratoroptions", JSON.stringify(data));

}

function getpassgenlocalstorage() {

  var length = 12;
  var canUseUpper = true;
  var canUseLower = false;
  var canUseNumbers = true;
  var canUseSpecialChars = false;

  var data = JSON.parse(localStorage.getItem("passwordgeneratoroptions"));

  if (data) {

    if (data.length) {
      length = data.length;
    }

    if (data.canUseUpper) {
      canUseUpper = data.canUseUpper === 'true';
    }

    if (data.canUseLower) {
      canUseLower = data.canUseLower === 'true';
    }

    if (data.canUseNumbers) {
      canUseNumbers = data.canUseNumbers === 'true';
    }

    if (data.canUseSpecialChars) {
      canUseSpecialChars = data.canUseSpecialChars === 'true';
    }

  }

  return {
    "length": length,
    "canUseUpper": canUseUpper,
    "canUseLower": canUseLower,
    "canUseNumbers": canUseNumbers,
    "canUseSpecialChars": canUseSpecialChars
  };
}

function generatepassword() {

  var length = document.getElementById("passlengthslider").value;
  var canUseUpper = document.getElementById("atozupper").checked;
  var canUseLower = document.getElementById("atozlower").checked;
  var canUseNumbers = document.getElementById("numbers").checked;
  var canUseSpecialChars = document.getElementById("specialchars").checked;

  var randoptions = { lalphas: canUseLower, ualphas: canUseUpper, numbers: canUseNumbers, specials: canUseSpecialChars };

  var pass = randomString(length, randoptions);

  randoptions.length = length;

  setpassgenlocalstorage(randoptions);

  document.getElementById("passfield").value = pass;

}

/**
 * @name showpassfunc
 * @description Shows the password edit modal
 * @param {Object} passdata Such as a specific g.pass[i] object
 * @param {Boolean} readonly Whether a user is only allowed to read or edit the data associated with a given password
 * @param {Boolean} allowedit If readonly is true this is to decide wether or not to show the edit button in the bottom of the modal
 */
function showpassfunc(passdata, readonly, allowedit)
{
  var createdhtml         = document.getElementById('createdhtml');
  var updatedhtml         = document.getElementById('updatedhtml');
  //var alarmdate           = document.getElementById('alarmdate');
  var $alarmdate          = $('#alarmdate');
  var namefield           = document.getElementById('namefield');
  var userfield           = document.getElementById('userfield');
  var passfield           = document.getElementById('passfield');
  var urlfield            = document.getElementById('urlfield');
  var urlpathfield        = document.getElementById('urlpath-option'); 
  var groupselectlist     = document.getElementById('groupselectlist');
  var searchTagInput      = document.getElementById('editpass-search-tag');
  var locselect           = document.getElementById('locselect');
  var fileselect          = document.getElementById('fileselect');
  var notefield           = document.getElementById('notefield');
  var groupselectlistmenu = document.getElementById('groupselectlistmenu');
  var groupid             = 0;
  var dialogtitle;

  // Datepicker
  let alarmdateFormat = g.lang.default.JS_DATEFORMAT;
  $alarmdate.attr('placeholder', alarmdateFormat);
  let mask = alarmdateFormat.replace( /[a-zA-Z]/g, "0" );
  $alarmdate.mask(mask);

  if($alarmdate.data("datepicker-init") === "")
  {
    // jQuery datepicker handles year as yy not yyyy, so we adjust for that
    alarmdateFormat = alarmdateFormat.replace( "yyyy", "yy" );

    try // If language is missing we get exceptions because of JSON parsing
    {
      $alarmdate.datepicker(
        {
          dateFormat: alarmdateFormat,
          showAnim: 'fadeIn',
          showOn: "button",
          buttonImage: pcrypt.urldomain + pcrypt.urlpath + "img/icn_calendar.svg",
          buttonImageOnly: true,
          firstDay: parseInt(g.lang.default.JS_FIRSTDAYWEEK, 10),
          prevText: g.lang.passwordsjs.PCPASSWORDSDPPRIOR,
          nextText: g.lang.passwordsjs.PCPASSWORDSDPNEXT,
          monthNames: JSON.parse(g.lang.passwordsjs.PCPASSWORDSDPMONTHJSON),
          dayNamesMin: JSON.parse(g.lang.passwordsjs.PCPASSWORDSDPDAYJSON),
          buttonText: g.lang.passwordsjs.PCPASSWORDSDPBUTTONTEXT
        }
      );

      $alarmdate.data( "datepicker-init", "initiated" );
      // Add hover color on calendar icon
      alarmDateHoverEvent();
    }
    catch(e)
    {
      console.log('Unable to initialize datepicker: ', e);
    }
  }
  removeClearSearchIcon("alarmdate");

  if(passdata)
  {
    createdhtml.innerHTML = (new Date(passdata.cre)).format(g.lang.default.JS_DATETIMEFORMAT);
    updatedhtml.innerHTML = (new Date(passdata.upd)).format(g.lang.default.JS_DATETIMEFORMAT);

    // Set Alarm Date
    if(passdata.alarm)
    {
      if (!readonly) 
      {
        enableDisableAlarmDateButton(true);
        $alarmdate.datepicker( "option", "minDate", new Date(passdata.alarm) );
        $alarmdate.datepicker( "setDate", new Date(passdata.alarm) );

        // Add clear search icon
        addClearSearchIcon("alarmdate", function() 
        {
          $alarmdate.datepicker( "setDate", null );
        });

        // Add click event
        $('img.ui-datepicker-trigger').on('click', function()
        {
          // Timeout necessary as a hack for jQuery UI
          setTimeout(function()
          {
            console.log('changing minDate');
            let tmpDate = $alarmdate.val();
            $alarmdate.datepicker( "option", "minDate", new Date().addDays(1) );
            $alarmdate.val(tmpDate);
            setTimeout(function()
            {
              $('img.ui-datepicker-trigger').click();
            }, 10);
          }, 10);
        });
      }
      else 
      {
        $alarmdate.datepicker( "option", "minDate", new Date().addDays(-1024) );
        enableDisableAlarmDateButton(false);
        $alarmdate.datepicker( "setDate", new Date(passdata.alarm));
      }
    }
    else
    {
      $alarmdate.datepicker( "option", "minDate", new Date().addDays(1) );
      $alarmdate.datepicker( "setDate", null );
      if (!readonly)
      {
        enableDisableAlarmDateButton(true);
        // Add clear search icon
        addClearSearchIcon("alarmdate", function()
        {
          $alarmdate.datepicker( "setDate", null );
        });
      }
      else
      {
        enableDisableAlarmDateButton(false);
      }
    }

    groupid = passdata.gid;
    namefield.value = passdata.name;
    userfield.value = passdata.user;
    if(passdata.share && passdata.share.hidepass) // only valid for shares
      passfield.value = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
    else
      passfield.value = passdata.pass;

    urlfield.value = passdata.url;

    var image = null;

    if(passdata.url && g.icons && Object.getOwnPropertyNames(g.icons).length > 0)
    {
      var src = '';
      var blob = null;

      var icon = g.icons[parseUri(passdata.url).host];
      var waitingIcon = g.icons['waiting'];
      var defaultIcon = g.icons['default'];
      if(icon)
      {
        switch(icon.status)
        {
          case 0:
            if(defaultIcon)
            {
              src = defaultIcon.image;
            }
            break;

          case 1:
            if(waitingIcon)
            {
              src = waitingIcon.image;
            }
            break;

          case 2:
            if(icon)
            {
              src = icon.image;
            }
            break;

          default:
            break;
        }
      }
      else
      {
        src = defaultIcon.image;
      }

      if(document.getElementById('faviconshowpass'))
      {
        image = document.getElementById('faviconshowpass');
        if(src.length>1 && image)
        {
          image.classList.remove('hidden');

          if(src !== null)
          {
            var byteString  = atob(src);
            var arrayBuffer = new ArrayBuffer(byteString.length);
            var int8Array   = new Uint8Array(arrayBuffer);
            
            for(var i = 0; i < byteString.length; i++)
            {
              int8Array[i] = byteString.charCodeAt(i);
            }
            blob = new Blob([int8Array], {type: 'image/png'})
          }

          if(window.URL.createObjectURL)
          {
            image.src = window.URL.createObjectURL(blob);
          }
        }
        else
        {
          image.classList.add('hidden');
        }
      }
    }
    else
    {
      if(document.getElementById('faviconshowpass'))
      {
        document.getElementById('faviconshowpass').classList.add('hidden');
      }
    }

    if(passdata.urlpath)
      urlpathfield.checked = (passdata.urlpath === true) ? true : false;
    else
      urlpathfield.checked = false;
    
    notefield.value = passdata.note;

    notefield.value = passdata.note;

    if(groupselectlist.className.indexOf('hidden') <= -1)
    {
      groupselectlist.classList.add('hidden');
    }
    
    while(groupselectlistmenu.firstChild)
    {
      groupselectlistmenu.removeChild(groupselectlistmenu.firstChild);
    }

    if(passdata.gid && passdata.gid.length>0 && passdata.hasOwnProperty('passindex'))
    {
      var groupselectlistmenu = document.getElementById('groupselectlistmenu');

      for(var i = 0, i_len = passdata.gid.length; i < i_len; i++)
      {
        for(var j = 0, j_len = g.groups.length; j < j_len; j++)
        {
          if(passdata.gid[i] === g.groups[j].id)
          {
            var htmltagname = document.createElement('P');
            htmltagname.innerText = g.groups[j].name;
            htmltagname.title = g.groups[j].name;
            htmltagname.classList.add('tag-selected');
            htmltagname.dataset.gid = g.groups[j].id;
            groupselectlistmenu.appendChild(htmltagname);
          }
        }
      }
    }
    else
    {
      groupselectlistmenu.innerText = g.lang.passwordsjs.PCPASSWORDSGROUPUNDEFINED;
    }
    
    setselectlocations(locselect, passdata.pos);
    setselectfiles(fileselect, passdata);

    if (readonly) 
    {
      dialogtitle = g.lang.passwordeditjs.PCPESHOWTITLE;
    } 
    else
    {
      dialogtitle = g.lang.passwordeditjs.PCPECHANGETITLE;
    }
    if(groupselectlist.className.indexOf('hidden') <= -1)
    {
      groupselectlist.classList.add('hidden');
    }

    checkPasswordGroups(passdata);

    var occurrenceArray = getPassOccurrence(g.pass);
    var warning = '';
    if(document.getElementById('warning-display-showpass'))
    {
      document.getElementById('warning-display-showpass').classList.remove('realnone');
    }

    for(var i = 0; i < occurrenceArray.length; i++)
    {
      if(occurrenceArray[i].pass === passdata.pass && occurrenceArray[i].count > 1)
      {
        if(passwordstrength(passdata.pass)<3)
        {
          warning = '10';
          i = occurrenceArray.length;
        }
        else
        {
          warning = '0';
          i = occurrenceArray.length;
        }
      }
      else if(occurrenceArray[i].pass === passdata.pass && passwordstrength(passdata.pass)<3)
      {
        warning = '1';
        i = occurrenceArray.length;
      }
    }

    var passWarning = document.getElementById('warning-display-showpass');

    switch (warning) 
    {
      case '0':
      case '1':
      case '10':
        passWarning.classList.remove('realnone');
        passWarning.classList.add('customtooltip');
        passWarning.setAttribute('title', warningAlert(warning));

        $(".customtooltip").tooltip(
        {
          content: function ()
          {
            return this.getAttribute("title");
          }
        });
      break;

      default:
        passWarning.classList.add('realnone');
        passWarning.classList.remove('customtooltip');
        passWarning.removeAttribute('title');
      break;
    }

  }
  else
  {
    var date = new Date();
    var groupselect = document.getElementById('groupselect');
    // groupid = groupselect.options[groupselect.selectedIndex].value;
    dialogtitle = g.lang.passwordeditjs.PCPENEWTITLE;
    
    // Date value must be empty from the beginning
    $alarmdate.datepicker( "option", "minDate", new Date().addDays(1) );
    $alarmdate.datepicker( "setDate", null );
    // Add clear search icon
    addClearSearchIcon("alarmdate", function()
    {
      $alarmdate.datepicker( "setDate", null );
    });
    enableDisableAlarmDateButton(true);

    createdhtml.innerHTML = date.format(g.lang.default.JS_DATEFORMAT);
    updatedhtml.innerHTML = date.format(g.lang.default.JS_DATEFORMAT);
    namefield.value = "";
    userfield.value = "";
    passfield.value = "";
    urlfield.value = "";
    urlpathfield.checked = false;
    notefield.value = "";
    groupselectlistmenu.innerText = g.lang.passwords.PCPASSWORDEDITTAGS;
    locselect.length = 0;
    fileselect.length = 0;

    if(document.getElementById('warning-display-showpass'))
    {
      document.getElementById('warning-display-showpass').classList.add('realnone');
    }

    if(document.getElementById('faviconshowpass'))
    {
      document.getElementById('faviconshowpass').classList.add('hidden');
    }

    if(g.filter.pos && g.filter.pos.length > 0)
    {
      addcurrentlocation( 'locselect' );
    }

    if(groupselectlist.className.indexOf('hidden') <= -1)
    {
      groupselectlist.classList.add('hidden');
    }

    checkPasswordGroups()
  }

  document.getElementById('editpass-addgroup').onclick = function(event)
  {
    addgroup('group-edit', true, passdata);
  };

  $("#password-tabs").tabs({ active: 0 });

  if(readonly)
  {
    passwordstrength('', passfield);
    toggledisabled("dialog-passwordedit", true);
    document.getElementById('urlpath-option').disabled = true;
    document.getElementById('PASSWORDSURLPATHTEXT').disabled = true;
    document.getElementById('inputfileupload').disabled = true;
    document.getElementById('alarmdate').disabled = true;
    document.getElementById('PASSWORDSURLPATHTEXT').onclick = function (event)
    {
        event.preventDefault();

        return;
    }
    document.getElementById('groupselectlistmenu').onclick = null;
    $('#PCPASSWORDEDITMOREOPTIONS').hide();
  }
  else
  {
    passwordstrength(passfield.value, passfield);
    toggledisabled("dialog-passwordedit", false);
    document.getElementById('urlpath-option').disabled = false;
    document.getElementById('PASSWORDSURLPATHTEXT').disabled = false;
    document.getElementById('inputfileupload').disabled = false;
    document.getElementById('alarmdate').disabled = false;
    document.getElementById('PASSWORDSURLPATHTEXT').onclick = function (event)
    {
      event.preventDefault();

      if(document.getElementById('urlpath-option'))
      {
        document.getElementById('urlpath-option').checked = !document.getElementById('urlpath-option').checked;
      }
    }

    if(allowedit && readonly === false)
    {
      document.addEventListener('mouseup', toggleGroupSelectMenu); 
    }

    // Show password options button
    $('#PCPASSWORDEDITMOREOPTIONS').show();
  }

  // Pass is now to be shown and below is handling of new values

    var divoptions = 
    {
      div: '#dialog-passwordedit',
      width: 578,
      title: dialogtitle,
      returnisok: false,
      hideok: readonly,
      onopen: function()
      {
        // Bind new tag event
        $('.ui-widget #dialog-passwordedit select').bind('change', function()
        {
          var v = $(this).val();
          var selectedOption = $(this)[0].selectedIndex;

          if (v == "addnewtag" )
          {
            // Check is user has premium, if not ensure that it's the "add new tag" option and that the user has less than 3 tags
            if(pcrypt.getvalue('premium') > 0 || (pcrypt.getvalue('premium') < 1 && selectedOption == 0 && g.groups.length<premRes.tagsMaxFree ))
            {
              addgroup('groupselectlist', groupid);
            }
            else
            {
              modalalert('<div class="popup">'+g.lang.passwords.PCMAXTAGSFREE+'<div>', g.lang.default.PCPROGRAMTITLE);
            }
          }
        });

        var passwordgeneratoroptions = getpassgenlocalstorage();

        document.getElementById("passlengthlabel").innerHTML = passwordgeneratoroptions.length;
        document.getElementById("passlengthslider").value = passwordgeneratoroptions.length;
        document.getElementById("atozupper").checked = passwordgeneratoroptions.canUseUpper;
        document.getElementById("atozlower").checked = passwordgeneratoroptions.canUseLower;
        document.getElementById("numbers").checked = passwordgeneratoroptions.canUseNumbers;
        document.getElementById("specialchars").checked = passwordgeneratoroptions.canUseSpecialChars;

        // hide the passwordoption list when the modal loads.
        $("#passwordoptionslist").hide();
      },
      callback: function(result)
      {
        // Unbind change tag event
        $('.ui-widget #dialog-passwordedit select').unbind();
        removeHighlightOnMenuItems();
        if(result && !readonly)
        {
          loader(true);

          let filedata;
          let stringtime = (new Date().setFromFormat($alarmdate.val(), g.lang.default.JS_DATEFORMAT)).getTime();
          let currenttime = (new Date()).getTime();
          let alarmtime = $alarmdate.datepicker("getDate");

          if(alarmtime !== null)
          {
            alarmtime = alarmtime.getTime();
          }

          if(passdata)
          {
            let oldhash = pcrypt.sha256(pcrypt.jsonstringify(passdata));

            passdata.name     = namefield.value;
            passdata.user     = userfield.value;
            passdata.pass     = passfield.value;
            passdata.url      = urlfield.value;
            passdata.urlpath  = urlpathfield.checked;
            passdata.note     = notefield.value;
            getselectlocations(locselect, passdata);
            filedata = getselectfiles(fileselect, passdata); // Save the file info in pass entry and return info about files

            if(alarmtime && (alarmtime > currenttime) && (alarmtime === stringtime))
            {
              passdata.alarm = alarmtime;
            }
            else
            {
              passdata.alarm = null;
            }
            
            passdata.gid = showpassSetGroupsSelected();
            
            let newhash = pcrypt.sha256(pcrypt.jsonstringify(passdata));

            // We have to do this here as object compare is always different if done before
            passdata.upd      = (new Date()).getTime();

            if(newhash != oldhash)
            {
              // Call a function to handle storing of files and sharing data
              handleFileStoringAndSharing(filedata, passdata);
            }
          }
          else
          {
            passdata = {};

            passdata.upd     = passdata.cre = (new Date()).getTime();
            passdata.id      = randomString(pcrypt.randomidlength); // Unique ID for the password used to hide passwords when shared
            passdata.name    = namefield.value;
            passdata.user    = userfield.value;
            passdata.pass    = passfield.value;
            passdata.url     = urlfield.value;
            passdata.urlpath = urlpathfield.checked;
            passdata.note    = notefield.value;
            getselectlocations(locselect, passdata);
            filedata = getselectfiles(fileselect, passdata); // TODO - we have to handle this in a different way

            if(alarmtime && (alarmtime > currenttime) && (alarmtime === stringtime))
              passdata.alarm = alarmtime;
            else
              passdata.alarm = null;

              passdata.gid = showpassSetGroupsSelected();

            if(filedata)
            {
              handleFileStoringAndSharing(filedata, passdata);
            }

            g.pass.push(passdata);
          }

          validatepass(passdata);

          pcrypt.setdata(pcrypt.getvalue('session'), pcrypt.getvalue('keycrypt'), 'passwords', g.pass, true, 0, updatefunc);
          //getfavicons(getAllAccessiblePass(), true);
          getfavicons(addSharesToPass(g.pass, g.shares, g.teamobject, Number(gpcrypt.sgid.shares)), true);
          removeHighlightOnMenuItems();
        }
        
        searchTagInput.value = '';
        var inputEvent = new Event('input', {
          bubbles: true,
        });
        searchTagInput.dispatchEvent(inputEvent);
        document.removeEventListener('mouseup', toggleGroupSelectMenu, false);
      }
    };

    if(readonly && allowedit) 
    {
      divoptions.extrabuttons = [{
        text: g.lang.passwordsjs.PCPASSWORDSBUTTONEDIT,
        callback: function() 
        {
          var activeTab = $('#password-tabs').tabs('option','active');
          $('#dialog-passwordedit').dialog("close");
          showpassfunc(passdata, false, true);
          $('#password-tabs').tabs('option','active', activeTab);
        }
      }];
    }

    if(readonly) 
    {
      divoptions.canceltext = g.lang.default.PCBUTTONCLOSE;
    }

    modaldiv_advanced(divoptions);

    greyUploadButton(passdata, readonly);
}

/**
 * @description checks for selected groupIDs and adds them to an array.
 * Used in the callback(s) for showpass() to add groups to a given password.
 * i.e. passdata.gid
 * @returns {array} selected groupIDs
 */
function showpassSetGroupsSelected()
{
  // Group info is not shared
  var groupIDs = [];
  var groupSelectChildren = document.getElementById('editpass-taglist').children;

  for(var i = 0; i < groupSelectChildren.length; i++)
  {
    if(groupSelectChildren[i].children[0].checked === true)
    {
      if(groupIDs.length<3)
      {
        groupIDs.push(groupSelectChildren[i].children[0].value);
      }
    }
  }
  return groupIDs;
}

function toggleGroupSelectMenu(event)
{
  event.stopImmediatePropagation();
  event.stopPropagation();
  event.preventDefault();
  
  var overlay = $('.ui-widget-overlay')[0];
  var groupselectlistmenu = $('#groupselectlistmenu')[0];
  var groupselectlist = document.getElementById('groupselectlist');
  switch (event.target) 
  {
    case overlay:
      groupselectlist.classList.add('hidden');
    break;

    case groupselectlistmenu:
      if(groupselectlist.classList.contains('hidden'))
      {
        groupselectlist.classList.remove('hidden');
        document.getElementById('editpass-search-tag').focus();
      }
      else
      {
        groupselectlist.classList.add('hidden');
      }
    break;

    case groupselectlistmenu.firstChild:
      if(groupselectlist.classList.contains('hidden'))
      {
        groupselectlist.classList.remove('hidden');
        document.getElementById('editpass-search-tag').focus();
      }
      else
      {
        groupselectlist.classList.add('hidden');
      }
    break;

    default:
    break;
  }
}

/**
 * @description Check if a tag already exists in a password.
 * @param {integer} passindex the index for the password in g.pass .
 * @param {integer} tagVal the tag whose value we want to test for.
 */
var passHasGroup = function(passindex, tagVal)
{
  var valid = false;

  for(var i = 0; i < g.pass[passindex].groupIDs.length; i++)
  {
    if(g.pass[passindex].groupIDs[i] === tagVal)
    {
      valid = true;
    }  
  }

  return valid;
}

function checkPasswordGroups(passdata) 
{
  var groupselectlistElem = document.getElementById('editpass-taglist');
  
  g.groups.forEach(function (group) // Go through each group
  {
    if(passdata && passdata.gid.includes(group.id) === true) // Ensure this password has that group
    {
      var groupselectChildLength = groupselectlistElem.children.length;
      for(var i = 0; i < groupselectChildLength; i++) // For each of the checkboxes
      {
        if(groupselectlistElem.children[i].children[0].value === group.id)
        {
          groupselectlistElem.children[i].children[0].checked = true;
          continue;
        }
      }
    }
    else
    {
      var groupselectChildLength = groupselectlistElem.children.length;
      for(var i = 0; i < groupselectChildLength; i++) // For each of the checkboxes
      {
        if(groupselectlistElem.children[i].children[0].value === group.id)
        {
          groupselectlistElem.children[i].children[0].checked = false;
        }
      }
    }
  });
}

function deletebuttonfunc(e) 
{
    var editindex = Number((e.srcElement || e.target).name);

    if (editindex < 0)
        return;

    modalconfirm(g.lang.passwordsjs.PCPASSWORDSDELETECONFIRM + ": " + htmlspecialchars(g.pass[editindex].name, ['ENT_QUOTES']), g.lang.default.PCPROGRAMTITLE, function(r) 
    {
        if (r) 
        {
            let pass = g.pass[editindex];
            let fileids = [];

            for (var j = pass.files.length - 1; j >= 0; j--) // Start from the end
            {
              fileids.push(pass.files[j].fileid);
            }

            let hasFiles = deletePassFiles(fileids)

            if (Object.keys(pass.shares).length) 
            {
                loader(true); // Will be cleared in updatefunc

                pass.sharechanges = findShareChanges(pass.shares, {});
                pass.shares = {};

                // Build share data
                buildShareData(g.pass, g.teamobject, hasFiles, deletePassCallback.bind(this, [editindex]));
            }
            else
            {
              deletePassCallback([editindex]);
            }
        }
    });
}

/**
 * @name unsharebuttonfunc
 * @description Called when a user wants to unshare (a) specific password(s) 
 * from a specific user. It should work so that the sharing is removed from the
 * password(s).
 * @param {Array} selectedPasswords Array of selected elements
 */
function unshareButtonFunc() 
{
  // If a user is premium allow them to share passwords with files.
  // If a user isn't premium and a password has a file attached stop the user from sharing the password.
  loadDialog(g.sharediv, "share", true, false, function sharecallback(sharediv) 
  {
    if (sharediv !== false)
        g.sharediv = sharediv;

    if (!pcshare) 
    {
        console.log("Share JS file not ready!");
        return;
    }

    var sharetitle = g.lang.passwords.PCPASSWORDSUSERMENUUNSHARE;

    pcshare.show(g.sharediv, 700, sharetitle, false, false, [2], 0, function()
    {
        pcshare.init(null, g.teammembers, g.teamobject);
        document.getElementById('stop-share-help-text').style.display = 'block';
    },
    function(removedShares)
    {
      if (!removedShares)
          return;
      
      let pass = null;
      let shareName = null;
      let removedShare = null;
      let positionOfShare = -1;
      let filesPresent = false;

      for(let i = 0, i_len = g.pass.length; i < i_len; i++)
      {
        pass = g.pass[i];

        if(pass.files.length>0)
        {
          filesPresent = true;
        }

        if(pass.shares)
        {
          let sharechanges = findShareChanges(removedShares, pass.shares);
          pass.sharechanges = sharechanges;
          let shareNames = Object.getOwnPropertyNames(pass.shares);
  
          for(let j = 0, j_len = shareNames.length; j < j_len; j++)
          {
            shareName = shareNames[j];

            if(shareName == "0" && removedShares["0"] && pass.shares[shareName])
            {
              for(let z = 0, z_len = removedShares[shareName].length; z < z_len; z++)
              {
                removedShare = removedShares[shareName][z];

                if(pass.shares[shareName] && pass.shares[shareName].length > 0)
                {
                  positionOfShare = pass.shares["0"].indexOf(removedShare);

                  if(positionOfShare > -1)
                  {
                    pass.shares[shareName].splice(positionOfShare, 1);
                  }
                }

                // Remove unused attribute
                if(pass.shares[shareName] && pass.shares[shareName].length < 1)
                {
                  delete pass.shares[shareName];
                }
              }
            }
            else
            {
              if(pass.shares[shareName] && removedShares[shareName])
              {
                for(let z = 0, z_len = removedShares[shareName].length; z < z_len; z++)
                {
                  removedShare = removedShares[shareName][z];

                  if(pass.shares[shareName] && pass.shares[shareName].length > 0)
                  {
                    positionOfShare = pass.shares[shareName].indexOf(removedShare);
                    
                    if(positionOfShare > -1)
                    {
                      pass.shares[shareName].splice(positionOfShare, 1);
                    }
                  }
                }

                if(pass.shares[shareName].length < 1)
                {
                  delete pass.shares[shareName];
                }
              }
            }
          }
        }
      }

      buildShareData(g.pass, g.teamobject, filesPresent);
      pcrypt.setdata(pcrypt.getvalue('session'), pcrypt.getvalue('keycrypt'), 'passwords', g.pass, true, 0, updatefunc);
      showpass(g.gidshown);
      removeHighlightOnMenuItems();
    });
  });
}

/**
 * @description The functionality called when the share button at a given password is clicked
 * @param {Array} event
 */
function sharebuttonfunc(event) 
{
    var editindex;
    var currentshares;
    var hasFiles = false;

    if (Array.isArray(event)) 
    {
      // Edit multiple shares
      editindex = event;

      currentshares = {};
    } 
    else
    {
      // Edit a single share
      editindex = Number((event.srcElement || event.target).name);

      if (editindex < 0)
        return;

      currentshares = g.pass[editindex].shares;

      if (!currentshares)
        currentshares = {};
    }

    if (editindex.length > 1) 
    {
      editindex.forEach(function(element) 
      {
        if (g.pass[element].files.length > 0) 
        {
          hasFiles = true;
        }
      });
    }
    // If editindex only represents one password, check whether that password has a file attached.
    else if (g.pass[editindex].files !== undefined && g.pass[editindex].files.length !== 0) 
    {
      hasFiles = true;
    }

    if (pcrypt.getvalue('emailconfirm') !== 'undefined' && parseInt(pcrypt.getvalue('emailconfirm')) === 0) 
    {
      popupCall('unverified');
      return;
    }

    if (pcrypt.getvalue('premium') < 1 && hasFiles === true) 
    {
      modalalert('<div class="popup">' + g.lang.passwords.PCPASSWITHFILEFREE + '<div>', g.lang.default.PCPROGRAMTITLE);
      return;
    }

    // If a user is premium allow them to share passwords with files.
    // If a user isn't premium and a password has a file attached stop the user from sharing the password.
    loadDialog(g.sharediv, "share", true, false, function sharecallback(sharediv) 
    {
      if (sharediv !== false)
        g.sharediv = sharediv;

      if (!pcshare) 
      {
        console.log("Share JS file not ready!");
        return;
      }

      var sharetitle = g.lang.passwordsjs.PCPASSWORDSTITLESHAREEDIT;

      if (!Array.isArray(editindex))
          sharetitle += ' [' + g.pass[editindex].name + ']';

      pcshare.show(g.sharediv, 700, sharetitle, false, false, [], 0, function()
      //pcshare.show(g.sharediv, 700, sharetitle, false, false, function()
      {
          pcshare.init(currentshares, g.teammembers, g.teamobject);
          document.getElementById('stop-share-help-text').style.display = 'none';
      },
      function(newshares, newemails)
      {
        if (!newshares)
            return;

          if(pcrypt.getvalue('premium') < 1)
          {
          var newsharesKeys = Object.keys(newshares);
          var newSharesPresent = false;
          var oldShareRemoved = false;
          var sharesCount = 0;
            
          g.pass.forEach(function(pass, index)
          {
            var passShareKeys = Object.keys(pass.shares);
            if((!Array.isArray(editindex) && index !== editindex) || (Array.isArray(editindex) && editindex.indexOf(""+index+"") == -1))
            {
              passShareKeys.forEach(function(shareKey, keyIndex)
              {
                if(pass.shares[shareKey])
                {
                  sharesCount += pass.shares[shareKey].length; 
                }
              });
            }
            else
            {     
              for(var x = 0, x_len = newsharesKeys.length; x < x_len; x++)
              {
                for(var y = 0, y_len = newshares[newsharesKeys[x]].length; y < y_len; y++)
                {
                  if((!pass.shares[newsharesKeys[x]] && newshares[newsharesKeys[x]]) || pass.shares[newsharesKeys[x]].indexOf(newshares[newsharesKeys[x]][y]) == -1 )
                  { 
                    newSharesPresent = true;
                  }
                }
                sharesCount += newshares[newsharesKeys[x]].length;
              }
              
              for(var i = 0, i_len = passShareKeys.length; i < i_len; i++)
              {
                for(var j = 0, j_len = pass.shares[passShareKeys[i]].length; j < j_len; j++)
                {
                  if((!newshares[passShareKeys[i]] && pass.shares[passShareKeys[i]]) || !newshares[passShareKeys[j]] || newshares[passShareKeys[i]].indexOf(pass.shares[passShareKeys[i]][j]) == -1)
                  {
                    oldShareRemoved = true;
                  }
                }
              }
            }
          });
            
          if(sharesCount > 3 && newSharesPresent == true)
          {
            $(g.sharediv).dialog("close"); // Ensure previous dialog is closed to avoid _tabbable error
            var text = g.lang.passwordsjs.PCMAXFREESHARES.split('\n');
            text = text[0].concat(text[1]).concat(text[2]);
            modalalert(g.lang.passwordsjs.PCMAXFREESHARES, g.lang.default.PCPROGRAMTITLE, function(result)
            {
              if(result === true)
              {
                window.location.href = './index.html?page=account&toPrem=true';
              }
            });
            return;
          }
        }

        addTeamAndShareByEmail(newshares, newemails, function newsharesfunc(teammembers, newshareswithemail, newmembers)
        {
            if (teammembers)
            {
              g.teamobject = convertteammembers(teammembers);
              g.teammembers = cleanmembers(teammembers, g.teamobject);
            }

            setpassshares(editindex, newshareswithemail);

            if (newmembers && newmembers.new.length)
            {
              let text = g.lang.default.PCNEWSHAREUSERTEXT;
              text += "<br><ul>";

              for (let i = 0, len_i = newmembers.new.length; i < len_i; i++)
              {
                text += "<li>" + htmlspecialchars(newmembers.new[i], ['ENT_QUOTES']);
              }

              text += "</ul>";
              
              //text += "<br><br><ul><li>" + newmembers.new.join("<li>") + "</ul>";
              modalalert(text, g.lang.default.PCPROGRAMTITLE, function callback() {});
            }
        });
      });
    });

    function setpassshares(editindex, newshares) 
    {
        // Save list of users that this item is shared with together with the password entry (password and shares can be updated)
        if (Array.isArray(editindex)) 
        {
            for (var i = editindex.length - 1; i >= 0; i--) // set from the end
            {
              var pass = g.pass[editindex[i]];

              pass.sharechanges = findShareChanges(pass.shares, newshares);
              pass.shares = newshares;
            }
        } 
        else 
        {
          var pass = g.pass[editindex];

          pass.sharechanges = findShareChanges(pass.shares, newshares);
          pass.shares = newshares;
        }

        /**
         * This should check if the new shares are present in the old shares.
         */
        function checkNewShares() 
        {
          var containsNewShare = false;

          debugger;

          if (editindex.length) 
          {
            for (var i = 0, len_i = editindex.length; i < len_i; i++) 
            {
              // Iterating through newshares
              for (var shareNew in newshares) 
              { // If there are currentshares
                if (Object.keys(currentshares).length > 0) 
                { // For each element in currentshares
                    for (var shareCurrent in currentshares) 
                    { // If currenshares does not have a key from newshares.
                      // OR if newshares has a property in currentshares or that property is undefined (i.e. there are no currenshares).
                      // and currenshares does not have a property from newshares.
                      if (!currentshares.hasOwnProperty(shareNew) || ((newshares.hasOwnProperty(shareCurrent) || shareCurrent == 'undefined') && !currentshares.hasOwnProperty(shareNew))) 
                      {
                        containsNewShare = true;
                        g.pass[editindex[i]].shares = currentshares;
                      }
                    }
                } 
                else 
                {
                  // Assume if a user tries to share with an empty currentshares that the newshares isn't empty
                  // It is and a user will see the "premium" alert, I don't see how else to do this in it's current iteration
                  containsNewShare = true;
                  g.pass[editindex[i]].shares = currentshares;
                }
              }
            }
          } 
          else 
          {
            for (var shareNew in newshares) 
            { // If there are currentshares
              if (Object.keys(currentshares).length > 0) 
              { // For each element in currentshares
                  for (var shareCurrent in currentshares) 
                  { // If currenshares does not have a key from newshares.
                    // OR if newshares has a property in currentshares or that property is undefined (i.e. there are no currenshares).
                    // and currenshares does not have a property from newshares.
                    if (!currentshares.hasOwnProperty(shareNew) || ((newshares.hasOwnProperty(shareCurrent) || shareCurrent == 'undefined') && !currentshares.hasOwnProperty(shareNew))) 
                    {
                      containsNewShare = true;
                      g.pass[editindex[0]].shares = currentshares;
                    }
                  }
              } 
              else 
              {
                // Assume if a user tries to share with an empty currentshares that the newshares isn't empty
                // It is and a user will see the "premium" alert, I don't see how else to do this in it's current iteration
                containsNewShare = true;
                g.pass[editindex].shares = currentshares;
              }
            }
          }
          return containsNewShare;
        }

      if (pcrypt.getvalue('premium') > 0 || (pcrypt.getvalue('premium') < 1 && ((hasFiles === true && checkNewShares() === false) || hasFiles === false))) 
      {
        // Build share data
        buildShareData(g.pass, g.teamobject, hasFiles);

        // Also save passwords (needed because we updated an entry)
        pcrypt.setdata(pcrypt.getvalue('session'), pcrypt.getvalue('keycrypt'), 'passwords', g.pass, true, 0, updatefunc);

        // Update the groupselect.
        fillgroupselect(document.getElementById('groupselect'), g.gidshown, g.fillgroupoptions);
      } 
      else 
      {
        $('#dialog-share').dialog('close');
        modalalert('<div class="popup">' + g.lang.passwords.PCPASSWITHFILEFREE + '<div>', g.lang.default.PCPROGRAMTITLE);
      }
    }
}

function shareshowbuttonfunc(e) {
    // we have to find the info in the share array
    var indexstring = (e.srcElement || e.target).name;
    var index = indexstring.split(","); // 0 = user, 1 = share data form user
    if (index.length !== 2)
        return;

    if (g.shares.length <= index[0])
        return;

    if (g.shares[index[0]].data.length <= index[1])
        return;

    var shareuser = g.shares[index[0]];
    var sharedata = shareuser.data[index[1]];
    var sharehide = hidesharepassvalid(pcrypt.getvalue('userid'), shareuser, sharedata, g.teamobject);

    var pass = shareToPass(shareuser, index[0], index[1], sharehide, gpcrypt.sgid.undef);
    showpassfunc(pass, true, false);
}

function shareinfobuttonfunc(e) {
    // we have to find the info in the share array
    var indexstring = (e.srcElement || e.target).name;
    var index = indexstring.split(","); // 0 = user, 1 = share data form user

    if (index.length !== 2)
        return;

    showshareinfo(g.shares, index[0], index[1], g.teamobject);
}

function updatefunc(data, error, id) {
    if (error) {
        switch (error) {
            case 14:
                pcrypt.flushvalues();
                redirectinvalidlogin();
                return;

            default:
                handlepcrypterror(error, data);
                return;
        }
    }

    loader(false);
    showpass(g.gidshown);
    removeHighlightOnMenuItems();
}

function generatepass(event, field) 
{
  var insertfield = document.getElementById(field);
  var randoptions = event.shiftKey ? 
  { 
    lalphas: true, 
    ualphas: true, 
    numbers: true, 
    specials: false 
  } : { 
    lalphas: true, 
    ualphas: true, 
    numbers: true, 
    specials: true 
  };

  insertfield.value = insertfield.value + randomString(8, randoptions);
}

function locsuccess(position) 
{
  var locinfo = {};

  locinfo.lat = position.coords.latitude;
  locinfo.long = position.coords.longitude;
  locinfo.acc = position.coords.accuracy;

  pcrypt.setvalue('locinfo', locinfo);

  navigator.geolocation.callback(locinfo);
}

function locerror(msg) 
{
  var message;

  // The message attribute must return an error message describing the details of the error encountered. This attribute is primarily intended for debugging and developers should not use it directly in their application user interface.

  console.log(msg.message);

  switch (msg.code) 
  {
    case msg.PERMISSION_DENIED:
      message = "POSITION PERMISSION DENIED";
      break;

    case msg.POSITION_UNAVAILABLE:
      message = "POSITION UNAVAILABLE";
      break;

    case msg.TIMEOUT:
      message = "POSITION TIMEOUT";
      break;

    default:
    case msg.UNKNOWN_ERROR:
      message = "UNKNOWN_ERROR - " + msg.code;
      break;
  }

    modalalert(g.lang.passwordsjs.PCPASSWORDSNOLOCATION + ' (' + message + ')', g.lang.default.PCPROGRAMTITLE);

    navigator.geolocation.callback(false);
}

function getcurrentlocation(callback) 
{
    var locinfo = pcrypt.getvalue('locinfo');

    if (locinfo) 
    {
        callback(locinfo);
        return;
    }

    if (navigator.geolocation) 
    {
        navigator.geolocation.callback = callback; // small hack
        navigator.geolocation.getCurrentPosition(locsuccess, locerror, { timeout: 30000 });
    } 
    else 
    {
        modalalert(g.lang.passwordsjs.PCPASSWORDSNOLOCATION, g.lang.default.PCPROGRAMTITLE);
        callback(false);
    }
}

function addcurrentlocation(field) 
{
    var fieldElement = document.getElementById(field);
    var isPremium = pcrypt.getvalue('premium');
    var maxpos = premRes.posMaxFree; 
    
    if(isPremium)
    {
      maxpos = premRes.posMax;
    }

    if(fieldElement.children.length >= maxpos)
    {
      modalalert(g.lang.passwordeditjs.PCPESELECTMAXIMUMENTRIES + ' ' + maxpos, g.lang.default.PCPROGRAMTITLE);
      return;
    }

    getcurrentlocation(function callback(locinfo) 
    {
      if (locinfo) 
      {
        addselectlocation(field, locinfo);
      }
    });
}

function updategroups(e)
{
  var selectfield = document.getElementById('group-edit');
  
  var headerArray = [
      ["<input type='checkbox' id='selectTagAll' name='selecttagall' value='1'>", "data-sort-method='none' style='width: 22px;'"],
      [g.lang.passwordsjs.PCPASSWORDSSCOLUMNGROUP],
    ];

  selectfield.innerHTML = buildtable(headerArray, null, buildGroupHtmlArray(g.groups), 'group-edit', 'tagtable table-bordered');
  addCheckboxClickToGrid('group-edit');
  document.getElementById('selectTagAll').addEventListener('change',
  function ()
  { 
    selallfunc(event, 'selectTagAll','selTagId');
  });

  selectfield.length = 0; // Empty select list
  g.groups.sort(sortpassarray);

    
  $("#tablegroup-edit td:nth-child(2)").show();

  modaldiv('#dialog-group-edit', 500, g.lang.passwordsjs.PCPEEDITGROUPTITLE, false, false, function () {}, function (result)
  {
    if(result)
    {
      savegroups('group-edit');
    }

    removeHighlightOnMenuItems();
  });

}

function savegroups(selectfieldid, grouptext) 
{
  var selectfield = document.getElementById(selectfieldid);
  var tempgroups = [];
  var newGroupId = null;
  if (grouptext) 
  {
    var d = (new Date()).getTime();
    var grpRowArr = {
        id: randomString(pcrypt.randomidlength),
        upd: d,
        cre: d,
        name: grouptext
    };

    validategroup(grpRowArr);

    g.groups.push(grpRowArr);
    newGroupId = grpRowArr.id;
  } 
  else 
  {
    for (var i = 1, len_i = selectfield.rows.length; i < len_i; ++i) 
    {
      var grpRowArr = {};
      if (parseInt(selectfield.rows[i].children[0].children[0].value) == 0) // new item
      {
        grpRowArr.id = randomString(pcrypt.randomidlength);
        grpRowArr.upd = grpRowArr.cre = (new Date()).getTime();
        grpRowArr.name = selectfield.rows[i].children[1].innerText;
        newGroupId = grpRowArr.id;
      } 
      else 
      {
        grpRowArr.id = selectfield.rows[i].children[0].children[0].value;
        
        for(var j = 0; j < g.groups.length; j++)
        {
          if(selectfield.rows[i].children[0].children[0].value === g.groups[j].id)
          {
            grpRowArr.cre = g.groups[j].cre;
          }
        }
        
        if (selectfield.rows[i].children[1].innerText) // updated item
        {
          grpRowArr.upd = (new Date()).getTime();
          grpRowArr.name = selectfield.rows[i].children[1].innerText;
        }
      }
      tempgroups.push(grpRowArr);
      validategroup(grpRowArr);
    }
    g.groups = tempgroups;
  }

  g.groups.sort(sortgrouparray);

  pcrypt.setdata(pcrypt.getvalue('session'), pcrypt.getvalue('keycrypt'), 'groups', g.groups, true, 0, function(data, error, id) 
  {
    if (error) 
    {
      handlepcrypterror(error, data);
      return;
    }

    fillgroupselect(document.getElementById('groupselect'), g.gidshown, g.fillgroupoptions);
    /*
        g.lang.passwordsjs.PCPASSWORDSGROUPALL,
        g.lang.passwordsjs.PCPASSWORDSGROUPUNDEFINED,
        g.lang.passwordsjs.PCPASSWORDSGROUPLOCATION,
        g.lang.passwordsjs.PCPASSWORDSGROUPOWN,
        g.lang.passwordsjs.PCPASSWORDSGROUPSHAREDOUT,
        g.lang.passwordsjs.PCPASSWORDSGROUPSHAREDIN,
        g.groups,
        g.shares,
        true,
        false,
        true,
        true);
*/
    });

  generateTagCheckboxes();
  
  if(newGroupId)
  {
    var newgroupposition = document.querySelector('input[class="tag-checkbox"][value="'+newGroupId+'"]').offsetTop;
    var editpassTaglist = document.getElementById('editpass-taglist');
    editpassTaglist.scrollTop = newgroupposition - 50;
  }

  if(grpRowArr && grpRowArr.id)
  {
    return grpRowArr.id;
  }
  else
  {
    return null;
  }
}
/**
 * @description adds a new group (tag) to the system
 * @param {String} field
 * @param {Boolean} saveNow Should the group be saved at the end of this function?
 * @param {Object} passdata If this function is called in from the editpass element passdata is neccesary.
 * @param {Int} groupid
 * @example addgroup('promptid', 1564799975684455);
 */
function addgroup(field, saveNow, passdata, groupid) 
{
  var selectfield = document.getElementById(field);
  var searchfield = document.getElementById('editpass-search-tag');
  
  if(g.groups.length >= premRes.tagsMaxFree && pcrypt.getvalue('premium')<1)
  {
    modalalert('<div class="popup">'+g.lang.passwords.PCMAXTAGSFREE+'<div>', g.lang.default.PCPROGRAMTITLE );
    return;
  }

  if(searchfield.value.length)
  {
    var grouptext = searchfield.value;
    var groupExists = false;
    // Check if group with this name already exists
    for(var i = 0, i_len = g.groups.length; i < i_len; i++)
    {
      if(g.groups[i].name === grouptext)
      {
        groupExists = true;
        i = i_len
      }
    }

    if(groupExists)
    {
      modalalert(g.lang.passwordsjs.PCPASSTAGEXISTS, g.lang.default.PCPROGRAMTITLE);
      return;
    }

    var nextid = savegroups(field, grouptext);
    if(selectfield.children.length)
    {
      var row = selectfield.children[3].insertRow();
      var cellCheckbox = row.insertCell(0);
      var cellText = row.insertCell(1);
      var selectTagCheckbox = document.createElement('input');
      
      selectTagCheckbox.type = 'checkbox';
      selectTagCheckbox.value = nextid;
      selectTagCheckbox.id = 'selTagId' + selectTagCheckbox.value;
      cellCheckbox.appendChild(selectTagCheckbox)
      cellText.innerHTML = htmlspecialchars(grouptext, ['ENT_QUOTES']);
      var rowPosition = row.offsetTop;
      selectfield.scrollTop = rowPosition;
    }
    addCheckboxClickToGrid('group-edit');
    searchfield.value = '';
  }
  else
  {
    modalprompt(g.lang.passwordsjs.PCPEGROUPADDTITLE, g.lang.default.PCPROGRAMTITLE, "", "", 64, function()
    {
      // This must be done in timeout else the focus won't work
      setTimeout(function()
      {
        $('.ui-dialog input[name="promptid"]').focus();
      }, 100);
    },
    function(grouptext)
    {
      if(!grouptext)
      {
        return;
      }
      
      var groupExists = false;
      // Check if group with this name already exists
      for(var i = 0, i_len = g.groups.length; i < i_len; i++)
      {
        if(g.groups[i].name === grouptext)
        {
          groupExists = true;
          i = i_len
        }
      }

      if(groupExists)
      {
        modalalert(g.lang.passwordsjs.PCPASSTAGEXISTS, g.lang.default.PCPROGRAMTITLE);
        return;
      }
  
      if (typeof groupid != "undefined")
      {
        // Should we save it right away
        var groupselectlist = document.getElementById(field);            
        var nextid = savegroups(field, grouptext);
        fillgroupselect(groupselectlist, nextid, g.fillgroupoptions);
        /*
          false, g.lang.passwordeditjs.PCPEGROUPUNDEFINED, false, false, false, false, g.groups, false, false, true, true);
        */
      }
      else
      {
        var nextid = randomString(pcrypt.randomidlength);
        if(selectfield.children.length)
        {
          var row = selectfield.children[3].insertRow();
          var cellCheckbox = row.insertCell(0);
          var cellText = row.insertCell(1);
          var selectTagCheckbox = document.createElement('input');
          
          selectTagCheckbox.type = 'checkbox';
          selectTagCheckbox.value = nextid;
          selectTagCheckbox.id = 'selTagId' + selectTagCheckbox.value;
          cellCheckbox.appendChild(selectTagCheckbox)
          cellText.innerHTML = htmlspecialchars(grouptext, ['ENT_QUOTES']);
        }
          
        addCheckboxClickToGrid('group-edit');
        
        if(saveNow)
        {
          savegroups(field, grouptext);
          if(passdata)
          {
            checkPasswordGroups(passdata);
          }
        }
      }
      searchfield.value = '';
    }, saveNow, passdata);
  }
}

function editgroup(field) 
{
  var selectfield = document.getElementById(field);

  var len_i = selectfield.children[3].children.length;
  var selectedGroupIds = []
  for(var i = len_i-1; i >= 0; i--)
  {
    if(selectfield.children[3])
    {
      if(selectfield.children[3].children && selectfield.children[3].children[i].children[0].children[0].checked === true)
      {
        selectedGroupIds.push(selectfield.children[3].children[i].children[0].children[0].value);
      }
    }
  }

  if (!selectfield.children[3].children.length || selectedGroupIds.length <= 0) 
  {
    modalalert(g.lang.passwordsjs.PCPEGROUPNOITEMS, g.lang.default.PCPROGRAMTITLE);
    return;
  }

  if (selectedGroupIds.length>0)
  {
    var divOptions = 
    {
      div: '#tag-edit-dialog',
      hideok: false,
      hidecancel: false,
      returnisok: false,
      width: 300,
      title: g.lang.passwords.PCEDITINGTAGS,
      onopen: function () 
      {
        var tagEditParent = document.getElementById('tagnameedit');
        if(tagEditParent.children === undefined || tagEditParent.children.length < g.groups.length)
        {
          selectedGroupIds.forEach(function (gid) 
          {
            var tagEditDiv   = document.createElement('div');
            var tagEditLabel = document.createElement('span');
            var tagEditInput = document.createElement('input');

            tagEditDiv.classList.add('tagEditDiv');

            for(var i = 0; i <= g.groups.length-1; i++)
            {
              if(g.groups[i].id === gid)
              {
                tagEditLabel.innerText = g.groups[i].name+': ';
                tagEditInput.name = g.groups[i].id;
                tagEditInput.placeholder = g.groups[i].name;
              }
            }
            
            tagEditDiv.appendChild(tagEditLabel);
            tagEditDiv.appendChild(tagEditInput);
            tagEditParent.appendChild(tagEditDiv);
          });
        }
      },
      callback: function (returnOnOkClick) 
      {
        if(returnOnOkClick === true)
        {
          var tagEditParent   = document.getElementById('tagnameedit');
          var tagEditChildren = tagEditParent.children;
          var tagTable        = document.getElementById('group-edit');
          for(var i = 0; i < tagEditChildren.length; i++)
          {
            if(tagEditChildren[i].children[1].tagName === 'INPUT')
            {
              var tagEditInputName        = tagEditChildren[i].children[1].name;
              var tagEditInputPlaceholder = tagEditChildren[i].children[1].placeholder;
              var tagEditInputValue       = tagEditChildren[i].children[1].value;
              
              if(tagEditInputPlaceholder !== tagEditInputValue && tagEditInputValue.length > 0)
              {
                for(var j = 0; j < tagTable.children[3].children.length; j++)
                {
                  if(tagTable.children[3].children[j].children[0].children[0].value === tagEditInputName)
                  {
                    tagTable.children[3].children[j].children[1].innerText = htmlspecialchars(tagEditInputValue, ['ENT_QUOTES']);
                  }
                }
              }
            }
          }

          // Clear tagEditElements on close
          while (tagEditParent.firstChild) 
          {
            tagEditParent.removeChild(tagEditParent.firstChild);
          }
        }
        else
        {
          var tagEditParent = document.getElementById('tagnameedit');

          // Clear tagEditElements on close
          while (tagEditParent.firstChild) 
          {
            tagEditParent.removeChild(tagEditParent.firstChild);
          }
        }
      }
    };
    modaldiv_advanced(divOptions);
  }
}

function deletegroup(field) 
{
  var selectfield = document.getElementById(field);

  var len_i = selectfield.children[3].children.length;
  var selectedGroupIds = [];

  for(var i = len_i-1; i >= 0; i--)
  {
    if(selectfield.children[3])
    {
      if(selectfield.children[3].children && selectfield.children[3].children[i].children[0].children[0].checked === true)
      {
        selectedGroupIds.push(selectfield.children[3].children[i].children[0].children[0].value);
      }
    }
  }

  if(selectedGroupIds.length <= 0)
  {
    modalalert(g.lang.passwordsjs.PCPEGROUPNOITEMS, g.lang.default.PCPROGRAMTITLE);
    return;
  }
  else
  {
    var namesOfSelectedGroups = [];
    selectedGroupIds.forEach(function(groupId)
    {
      g.groups.forEach(function (group) 
      {
        if(group.id === groupId)
        {
          namesOfSelectedGroups.push(' ' + group.name);
        } 
      });
    });

    modalconfirm(g.lang.passwordsjs.PCPEGROUPDELETETITLE + ' ' + htmlspecialchars(namesOfSelectedGroups, ['ENT_QUOTES']), g.lang.default.PCPROGRAMTITLE, function(r) 
    {
      if(r)
      {
        selectedGroupIds.forEach(function (gid) 
        {
          for(var j = len_i - 1; j >= 0; j--) 
          {
            if(selectfield.children[3].children[j] === undefined)
            {
              continue;
            }

            if(selectfield.children[3].children[j].children[0].children[0].value === gid)
            {
              selectfield.children[3].deleteRow(j);
            }
          }
        });
      }
    });
  }
}

/**
 * Toggle the alarmdate button. Active/inactive
 * @param state boolean
 */
function enableDisableAlarmDateButton(state) {
  if (state)
  {
    $('img.ui-datepicker-trigger').css({'pointer-events': 'auto', 'opacity': 1});
  }
  else
  {
    $('img.ui-datepicker-trigger').css({'pointer-events': 'none', 'opacity': 0.5});
  }
}

/**
 * @description Updates the innertext values for the groupselectlist labels
 */
function updateGroupSelectMenu()
{
  if(g.groups === undefined)
  {
    return;
  }
  
  if(document.getElementById('groupselectlist').children === undefined)
  {
    return;
  }

  var groupSelectChildren = document.getElementById('groupselectlist').children;
  var i = 0;
  g.groups.forEach(function(group)
  {
    if(Number(groupSelectChildren[i].children[0].value) === group.id)
    {
      groupSelectChildren[i].children[1].innerText = group.name;
    }
    i++;
  });
}

function alarmDateHoverEvent() 
{
  $('img.ui-datepicker-trigger').hover(
    function()
    {
      $(this).attr('src', pcrypt.urldomain + pcrypt.urlpath + "img/icn_calendar_hover.svg");
    },
    function()
    {
      $(this).attr('src', pcrypt.urldomain + pcrypt.urlpath + "img/icn_calendar.svg");
    }
  );
}

function pcryptimport(perform, format, importtext) 
{
    var headerarray = [];
    var valueobject = {};
    var importarray = [];
    //var importtext = document.getElementById('import-textarea').value;

    if (importtext.length)
    switch (format.type) 
    {
        default:

            importarray = CSV.csvToArray(importtext, true);

        if (format["index"] == "dashlane") 
        {
            for (i = 1; i < importarray.length; i++) 
            {

                if (importarray[i][2].length > 0) {
                    importarray[i][3] = importarray[i][2];
                    importarray[i][2] = "";
                }
            }

        }

        break;

        case 'tab':
                importarray = importtext.split('\n');

            for (var i = 0, len_i = importarray.length; i < len_i; ++i)
                importarray[i] = importarray[i].split('\t');
            break;
    }

    for (var i = 0, rem_i = 0, len_i = format.fields.length; i < len_i; ++i) 
    {
        if (format.fields[i].value.length) 
        {
            valueobject[format.fields[i].value] = headerarray.length;
            headerarray[headerarray.length] = [format.fields[i].text];
        } 
        else 
        {
            for (var j = 0, len_j = importarray.length; j < len_j; ++j)
                if (importarray[j].length > (i - rem_i))
                    importarray[j].remove(i - rem_i);
                ++rem_i;
        }
    }

    // remove remaining items
    for (var j = 0, len_j = importarray.length; j < len_j; ++j)
        importarray[j] = importarray[j].slice(0, headerarray.length);

    if (format.titleline)
        importarray.remove(0);

    if (importarray.length == 0) {
        modalalert(g.lang.importjs.PCIMPORTNOTHINGTOIMPORT, g.lang.default.PCPROGRAMTITLE);
        return false;
    }

    if (!perform) 
    {
      // Clean import array for html tags (sanitize user input)
      for (var i = 0, len_i = importarray.length; i < len_i; ++i) 
      for (var j = 0, len_j = importarray[i].length; j < len_j; ++j) 
      {
        importarray[i][j] = htmlspecialchars(importarray[i][j], ['ENT_QUOTES']);
      }

      return buildtable(headerarray, null, importarray, 'importgrid', 'table');
    } 
    else 
    {
        loader(true);

        for (var j = 0, len_j = importarray.length; j < len_j; ++j) 
        {
            var passdata = {};

            passdata.upd = passdata.cre = (new Date()).getTime();
            passdata.name = importarray[j][valueobject.name];
            passdata.user = importarray[j][valueobject.user];
            passdata.pass = importarray[j][valueobject.pass];
            passdata.url = importarray[j][valueobject.url];
            passdata.note = importarray[j][valueobject.note];
            passdata.pos = importarray[j][valueobject.pos];

            if (passdata.note) 
            {
                if (format.newlinechar) 
                {
                    passdata.note = passdata.note.replace(/\|/g, '\n');
                } 
                else 
                {
                    var jsonnote = pcrypt.jsonparse(passdata.note, true);

                    if (jsonnote)
                        passdata.note = jsonnote;
                }
            }

            if(passdata.pos) 
            {
                var jsonpos = pcrypt.jsonparse(passdata.pos, true); // "[{""lat"":""55.7001311"",""long"":""12.535110699999999"",""acc"":""79""}]"

                if (jsonpos)
                {
                    passdata.pos = jsonpos;
                }
                else if (passdata.pos.split) // Only availabe if string type
                {

                    var posarray = passdata.pos.split(":"); // 55.7001311;12.53511069;79:55.7001311;12.53511069;7

                    if (posarray.length) 
                    {
                        passdata.pos = [];

                        for (var i = 0, len_i = posarray.length; i < len_i; ++i) 
                        {
                            var locarray = posarray[i].split(';', 3);
                            var locinfo = {};

                            if (locarray.length == 3) 
                            {
                                locinfo.lat = locarray[0];
                                locinfo.long = locarray[1];
                                locinfo.acc = locarray[2];

                                passdata.pos.push(locinfo);
                            }
                        }
                    }
                }

                if (!jsonpos && (!Array.isArray(passdata.pos) || passdata.pos.length == 0)) 
                {
                    passdata.note += "\nUnable to import positions. Please use syntax: lat;long;acc:lat;long;acc";
                }

            }

            g.pass.push(passdata);
            validatepass(passdata);
        }

        pcrypt.setdata(pcrypt.getvalue('session'), pcrypt.getvalue('keycrypt'), 'passwords', g.pass, true, 0, updatefunc);

        return true;
    }
}

function startTour() {
    var defaulturl = window.location.protocol + '//' + window.location.host + removefilefrompath(window.location.pathname);

    // Instance the tour
    var guidedTour = new Tour({
        debug: false,
        onShown: function() {
            jQuery('.tour-background').css('display', 'block');
        },
        onHidden: function() {
            jQuery('.tour-background').css('display', 'none');
        },
        steps: [{ // Step 1
                orphan: true,
                template: '<div class="popover tour"><img src="' + defaulturl + '/img/pop1image.png" id="tour-image1"><h1 class="popover-title"></h1><div class="popover-content"></div><div class="popover-navigation"><button class="hide-tips" data-role="end"><i class="fa fa-minus-circle"></i> ' + g.lang.passwordsjs.PCTOURHIDETIPS + '</button><button class="btn btn-default button" data-role="next">' + g.lang.passwordsjs.PCTOUROKSTART + '</button></div></div>',
                title: g.lang.passwordsjs.PCTOURWELCOME,
                content: '<h6>' + g.lang.passwordsjs.PCTOURSTEP1 + '</h6>'
            },
            { // Step 2
                element: '#PCTOPMENUPASSWORDS',
                placement: 'bottom',
                template: '<div class="popover tour"><div class="arrow"></div><div class="popover-content"></div><div class="popover-navigation"><button class="hide-tips" data-role="end"><i class="fa fa-minus-circle"></i> ' + g.lang.passwordsjs.PCTOURHIDETIPS + '</button><button class="btn btn-default button" data-role="next">' + g.lang.passwordsjs.PCTOURNEXT + '</button></div></div>',
                title: 'Unused',
                content: g.lang.passwordsjs.PCTOURSTEP2 //'Let\'s start here, this is your Password section.'
            },
            { // Step 3
                element: '#PCTOPMENUTEAM',
                placement: 'bottom',
                template: '<div class="popover tour"><div class="arrow"></div><div class="popover-content"></div><div class="popover-navigation"><button class="hide-tips" data-role="end"><i class="fa fa-minus-circle"></i> ' + g.lang.passwordsjs.PCTOURHIDETIPS + '</button><button class="btn btn-default button" data-role="next">' + g.lang.passwordsjs.PCTOURNEXT + '</button></div></div>',
                title: 'Unused',
                content: g.lang.passwordsjs.PCTOURSTEP3 //'Before you can share Passwords and send encrypted messages,<br>you need to build your team.'
            },
            { // Step 4
                element: '#icon_account',
                placement: 'bottom',
                template: '<div class="popover tour"><div class="arrow"></div><div class="popover-content"></div><div class="popover-navigation"><button class="hide-tips" data-role="end"><i class="fa fa-minus-circle"></i> ' + g.lang.passwordsjs.PCTOURHIDETIPS + '</button><button class="btn btn-default button" data-role="next">' + g.lang.passwordsjs.PCTOURNEXT + '</button></div></div>',
                title: 'Unused',
                content: g.lang.passwordsjs.PCTOURSTEP4 //'If you have any changes to your account, this is where you can see and change your settings.'
            },
            { // Step 5
                element: '#icon_logout',
                placement: 'bottom',
                template: '<div class="popover tour"><div class="arrow"></div><div class="popover-content"></div><img src="' + defaulturl + '/img/pop2image.png" id="tour-image1"><br><br><div class="popover-navigation"><button class="hide-tips" data-role="end"><i class="fa fa-minus-circle"></i> ' + g.lang.passwordsjs.PCTOURHIDETIPS + '</button><button class="btn btn-default button" data-role="next">' + g.lang.passwordsjs.PCTOURNEXT + '</button></div></div>',
                title: 'Unused',
                content: g.lang.passwordsjs.PCTOURSTEP5 //'Once you sign out, your passwords and data are safe.<br>In case you forget to sign out, you will automatically be signed out according to the specified time at the Sign in page.'
            },
            { // Step 6
                element: '#buttonaddnew',
                placement: 'right',
                template: '<div class="popover tour"><div class="arrow"></div><div class="popover-content"></div><div class="popover-navigation"><button class="hide-tips" data-role="end"><i class="fa fa-minus-circle"></i> ' + g.lang.passwordsjs.PCTOURHIDETIPS + '</button><button class="btn btn-default button" data-role="next">' + g.lang.passwordsjs.PCTOURNEXT + '</button></div></div>',
                title: 'Unused',
                content: g.lang.passwordsjs.PCTOURSTEP6 //'Start by creating your passwords here; you can assign a tag for each password. This will help you to find and sort through them later on.'
            },
            { // Step 7
                element: '#buttongroups',
                placement: 'right',
                template: '<div class="popover tour"><div class="arrow"></div><div class="popover-content"></div><div class="popover-navigation"><button class="hide-tips" data-role="end"><i class="fa fa-minus-circle"></i> ' + g.lang.passwordsjs.PCTOURHIDETIPS + '</button><button class="btn btn-default button" data-role="next">' + g.lang.passwordsjs.PCTOURNEXT + '</button></div></div>',
                title: 'Unused',
                content: g.lang.passwordsjs.PCTOURSTEP7 //'This is where you create your tags for each password. You can easily make tags for your social media accounts, work accounts, mobile device accounts, and so on.'
            },
            { // Step 8
                orphan: true,
                template: '<div class="last-step popover tour"><div class="popover-content"></div><div class="popover-navigation"><button class="btn btn-default button floatRight" data-role="end">' + g.lang.passwordsjs.PCTOUROKGOTIT + '</button></div></div>',
                title: 'Unused',
                content: g.lang.passwordsjs.PCTOURSTEP8 + '<br><br>' //'If you have any questions or comments, please let us know. We are right here to serve and protect you and your data. <br><br>'
            }
        ],
        onEnd: function(guidedTour) {
            showLoginPopups();
        }
    });
    guidedTour.init().start(true).goTo(0);

    $(document).keyup(function(e) {
        if (e.keyCode == $.ui.keyCode.ESCAPE) {
            guidedTour.end();
        }
    });
}

function curlpwncheck(email, callback) {
    pcrypt.jsoncom('POST', gpcrypt.basefolder + 'pwncheck.php?auth=' + pcrypt.getvalue('authsession'), email, function pwncheckfunction(http) {
        if (http.status == 200) {
            try {
                callback(pcrypt.jsonparse(http.responseText));
            } catch (e) {
                console.log(e);
            }
        } else {
            modalalert('Service not available now. ' + http.status, g.lang.default.PCPROGRAMTITLE);
        }
    });
}

/**
 * @description greys upload button and turns down its opacity
 * @param {Object} passdata // Information about the pass
 * @param {Boolean} readonly // For checking wether the modal is read only
 */
function greyUploadButton(passdata, readonly) {
    // Count if a user has shares
    var sharesCounter = 0;
    // Check if passdata exists
    if (passdata !== null) {
        if ("shares" in passdata) {
            sharesCounter = Object.keys(passdata.shares).length;
        }
    }
    // If user isn't premium and has shares on a given password.
    // Lower the opacity of the icon.
    // Also ensure that passdata shares exist.

    if (pcrypt.getvalue('premium') <= 0 && (sharesCounter > 0 || readonly === true)) {
        document.getElementById('buttonfileupload').style.opacity = 0.5;
    } else // Else reset the opacity (because it's the same element no matter which password you look at)
    {
        document.getElementById('buttonfileupload').style.opacity = 1;
    }

}


/**
 * Check if first login and that the element with .popover doesn't already exist
 */
if (localStorage['firstlogin'] === "false" && document.querySelector('.popover') === null) {
    showLoginPopups();
}

/**
 * Shows popups at login depending on the user's "account state" (unverified email, etc.)
 */
function showLoginPopups() 
{
  if (typeof pcrypt.getvalue('created') !== 'string') 
  {
    return;
  }

  if (pcrypt.getvalue('created') === 'undefined') 
  {
    return;
  }


  var popupRead = JSON.parse(window.localStorage.getItem('popupRead'));
  var trialDays = pcrypt.getvalue('trialpremium');
  var emailConfirmed = parseInt(pcrypt.getvalue('emailconfirm'));
  var isPremium = pcrypt.getvalue('premium');

  if(popupRead)
  {
    return;
  }

  if (emailConfirmed !== 0) 
  {
    // User isn't premium
    if (isPremium < 1 &&  g.lang.html.PCNOPREMIUMPOPUP !== 'undefined') 
    {
      popupCall('nopremium');

      window.localStorage.setItem('popupRead', 'true');
      return;
    }

    let loginCount = Number(pcrypt.getvalue('logins'));
    let showTrialPopup = false;
    
    if(!isNaN(loginCount) && loginCount % 10 == 0 || loginCount == 1)
    {
      showTrialPopup = true;
    }

    // If on premium trial.
    if (emailConfirmed !== 0 && isPremium > 0 && pcrypt.getvalue('trialpremium') >= 1 && g.lang.html.PCPOPUPTRIAL !== 'undefined' && showTrialPopup) 
    {
      popupCall('trial', trialDays);

      window.localStorage.setItem('popupRead', 'true');
      return;
    }
  } 
  else 
  { // If user's email is unverified. Make popups appear if a user attempts to click the messages or team header buttons.
    var aElementInboxHeader = document.getElementById('header_inbox_bar').childNodes[1];
    var aElementNotificationHeader = document.getElementById('header_notification_bar').childNodes[1];

    if (aElementInboxHeader !== null) 
    {
      aElementInboxHeader.style.cursor = 'pointer';
      aElementInboxHeader.removeAttribute('href');
      aElementInboxHeader.addEventListener('click', function(event) 
      {
        event.preventDefault();

        popupCall('unverified');
        return;
      });
    }

    if (aElementNotificationHeader !== null) 
    {
      aElementNotificationHeader.style.cursor = 'pointer';
      aElementNotificationHeader.removeAttribute('href');
      aElementNotificationHeader.addEventListener('click', function(event) 
      {
        event.preventDefault();

        popupCall('unverified');
        return;
      });
    }

    if (g.lang.html.PCPOPUPUNVERIFIEDHEAD !== 'undefined') 
    {
      popupCall('unverified');
      window.localStorage.setItem('popupRead', 'true');
      return;
    }

    var closeDialogButton = document.getElementsByClassName('ui-dialog-titlebar-close')[0];
    let loginCount = Number(pcrypt.getvalue('logins'));
    let showTrialPopup = false;
    
    if(!isNaN(loginCount) && loginCount % 10 == 0 || loginCount == 1)
    {
      showTrialPopup = true;
    }

    if(closeDialogButton && trialDays >= 0 & showTrialPopup) 
    {
      closeDialogButton.addEventListener('click', function() 
      {
        popupCall('trial', trialDays);
        let popupButtonBuy = document.getElementById('PCPOPUPBUTTONBUY');
        popupButtonBuy ? popupButtonBuy.innerHTML = g.lang.popup.PCPOPUPBUTTONBUY : null;
        return;
      });
    }
  }
};

/**
 * Resend the verification email.
 */
function resendEmail() 
{
  var langcode = localStorage['languagecode'] || navigator.language || navigator.userLanguage || 'en';
  var uEmail = pcrypt.getvalue('email');
  pcrypt_resend(pcrypt.getvalue('session'), uEmail, langcode, 0, function resendverificationfunc(data, error, id) 
  {
    if (error) 
    {
      switch (error) 
      {

        case 13:
          modalalert('Mailing error', g.lang.default.PCPROGRAMTITLE);
          break;

        default:
          handlepcrypterror(error, data);
          break;
      }
    }
  });
}
/**
 * Function for showing popups on the passwords page
 * @param {string} popupCalled specify the popup that should be called.
 * @param {Any} valToPopup Other parameter(s) you need passed.
 */
function popupCall(popupCalled, valToPopup) 
{
  // Check that no other "popup", "modal", etc is displayed.
  let currentDialogs = document.querySelectorAll('div[role="dialog"]');
  if(currentDialogs.length > 0)
  {
    return;
  }

  switch (popupCalled) 
  {
    case 'unverified':
      {
        modalalert('<div class="popup">' + g.lang.html.PCPOPUPUNVERIFIEDHTML + '</div>', g.lang.default.PCPROGRAMTITLE);
        hideButtonpane();
        document.getElementById('PCPOPUPBUTTONCHANGE').innerHTML = g.lang.popup.PCPOPUPBUTTONCHANGE;
        document.getElementById('resendEmailBtn').innerHTML = g.lang.popup.PCPOPUPBUTTONRESEND;
        document.getElementById("resendEmailBtn").addEventListener('click', function() 
        {
          resendEmail();
        });
      }
      break;

    case 'nopremium':
      {
        modalalert('<div class="popup">' + g.lang.html.PCPOPUPNOPREMIUMHTML + '</div>', g.lang.default.PCPROGRAMTITLE);
        let popupButtonBuy = document.getElementById('PCPOPUPBUTTONBUY');
        popupButtonBuy ? popupButtonBuy.innerHTML = g.lang.popup.PCPOPUPBUTTONBUY : null;
        hideButtonpane();
      }
      break;

    case 'trial': 
      {
        modalalert('<div class="popup">' + g.lang.html.PCPOPUPTRIALHTML + '</div>', g.lang.default.PCPROGRAMTITLE);
        let dayCount = document.getElementById('day-count');
        dayCount ? dayCount.innerHTML = valToPopup + ' ' : null;
        let popupButtonBuy = document.getElementById('PCPOPUPBUTTONBUY');
        popupButtonBuy ? popupButtonBuy.innerText = g.lang.popup.PCPOPUPBUTTONBUY : null;
        hideButtonpane();
      }
      break;

    case 'repeatPass':
      {
        modalalert(g.lang.passwordsjs.PCPASSWORDSWARNINGTEXT, g.lang.admin.PCADMINMESSAGESDELETEWARNING);
      }
      break;

    default:
      break;
  }
}


function warningAlert(dataInfo)
{
  var returnValue = '';
  switch(dataInfo)
  {
    case '0':
    case '10':
      returnValue = g.lang.passwords.PCPASSWORDSWARNINGREOCCURRING;
    break;

    case '1':
      returnValue = g.lang.passwords.PCPASSWORDSWARNINGWEAKPASS;
    break;
  }
  return returnValue;
}

function editPassSecurityCheck()
{
  var passfield = document.getElementById('passfield');
  var passStrength = passwordstrength(passfield.value, passfield);
  var occurrenceCount = 0;
  var warning = '';
  g.pass.forEach(function(pass)
  {
    if(pass.pass == passfield.value)
    {
      occurrenceCount += 1;
    }
  });

  if(occurrenceCount > 1 && passStrength < 3)
  {
    warning = '10';
  }
  else if(occurrenceCount < 2 && passStrength < 3)
  {
    warning = '1';
  }
  else if(occurrenceCount > 1 && passStrength > 2)
  {
    warning = '0';
  }

  var passWarning = document.getElementById('warning-display-showpass');

  switch (warning) 
  {
    case '0':
    case '1':
    case '10':
      passWarning.classList.remove('realnone');
      passWarning.classList.add('customtooltip');
      passWarning.setAttribute('title', warningAlert(warning));

      $(".customtooltip").tooltip(
      {
        content: function ()
        {
          return this.getAttribute("title");
        }
      });
    break;

    default:
      passWarning.classList.add('realnone');
      passWarning.classList.remove('customtooltip');
      passWarning.removeAttribute('title');
      $(".customtooltip").tooltip(
      {
        content: function ()
        {
          return this.getAttribute("title");
        }
      });
    break;
  }
}

/**
 * @description populates the filter table, based on chosen category, with checkboxes and their functionality
 * @param {string} filterName 
 */
function populatefilterpass(filterName)
{
  let filter_list_container = document.getElementById('filter_list-container');
  let filter_search = document.getElementById('filter_search');
  let tablearrayheader = [
    ["<input type='checkbox' id='selall_filter' name='selall_filter' value='1'>", 
    "data-sort-method='none' style='width: 22px;'"],
  ];
  let htmlarray = [];

  if(!g.filter)
  {
    g.filter = {};
  }

  while(filter_list_container.firstChild)
  {
    filter_list_container.firstChild.remove();
  }

  if(filter_search && filter_search.value.length > 0)
  {
    filter_search.value = '';
    filter_search.nextSibling.style.display = 'none';
  }

  switch(filterName)
  {
    case 'pos':
      {
        let filtermenuPos = document.getElementById('filtermenu-pos');
        if(!g.filter.pos) // Create position filter
        {
          g.filter.pos = [];
        }
        if(event && !event.ctrlKey)
        {
          removeHighlightOnMenuItems();
        }
        
        loader(true);
        getcurrentlocation(function callback(locinfo) 
        {
          if (locinfo) 
          {
            validatepasspos(locinfo);
            reversegeocode(locinfo, (text) => {
              let newObject = {};
              newObject.text = text;
              newObject.lat = locinfo.lat;
              newObject.long = locinfo.long;
              newObject.acc = locinfo.acc;
              let coordHash = pcrypt.sha256(JSON.stringify(newObject));
              let filterContainer = document.getElementById('div_filtercontainer');
              let filterFrame = document.getElementById('div_filterframe');
              if(g.filter.pos.indexOf(coordHash) == -1)
              {
                let filter_bean = document.createElement('DIV');
                filter_bean.classList.add('filter-bean', filterName);
                filter_bean.dataset.filterid = filterName + ':' + coordHash;
                filter_bean.innerText = "Current position"; // TODO lang reference
                filter_bean.title = "Current position";

                filter_bean.onclick = (event) => {
                  event.preventDefault();

                  g.filter.pos.splice(g.filter.pos.indexOf(coordHash), 1)
                  event.target.remove();
                  
                  if(filterContainer.children.length == 0 )
                  {
                    filterFrame.classList.add('hidden');
                  }
                  
                  filtermenuPos.classList.remove('active');
                  showpass(g.gidshown);
                  filterMenuUpdateCounters();
                };
  
                filterContainer.append(filter_bean);
                filterFrame.classList.remove('hidden');
  
                g.filter.pos.push(coordHash);
                filtermenuPos.classList.add('active');
              }
              else
              {
                g.filter.pos.splice(g.filter.pos.indexOf(coordHash), 1);
  
                filterContainer.querySelector('[data-filterid="' + filterName + ':' + coordHash + '"').remove();
                
                if(filterContainer.children.length == 0 )
                {
                  filterFrame.classList.add('hidden');
                }

                filtermenuPos.classList.remove('active');
              }
              loader(false);
              showpass(g.gidshown);
            });
          }
        });
      }
      break;

    case 'tags':
      {
        let tmpCheckArr = [] // Temporary container for positions to test if they already exist in the htmlarray
        tablearrayheader.push([g.lang.passwords.PCPASSWORDFILTERTAGS, ""]);
        
        if(!g.filter.tags) // create Tag filter
        {
          g.filter.tags = [];
        }

        htmlarray = g.groups.reduce((acc, group, i) => 
        {
          if(group.id)
          { 
            let liexists = document.querySelectorAll(`li[data-index="${group.id}"]`)
            if(tmpCheckArr.indexOf(group.name) == -1 && liexists.length == 0)
            {
              let  li = document.createElement('LI');
              li.dataset.name = htmlspecialchars(filterName, ['ENT_QUOTES']);
              li.dataset.index = group.id;
              g.filter[filterName].indexOf(group.id) > -1 ? li.classList.add('active') : null;
              li.value = i;
              li.innerText = htmlspecialchars(group.name, ['ENT_QUOTES']);
              acc.push( li );
              tmpCheckArr.push(group.name);
            }
          }
          return acc
        }, []);
      }
      break;
    
    case 'teamshares':
      {
        tablearrayheader.push([g.lang.passwords.PCPASSWORDFILTERTEAMSHARES, ""]);
        let tmpCheckArr = [] // Temporary container for positions to test if they already exist in the htmlarray
        let userid = pcrypt.getvalue('userid');
        
        if(!g.filter.teamshares)
        {
          g.filter.teamshares = [];
        }

        for(let i = 0, i_len = g.pass.length; i < i_len; i++)
        {
          let teamshares = g.pass[i].shares['0'];
          if(teamshares)
          {
            htmlarray = htmlarray.concat(teamshares.reduce((acc, teamshare, i) => 
            {
              if(tmpCheckArr.indexOf(teamshare) == -1)
              {
                let  li = document.createElement('LI');
                li.dataset.name = htmlspecialchars(filterName, ['ENT_QUOTES']);
                li.dataset.index = g.teamobject[userid][teamshare].teamid;
                g.filter[filterName].indexOf(li.dataset.index) > -1 ? li.classList.add('active') : null;
                li.value = i;
                li.innerText = htmlspecialchars(g.teamobject[userid][teamshare].teamname, ['ENT_QUOTES']);
                acc.push( li );
                tmpCheckArr.push(teamshare);
              }
              return acc;
            }, []));
          }
        }

        for(let i = 0, i_len = g.shares.length; i < i_len; i++)
        {
          let shareObject = g.shares[i];
          if(shareObject.type == 'teamshare')
          {
            let teamId = shareObject.teamid;
            if(tmpCheckArr.indexOf(teamId) == -1)
            {
              let  li = document.createElement('LI');
              li.dataset.name = htmlspecialchars(filterName, ['ENT_QUOTES']);
              li.dataset.index = teamId;
              g.filter[filterName].indexOf(teamId.toString()) > -1 ? li.classList.add('active') : null;
              li.value = i;
              li.innerText = htmlspecialchars(shareObject.teamname, ['ENT_QUOTES']);
              tmpCheckArr.push(teamId);
              htmlarray.push( li );
            }
          }
        }
      }
      break;

    case 'usershares':
      {
        if(g.pass.length < 1)
        {
          return;
        }

        let tmpCheckArr = []; // Temporary container for positions to test if they already exist in the htmlarray
        let teamusers = Object.getOwnPropertyNames(g.teamobject);

        tablearrayheader.push([g.lang.passwords.PCPASSWORDFILTERUSERSHARES, ""]);

        if(!g.filter.usershares)
        {
          g.filter.usershares = [];
        }

        for(let i = 0, i_len = g.pass.length; i < i_len; i++)
        {
          let pass = g.pass[i];
          let shares = pass.shares;
          let shareKeys = Object.getOwnPropertyNames(g.pass[i].shares);
          for(let j = 0, j_len = shareKeys.length; j < j_len; j++)
          {
            let userid = shareKeys[j];
            
            if(userid == "0" || teamusers.indexOf(userid)  == -1)
            {
              continue;
            }

            if(shares[userid].length > 0 && tmpCheckArr.indexOf(userid) == -1 && pcrypt.getvalue('userid') !== userid)
            {
              tmpCheckArr.push(userid);
              let  li = document.createElement('LI');
              let teammember = g.teamobject[userid];
              li.dataset.name = htmlspecialchars(filterName, ['ENT_QUOTES']);
              li.dataset.index = userid;
              g.filter[filterName].indexOf(userid) > -1 ? li.classList.add('active') : null;
              li.value = i;
              li.innerText = htmlspecialchars(teammember.email, ['ENT_QUOTES'])
              htmlarray.push(li);
            }
          }
        }

        for(let i = 0, i_len = g.shares.length; i < i_len; i++)
        {
          let shareObject = g.shares[i];
          if(shareObject.type == 'usershare')
          {
            let userid = shareObject.userid.toString();
            if(tmpCheckArr.indexOf(userid) == -1)
            {
              tmpCheckArr.push(userid);
              let  li = document.createElement('LI');
              let teammember = g.teamobject[userid];
              li.dataset.name = htmlspecialchars(filterName, ['ENT_QUOTES']);
              li.dataset.index = userid;
              g.filter[filterName].indexOf(userid) > -1 ? li.classList.add('active') : null;
              li.value = i;
              li.innerText = htmlspecialchars(teammember.email, ['ENT_QUOTES'])
              htmlarray.push( li );
            }
          }
        }
      }
      break;

      case 'other':
        {
          tablearrayheader.push(["Other", ""]);
  
          if(!g.filter.other)
          {
            g.filter.other = [];
          }
  
          htmlarray = [];
          let validKeys = ['undef', 'own', 'outshare', 'inshare', 'newshare', 'alarm'/*, 'security'*/]
          for(let i = 0, i_len = validKeys.length; i < i_len; i++)
          {
            let  li = document.createElement('LI');
            let key = validKeys[i];
            if(typeof g.fillgroupoptions[key] != 'string')
            {
              continue;
            }
            
            li.innerText = g.fillgroupoptions[key];
            li.dataset.name = htmlspecialchars(filterName, ['ENT_QUOTES']);
            li.dataset.index = htmlspecialchars(key, ['ENT_QUOTES']);
            g.filter[filterName].indexOf(li.dataset.index) > -1 ? li.classList.add('active') : null;
            htmlarray.push(li);
          }
        }
        break;

    default:
      {

      }
      break;
  }

  for(let i = 0, i_len = htmlarray.length; i < i_len; i++)
  {
    filter_list_container.appendChild(htmlarray[i]);
  }
  
  let listChildren = document.getElementById('filter_list-container').querySelectorAll('li');
  
  for(let i = 0, i_len = listChildren.length; i < i_len; i++)
  {
    listChildren[i].addEventListener('click', (event) => 
    {
      let targetData = event.target.dataset;
      let name = htmlspecialchars(targetData.name, ['ENT_QUOTES']);
      let index = targetData.index;
      if(g.filter[name].indexOf(index) == -1)
      {
        event.target.classList.add('active');
        g.filter[name].push(index);
        let filterBean = document.createElement('div');
        switch (name) 
        {
          case 'pos':
            let splitindex = targetData.pindex.split(',');
            filterBean.innerText = htmlspecialchars('position: ' + g.pass[splitindex[0]].pos[splitindex[1]].text, ['ENT_QUOTES']);
            filterBean.title = htmlspecialchars(g.pass[splitindex[0]].pos[splitindex[1]].text, ['ENT_QUOTES']);
            break;

          case 'tags':
            let tagName = "";
            for(let j = 0, j_len = g.groups.length; j < j_len; j++)
            {
              if(g.groups[j].id == index)
              {
                tagName = htmlspecialchars(g.groups[i].name, ['ENT_QUOTES']);
                j = j_len;
              }
            }
            filterBean.innerText = htmlspecialchars(tagName, ['ENT_QUOTES']);
            filterBean.title = htmlspecialchars(g.lang.passwords.PCPASSWORDFILTERTAGS + ': ' + tagName, ['ENT_QUOTES']);
            break;

          case 'usershares':
            filterBean.innerText = htmlspecialchars(g.teamobject[index].email, ['ENT_QUOTES']); 
            filterBean.title = htmlspecialchars(g.lang.passwords.PCPASSWORDFILTERUSERSHARES + ': ' + g.teamobject[index].email, ['ENT_QUOTES']); 
            break;

          case 'teamshares':
            filterBean.innerText = htmlspecialchars(g.teamobject[pcrypt.getvalue('userid')][index].teamname, ['ENT_QUOTES']);
            filterBean.title = htmlspecialchars(g.lang.passwords.PCPASSWORDFILTERTEAMSHARES + ': ' + g.teamobject[pcrypt.getvalue('userid')][index].teamname, ['ENT_QUOTES']);
            break;

          case 'other':
              filterBean.innerText = htmlspecialchars(g.fillgroupoptions[index], ['ENT_QUOTES']);
              filterBean.title = htmlspecialchars(g.lang.passwords.PCPASSWORDFILTEROTHER + ': ' + g.fillgroupoptions[index], ['ENT_QUOTES']);
              break;
        
          default:
            break;
        }
        
        filterBean.dataset.filterid = name + ':' + index;
        filterBean.classList.add('filter-bean', name);
        
        document.getElementById('div_filtercontainer').appendChild(filterBean);
        document.getElementById('div_filterframe').classList.remove('hidden');
        
        filterBean.onclick = (event) => 
        {
          let filterinfo = event.target.dataset.filterid.split(':');
          let filterContainer = document.getElementById('div_filtercontainer');

          g.filter[filterinfo[0]].splice(g.filter[filterinfo[0]].indexOf(filterinfo[1]), 1);
          event.target.remove();

          if(filterContainer.children.length < 1)
          {
            document.getElementById('div_filterframe').classList.add('hidden');
          }
          
          showpass(g.gidshown);
        }
      }
      else
      {
        if(g.filter[name].indexOf(index) > -1)
        {
          g.filter[name].splice(g.filter[name].indexOf(index), 1);
          event.target.classList.remove('active');
          let li_elements = document.querySelectorAll('[data-filterid="'+name+':'+index+'"]');
          for(let j = 0, j_len = li_elements.length; j < j_len; j++)
          {
            li_elements[j].remove();
          }
        }
      }
      
      if(!event.ctrlKey)
      {
        removeHighlightOnMenuItems();  
      }

      showpass(g.gidshown);
      clearFiltercontainer();
      filterMenuUpdateCounters();
    });
  }
  
  tablesearch();
}

/**
 * Display the chosen filtermenu, hide all others
 * @param {string} show id of filter menu to show, hide all others.
 * If null or undefined hide all.
 */
function togglefilterpass(show)
{
  let filterpass = document.getElementById('filterpass-select');
  let filterselect_menu = document.getElementById('filterselect-menu');

  filterselect_menu.classList.add('hidden');

  // Update position of filter select menu
  let coords = document.getElementById('filtermenu-pos').getBoundingClientRect();
  filterpass.style.top =  coords.y + 'px';
  filterpass.style.left = coords.x + coords.width + 'px';
  
  populatefilterpass(show);

  if(show && show !== 'pos')
  {
    filterpass.classList.remove('hidden');
    filterselect_menu.classList.remove('hidden');
  }
  else  
  {
    filterpass.classList.add('hidden');
  }
}

/**
 * @description Check if a password can pass through all active filters.
 * @param {object} pass password object to check against filter
 * @returns {boolean} true if the password should pass through, otherwise false.
 */
function filterCheck(pass)
{
  if(typeof pass !== 'object')
  {
    return false;
  }
  
  
  if(!g.filter) // No filter, let anything pass through
  {
    return true;
  }
  
  let filterCategories = Object.getOwnPropertyNames(g.filter);
  if(filterCategories.length < 1)
  {
    return true;
  }

  let filterCount = 0; // How many filters are active in total?
  let filtersPassed = 0; // Filters the password has gone through successfully

  for(let i = 0, i_len = filterCategories.length; i < i_len; i++)
  {
    let category = filterCategories[i];
    let filter = g.filter[category];
    let filterLength = filter.length;

    if(filter.length < 1)
    {
      continue;
    }

    filterCount = filterCount + filterLength;

    if(filterLength < 1)
    {
      continue;
    }

    switch (category)
    {
      case 'pos':
        if(pass.pos && pass.pos.length > 0)
        {
          for(let j = 0, j_len = pass.pos.length; j < j_len; j++)
          {
            let coordHash = pass.pos[j];
            coordHash = pcrypt.sha256(JSON.stringify(coordHash));
            if(filter.indexOf(coordHash) > -1)
            {
              filtersPassed++;
            }
          }
        }
        break;

      case 'tags':
        if(pass.gid)
        {
          for(let j = 0, j_len = filterLength; j < j_len; j++)
          {
            if(pass.gid.indexOf(filter[j]) > -1)
            {
              filtersPassed++;
            }
          }
        }
        break;

      case 'teamshares':
        if(pass.shares && pass.shares['0'])
        {
          let teamshares = pass.shares['0'];
          for(let j = 0, j_len = filterLength; j < j_len; j++)
          {
            if(teamshares.indexOf(Number(filter[j])) > -1)
            {
              filtersPassed++;
            }
          }
        }

        if(pass.share && pass.share.type && pass.share.type == 'teamshare')
        {
          if(filter.indexOf(pass.share.teamid.toString()) > -1)
          {
            filtersPassed++;
          }
        }
        break;
        
      case 'usershares':
        if(pass.shares)
        {
          for(var j = 0, j_len = filterLength; j < j_len; j++)
          {
            if(pass.shares[filter[j]])
            {
              filtersPassed++;
            }
          }
        }

        if(pass.share && pass.share.type == 'usershare')
        {
          if(filter.indexOf(pass.share.userid.toString()) > -1)
          {
            filtersPassed++;
          }
        }
        break;
        
      case 'other':
        for(let j = 0, j_len = filterLength; j < j_len; j++)
        {
          let activeFilter = filter[j];
          switch (activeFilter) {
            case 'undef':
              if(pass.gid.length < 1 || !pass.gid)
              {
                filtersPassed++;
              }
              break;
            
            case 'own':
              if(pass.shares)
              {
                filtersPassed++;
              }
              break;

            case 'outshare':
              if(pass.shares && Object.getOwnPropertyNames(pass.shares).length > 0)
              {
                filtersPassed++;
              }
              break;

            case 'inshare':
              if(pass.share)
              {
                filtersPassed++;
              }
              break;
            
            case 'alarm':
              if(typeof pass.alarm == 'number')
              {
                let currenttime = (new Date()).getTime();
                if(pass.alarm && (pass.alarm <= currenttime))
                {
                  filtersPassed++;
                }
              }
              break;
            
            default:
              break;
          }
        }
        break;
        
      default:
        break;
    }
  }

  return (filtersPassed == filterCount);
}

function clearfilter()
{
  let filterCategories = Object.getOwnPropertyNames(g.filter);
  for(let i = 0, i_len = filterCategories.length; i < i_len; i++)
  {
    let category = filterCategories[i];
    g.filter[category] = [];
  }

  document.getElementById('filtermenu-pos').classList.remove('active');

  clearFiltercontainer(true);
}

function clearFiltercontainer(force = false)
{
  let filterContainer = document.getElementById('div_filtercontainer');
  let filterFrame = document.getElementById('div_filterframe');
  
  if(force == true)
  {
    while(filterContainer.children.length > 0)
    {
      filterContainer.children[0].remove();
    }
  }

  if(filterContainer.children.length < 1)
  {
    filterFrame.classList.add('hidden');
  }

  filterMenuUpdateCounters();
  showpass(g.gidshown);
}

function filterMenuUpdateCounters()
{
  let filterCategories = Object.getOwnPropertyNames(g.filter);

  for(let i = 0, i_len = filterCategories.length; i < i_len; i++)
  {
    let filterCategory = filterCategories[i];
    let filter = g.filter[filterCategory];
    if(filter && filter.length > 0)
    {
      let counterContainer = document.getElementById('filtercount-'+filterCategory);
      if(counterContainer)
      {
        counterContainer.innerText = htmlspecialchars(filter.length, ['ENT_QUOTES']);
        counterContainer.classList.remove('hidden');
      }
    }
    else
    {
      let counterContainer = document.getElementById('filtercount-'+filterCategory);
      if(counterContainer)
      {
        counterContainer.classList.add('hidden');
      }
    }
  }
}

/**
 * Update the passgrid to display weak and reoccurring passwords.
 * 
 */
function securityPassGridCheck()
{
  let passwords = g.pass;
  let passgrid = document.getElementById("passwordgrid");
  let occurrences = getPassOccurrence(passwords);
  
  for(let i = 0, i_len = passwords.length; i < i_len; i++)
  {
    let passwordObj = passwords[i];
    
    if(passwordObj.pass.length < 1)
    {
      continue;
    }

    let passStrength = passwordstrength(passwordObj.pass, null);
    let reoccurring = false;

    for(let j = 0, j_len = occurrences.length; j < j_len; j++)
    {
      let occurrance = occurrences[j];
      if(occurrance.count > 1 && occurrance.occurrences.indexOf(passwordObj.id) > -1)
      {
        reoccurring = true;
      }
    }

    if(passStrength < 2 || reoccurring)
    {
      let selectbox = passgrid.querySelector("input[type='checkbox'][name='"+i+"']"); // To find the TR we're looking for.
      
      if(!selectbox)
      {
        continue;
      }

      let tdForPass = selectbox.parentElement.parentElement.querySelector("td:nth-child(4)");
      
      if(reoccurring)
      {
        tdForPass.title = g.lang.passwords.PCPASSWORDSWARNINGREOCCURRING + "\n";
        tdForPass.classList.add('reoccurring');
      }

      if(passStrength < 2 )
      {
        tdForPass.title = tdForPass.title + g.lang.passwords.PCPASSWORDSWARNINGWEAKPASS;
        tdForPass.classList.add('weak');
      }
    }
  }
}