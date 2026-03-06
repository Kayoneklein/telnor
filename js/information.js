var footerHeight = 94;
g.srpclient = null;

  
$(document).ready( function ()
{

  var options = pcrypt.getvalue('options');
  
  if(options && options.disableinfopage)
  {
    window.location.replace(window.location.protocol + '//' + window.location.host + removefilefrompath(window.location.pathname) + '/index.html');
  }

  document.getElementById('INTRO').innerHTML = g.lang.html.INTRO;
  loader(false);
});
  
