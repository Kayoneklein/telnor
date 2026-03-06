var footerHeight = 94;
g.srpclient = null;

let pcryptconfig = pcrypt.getvalue('options');

if(pcryptconfig && pcryptconfig.disableprivacy)
{
  window.location.replace(window.location.protocol + '//' + window.location.host + removefilefrompath(window.location.pathname) + '/index.html');
}
else
{
  $(document).ready( function ()
  {
    document.getElementById('PRIVACY').innerHTML = g.lang.html.PRIVACY;
    loader(false);
  });
}

