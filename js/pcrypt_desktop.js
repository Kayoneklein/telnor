/*

    PasswordCrypt - online password store
    Copyright (C) 2010 Benny Nissen.

*/

"use strict";

// gpcrypt is defined in pcrypt_shared.js (this file have to be loaded later)
gpcrypt.version = "1.0";
gpcrypt.extension = {};
gpcrypt.extension.detectedid = null;
gpcrypt.extension.version = null;
gpcrypt.esource = null;

// Listen for extension events in all pages
extinstalllistener(null);

/*

Arrays below converted to objects but kept for reference of object members

var pad =
        {
        "cre" : 1,
        "upd" : 2,
        "gid" : 3,
        "name" : 4,
        "user" : 5,
        "pass" : 6,
        "url" : 7,
        "note" : 8,
        "pos" : 9, // array of positions
        "file" : 10, // reserved
        "shares" : 11, // array of userid's (only valid for passwords)
        "shareindex" : 12, // special value only set for shares
        "sharedataindex" : 13 // special value only set for shares
        }; // array index for passwords

var sad =
        {
        "cre" : 1,
        "upd" : 2,
        "name" : 0,
        "user" : 1,
        "pass" : 2,
        "url" : 3,
        "note" : 4,
        "pos" : 5,
        "file" : 6,
        }; // array index for shares

var gad =
      {
      "id" : 0,
      "cre" : 1,
	    "upd" : 2,
	    "name" : 3
	    }; // array index for groups

var mad =
        {
        "cre" : 0,
        "shares" : 1, // array of userid's that have received this mail (CC)
        "sub" : 2,
        "note" : 3,
        "file" : 4 // reserved
        }; // array index for mails
*/

$.alerts =
{
		// These properties can be read/written by accessing $.alerts.propertyName from your scripts at any time
		okButton: 'OK',         // text for the OK button
		cancelButton: 'Cancel', // text for the Cancel button
		nextButton: 'Next' // text for the next button
};

// How to handle exceptions
window.onerror = function(msg, url, line, col, error)
{
  loader(false);

  if(confirm("Error encountered during execution of code. Send the data below to the developers so we can improve the system?\n\n" + msg + "\nSource: " + url + "\nLine: " + line))
  {
      var stack = "unknown";

      if(error && error.stack)
        stack = error.stack;

      jserror.new('pcryptdesktop', msg, url, line, stack, navigator.userAgent, navigator.language, 0, function(data, error, id)
      {
        if(error)
        {
          alert(error + ': ' + data);
        }
      });
  }

  var suppressErrorAlert = true;
  // If you return true, then error alerts (like in older versions of
  // Internet Explorer) will be suppressed.
  return suppressErrorAlert;
};

$(document).ready(function ()
{
  var redirecturl = pcrypt.getvalue('pcrypttimeouturl');
  var unloadtime = pcrypt.getvalue('unloadtime', false);
  var loadtime = Date.now();

  // logout if page reload takes too long (recreate tab is not allowed after long time has passed)
  if(unloadtime && redirecturl)
  if((unloadtime + 60000) < loadtime)
  {
    window.location.replace(redirecturl);
  }

  // Away detection	(logout on no activity)
  if(initjquerysystemtimeout())
  {
    resetsystemtimeout();
    setInterval(checksystemtimeout, 10000);
  }
  else
  {
    console.log("Unable to init timeout");
  }

  //activateTooltip();
});

$(window).load(function()
{
  // This have to be the latest to execute as status can change in other js file

  // TODO - remove file document.getElementById('menulockimgid').setAttribute('src', 'images/lockopen.png');
  // TODO - remove file document.getElementById('menulockimgid').setAttribute('src', 'images/lockshut.png');

  initpcryptnotification(5000, notificationHandling);
});

//$(window).on('unload', function ()
$(window).unload(function ()
{
  // TODO - does not seam to be called in chrome?
  if(gpcrypt.esource)
    gpcrypt.esource.close();
  pcrypt.setvalue('unloadtime', Date.now(), false);
});

$(window).keyup(function(e)
{
    if (!e.ctrlKey)
        window.ctrlKey = false;
});

$(window).keydown(function(e)
{
    if (e.ctrlKey)
        window.ctrlKey = true;
});

function activateTooltip() {
	$('.pc-bs-toggle').tooltip();
	$('[data-toggle="popover"]').popover();
}

function activatePopover(selector) 
{
	$(selector + ' ' + '[data-toggle="popover"]').popover(
    { 
      // Options go here
    });
}

function initjquerysystemtimeout()
{
    if (!jQuery)
      return false;

    var doc = $(document);

    doc.ready(function()
    {
            try
            {
              doc.mousemove(resetsystemtimeout);
              doc.mouseenter(resetsystemtimeout);
              doc.scroll(resetsystemtimeout);
              doc.keydown(resetsystemtimeout);
              doc.click(resetsystemtimeout);
              doc.dblclick(resetsystemtimeout);
            } catch (err) {return false;}
    });

    return true;
}

function notificationHandling(data)
{
  // Read unread mails in storage
  var unreadmails = pcrypt.getvalue('unreadmails');
  var unreadshares = pcrypt.getvalue('unreadshares');
  var unreadadminmails = pcrypt.getvalue('unreadadminmails');
  var teamupdate = pcrypt.getvalue('teamupdate');
  var soundfile = 'sound/mail.wav';

  if(!data || data.logout)
	{
    pcrypt.flushvalues();
    redirectinvalidlogin();
		return;
	}

  if(data.teamupdate)
  {
    if(teamupdate != data.teamupdate)
    {
      $('#check-team-counter').html('!');
      $('#check-team-counter').css('display', 'block');

      var audio = new Audio(soundfile);
      audio.play();

      pcrypt.setvalue('teamupdate', data.teamupdate);
      pcrypt.setvalue('teamchanges', 1); // force update other places
    }
  }

  if(data.mails)
  {
    if((!unreadmails || unreadmails < data.mails))
    {
      $('#check-mail-counter').html(data.mails);
      $('#check-mail-counter').css('display', 'block');

      var audio = new Audio(soundfile);
      audio.play();

      pcrypt.setvalue('unreadmails', data.mails);
    }
  }

  if(data.adminmails)
  {
    if((!unreadadminmails || unreadadminmails != data.adminmails))
    {
      $('#check-globalmsg-counter').html("!");
      $('#check-globalmsg-counter').css('display', 'block');

      var audio = new Audio(soundfile);
      audio.play();

      pcrypt.setvalue('unreadadminmails', data.adminmails);
    }
  }

  if(data.shares)
  {
    if(!unreadshares || (unreadshares < data.shares))
    {
      $('#check-password-counter').html('!');
      $('#check-password-counter').css('display', 'block');

      var audio = new Audio(soundfile);
      audio.play();

      pcrypt.setvalue('unreadshares', data.shares);
    }
  }
	else if(data.sharesdel)  // All shares removed from user (special handling)
  {
    if(unreadshares >= 0)
		{
			$('#check-password-counter').html('-');
			$('#check-password-counter').css('display', 'block');

			var audio = new Audio(soundfile);
			audio.play();

			pcrypt.setvalue('unreadshares', -1);
		}
  }
}

function resetsystemtimeout(event)
{
  //console.log("reset");

  if(gpcrypt.timeout == undefined) // get reset on page reload etc.
  {
    if(pcrypt.existvalue('pcrypttimeout'))
    {
      gpcrypt.timeout = pcrypt.getvalue('pcrypttimeout');
    }
    else
    {
      gpcrypt.timeout = 0;
    }
  }

  if(gpcrypt.timeout > 0)
  {
    gpcrypt.timeouttime = new Date().getTime() + gpcrypt.timeout;
  }
}

function checksystemtimeout()
{
  //console.log("check");

  var redirecturl = pcrypt.getvalue('pcrypttimeouturl');

  if(!pcrypt.existvalue('pcrypttimeout') && redirecturl)
    return;

  if(gpcrypt.timeouttime == undefined)
    return;

  if((new Date().getTime() > gpcrypt.timeouttime))
  {
          pcrypt.deletevalue('pcrypttimeout'); // stop further attempts
          gpcrypt.timeout = 0;
          gpcrypt.timeouttime = undefined;

	        window.location.replace(redirecturl);
  }
}

function exportcsv(array, items, config)
{
	var exportArr = [];
	var column, obj, row;

	if(!Array.isArray(array))
	  return null;

  if(!Array.isArray(items))
	  return null;

	if(!config.columns)
	  return null;

	if(config.columns.length == 0)
	  return null;

	for (var i = 0, i_len = items.length; i < i_len; i++)
	{
	  row = {};
	  obj = array[items[i]];

    for (var j = 0, j_len = config.columns.length; j < j_len; j++)
    {
      column = config.columns[j];

      if(obj.hasOwnProperty(column))
      {
        if(config.json && config.json.indexOf(column) > -1)
        {
          if((typeof obj[column] === 'string') && !obj[column].length)
            row[column] = "";
          else
            row[column] = JSON.stringify(obj[column]);
        }
        else
        {
          row[column] = obj[column];
        }
      }
    }

    exportArr.push(row);
	}

	if(exportArr.length == 0)
	  return "";

	return CSV.objectToCsv(exportArr, config).replace(/\n/g,'\r\n');
}

function removefilefrompath(pathname)
{
    if(pathname[pathname.length-1] == '/')
      return pathname.substring(0, pathname.length - 1);

    var pathArray = pathname.split( '/' );
    var newPathname = "";

    for(var i = 0 ; i < (pathArray.length - 1) ; i++ ) // get path without filename
    if(pathArray[i].length)
    {
      newPathname += "/";
      newPathname += pathArray[i];
    }

    return newPathname;
}
/**
 * @description redirect user to logout if invalid login
 */
function redirectinvalidlogin() // user may have opened a new tab (not legal as it erases sessionStorage for the new tab)
{
  /** 
   * Check if extension is installed, 
   * check if extension has the same username and password.
   * */ 
	if(!validlogin())
	{
    pcrypt.flushvalues(); // Just to be on the safe side
		window.location.replace(window.location.protocol + '//' + window.location.host + removefilefrompath(window.location.pathname) + '/index.html?action=sessionlogout');
		return false; // not really needed
	}

	return true;
}

/**
 * 
 * @param {Array} headerarray 
 * @param {Array} idarray 
 * @param {Array} htmlarray 
 * @param {string} tableid
 * @param {string} tableclass
 * @param {string} tablestyle
 */
function buildtable(headerarray, idarray, htmlarray, tableid, tableclass, tablestyle)
{
	//http://www.oreillynet.com/pub/a/javascript/2003/05/06/dannygoodman.html?page=2
  //http://www.oreillynet.com/javascript/2003/05/06/examples/dyn_table_benchmarker_ora.html
  
  if(!htmlarray)
  {
    htmlarray = [];
  }

	var tablestring;

	if(!tableid)
	  tableid = "datagrid";

	if(tableclass)
	  tableclass += " datagrid";
	else
	  tableclass = "datagrid";


	tablestring = "<div class='" + tableclass + "'><table id='" + tableid + "' class='" + tableclass + "' style='" + ((typeof tablestyle != 'undefined') ? tablestyle : '') + "'>";

	tablestring += "<thead><tr>";
	for (var i = 0, len_i = headerarray.length; i < len_i; ++i)
		tablestring += "<th " + headerarray[i][1] + ">" + headerarray[i][0];
  tablestring += "</tr></thead>";

  tablestring += "<tfoot></tfoot><tbody style='min-height: 10px;'>";

	for (var i = 0, len_i = htmlarray.length; i < len_i; ++i)
	{
		if(idarray && idarray[i])
		  tablestring += "<tr id=" + idarray[i] + ">";
		else
		  tablestring += "<tr>";

    var len_j = htmlarray[i].length;

    if(len_j < headerarray.length)
      len_j = headerarray.length;

    for (var j = 0; j < len_j; ++j)
    {
      if(htmlarray[i][j])
        tablestring += "<td>" + htmlarray[i][j] + "</td>";
      else
        tablestring += "<td>&nbsp;</td>"
    }

		tablestring += "</tr>";
	}

	tablestring += "</tbody></table></div>";

	return tablestring;
}

/**
 * Build rows html
 *
 * @param {Array} rowarray
 */
function builddivhtml(rowarray)
{
  var rowstring = '';

  rowstring += '<div><table>';
  for (var i = 0, len_i = rowarray.length; i < len_i; ++i)
  {
    //rowstring += rowarray[i] + "<br>";
    let item = rowarray[i];
    rowstring += '<tr><td class="bold">' + item.label + '</td><td>' + item.value + "</td></tr>";
  }
  rowstring += '</table></div>';

  return rowstring;
}

function setdomlanguage(lang, index, keephide, element)
{
  var textele;

  if(element)
    textele = element.getElementsByClassName('ltext');
  else
    textele = document.getElementsByClassName('ltext');

  var textelelength = textele.length;

  for (var i = 0; i < textelelength; ++i)
  {
    var item = textele[i];

    if(lang[index] && item)
    {
      if (item.getAttribute("data-lang")) // Data attributes (as it should be)
      {
	      if(lang[index][item.getAttribute("data-lang")])
        {
          item.innerHTML = lang[index][item.getAttribute("data-lang")];
          continue;
        }
      }
      if(lang[index][item.id]) // Span and label elements
      {
        item.innerHTML = lang[index][item.id];
        continue;
      }

      if(lang[index][item.title]) // Input or link elements (title)
      {
        item.title = lang[index][item.title];
        continue;
      }

      if(lang[index][item.name]) // Other elements (special)
      {
        switch(item.type)
        {
          case 'submit':
          case 'reset':
          case 'button':
            item.value = lang[index][item.name]; // Value specify the language text
          break;

          case 'text':
          case 'password':
          case 'number':
            if (item.getAttribute("data-placeholderlang")) // Data attributes (as it should be)
            {
              if ( lang[index][item.getAttribute( "data-placeholderlang" )] )
              {
                item.placeholder = lang[index][item.getAttribute( "data-placeholderlang" )]; // Must be placeholder that is the language text
              }
            }
            else 
            {
              item.placeholder = lang[index][item.name]; // Must be placeholder that is the language text
            }
          break;
        }

        if (item.tagName.toLowerCase() == "textarea")
        {
          item.placeholder = lang[index][item.name];
        }
        continue;
      }
    }

    if(!keephide)
    {
      // also set navigation
      // TODO - Der skal ryddes op i sprog database (gammel struktur - alle 'top' og 'buttom' sprog skal slettes)

      if(lang['topmenu'][item.id])
      {
        item.innerHTML = lang['topmenu'][item.id];
        continue;
      }

      if(lang['topmenu'][item.title]) // Input or link elements (title)
      {
        item.title = lang['topmenu'][item.title];
        continue;
      }
    }
  }

  if(keephide && (keephide == true))
    return;

  $.alerts.okButton = lang.default.PCBUTTONOK;
  $.alerts.cancelButton = lang.default.PCBUTTONCANCEL;

	// Only used in import dialog
	$.alerts.importButton = lang.default.PCBUTTONIMPORTFILE;
  $.alerts.nextButton = lang.default.PCBUTTONNEXT;

  var ltext = document.getElementById('ltexthidden');

  if(ltext)
      ltext.style.display = "block";
}

function getUrlParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');

    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            if(sParameterName[1] == undefined)
              return true;
            else
              return decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
}

function loadHtmlPage(page, callback)
{
  try
  {
   var http = new XMLHttpRequest();

   http.onreadystatechange = function()
   {
        if (http.readyState == 4)
        {
          switch(http.status)
          {
            default:
              if(typeof(http) == 'object')
                callback('Unable to load HTTP page: ' + http.status);
              else if(typeof(http) == 'string')
                callback('Unable to load HTTP page: ' + http);
              else
                callback('Unable to load HTTP page');
            break;

            case 0: // Special chrome bug/feauture when running local files ?????
            case 200:
              callback(http.responseText);
            break;
          }
        }
    };

    http.open("GET", page, true);
    http.send(null);

    return true;
   }
   catch(err)
   {
    callback(err.message);
    return false;
   }
}

function loadjscssfile(filename, filetype, callback)
{
  try
  {
    var fileref;

    switch(filetype)
    {
      default:
        return false;
      break;

      case "js":
        fileref = document.createElement('script');
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("async", "async");
        fileref.setAttribute("src", filename);
        if(callback)
          fileref.onload = callback;
      return document.getElementsByTagName("head")[0].appendChild(fileref);

      case "css":
        fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);
        if(callback)
          fileref.onload = callback;
      return document.getElementsByTagName("head")[0].appendChild(fileref);
    }
  }
  catch(err)
  {
    callback(err.message);
    return false;
  }
}

function loadDialog(dialogdiv, filename, js, css, callback)
{
	if(dialogdiv instanceof HTMLElement)
	{
			callback(false);
	}
	else
	{
		var htmlfile = location.pathname.substring(0, location.pathname.lastIndexOf('/')+1) + "html/" + filename + ".html";
		var jsfile = location.pathname.substring(0, location.pathname.lastIndexOf('/')+1) + "js/" + filename + ".js";
		var cssfile = location.pathname.substring(0, location.pathname.lastIndexOf('/')+1) + "css/" + filename + ".css";

		loadHtmlPage(htmlfile, function htmlfilecallback(content)
		{
			dialogdiv = document.createElement("div");
			dialogdiv.setAttribute("id", "dialog-" + filename);
			dialogdiv.setAttribute("class", "txtCenter none");
			dialogdiv.innerHTML = content;

			setdomlanguage(g.lang, filename, true, dialogdiv);

			if(js)
			{
			  loadjscssfile(jsfile, 'js', function jsfilecallback()
			  {
				  if(css)
				  {
				    loadjscssfile(cssfile, 'css', function cssfilecallback()
				    {
				      callback(dialogdiv);
				    });
				  }
				  else
				  {
				    callback(dialogdiv);
				  }
			  });
			}
      else
      {
        callback(dialogdiv);
      }
		});
	}
}

function getStyle(oElm, strCssRule)
{
    var strValue = "";
    if(document.defaultView && document.defaultView.getComputedStyle)
    {
        strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
    }
    else if(oElm.currentStyle)
    {
        strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1)
        {
            return p1.toUpperCase();
        });
        strValue = oElm.currentStyle[strCssRule];
    }
    return strValue;
}

function tablesetbackgroundcolor(table)
{
  var shownrownumber = 0;

  // We have to paint the row backgrounds after sort/search as there may be hidden rows (sadly - but no other way)

  // Loop through table rows
  for (var rowIndex = 0; rowIndex < table.rows.length; rowIndex++)
  {
    var row = table.rows.item(rowIndex);

    // Do not execute further code for header row
    if (row.parentElement.nodeName == 'THEAD')
      continue;

    if(row.style.display != 'none')
    {
      if(shownrownumber%2 == 0)
	  {
		row.className = 'highlighted-row';
	  }
	  else
	  {
		row.className = '';
	  }
	  row.style.display = 'table-row';

      shownrownumber++;
    }
  }
}

function tablesearch(table, rowid, searchtext)
{
  var shownrownumber = 0;

	if(!table || !table.rows)
		return;

  var tablelength = table.rows.length;

  // We have to paint the row backgrounds after sort/search as there may be hidden rows (sadly - but no other way)

  // Loop through table rows
  for (var rowIndex = 0; rowIndex < tablelength; rowIndex++)
  {
    var rowData = '';
    var row = table.rows.item(rowIndex);
    var targetTableColCount = row.cells.length;

    // Do not execute further code for header row
    if (row.parentElement.nodeName == 'THEAD')
      continue;

    if(rowid && (rowid > 0))
		if(row.id != rowid)
		{
		  row.style.display = 'none';
		  continue;
    }

    // Process data rows
    for (var colIndex = 0; colIndex < targetTableColCount; colIndex++)
    {
      var cell = row.cells.item(colIndex);

      if(cell)
      {
        rowData += cell.textContent;

        var searchelem = cell.getElementsByClassName("searchtext"); // Find elements that have a class that specify we can search them

        for (var i = 0, len_i = searchelem.length ; i < len_i ; i++)
        {
          if(searchelem[i].title)
            rowData += searchelem[i].title;

          if(searchelem[i].value)
            rowData += searchelem[i].value;
        }
      }
    }

    // If search term is not found in row data then hide the row, else show
    if (rowData.toLowerCase().indexOf(searchtext.toLowerCase()) == -1)
    {
        row.style.display = 'none';
        row.className = '';
        row.dataset.search = "false";
        continue;
    }

    if(shownrownumber%2 == 0)
    {
      row.className = 'highlighted-row';
    }
    else
    {
      row.className = '';
    }
    row.style.display = 'table-row';
    row.dataset.search = "true";

    shownrownumber++;

  }

  return shownrownumber;
}

function fillteamselect(selelement, selectedid, addall, onlyadmin, hidenotapproved, hidenoshare)
{
    if(!(selelement instanceof HTMLElement))
    {
      console.log('No element in fillteamselect');
      return;
    }

    if(typeof onlyadmin === 'undefined')
    	onlyadmin = false;

    if(typeof hidenotapproved === 'undefined')
    	hidenotapproved = false;

    if(typeof hidenoshare === 'undefined')
      hidenoshare = false;


    selelement.length = 0; // remove all elements

  if(addall)
  {
    var selected = -1 == selectedid ? true : false;
    var op = new Option(addall, gpcrypt.sgid.all, selected, selected);
    selelement.options[selelement.options.length] = op;
  }

	pcrypt.getteaminfo(pcrypt.getvalue('session'), false, 'pcryptteaminfo', 0, function teaminfofunc(data, error, id)
	{
		if(error)
		{
			handlepcrypterror(error, data)
			return;
		}

		if(!data || (data.length == 0))
			data = {};

    var dataarray = [];

    for(var teamid in data)
    {
      if(data.hasOwnProperty(teamid))
      {
        if(!data[teamid].fields)
          continue;

        if(onlyadmin && !data[teamid].admin)
          continue;

        if(hidenotapproved && !data[teamid].approved)
          continue;

        if(hidenoshare && !data[teamid].admin && (data[teamid].fields.options & pcrypt.teamoptions.onlyadminshare))
          continue;

        dataarray.push([decodeHtml(data[teamid].fields.name), teamid]);
      }
    }

    dataarray.sort(function(a, b)
    {
      var nameA, nameB;

	    if(a[0])
		    nameA = a[0].toLowerCase();
	    else
		    nameA = "";

	    if(b[0])
		    nameB = b[0].toLowerCase();
	    else
		    nameB = "";

	    if (nameA < nameB) //sort string ascending
	      return -1
	    if (nameA > nameB)
	      return 1
	    return 0 //default return value (no sorting)
    });

		for (var i = 0, len_i = dataarray.length; i < len_i; ++i)
		{
			var selected = dataarray[i][1] == selectedid ? true : false;
      		var op = new Option(dataarray[i][0], dataarray[i][1], selected, selected);
			op.style.cursor = "pointer";
			selelement.options[selelement.options.length] = op;
		}
	});
}
/*
function fillTeamInfo(tidshown)
{
  if(g.tidshown === null || g.tidshown === undefined)
  {
    alert('No g.tidshown can be called from pcrypt_desktop.js');
  }

  pcrypt.getteaminfo(pcrypt.getvalue('session'), false, 'pcryptteaminfo', 0, function(data, error, id)
  {
    if(error)
    {
      handlepcrypterror(error, data);
    }

    document.getElementById('infotextteamname').innerText = decodeHtml(data[tidshown.toString()].fields.name);
    document.getElementById('infotextteamcontact').innerText = decodeHtml(data[tidshown.toString()].fields.contact);
  });
}
*/
function selectoptionbyvalue(selobj, val)
{
  var A = selobj.options, L = A.length;
  while(L)
	{
		if (A[--L].value == val)
		{
      selobj.selectedIndex = L;
      L = 0;
    }
  }
}

function findmindist(distarray)
{
  var mindiff;

  distarray.sort();

  switch(distarray.length)
  {
    case 0:
    case 1:
      mindiff = -1;
    break;

    case 2:
      mindiff = distarray[1]-distarray[0];
    break;

    default:
      mindiff = distarray[1]-distarray[0];
      for (var i = 2 ; i < distarray.length ; i++)
      {
        mindiff = Math.min(mindiff, distarray[i]-distarray[i-1]);
      }
    break;
  }

  return mindiff;
}

function setOption(selectElement, value)
{
  var options = selectElement.options;
  for (var i = 0, optionsLength = options.length; i < optionsLength; i++)
  {
    if (options[i].value == value)
    {
      selectElement.selectedIndex = i;
      return true;
    }
  }
  return false;
}

function handlepcrypterror(error, data)
{
  loader(false);
  onerror(error + " - " +  data, 'handlepcrypterror', 0, 0, null)
}

// Test or set loader gif
function loader(action)
{
  if (typeof action == 'undefined')
    return $('#div_loading').is(':visible');

  if(action)
  {
    if(modalvisible())
      setOverlayFill(true);

    $('#div_loading').show();
  }
  else
  {
    if(modalvisible())
      setOverlayFill(false);

    $('#div_loading').hide();
  }

  return true;
}

// http://stackoverflow.com/questions/1202079/prevent-jquery-ui-dialog-from-setting-focus-to-first-textbox/4814001#4814001
function modalvisible()
{
	return $('.ui-dialog').is(':visible');
}

function modalalert(text, title, callback)
{
  var esctext;

  if(text)
  {
    var xssfilter = new xssFilter();
    //xssfilter.options({escape: true});
  	esctext = xssfilter.filter(text);
  }

  var esctitle = htmlspecialchars(title, ['ENT_QUOTES']);
  var newDiv = $("<div title='" + esctitle + "'/>");
  var idnum = Date.now().toString();

  loader(false);

  function okreply()
  {
    if(callback)
    {
      if(callback(true) !== true)
        newDiv.dialog("close");
    }
    else
    {
      newDiv.dialog("close");
    }
  }

  newDiv.html("<p class='ui-widget'>" + esctext + "</p>").dialog(
  {
          modal: true,
          width: 490,
					show: "blind",
					hide: "blind",
					resizable: false,
					closeOnEscape: true,
					close: function(event, ui) { if(newDiv) newDiv.remove(); },
					focus: function() {$("#btnModalAlertOK" + idnum).focus();},
					buttons:
					[
            {
              id: "btnModalAlertOK" + idnum,
              text: $.alerts.okButton,
              click: function() { okreply(); }
            }
          ]
  });

  activatePopover('.ui-dialog');

}

/**
 * Show modal confirm box
 *
 * @param text
 * @param title
 * @param callback
 */
function modalconfirm(text, title, callback)
{
  var esctext;

  if(text)
  {
    var xssfilter = new xssFilter();
    //xssfilter.options({escape: true});
  	esctext = xssfilter.filter(text);
  }

  var esctitle = htmlspecialchars(title, ['ENT_QUOTES']);
  var newDiv = $("<div title='" + esctitle + "'/>");
  var idnum = Date.now().toString();

  loader(false);

  function okreply()
  {
    if(callback)
    {
      if(callback(true) !== true)
        newDiv.dialog("close");
    }
    else
    {
      newDiv.dialog("close");
    }
  }

  function cancelreply()
  {
    newDiv.dialog("close");
    if(callback)
      callback(false);
  }

  newDiv.html("<p class='ui-widget'>" + esctext + "</p>").dialog(
  {
    classes: {
      "ui-dialog": "ui-corner-all ui-dialog-pc ui-modal-confirm"
    },
    modal: true,
    width: 480,
    show: "blind",
    hide: "blind",
    resizable: false,
    closeOnEscape: true,
    close: function(event, ui)
    {
      if(newDiv)
      {
        newDiv.remove();
      }
    },
    focus: function()
    {
      $("#btnModalConfirmCancel" + idnum).focus();
    },
    buttons:
    [
      {
        id: "btnModalConfirmOK" + idnum,
        text: $.alerts.okButton,
        click: function() { okreply(); }
      },
      {
        id: "btnModalConfirmCancel" + idnum,
        text: $.alerts.cancelButton,
        click: function() { cancelreply(); }
      }
    ]
	});
}

/**
 * @description Generates a prompt for the user to write something into, can contain an onopen and or callback function executions
 * @param {string} text Text value to display in the modal.
 * @param {string} title The title of the modal.
 * @param {string} prompt input field type, i.e. email, password, etc.
 * @param {string} placeholder placeholder text for input field.
 * @param {number} length Max allowed length of the prompt.
 * @param {function} onopen function to call on opening the prompt, or false for no function call on open.
 * @param {function} callback function called after the prompt is closed. parameter of the function is the input given to the input field.
 */
function modalprompt(text, title, prompt, placeholder, length, onopen, callback)
{
  var esctext;

  if(text)
  {
    var xssfilter = new xssFilter();
    //xssfilter.options({escape: true});
  	esctext = xssfilter.filter(text);
  }

  var esctitle = htmlspecialchars(title, ['ENT_QUOTES']);
  var escprompt = htmlspecialchars(prompt, ['ENT_QUOTES']);
  var escplaceholder = htmlspecialchars(placeholder, ['ENT_QUOTES']);
  var newDiv = $("<div title='" + esctitle + "'/>");
  var idnum = Date.now().toString();

  loader(false);

  if(!length)
    length = 64;

  function okreply()
  {
    var promptvalue = $("#promptid" + idnum).val();

    if(callback)
    {
      if(callback(promptvalue) !== true)
        newDiv.dialog("close");
    }
    else
    {
      newDiv.dialog("close");
    }
  }

  function cancelreply()
  {
    newDiv.dialog("close");
    if(callback)
      callback(false);
  }

  newDiv.keypress(function(e)
  {
    if( e.keyCode == $.ui.keyCode.ENTER )
    {
      $("#btnModalPromptOK" + idnum).click();
      return false;
    }
  });

  var htmltext = "<p class='ui-widget'>" + esctext + "</p>";

  if(prompt === 'PASSWORD')
  {
    htmltext += "<input id='promptid" + idnum + "' type='password' placeholder='" + escplaceholder + "' name='promptid' value='' maxlength=" + length + " style='width: 100%; box-sizing: border-box; -webkit-box-sizing:border-box; -moz-box-sizing: border-box;'>";

  }
  else
  {
    htmltext += "<input id='promptid" + idnum + "' type='text' placeholder='" + escplaceholder + "' name='promptid' value='" + escprompt + "' maxlength=" + length + " style='width: 100%; box-sizing: border-box; -webkit-box-sizing:border-box; -moz-box-sizing: border-box;'>";
  }

  newDiv.html(htmltext).dialog(
  {
	modal: true,
	width: 480,
  	show: "blind",
	hide: "blind",
	resizable: false,
	closeOnEscape: true,
	close: function(event, ui) { if(newDiv) { newDiv.remove(); } },
	open: function(event, ui)
	{
		if (typeof onopen == "function")
		{
			$('button').blur(); onopen();
		}

    setTimeout(function()  // This works
    {
      $("#promptid" + idnum).focus();
    }, 420); // After 420 ms

	},
	focus: function() {$("#promptid" + idnum).select();},  // Does not always work
	buttons: [{
  		id: "btnModalPromptOK" + idnum,
  		text: $.alerts.okButton,
  		click: function() { okreply(); }
	},
	{
  		id: "btnModalPromptCancel" + idnum,
  		text: $.alerts.cancelButton,
  		click: function() { cancelreply(); }
		}
  ]});
}

function modalhtml(html, width, title, returnisok, hideCancel, callback)
{
  var esctitle = htmlspecialchars(title, ['ENT_QUOTES']); http://jqueryui.com/upgrade-guide/1.10/#changed-title-option-from-html-to-text
  var newDiv = $("<div title='" + esctitle + "'/>");
  var idnum = Date.now().toString();

  loader(false);

  function okreply()
  {
    var returnobject = new Object();
    var elem = document.getElementById('htmldialogform' + idnum).elements;

    if(elem)
    for(var i = 0; i < elem.length; i++)
    {
      if(elem[i].options)
        returnobject[elem[i].id] = {text: elem[i].options[elem[i].options.selectedIndex].text, value: elem[i].options[elem[i].options.selectedIndex].value}
      else if(elem[i].id)
        returnobject[elem[i].id] = elem[i].value;
      else if(elem[i].name)
        returnobject[elem[i].name] = elem[i].value;
      else
        returnobject[i] = elem[i].value;
    }

    if(callback)
    {
      if(callback(returnobject) !== true)
        newDiv.dialog("close");
    }
    else
    {
      newDiv.dialog("close");
    }
  }

  function cancelreply()
  {
    newDiv.dialog("close");
    if(callback)
      callback(false);
  }

  if(returnisok)
  {
    newDiv.keypress(function(e)
    {
      if( e.keyCode == $.ui.keyCode.ENTER )
      {
        $("#btnModalHtmlOK" + idnum).click();
        return false;
      }
    });
  }

  // make form around html

  var htmltext = "<form id='htmldialogform" + idnum + "'>";
  htmltext += html;
  htmltext += "</form>";

  var buttonsArray = [
      {
        id: "btnModalHtmlOK"+ idnum,
        text: $.alerts.okButton,
        click: function() { okreply(); }
      },
      {
        id: "btnModalHtmlCancel" + idnum,
        text: $.alerts.cancelButton,
        click: function() { cancelreply(); }
      }
  ];
  if (typeof hideCancel != "undefined" && hideCancel) {
    buttonsArray = [buttonsArray[0]];
  }

  newDiv.html(htmltext).dialog(
  {
          modal: true,
          width: width,
					show: "blind",
					hide: "blind",
					resizable: false,
					closeOnEscape: true,
					close: function(event, ui) { if(newDiv) newDiv.remove(); },
					buttons: buttonsArray
	});
}

function extraButtonsCallbackClosure(i, div, buttons, callback) { return function() { return callback(i, div, buttons); } }

/**
 * @summary Opens a jQuery UI Dialog Box.
 * @description Iterates through the content of the options object, if content
 * is found the code generates the neccesary html elements for the modal.
 *
 * @param {Object} options Object containing variables indicating the given options the modaldiv.
 * @example options object example
 * options.div          = '#dialog-dialogName'                                            // ID for the dialog
 * options.extrabuttons = [{text: 'someText', width: 100, callback: function(params){}} ] // Extra buttons array and callback(s)
 * options.hideok       = false                                                           // Hide okay button
 * options.hidecancel   = false                                                           // Hide cancel button
 * options.returnisok   = false                                                           // Ok button return statement
 * options.width        = 100                                                             // Width of modal
 * options.title        = 'some title'                                                    // Title of modal
 * options.onopen       =  function () {'call function when dialog opens'}                // Function call when dialog is opened
 * options.callback     =  function (params) {'call function when button is clicked'}     // Callback on "ok" button
 */
function modaldiv_advanced(options)
{
	//var esctitle = htmlspecialchars(title, ['ENT_QUOTES']); http://jqueryui.com/upgrade-guide/1.10/#changed-title-option-from-html-to-text
	var idnum = Date.now().toString();
	var mybuttons = [];
	var bAccepts = false;
	var div = options.div

	loader(false);

	if (typeof options.extrabuttons != 'undefined' && $.isArray(options.extrabuttons))
	{
		for (var i = 0; i < options.extrabuttons.length; i++)
		{
      //var tmpI = i; // inline closure

      mybuttons.push(
      {
        id: "extraButton" + i + idnum,
				text: options.extrabuttons[i].text,
        width: options.extrabuttons[i].width,
				class: "extra-button",
        click: options.extrabuttons[i].callback
			});
		}
	}

  if(!options.hideok)
  {
    mybuttons.push(
    {
      id: "btnModalDivOK" + idnum,
      text: options.oktext ? options.oktext : $.alerts.okButton,
      click: function() { okreply(); }
    });
  }

  if(!options.hidecancel)
  {
    mybuttons.push(
    {
      id: "btnModalDivCancel" + idnum,
      text: options.canceltext ? options.canceltext : $.alerts.cancelButton,
      click: function() { cancelreply(); }
    });
  }

	if(options.returnisok)
	{
		$(div).keypress(function(e)
		{
    		if( e.keyCode == $.ui.keyCode.ENTER )
    		{
				$("#btnModalDivOK" + idnum).click();
				return false;
			}
		});
	}

	function okreply()
	{
		if(options.callback)
		{
			bAccepts = true;
			if(options.callback(true) !== true)
    		{
				  $(div).dialog("close");
			  }
    	}
    	else
    	{
        bAccepts = true;
        $(div).dialog("close");
    	}
	}

	function cancelreply()
	{
    	bAccepts = false;
    	$(div).dialog("close");
    	if(options.callback)
			options.callback(false);
	}

	$(div).dialog(
	{
    modal: true,
    width: options.width,
    title: options.title,
		show: "blind",
		hide: "blind",
		resizable: false,
		closeOnEscape: true,
		open: function(event, ui)
		{
			scrollLock(true);

			if (typeof options.onopen == "function")
			{
				$('button').blur(); options.onopen();
			}
		},
		close: function(event, ui)
		{
			scrollLock(false);
			if (!bAccepts)
			{
				cancelreply();
			}
		},
		buttons: mybuttons
	});
}

/**
 * Opens a jQuery UI Dialog Box
 *
 * @param div
 * @param {Number}   width
 * @param {String}   title
 * @param {boolean}  returnisok
 * @param {boolean}  hidecancel
 * @param {Function} onopen
 * @param callback
 */
function modaldiv(div, width, title, returnisok, hidecancel, onopen, callback)
{
  //var esctitle = htmlspecialchars(title, ['ENT_QUOTES']); http://jqueryui.com/upgrade-guide/1.10/#changed-title-option-from-html-to-text
  var idnum = Date.now().toString();
  var mybuttons;
  var bAccepts = false;

  //div = $(div);//convert to jQuery Element

  loader(false);

  if(($("#hidecancel").parents(div).length == 1) || hidecancel)
  {
    	mybuttons = [{
			id: "btnModalDivOK" + idnum,
			text: $.alerts.okButton,
			click: function()
			{
				okreply();
			}
		}];
  }
  else
  {
    	mybuttons = [{
			  id: "btnModalDivOK" + idnum,
			  text: $.alerts.okButton,
			  click: function() { okreply(); }
			},
			{
			  id: "btnModalDivCancel" + idnum,
			  text: $.alerts.cancelButton,
			  click: function() { cancelreply(); }
		}];
  }

  if(returnisok)
  {
    $(div).keypress(function(e)
    {
      if( e.keyCode == $.ui.keyCode.ENTER )
      {
        $("#btnModalDivOK" + idnum).click();
        return false;
      }
    });
  }

  function okreply()
  {
    if(callback)
    {
      bAccepts = true;
      if(callback(true) !== true)
      {
          $(div).dialog("close");
      }
    }
    else
    {
      bAccepts = true;
      $(div).dialog("close");
    }
  }

  function cancelreply()
  {
    bAccepts = false;
    $(div).dialog("close");
    if(callback)
	{
		callback(false);
	}
  }

	$(div).dialog(
	{
    modal: true,
    width: width,
    title: title,
		show: "blind",
		hide: "blind",
		resizable: false,
		closeOnEscape: true,
		open: function(event, ui)
		{
			scrollLock(true);

			if (typeof onopen == "function")
			{
				$('button').blur(); onopen();
			}
		},
		close: function(event, ui)
		{
			scrollLock(false);
			if (!bAccepts)
			{
				cancelreply();
			}
		},
		buttons: mybuttons
	});
}


var scrollKeys = {38: 1, 40: 1};
var scrollAllowedElements = '#share-memberframe, textarea#notefield, #share-teamframe';

function scrollPreventDefault(e, passiveObj) 
{
  e = e || window.event;

  if (e && e.preventDefault && passiveObj && !passiveObj.passive)
  {  
    e.preventDefault();
    e.returnValue = false;
  }
}

function preventDefaultForScrollKeys(e, passiveObj)
{
    if (e && scrollKeys[e.keyCode] && passiveObj && !passiveObj.passive)
    {
        e.preventDefault(e);
        return false;
    }
}

function supportsPassive() {
  var passiveSupported = false;

  try {
    var options = {
      get passive() {
        passiveSupported = true;
      }
    };

    window.addEventListener("test", options, options);
    window.removeEventListener("test", options, options);
  } catch (err) {
    passiveSupported = false;
  }

  return passiveSupported;
}

function disableScroll()
{
  var Passive =  false;
  try
  {

    var opts = Object.defineProperty({}, 'passive', {
      get: function()
      {
        Passive = true;
      }
    });

    if(window.addEventListener)
    {
      window.addEventListener('testPassive', opts);
    }
  }
  catch(e)
  {
    console.log(e);
  }

  var passiveSupported = supportsPassive();

  if (window.addEventListener) // older FF
      window.addEventListener('DOMMouseScroll', scrollPreventDefault(event, passiveSupported ? {passive: false} : false));
  window.onwheel = scrollPreventDefault; // modern standard
  window.onmousewheel = document.onmousewheel = scrollPreventDefault(event, passiveSupported ? {passive: false} : false) // older browsers, IE
  //window.ontouchmove  = preventDefault; // mobile
  document.onkeydown  = preventDefaultForScrollKeys(event, passiveSupported ? {passive: false} : false);
}



function enableScroll() {
  var passiveSupported = supportsPassive();
    if (window.removeEventListener)
        window.removeEventListener('DOMMouseScroll', scrollPreventDefault(event, passiveSupported ? {passive: false} : false), false);
    window.onmousewheel = document.onmousewheel = null;
    window.onwheel = null;
    document.onkeydown = null;
}

var disabledScrollHelper = false;
function bindScrollLockEvents() {
	// If hovering over divs that's allowed scrolling
	$(scrollAllowedElements).unbind();
	$(scrollAllowedElements).hover(function(e) {
		enableScroll();
	},
	function() {
		disableScroll();
	});

	$(scrollAllowedElements).on('mousewheel', function(event) {
		if (event.originalEvent.wheelDelta >= 0) {
			if ($(this).scrollTop() == 0) {
				disabledScrollHelper = true;
				disableScroll();
			}
			else {
				if (disabledScrollHelper) {
					enableScroll();
				}
			}

		}
		else {
			if (disabledScrollHelper) {
				disabledScrollHelper = false;
				enableScroll();
			}

			if($(this).scrollTop() + $(this).innerHeight() > $(this)[0].scrollHeight) {
				disabledScrollHelper = true;
				disableScroll();
			}
		}
	});
}

function scrollLock(lock) 
{
  if (lock) 
  {
		disableScroll();

		bindScrollLockEvents();
	}
  else 
  {
		enableScroll();
	}
}

function selallmemberfunc(e)
{
  for(var i=0 ; i < window.memberrecordcount ; i++)
	{
		document.getElementById('selidmember' + i).checked = document.getElementById('selallmember').checked;
	}
}

/**
 * @description Changes all checkboxes {selid} in a table when the element with the ID {statusId} is checked
 * @param {Event} e 
 * @param {String} statusId 
 * @param {String} selid 
 */
function selallfunc(e, statusId, selid, callback)
{
  if(statusId === undefined || typeof statusId !== 'string')
  {
    return;
  }

  if(selid === undefined || typeof selid !== 'string')
  {
    return;
  }

  var i_len = document.getElementById(statusId).parentElement.parentElement.parentElement.parentElement.rows.length

  var newstatus = document.getElementById(statusId).checked;

  for (var i = 0; i <= i_len-1; i++) 
  {
    let newevent = new Event("change", {"bubbles": true, "cancelable": false});
    var selelem = document.getElementById(selid + i);

    if (selelem)
    {
      if(selelem.parentElement.parentElement.tagName == 'TR' && selelem.parentElement.parentElement.style.display == 'none')
      {
        selelem.checked = false;
        selelem.dispatchEvent(newevent);
        continue;
      }
      selelem.checked = newstatus;
      selelem.dispatchEvent(newevent);
    }
  }
  if(callback)
  {
    callback();
  }
}

function validsharenumber(shares, teamobject)
{
  var validshares = 0;

  if(shares && !Array.isArray(shares) && (typeof shares === 'object')) // test it is an object and not an array (old system not valid anymore)
  {
    if(shares[0])
    {
      validshares++;
    }

    for(var user in shares)
    {
      if(Array.isArray(user))
      {
        for(var i = 0, i_len = user.length; i < i_len; i++)
        {
          validshares++;
        }
        if(shares[0])
        {
          validshares++;
        }
      }
      else
      {
        for(var i = 0, i_len = shares[user].length ; i < i_len ; i++)
        {
          if(teamobject[user] && teamobject[user][shares[user][i]])
          {
            validshares++;
            break;
          }
        }
      }
    }
  }

  return validshares;
}

// Handle postMessage
function receivePostMessage(event, callback)
{
  var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
  if (origin !== window.location.origin) // Only accept from same origin (inject script)
    return;

  if(event.data && event.data.method && event.data.target && (event.data.target == 'desktop'))
  {
    switch(event.data.method)
    {
      default:
        console.log("Unknown postmessage method detected: " + event.data.method);
      return;

      // Special reply system with postMessage (as direct callback system not available on this platform)
      case "response":
        if(event.data.responsemethod)
        {
          switch(event.data.responsemethod)
          {
            default:
              console.log("Unknown postmessage responsemethod detected: " + event.data.responsemethod);
            return;
          }
        }
      break;

      case "version":
        gpcrypt.extension.version = event.data.version;
        gpcrypt.extension.detectedid = event.data.id;
        if(callback)
          callback({result: true, method: event.data.method, version: event.data.version});
      break;

      case "login":
        if(!validlogin())
          break;

        if(event.data.emailhash === pcrypt.sha256(pcrypt.getvalue('email')))
        {
          var redirecturl = pcrypt.getvalue('pcrypttimeouturl');

          if(redirecturl)
            window.location.replace(redirecturl);
        }
      break;

      case "setpass": // Way to add password in yellow condition
      if(!validlogin())
      {
        break;
      }
      
      if(event.data.email === pcrypt.getvalue('email'))
      {
          pcrypt.getdata(pcrypt.getvalue('session'), false, pcrypt.getvalue('keycrypt'), 'passwords', 0, function savepassgetcallback(data, error, id)
          {
            if(error)
	          {
	            handlepcrypterror(error, data);
	            return;
	          }

	          var passlist = data;

            if(!passlist || (passlist.length == 0))
                passlist = [];

	          var pass = event.data.pass;
	          var passindex = event.data.passindex; // index from the content script (but can sadly be different here if there has been made some changes)

            validatepass(pass);

            if(event.data.hasOwnProperty('passindex') && Number.isInteger(passindex))
            {
              var passold = passlist[passindex]

              if(passold.url == pass.url)
              {
                passold.upd = (new Date()).getTime();
                if(pass.user)
                  passold.user = pass.user;
                if(pass.pass)
                  passold.pass = pass.pass;
              }
              else
              {
                passlist.push(pass); // Add password to list
              }
            }
            else
            {
              passlist.push(pass); // Add password to list
            }

            pcrypt.setdata(pcrypt.getvalue('session'), pcrypt.getvalue('keycrypt'), 'passwords', passlist, true, 0, function savepasssetcallback(data, error, id)
            {
              if(error)
	            {
	              handlepcrypterror(error, data);
	              return;
	            }

              extsendmessage({target: 'background', sender: 'desktop', method: 'reloadpass'}, (response)=>
              {
                if(response)
                {
                  location.reload(); // Reload current page - can be made more elegant but not easy
                }
              });
            });
          });
        }
      break;

      case 'gottenautologin':
        let request = event.data;
        let autologinresponsekeys = false;
        let extensionResponseObject = false;
        
        if(request.data.autologinresponseobject)
        {
          extensionResponseObject = JSON.parse(request.data.autologinresponseobject);
          autologinresponsekeys = Object.keys(extensionResponseObject);

          if(request.data.topname)
          {
            pcrypt.settopname('encryptkey', request.data.topname);
          }
          
          if(request.data.privatekey)
          {
            pcrypt.setvalue('privatekey', JSON.parse(request.data.privatekey));
          }

          if(autologinresponsekeys.length>0)
          {
            for(let i = 0, i_len = autologinresponsekeys.length; i < i_len; i++)
            {
              let extResponseKey = autologinresponsekeys[i];
              pcrypt.setvalue(extResponseKey, extensionResponseObject[extResponseKey]);
            }
          }

          let timeoutselect = document.getElementById('login-form__timeout');
          let timeout = timeoutselect.options[timeoutselect.selectedIndex].value;

          localStorage.pcrypttimeout = timeout; // This is for the login screen

          if (timeout > 0)
          {
            pcrypt.setvalue('pcrypttimeout', timeout * 60000);
          }

          pcrypt.setvalue('pcrypttimeouturl', window.location.protocol + '//' + window.location.host + removefilefrompath(window.location.pathname) + '/index.html?page=logout');

          let defaulturl = window.location.protocol + '//' + window.location.host + removefilefrompath(window.location.pathname);
          // Try to see if extension use same credentials to activate yellow mode (only return valid result if installed)
          if(typeof chrome !== 'undefined')
          {
            chrome.runtime.sendMessage(gpcrypt.extension.detectedid, {
              sender: 'desktop',
              target: 'background',
              method: "login",
              email: pcrypt.getvalue('email')
            },
            function (response) 
            {
              if (response && response.result === true) // test if extension accept the credentials
              {
                let url = defaulturl + '/index.html?page=passwords';
                window.location.assign(url);
              }
            });
          }
          else
          {
            extsendmessage({
              sender: 'desktop',
              target: 'background',
              method: "login",
              email: pcrypt.getvalue('email')
            }, function(response)
            {
              if (response && response.result === true) // test if extension accept the credentials
              {
                let url = defaulturl + '/index.html?page=passwords';
                window.location.assign(url);
              }
            })
          }
        }
    break;

    }
  }
}

function extinstalllistener(callback)
{
  try
  {
    if(callback)
    {
      // Remove default handler if installed (see beginning of file)
      window.removeEventListener("message", receivePostMessage, false);

      // Use closure to use a callback function
      window.addEventListener("message", function (event)
      {
        receivePostMessage(event, callback);
      }, false);
    }
    else
    {
      window.addEventListener("message", receivePostMessage, false);
    }

    return true;
  }
  catch(err)
  {
    if(callback)
      callback(false);

    return false;
  }
}

function extsendmessage(data, callback)
{
  if(gpcrypt.extension.version)
  {
    if(typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage && gpcrypt.extension.detectedid)
    {
      // There is an extension that declared this page in externally_connectable
      chrome.runtime.sendMessage(gpcrypt.extension.detectedid, data, callback);
    }
    else
    {
      // Fall back method (maybe not be supported by browser)
      window.postMessage(data, window.location.href);

      // Just report true
      callback({result: true, system: 'postmessage'});
    }
  }
  else
  {
    callback(false);
  }
}

function addTeamAndShareByEmail(shares, newemails, callback)
{
  if(newemails.length == 0)
  {
      callback(null, shares, null);
      return false;
  }

  var emailarray = [];
  var teamidarray = [];
  var adminarray = [];
  var optionsarray = [];
  var userid = pcrypt.getvalue('userid'); // Current userid
  var useremail = pcrypt.getvalue('email'); // Current usermail

  for (var i = 0, len_i = newemails.length; i < len_i; ++i)
  {
    if(useremail == newemails[i].email) // Avoid adding yourself
      continue;

    emailarray.push(newemails[i].email);
    teamidarray.push(Number(newemails[i].teamid));
    adminarray.push(0); // Never admin this way
    optionsarray.push(0); // Always default options for team
  }

  var langcode = pcrypt.getvalue('languagecode', false) || 'en';

  // Add new users to newshares
  pcrypt_teamaddmember(pcrypt.getvalue('session'), teamidarray, emailarray, adminarray, optionsarray, langcode, 0, function addmemberfunc(data, error, id)
  {
    if(error)
    switch(error)
    {
      default:
        handlepcrypterror(error, data);
      return;
    }

    // We need to get the complete list as some fields may be picked up from the database (public key)
    pcrypt.getteammembers(pcrypt.getvalue('session'), true, 'pcryptteammembers', pcrypt.jsonstringify(data), function teammembersfunc(data, error, id)
    {
      if(error)
      switch(error)
      {
        default:
          handlepcrypterror(error, data);
        return;
      }

      var newmembers = pcrypt.jsonparse(id);

      for (var i = 0, len_i = newmembers.share.length; i < len_i; ++i)
      {
        if(userid == newmembers.share[i].userid) // Avoid adding yourself
          continue;

        if(!newmembers.share[i].userid) // Avoid adding users that it not in the system
          continue;

        if(!Array.isArray(shares[newmembers.share[i].userid]))
          shares[newmembers.share[i].userid] = [];

        shares[newmembers.share[i].userid].push(newmembers.share[i].teamid);
      }

      callback(data, shares, newmembers);
    });
  });
}

function setCaretPosition(elemId, caretPos)
{
    var elem = document.getElementById(elemId);

    if(elem != null)
    {
        if(elem.createTextRange)
        {
            var range = elem.createTextRange();
            range.move('character', caretPos);
            range.select();
        }
        else
        {
            if(elem.selectionStart)
            {
                elem.focus();
                elem.setSelectionRange(caretPos, caretPos);
            }
            else
            {
                elem.focus();
            }
        }
    }
}

function getPopoverContent(member) 
{
  var html = '<table class="no-background popover-table">';
	
  if(member.email)
  {
    let email = htmlspecialchars(strip_tags(member.email), ['ENT_QUOTES']);
	  html += '<tr><td class="paddingRight10"><strong>' + g.lang.default.PCDEFAULTEMAIL + '</strong></td><td class="txtLeft">' + email + '</td></tr>';
  }

  if(member.name)
  {
    let name = htmlspecialchars(strip_tags(member.name), ['ENT_QUOTES']);
    html += '<tr><td class="paddingRight10"><strong>' + g.lang.default.PCDEFAULTNAME + '</strong></td><td class="txtLeft">' + name + '</td></tr>';
  }
	
  if(member.department)
  {
    let department = htmlspecialchars(strip_tags(member.department), ['ENT_QUOTES']);
    html += '<tr><td class="paddingRight10"><strong>' + g.lang.default.PCDEFAULTDEPARTMENT + '</strong></td><td class="txtLeft">' + department + '</td></tr>';
  }

	html += '</table>';
	return html;
}

function setPremiumHeader()
{
  var opts = pcrypt.getvalue('options')
  // If user is premium OR if the createddate + 30 is above the current date, the user has free premium.
  if ($("#header_premium_bar")) 
  {
    if (opts && opts.globalpremium === true) 
    {
      document.querySelector('#header_premium_bar').classList.add('hidden');
    } 
    else 
    {
      let premium = pcrypt.getvalue('premium');
      let trialpremium = pcrypt.getvalue('trialpremium');
      if (premium > 0 && trialpremium < 1) 
      {
        $('#header_premium_bar').removeClass('noPremAnim');
        $("#header_premium_bar")[0].childNodes[1].children[2].innerHTML = g.lang.topmenu.PCTOPMENUPREMIUMTRUE;
      } 
      else if(trialpremium > 0 && premium > 0)
      {
        
        $('#header_premium_bar').removeClass('noPremAnim');
        $('#header_premium_bar')[0].childNodes[1].children[2].innerHTML = g.lang.topmenu.PCTOPMENUPREMIUMTRIAL;
      } 
      else 
      {
        $("#header_premium_bar").addClass('noPremAnim');
        $("#header_premium_bar")[0].childNodes[1].children[2].innerHTML = g.lang.topmenu.PCTOPMENUPREMIUMFALSE;
      }
    }
  }
}

function setOverlayFill(bool) {
	if (bool) {
		$('.ui-widget-overlay.ui-front').css('z-index', 800);
	}
	else {
		$('.ui-widget-overlay.ui-front').css('z-index', 100);
	}
}

function warningModal (event)
{  
  if(event && event.preventDefault)
  {
    event.stopPropagation();
    event.preventDefault();
  }
  modalalert(g.lang.default.PCPROGRAMLOADWARN, g.lang.default.PCPROGRAMTITLE);
}

// Start and stop the spinner from displaying when the worker has given call
pcrypt.workermessages(function actback(evt)
{ 
  switch(evt.data.method)
  {
    case 'spinner_response':
      if(evt.data.value)
      {
        // Start spinner
        if(document.querySelector('.spinner'))
        {
          // Start spinner
          if(document.querySelector('.spinner') !== null)
          {
            document.querySelector('.spinner').setAttribute('class', 'spinner active');
          }

          document.getElementById('icon_logout').href = "#";
          document.getElementById('icon_logout').addEventListener('click', warningModal, false);
          // Warn if attempting to close.
          window.onbeforeunload = function (event)
          { 
              event.preventDefault();
              event.returnValue = '';
          };
        }
      }
      else
      {
        // Stop and hide spinner
        if(document.querySelector('.spinner'))
        {
          if(document.querySelector('.spinner') !== null)
          {
            document.querySelector('.spinner').setAttribute('class', 'spinner hidden');
          }

          // Reset 
          document.getElementById('icon_logout').href = "./index.html?page=logout";
          document.getElementById('icon_logout').removeEventListener('click', warningModal, false);
          document.getElementById('icon_logout').onclick = null;
          // Warn when trying to close window/tab
          window.onbeforeunload = null;
        }
      }
    break;
  }
});

function setLangInHtmlTag(lang) 
{
	document.querySelector('html').setAttribute('lang', lang);
}

function modalPremiumRestriction()
{
  modalalert(g.lang.default.PCPREMIUMRESTRICTION, g.lang.default.PCPROGRAMTITLE, 
    function (result) 
    {
      if(result)
      {
        if(window.location.href.indexOf('account') < 0)
        {
          window.location.href = './index.html?page=account&toPrem=true'
        }
        else
        {
          $("#premium").click();
        }
      }
  });
}