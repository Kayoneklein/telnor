"use strict";

g.adminusers = [];

$(document).ready(function() 
{
    validlogin()

    var opts = pcrypt.getvalue('options');
    
    initdata();

    if(pcrypt.getvalue("options").isglobaladmin)
    {
      // showing menuitems
      $("#newmsgbutton").parents().show();
      $("#deletemsgbutton").parents().show();

      // click handlers for menuitems
      $('#newmsgbutton').click(function() 
      {
        updatemenu('users');
      });
    }


    $('ul.navigation li a').click(function() 
    {
      $('ul.navigation li a').removeClass('on');
      $(this).addClass('on');
      if ($(this).hasClass('open-log')) 
      {
        $('#menu-account-log').slideDown();
      } else 
      {
        $('#menu-account-log').slideUp();
      }
    });

    document.getElementById('check-globalmsg-counter').style.display = 'none';

    updatemenu();

    pcrypt_setlogreadadminmaildata(pcrypt.getvalue('session'), pcrypt.getvalue('userid'), function(data, error, id)
    {
      if(error)
      {
        handlepcrypterror(error, data);
        return;
      }

      pcrypt.setvalue('unreadadminmails', 0);
      
      if($('#check-globalmsg-counter').html() == "!")
      {
        $('#check-globalmsg-counter').html('')
        $('#check-globalmsg-counter').css('display', 'none');
      }
      
    });

    loader(false);
});

function searchLog() 
{
  tablesearch(document.getElementById('loggrid'), null, document.querySelector('#searchlog').value);
}

function buildmsgtable(result)
{
  var tableHeaderArray = [
    [g.lang.globalmsg.PCGLOBALMSGTOPICHEADER],
    [g.lang.admin.PCADMINMESSAGECREATEDHEADER],
    [g.lang.admin.PCADMINMESSAGESACTIONSHEADER]
  ];

  var htmlArraySticky = result.reduce(function(acc, data, i) 
  {
    g.msgcount = i;
    
    if(data.sticky == '1' && data.draft == '0')
    { // If sticky push to top of array.
      acc.push([
        "<span id='topic_" + i + "' msg_id='" + data.id + "' class='importantMSG'>" + htmlspecialchars(data.topic, ['ENT_QUOTES']) + "</span>",
        "<span id='created_" + i + "'>" + data.created +  "</span>",
        "<input id='show_" + i + "' name='' title='' type='button' class='icon_show'>",
      ]);
    }
    return acc;
    

  }, []);
  
  var htmlArrayNotSticky = result.reduce(function(acc, data, i)
  {
    if(data.sticky === "0" && data.draft == "0")
    {
      acc.push([
      "<span id='topic_" + i + "' msg_id='" + data.id + "'>" + htmlspecialchars(data.topic, ['ENT_QUOTES']) + "</span>",
      "<span id='created_" + i + "'>" + data.created + "</span>",
      "<input id='show_" + i + "' name='' title='' type='button' class='icon_show'>",
    ]);

    }
    return acc;
  }, []);

  htmlArraySticky = htmlArraySticky.concat(htmlArrayNotSticky);
  return [tableHeaderArray, htmlArraySticky];
}

function initdata() 
{
  var result;

  pcrypt_getadminmaildata(pcrypt.getvalue('session'), false, 0, function (data, error, id) 
  {
    
    if(error)
    {
      handlepcrypterror(error);
      return;
    }

    result = data;
    g.globalMessages = result; // Set globalMessages
    var table;

    if(validlogin())

    table = buildmsgtable(result);

    var tableHeaderArray = table[0];
    var htmlArray = table[1];

    document.getElementById('userslist').innerHTML = buildtable(
      tableHeaderArray,
      null,
      htmlArray,
      'globalmsggrid',
      'globalmsg table-bordered table-max-width table-white table-nice'
    );

    //show msg onclick
    for(var i = 0; i <= result.length; i++)
    {
      var showBtn = document.getElementById("show_"+i);

      if(showBtn)
      {
        showBtn.addEventListener("click", function(event)
        {
          var id = event.target.id.replace("show_", "");
          id = Number(id);
          var topic = g.globalMessages[id].topic;
          var content = g.globalMessages[id].content;
          var created = g.globalMessages[id].created;
          document.getElementById('viewmsgmodal_topic').textContent = topic;
          document.getElementById('viewmsgmodal_msg').textContent = content;
          modaldiv('#viewmsgmodal', 500, htmlspecialchars(created, ['ENT_QUOTES']), null, true, null, function(){})
        });
      }
    }
  });
};

function updatemenu(page) 
{
  if (!validlogin()) 
  {
    modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
    return;
  }
}

function editmsg(sticky, topic, content, isDraft, msg_id) 
{

  if(pcrypt.getvalue('options').isglobaladmin !== true)
  {
    return;
  }

  function returnisok(val)
  {
    if(val)
    {
      var topicElement = document.getElementById("editmsgmodal_topic");
      var contentElement = document.getElementById("editmsgmodal_msg");
      var stickyElement = document.getElementById("editmsgmodal_sticky");
      var draftElement = document.getElementById("editmsgmodal_public");

      var data = {
        newTopic:topicElement.value, 
        newContent:contentElement.value, 
        newSticky:stickyElement.checked, 
        newPublic:draftElement.checked, 
        id:msg_id 
      };

      pcrypt_editglobalmsg(pcrypt.getvalue('session'), data, 0, function(data, error, id) {});	
    }
  }

  
  modaldiv('#editmsgmodal', 500, "Rediger besked", null, null, null, returnisok);

  // set the old values to be in the modal.
  document.getElementById("editmsgmodal_topic").innerHTML = htmlspecialchars(topic, ['ENT_QUOTES']);
  document.getElementById("editmsgmodal_msg").innerHTML = htmlspecialchars(content, ['ENT_QUOTES']);
  document.getElementById("editmsgmodal_sticky").checked = parseInt(sticky);
  document.getElementById("editmsgmodal_public").checked = parseInt(isDraft);
};

function deleteMSG(id)
{

  if(pcrypt.getvalue('options').isglobaladmin !== true)
  {
    return;
  }

  pcrypt_deleteglobalmsg(pcrypt.getvalue('session'), 
  {
    created:g.globalMessages[id].created, 
    topic:g.globalMessages[id].topic, 
    content:g.globalMessages[id].content, 
    sticky:g.globalMessages[id].sticky
  }, 0, function(data, error, id){});	
}