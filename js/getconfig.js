document.addEventListener('DOMContentLoaded', function () 
{
    applyGlobalSettings(pcrypt.getvalue('options'));
})

function applyGlobalSettings(settings) 
{
    //console.log(settings)
    var ignoreSettings = 
    [
        // If a setting doesn't need to be applied
        // to the HTML element, add its name here
    ]
    
    if(settings)
    {
        var htmlElement = document.documentElement;    

        for (var setting in settings) 
        {
            htmlElement.dataset[setting] = settings[setting];
        }

        if (settings.servicedeskinfo) 
        {
            var dialogWindow = document.querySelector("#dialog-servicedesk");
            dialogWindow.textContent += settings.servicedeskinfo;
        }
    }
}