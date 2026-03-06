"use strict";

var pcshare = {};

pcshare.newmemberarray =  [];
pcshare.teamobject = null;
pcshare.div = null;
pcshare.teamrecordcount = null;
pcshare.memberrecordcount = null;

pcshare.show = function(div, width, title, returnisok, hidecancel, disabledtabs, activetab, onopen, callback)
{
  pcshare.div = div;

  $(div).tabs({active: activetab, disabled: disabledtabs}); // Activate tabs and set the default and possible disable some
  
  //if(!pcrypt.getvalue('teamsharing')) 
  //$(div).tabs( "option", "active", 1 ); // TODO - remove

  modaldiv(div, width, title, returnisok, hidecancel, onopen, function (returnvalue)
  {
    var newshares = {};
    var memberindex;

    if(returnvalue == false)
    {
      callback(null, null);
      return;
    }

    // Get new selections
    //if(pcrypt.getvalue('teamsharing')) 
    {
      for(var i = 0 ; i < pcshare.teamrecordcount ; i++)
      {
        let selid = 'share-selidteam' + i;
        let selelm = document.getElementById(selid);

        if(selelm && selelm.checked)
        {
          if(!Array.isArray(newshares[0]))
            newshares[0] = [];

          newshares[0].push(Number(selelm.name)); 
        }
      }
    }

    for(var i = 0 ; i < pcshare.memberrecordcount ; i++)
    {
      let selid = 'share-selidmember' + i;
      let selelm = document.getElementById(selid);

      if(selelm && selelm.checked)
      {
        memberindex = Number(selelm.name);

        if(!Array.isArray(newshares[g.teammembers[memberindex].userid]))
          newshares[g.teammembers[memberindex].userid] = [];

        newshares[g.teammembers[memberindex].userid].push(g.teammembers[memberindex].teamid);
      }
    }

    var newemail = document.getElementById('share-newmembeedit').value;
    if(newemail.length && validemail(newemail))
    {
      // Try to add the missing e-mails
      document.getElementById('share-buttonaddmember').click();
    }

    callback(newshares, pcshare.newmemberarray);
  });
};

pcshare.init = function(sharesselected, teammembers, teamobject)
{
  /*
  var teamtab = document.getElementById('tab-team');
  if(teamtab && !pcrypt.getvalue('teamsharing')) // Will not be there with the second call as it has been removed
  {
    teamtab.remove();
    //$("#share-tabs").tabs("refresh");
  }
*/

  pcshare.teamobject = teamobject;

  addClearSearchIcon('share-searchteam', pcshare.searchteam);
  document.getElementById('share-searchteam').onkeyup = function (event)
  {
    pcshare.searchteam();
  };

  document.getElementById('share-teamselect').onchange = function (event)
  {
    //if(jQuery(this)[0].sumo)
    //    jQuery(this)[0].sumo.reload();
    var teamselect = document.getElementById('share-teamselect');
    document.getElementById('share-searchmember').value = "";
    tablesearch(document.getElementById('share-membergrid'), teamselect[teamselect.selectedIndex].value, document.getElementById('share-searchmember').value);
  };

  addClearSearchIcon('share-searchmember', pcshare.searchmember);
  document.getElementById('share-searchmember').onkeyup = function (event)
  {
    pcshare.searchmember();
  };

  document.getElementById('share-buttonaddmember').onclick = function (event)
  {
    if(!Array.isArray(pcshare.newmemberarray))
      pcshare.newmemberarray = [];

    var emails = document.getElementById('share-newmembeedit').value.toLowerCase();
    if (emails == '')
    {
      modalalert(g.lang.contactjs.PCCONTACTINVALIDEMAIL, g.lang.default.PCPROGRAMTITLE);
      return;
    }

    var teamselectelm = document.getElementById('share-teamselectnew');

    if(teamselectelm.selectedIndex === -1)
    {
      console.log('No team selected');
      return;
    }

    var teamid = Number(teamselectelm[teamselectelm.selectedIndex].value);

    var success = pcshare.refreshbuildsharenewtable(emails, teamid, pcshare.newmemberarray, teamobject, 'share-memberframenew');

    if (success)
    {
      document.getElementById('share-newmembeedit').value = '';
    }
  };

  document.getElementById('share-newmembeedit').onkeydown = function (event)
  {
    if (event.keyCode == 13)
    {
      event.preventDefault();
      document.getElementById('share-buttonaddmember').click();
    }
  };

  // Team

  //if(pcrypt.getvalue('teamsharing'))
  {
    document.getElementById('share-searchteam').value = "";

    var shareteamtablelabels = [g.lang.teamjs.PCTEAMTEAMNAMELABEL];

    // Build team share table

    pcshare.teamrecordcount = pcshare.buildteamsharetable(sharesselected, teamobject, 'share-teamframe', shareteamtablelabels, false, g.lang.default.PCTEAMMAILTITLE, true);

    if(pcshare.teamrecordcount == 0)
      document.getElementById('share-teamframe').innerHTML = g.lang.passwordsjs.PCSHAREPRETEXT;
  }

  // User

  fillteamselect(document.getElementById('share-teamselect'), 0, g.lang.passwordsjs.PCPASSWORDSGROUPALL, false, true, true);

  document.getElementById('share-searchmember').value = "";

  var shareusertablelabels = [g.lang.teamjs.PCTEAMNAMELABEL, g.lang.teamjs.PCTEAMDEPARTMENTLABEL, g.lang.teamjs.PCTEAMTEAMNAMELABEL, g.lang.teamjs.PCTEAMEMAILLABEL, g.lang.teamjs.PCTEAMNOTAPPROVEDTEAM];

  // Build share table
  pcshare.memberrecordcount = pcshare.buildusersharetable(sharesselected, teammembers, teamobject, 'share-memberframe', shareusertablelabels, false, g.lang.default.PCTEAMMAILTITLE, true, false);
  //pcshare.memberrecordcount = pcshare.buildusersharetable(sharesselected, teammembers, teamobject, 'share-memberframe', sharetablelabels, false, g.lang.default.PCTEAMMAILTITLE, true, false);

  if(pcshare.memberrecordcount == 0)
    document.getElementById('share-memberframe').innerHTML = g.lang.passwordsjs.PCSHAREPRETEXT;

  // E-mail

  fillteamselect(document.getElementById('share-teamselectnew'), pcrypt.getvalue('tidshown'), false, true, true);

  document.getElementById('share-newmembeedit').value = "";

  // Reset new share table
  pcshare.newmemberarray =  [];
  document.getElementById('share-memberframenew').innerHTML = "";

  //initSingleSumo('share-teamselect');

  //$("#share-tabs-tms1").tab('show');
  //$('.nav-tabs a:first').tab('show');
  //$(pcshare.div).tabs("option", "active", 0);
  //document.getElementById('share-tabs-tms1').click();
  //$('#share-tabs-tms1').trigger('click');

}

pcshare.searchteam = function()
{
    tablesearch(document.getElementById('share-teamgrid'), false, document.getElementById('share-searchteam').value);
};

pcshare.searchmember = function()
{
    var teamselect = document.getElementById('share-teamselect');
    tablesearch(document.getElementById('share-membergrid'), teamselect[teamselect.selectedIndex].value, document.getElementById('share-searchmember').value);
};

pcshare.deletenewmember = function(e)
{
  var editindex = Number((e.srcElement||e.target).name);

  if(editindex < 0)
    return;

  pcshare.newmemberarray.remove(editindex);
  pcshare.refreshbuildsharenewtable(null, null, pcshare.newmemberarray, pcshare.teamobject, 'share-memberframenew');
};

pcshare.buildteamsharetable = function(myshares, teamobject, tagid, labels, readonly, mailsubject, hidenoshare)
{
  var tablearrayheader = [["<input type='checkbox' id='share-selallteam' name='share-selallteam' value='1'>", "data-sort-method='none' style='width: 22px;'"],
  [labels[0], "style='text-align: left; white-space: nowrap;'"]];

  var htmlarray = [];
  var idarray = [];
  var countshown = 0;
  var myid = pcrypt.getvalue('userid');
  var myteams = teamobject[myid];

  for (var teamid in myteams) 
  {
    if (!myteams.hasOwnProperty(teamid)) 
      continue;    

    var currentteam = myteams[teamid];
    
    if(!currentteam)
      continue;

    if(typeof currentteam !== 'object') // There are some fields we do not want
      continue;

    if(hidenoshare)
    {
      if(!currentteam.approved) // Are team approved
        continue;

      if(currentteam.teamonlyadminshare) // Test if only admins can share in this team
      {
        // test if we are admin in this team
        if(!currentteam.admin) // Are we admin in this team
          continue;
      }
      else
      {
        if(currentteam.usernoshare) // Are we allowed to share in this team
          continue;
      }

      if((currentteam.teamkeysdata === null) || (currentteam.teamkeysfromid === null)) // Do we have the team keys
         continue;
    }

    var htmlarrayrow = new Array(2);

    let teamname = htmlspecialchars(currentteam.teamname, ['ENT_QUOTES']);

    htmlarrayrow[0] = "<input type='checkbox' id='share-selidteam" + countshown + "' name='" + teamid + "'";

    if(!Array.isArray(myshares) && (typeof myshares === 'object')) // test it is an object and not an array (old system not valid anymore)
    {
      if(myshares && myshares[0] && myshares[0].indexOf(currentteam.teamid) != -1)
        htmlarrayrow[0] += " checked";
    }

    //console.log(myshares[0][currentteam.teamid]);

    if(readonly)
      htmlarrayrow[0] += " disabled";

    htmlarrayrow[0] += ">";
    htmlarrayrow[1] = teamname;

    htmlarray.push(htmlarrayrow);
    idarray.push(teamid);
    countshown++;
  }

  document.getElementById(tagid).innerHTML = buildtable(tablearrayheader, idarray, htmlarray, 'share-teamgrid', 'dialog-table table-bordered table marginBottom0');

  var teamgrid = document.getElementById('share-teamgrid');

  // Do not store the sort object as we have no further use for it
  new Tablesort(teamgrid);

  // We have to paint the row backgrounds after sort/search as there may be hidden rows (sadly - but no other way)
  teamgrid.addEventListener('afterSort', function() { tablesetbackgroundcolor(teamgrid); });
  addCheckboxClickToGrid('share-teamgrid');
  document.getElementById('share-selallteam').onclick = pcshare.selallteamfunc;
  activateTooltip();

  return htmlarray.length;
};

pcshare.buildusersharetable = function(myshares, members, teamobject, tagid, labels, readonly, mailsubject, hidenoshare, showcurrentuser)
{
	var tablearrayheader = [["<input type='checkbox' id='share-selallmember' name='share-selallmember' value='1'>", "data-sort-method='none' style='width: 22px;'"],
	[labels[0], "style='text-align: left; white-space: nowrap;'"],
	[labels[1], "style='text-align: left; white-space: nowrap;'"],
	[labels[2], "style='text-align: left; white-space: nowrap;'"],
	[labels[3], "style='text-align: left; white-space: nowrap;'"],
	['', "data-sort-method='none' style='text-align: right; white-space: nowrap;'"]];

	if(!members || !Array.isArray(members))
		members = [];

	var htmlarray = [];
	var idarray = [];
	var countshown = 0;
	var myid = pcrypt.getvalue('userid');

	for (var i = 0, len_i = members.length; i < len_i; ++i)
	{
	  let member = members[i];

	  if(hidenoshare)
	  {
      if(member.teamonlyadminshare) // Test if only admins can share in this team
	    {
	      // test if we are admin in this team
	      if(!teamobject[myid][member.teamid].admin) // Are we admin in this team
	        continue;
	    }
	    else
	    {
        if(teamobject[myid][member.teamid].usernoshare) // Are we allowed to share in this team
          continue;
	    }
	  }

	  if(!showcurrentuser && myid && (member.userid == myid)) // Do not include myself
	    continue;

	  let popoverInfoContent = getPopoverContent(member);

		var htmlarrayrow = new Array(5);

    let email = htmlspecialchars(member.email, ['ENT_QUOTES']);
    let name = htmlspecialchars(member.name, ['ENT_QUOTES']);
    let department = htmlspecialchars(member.department, ['ENT_QUOTES']);
    let teamname = htmlspecialchars(member.teamname, ['ENT_QUOTES']);

		htmlarrayrow[0] = "<input type='checkbox' id='share-selidmember" + countshown + "' name='" + i + "'";

		if(!Array.isArray(myshares) && (typeof myshares === 'object')) // test it is an object and not an array (old system not valid anymore)
		{
      if(myshares && myshares[member.userid] && myshares[member.userid].indexOf(member.teamid) != -1)
        htmlarrayrow[0] += " checked";
    }

		if(readonly)
			htmlarrayrow[0] += " disabled";

		htmlarrayrow[0] += ">";

    	htmlarrayrow[1] = name;
		htmlarrayrow[2] = department;
		htmlarrayrow[3] = teamname;
		htmlarrayrow[4] = "<a href='index.html?page=messages&email=" + email + "' data-toggle='popover' data-placement='left' title='Information' data-html='true' data-content='" + popoverInfoContent + "' data-trigger='hover'>" + email + "</a>";
		htmlarrayrow[5] = '';

		if(member.approved == 0)
		{
			htmlarrayrow[5] = '<span class="icon_warning2 pc-bs-toggle" data-placement="left" title="' + labels[4] + '"></span>';
		}

		htmlarray.push(htmlarrayrow);
		idarray.push(member.teamid);
		countshown++;
	}

	document.getElementById(tagid).innerHTML = buildtable(tablearrayheader, idarray, htmlarray, 'share-membergrid', 'dialog-table table-bordered table marginBottom0');
  var membergrid = document.getElementById('share-membergrid');
  addCheckboxClickToGrid(membergrid.id);

	// Do not store the sort object as we have no further use for it
	new Tablesort(membergrid);

	// We have to paint the row backgrounds after sort/search as there may be hidden rows (sadly - but no other way)
	membergrid.addEventListener('afterSort', function() { tablesetbackgroundcolor(membergrid); });

	document.getElementById('share-selallmember').onclick = pcshare.selallmemberfunc;
	activateTooltip();

	return htmlarray.length;
};

pcshare.selallteamfunc = function(e)
{
    var newstatus = document.getElementById('share-selallteam').checked;

  for(var i=0 ; i < pcshare.teamrecordcount ; i++)
    {
    var selelem = document.getElementById('share-selidteam' + i);

    if(selelem)
      selelem.checked = newstatus;
  }
};

pcshare.selallmemberfunc = function(e)
{
  var newstatus = document.getElementById('share-selallmember').checked;

	for(var i=0 ; i < pcshare.memberrecordcount ; i++)
  {
    var selelem = document.getElementById('share-selidmember' + i);
    
    if(selelem.parentElement.parentElement.style.display === 'none') // If the user isn't shown in the table, skip it.
    {
      continue;
    };

    if(selelem)
      selelem.checked = newstatus;
	};
};

pcshare.buildsharenewtable = function(newshares, userid, teamobject, tagid, labels, readonly, mailsubject)
{
	var tablearrayheader = [[labels[0], "style='text-align: left; white-space: nowrap;'"],
	[labels[1], "style='text-align: left; white-space: nowrap;'"],
  [labels[2], "data-sort-method='none' style='width: 22px;'"]];

	var htmlarray = [];
	var idarray = [];
	var countshown = 0;
	//var myemail = pcrypt.getvalue('email');
  var myid = pcrypt.getvalue('userid');

  if(!Array.isArray(newshares))
    return;

	for (var i = 0, len_i = newshares.length; i < len_i; ++i)
	{
	  let newshare = newshares[i];

		var htmlarrayrow = new Array(3);

    let email = htmlspecialchars(newshare.email, ['ENT_QUOTES']);
    let teamname = "#";
    if(teamobject[userid][newshare.teamid] && teamobject[userid][newshare.teamid])
      teamname = htmlspecialchars(teamobject[userid][newshare.teamid].teamname, ['ENT_QUOTES']);

		htmlarrayrow[0] = teamname;
		htmlarrayrow[1] = "<a href='mailto:" + email + "?subject=" + mailsubject + "'>" + email + "</a>";
    htmlarrayrow[2] = "<input id='deletenewmember" + countshown + "' name='" + countshown + "' title='" + g.lang.passwordsjs.PCPASSWORDSBUTTONDELETE + "' type='button' class='icon_delete'>";

		htmlarray.push(htmlarrayrow);
		idarray.push(newshares.teamid);
		countshown++;
	}

	document.getElementById(tagid).innerHTML = buildtable(tablearrayheader, idarray, htmlarray, 'share-membergridnew', 'dialog-table gray table-bordered table marginBottom0');

	var membergridnew = document.getElementById('share-membergridnew');

	// Do not store the sort object as we have no further use for it
	new Tablesort(membergridnew);

	// We have to paint the row backgrounds after sort/search as there may be hidden rows (sadly - but no other way)
	membergridnew.addEventListener('afterSort', function() { tablesetbackgroundcolor(membergridnew); });

	return htmlarray.length;
};

pcshare.refreshbuildsharenewtable = function(emails, teamid, sharelist, teamobject, divtag)
{
  var sharenewtablelabels = [g.lang.teamjs.PCTEAMTEAMNAMELABEL, g.lang.teamjs.PCTEAMEMAILLABEL, g.lang.passwordsjs.PCPASSWORDSBUTTONDELETE];

  if(emails && teamid)
  {
    var emailarray = emails.split(",");

    loopemails: for (var i = 0, i_len = emailarray.length ; i < i_len; i++)
    {
      let email = emailarray[i].trim();

      if(true != validemail(email))
      {
        if(i_len == 1)
        {
          modalalert(g.lang.contactjs.PCCONTACTINVALIDEMAIL, g.lang.default.PCPROGRAMTITLE, function(closed)
          {
            if (closed) 
            {
              timeout(function() 
              {
                document.getElementById('share-newmembeedit').focus();
              });
            }
          });
          return false;
        }
        else
        {
            continue loopemails;
        }
      }

      // make sure the email is not already included in the list
      for (var j = 0, j_len = sharelist.length ; j < j_len; j++)
      {
        if (sharelist[j].email === email)
        {
          continue loopemails;
        }
      }

      sharelist.push({'email': email, 'teamid': teamid});
    }
  }

  var newmemberitems = pcshare.buildsharenewtable(sharelist, pcrypt.getvalue('userid'), teamobject, divtag, sharenewtablelabels, false, g.lang.default.PCTEAMMAILTITLE);

  for(var i = 0 ; i < newmemberitems ; i++)
  {
    document.getElementById('deletenewmember'+i).onclick = pcshare.deletenewmember;
  }

  return true;
};

//# sourceURL=share.js