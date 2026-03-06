"use strict";

g.teaminfo = null;
g.teammembers = [];
g.teamobject = null;
g.memberobject = null;
g.tidshown = null;
g.pageshown = null;
g.teamrecordcount = null;
g.teamtotalrecordcount = null;
g.teamsUserOwned = 0;
g.importdiv = null;
g.importformatsave = null;
g.importformats =
{
  pcrypt2016:
  {
    name: g.lang.import.PCIMPORTSUBMITPCRYPT2016,
    titleline: true,
    newlinechar: false,
    type: 'csv',
    fields:
    [
      {text: g.lang.teamjs.PCTEAMEMAILLABEL, value: 'email'},
      {text: g.lang.teamjs.PCTEAMADMINLABEL, value: 'admin'},
      {text: g.lang.teamjs.PCTEAMHIDELABEL, value: 'hide'},
      {text: g.lang.teamjs.PCTEAMNOSHARELABEL, value: 'noshare'}
    ]
  }
};

var fromPage = null;
var asyncteam_onerror = function(data, error, id)
{
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
};

var asyncteam_onsuccess = function(varobj)
{
  $('#check-team-counter').css('display', 'none'); // Remove counter as we read in above
  g.teaminfo = varobj.teaminfo;
  g.teammembers = varobj.members;
  g.teamobject = convertteammembers(g.teammembers);
  g.memberobject = createteammemberlist(g.teammembers);

  if(!g.teaminfo)
  {
    loader(false);
    updatemenu(false, false);
    return;
	}
	
  if(typeof g.tidshown != 'number')
  {
    g.tidshown = null;
  }

  var tid = Number(getUrlParameter('tid'));

  if(tid && g.teaminfo && g.teaminfo[tid])
  {
    g.tidshown = tid;
  }

  fillteamselect(document.getElementById('teamselect2'), g.tidshown, false, false, true);

  if(getUrlParameter('addmember') && g.teaminfo && Object.keys(g.teaminfo).length)
  {
    updatemenu(g.teaminfo, 'members', g.tidshown);
    newmemberfunc();
  }
  else
  {
    let page = this.getvalue();

    if(!page)
    {
      page = false;
    }

    updatemenu(g.teaminfo, page, g.tidshown);
  }

  loader(false);

  pcrypt.setvalue('teamupdate', false);
};

if(redirectinvalidlogin() && (pcrypt.getvalue('options').disableteams == false))
{
  $(document).ready(function ()
  {
    if(pcrypt.getvalue('emailconfirm') == 0)
    {
  	  localStorage.setItem('popupRead', false);
      window.history.back();
    }

    initdata(true);
    disableoptionscheck();

    $('.container-hidden').show();

    $('#buttonimport').click(function(e)
    {
  	 e.preventDefault();
  	 //highlightMenuItem('buttonimport');
  	 
  	 if((g.teaminfo[g.tidshown].admin < 1 && pcrypt.getvalue('options').isglobaladmin === false) && pcrypt.getvalue('options').disableteamadmins === false)
  	 {
  		modalalert(g.lang.team.PCTEAMNOADMINNOIMPORT, g.lang.default.PCPROGRAMTITLE);
  		return;
  	 }

  	 if(pcrypt.getvalue('options').disableteamadmins === true && pcrypt.getvalue('options').isglobaladmin === true )
  	 {
  		modalalert(g.lang.team.PCTEAMNOADMINNOIMPORT, g.lang.default.PCPROGRAMTITLE);
  		return;
  	 }

      loadDialog(g.importdiv, "import", true, false, function importcallback(importdiv)
      {
        if(importdiv !== false) {
          g.importdiv = importdiv;
        }

        if(!pcimport)
        {
          console.log("Import JS file not ready!");
          return;
        }

        pcimport.show(g.importdiv, '90%', g.lang.passwords.PCPASSWORDSUSERMENUIMPORT, false, false, function()
        {
          pcimport.init(g.importformats, function functest(settings, importtext)
          {
            return pcryptteamimport(false, settings, importtext);
          },
          function funcimport(settings, importtext)
          {
              return pcryptteamimport(true, settings, importtext);
          });
        },
        function (result)
        {
          if(result)
          {
            g.importformatsave = pcimport.getimportvalues();
          }
          else
          {
            if(g.importformatsave) {
              pcimport.setimportvalues( g.importformatsave );
            }
          }
        });
  	  });
  	});

    // Event handlers for menu
    document.getElementById('create').onclick = function (event)
    {
    	event.preventDefault();
      	updatemenu(g.teaminfo, 'create');
    };

    document.getElementById('teamselect2').onchange = function (event)
    {
	  	updatemenu(g.teaminfo, false, this[this.selectedIndex].value);
  		activateTooltip();
    };

    document.getElementById('info').onclick = function (event)
    {
    	event.preventDefault();
  		updatemenu(g.teaminfo, 'info');
    };

    document.getElementById('leave').onclick = function (event)
    {
    	event.preventDefault();
      updatemenu(g.teaminfo, 'leave');
    };

    document.getElementById('update').onclick = function (event)
    {
    	event.preventDefault();
      updatemenu(g.teaminfo, 'update');
    };

    document.getElementById('delete').onclick = function (event)
    {
    	event.preventDefault();
  	   updatemenu(g.teaminfo, 'delete');
    };

    document.getElementById('shares').onclick = function (event)
    {
      updatemenu(g.teaminfo, 'shares');
    };

    document.getElementById('members').onclick = function (event)
    {
  	   updatemenu(g.teaminfo, 'members');
  	   activateTooltip();
    };

    addClearSearchIcon('searchshares', function(){ tablesearch(document.getElementById('sharesgrid'), null, ""); });
    var searchSharesInTeam = null;
    document.getElementById('searchshares').onkeyup = function()
    {
      clearTimeout(searchSharesInTeam);
      searchSharesInTeam = setTimeout(function()
      {
        tablesearch(document.getElementById('sharesgrid'), null, document.getElementById('searchshares').value);
      }, 350);
    };

    document.getElementById('searchshares').onkeydown = function()
    {
      clearTimeout(searchSharesInTeam);
    };

    addClearSearchIcon('teamsharessearch', function(){ tablesearch(document.getElementById('teamsharesgrid'), null, ""); });
    var searchTeamsharesTimer = null;
    document.getElementById('teamsharessearch').onkeyup = function()
    {
      clearTimeout(searchTeamsharesTimer);
      searchTeamsharesTimer = setTimeout(function()
      {
        tablesearch(document.getElementById('teamsharesgrid'), null, document.getElementById('teamsharessearch').value);
      }, 350);
    };

    document.getElementById('teamsharessearch').onkeydown = function()
    {
      clearTimeout(searchTeamsharesTimer);
    };

  	/**
  	 * Premium users can add as many members as they want (Not sure if there is a maximum value) 
  	 * Free users are restricted can only add new members if they have one (or fewer) teams.
  	 * And are administrators.
  	 */
    document.getElementById('addmember').onclick = function (event)
    {
      countOwnedTeams();
      var opts = pcrypt.getvalue('options');

      // Is the user administrator and if disableteamadmins is false is the user a global admin?
      if(g.teaminfo[g.tidshown].admin<1 && opts.disableteamadmins === false)
      {
        modalalert('<div class="popup">'+g.lang.default.PCNOFEATUREACCESS+'</div>', g.lang.default.PCPROGRAMTITLE);
        return;
      }
      // If disableteamadmins is true the user HAS to be globaladmin to access this feature.
      if(opts.disableteamadmins === true && opts.isglobaladmin === false)
      {
        modalalert('<div class="popup">'+g.lang.default.PCNOFEATUREACCESS+'</div>', g.lang.default.PCPROGRAMTITLE);
        return;
      }

  	  newmemberfunc();	
    };

    document.getElementById('deletemembers').onclick = function (event)
    {
  	  delcheck();
    };

    document.getElementById('exportmemberbutton').onclick = function (event)
    {
    	var opts = pcrypt.getvalue('options');

    	if(opts.disableteamadmins === true && opts.isglobaladmin === false)
    	{
    		modalalert('<div class="popup">'+g.lang.default.PCNOFEATUREACCESS+'<div>', g.lang.default.PCPROGRAMTITLE);
    		return;
    	}

    	if(opts.disableteamadmins === false && g.teaminfo[g.tidshown].admin < 1)
    	{
    		modalalert('<div class="popup">'+g.lang.default.PCNOFEATUREACCESS+'</div>', g.lang.default.PCPROGRAMTITLE);
    		return;
    	}

    	exportcheck();

    };

    addClearSearchIcon('searchmember', searchmember);
    document.getElementById('searchmember').onkeyup = function (event)
    {
      searchmember();
    };

    /*document.getElementById('clearsearchmember').onclick = function (event)
    {
      document.getElementById('searchmember').value = '';
      searchmember();
    };*/

    // Event handlers for action buttons

    document.getElementById('actioncreate').onclick = function (event)
    {
    	var opts = pcrypt.getvalue('options');
    	var premStatus = pcrypt.getvalue('premium');
    	// Restrict the amount of teams a nonPremium user can add.
    	countOwnedTeams();

    	if(opts.disableteamcreate === true && !opts.isglobaladmin)
    	{
    		modalalert('<div class="popup">' + g.lang.default.PCNOFEATUREACCESS + '</div>', g.lang.default.PCPROGRAMTITLE);
    		return;
    	}

    	if((premStatus <= 0 && opts.isglobaladmin === false) && g.teamsUserOwned >= premRes.teamsMaxFree )
    	{
    		modalalert('<div class="popup">'+g.lang.team.PCNOTEAMCREATEFREE+'</div>', g.lang.default.PCPROGRAMTITLE);	
    		return;
    	}

  		event.preventDefault();
  		createTeam();
    };

  	/**
  	 * A premium user should be able to update team members as much as they please
  	 * Free users should only be allowed to do so if they have one team (or less).
  	 */
    document.getElementById('actionupdate').onclick = function (event)
    {
      var opts = pcrypt.getvalue('options');

      countOwnedTeams();

      if(opts.disableteamadmins === true && opts.isglobaladmin === false)
      {
        modalalert('<div class="popup">'+g.lang.default.PCNOFEATUREACCESS+'</div>', g.lang.default.PCPROGRAMTITLE);
        return;
      }

      if(opts.disableteamadmins === false && g.teaminfo[g.tidshown].admin < 1)
      {
        modalalert('<div class="popup">'+g.lang.default.PCNOFEATUREACCESS+'</div>', g.lang.default.PCPROGRAMTITLE);
        return;
      }

      if(opts.disableteamadmins === false && pcrypt.getvalue('premium') < 1 && g.teamsUserOwned > premRes.teamsMaxFree)
      {
        modalalert('<div class="popup">'+g.lang.team.PCNOTEAMEDITFREE+'</div>', g.lang.default.PCPROGRAMTITLE);
        return;
      }

      updateTeam();
    };

    document.getElementById('actiondelete').onclick = function (event)
    {
      deleteTeam();
    };

    document.getElementById('actionleave').onclick = function (event)
    {
      leaveTeam();
      event.preventDefault();
    };

    document.getElementById('teamsyncteamkeys').onclick = function (event)
    {
      modalconfirm(g.lang.teamjs.PCTEAMSYNCTEAMKEYSCONFIRM, g.lang.default.PCPROGRAMTITLE, function(r)
      {
        if(r && g.teaminfo[g.tidshown].admin)
        {
          let myteamkeys = handleTeamKeys([g.tidshown], false, false, false); // Get my current teamkeys
          let teamkeys = handleTeamKeys([g.tidshown], myteamkeys, false, false); // No use for the return value - just check that there are users

          if(!validNestedObj(teamkeys, g.tidshown) || teamkeys[g.tidshown].length === 0)
          {
            console.log('Invalid teamkeys update');
          }
        }
      });
    
    };

    // Checkboxes activate left menu
    function checkTeamCheckboxChecked()
    {
    	var passwordCheckboxChecked = false;
    	$('#memberslist input[type="checkbox"]').each(function()
      {
    	  if ($(this).is(':checked'))
        {
    		    passwordCheckboxChecked = true;
    	  }
    	});

  	  if (passwordCheckboxChecked)
      {
    	  $('ul.navigation .canchange').removeClass('deactivated');
    	}
    	else
      {
    	  if (!$('#buttonshare').hasClass('deactivated'))
        {
    		$('ul.navigation .canchange').addClass('deactivated');
    	  }
    	}
    }

    $('#div_contentframe').on('click','input[type="checkbox"]', function()
    {
    	checkTeamCheckboxChecked();
    });

    loader(false);

    var id = getUrlParameter('id');
    if(id)
    {
      document.getElementById( id ).click();
    }
  });
} 
else 
{
  let currentpage = 'passwords';
  window.location.replace('./index.html?page=' + currentpage);
  //var htmlfile = './html/' + currentpage + '.html?v=PCRYPTVERSION';
  //var jsfile = './js/' + currentpage + '.js?v=PCRYPTVERSION';
}

countOwnedTeams(); // Initial counting of user owned teams.

function initdata(update, page)
{
  //$("#menuteam").attr('class', 'topmenustylecurrent');

  //loader(true);
  $(".globalhide").hide();
  $('.container-hidden').show();

  var session = pcrypt.getvalue('session');
  g.tidshown = pcrypt.getvalue('tidshown');

  var teamasync = new pcrypt_async(2);

  teamasync.onsuccess = asyncteam_onsuccess;
  teamasync.onerror = asyncteam_onerror;

  pcrypt.getteaminfo(session, update, 'pcryptteaminfo', 'teaminfo',  teamasync.callback);
  pcrypt.getteammembers(session, update, 'pcryptteammembers', 'members', teamasync.callback);

  if(page)
  {
    teamasync.setvalue(page);
  }
}

/**
 * @name disableoptionscheck
 * @description disables parts of the site depending on which options are true
 * @todo Make it so the buttons don't flicker on the page.
 */
function disableoptionscheck() 
{
	if(g.teaminfo != undefined) 
  {
		var opts = pcrypt.getvalue('options'); // if opts exist, disableteamcreate is true and isglobaladmin is false hide everything
	
		if (opts && (opts.disableteamcreate || opts.disableteamadmins) && !opts.isglobaladmin)
		{
			$('#teamcreatebutton').hide();
		} 
		else
		{
			$('#teamcreatebutton').show();
		}
		if (opts && (opts.disableexport || opts.disableteamadmins ) && !opts.isglobaladmin) 
		{
			$('#exportmemberbutton').hide();
			$('#buttonimport').hide();
		}
		else
		{
			$('#exportmemberbutton').show();
			$('#buttonimport').show();
		}
		checkAdminStatus(opts);
	}
}

// Member functions below

function updatemenu(teaminfo, page, tid) // membershow skal blive til den menu der skal vises (sammenlign med den gamle)
{
  var opts = pcrypt.getvalue('options');

  if(!validlogin())
  {
  	modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
  	return;
  }

	$(".menuitem").hide();

	if(teaminfo)
	{
    if(tid && (g.tidshown != Number(tid)))
	  {
		  g.tidshown = Number(tid);
      pcrypt.setvalue('tidshown', g.tidshown);
      // update the last display
      if(!page)
      {
        page = g.pageshown;
      }
    }

    if(!teaminfo[g.tidshown])
    {
      var teamselect = document.getElementById('teamselect2');

      if (teamselect.selectedIndex > -1)
      {
        g.tidshown = Number( teamselect[teamselect.selectedIndex].value );
      }

      if (!teaminfo[g.tidshown])
      {
        g.tidshown = null;
      }

      pcrypt.setvalue('tidshown', g.tidshown);
    }

	  $(".menuteam").show();
	}

  disableoptionscheck();

  $('ul.navigation li a').removeClass('on');
  $('#' + page).addClass('on');
  $(".globalhide").hide();

  switch(page)
  {
    default:
      $("#divdefault").show();
      $("#menu-team-admin-members").slideUp();
    break;

    case 'create':
	    clearallteamitems();
	    $("#divteamfields").show();
	    $("#actionupdate").hide();
	    $("#actioncreate").show();
	    document.getElementById('name').focus();
      $("#menu-team-admin-members").slideUp();
      countOwnedTeams();
    break;

    case 'info':
      if(!teaminfo)
	    {
		    modalalert(g.lang.teamjs.PCTEAMNOTEAMEDITPOSSIBLE, g.lang.default.PCPROGRAMTITLE);
	    }
	    else
	    {
	    	$("#menu-team-admin-members").slideUp();
        setinfotext(teaminfo, g.tidshown, g.memberobject);
        $("#divinfo").show();
	    }
	  break;

	  case 'leave':
	    if(!teaminfo)
	    {
		    modalalert(g.lang.teamjs.PCTEAMNOTEAMEDITPOSSIBLE, g.lang.default.PCPROGRAMTITLE);
	    }
	    else if(opts.disableteamadmins === false || (opts.disableteamadmins === true && opts.isglobaladmin === true))
	    {
	    	$("#menu-team-admin-members").slideUp();
	    	$("#divleave").show();
			}
			else
			{
				$("#divdefault").show();
			}
	  break;

	  case 'update':
	    if(teaminfo == false)
	    {
		    modalalert(g.lang.teamjs.PCTEAMNOTEAMEDITPOSSIBLE, g.lang.default.PCPROGRAMTITLE);
	    }
	    else
	    {
			if(g.tidshown === undefined ||g.tidshown === null)
			{
				return;
			}

      if( (teaminfo[g.tidshown].admin && opts.disableteamadmins === false) || (opts.disableteamadmins === true && opts.isglobaladmin === true))
      {
        $("#menu-team-admin-members").slideUp();
        setallteamitems(g.teaminfo[g.tidshown].fields);
        $("#divteamfields").show();
        $("#actioncreate").hide();
        $("#actionupdate").show();
        document.getElementById('name').focus();
      
        if(opts.useremailinreply === true)
        {	
          if(document.getElementsByClassName('table-standard-input')[1].children[0].children.length > 3)
          {
            document.getElementsByClassName("table-standard-input")[1].children[0].children[0].remove();
          }
        }
			}
			else
			{
				$("#divdefault").show();
			}
		}
			
	  break;

	  case 'delete':

	    if(teaminfo == false)
	    {
		    modalalert(g.lang.teamjs.PCTEAMNOTEAMEDITPOSSIBLE, g.lang.default.PCPROGRAMTITLE);
	    }
	    else
	    {
        if(g.tidshown === undefined || g.tidshown === null)
        {
          return;
        }

        $("#menu-team-admin-members").slideUp();
        if(((teaminfo[g.tidshown].admin || opts.isglobaladmin === true) && opts.disableteamadmins === false) || (opts.disableteamadmins === true && opts.isglobaladmin === true) )
        {
          //$("#delete").attr('class', 'contentmenustylecurrent');
          $("#divdelete").show();
        }
        else
        {
          $("#divdefault").show();
        }
        countOwnedTeams();
	    }
	  break;

    case 'shares':
	    if(teaminfo == false)
      {
	      modalalert(g.lang.teamjs.PCTEAMNOTEAMEDITPOSSIBLE, g.lang.default.PCPROGRAMTITLE);
      }
      else
      {
        if(g.tidshown === undefined || g.tidshown === null)
        {
          return;
        }

        $("#menu-team-admin-members").slideUp();
        
        if((teaminfo[g.tidshown].admin && opts.disableteamadmins === false) || (opts.disableteamadmins === true && opts.isglobaladmin))
        {
          $("#shares").attr('class', 'contentmenustylecurrent');
          $("#divshares").show();
          setshareslist(g.tidshown, g.teamobject);

          if(validNestedObj(g.teaminfo, g.tidshown, 'teamshares') && g.teaminfo[g.tidshown].teamshares.length > 0)
          {
            $("#divteamshares").show();
          }
          else
          {
            $("#divteamshares").hide();
          }
        }
        else
        {
          $("#divdefault").show();
        }
      }
	  break;

	  case 'members':
	    if(!teaminfo )
      {
	      modalalert(g.lang.teamjs.PCTEAMNOTEAMEDITPOSSIBLE, g.lang.default.PCPROGRAMTITLE);
      }
      else
      {
        //$("#members").attr('class', 'contentmenustylecurrent');
        $(".menuteammembers").show();
        $("#menu-team-admin-members").slideDown();
        $("#divmembers").show();
	      if(teaminfo[g.tidshown] && teaminfo[g.tidshown].admin)
        {
          $("#menuteammembersadmin").show();
        }
        
        setmemberlist(teaminfo, g.tidshown, g.memberobject);
        searchmember();
      }
	  break;
	}

	//fillteamselect(document.getElementById('teamselect2'), g.tidshown, false, false, true);
	g.pageshown = page;
}

function selallfunc(e)
{
  for(var i=0 ; i < g.teamtotalrecordcount ; i++)
	{
		document.getElementById('selid' + i).checked = document.getElementById('selall').checked;
	}
}

function setshareslist(teamid, teamobject)
{
  loader(1);

  pcrypt_teamshares(pcrypt.getvalue('session'), teamid, 0, function teamsharesfunc(data, error, id)
  {
    if(error)
    {
      switch ( error )
      {
        default:
          handlepcrypterror( error, data );
          return;
      }
    }

    var sharesshown = 0;

    var tablearrayheader = [[g.lang.teamjs.PCTEAMSHAREIDLABEL, "style='text-align: left;'"],
    [g.lang.teamjs.PCTEAMUSERIDLABEL, "style='text-align: left;'"],
    [g.lang.teamjs.PCTEAMUPDATEDLABEL, "style='text-align: left;'"]];

    var htmlarray = [];

    for (let i = 0, len_i = data.length; i < len_i; ++i)
    {
      let share = data[i];

      if(!teamobject[share.fromid] || !teamobject[share.toid] || !teamobject[share.fromid][teamid])
      {
        continue;
      }

      let emailuser = htmlspecialchars(teamobject[share.fromid].email, ['ENT_QUOTES']);
      let emailshare = htmlspecialchars(teamobject[share.toid].email, ['ENT_QUOTES']);

      let htmlarrayrow = [];

      let popover_user = getPopoverContent(teamobject[share.fromid]);
      let popover_share = getPopoverContent(teamobject[share.toid]);

      htmlarrayrow[0] = "<a href='index.html?page=messages&email=" + emailuser + "' data-toggle='popover' title='Information' data-html='true' data-content='" + popover_user + "' data-trigger='hover'>" + getMailNameFromId(teamobject, teamobject[share.fromid].userid) + "</a>";
      htmlarrayrow[1] = "<a href='index.html?page=messages&email=" + emailshare + "' data-toggle='popover' title='Information' data-html='true' data-content='" + popover_share + "' data-trigger='hover'>" + getMailNameFromId(teamobject, teamobject[share.toid].userid) + "</a>";
      htmlarrayrow[2] = (new Date().setFromMysql(share.updated)).format(g.lang.default.JS_DATETIMEFORMAT);

      htmlarray.push(htmlarrayrow);

      sharesshown++;

    }

    document.getElementById('shareslist').innerHTML = buildtable(tablearrayheader, null, htmlarray, 'sharesgrid', 'teamshares table table-bordered table-max-width table-white', '');
    $('#PCTEAMMEMBERSHARESHEADER').show();
    $('#searchshares').show();

    if(g.teaminfo[g.tidshown].teamshares && g.teaminfo[g.tidshown].teamshares.length > 0 )
    {
      var tableteamsharesarrayheader = [[g.lang.team.PCTEAMNAMELABEL, "style='text-align: left;'"],
      [g.lang.teamjs.PCTEAMSHAREIDLABEL, "style='text-align: left;'"],
      [g.lang.default.PCDEFAULTDEPARTMENT, "style='text-align: left;'"],
      [g.lang.default.PCDEFAULTEMAIL, "style='text-align: left;'"]];

      var htmlteamsharesarray = [];
      var currentTeam = g.teaminfo[g.tidshown];

      for(let i = 0, i_len = currentTeam.teamshares.length; i < i_len; i++)
      {
        let popover_user = getPopoverContent(teamobject[Number(currentTeam.teamshares[i].fromid)]);
        var htmlteamsharesrow = [];
        htmlteamsharesrow[0] = htmlspecialchars(g.teaminfo[Number(currentTeam.teamshares[i].teamid)].fields.name, 'ENT_QUOTES');
        htmlteamsharesrow[1] = "<a href='index.html?page=messages&email="+currentTeam.teamshares[i].email+"' data-toggle='popover' title='Information' data-html='true' data-content='" + popover_user + "' data-trigger='hover'>" + htmlspecialchars(currentTeam.teamshares[i].name+"<"+currentTeam.teamshares[i].email+">", 'ENT_QUOTES') + "</a>";
        htmlteamsharesrow[2] = htmlspecialchars(currentTeam.teamshares[i].department, 'ENT_QUOTES');
        htmlteamsharesrow[3] = "<a href='index.html?page=messages&email="+currentTeam.teamshares[i].email+"'>" + currentTeam.teamshares[i].email + "</a>";
        htmlteamsharesarray.push(htmlteamsharesrow);
      }

      document.getElementById('teamshareslist').innerHTML = buildtable(tableteamsharesarrayheader, null, htmlteamsharesarray, 'teamsharesgrid', 'teamshares table table-bordered table-max-width table-white');
      $('#teamsharessearch').show();
      $('#teamshareslist').show();
      $('#PCTEAMTEAMSHARESHEADER').show();
    }

    activatePopover('#shareslist');
    activatePopover('#teamshareslist');

    loader(0);
  });
}

function setmemberlist(teaminfo, teamid, memberobject)
{
	document.getElementById('memberslist').innerHTML = "";

  if(!isset(teaminfo))
  {
    console.log('No teaminfo specified in setmemberlist');
    return;
  }

  if(!isset(teamid))
	{
		console.log('No teamid specified in setmemberlist');
    return;
	}

  if(!isset(memberobject))
  {
    console.log('No memberobject specified in setmemberlist');
    return;
  }

  if(!isset(memberobject[teamid])) // Test if team is still valid for me
  {
    console.log('Invalid teamid specified in setmemberlist');
    /*
    // Find another team to display
    for (var prop in memberobject) 
    {
      //pcrypt.setvalue('tidshown', Number(prop));
      initdata(true);
      break;
    }
    */
    return;
  }

	var membersshown = 0;
  var opts = pcrypt.getvalue('options');

	var tablearrayheader =
	[
	  ["<input type='checkbox' id='selall' name='selall' value='1'>", "data-sort-method='none' style='width: 22px;'"],
  	[g.lang.teamjs.PCTEAMEMAILLABEL, "style='text-align: left;'"],
  	[g.lang.teamjs.PCTEAMNAMELABEL, "style='text-align: left;'"],
	  [g.lang.teamjs.PCTEAMDEPARTMENTLABEL, "style='text-align: left;'"],
	  [g.lang.teamjs.PCTEAMSTATUSLABEL, "data-sort-method='none' style='width: 110px; text-align: left;'"]
	];

	if(teaminfo[teamid].admin)
	{
    tablearrayheader.push( [
      g.lang.teamjs.PCTEAMACTIONLABEL,
      "data-sort-method='none' style='width: 95px; text-align: left;'"
    ] );
  }

	var htmlarray = [];

	for (let i = 0, len_i = memberobject[teamid].length; i < len_i; i++)
	{
		let member = memberobject[teamid][i];

		let email = htmlspecialchars(member.email, ['ENT_QUOTES']);
		let name = htmlspecialchars(member.name, ['ENT_QUOTES']);
		let department = htmlspecialchars(member.department, ['ENT_QUOTES']);

		if (!teaminfo[teamid].admin && !member.approved && !member.userid)
		{
			continue;
		}

		let popoverInfoContent = getPopoverContent(member);

		let htmlarrayrow = [];
		htmlarrayrow[0] = "<input type='checkbox' id='selid" + membersshown + "' name='" + i + "' value='1'>";
		htmlarrayrow[1] = "<a href='index.html?page=messages&email=" + email + "' data-toggle='popover' title='Information' data-html='true' data-content='" + popoverInfoContent + "' data-trigger='hover'>" + email + "</a>";
		//htmlarrayrow[1] = "<a href='mailto:" + email + "?subject=" + g.lang.default.PCTEAMMAILTITLE + "'>" + email + "</a>";
		htmlarrayrow[2] = name;
		htmlarrayrow[3] = department;
    htmlarrayrow[4] = "";

		if(member.admin)
		{
      htmlarrayrow[4] += '<span class="icon_admin pc-bs-toggle no-margin" data-placement="left" title="' + g.lang.teamjs.PCTEAMADMINLABEL + '"></span>';
    }

		if(!member.teamhidepass && !member.userhidepass)
		{
      htmlarrayrow[4] += "<span class='icon_show pc-bs-toggle' data-placement='left' title='" + g.lang.teamjs.PCTEAMCANSEEPASSWORDS + "'></span>";
    }

		if((!member.teamonlyadminshare && !member.usernoshare) || (member.admin && member.teamonlyadminshare))
		{
      htmlarrayrow[4] += "<span class='icon_share pc-bs-toggle' data-placement='left' title='" + g.lang.teamjs.PCTEAMCANSHAREPASSWORDS + "'></span>";
    }

		if(!member.approved)
		{
      // External users only shown for admin
		  if(!member.userid)
		  {
        htmlarrayrow[4] += '<span class="icon_warningext pc-bs-toggle marginLeft7" data-placement="left" title="' + g.lang.teamjs.PCTEAMNOTINSYSTEM + '"></span>';
      }
		  else
		  {
        htmlarrayrow[4] += '<span class="icon_warning2 pc-bs-toggle marginLeft7" data-placement="left" title="' + g.lang.teamjs.PCTEAMNOTAPPROVEDTEAM + '"></span>';
      }
		}

		if( (teaminfo[teamid].admin && opts.disableteamadmins === false) || (opts.disableteamadmins === true && opts.isglobaladmin) )
		{
		  htmlarrayrow[5] = "<input id='delete" + membersshown + "' name='" + i + "' title='" + g.lang.passwordsjs.PCPASSWORDSBUTTONDELETE + "' type='button' class='icon_delete icon_delete2 noPadding team-member-delete'>";
		  htmlarrayrow[5] += "<input id='update" + membersshown + "' name='" + i + "' title='" + g.lang.passwordsjs.PCPASSWORDSBUTTONEDIT + "' type='button' class='icon_edit icon_edit_member noPadding margin0 team-member-update'>";
		  if(!member.approved)
		  {
        htmlarrayrow[5] += "<input id='resend" + membersshown + "' name='" + i + "' title='" + g.lang.teamjs.PCTEAMBUTTONRESEND + "' type='button' class='icon_resend team-member-email-resend'>";
      }
		}

		htmlarray.push(htmlarrayrow);

		membersshown++;
	}

	g.teamrecordcount = htmlarray.length;
	g.teamtotalrecordcount = membersshown;

	document.getElementById('memberslist').innerHTML = buildtable(tablearrayheader, null, htmlarray, 'teamgrid', 'teammember table-bordered table-max-width table-white', '');

	var teamgrid = document.getElementById('teamgrid');

	// Do not store the sort object as we have no further use for it
	new Tablesort(teamgrid);

	// We have to paint the row backgrounds after sort/search as there may be hidden rows (sadly - but no other way)
	teamgrid.addEventListener('afterSort', function()
	{
	  tablesetbackgroundcolor(teamgrid);
	});

	document.getElementById('selall').onclick = selallfunc;

	// Event listeners
	let _selector = '.team-member-email-resend';
	$(_selector).off('click');
	$(_selector).on('click', function() {
    resendmemberfunc( parseInt($(this).attr('name')) );
	});

  _selector = '.team-member-delete';
  $(_selector).off('click');
  $(_selector).on('click', function() {
    deletememberfunc( parseInt($(this).attr('name')) );
  });

  _selector = '.team-member-update';
  $(_selector).off('click');
  $(_selector).on('click', function() {
    updatememberfunc( parseInt($(this).attr('name')) );
  });

  /* Double confetti
  for(var i = 0 ; i < membersshown ; i++)
  {
    if((teaminfo[teamid].admin && opts.disableteamadmins === false) || (opts.isglobaladmin === true && opts.disableteamadmins === true) )
    {
      var resend = document.getElementById('resend'+i);

      if(resend)
        resend.onclick = resendmemberfunc;

      document.getElementById('update'+i).onclick = updatememberfunc;
      document.getElementById('delete'+i).onclick = deletememberfunc;
    }
  }
  */

  document.getElementById('statustext').innerHTML = g.lang.passwordsjs.PCPASSWORDSRECORDCOUNTTEXT + ": " + g.teamrecordcount + '/' + g.teamtotalrecordcount;
  activateTooltip();
}

function setinfotext(teaminfo, teamid, memberobject)
{
	if(!teaminfo) {
    return;
  }

	var infotext = "<table class='table-info'>";

	infotext += "<tr><td style='font-weight:bold'>";
	infotext += g.lang.team.PCTEAMNAMELABEL + ": ";
	infotext += "</td><td id='infotextteamname'>";
	infotext += htmlspecialchars(teaminfo[g.tidshown].fields.name, ['ENT_QUOTES']);
	infotext += "</td></tr>";

	infotext += "<tr><td style='font-weight:bold'>";
	infotext += g.lang.team.PCTEAMCONTACTLABEL + ": ";
	infotext += "</td><td id='infotextteamcontact'>";
	infotext += htmlspecialchars(teaminfo[g.tidshown].fields.contact, ['ENT_QUOTES']);
	infotext += "</td></tr>";

  let email = htmlspecialchars(teaminfo[g.tidshown].fields.email, ['ENT_QUOTES']);
  //let popover = getPopoverContent(teaminfo[g.tidshown].fields);
  infotext += "<tr><td style='font-weight:bold'>";
	infotext += g.lang.team.PCTEAMEMAILLABEL + ": ";
	infotext += "</td><td>";
	//infotext += "<a href='index.html?page=messages&email=" + email + "' data-toggle='popover' title='Information' data-html='true' data-content='" + popover + "' data-trigger='hover'>" + email + "</a>";
  infotext += "<a href='index.html?page=messages&email=" + email + "'>" + email + "</a>";
	infotext += "</td></tr>";

  infotext += "<tr><td style='font-weight:bold'>";
	infotext += g.lang.teamjs.PCTEAMSTATUSLABEL + ": ";
	infotext += "</td><td>";
  if(!(teaminfo[g.tidshown].fields.options & pcrypt.teamoptions.hidepass))
  {
    infotext += "<span class='icon_show'></span>";
  }
  if(!(teaminfo[g.tidshown].fields.options & pcrypt.teamoptions.onlyadminshare))
  {
    infotext += "<span class='icon_share'></span>";
  }
	infotext += "</td></tr>";

	infotext += "</table>";

	infotext += "<br><br>";

	infotext += "<h3>" + g.lang.teamjs.PCTEAMADMINS + "</h3>";

  var tablearrayheader = [[g.lang.teamjs.PCTEAMEMAILLABEL, "style='text-align: left;'"], [g.lang.teamjs.PCTEAMNAMELABEL, "style='text-align: left;'"], [g.lang.teamjs.PCTEAMDEPARTMENTLABEL, "style='text-align: left;'"]];

	var htmlarray = new Array();

  for (var i = 0, len_i = memberobject[teamid].length; i < len_i; ++i)
	{
		let member = memberobject[teamid][i];

		if(member.admin == 0)
		{
      continue;
    }

    if(member.approved == 0)
    {
      continue;
    }

    let email = htmlspecialchars(member.email, ['ENT_QUOTES']);
    let name = htmlspecialchars(member.name, ['ENT_QUOTES']);
    let department = htmlspecialchars(member.department, ['ENT_QUOTES']);

		var htmlarrayrow = new Array(3);
    let popoverInfoContent = getPopoverContent(member);

    htmlarrayrow[0] = "<a href='index.html?page=messages&email=" + email + "' data-toggle='popover' title='Information' data-html='true' data-content='" + popoverInfoContent + "' data-trigger='hover'>" + email + "</a>";
    htmlarrayrow[1] = name;
		htmlarrayrow[2] = department;

		htmlarray.push(htmlarrayrow);
	}

	infotext += buildtable(tablearrayheader, null, htmlarray, 'teaminfogrid', 'table-bordered table-max-width table-white table-max-width', '');

	document.getElementById('infotext').innerHTML = infotext;

	new Tablesort(document.getElementById('teaminfogrid')); // Do not store the object as we have no further use for it
	//fillTeamInfo(teamid);
	activatePopover('div#content.team');
}

function newmemberfunc()
{
	if(g.tidshown === null || g.tidshown === undefined)
	{
		return;
	}

	var opts = pcrypt.getvalue('options');
	var username = pcrypt.getvalue('username');

	if(opts.disableteamadmins === true && opts.isglobaladmin === false)
	{
		modalalert('<div class="popup">'+g.lang.default.PCNOFEATUREACCESS+'</div>', g.lang.default.PCPROGRAMTITLE );
		return;
	}

	if(opts.disableteamadmins === false && (g.teaminfo[g.tidshown].admin < 1 && opts.isglobaladmin === false))
	{
		modalalert('<div class="popup">'+g.lang.default.PCNOFEATUREACCESS+'</div>', g.lang.default.PCPROGRAMTITLE);
		return;
	}

	if((typeof username !== 'string') || (username.length == 0))
	{
		var uri = parseUri(window.location.href);
		var url = uri.protocol + '://' + uri.host + uri.path + '?page=account&id=updateinfo';
		modalalert(g.lang.accountjs.PCACCOUNTUSERINFOREDIRECT, g.lang.default.PCPROGRAMTITLE, function redirect(value)
		{
			window.location.assign(url);
		});
		return;
	}

	var createdhtml = document.getElementById('createdhtml');
	var emailfield = document.getElementById('emailfield');
	var adminfield = document.getElementById('adminfield');
	var hidefield = document.getElementById('hidefield');
	var sharefield = document.getElementById('sharefield');

	var date = new Date();

	createdhtml.innerHTML = date.format(g.lang.default.JS_DATEFORMAT);
	emailfield.value = "";
	adminfield.checked = false;
	hidefield.checked = false;
	emailfield.disabled = false; // disabled on edit

	// if team hide is true hide hidefield ;-)
	if(g.teaminfo[g.tidshown].fields.options & pcrypt.teamoptions.hidepass)
	{
	$('.teammemberedit-hidefield').hide();
	}
	else
	{
	$('.teammemberedit-hidefield').show();
	}

	// if team adminshare is true show sharefield
	if(g.teaminfo[g.tidshown].fields.options & pcrypt.teamoptions.onlyadminshare)
	{
	$('.teammemberedit-sharefield').hide();
	}
	else
	{
	$('.teammemberedit-sharefield').show();
	}

	emailfield.focus();

	modaldiv('#dialog-teammemberedit', 600, g.lang.teameditjs.PCTENEWTITLE, false, false, function() {} , function (result)
	{
		if(result)
		{
      if(emailfield.value.length > 128)
			{
        emailfield.value = substr(emailfield.value, 0, 127);
      }

      // Test of correct email adr
      if(true != validemail(emailfield.value))
      {
        modalalert(g.lang.contactjs.PCCONTACTINVALIDEMAIL, g.lang.default.PCPROGRAMTITLE);
        return true; // Avoid close of dialog
      }

			// Test if email is already in the member list
			for(let i = 0, i_len = g.memberobject[g.tidshown].length ; i < i_len ; i++)
			{
				if(emailfield.value == g.memberobject[g.tidshown][i].email)
				{
					modalalert(g.lang.teamjs.PCTEAMMEMBEREXIST, g.lang.default.PCPROGRAMTITLE);
					return true; // Avoid close of dialog
				}
			}

			var level = adminfield.checked ? 1 : 0;

			var options = 0;

			if(hidefield.checked)
			{
			  options += pcrypt.useroptions.hidepass;
      }
			if(sharefield.checked)
			{
        options += pcrypt.useroptions.noshare;
      }

			var langcode = pcrypt.getvalue('languagecode', false) || 'en';

			teamaddmember(emailfield.value.toLowerCase(), level, options, langcode);
		}
	});
}

/**
 * @name updatememberfunc
 * @description Updating team member by clicking edit icon
 * @param {int} index
 */
function updatememberfunc(index)
{
	if(g.tidshown === null || g.tidshown === undefined)
	{
		return;
	}

  //var index = Number((e.srcElement||e.target).name);
	var member = g.memberobject[g.tidshown][index];
	var opts = pcrypt.getvalue('options');
  let myid = pcrypt.getvalue('userid');

	countOwnedTeams();

	if(opts.disableteamadmins === true && opts.isglobaladmin === false)
	{
		modalalert('<div class="popup">'+g.lang.default.PCNOFEATUREACCESS+'</div>', g.lang.default.PCPROGRAMTITLE);
		return;
	}

	/**
	 * If disableteamadmins is false and user is free, 
	 * check if they have more than the allowed number of teams 
	 * and that they're admin for the selected team.
	 * */ 
	if(opts.disableteamadmins === false && pcrypt.getvalue('premium')<1 && (g.teamsUserOwned > premRes.teamsMaxFree && g.teaminfo[g.tidshown].admin < 1))
	{
		modalalert('<div class="popup">'+g.lang.team.PCNOTEAMEDITFREE+'</div>', g.lang.default.PCPROGRAMTITLE);
		return;
	}

	var createdhtml = document.getElementById('createdhtml');
	var emailfield = document.getElementById('emailfield');
	var adminfield = document.getElementById('adminfield');
	var hidefield = document.getElementById('hidefield');
	var sharefield = document.getElementById('sharefield');

	createdhtml.innerHTML = (new Date().setFromMysql(member.created)).format(g.lang.default.JS_DATETIMEFORMAT);
	emailfield.value = member.email;
	adminfield.checked = member.admin;

	// if team hide is true hide hide field
	if(g.teaminfo[g.tidshown].fields.options & pcrypt.teamoptions.hidepass)
	{
		$('.teammemberedit-hidefield').hide();
	}
	else
	{
		$('.teammemberedit-hidefield').show();
		hidefield.checked = member.userhidepass ? true : false;
	}

	// if team adminshare is true show sharefield
	if(g.teaminfo[g.tidshown].fields.options & pcrypt.teamoptions.onlyadminshare)
	{
		$('.teammemberedit-sharefield').hide();
	}
	else
	{
		$('.teammemberedit-sharefield').show();
		sharefield.checked = member.usernoshare ? true : false;
	}

	emailfield.disabled = true;
	adminfield.focus();

	modaldiv('#dialog-teammemberedit', 600, g.lang.teameditjs.PCTEAMEDITTITLE, false, false, function() {}, function (result)
	{
		if(result)
		{
			if(emailfield.value.length > 128)
			{
        emailfield.value = substr( emailfield.value, 0, 127 );
      }

			// Test of correct email adr
			if(true != validemail(emailfield.value))
			{
				modalalert(g.lang.contactjs.PCCONTACTINVALIDEMAIL, g.lang.default.PCPROGRAMTITLE);
				return true; // Avoid close of dialog
			}

			var level = adminfield.checked ? 1 : 0;

			var options = 0;

			if(hidefield.checked)
			{
        options += pcrypt.useroptions.hidepass;
      }
			if(sharefield.checked)
			{
			  options += pcrypt.useroptions.noshare;
      }

			loader(true);

			pcrypt_teameditmember(pcrypt.getvalue('session'), g.tidshown, emailfield.value, level, options, 0, function editmemberfunc(data, error, id)
			{
				if(error)
				{
          switch ( error )
          {
            default:
              handlepcrypterror( error, data );
              return;

            case 19:
              modalalert( g.lang.teamjs.PCTEAMLASTADMINWARNING, g.lang.default.PCPROGRAMTITLE );
              return;
          }
        }

				member.admin = level;
				member.userhidepass = options & pcrypt.useroptions.hidepass;
				member.usernoshare = options & pcrypt.useroptions.noshare;

        if(member.userid == myid)
        {
          initdata(true, 'members'); // If we change ourself we need better handling/update
        }
        else
        {
          setmemberlist(g.teaminfo, g.tidshown, g.memberobject);
        }

				pcrypt.setvalue('teamchanges', 1); // force update other places

				loader(false);
			});
		}
	});
}

/**
 * @name deletememberfunc
 * @description Deleting team member by clicking delete icon
 * @param {int} index
 */
function deletememberfunc(index)
{
	//var index = Number((e.srcElement||e.target).name);
	var member = g.memberobject[g.tidshown][index];
	var opts = pcrypt.getvalue('options');

	if((opts.disableteamadmins && !opts.isglobaladmin) || !opts.disableteamadmins && g.teaminfo[g.tidshown].admin < 1 && opts.isglobaladmin === false)
	{
		modalalert(g.lang.default.PCNOFEATUREACCESS, g.lang.default.PCPROGRAMTITLE);
		return;
	}

	modalconfirm(g.lang.teamjs.PCTEAMMEMBERDELETECONFIRM + ": " + htmlspecialchars(member.email, ['ENT_QUOTES']), g.lang.default.PCPROGRAMTITLE, function(r)
	{
		if(r)
		{
			loader(true);

      pcrypt_teamremovemember(pcrypt.getvalue('session'), g.tidshown, member.email, [member.userid], removemembercallback);
		}
	});
}


function resendmemberfunc(index)
{
  //var index = Number((e.srcElement||e.target).name);
  var member = g.memberobject[g.tidshown][index];

  modalconfirm(g.lang.teamjs.PCTEAMMEMBERRESENDCONFIRM, g.lang.default.PCPROGRAMTITLE, function(r)
  {
    if(r)
    {
      var emailfield = member.email;
	    var adminfield = member.admin;

	    var options = 0 ;

	    if(member.userhidepass)
	    {
	      options += pcrypt.useroptions.hidepass;
      }
	    if(member.usernoshare) {
	      options += pcrypt.useroptions.noshare;
      }

      var langcode = pcrypt.getvalue('languagecode', false) || 'en';

			loader(true);

			pcrypt_teamaddmember(pcrypt.getvalue('session'), g.tidshown, emailfield, adminfield, options, langcode, 0, function addmemberfunc(data, error, id)
			{
			  if(error)
		    switch(error)
		    {
			    default:
				    handlepcrypterror(error, data);
			    return;
		    }

			  loader(false);
			});
    }
  });
}

function searchmember()
{
    var shownrecords = tablesearch(document.getElementById('teamgrid'), null, document.getElementById('searchmember').value);
    document.getElementById('statustext').innerHTML = g.lang.passwordsjs.PCPASSWORDSRECORDCOUNTTEXT + ": " + shownrecords + '/' + g.teamtotalrecordcount;
}

function getselectedusers()
{
  var items = [];

	for(var i = 0 ; i < g.teamrecordcount ; i++)
	{
		var selid = 'selid' + i;
		if(document.getElementById(selid).checked)
		{
      items.push( document.getElementById( selid ).name );
    }
	}

	return items;
}

function removemembercallback(data, error, removedids)
{
  if(error)
  {
    switch(error)
    {
      default:
        handlepcrypterror(error, data);
      return;

      case 19:
        modalalert(g.lang.teamjs.PCTEAMLASTADMINWARNING, g.lang.default.PCPROGRAMTITLE);
      return;
    }
  }

  // Get old teamkey
  let priorteamkeys = false;

  // Did the removed user generate any current team keys?
  for (var i = 0; i < removedids.length; i++)
  {
    let removeuserid = removedids[i];

    if(typeof removeuserid !== 'number')
    {
      continue; // Must be a unknown user to the system (null value)
    }

    // See if any users in the team have keys from this user we are about to remove
    for (let j = 0, len_j = g.memberobject[g.tidshown].length; j < len_j; ++j)
    {
      let user = g.memberobject[g.tidshown][j];

      if(user.userid === removeuserid)
      {
        continue;
      }

      if(user.teamkeysdata !== null)
      {
        if(user.teamkeysfromid === removeuserid)
        {
          // We found a user that is to be deleted that have shared teamkeys - have to save teamkeys again
          let priorteamkeys = handleTeamKeys([g.tidshown], false, false, false);

          if(priorteamkeys.length() === 0)
          {
            console.log('Found no current teamkeys for team: ' + g.tidshown);
            priorteamkeys = true;
          }
        }
      }
    }
  }

  g.teammembers = data;

  // This is needed for the handleTeamKeys function
  g.teamobject = convertteammembers(g.teammembers);
  //g.teamobject = convertteammembers(g.teammembers);
  //g.teammembers = cleanmembers(g.teammembers, g.teamobject);

  // This is needed for this page
  g.memberobject = createteammemberlist(g.teammembers);
  setmemberlist(g.teaminfo, g.tidshown, g.memberobject);

  // Update team keys (g.teamobject have to be updated first)
  let teamkeys = handleTeamKeys([g.tidshown], priorteamkeys, true, false); // No use for the return vale - just check that there are users

  if(!validNestedObj(teamkeys, g.tidshown) || teamkeys[g.tidshown].length === 0)
  {
    console.log('Invalid teamkeys update');
  }

  let myid = pcrypt.getvalue('userid');

  // Test if we have deleted ourself from the team
  if(removedids.indexOf(myid) !== -1)
  {
    initdata(true);
  }
  else
  {
    pcrypt.setvalue('teamchanges', 1); // force update other places as pcrypt.getteammembers have a local cache
    loader(false);
  }
}

function delcheck()
{
	var items = getselectedusers();
	var opts = pcrypt.getvalue('options');

	if((opts.disableteamadmins && !opts.isglobaladmin) || (!opts.disableteamadmins && g.teaminfo[g.tidshown].admin < 1))
	{
		modalalert(g.lang.default.PCNOFEATUREACCESS, g.lang.default.PCPROGRAMTITLE);
		return;
	}

	if(items.length == 0)
	{
		modalalert(g.lang.passwordsjs.PCPASSWORDSNOSELECTIONTEXT, g.lang.default.PCPROGRAMTITLE);
		return;
	}

	modalconfirm(g.lang.passwordsjs.PCPASSWORDSGROUPMULTIDELETE + " (" + items.length + ")", g.lang.default.PCPROGRAMTITLE, function(r)
	{
		if(r)
		{
			loader(true);

			var emailarray = new Array();
      var useridarray = new Array();

			for (var i = 0; i < items.length; i++)
			{
				emailarray.push(g.memberobject[g.tidshown][items[i]].email);
        useridarray.push(g.memberobject[g.tidshown][items[i]].userid);
			}

      pcrypt_teamremovemember(pcrypt.getvalue('session'), g.tidshown, emailarray, useridarray, removemembercallback);
		}
	});
}

function exportcheck()
{
	var opts = pcrypt.getvalue('options');
	var premVal = pcrypt.getvalue('premium');
	g.teamsUserOwned = 0;

	if(opts.disableexport === true && !opts.isglobaladmin)
	{
		modalalert(g.lang.default.PCNOFEATUREACCESS, g.lang.default.PCPROGRAMTITLE);
		return;
	}

	if(opts.disableteamadmins === true && !opts.isglobaladmin)
	{
		modalalert(g.lang.default.PCNOFEATUREACCESS, g.lang.default.PCPROGRAMTITLE);
		return;
	}

	if(opts.disableteamadmins === false && opts.disableexport === false && (g.teaminfo[g.tidshown].admin <= 0 && opts.isglobaladmin === false))
	{
		modalalert(g.lang.default.PCNOFEATUREACCESS, g.lang.default.PCPROGRAMTITLE);
		return;
	}

	var items = getselectedusers();

	if(!items.length)
	{
		modalalert(g.lang.passwordsjs.PCPASSWORDSNOSELECTIONTEXT, g.lang.default.PCPROGRAMTITLE);
		return;
	}

	saveDataAsFile('pcryptuserexport.txt', 'text/plain', exportcsv(g.memberobject[g.tidshown], items, {columns: ["email", "admin", "teamhidepass","teamonlyadminshare"]}));

}

// Team functions below

function clearallteamitems()
{
  document.getElementById('name').value = "";
  document.getElementById('contact').value = "";
  document.getElementById('email').value = pcrypt.getvalue('email');
  document.getElementById('noreply').checked = false;
  document.getElementById('teamhide').checked = false;
  document.getElementById('adminshare').checked = false;
}

function setallteamitems(teamfields)
{
	if(typeof teamfields != "object")
		return;

	for(var name in teamfields)
	{
		try
		{
		  switch(name)
		  {
		    default:
		      document.getElementById(name).value = teamfields[name];
		    break;

		    case 'options':
		      // NB: this can be extended to more options
		      document.getElementById('noreply').checked = teamfields[name] & pcrypt.teamoptions.realemail ? true : false;
		      document.getElementById('teamhide').checked = teamfields[name] & pcrypt.teamoptions.hidepass ? true : false;
		      document.getElementById('adminshare').checked = teamfields[name] & pcrypt.teamoptions.onlyadminshare ? true : false;
		    break;
		  }
		}
		catch(err)
		{
		  console.log('Unknown team field detected');
		}
	}
}

function getallteamitems(ny)
{
	var name = document.getElementById('name');
	var contact = document.getElementById('contact');
	var email = document.getElementById('email');
	var noreply = document.getElementById('noreply');
	var teamhide = document.getElementById('teamhide');
	var adminshare = document.getElementById('adminshare');
	var opts = pcrypt.getvalue('options');
	var options = 0;

	if(opts.disableusersetinfo === true && opts.isglobaladmin !== true)
	{
		modalalert(g.lang.default.PCNOFEATUREACCESS, g.lang.default.PCPROGRAMTITLE);
		return;
	}

	//var testfields = new Array(name, contact, street, zip, city, country);
	var testfields = new Array(name, contact);

	for(var i = 0 ; i < testfields.length ; i++)
	{
		if(testfields[i].value.length == 0)
		{
			testfields[i].focus();
			modalalert(g.lang.teamjs.PCTEAMNOVALUE, g.lang.default.PCPROGRAMTITLE);
			return false;
		}
	}

	if(false == validemail(email.value))
	{
		modalalert(g.lang.accountjs.PCACCOUNTNOTVALIDEMAIL, g.lang.default.PCPROGRAMTITLE, function modalalertreturn(value)
		{
			email.focus();
		});
		return false;
	}
	// If the useremailinreply config option is true don't allow the user to change the "realemail" option
	if(opts.useremailinreply == false && opts.useremailinreply != 'undefined')
	{
		if(noreply.checked) options += pcrypt.teamoptions.realemail;
	}
	if(teamhide.checked) options += pcrypt.teamoptions.hidepass;
	if(adminshare.checked) options += pcrypt.teamoptions.onlyadminshare;
	
	return ({name:name.value, contact:contact.value, email:email.value, options:options});
}

function createTeam()
{
	var opts = pcrypt.getvalue('options');
	var premVal = pcrypt.getvalue('premium');

	g.teamsUserOwned = 0;
	
	countOwnedTeams();

	if(loader())
      return;

  	if(!validlogin())
	{
		modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
		return;
	}

	// If disableteamcreate is true or user is globaladmin.
	if( (opts.disableteamcreate === true && opts.isglobaladmin === false) || (opts.disableteamadmins === true && opts.isglobaladmin === false) )
	{
		modalalert(g.lang.default.PCNOFEATUREACCESS, g.lang.default.PCPROGRAMTITLE);
		return;
	}
	// If user is free and not globaladmin and that user has more teams than allowed.
	if((premVal <=0 && opts.isglobaladmin === false) && (g.teamsUserOwned >= premRes.teamsMaxFree))
	{
		modalalert(g.lang.team.PCNOTEAMEDITFREE, g.lang.default.PCPROGRAMTITLE);
		return;
	}

	var teamitems = getallteamitems();
	
	if(teamitems == false)
		return;

	loader(true);
  var newTeamID = 0;

	pcrypt_teamcreate(pcrypt.getvalue('session'), teamitems.name, teamitems.contact, teamitems.email, teamitems.options, 0, function createteamfunc(data, error, id)
	{
		if(error)
    {
      switch(error)
      {
        case 29:
          modalPremiumRestriction(g.lang.team.PCNOTEAMCREATEFREE);
        return;
  
        default:
          handlepcrypterror(error, data);
        return;
      }
    }
    
    pcrypt.setvalue('tidshown', data.teamid);
    newTeamID = data.teamid;
		//pcrypt.setdata(pcrypt.getvalue('session'), pcrypt.getvalue('keycrypt'), 'setting.tidshown', data.teamid, false, 0);
		loader(false);
    modalalert(g.lang.teamjs.PCTEAMCREATED, g.lang.default.PCPROGRAMTITLE, false);
    initdata(true);
	});
  
  updatemenu(g.teaminfo, false, newTeamID);
}

function updateTeam()
{
	var opts = pcrypt.getvalue('options');

	if(loader())
      return;

  if(!validlogin())
	{
		modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
		return;
	}
	
	if(g.tidshown === undefined || g.tidshown === null)
	{
		return;
	}

	if((opts.disableusersetinfo === true || opts.disableteamadmins === true) && !opts.isglobaladmin)
	{
		modalalert(g.lang.default.PCNOFEATUREACCESS, g.lang.default.PCPROGRAMTITLE);
		return;
	}

	var teamitems = getallteamitems();

	if(teamitems == false)
		return;

	loader(true);

	pcrypt_teamedit(pcrypt.getvalue('session'), g.tidshown, teamitems.name, teamitems.contact, teamitems.email, teamitems.options, 0, function editteamfunc(data, error, id)
	{
		if(error)
		switch(error)
		{
			case 6:
				modalalert(g.lang.teamjs.PCTEAMPRIOREXIST, g.lang.default.PCPROGRAMTITLE);
			return;

			default:
				handlepcrypterror(error, data);
			return;
		}

		g.teaminfo[g.tidshown].fields = teamitems;

		loader(false);

		modalalert(g.lang.teamjs.PCTEAMUPDATED, g.lang.default.PCPROGRAMTITLE, false);

		initdata(true);
	});
}

function deleteTeam()
{

	var opts = pcrypt.getvalue('options');

	if(loader())
	{
    return;
  }

	if(!validlogin())
	{
		modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
		return;
	}

	if(g.tidshown === null || g.tidshown === undefined)
	{
		return;
	}

	if( (opts.disableteamadmins === true && opts.isglobaladmin === true) || opts.disableteamadmins === false)
	{
		modalprompt(g.lang.default.PCPASSWORDSCONFIRMPASSWORDTEXT, g.lang.default.PCPROGRAMTITLE, 'PASSWORD', "", 64, null, function (pass)
		{
      if(pass != false)
      {
      var keys = pcrypt.generatekeys(pass, pcrypt.getvalue('saltcrypt'));

          if(keys.aes !== pcrypt.getvalue('keycrypt'))
          {
            modalalert(g.lang.default.PCPASSWORDSWRONGPASSWORD, g.lang.default.PCPROGRAMTITLE);
            return;
          }

        loader(true);

        var confirmtext = '<h3>' + g.lang.teamjs.PCTEAMDELETEDCONFIRM + '</h3>' + g.lang.teamjs.PCTEAMDELETEDTEAM + '<br>' + '<span class="bold">' +
          htmlspecialchars(g.teaminfo[g.tidshown].fields.name, 'ENT_QUOTES') + '</span><p>' + g.lang.teamjs.PCTEAMDELETEDTEAMUSERS + ' <span class="bold">' + g.memberobject[g.tidshown].length + '</span></p>';

        // Confirm action (show amount of users)
        modalconfirm(confirmtext, g.lang.default.PCPROGRAMTITLE, function deleteteamconfirmfunc(returnvalue)
        {
          if(returnvalue)
          {
            pcrypt_teamdelete(pcrypt.getvalue('session'), g.tidshown, 0, function deleteteamfunc(data, error, id) {
              if (error) {
                handlepcrypterror(error, data);
                return;
              }

              loader(false);

              modalalert(g.lang.teamjs.PCTEAMDELETED, g.lang.default.PCPROGRAMTITLE, false);

              initdata(true);
            });
          }
        });
      }
		});
	}
	else
	{
		modalalert(g.lang.default.PCNOFEATUREACCESS, g.lang.default.PCPROGRAMTITLE);
	}
}

function leaveTeam()
{
	if(loader())
		return;

	if(!validlogin())
	{
		modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
		return;
	}

	modalprompt(g.lang.default.PCPASSWORDSCONFIRMPASSWORDTEXT, g.lang.default.PCPROGRAMTITLE, 'PASSWORD', '', 64, null, function (pass)
	{
		if(pass != false)
		{
		var keys = pcrypt.generatekeys(pass, pcrypt.getvalue('saltcrypt'));

				if(keys.aes !== pcrypt.getvalue('keycrypt'))
				{
					modalalert(g.lang.default.PCPASSWORDSWRONGPASSWORD, g.lang.default.PCPROGRAMTITLE);
					return;
				}

			loader(true);

			pcrypt_teamleave(pcrypt.getvalue('session'), g.tidshown, 0, function deleteteamfunc(data, error, id)
			{
				if(error)
			switch(error)
			{
				default:
					handlepcrypterror(error, data);
				return;

				case 19:
				modalalert(g.lang.teamjs.PCTEAMLASTADMINWARNING, g.lang.default.PCPROGRAMTITLE);
				return;
			}

				loader(false);

				initdata(true);
			});
		}
	});
}

function getselectedpass()
{
  var items = [];

	for(var i = 0; i < g.passrecordcount; i++)
	{
		var selelem = document.getElementById('selid' + i);

        if (selelem && selelem.checked)
            items.push(selelem.name);
    }

	// We need to sort them as shares with same name may be in between
	items.sort(function compareNumbers(a, b)
	{
    	return a - b;
  	});

    return items;
}

function pcryptteamimport(perform, format, importtext)
{
	var opts = pcrypt.getvalue('options');

	if((g.teaminfo[g.tidshown].admin < 1 && opts.isglobaladmin === false) && opts.disableteamadmins === false)
	{
		modalalert(g.lang.team.PCTEAMNOADMINNOIMPORT, g.lang.default.PCPROGRAMTITLE);
		return;
	}

	if(opts.disableteamadmins === true && opts.isglobaladmin === false)
	{
		modalalert(g.lang.team.PCTEAMNOADMINNOIMPORT, g.lang.default.PCPROGRAMTITLE);
		return;
	}

	var headerarray = [];
	var valueobject = {};
	var importarray = [];
	//var selvalues = document.getElementById('selectedimportvalues');
	//var seltype = document.getElementById('selectedimporttype');
	//var firstlinetitle = document.getElementById('firstlinetitle');
	//var newlinechar = document.getElementById('newlinechar');
	//var importtext = document.getElementById('import-textarea').value;

	if(importtext.length)
	switch(format.type)
	{
		default:
			importarray = CSV.csvToArray(importtext, true);
		break;

		case 'tab':
			importarray = importtext.split('\n')

			for (var i = 0, len_i = importarray.length; i < len_i; ++i)
				importarray[i] = importarray[i].split('\t');
		break;
	}

	for (var i = 0, rem_i = 0, len_i = format.fields.length; i < len_i; ++i)
	{
		if(format.fields[i].value.length)
		{
			valueobject[format.fields[i].value] = headerarray.length;
			headerarray[headerarray.length] = [format.fields[i].text];
		}
		else
		{
			for (var j = 0, len_j = importarray.length; j < len_j; ++j)
			if(importarray[j].length > (i-rem_i))
						importarray[j].remove(i-rem_i);
			++rem_i;
		}
	}

	// remove remaining items
	for (var j = 0, len_j = importarray.length; j < len_j; ++j)
				importarray[j] = importarray[j].slice(0, headerarray.length);

	if(format.titleline)
		importarray.remove(0);

	if(importarray.length == 0)
	{
		modalalert(g.lang.importjs.PCIMPORTNOTHINGTOIMPORT, g.lang.default.PCPROGRAMTITLE);
		return false;
	}

	if(!perform)
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

		var emailarray = new Array();
		var adminarray = new Array();
		var optionsarray = new Array();

		for (var j = 0, len_j = importarray.length; j < len_j; ++j)
		{
      let importline = importarray[j];

      let email = importline[valueobject.email];
			let admin = importline[valueobject.admin];
			let hide = importline[valueobject.hide];
			let noshare = importline[valueobject.noshare];
			let options = 0;

			if(typeof email !== 'string')
			  email = email.toString();

      email = email.trim(); // Remove white spaces in front and rear

      if(!email.length) // Test for empty string
        continue;

      if(email.length > 128)
          email = substr(email, 0, 127);

			// Test of correct email adr
			if(true !== validemail(email))
			{
				var errorstring = g.lang.contactjs.PCCONTACTINVALIDEMAIL + ' ['+ g.lang.teamjs.PCTEAMLINELABEL + ' ' + (j+1) + ']';

				modalalert(errorstring, g.lang.default.PCPROGRAMTITLE);
				return false;
			}

			if(admin)
			{
				if((typeof admin === 'string') && (admin.toUpperCase() === 'FALSE'))
					admin = 0;
				else
					admin = 1;
			}
			else
				admin = 0;

			if(hide)
			{
				if((typeof hide !== 'string') || (hide.toUpperCase() !== 'FALSE'))
					options += pcrypt.useroptions.hidepass;
			}

			if(noshare)
			{
				if((typeof hide !== 'string') || (hide.toUpperCase() !== 'FALSE'))
					options += pcrypt.useroptions.noshare;
			}

			emailarray.push(email.toLowerCase());
			adminarray.push(admin);
			optionsarray.push(options);
		}

		var langcode = pcrypt.getvalue('languagecode', false) || 'en';

    teamaddmember(emailarray, adminarray, optionsarray, langcode);

    /*pcrypt_teamaddmember(pcrypt.getvalue('session'), g.tidshown, emailarray, adminarray, optionsarray, langcode, 0, function addmemberfunc(data, error, id)
		{
			if(error)
			switch(error)
			{
				default:
					handlepcrypterror(error, data);
				return false;
			}

			// We need to get the complete list as some fields may be picked up from the database (public key)
			pcrypt.getteammembers(pcrypt.getvalue('session'), true, 'pcryptteammembers', 0, function teammembersfunc(data, error, id)
			{
				if(error)
				switch(error)
				{
					default:
						handlepcrypterror(error, data);
					return false;
				}

				g.teammembers = data;

				g.memberobject = createteammemberlist(g.teammembers);
				setmemberlist(g.teaminfo, g.tidshown, g.memberobject);

				$("#menu-team-import").slideUp();
				loader(false);
			});

		});
		*/
		return true;
	}
}


/**
 * @name countOwnedTeams
 * @description As it's named, a function that counts how many teams a user is the owner of
 * Call this function whenever a team owner deletes a team to update the value and whenever a team is created.
 */
function countOwnedTeams()
{
	var email = pcrypt.getvalue('email');
	if(g.teaminfo != undefined)
	{
		g.teamsUserOwned = 0; /* Reset before counting otherwise the system will keep adding to g.teamsUserOwned */
		Object.keys(g.teaminfo).forEach(function (key)
		{
			if(g.teaminfo[key].admin === 2)
			{
				g.teamsUserOwned = g.teamsUserOwned + 1;
			}
		});
		return g.teamsUserOwned;
	}
	else
	{
		g.teamsUserOwned = 0;
	}
}
/**
 * @name checkAdminStatus
 * @description Switch control structure for checking admin status of user and subsequently hiding/showing buttons accordingly
 * @param {Object} opts options object for checking configurations.
 * 
 */
function checkAdminStatus(opts)
{
	if( g.teaminfo === false )
	{
		return;
	}

	if( !g.tidshown || !g.teaminfo[g.tidshown])
	{
		$('#teaminfobutton').hide();
		$('#teamupdatebutton').hide();
		$('#teamleavebutton').hide();
		$('#teamdeletebutton').hide();
		$('#teamsharesbutton').hide();
		$('.menuteamadmin').hide();
		$('#addmemberbutton').hide();
		$('#deletememberbutton').hide();
		$('#buttonimport').hide();
		$('#exportmemberbutton').hide();
		return;
	}

	if(opts.disableteamadmins == false)
	{
		if(g.teaminfo !== undefined && g.tidshown !== undefined && g.tidshown !== null && g.teaminfo[g.tidshown].admin !== undefined)
		{
			switch (g.teaminfo[g.tidshown].admin) 
			{
				case 0:
					$('#teaminfobutton').show();
					$('#teamupdatebutton').hide();
					$('#teamleavebutton').show();
					$('#teamdeletebutton').hide();
					$('#teamsharesbutton').hide();
					$('.menuteamadmin').show();
					$('#addmemberbutton').hide();
					$('#deletememberbutton').hide();
					$('#buttonimport').hide();
					$('#exportmemberbutton').hide();
        break;

				case 1:
				case 2:
					$('#teaminfobutton').show();
					$('#teamleavebutton').show();
					$('#teamsharesbutton').show();
					$('.menuteamadmin').show();
					$('#teamupdatebutton').show();
					$('#teamdeletebutton').show();
					if(opts.disableexport == true && !opts.isglobaladmin)
					{
						$('#exportmemberbutton').hide();
					}
					else
					{
						$('#exportmemberbutton').show();
					}
        break;
			
				default:
        break;
			}
		}
	}
	else
	{
    // If globaladmin show everything.
    if(opts.isglobaladmin)
    {
      $('#teaminfobutton').show();
      $('#teamupdatebutton').show();
      $('#teamleavebutton').show();
      $('#teamdeletebutton').show();
      $('#teamsharesbutton').show();
      $('.menuteamadmin').show();
      $('#addmemberbutton').show();
      $('#deletememberbutton').show();
      $('#exportmemberbutton').show();
      $('#buttonimport').show();
    }
    
		$('#teaminfobutton').show();
		$('.menuteamadmin').show();
		$('#addmemberbutton').hide();
		$('#deletememberbutton').hide();
		$('#buttonimport').hide();
		$('#exportmemberbutton').hide();
	}
}

function teamaddmember(emailfield, level, options, langcode) 
{
  loader(true);

  pcrypt_teamaddmember(pcrypt.getvalue('session'), g.tidshown, emailfield, level, options, langcode, 0, function addmemberfunc(data, error, id)
  {
    if(error)
      switch(error)
      {
        default:
          handlepcrypterror(error, data);
          return;
      }

    // Make userid array from share field
    var newuserids = [];

    for(let i = 0, i_len = data.share.length ; i < i_len ; i++)
    {
      newuserids.push(data.share[i].userid);
    }

    // We need to get the complete list as some fields may be picked up from the database (public key and team data)
    pcrypt.getteammembers(pcrypt.getvalue('session'), true, 'pcryptteammembers', 0, function teammembersfunc(data, error, id)
    {
      if(error)
        switch(error)
        {
          default:
            handlepcrypterror(error, data);
            return;
        }

      g.teammembers = data;

      // This is needed for the handleTeamKeys function
      g.teamobject = convertteammembers(g.teammembers);
      //g.teammembers = cleanmembers(g.teammembers, g.teamobject); // Will this give problems in some places ?

      // This is needed for this page
      g.memberobject = createteammemberlist(g.teammembers);
      setmemberlist(g.teaminfo, g.tidshown, g.memberobject);

      // Update team keys (g.teamobject have to be updated first)
      let teamkeys = handleTeamKeys([g.tidshown], false, false, newuserids); // No use for the return vale - just check that there are users

      if(!validNestedObj(teamkeys, g.tidshown) || teamkeys[g.tidshown].length === 0)
      {
        console.log('Invalid teamkeys update');
      }

      pcrypt.setvalue('teamchanges', 1); // force update other places as pcrypt.getteammembers have a local cache

      loader(false);
    });
  });
}
