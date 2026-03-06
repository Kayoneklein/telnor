"use strict";

g.adminusers = [];
var adminPageStates = {};
adminPageStates.pageState = null;
adminPageStates.maxPages = 0;
adminPageStates.order = false;

$(document).ready(function() 
{
  var opts = pcrypt.getvalue('options');

  if (!opts.isglobaladmin) 
  {
    window.location.href = 'index.html?page=passwords';
  } 
  else 
  {
    // Make sure to update the globalmessages object when entering the page.
    pcrypt_getadminmaildata(pcrypt.getvalue('session'), true, 0, function(data, error, id)
    {
      if(error)
      {
        handlepcrypterror(error, data)
        if(error === 30)
        {
          window.location.replace('./index.html?page=passwords');
        }
        return;
      }
      
      g.globalMessages = data;
    });

    pcrypt.adminusercount(pcrypt.getvalue('session'), 0, function (data, error, id) 
    {
      if(error)
      {
        handlepcrypterror(error, data)
        return;
      }
      
      var displayNUsersElement = document.getElementById('display-n-users');
      var displayNUsers = Number(displayNUsersElement.options[displayNUsersElement.selectedIndex].value);
      var division = Number(data) / displayNUsers;
      var page = (Math.ceil(division));
      document.getElementById('display-max-page').innerText = (page < 2) ? 1 : page;
      adminPageStates.userCount = data;
      adminPageStates.maxPages = page;
    });

    // showing menuitems
    $("#users").parents().show();

    // click handlers for menuitems
    document.getElementById('users').onclick = function(event) 
    {
      event.preventDefault();
      var displayNPageElem = document.getElementById('display-n-page');
      displayNPageElem.innerText = 1;
      if(document.getElementById('userslist').style.display === 'none' || document.getElementById('userslist').children.length === 0)
      {
        loader(true);
        adminPageStates.order = false;
        displayUsersTable();
      }
      else
      {
        if(adminPageStates.order)
        {
          loader(true);
          adminPageStates.order = false;
          displayUsersTable();
        }
        else
        {
          updatemenu();
        }
      }
    };

    document.getElementById('globalmsgs').onclick = function(event)
    {
      event.preventDefault();
      updatemenu('globalmsgs');
    }

    $('ul.navigation li a').click(function() 
    {
      $('ul.navigation li a').removeClass('on');
      $(this).addClass('on');

      if ($(this).hasClass('open-log')) 
      {
        $('#menu-account-log').slideDown();
      } else {
        $('#menu-account-log').slideUp();
      }
    });

    document.querySelector('input[value="<<"]').onclick = function (e)
    {
      e.preventDefault();
      var displayNPage = document.getElementById('display-n-page');
      var displayNInnerText = Number(displayNPage.innerText);
      var searchInput = document.getElementById('searchuser').value;
      
      if(displayNInnerText>1)
      {
        displayNPage.innerText = displayNInnerText-1;
      }
      else
      {
        displayNPage.innerText = 1;
        return;
      }

      if(searchInput.length>0)
      {
        searchUserInit();
      }
      else
      {
        displayUsersTable();
      } 
    }

    document.querySelector('input[value=">>"]').onclick = function (e)
    {
      e.preventDefault(); 
      var displayNPage = document.getElementById('display-n-page');
      var displayNInnerText = Number(displayNPage.innerText);
      var maxPages     = document.getElementById('display-max-page').innerText;
      var searchInput  = document.getElementById('searchuser').value;
      
      if(displayNInnerText < maxPages)
      {
        displayNPage.innerText = displayNInnerText+1;
      }
      else
      {
        return;
      }

      if(searchInput.length>0)
      {
        searchUserInit();
      }
      else
      {
        displayUsersTable();
      }
    }

    document.getElementById('display-n-users').onchange = function (e)
    {
      e.preventDefault();

      var searchInput = document.getElementById('searchuser').value;
      document.getElementById('display-n-page').innerText = 1;
      if(searchInput.length>0)
      {
        searchUserInit();
      }
      else
      {
        displayUsersTable();
      }
      
    }

    var searchInputTimer = null;

    document.getElementById('searchuser').onkeyup = function()
    {
      clearTimeout(searchInputTimer);
      searchInputTimer = setTimeout(function()
      {
        if(adminPageStates.maxPages < 2)
        {
          document.getElementById('display-n-page').innerText = 1;
        }

        searchUserInit();
      }, 950);
    }

    document.getElementById('searchuser').onkeydown = function()
    {
      clearTimeout(searchInputTimer);
    }

    addClearSearchIcon('searchuser', searchUser);

    addClearSearchIcon('searchlog', searchLog);
    
    document.querySelector('#searchlog').onkeyup = function() 
    {
      searchLog();
    }

    addClearSearchIcon('searchmessages', searchMSG);
    
    document.querySelector('#searchmessages').onkeyup = function () 
    {
      searchMSG();
    }

    document.getElementById("newmsgbutton").addEventListener('click', function() 
    { 
      newmsg() 
    });

    document.getElementById('back-userlist-btn').addEventListener('click', function()
    {
      if(adminPageStates)
      {
        updatemenu('users');
      }
    });


    document.getElementById("deletemsgbutton").addEventListener('click', function() 
    {
      if(this.classList.contains('deactivated'))
      {
        return;
      }

      if(g.globalMessages.length>0)
      {
        var Allmessagecheckboxes = document.querySelectorAll('.messagecheckbox:checked');
        
        if(Allmessagecheckboxes.length < 1)
        {
          modalConfirmText(g.lang.admin.PCADMINNOMESSAGESSELECTED, g.lang.default.PCPROGRAMTITLE);
        }

        modalalert(g.lang.admin.PCADMINDELETINGMESSAGESWARNING, g.lang.admin.PCADMINMESSAGESDELETEWARNING, function()
        {  
          loader(true);
          
          for (var i = 0; i <= g.globalMessages.length; i++) 
          {
            var msgElement = document.getElementById('selectsingle'+i);
            if(msgElement !== undefined && msgElement !== null && msgElement.checked)
            {
              deleteMSGS(document.getElementById('selectsingle'+i).value);
            };
          };
          setTimeout(function ()
          {
            loader(false);
            displayMessagesTable();
          }, 250);
        });
      }
      else
      {
        modalalert(g.lang.adminjs.PCADMINNOGLOBALMSG, g.lang.default.PCPROGRAMTITLE);
      }
    });
    loader(false);
  }
});

function searchUser() 
{
  document.getElementById('display-max-page').innerText = (adminPageStates.maxPages < 2) ? 1 : adminPageStates.maxPages;
  var search = document.querySelector('#searchuser').value;
  if(search)
  {
    var shownrecords = tablesearch(document.getElementById('adminusersgrid'), null, search);
    document.getElementById('statustext').innerHTML = g.lang.passwordsjs.PCPASSWORDSRECORDCOUNTTEXT + ": " + shownrecords + '/' + adminPageStates.userCount;
  }
  else
  {
    displayUsersTable();
  }
}

function searchLog() 
{
  tablesearch(document.getElementById('loggrid'), null, document.querySelector('#searchlog').value);
}

function searchMSG()
{
  var shownmessages = tablesearch(document.getElementById('globalmsgAdmingrid'), null, document.querySelector('#searchmessages').value);
}


function getUserActions(i) 
{
  var actions = [];
  actions.push('<input id="delete' + i + '" title="' + g.lang.adminjs.PCADMINDELETEUSER + '" type="button" class="icon_delete" data-index="' + i + '" />');
  actions.push('<input id="log' + i + '" title="' + g.lang.adminjs.PCADMINSHOWLOG + '" type="button" class="icon_show_log" data-index="' + i + '" />');
  return actions.join(' ');
}
/**
 * 
 * @param {integer} pageNumber page number
 * @param {integer} usersNumber How many users to display per page 
 */
function displayUsersTable()
{
  loader(true);

  pcrypt.adminusercount(pcrypt.getvalue('session'), 0, function (data, error, id) 
  {
    if(error)
    {
      handlepcrypterror(error, data)
      return;
    }

    var displayNUsersElement = document.getElementById('display-n-users');
    var displayNUsers = Number(displayNUsersElement.options[displayNUsersElement.selectedIndex].value);
    var division = Number(data) / displayNUsers;
    var page = (Math.ceil(division));
    document.getElementById('display-max-page').innerText = page;
    adminPageStates.maxPages = page;
    // document.getElementById('display-n-page').innerText = 1; // ERROR
  });

  pcrypt.getadminusers(pcrypt.getvalue('session'), true, 'pcryptusers', 'users', adminPageStates.order,  function(users) 
  {
    if(users === undefined || users === null || !Array.isArray(users))
    {
      loader(false);
      var pageNum = document.getElementById('display-n-page').innerText;
      pageNum = pageNum - 1 > 0 ? pageNum - 1 : 0;
      document.getElementById('display-n-page').innerText = pageNum;
      return;
    }

    g.adminusers = users;
    
    if(users && users.reduce)
    {
      var htmlArray = users.reduce(function(acc, user, i) 
      {
        acc.push([
          '<input type="checkbox" name="selectedUsers[]" value="' + i + '">',
          htmlspecialchars(user.email, ['ENT_QUOTES']),
          htmlspecialchars(user.name, ['ENT_QUOTES']),
          htmlspecialchars(user.department, ['ENT_QUOTES']),
          user.last_login,
          user.created,
          user.logins,
          getUserActions(i)
        ]);
        return acc;
      }, []);
    }

    var tableHeaderArray = [
      [
        '<input type="checkbox" id="selall" name="selall" value="1">', 
        'data-sort-method="none" style="width: 22px;"'
      ],
      [g.lang.adminjs.PCADMINEMAILLABEL, "data-sort-method='none' id='user-sort-email' class='admin-sort'"],
      [g.lang.adminjs.PCADMINNAMELABEL, "data-sort-method='none' id='user-sort-name' class='admin-sort'"],
      [g.lang.adminjs.PCADMINDEPARTMENTLABEL, "data-sort-method='none' id='user-sort-department' class='admin-sort'"],
      [g.lang.adminjs.PCADMINLASTLOGINLABEL, "data-sort-method='none' id='user-sort-lastlogin' class='admin-sort'"],
      [g.lang.adminjs.PCADMINREGISTRATIONDATELABEL, "data-sort-method='none' id='user-sort-date' class='registration-date admin-sort'"], // g.lang.adminjs.PCADMINREGISTRATIONDATE
      [g.lang.adminjs.PCADMINLOGINSLABEL, "data-sort-method='none' id='user-sort-logins' class='admin-sort'"],
      [g.lang.adminjs.PCADMINACTIONLABEL, "data-sort-method='none'"],
    ];

    document.getElementById('userslist').innerHTML = buildtable(
      tableHeaderArray,
      null,
      htmlArray,
      'adminusersgrid',
      'adminusers table-bordered table-max-width table-white'
    );

    var adminusersgrid = document.querySelector('#adminusersgrid');
    new Tablesort(adminusersgrid);

    adminusersgrid.addEventListener('afterSort', function() 
    { 
      tablesetbackgroundcolor(adminusersgrid); 
    });

    document.querySelectorAll('#adminusersgrid input.icon_delete').forEach(function(elm) 
    {
      $(elm).bind('click', function(e)
      {
        var user = g.adminusers[$(this).attr('data-index')].email
        if (user === pcrypt.getvalue('email'))
        {
          modalalert(g.lang.adminjs.PCADMINUSERNODELETESELF, g.lang.default.PCPROGRAMTITLE);
          return;
        }
        deleteUsers([user]);
      });
    });

    document.querySelectorAll('#adminusersgrid input.icon_show_log').forEach(function(elm)
    {
      $(elm).bind('click', function()
      {
        var userId = g.adminusers[$(this).attr('data-index')].id
        showLog(userId);
      });
    });

    document.querySelectorAll('#adminusersgrid [name="selectedUsers[]"]').forEach(function(elm) 
    {
      elm.onchange = function(e) 
      {
        setMenulinkState();			
      }
    });
    
    document.querySelector('#selall').onchange = function(e) 
    {
      document.querySelectorAll('#adminusersgrid [name="selectedUsers[]"]').forEach(function(elm) 
      {
        elm.checked = e.target.checked;
      });
      setMenulinkState();			
    };

    document.querySelector('#deleteusers').onclick = function(e) 
    {
      if ($(e.target).hasClass('deactivated')) 
      {
        return;
      }
    
      var items = [];
      var selectedSelf = false;
      document.querySelectorAll('#adminusersgrid tr:not([data-search="false"]) [name="selectedUsers[]"]').forEach(function(elm) 
      {
        if (elm.checked === true) 
        {
          if (g.adminusers[elm.value].email === pcrypt.getvalue('email')) 
          {
            elm.checked = false;
            selectedSelf = true;
          } 
          else 
          {
            items.push(g.adminusers[elm.value].email);
          }
        }
      });

      if (!items.length)
      {
        if (selectedSelf === true)
        {
          modalalert(g.lang.adminjs.PCADMINUSERNODELETESELF, g.lang.default.PCPROGRAMTITLE);
        }
        else
        {
          modalalert(g.lang.passwordsjs.PCPASSWORDSNOSELECTIONTEXT, g.lang.default.PCPROGRAMTITLE);
        }
        return;
      }

      var modalConfirmText = g.lang.passwordsjs.PCPASSWORDSGROUPMULTIDELETE + " (" + items.length + ")";
      if (selectedSelf === true) {
        modalConfirmText += '<br />' + g.lang.adminjs.PCADMINUSERNODELETESELF;
      }

      deleteUsers(items, modalConfirmText);
    };

    document.querySelector('#exportusers').onclick = function (e) 
    {
      if ($(e.target).hasClass('deactivated')) 
      {
        return;
      }
      exportcheck();
    }

    document.querySelector('#exportall').onclick = function (e) 
    {
      exportallcheck();
    }

    updatemenu('users');
    
    document.getElementById('statustext').innerHTML = g.lang.passwordsjs.PCPASSWORDSRECORDCOUNTTEXT + ": " + users.length + '/' + adminPageStates.userCount;
    
    addCheckboxClickToGrid('adminusersgrid', true);

    addtableusersort();

    indicateSortation(adminPageStates.order);

    loader(false);
	});
}

function searchUserInit() 
{
  loader(true);
  var searchElem = document.getElementById('searchuser');
  var searchCurrent = searchElem.value;
  searchCurrent = htmlspecialchars(searchCurrent, ['ENT_QUOTES']);
  var limit = document.getElementById('display-n-users');
  limit = Number(limit.options[limit.selectedIndex].innerText);
  var page = Number(document.getElementById('display-n-page').innerText);

  pcrypt.adminusercountsearch(pcrypt.getvalue('session'), searchCurrent, 0, function (result) 
  {
    var displayNUsersElem = document.getElementById('display-n-users');
    var displayN = Number(displayNUsersElem.options[displayNUsersElem.selectedIndex].innerText);
    var maxPages = Math.ceil(result / displayN);
    
    adminPageStates.maxPages = maxPages;
    document.getElementById('display-max-page').innerText = (maxPages > 1) ? maxPages : 1;
    document.getElementById('display-n-page').innerText = (maxPages > 1) ? document.getElementById('display-n-page').innerText : 1;
    adminPageStates.userCountSearch = result;

    pcrypt.adminusersearch(pcrypt.getvalue('session'), 0, searchCurrent, limit, page, adminPageStates.order, function (users) 
    {
      if(users && users.reduce)
      {
        var htmlArray = users.reduce(function(acc, user, i) 
        {
          acc.push([
            '<input type="checkbox" name="selectedUsers[]" value="' + i + '">',
            htmlspecialchars(user.email, ['ENT_QUOTES']),
            htmlspecialchars(user.name, ['ENT_QUOTES']),
            htmlspecialchars(user.department, ['ENT_QUOTES']),
            user.last_login,
            user.created,
            user.logins,
            getUserActions(i)
          ]);
          return acc;
        }, []);
      }

      g.adminusers = users;

      var tableHeaderArray = [
        [
          '<input type="checkbox" id="selall" name="selall" value="1">', 
          'data-sort-method="none" style="width: 22px;"'
        ],
        [g.lang.adminjs.PCADMINEMAILLABEL, "data-sort-method='none' id='user-sort-email' class='admin-sort'"],
        [g.lang.adminjs.PCADMINNAMELABEL, "data-sort-method='none' id='user-sort-name' class='admin-sort'"],
        [g.lang.adminjs.PCADMINDEPARTMENTLABEL, "data-sort-method='none' id='user-sort-department' class='admin-sort'"],
        [g.lang.adminjs.PCADMINLASTLOGINLABEL, "data-sort-method='none' id='user-sort-lastlogin' class='admin-sort'"],
        [g.lang.adminjs.PCADMINREGISTRATIONDATELABEL, "data-sort-method='none' id='user-sort-date' class='registration-date admin-sort'"], // g.lang.adminjs.PCADMINREGISTRATIONDATE
        [g.lang.adminjs.PCADMINLOGINSLABEL, "data-sort-method='none' id='user-sort-logins' class='admin-sort'"],
        [g.lang.adminjs.PCADMINACTIONLABEL, "data-sort-method='none'"],
      ];

      document.getElementById('userslist').innerHTML = buildtable(
        tableHeaderArray,
        null,
        htmlArray,
        'adminusersgrid',
        'adminusers table-bordered table-max-width table-white'
      );

      var adminusersgrid = document.querySelector('#adminusersgrid');
      new Tablesort(adminusersgrid);

      adminusersgrid.addEventListener('afterSort', function() 
      { 
        tablesetbackgroundcolor(adminusersgrid); 
      });

      document.querySelectorAll('#adminusersgrid input.icon_delete').forEach(function(elm) 
      {
        $(elm).bind('click', function(e)
        {
          var user = g.adminusers[$(this).attr('data-index')].email
          if (user === pcrypt.getvalue('email'))
          {
            modalalert(g.lang.adminjs.PCADMINUSERNODELETESELF, g.lang.default.PCPROGRAMTITLE);
            return;
          }
          deleteUsers([user]);
        });
      });

      document.querySelectorAll('#adminusersgrid input.icon_show_log').forEach(function(elm)
      {
        $(elm).bind('click', function()
        {
          var userId = g.adminusers[$(this).attr('data-index')].id
          showLog(userId);
        });
      });

      document.querySelectorAll('#adminusersgrid [name="selectedUsers[]"]').forEach(function(elm) 
      {
        elm.onchange = function(e) {
          setMenulinkState();			
        }
      });
    
      document.querySelector('#selall').onchange = function(e) 
      {
        document.querySelectorAll('#adminusersgrid [name="selectedUsers[]"]').forEach(function(elm) 
        {
          elm.checked = e.target.checked;
        });
        setMenulinkState();			
      };

      document.querySelector('#deleteusers').onclick = function(e) 
      {
        if ($(e.target).hasClass('deactivated')) 
        {
          return;
        }
      
        var items = [];
        var selectedSelf = false;
        document.querySelectorAll('#adminusersgrid tr:not([data-search="false"]) [name="selectedUsers[]"]').forEach(function(elm) 
        {
          if (elm.checked === true) 
          {
            if (g.adminusers[elm.value].email === pcrypt.getvalue('email')) 
            {
              elm.checked = false;
              selectedSelf = true;
            } 
            else
            {
              items.push(g.adminusers[elm.value].email);
            }
          }
        });

        if (!items.length)
        {
          if (selectedSelf === true)
          {
            modalalert(g.lang.adminjs.PCADMINUSERNODELETESELF, g.lang.default.PCPROGRAMTITLE);
          }
          else
          {
            modalalert(g.lang.passwordsjs.PCPASSWORDSNOSELECTIONTEXT, g.lang.default.PCPROGRAMTITLE);
          }
          return;
        }

        var modalConfirmText = g.lang.passwordsjs.PCPASSWORDSGROUPMULTIDELETE +
         " (" + items.length + ")";
        if (selectedSelf === true)
        {
          modalConfirmText += '<br />' + g.lang.adminjs.PCADMINUSERNODELETESELF;
        }

        deleteUsers(items, modalConfirmText);
      };

      document.querySelector('#exportusers').onclick = function (e) 
      {
        if ($(e.target).hasClass('deactivated')) 
        {
          return;
        }

        exportcheck();
      }
      updatemenu('users');

      if(users)
      {
        document.getElementById('statustext').innerHTML = g.lang.passwordsjs.PCPASSWORDSRECORDCOUNTTEXT + ": " + users.length + '/' + adminPageStates.userCountSearch;
      }

      addCheckboxClickToGrid('adminusersgrid', true);

      addtableusersort();
      
      if(adminPageStates.order)
      {
        indicateSortation(adminPageStates.order);
      }

      loader(false);
    });

  });

}

function indicateSortation(order)
{
  switch (order) 
  {
    case 'email':
      document.getElementById('user-sort-email').classList.add('active-sort');
      document.getElementById('user-sort-email').classList.remove('desc');
      break;

    case 'emailDesc':
      document.getElementById('user-sort-email').classList.add('active-sort');
      document.getElementById('user-sort-email').classList.add('desc');
      break;

    case 'name':
      document.getElementById('user-sort-name').classList.add('active-sort');
      document.getElementById('user-sort-name').classList.remove('desc');
      break;

    case 'nameDesc':
      document.getElementById('user-sort-name').classList.add('active-sort');
      document.getElementById('user-sort-name').classList.add('desc');
      break;

    case 'department':
      document.getElementById('user-sort-department').classList.add('active-sort');
      document.getElementById('user-sort-department').classList.remove('desc');
      break;

    case 'departmentDesc':
      document.getElementById('user-sort-department').classList.add('active-sort');
      document.getElementById('user-sort-department').classList.add('desc');
      break;

    case 'lastlogin':
      document.getElementById('user-sort-lastlogin').classList.add('active-sort');
      document.getElementById('user-sort-lastlogin').classList.remove('desc');
      break;

    case 'lastloginDesc':
      document.getElementById('user-sort-lastlogin').classList.add('active-sort');
      document.getElementById('user-sort-lastlogin').classList.add('desc');
      break;

    case 'regDate':
      document.getElementById('user-sort-date').classList.add('active-sort');
      document.getElementById('user-sort-date').classList.remove('desc');
      break;

    case 'regDateDesc':
      document.getElementById('user-sort-date').classList.add('active-sort');
      document.getElementById('user-sort-date').classList.add('desc');
      break;

    case 'logins':
      document.getElementById('user-sort-logins').classList.add('active-sort');
      document.getElementById('user-sort-logins').classList.remove('desc');
      break;

    case 'loginsDesc':
      document.getElementById('user-sort-logins').classList.add('active-sort');
      document.getElementById('user-sort-logins').classList.add('desc');
      break;
  
    default:
      break;
  }
}

function addtableusersort()
{
  document.getElementById('user-sort-date').addEventListener('click', function (event)
  {
    if(adminPageStates.order == 'regDate')
    {
      adminPageStates.order = 'regDateDesc';
    }
    else
    {
      adminPageStates.order = 'regDate';
    }

    searchUserInit();
  });

  document.getElementById('user-sort-email').addEventListener('click', function (event)
  {
    if(adminPageStates.order == 'email')
    {
      adminPageStates.order = 'emailDesc';
    }
    else
    {
      adminPageStates.order = 'email';
    }

    searchUserInit();
  });

  document.getElementById('user-sort-name').addEventListener('click', function (event)
  {
    if(adminPageStates.order == 'name')
    {
      adminPageStates.order = 'nameDesc';
    }
    else
    {
      adminPageStates.order = 'name';
    }
    
    searchUserInit();
  });

  document.getElementById('user-sort-department').addEventListener('click', function (event)
  {
    if(adminPageStates.order == 'department')
    {
      adminPageStates.order = 'departmentDesc';
    }
    else
    {
      adminPageStates.order = 'department';
    }

    searchUserInit();
  });

  document.getElementById('user-sort-lastlogin').addEventListener('click', function (event)
  {
    if(adminPageStates.order == 'lastlogin')
    {
      adminPageStates.order = 'lastloginDesc';
    }
    else
    {
      adminPageStates.order = 'lastlogin';
    }

    searchUserInit();
  });

  document.getElementById('user-sort-logins').addEventListener('click', function (event)
  {
    if(adminPageStates.order == 'logins')
    {
      adminPageStates.order = 'loginsDesc';
    }
    else
    {
      adminPageStates.order = 'logins';
    }

    searchUserInit();
  });
}

function deleteUsers(users, modalConfirmText) 
{
  if (!modalConfirmText) 
  {
    var modalConfirmText = g.lang.passwordsjs.PCPASSWORDSGROUPMULTIDELETE + " (" + users.length + ")";
  }

  modalconfirm(modalConfirmText, g.lang.default.PCPROGRAMTITLE, function(r) 
  {
    if (r) 
    {
      pcrypt.admindeleteusers(pcrypt.getvalue('session'), 'admindeleteusers', users, function(res) 
      {
        searchUserInit();
      });
    }
  });
}

function setMenulinkState() 
{
  var enable = false;
  document.querySelectorAll('#adminusersgrid [name="selectedUsers[]"]').forEach(function(elm) 
  {
    if (elm.checked === true) 
    {
      enable = true;
    }
  });

  if (enable === true) 
  {
    $('ul.navigation .canchange').removeClass('deactivated');
  } else {
    $('ul.navigation .canchange').addClass('deactivated');
  }
}

function updatemenu(page) 
{
  if (!validlogin()) 
  {
    modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
    return;
  }

  if(adminPageStates.pageState !== page)
  {
    adminPageStates.pageState = page;
  }
  
  var userslist = document.getElementById('userslist');
  var adminpretext = document.getElementById('PCADMINPRETEXT');

  switch (adminPageStates.pageState) 
  {
    case 'users':
      showUsersAdminState(adminpretext, userslist);
    break;

    case 'globalmsgs':
        showGlobalMsgsState(adminpretext);
    break;

    default:
    break;
  }
}

function showUserLogState()
{
  $('#searchlog-wrapper').slideDown();
  $('#searchlog').slideDown();
  $('#back-userlist-btn').slideDown();
}

/**
 * Shows the users on the admin page
 * @param {*} adminpretext 
 * @param {*} userslist 
 */
function showUsersAdminState(adminpretext) 
{
  adminpretext.classList.add('hidden'); // Change all jquery to pure javascript
  $('#menu-admin-globalmsgs').slideUp();
  $('#display-n-page').slideDown();
  $('.subheader-admin').slideDown(
    {
      start: function () 
      {
        $(this).css({
          display: "flex"
        });
      }
    }
  );
  $('#msgtable').slideUp();
  $('#back-userlist-btn').slideUp();
  $('#menu-show-log').slideUp();
  $('#userslist').slideDown();
  $('#userslist')[0].style.display = 'block';
  $('#userlog').slideUp();
  $('#searchlog-wrapper').slideUp();
  $("#menu-admin-users").slideDown();
}

/**
 * Show the globalmessages options.
 */
function showGlobalMsgsState(adminpretext) 
{
  var adminglobalmsg = document.getElementById('menu-admin-globalmsgs'); // Change all jquery to pure javascript
  adminpretext.classList.add('hidden');
  $('#menu-admin-users').slideUp();
  $('.subheader-admin').slideUp();
  $('#userslist').slideUp();
  $('#userlog').slideUp();
  $('#searchlog-wrapper').slideUp();
  $('#searchlog').slideUp();
  $('#menu-show-log').slideUp();
  $('#back-userlist-btn').slideUp();
  $('#display-n-page').innerText = 1;
  $('.cs-searchuser').hide();
  $('#searchuser')[0].value = ''
  adminglobalmsg.classList.add('slideDown');
  $('#menu-admin-globalmsgs').slideDown();
  $('#msgtable').slideDown();
  $('#msgtable')[0].style.display = 'block';
  displayMessagesTable();
  pcrypt_setlogreadadminmaildata(pcrypt.getvalue('session'), pcrypt.getvalue('userid'), function(data, error, id)
  {
    if(error)
    {
      handlepcrypterror(error, data);
      return;
    }
  });
}

function setStatusText(shown = null) 
{
  document.getElementById('statustext').innerHTML =
    g.lang.passwordsjs.PCPASSWORDSRECORDCOUNTTEXT +
    ": " + (shown ? shown : g.teamtotalrecordcount) +
    '/' + adminPageStates.userCount;
}

function exportcheck() 
{
  var items = getselectedusers();

  if (!items.length) 
  {
    modalalert(g.lang.passwordsjs.PCPASSWORDSNOSELECTIONTEXT, g.lang.default.PCPROGRAMTITLE);
    return;
  }

  saveDataAsFile('pcryptuserexport.txt', 'text/plain', exportcsv(g.adminusers, items, { columns: ["email", "name", "department", "last_login", "created",  "logins"] }));
}

function exportallcheck() 
{
  loader(true);

  pcrypt.getalladminusers(pcrypt.getvalue('session'), 0, function(users, error, id)
  {
    if(error)
    {
      handlepcrypterror(error, users)
      return;
    }

    var arrUsers = [];
    
    for(var i = 0, i_len = users.length; i < i_len; i++)
    {
      arrUsers.push(i.toString());
    }

    loader(false);

    saveDataAsFile('pcryptuserexport.txt', 'text/plain', exportcsv(users, arrUsers, { columns: ["email", "name", "department", "last_login", "created",  "logins"] }));

  });
}

function getselectedusers() 
{
  var items = [];
  document.querySelectorAll('#adminusersgrid [name="selectedUsers[]"]').forEach(function(elm) 
  {
    if (elm.checked === true) 
    {
      items.push(elm.value);
    }
  });

  return items;
}


function showLog(userId) 
{
  if (!validlogin()) 
  {
    modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
    return;
  }

  if (!userId) 
  {
    return;
  }

  adminPageStates.pageState = 'showlog';

  $('#menu-admin-users').slideUp();
  $('#menuadmin').slideUp();
  $('#userslist').slideUp();
  $('#menu-show-log').slideDown();

  loader(true);

  pcrypt_getlog(pcrypt.getvalue('session'), 30, parseInt(userId, 10), 0, function getlogfunc(data, error, id) 
  {
    if (error) 
    {
      handlepcrypterror(error, data);
      return;
    }

    if (!data || (data.length == 0))
      data = [];

    var htmlArray = data.reduce(function(acc, log, i) 
    {
      acc.push([
        (new Date().setFromMysql(log.cre)).format(g.lang.default.JS_DATETIMEFORMAT), // Change data format
        log.ip,
        htmlspecialchars(log.txt, ['ENT_QUOTES'])
      ]);
      return acc;
    }, []);

    var tableHeaderArray = [
        [g.lang.accountjs.PCACCOUNTLOGHEADERTIME, "style='text-align: left;'"],
        [g.lang.accountjs.PCACCOUNTLOGHEADERIP, "style='text-align: left;'"],
        [g.lang.accountjs.PCACCOUNTLOGHEADERACTIVITY, "style='text-align: left;'"]
    ];

    document.getElementById('userlog').innerHTML = buildtable(
      tableHeaderArray,
      null,
      htmlArray,
      'loggrid',
      'userlog table-bordered table-max-width table-white',
      'white-space: nowrap;'
    );

    $('#divshowlog').show();
    showUserLogState();
    $('#userlog').slideDown();
    $('#userlog')[0].style.display = 'block';
    loader(false);
  });
}

/** MESSAGE FUNCTIONS */
function newmsg()
{
  if(document.getElementById('newmsgmodal').classList.contains('hidden'))
  {
    document.getElementById('newmsgmodal').classList.remove('hidden');
    document.getElementById("newmsgpublic").checked = false;
  }
  
  var callback = function(param)
  {
    if(param === false)
    {
      document.getElementById("newmsgtitle").value = '';
      document.getElementById("newmsgtitle").innerHTML = null;
      document.getElementById("newmsgcontent").value = '';
      document.getElementById("newmsgcontent").innerHTML = null;
      document.getElementById("newmsgsticky").checked = false;
      document.getElementById("newmsgpublic").checked = false;
      return;
    }

    var topic    = document.getElementById("newmsgtitle")
    var content  = document.getElementById("newmsgcontent")
    var sticky   = document.getElementById("newmsgsticky")
    var isDraft  = document.getElementById("newmsgpublic").checked

    //get the msg parameters
    var isSticky     = sticky.checked;
    var contentValue = htmlspecialchars(content.value, ['ENT_QUOTES']);
    var topicValue   = htmlspecialchars(topic.value, ['ENT_QUOTES']);

    // check for input
    if(topicValue == "" || topicValue == " " || contentValue == "" || contentValue == " ")
    {
      document.getElementById("newmsgtitle").value = '';
      document.getElementById("newmsgtitle").innerHTML = null;
      document.getElementById("newmsgcontent").value = '';
      document.getElementById("newmsgcontent").innerHTML = null;
      document.getElementById("newmsgsticky").checked = false;
      document.getElementById("newmsgpublic").checked = false;
      if(!document.getElementById('newmsgmodal').classList.contains('hidden'))
      {
        document.getElementById('newmsgmodal').classList.add('hidden');
      }
      $('#newmsgmodal').dialog("close");
      modalalert(g.lang.adminjs.PCADMINREQUIRESINPUT, g.lang.default.PCPROGRAMTITLE);
      return;
    }

    // api call
    pcrypt_newadminmaildata(pcrypt.getvalue('session'), 
    {
      sticky:isSticky, 
      topic:htmlspecialchars(topicValue, ['ENT_QUOTES']), 
      content:htmlspecialchars(contentValue, ['ENT_QUOTES']), 
      draft:isDraft
    }, 0, function(data, error, id)
    {
      if(error)
      {
        handlepcrypterror(error, data);
        return;
      }

      document.getElementById("newmsgtitle").value = '';
      document.getElementById("newmsgtitle").innerHTML = null;
      document.getElementById("newmsgcontent").value = '';
      document.getElementById("newmsgcontent").innerHTML = null;
      document.getElementById("newmsgsticky").checked = false;
      document.getElementById("newmsgpublic").checked = false;
      if(!document.getElementById('newmsgmodal').classList.contains('hidden'))
      {
        document.getElementById('newmsgmodal').classList.add('hidden');
      }
      displayMessagesTable();
    });	

  }

  modaldiv('#newmsgmodal', 500, "Ny besked", false, false, null, callback);
}

function deleteMSGS(id) // Menu option "delete message" for deleting 1...n messages
{
  var messageToDelete;
  for(var i = 0; i < g.globalMessages.length; i++)
  {
    if(g.globalMessages[i].id === id)
    {
      messageToDelete = g.globalMessages[i];
    }
  }
  pcrypt_deleteadminmaildata(pcrypt.getvalue('session'),
  {
    created:messageToDelete.created, 
    topic:messageToDelete.topic, 
    content:messageToDelete.content, 
    sticky:messageToDelete.sticky
  }, 0, function(data, error, id) {
    displayMessagesTable();
  });	
}

function deleteMSG(id) // Delete button for the single message
{
  if(validlogin())
    g.globalMessages.forEach(function(globalmsg)
    {
      if(globalmsg.id === id.toString())
      {
        pcrypt_deleteadminmaildata(pcrypt.getvalue('session'),
        {
          created: globalmsg.created,
          topic: globalmsg.topic,
          content: globalmsg.content,
          sticky: globalmsg.sticky
        }, 0, 
        function(data, error, id)
        {
          displayMessagesTable();
        });
      }
    });
}

// Display messages to delete
function displayMessagesTable()
{
  // Fetch messages, open modal, generate table, insert table.
  pcrypt_getadminmaildata(pcrypt.getvalue('session'), true, 0, function (messages, error, id) 
  {
    if(error)
    {
      handlepcrypterror(error, messages);
      return;
    }

    g.globalMessages = messages;
    var table = buildadminmessagetable(messages);
    var tableHeaderArray = table[0];
    var htmlArray = table[1];

    var stickylist = [];
    var nonStickylist = [];

    for (var i = 0; i < htmlArray.length; i++) 
    {
      if (messages[i].sticky == "1") 
      {
        stickylist.push(htmlArray[i]);
      } 
      else 
      {
        nonStickylist.push(htmlArray[i]);
      }
    }

    var sortedHtmlArray = []

    for (var i = 0; i < stickylist.length; i++) 
    {
      sortedHtmlArray.push(stickylist[i]);
    }

    for (var i = 0; i < nonStickylist.length; i++) 
    {
      sortedHtmlArray.push(nonStickylist[i]);
    }

    document.getElementById('msgtable').innerHTML = buildtable(
      tableHeaderArray,
      null,
      sortedHtmlArray,
      'globalmsgAdmingrid',
      'globalmsg table-bordered table-max-width table-white'
    );

    new Tablesort(document.getElementById('globalmsgAdmingrid'));

    for(var i = 0; i <= messages.length; i++)
    {
      var editBtn = document.getElementById("edit_"+i);
      var deleteBtn = document.getElementById("delete_"+i);
      var showBtn = document.getElementById("show_"+i);

      if(!pcrypt.getvalue("options").isglobaladmin)
      {
        if(editBtn)
        {
          editBtn.style.display = "none";
        }
        
        if(editBtn)
        {
          editBtn.style.display = "none";
        }
      }

      if(editBtn)
      {
        editBtn.addEventListener("click", function(event)
        {
          event.preventDefault();
          
          var isglobaladmin = pcrypt.getvalue('options').isglobaladmin;
          if(!isglobaladmin)
          {
            return;
          }

          var id = event.target.id.replace("edit_", "");
          id = Number(id);

          var sticky = g.globalMessages[id].sticky;
          var created = g.globalMessages[id].created;
          var topic = htmlspecialchars(g.globalMessages[id].topic, ['ENT_QUOTES']);
          var msg_id = document.getElementById("topic_"+id).getAttribute("msg_id")
          var content = htmlspecialchars(g.globalMessages[id].content, ['ENT_QUOTES']);
          var isDraft = g.globalMessages[id].draft;
          editmsg( parseInt(sticky), topic, content, parseInt(isDraft), msg_id);
        });

      }

      if(deleteBtn)
      {
        deleteBtn.addEventListener("click", function(event)
        {
          event.preventDefault();

          var isglobaladmin = pcrypt.getvalue('options').isglobaladmin;
          if(!isglobaladmin)
          {
            return;
          }

          modalalert(g.lang.admin.PCADMINMESSAGESDELETEMESSAGE, g.lang.admin.PCADMINMESSAGESDELETEWARNING, function()
          {
            var msgId = (event.target.getAttribute('msg_id'));
            deleteMSG(msgId);
          });
        });
      }
      
      if(showBtn)
      {
        showBtn.addEventListener("click", function(event)
        {
          var id = event.target.id.replace("show_", "");
          id = Number(id);
          var topic = htmlspecialchars(g.globalMessages[id].topic, ['ENT_QUOTES']);
          var content = htmlspecialchars(g.globalMessages[id].content, ['ENT_QUOTES']);
          var created = g.globalMessages[id].created;

          modalalert(content, topic, function() {});
        });
      }
    }

    document.querySelector('#selectall').onchange = function(e)
    {
      document.querySelectorAll('#globalmsgAdmingrid input[type="checkbox"]').forEach(function(checkbox)
      {
        checkbox.checked = e.target.checked;
      });
      
      if(e.target.checked)
      {
        document.getElementById('deletemsgbutton').classList.remove('deactivated');
      }
      else
      {
        document.getElementById('deletemsgbutton').classList.add('deactivated');
      }
    }

    document.querySelectorAll('.messagecheckbox').forEach(function(checkbox)
    {
      checkbox.onchange = function(event)
      {
        var allcheckmessages = document.querySelectorAll('.messagecheckbox:checked');
        event.preventDefault();
        if(allcheckmessages.length>0)
        {
          document.getElementById('deletemsgbutton').classList.remove('deactivated');
        }
        else
        {
          document.getElementById('deletemsgbutton').classList.add('deactivated');
        }
      };
    });

    addCheckboxClickToGrid('globalmsgAdmingrid', true);

    pcrypt_setlogreadadminmaildata(pcrypt.getvalue('session'), 0, function(data, error, id){});
    
    loader(false);
  });
  
}

function editmsg(sticky, topic, content, isPublic, msg_id) 
{
  function returnisok(val)
  {
    if(val)
    {
      loader(true);
      var topicElement = document.getElementById("editmsgmodal_topic");
      var contentElement = document.getElementById("editmsgmodal_msg");
      var stickyElement = document.getElementById("editmsgmodal_sticky");
      var publicElement = document.getElementById("editmsgmodal_public");

      var data = {
        newTopic:htmlspecialchars(topicElement.value, ['ENT_QUOTES']), 
        newContent:htmlspecialchars(contentElement.value, ['ENT_QUOTES']), 
        newSticky:stickyElement.checked, 
        newPublic:publicElement.checked, 
        id:msg_id 
      };

      pcrypt_editadminmaildata(pcrypt.getvalue('session'), data, 0, function(data, error, id) 
      {
        pcrypt_getadminmaildata(pcrypt.getvalue('session'), true, 0, function (messages, error, id) 
        {
          if(error)
          {
            handlepcrypterror(error, data)
            return;
          }

          g.globalMessages = messages;
          displayMessagesTable();
        });
      });	
    }
  }

  
  modaldiv('#editmsgmodal', 500, g.lang.admin.PCADMINEDITMESSAGEHEADER, null, null, null, returnisok);

  // set the old values to be in the modal.
  document.getElementById("editmsgmodal_topic").innerHTML = htmlspecialchars(topic, ['ENT_QUOTES']);
  document.getElementById("editmsgmodal_topic").value = htmlspecialchars(topic, ['ENT_QUOTES']);
  document.getElementById("editmsgmodal_msg").innerHTML = htmlspecialchars(content, ['ENT_QUOTES']);
  document.getElementById("editmsgmodal_msg").value = htmlspecialchars(content, ['ENT_QUOTES']);
  document.getElementById("editmsgmodal_sticky").checked = parseInt(sticky);
  document.getElementById("editmsgmodal_public").checked = parseInt(isPublic);
};

function buildadminmessagetable(result)
{  
  var tableHeaderArray = [
    ["<input type='checkbox' id='selectall' name='selectall' value='1'>", "data-sort-method='none' style='width: 22px;'"],
    [g.lang.admin.PCADMINMESSAGESTOPIC],
    [g.lang.admin.PCADMINMESSAGECREATEDHEADER],
    [g.lang.admin.PCADMINMESSAGESSTICKYHEADER],
    [g.lang.admin.PCADMINMESSAGESPUBLICHEADER],
    [g.lang.admin.PCADMINMESSAGESACTIONSHEADER]
  ];

  var htmlArray = result.reduce(function(acc, data, i) 
  {
    g.msgcount = i 
    acc.push([
      "<input type='checkbox' id='selectsingle"+i+"' class='messagecheckbox' value="+data.id+">",
      "<span id='topic_"+i+"' msg_id='"+data.id+"'>"+htmlspecialchars(data.topic, ['ENT_QUOTES'])+"</span>",
      "<span id='created_"+i+"'>"+data.created+"</span>",
      "<span id='sticky_"+i+"' value='"+data.sticky+"'>"+data.sticky+"</span>",
      "<span id='public_"+i+"' value='"+data.draft+"'>"+data.draft+"</span>",
      "<input id='delete_"+i+"' msg_id='" +data.id+ "' value='' type='button' class='icon_delete'>"+
      "<input id='edit_"+i+"' msg_id='" +data.id+ "' value='' type='button' class='icon_edit'>"+
      "<input id='show_"+i+"' msg_id='" +data.id+ "' name='' title='' type='button' class='icon_show'>",
    ]);
    return acc;
  }, []);

  return [tableHeaderArray, htmlArray];
}