document.addEventListener('DOMContentLoaded', function () 
{
  let settings = pcrypt.getvalue('options');

  if(settings && (settings.servicedeskinfo))
  {
    $('#header-nav__servicedesk').show();

    let dialogWindow = document.querySelector("#dialog-servicedesk");
    let serviceDeskButton = document.querySelector("#icon_help");

    dialogWindow.textContent += settings.servicedeskinfo;

    serviceDeskButton.addEventListener("click", function()
    {
        $("#dialog-servicedesk").dialog(
        {
            title: "Service desk",
            minWidth: "15rem",
            position: {
              my: "right top",
              at: "left bottom",
              of: $("#icon_help")
            },
            buttons:
            {
                "Luk": function()
                {
                    $(this).dialog("close");
                }
            }
        });
    });
  }
  else
  {
    $('#header-nav__servicedesk').hide();
  }  
  
});