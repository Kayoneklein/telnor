"use strict";

g.maildata = null; // All mail data
g.maillist = []; // To or From mail data
g.teamobject = null;
g.teammembers = [];
g.mailrecordcount = null;
g.mailtotalrecordcount = null;
g.memberrecordcount = null;
g.sharediv = null;
g.sharesselected = null;

g.emailstate = {"new": 0, "show": 1, "reply": 2, "forward": 3};
Object.freeze(g.emailstate)

var asyncmail_onerror = function(data, error, id)
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

var asyncmail_onsuccess = function(varobj)
{
  $('#check-mail-counter').css('display', 'none'); // Remove counter as we read in above

  if(pcrypt.getvalue('options').disableteams === true)
  {
    g.teammembers = null;
    var currentpage = 'passwords';
    window.location.replace('./index.html?page=' + currentpage);
  }
  else
  {
    g.teammembers = varobj['members']; // members to null
  }

  g.teamobject = convertteammembers(g.teammembers);
  g.teammembers = cleanmembers(g.teammembers, g.teamobject);

  //fillteamselect(document.getElementById('teamselect'), 0, g.lang.mail.PCMAILALLTEAMS, false, true);

  g.maildata = decryptmaildata(varobj['mail'], g.teamobject);

  if(g.maildata == false)
  {
    g.maildata = {};
    g.maildata.to = [];
    g.maildata.from = [];
  }

  validatedataarray(g.maildata.to, validatemail);
  validatedataarray(g.maildata.from, validatemail);

/*
  if(g.maildata.to[0] && g.maildata.to[0].mailid)
    pcrypt.setvalue('lastmailid', g.maildata.to[0].mailid, false, false); // Save the highest email id that we have for this load
*/

  g.maillist = g.maildata.to;
  setmaillist();

  var email = getUrlParameter('email');

  //$("#mailin").attr('class', 'contentmenustylecurrent');
  loader(false);

  // Are we sending a message to the user directly on page load?
  if(typeof email === 'string')
    showmailfunc(null, null, false, email);

  paintNonReadMail();
};

if(redirectinvalidlogin() && (pcrypt.getvalue('options').disablemessages == false)) 
{
  if(pcrypt.getvalue('emailconfirm') == 0)
  {
	  localStorage.setItem('popupRead', false);
    window.history.back();
  }

	pcrypt_securitystatus(pcrypt.getvalue('session'), 0, function securitystatusfunc (data, error, id)
		{
      if (error)
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
      }
			pcrypt.setvalue('totpsecurity', data.totp);
			pcrypt.setvalue('notificationsecurity', data.notification);
			pcrypt.setvalue('sessionsecurity', data.iplock);
			redirect2fa();
    });

    $(document).ready(function ()
    {
      $('.container-hidden').show();
      $("#menumail").attr('class', 'topmenustylecurrent');

      loader(true);
      $(".globalhide").hide();

      var session = pcrypt.getvalue('session');
      var unreadmails = pcrypt.getvalue('unreadmails');
      var forceupdate = pcrypt.getvalue('updatemails');
      var teamchanges = pcrypt.getvalue('teamchanges');

      var mailasync = new pcrypt_async(2);

      mailasync.onsuccess = asyncmail_onsuccess;
      mailasync.onerror = asyncmail_onerror;

      pcrypt.getteammembers(session, teamchanges, 'pcryptteammembers', 'members', mailasync.callback);
      pcrypt.getteammail(session, (unreadmails || forceupdate) ? true : false , 'pcryptteammail', 'mail', mailasync.callback);

      pcrypt.setvalue('unreadmails', 0);
      pcrypt.setvalue('updatemails', 0);
      pcrypt.setvalue('teamchanges', 0);

	  //initSingleSumo("mailboxselect");

      // Checkboxes activate left menu
      function checkMessagesCheckboxChecked() {
        var messagesCheckboxChecked = false;
        $('#mailgrid input[type="checkbox"]').each(function() {
          if ($(this).is(':checked')) {
            messagesCheckboxChecked = true;
          }
        });
        if (messagesCheckboxChecked) {
          $('ul.navigation .canchange').removeClass('deactivated');
        }
        else {
          if (!$('#maildelete').hasClass('deactivated')) {
            $('ul.navigation .canchange').addClass('deactivated');
          }
        }
      }

      $('#div_contentframe').on('click','input[type="checkbox"]', function() {
        checkMessagesCheckboxChecked();
      });

      /*getlanguage(getUrlParameter('language'), function(language)
      {
        if(!language)
        {
          alert('Unable to load language text.');
          return;
        }

        g.lang = language;

        var session = pcrypt.getvalue('session');
        var mailasync = new pcrypt_async(2);

        pcrypt.getteammembers(session, false, 'pcryptteammembers', 'members', mailasync.callback);
        pcrypt.getteammail(session, true, 'pcryptteammail', 'mail', mailasync.callback);

        setdomlanguage(g.lang, 'mailedit', true);
        setdomlanguage(g.lang, 'mail');
        });
        */


      // Event handlers for menu
      $('#mailboxselect').change(function() {
      	var v = $(this).val();
      	if (v == "in") {
      		g.maillist = g.maildata.to;
        	setmaillist();
        	document.getElementById('searchmail').value = '';
      	}
      	else {
      		g.maillist = g.maildata.from;
        	setmaillist();
        	document.getElementById('searchmail').value = '';
      	}
      });

      document.getElementById('mailnew').onclick = function (event)
      {
        showmailfunc(null, null, false);
      };

      document.getElementById('maildelete').onclick = function (event)
      {
			event.preventDefault();
            delcheck();
      };

      addClearSearchIcon('searchmail', searchmailfunc);
      document.getElementById('searchmail').onkeyup = function (event)
      {
        searchmailfunc();
      };

      /*document.getElementById('clearsearchmail').onclick = function (event)
      {
        document.getElementById('searchmail').value = '';
        searchmail();
      };*/

      // New mail dialog below

/*

      document.getElementById('teamselect').onchange = function (event)
      {
        document.getElementById('searchmember').value = "";
        tablesearch(document.getElementById('membergrid'), this[this.selectedIndex].value, document.getElementById('searchmember').value);
      };

      document.getElementById('searchmember').onkeyup = function (event)
      {
        searchmember();
      };

      document.getElementById('clearsearchmember').onclick = function (event)
      {
        document.getElementById('searchmember').value = '';
        searchmember();
      };

      */

      //document.getElementById('buttonshowshare').onclick = function (event)
      $('#buttonshowshare, #tohtml').click(function(event)
      {
        //event.preventDefault();
        if ($(this).attr('id') == "tohtml" && !$(this).hasClass('onclickactivate')) {
        	return;
        }

        loadDialog(g.sharediv, "share", true, false, function sharecallback(sharediv)
        {
          if(sharediv !== false)
            g.sharediv = sharediv;

          if(!pcshare)
          {
            console.log("Share JS file not ready!");
            return;
          }

          pcshare.show(g.sharediv, 700, g.lang.mailjs.PCMAILRECIPIENTTITLE, false, false, [0], 1, function()
          {
            pcshare.init(g.sharesselected, g.teammembers, g.teamobject);
          },
          function (newshares, newemails)
          {
            if(!newshares)
              return;

            //console.log(newshares);
            //console.log(newemails);

            addTeamAndShareByEmail(newshares, newemails, function newsharesfunc(teammembers, newshareswithemail, newmembers)
            {
              if(teammembers)
              {
                g.teamobject = convertteammembers(g.teammembers);
                g.teammembers = cleanmembers(teammembers, g.teamobject);
              }

              g.sharesselected = newshareswithemail;

              // Set to HTML
              $('#tohtml').html(getAllMailRecipients(g.sharesselected));

              if(newmembers && newmembers.new.length)
              {
                var text = g.lang.default.PCNEWSHAREUSERTEXT;
                text += "<br><br><ul><li>" + newmembers.new.join("<li>") + "</ul>";
                modalalert(text, g.lang.default.PCPROGRAMTITLE, function callback(){});
              }
            });
          });
        });
      });
/*
  	  var id = getUrlParameter('id');
  	  if(id)
  		  document.getElementById(id).click();
*/
    });
}
else 
{
  var opts = pcrypt.getvalue('options');
  if (opts  && opts.disablemessages === true) 
  {
    if (opts.force2fa === false) 
    {
      var currentpage = 'passwords';
      window.location.replace('./index.html?page=account');
      var htmlfile = './html/' + currentpage + '.html?v=PCRYPTVERSION';
      var jsfile = './js/' + currentpage + '.js?v=PCRYPTVERSION';
    } 
    else if (opts.force2fa === true && pcrypt.getvalue('totpsecurity') === false) 
    {
      var currentpage = 'account';
      window.location.replace('./index.html?page=account&to2fa=true');
      var htmlfile = './html/' + currentpage + '.html?v=PCRYPTVERSION';
      var jsfile = './js/' + currentpage + '.js?v=PCRYPTVERSION';
    }
  }
}






// Member functions below

function selallfunc(e)
{
  for(var i=0 ; i < g.mailrecordcount ; i++)
	{
		document.getElementById('selid' + i).checked = document.getElementById('selall').checked;
	}
}

function setmaillist()
{
	var mailsshown = 0;
	var emaillabel;
	var statuslabel;

  if(g.maillist.length == 0)
  {
    g.mailrecordcount = g.mailtotalrecordcount = 0;
    document.getElementById('div_contentframe').innerHTML = g.lang.mailjs.PCMAILPRETEXT;
  }
  else
  {
    if(g.maillist == g.maildata.from)
    {
      emaillabel = g.lang.mailjs.PCMAILTOTITLE;
    }
    else
    {
      emaillabel = g.lang.mailjs.PCMAILFROMTITLE;
  	}

  	var tablearrayheader = [["<input type='checkbox' id='selall' name='selall' value='1'>", "data-sort-method='none' style='width: 22px;'"],
  	[g.lang.mailjs.PCMAILSUBJECTTITLE, "style='text-align: left;'"],
  	[emaillabel, "style='text-align: left;'"],
  	[g.lang.mailjs.PCMAILDATETITLE, "style='text-align: left;'"],
  	//[g.lang.mailjs.PCMAILREADTITLE, "data-sort-method='none' style='width: 28px; text-align: center;'"],
  	[g.lang.teamjs.PCTEAMACTIONLABEL, "data-sort-method='none' style='width: 112px; text-align: right;'"]];

  	if(!g.maillist || (g.maillist.length == 0))
  		g.maillist = [];

  	var htmlarray = new Array();

  	for (var i = 0, len_i = g.maillist.length; i < len_i; ++i)
  	{
  		let htmlarrayrow = new Array(5);
  		let mail = g.maillist[i];
  		let remoteid = mail.remoteid;

      htmlarrayrow[0] = ((!mail.read) ? '<div class="new-row none"></div>' : '') + "<input type='checkbox' id='selid" + mailsshown + "' name='" + i + "' value='1'>";

  		let subject = htmlspecialchars(mail.data.sub, ['ENT_QUOTES']);
  		let note = htmlspecialchars(mail.data.note, ['ENT_QUOTES']);
      note = htmlspecialchars(note, ['ENT_QUOTES'], "", true); // We have to enable double encoding to protect against JS injection in popup (innerHTML convert single encoding without &amp; in front back to normal tags)
      note = note.replace(/(?:\r\n|\r|\n)/g, '<br>'); // Show newlines by converting to <br>

  		if(note.length)
        htmlarrayrow[1] = "<a class='popupboxstyle' title='" + note + "'></a>" + subject;
      else
        htmlarrayrow[1] = subject;

  		if(g.teamobject[remoteid])
  		{
  		  let email = htmlspecialchars(g.teamobject[remoteid].email, ['ENT_QUOTES']);
		    let popover = getPopoverContent(g.teamobject[remoteid]);
        htmlarrayrow[2] = "<a href='index.html?page=messages&email=" + email + "' data-toggle='popover' title='Information' data-html='true' data-content='" + popover + "' data-trigger='hover'>" + getMailNameFromId(g.teamobject, g.teamobject[remoteid].userid) + "</a>";
  		}
  		else
  		  htmlarrayrow[2] = g.lang.mailjs.PCMAILUNKNOWNTEAM;
	  
		htmlarrayrow[3] = (new Date().setFromMysql(mail.created)).format(g.lang.default.JS_DATETIMEFORMAT);

  		/*if(mail.read)
  		  htmlarrayrow[4] = "<span id='icon" + mailsshown + "' name='" + i + "' class='icon_ok'></span>";
  		else
  			htmlarrayrow[4] = "<span id='icon" + mailsshown + "' name='" + i + "' class='icon_hide'></span>";
          */
			htmlarrayrow[4] = "<input id='delete" + mailsshown + "' name='" + i + "' title='" + g.lang.mailjs.PCMAILBUTTONDELETE + "' type='button' class='icon_delete'>";
  			htmlarrayrow[4] += "<input id='forward" + mailsshown + "' name='" + i + "' title='" + g.lang.mailjs.PCMAILBUTTONFORWARD + "' type='button' class='icon_mailforward'>";
  			htmlarrayrow[4] += "<input id='reply" + mailsshown + "' name='" + i + "' title='" + g.lang.mailjs.PCMAILBUTTONREPLY + "' type='button' class='icon_mailreply'>";
  			htmlarrayrow[4] += "<input id='show" + mailsshown + "' name='" + i + "' title='" + g.lang.mailjs.PCMAILBUTTONSHOW + "' type='button' class='icon_mailinfo'>";
  		//htmlarrayrow[4] += "<input id='reply" + mailsshown + "' name='" + i + "' title='" + g.lang.mailjs.PCMAILBUTTONREPLY + "' type='button' class='icon_reply'>";


  		htmlarray.push(htmlarrayrow);

  		mailsshown++;
  	}

  	g.mailrecordcount = htmlarray.length;
  	g.mailtotalrecordcount = mailsshown;

  	document.getElementById('div_contentframe').innerHTML = buildtable(tablearrayheader, null, htmlarray, 'mailgrid', 'teammail table-bordered table');

  	var mailgrid = document.getElementById('mailgrid');

  	// Do not store the sort object as we have no further use for it
  	new Tablesort(mailgrid);

  	// We have to paint the row backgrounds after sort/search as there may be hidden rows (sadly - but no other way)
  	// mailgrid.addEventListener('afterSort', function() { tablesetbackgroundcolor(mailgrid); });

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

  	document.getElementById('selall').onclick = selallfunc;

  	for(var i = 0 ; i < mailsshown ; i++)
    {
      document.getElementById('show'+i).onclick = function (e) { eventmailfunc(e, g.emailstate.show); };
      document.getElementById('reply'+i).onclick = function (e) { eventmailfunc(e, g.emailstate.reply); };
	  document.getElementById('forward'+i).onclick = function (e) { eventmailfunc(e, g.emailstate.forward); };
      document.getElementById('delete'+i).onclick = deletemailfunc;
    }

    paintNonReadMail();
    activatePopover('.teammail');
  }

  var divtext = g.lang.passwordsjs.PCPASSWORDSRECORDCOUNTTEXT + ": " + g.mailrecordcount + '/' + g.mailtotalrecordcount;
	document.getElementById('statustext').innerHTML = divtext;
}

function eventmailfunc(e, emailstate)
{
  var index = Number((e.srcElement||e.target).name);
  var mail = g.maillist[index];
  var remoteid;
  
  switch(emailstate)
  {
	default:
	case g.emailstate.show:
		if(g.maillist == g.maildata.to)
		{
			remoteid = mail.remoteid;
			mail.read = 1;
		}
		else
		{
			remoteid = pcrypt.getvalue('userid');
		}
	break;

	case g.emailstate.reply:
		remoteid = mail.remoteid;
	break;	

	case g.emailstate.forward:
		remoteid = mail.remoteid;
	break;		  
  }
  
	showmailfunc(mail.data, remoteid, emailstate);
  
/*  
  
  //function showmailfunc(maildata, remoteid, readonly, email)
  
  

  // Set read true and update icon (only for incoming email)
  if(g.maillist == g.maildata.to)
  {
    showmailfunc(g.maillist[index].data, g.maillist[index].remoteid, readonly);
    g.maillist[index].read = 1;    //document.getElementById("icon" + index).className = "icon_ok";
  }
  else
  {
    showmailfunc(g.maillist[index].data, pcrypt.getvalue('userid'), readonly);
  }
  
  //showmailfunc(maildata, false, false);
 */
}

/**
 * Show specific mail dialog box
 *
 * @param maildata
 * @param remoteid
 * @param readonly
 * @param email
 */
function showmailfunc(maildata, remoteid, emailstate, email)
{
	// TODO - remove readonly and maildata logic and use emailstate
	//console.log(remoteid);
	//console.log(emailstate);

	var teamselectfield = document.getElementById('teamselect')
	var searchmemberfield = document.getElementById('searchmember')
	var subjectfield = document.getElementById('subjectfield');
	var contentfield = document.getElementById('contentfield');
	var dialogtitle, readonly;
	
	function sendtoremoteid(remoteid)
	{
		var currentuser = pcrypt.getvalue('userid');

		for (var userid in g.sharesselected) // for/of not supported in IE11
		{
			if (g.sharesselected.hasOwnProperty(userid))
			{
				if (userid == currentuser) 
				{
					let teams = g.sharesselected[userid];
					delete g.sharesselected[userid]; // Remove myself
					if (remoteid)
					{
						g.sharesselected[remoteid] = teams; // Add sender
					}
				}
			}
		}
	}
	
	switch(emailstate)
	{
		default:
		case g.emailstate.new:
		
			g.sharesselected = {};
			dialogtitle = g.lang.mailjs.PCMAILNEWMAILTITLE;	
			
			if(email && validemail(email))
			{
				for(var i = 0, i_len = g.teammembers.length ; i < i_len ; i++)
				{
					if(email == g.teammembers[i].email)
					{
						if(!g.sharesselected[g.teammembers[i].userid])
						  g.sharesselected[g.teammembers[i].userid] = [];

						g.sharesselected[g.teammembers[i].userid].push(g.teammembers[i].teamid);
					}
				}

				$('#tohtml').html(getAllMailRecipients(g.sharesselected));
			}
			else
			{
				$('#tohtml').html('');
			}
					
			$('#fromhtml').html(getMailNameFromId(g.teamobject, pcrypt.getvalue('userid')));
			subjectfield.value = '';
			contentfield.value = '';
			readonly = false;			
			
		break;
		
		case g.emailstate.show:
		
			if(!maildata)
			{
					console.log('No maildata');
					return;
			}
			
			g.sharesselected = JSON.parse(JSON.stringify(maildata.shares)); // Object.assign({}, maildata.shares); does not work in IE
			
			dialogtitle = g.lang.mailjs.PCMAILSHOWMAILTITLE;
			$('#tohtml').html(getAllMailRecipients(g.sharesselected));
			$('#fromhtml').html(getMailNameFromId(g.teamobject, remoteid));
			subjectfield.value = maildata.sub;
			contentfield.value = maildata.note;
			readonly = true;
			
		break;

		case g.emailstate.reply:
		
			if(!maildata)
			{
				console.log('No maildata');
				return;
			}
			
			g.sharesselected = JSON.parse(JSON.stringify(maildata.shares)); // Object.assign({}, maildata.shares); does not work in IE
			sendtoremoteid(remoteid);
			
			dialogtitle = g.lang.mailjs.PCMAILNEWMAILTITLE;
			$('#tohtml').html(getAllMailRecipients(g.sharesselected));
			$('#fromhtml').html(getMailNameFromId(g.teamobject, pcrypt.getvalue('userid')));
			subjectfield.value = "Re: " + maildata.sub;
			if(g.teamobject && g.teamobject[remoteid] && maildata && maildata.cre)
			{
				contentfield.value = "\n-------- " + g.teamobject[remoteid].email + " * " + (new Date(maildata.cre)).format(g.lang.default.JS_DATETIMEFORMAT) + " --------\n" + maildata.note;
		  	}
			readonly = false;
			
		break;	
		
		case g.emailstate.forward:
		
			if(!maildata)
			{
				console.log('No maildata');
				return;
			}
			
			g.sharesselected = {};
			
			dialogtitle = g.lang.mailjs.PCMAILNEWMAILTITLE;
			$('#tohtml').html(getAllMailRecipients(g.sharesselected));
			$('#fromhtml').html(getMailNameFromId(g.teamobject, pcrypt.getvalue('userid')));
			subjectfield.value = "Fwd: " + maildata.sub;
			if(g.teamobject && g.teamobject[remoteid] && maildata && maildata.cre)
		  	{
				contentfield.value = "\n-------- " + g.teamobject[remoteid].email + " * " + (new Date(maildata.cre)).format(g.lang.default.JS_DATETIMEFORMAT) + " --------\n" + maildata.note;
		  	}
			readonly = false;
			
		break;		  
	  }
	  
	  setCaretPosition('contentfield', 0);

/*
	if(maildata)
	{
		if(remoteid)
		{
		  g.sharesselected = JSON.parse(JSON.stringify(maildata.shares)); // Object.assign({}, maildata.shares); does not work in IE
		  subjectfield.value = "Re: " + maildata.sub;
		}
		else
		{
			g.sharesselected = {};
			subjectfield.value = "Fwd: " + maildata.sub;
		}

		if(!readonly)
		{
		  var myuserid = pcrypt.getvalue('userid');

			for (var userid in g.sharesselected) // for/of not supported in IE11
			{
				if (g.sharesselected.hasOwnProperty(userid))
				{
					if (userid == myuserid)
					{
						let teams = g.sharesselected[userid];
						delete g.sharesselected[userid]; // Remove myself
						if (remoteid)
						{
							g.sharesselected[remoteid] = teams; // Add sender
						}
					}
				}
			}

		  dialogtitle = g.lang.mailjs.PCMAILNEWMAILTITLE;
		  $('#fromhtml').html(getMailNameFromId(g.teamobject, pcrypt.getvalue('userid')));

		  if(g.teamobject && g.teamobject[remoteid] && maildata && maildata.cre)
		  {
			contentfield.value = "\n-------- " + g.teamobject[remoteid].email + " * " + (new Date(maildata.cre)).format(g.lang.default.JS_DATETIMEFORMAT) + " --------\n" + maildata.note;
		  }
		  else
		  {
			  contentfield.value = "\n----------------\n" + maildata.note;
		  }

		  setCaretPosition('contentfield', 0);
			}
			else
		{
		  dialogtitle = g.lang.mailjs.PCMAILSHOWMAILTITLE;
		  $('#fromhtml').html(getMailNameFromId(g.teamobject, remoteid));
		  subjectfield.value = maildata.sub;
		  contentfield.value = maildata.note;
			}

		// Set to HTML
		if(emailstate !== g.emailstate.forward)
		{
			toHtml = getAllMailRecipients(g.sharesselected);
			$('#tohtml').html(toHtml);
		}
	}
	else
	{
    // New blank mail

    g.sharesselected = {};

    // Set from and to HTML
		$('#tohtml').html('');
		$('#fromhtml').html(getMailNameFromId(g.teamobject, pcrypt.getvalue('userid')));

		subjectfield.value = '';
		contentfield.value = '';
		dialogtitle = g.lang.mailjs.PCMAILNEWMAILTITLE;
	}
	*/

	if(readonly)
	{
		toggledisabled("dialog-teammailedit", true);
		$('#dialog-teammailedit').addClass('readonly');
    	$('#buttonshowshare').css('display', 'none');
    	$('#tohtml').removeClass('onclickactivate');

		subjectfield.autofocus = false;
		contentfield.autofocus = false;
	}
	else
	{
		toggledisabled("dialog-teammailedit", false);
		$('#dialog-teammailedit').removeClass('readonly');
    	$('#buttonshowshare').css('display', 'block');
    	$('#tohtml').addClass('onclickactivate');

		if(maildata)
		{
		  subjectfield.autofocus = false;
		  contentfield.autofocus = true;
		}
		else
		{
		  subjectfield.autofocus = true;
		  contentfield.autofocus = false;
		}
	}

	//console.log(maildata);
	//console.log(remoteid);

	var divoptions = {
		div: '#dialog-teammailedit',
		width: 700,
		title: dialogtitle,
		returnisok: false,
		//hidecancel: readonly,
    	hideok: readonly,
		onopen: function ()
		{
			/*$('#dialog-teammailedit .ui-widget select').SumoSelect({
				placeholder: 'No content'
			});

			$('#dialog-teammailedit .ui-widget select').each(function ()
			{
				$(this)[0].sumo.reload();
			});*/

			if (readonly)
			{
				$('.extra-button').show();
			}
			else
			{
				$('.extra-button').hide();
			}
		},
		callback: function (result)
		{
			if (result && !readonly)
			{
				var mymaildata = {};
				var mymailtodata = {};

				if (subjectfield.value.length > 64)
					subjectfield.value = substr(subjectfield.value, 0, 64);

				if (contentfield.value.length > 8096)
					contentfield.value = substr(contentfield.value, 0, 8096);

				mymaildata.cre = (new Date()).getTime();
				mymaildata.sub = subjectfield.value;
				mymaildata.note = contentfield.value;
				//mymaildata.shares = {};
/*
				// Get selections for users that we shall send the data to
				for (var i = 0; i < g.memberrecordcount; i++)
				{
					var selid = 'selidmember' + i;
					if (document.getElementById(selid).checked)
					{
						let memberindex = Number(document.getElementById(selid).name);
						let userid = g.teammembers[memberindex].userid;

						if (!Array.isArray(mymaildata.shares[userid]))
							mymaildata.shares[userid] = [];

						mymaildata.shares[userid].push(g.teammembers[memberindex].teamid);
					}
				}
*/
        mymaildata.shares = g.sharesselected;

				validatemail({data: mymaildata}); // Have to be formatted this way

				var privatekey = pcrypt.getvalue('privatekey');

				for (var userid in mymaildata.shares) // for/of not supported in IE11
				{
					if (mymaildata.shares.hasOwnProperty(userid) && g.teamobject[userid])
					{
						if (mymaildata.shares[userid][0])
						{
							mymaildata.teamid = mymaildata.shares[userid][0];
						}

						try
						{
							var publickey = pcrypt.decodeasymetrickeys(g.teamobject[userid].publickey);
							var sharedkey = pcrypt.getsharedsecret(privatekey, publickey);

							if (sharedkey === false)
							{
								alert("Invalid sharedkey for user: " + userid);
								delete mymailtodata[userid]; // Invalidate data
								continue;
							}

							mymailtodata[userid] = pcrypt.encryptdata(sharedkey, mymaildata, false);
						}
						catch (err)
						{
							alert("Invalid share data build: " + err.message);
							delete mymailtodata[userid]; // Invalidate data
							continue;
						}
					}
				}

				if (!Object.keys(mymailtodata).length)
				{
					modalalert(g.lang.mailjs.PCMAILNORECEIVERSERROR, g.lang.default.PCPROGRAMTITLE);
					return true; // Stop the dialog from closing
				}

				if (!subjectfield.value.length)
				{
					modalalert(g.lang.mailjs.PCMAILNOSUBJECTERROR, g.lang.default.PCPROGRAMTITLE);
					return true; // Stop the dialog from closing
				}

				var mymailfromdata = pcrypt.encryptdata(pcrypt.getvalue('keycrypt'), mymaildata, false);
				var langcode = pcrypt.getvalue('languagecode', false) || 'en';

				loader(true);

				pcrypt_teamsendmail(pcrypt.getvalue('session'), mymailfromdata, mymailtodata, langcode, 0, function sendmailfunc (data, error, id)
				{
					if (error)
					{
						switch (error)
						{
							default:
								handlepcrypterror(error, data);
								return;
						}
					}

					/*					
					if (Object.keys(mymailtodata).length != data.length)
					{

					}
					*/

					for (var i = 0, len_i = data.length; i < len_i; i++)
					{
						// Add item in beginning of array (latest timestamp)
						g.maildata.from.unshift({});
						var mailobj = g.maildata.from[0];

						mailobj.created = (new Date().toMysqlFormat());
						mailobj.data = mymaildata;
						//mailobj.data.teamid = teamid;
						mailobj.mailid = data[i].mailid;
						mailobj.read = 0;
						mailobj.remoteid = data[i].userid;
					}

					pcrypt.setvalue('updatemails', 1); // TODO - we have to update on refresh (can be changed)

					if (g.maillist == g.maildata.from)
					{
						setmaillist();
					}

					paintNonReadMail();
					loader(false);
				});
			}
		}
	};

  if(readonly)
  {
    divoptions.extrabuttons = [{
        text: g.lang.mailjs.PCMAILBUTTONREPLY,
        close: true,
        //width: "200",
        callback: function()
        {
            showmailfunc(maildata, remoteid, g.emailstate.reply);
        }
      },
      {
        text: g.lang.mailjs.PCMAILBUTTONFORWARD,
        close: true,
        //width: "200",
        callback: function()
        {
          showmailfunc(maildata, remoteid, g.emailstate.forward);
        }
      }];
	  divoptions.canceltext = g.lang.default.PCBUTTONCLOSE;
  }

	modaldiv_advanced(divoptions);
}

function paintNonReadMail() 
{
    $('.new-row').each(function() 
    {
       $(this).parents('tr').addClass('new-row-tr');
    });
}

function findmailid(maillist, mailid, remove)
{
  for (var i = maillist.length - 1; i >= 0; i--)
  if( maillist[i].mailid == mailid)
  {
    if(remove)
    {
      maillist.splice(i, 1);
      return true;
    }
    else
    {
      return i;
    }
  }

  return false;
}

function deletemailfunc(e)
{
  var index = Number((e.srcElement||e.target).name);
	var maillistother;

  if(g.maillist == g.maildata.from)
    maillistother = g.maildata.to;
  else
    maillistother = g.maildata.from;

  modalconfirm(g.lang.mailjs.PCMAILCONFIRMDELETE + ": " + htmlspecialchars(g.maillist[index].data.sub, ['ENT_QUOTES']), g.lang.default.PCPROGRAMTITLE, function(r)
  {
    if(r)
    {
      loader(true);

      pcrypt_teamremovemail(pcrypt.getvalue('session'), g.maillist[index].mailid, 0, function removemailfunc(data, error, id)
      {
        if(error)
		    switch(error)
		    {
			    default:
				    handlepcrypterror(error, data);
			    return;
		    }

        findmailid(maillistother, g.maillist[index].mailid, true);  // delete if user have sent the mail to himself
		g.maillist.splice(index, 1);
		pcrypt.setvalue('updatemails', 1); // TODO - we have to update on refresh (can be changed)
        setmaillist();

        loader(false);
      });
    }
  });
}

function getselectedmails()
{
  var items = [];

	for(var i = 0 ; i < g.mailrecordcount ; i++)
	{
		var selelem = document.getElementById('selid' + i);

		if(selelem && selelem.checked)
			items.push(selelem.name);
	}

	return items;
}

function delcheck()
{
	var items = getselectedmails();

	if(items.length == 0)
	{
		modalalert(g.lang.passwordsjs.PCPASSWORDSNOSELECTIONTEXT, g.lang.default.PCPROGRAMTITLE);
		return;
	}

	var maillistother;

   if(g.maillist == g.maildata.from)
    maillistother = g.maildata.to;
  else
    maillistother = g.maildata.from;

	modalconfirm(g.lang.passwordsjs.PCPASSWORDSGROUPMULTIDELETE + " (" + items.length + ")", g.lang.default.PCPROGRAMTITLE, function(r)
  {
    if(r)
    {
      loader(true);

      var mailarray = new Array();

      for (var i = 0; i < items.length; i++)
        mailarray.push(g.maillist[items[i]].mailid);

      pcrypt_teamremovemail(pcrypt.getvalue('session'), mailarray, 0, function removemailfunc(data, error, id)
      {
        if(error)
		    switch(error)
		    {
			    default:
				    handlepcrypterror(error, data);
			    return;
		    }

		    items.sort(function sortNumber(a,b) { return a - b; }); // remove from top so the rest do not get

		    for (var i = items.length - 1; i >= 0; i--)
		    {
		      findmailid(maillistother, g.maillist[i].mailid, true); // delete if user have sent the mail to himself
		      g.maillist.splice(items[i], 1);
        }

		pcrypt.setvalue('updatemails', 1); // TODO - we have to update on refresh (can be changed)
        setmaillist();

        loader(false);
      });
    }
  });
}

function searchmailfunc()
{
    var shownrecords = tablesearch(document.getElementById('mailgrid'), null, document.getElementById('searchmail').value);

    document.getElementById('statustext').innerHTML = g.lang.passwordsjs.PCPASSWORDSRECORDCOUNTTEXT + ": " + shownrecords + '/' + g.mailtotalrecordcount;
}
