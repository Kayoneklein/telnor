var footerHeight = 94;
g.srpclient = null;

pcrypt_getsystemconfig(null, function(pcryptconfig)
{
  if(pcryptconfig.globalpremium == true)
  {
    //window.location.href = "https://beast.dk/passdev_ibay";
    window.location.href = "https://pcrypt.org";
  }
  else
  {
    $(document).ready(function ()
    {
      document.getElementById('RECEIPT').innerHTML = g.lang.html.RECEIPT;
      loader(false);
      setTimeout(function()
      {
        //window.opener.location.reload();
        try
        {
          window.opener.setPremium(false, false);
        }
        catch (err)
        {
          console.error(err.description || err);
        }

        setTimeout(function()
        {
          localStorage.setItem('pc_refresh_account', 1);
          //window.opener.location.reload(true);
          window.close();
        }, 4000);
      }, 3000);
    });
  }
});
