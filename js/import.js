"use strict";

var pcimport = {};
pcimport.formats = null;
pcimport.importtestfunc = null;
pcimport.importfunc = null;

pcimport.init = function (format, testcallback, importcallback) {
  //debugger;

  pcimport.importtestfunc = testcallback;
  pcimport.importfunc = importcallback;

  document.getElementById('import-textarea').value = ""; // clear possible old values
  pcimport.changeToImportPage(1); // Just to be on the safe side

  document.getElementById('import_selectedimportsetting').onchange = function (event) 
  {
    //if($(this)[0].sumo)
    //  $(this)[0].sumo.reload();

    var selsetting = document.getElementById('import_selectedimportsetting');

    pcimport.setimportvalues(pcimport.formats[selsetting.options[selsetting.selectedIndex].value]);
  };

  document.getElementById('import_deletebutton').onclick = function (event) {
    pcimport.listboxdel('import_importcolumns')
  };

  document.getElementById('import_insertbutton').onclick = function (event) {
    pcimport.listboxins('import_importcolumns');
  };

  document.getElementById('import_upbutton').onclick = function (event) {
    pcimport.listboxmove('import_importcolumns', 'up');
  };

  document.getElementById('import_downbutton').onclick = function (event) {
    pcimport.listboxmove('import_importcolumns', 'down');
  };

  document.getElementById('importfile').addEventListener('change', pcimport.handleFileSelect, false);

  pcimport.setimportnames(format);
}

pcimport.listboxdel = function (listid) {
  var listbox = document.getElementById(listid);
  var selIndex = listbox.selectedIndex;

  if (-1 == selIndex) {
    modalalert(g.lang.importjs.PCIMPORTSELECTCOLUMNFIRST, g.lang.default.PCPROGRAMTITLE);
    return;
  }

  listbox.remove(selIndex);
}

pcimport.listboxins = function (listid) 
{
  let listboxformats = document.getElementById('import_selectedimportsetting');
  let listbox = document.getElementById(listid);
  let missinglist = [];
  let importformat = listboxformats.options[listboxformats.selectedIndex].value;

  if(importformat && pcimport.formats[importformat] && pcimport.formats[importformat].fields)
  {
    missinglist = pcimport.formats[importformat].fields.slice();

    // Get current shown options values
    for (var i = 0, i_len = listbox.options.length; i < i_len; i++) 
    {
      let item = listbox.options[i].value;

      if (item.length) 
      {
        for (var j = missinglist.length - 1; j >= 0; j--) 
        {
          if (item == missinglist[j].value) 
          {
            missinglist.remove(j);
          }
        }
      }
    }
  }

  // Build up the missing values
  var html = "<br><div class='select-container txtCenter'><select class='select-css' style='width: 200px;' name='fieldtype' id='fieldtype'>";

  html += "<OPTION value=''>" + g.lang.importjs.PCIMPORTFIELDIGNORE + "</OPTION>";

  for (var i = 0, i_len = missinglist.length; i < i_len; i++) {
    html += "<option value='" + missinglist[i].value + "'>" + missinglist[i].text + "</option>";
  }

  html += "</select></div>";

  modalhtml(html, 250, g.lang.import.PCIMPORTINSCOLUMN, true, false, function (form) {
    if (form === false)
      return;

    var op = new Option(form.fieldtype.text, form.fieldtype.value, true, true);

    if (!form.fieldtype.length)
      op.style.backgroundColor = "#d8d8d8";

    listbox.options[listbox.options.length] = op;

  });
}

pcimport.listboxmove = function (listid, direction) {

  var listbox = document.getElementById(listid);
  var selIndex = listbox.selectedIndex;

  if (-1 == selIndex) {
    modalalert(g.lang.importjs.PCIMPORTSELECTCOLUMNFIRST, g.lang.default.PCPROGRAMTITLE);
    return;
  }

  var increment = -1;
  if (direction == 'up')
    increment = -1;
  else
    increment = 1;

  if ((selIndex + increment) < 0 || (selIndex + increment) > (listbox.options.length - 1)) {
    return;
  }

  var selValue = listbox.options[selIndex].value;
  var selText = listbox.options[selIndex].text;
  var selColor = listbox.options[selIndex].style.backgroundColor;

  listbox.options[selIndex].value = listbox.options[selIndex + increment].value
  listbox.options[selIndex].text = listbox.options[selIndex + increment].text
  listbox.options[selIndex].style.backgroundColor = listbox.options[selIndex + increment].style.backgroundColor;

  listbox.options[selIndex + increment].value = selValue;
  listbox.options[selIndex + increment].text = selText;
  listbox.options[selIndex + increment].style.backgroundColor = selColor;

  listbox.selectedIndex = selIndex + increment;
}

pcimport.setimportnames = function (format, force, selectedindex) 
{
  if ((pcimport.formats === format) && !force)
    return;

  pcimport.formats = format;

  var listbox = document.getElementById('import_selectedimportsetting');
  var op;

  for (var entry in pcimport.formats) 
  {
    op = new Option(pcimport.formats[entry].name, entry, false, false);
    listbox.options[listbox.options.length] = op;
  }

  if (selectedindex)
    listbox.selectedIndex = selectedindex;

  // Stupid hack
  pcimport.formats[listbox.options[listbox.selectedIndex].value].index = listbox.options[listbox.selectedIndex].value;

  pcimport.setimportvalues(pcimport.formats[listbox.options[listbox.selectedIndex].value]);
}

pcimport.setimportvalues = function (entry) {
  var listbox = document.getElementById('import_selectedimportsetting');
  var listboxcolumns = document.getElementById('import_importcolumns');
  var seltype = document.getElementById('import_selectedimporttype');
  var firstlinetitle = document.getElementById('import_firstlinetitle');
  var newlinechar = document.getElementById('import_newlinechar');
  var op;

  listboxcolumns.options.length = 0;

  for (var i = 0, i_len = entry.fields.length; i < i_len; i++) {
    op = new Option(entry.fields[i].text, entry.fields[i].value, false, false);
    if (entry.fields[i].value.length == 0)
      op.style.backgroundColor = "#d8d8d8";
    listboxcolumns.options[listboxcolumns.options.length] = op;
  }

  firstlinetitle.checked = entry.titleline;
  newlinechar.checked = entry.newlinechar;
  setOption(seltype, entry.type);
  setOption(listbox, entry.index);
}

pcimport.getimportvalues = function () {
  var listbox = document.getElementById('import_selectedimportsetting');
  var listboxcolumns = document.getElementById('import_importcolumns');
  var seltype = document.getElementById('import_selectedimporttype');
  var firstlinetitle = document.getElementById('import_firstlinetitle');
  var newlinechar = document.getElementById('import_newlinechar');

  var columns = [];

  for (var i = 0, i_len = listboxcolumns.options.length; i < i_len; i++)
    columns.push({
      text: listboxcolumns.options[i].text,
      value: listboxcolumns.options[i].value
    });

  var returnobj = {
    index: listbox.options[listbox.selectedIndex].value,
    type: seltype.options[seltype.selectedIndex].value,
    titleline: firstlinetitle.checked,
    newlinechar: newlinechar.checked,
    fields: columns
  };

  return returnobj;
}

pcimport.show = function (div, width, title, returnisok, hidecancel, onopen, callback) {
  var idnum = Date.now().toString();
  var mybuttons;
  var bAccepts = false;

  loader(false);

  mybuttons = [
    {
      id: "btnModalUploadImportFile" + idnum,
      class: "upload-import-file",
      text: $.alerts.importButton,
      click: function () {
        $('.import-file').click();
        //alert('allright');
      }
    },
    {
      id: "btnModalDivOK" + idnum,
      class: 'floatRight import-next-button',
      text: $.alerts.nextButton,
      click: function ()
      {
        var importtext = document.getElementById('import-textarea').value;

        if ($('#import-page-2').is(':visible'))
        {
          if (pcimport.importfunc(pcimport.getimportvalues(), importtext) === true)
          {
            okreply();
          }
        }
        else
        {
          var html = pcimport.importtestfunc(pcimport.getimportvalues(), importtext);
          if (html)
          {
            $('#import-page-2').html(html);
            pcimport.changeToImportPage(2);
          }
        }
      }
    },
    {
      id: "btnModalDivCancel" + idnum,
      class: 'floatRight import-cancel-button',
      text: $.alerts.cancelButton,
      click: function () {
        if ($('#import-page-1').is(':visible'))
        {
          cancelreply();
        }
        else
        {
          pcimport.changeToImportPage(1);
        }
      }
    }
  ];


  if (returnisok)
  {
    $(div).keypress(function (e)
    {
      if (e.keyCode == $.ui.keyCode.ENTER) {
        $("#btnModalDivOK" + idnum).click();
        return false;
      }
    });
  }

  function okreply() {
    if (callback) {
      bAccepts = true;
      if (callback(true) !== true) {
        $(div).dialog("close");
      }
    } else {
      bAccepts = true;
      $(div).dialog("close");
    }
  }

  function cancelreply() {
    bAccepts = false;
    $(div).dialog("close");
    if (callback)
      callback(false);
  }

  $(div).dialog({
    modal: true,
    width: width,
    title: title,
    show: "blind",
    hide: "blind",
    resizable: false,
    closeOnEscape: true,
    open: function (event, ui) {
      if (typeof onopen == "function") {
        onopen();
      }
    },
    close: function (event, ui) {
      if (!bAccepts) {
        cancelreply();
      }
    },
    buttons: mybuttons,
    dialogClass: "importDialog"
  });
}

pcimport.handleFileSelect = function (evt) {
  var files = evt.target.files; // FileList object

  for (var i = 0, f; f = files[i]; i++) {
    // Only process text files.
    if (!f.type.match('text.*')) {
      modalalert(g.lang.importjs.PCIMPORTNOTEXT, g.lang.default.PCPROGRAMTITLE);
      continue;
    }

    if (f.size > gpcrypt.filesizemax) {
      modalalert(g.lang.importjs.PCIMPORTTOOBIG + ' ' + gpcrypt.filesizemax, g.lang.default.PCPROGRAMTITLE);
      continue;
    }

    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = (function (theFile) {
      return function (e) {
        document.getElementById('import-textarea').value = e.target.result;
        $('#menu-passwords-import a.canchange').removeClass('deactivated');
      };
    })(f);

    // Read in the file as text data.
    reader.readAsText(f);
  }

  $(evt.target).prop("value", "");
}

pcimport.changeToImportPage = function (page) {
  // Height of page 2 must always be as page 1
  //console.log($('#import-page-1').height());
  $('#import-page-2').css('height', $('#import-page-1').height());

  var hidePage = (page == 2) ? 1 : 2;
  $('#import-page-' + hidePage).hide();
  $('#import-page-' + page).show();

  if (page > 1) {
    $('.upload-import-file').hide();
    $('.import-next-button').html(g.lang.import.PCIMPORTBUTTON);
    $('.import-cancel-button').html(g.lang.default.PCBUTTONPREVIOUS);
  } else {
    $('.upload-import-file').show();
    $('.import-next-button').html(g.lang.default.PCBUTTONNEXT);
    $('.import-cancel-button').html(g.lang.default.PCBUTTONCANCEL);
  }
}

//# sourceURL=import.js
