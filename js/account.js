'use strict';

g.qrcode = null;
g.logshow = null;
g.backupdata = [];
g.countrylist = null;
g.openedwindow = null;
g.paymentWindow = '{"paymentWindow":"1"}';
g.showConfirmButton = false;

var checkRefreshInterval = null;

if(redirectinvalidlogin())
{
  var opts = pcrypt.getvalue('options');
  var twoFaUrlParam = JSON.parse(getUrlParameter('to2fa'));
  if (opts && opts.force2fa === true && twoFaUrlParam === false && pcrypt.getvalue('totpsecurity') === false) 
  {
    $('.top-menu').hide();
    window.location.replace('./index.html?page=account&to2fa=true');
  }

  $(document).ready(function ()
  {
    var opts = pcrypt.getvalue('options');
    if (opts && opts.globalpremium)
    {
      document.querySelector('#premium-list-item').classList.add('hidden');
    }

    if(opts.disableuserdelete === false)
    {
      $("#delete").parents().show();
    }

    if(opts.allowextension2fanegation)
    {
      $('#extension2fa').parents().show();
    }

    $("#updateinfo").parents().show();
    $("#updateid").parents().show();
    $("#updatekey").parents().show();
    $("#language").parents().show();
    $("#totpsecurity").parents().show();
    $("#browsersecurity").parents().show();
    $("#sessionsecurity").parents().show();
    $("#restore").parents().show();
    $("#premium").parents().show();
    $("#log").parents().show();


    //$("#menuaccount").attr('class', 'topmenustylecurrent');
    /*getlanguage(getUrlParameter('language'), function(language)
    {
      if(!language)
      {
      alert('Unable to load language text.');
      return;
      }

      g.lang = language;
      setdomlanguage(g.lang, 'account');
    });*/

    $('.container-hidden').show();

    $('ul.navigation li a').click(function ()
    {
      $('ul.navigation li a').removeClass('on');
      $(this).addClass('on');
      if ($(this).hasClass('open-log'))
      {
        $('#menu-account-log').slideDown();
      }
      else
      {
        $('#menu-account-log').slideUp();
      }
    });

    pcrypt_securitystatus(pcrypt.getvalue('session'), 0, function securitystatusfunc (data, error, id)
    {
      if (error)
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

      pcrypt.setvalue('totpsecurity', data.totp);
      pcrypt.setvalue('notificationsecurity', data.notification);
      pcrypt.setvalue('sessionsecurity', data.iplock);

      setdomlanguage(g.lang, 'premium', false);
      setdomlanguage(g.lang, 'premiumjs', false);
    });

    g.qrcode = new QRCode(
      document.getElementById('divtotpsecurityqr'),
      {
        width: 100,
        height: 100
      }
    );

    $("#divdefault").show();

    $('ul.navigation li a').click(function (e)
    {
      var id_ = $(this).attr('id');
      $('ul.navigation li a').removeClass('on');
      $('#' + id_).addClass('on');
    });

















    /***************** PREMIUM *****************/
    var premium = false; // Starting point of premium
    var paymentType = 'email'; // Starting window of paymenttype (email or domain)
    var newUsers = {}; // Vars in premium
    var payers = {}; // Other payers
    var existingUsers = {};
    var updatedUsers = {};
    var prices = {};
    var months = {};
    var companyExists = false;
    var companyPayID = 0;
    var premiumRepayDate = null;
    var premiumLastPayDate = null;
    var premiumType = 'month';
    var paying = false;
    var giftcardUsed = false;

    // Set callbacks
    $('#accepturl').val(pcrypt.urldomain + pcrypt.urlpath + 'index.html?page=receipt');
    $('#callbackurl').val(pcrypt.urldomain + pcrypt.urlpath + 'lib/premium/paymentcallbackurl.php');

    /**
     * Starting point to check for premium and existing users
     */
    function getPremium()
    {
      if(pcrypt.getvalue('options').globalpremium === true)
      {
        return;
      }

      newUsers = {};
      existingUsers = {};
      updatedUsers = {};
      payers = {};
      premium = false;
      companyExists = false;
      companyPayID = 0;
      premiumLastPayDate = null;
      premiumRepayDate = null;

      loader(1);

      jspremium.get(pcrypt.getvalue('authsession'), 0, function (data, error, id)
      {
        //console.log(data);
        if(error)
        {
          handlepcrypterror(error, data);
          return;
        }

        // Set merchantid
        $('#merchant-number').val(data.merchantid);

        var unixTime = data.time;
        $('#hidden-time').val(unixTime);
        var _prices = data.prices;
        var _repaydate = null;
        var _payValid = false;
        var _newUsersCounter = 0;

        // Set prices in frontend
        for (var i = 0; i < _prices.length; i++)
        {
          prices[_prices[i].tag] = _prices[i].price;
          months[_prices[i].tag] = _prices[i].month;

          $('.price-snippet-' + _prices[i].tag).html('(€' + (parseInt(_prices[i].price, 10) / 100) + ' ' + g.lang.premiumjs.PCPREMIUMJSPERUSER + ')');
        }
        $('.prices-month').html(prices.month);
        $('.prices-year').html(prices.year);
        var _nicePriceMonth = (parseInt(prices.month, 10) / 100);
        var _nicePriceYear = (parseInt(prices.year, 10) / 100);
        $('.nice-price-month').html(_nicePriceMonth);
        $('.nice-price-year').html(_nicePriceYear);

        var payinfos = data.payinfo;
        var payurls = data.payurl;

        // Loop payinfos
        for (let k = 0; k < payinfos.length; k++)
        {
          var payinfo = payinfos[k];
          var payinfoId = payinfo.id;
          var payvalid = payinfo.payvalid;
          var repaydate = payinfo.repaydate;

          // Populate master data table
          var payinfoRows = 
          [
            {label: ((payinfo.company !== '') ? g.lang.premium.PCPREMIUMCOMPANYNAME : ''), value: ((payinfo.company !== '') ? htmlspecialchars(payinfo.company, ['ENT_QUOTES']) : '')},
            {label: g.lang.premium.PCPREMIUMCONTACTPERSON, value: htmlspecialchars(payinfo.contactperson, ['ENT_QUOTES'])},
            {label: g.lang.premium.PCPREMIUMADDRESS, value: htmlspecialchars(payinfo.street, ['ENT_QUOTES'])},
            {label: g.lang.premium.PCPREMIUMZIPCODE, value: htmlspecialchars(payinfo.zip, ['ENT_QUOTES'])},
            {label: g.lang.premium.PCPREMIUMCITY, value: htmlspecialchars(payinfo.city, ['ENT_QUOTES'])},
          ];

          if (payinfo.state !== '') 
          {
            payinfoRows.push({ label: g.lang.premium.PCPREMIUMSTATE, value: htmlspecialchars(payinfo.state, ['ENT_QUOTES'])});
          }
          payinfoRows.push({ label: g.lang.premium.PCPREMIUMCOUNTRY, value: htmlspecialchars(payinfo.country, ['ENT_QUOTES'])});
          payinfoRows.push({ label: g.lang.premiumjs.PCPREMIUMTELEPHONEEXT, value: htmlspecialchars(payinfo.phone, ['ENT_QUOTES'])});
          payinfoRows.push({ label: g.lang.premium.PCPREMIUMEMAIL, value: htmlspecialchars(payinfo.email, ['ENT_QUOTES'])});
          payinfoRows.push({ label: '', value: '' });
          if (payinfo.vat !== '') 
          {
            payinfoRows.push({ label: g.lang.premium.PCPREMIUMCOMPANYVATNUMBER, value: htmlspecialchars(payinfo.vat, ['ENT_QUOTES'])});
          }

          // Credit cards frontend
          let ccHTML = '';
          if (payinfo.cardnumber != null && payinfo.cardnumber !== '')
          {
            let cardExpMonth = parseInt(payinfo.cardexpmonth);
            let cardExpYear = parseInt(payinfo.cardexpyear);
            let cardExpired = true;
            let currentYear = moment().year();
            let currentMonth = (moment().month()) + 1;
            if (cardExpYear > currentYear)
            {
              cardExpired = false;
            }
            else
            {
              if (cardExpYear === currentYear)
              {
                if (cardExpMonth > currentMonth)
                {
                  cardExpired = false;
                }
              }
            }

            ccHTML += '<br><span class="simple-headline">' + g.lang.premium.PCPREMIUMCREDITCARDS + '</span><br><div class="' + ((cardExpired) ? 'card-expired' : 'card-not-expired') + '">';
            let ccFirstNumber = parseInt(payinfo.cardnumber.substr(0, 1));
            ccHTML += '<span class="cc-card-icon cc-card-icon-' + ccFirstNumber + '"></span> <span class="cc-card-number">' + payinfo.cardnumber + '</span>';
            ccHTML += '</div>';
          }

          // Append HTML
          var tmp1 = '<tr><td>' + builddivhtml(payinfoRows) + '</td><td class="vmid"><a href="#" class="edit-address">' + g.lang.premiumjs.PCPREMIUMJSEDIT.toLowerCase() + '</a></td></tr>';
          tmp1 += '<tr><td>' + ccHTML + '</td><td class="vbottom pb-1"><a href="#" class="edit-creditcard">' + g.lang.premiumjs.PCPREMIUMJSUPDATECARD.toLowerCase() + '</a></td></tr>';
          $('#tbody-billing-masterdata').html(tmp1);

          $('.edit-address').on('click', function()
          {
            $('#premium-edit-name').val(payinfo.company);
            $('#premium-edit-contactperson').val(payinfo.contactperson);
            $('#premium-edit-address').val(payinfo.street);
            $('#premium-edit-zip').val(payinfo.zip);
            $('#premium-edit-city').val(payinfo.city);
            $('#premium-edit-state').val(payinfo.state);
            $('#premium-edit-country').val(payinfo.country);
            $('#premium-edit-phone').val(payinfo.phone);
            $('#premium-edit-email').val(payinfo.email);
            $('#premium-edit-vat').val(payinfo.vat);
            modaldiv('#dialog-premium-address', 725, g.lang.premiumjs.PCPREMIUMEDITADDRESS, false, false, function () { }, function (result)
            {
              if ( result )
              {
                var premiumpayInfo =
                {
                  company: $('#premium-edit-name').val(),
                  contactperson: $('#premium-edit-contactperson').val(),
                  street: $('#premium-edit-address').val(),
                  zip: $('#premium-edit-zip').val(),
                  city: $('#premium-edit-city').val(),
                  state: $('#premium-edit-state').val(),
                  country: $('#premium-edit-country').val(),
                  email: $('#premium-edit-email').val(),
                  phone: $('#premium-edit-phone').val(),
                  vat: $('#premium-edit-vat').val()
                };

                // Validate fields.
                if (premiumpayInfo.contactperson == '' ||
                    premiumpayInfo.street == '' ||
                    premiumpayInfo.zip == '' ||
                    premiumpayInfo.city == '' ||
                    premiumpayInfo.country == '' ||
                    premiumpayInfo.email == '') {

                  setTimeout(function()
                  {
                    modalalert(g.lang.premiumjs.PCPREMIUMJSFILLOUTFIELDS, g.lang.premiumjs.PCACCOUNTREQUIRED, function() {
                      $('a.edit-address').click();
                    });
                  },50);


                }
                else {

                  jspremium.editpay( pcrypt.getvalue( 'authsession' ), payinfoId, premiumpayInfo, 0, function ( data, error, id ) {
                    if ( error == null && data == true ) {
                      modalalert( g.lang.premiumjs.PCPREMIUMBILLINGINFOSAVED, g.lang.default.PCPROGRAMTITLE, function () {
                        window.location.reload();
                      } );
                    }
                  } );
                }
              }
            });
          });

          // Loop payurls
          for (let l = 0; l < payurls.length; l++)
          {
            var payurl = payurls[l];

            // Right now only one payinfo per user
            if (payurl.payid == payinfoId)
            {
              // Check if it's existing users and new users
              if (parseInt(payurl.urlnumber, 10) > 0 && payurl.urlchange == null)
              {
                existingUsers[l] = payurl;
              }
              else
              {
                newUsers[_newUsersCounter] = {
                  qty: parseInt(payurl.urlchange, 10),
                  oldqty: parseInt(payurl.urlnumber, 10),
                  title: payurl.url,
                  oldtitle: payurl.url,
                  id: payurl.id,
                  new: 0
                };
                _newUsersCounter++;
              }

              _payValid = payvalid;
              _repaydate = repaydate;
              premiumRepayDate = repaydate;
              premiumLastPayDate = payinfo.lastpaydate;
              companyPayID = payinfoId;
              if (_repaydate)
              {
                var _drepay = moment(_repaydate, 'YYYY-MM-DD HH:mm:ss');
                var _dtoday = moment();
                if (_dtoday.isBefore(_drepay)) {
                  premium = true;
                }
              }
              companyExists = true;
            }
          }
        }

        //console.log(data);

        // Show in frontend that other payers are paying for you.
        if (Object.keys(payinfos).length === 0)
        {
          payers = data.payers;
          if (Object.keys(payers).length > 0)
          {
            showOtherPayers(payers);
          }
        }

        if (premiumLastPayDate)
        {
          var repayMoment = moment(premiumRepayDate, 'YYYY-MM-DD HH:mm:ss');
          var lastPayMoment = moment(premiumLastPayDate, 'YYYY-MM-DD HH:mm:ss');
          if (repayMoment.diff(lastPayMoment, 'months') > 1)
          {
            premiumType = 'year';
          }
        }

        showPremiumUrls(_repaydate, _payValid);
        if (companyExists)
        {
          hideRegisterCompanyForm();
          premiumCalculatePrice();
        }
        checkPremium();
        loader(0);
      });
    }

    // Check if premium is activated, and show correct buttons and text
    function checkPremium()
    {
      if(pcrypt.getvalue('options').globalpremium === true)
      {
        return;
      }

      if (premium)
      {
        $('#has-premium').html(g.lang.premiumjs.PCPREMIUMJSACTIVATED);
        activatePremiumText(g.lang.premiumjs.PCPREMIUMJSADDUSER);
        $('#PCACCOUNTPREMIUMTEXT').hide();
      }
      else
      {
        $('#has-premium').html(g.lang.premiumjs.PCPREMIUMJSDEACTIVATED);
        activatePremiumText(g.lang.premiumjs.PCPREMIUMJSACTIVATE);
        if (Object.keys(newUsers).length > 0) {
          activatePremiumText(g.lang.premiumjs.PCPREMIUMJSADDUSER);
        }
      }
    }

    function setModalPrice(_amount) {
      var _nicePriceMonth = ((parseInt(prices.month, 10) * _amount) / 100);
      var _nicePriceYear = ((parseInt(prices.year, 10) * _amount) / 100);
      $('.dialog-pricing-list .nice-price-month').html(_nicePriceMonth);
      $('.dialog-pricing-list .nice-price-year').html(_nicePriceYear);
    }

    function hideRegisterCompanyForm()
    {
      $('#address-info').hide();
    }

    function showOtherPayers(tmppayers) {
      $('#payers-box').show();
      $('#PCACCOUNTPREMIUMTEXT').hide();
      Object.keys(tmppayers).forEach(function (key)
        {
          var obj = tmppayers[key];
          $('#tbody-payers').append('<tr class=""><td>' + htmlspecialchars(obj.company, ['ENT_QUOTES']) + '</td><td>' + htmlspecialchars(obj.contactperson, ['ENT_QUOTES']) + '</td><td>' + htmlspecialchars(obj.email, ['ENT_QUOTES']) + '</td></tr>');
        });

    }

    function showPremiumUrls (validUntil, payValid)
    {
      if (validUntil != null)
      {
        $('#premium-period-valid-until').html(validUntil.substr(0,10));
        $('#premium-period-valid-until').addClass(((payValid) ? 'valid-premium': 'expired-premium'));
      }
      var showPricingList = true;

      $('#tbody-premium-users').html('');
      if (typeof existingUsers != "undefined" && existingUsers != null && Object.keys(existingUsers).length != 0)
      {
        Object.keys(existingUsers).forEach(function (key)
        {
          var obj = existingUsers[key];

          var _options = '';
          _options += '<a class="edit-subscription" data-type="old" data-id="' + obj.id + '" href="#' + obj.id + '">' + g.lang.premiumjs.PCPREMIUMJSEDIT + '</a>';
          _options += '<a href="#' + obj.id + '" data-id="' + obj.id + '" class="remove-payurl" data-new="0" data-oldqty="' + htmlspecialchars(obj.urlnumber, ['ENT_QUOTES']) + '">' + g.lang.premiumjs.PCPREMIUMJSREMOVE + '</a>';

          $('#tbody-premium-users').append('<tr class="parent-url parent-url-' + obj.id + '" data-id="' + obj.id + '" data-payid="' + obj.payid + '"><td class="the-url" data-tmpurl="' + htmlspecialchars(obj.url, ['ENT_QUOTES']) + '" data-url="' + htmlspecialchars(obj.url, ['ENT_QUOTES']) + '">' + htmlspecialchars(obj.url, ['ENT_QUOTES']) + '</td><td class="the-url-number" data-tmpqty="' + htmlspecialchars(obj.urlnumber, ['ENT_QUOTES']) + '" data-qty="' + htmlspecialchars(obj.urlnumber, ['ENT_QUOTES']) + '">' + htmlspecialchars(obj.urlnumber, ['ENT_QUOTES']) + '</td><td class="txtRight"><span class="cancel-text">' + _options + '</span></td></tr>');
        });

        $('#subscriptions-wrapper').show();
        $('#premium-tabs').show();
        $('#table-premium-users').show();
        $('.premium-tabs').show();
        $('#premium-period-wrapper').show();
        $('.pricing-list').hide();
        showPricingList = false;

        // If user is not premium, and we have some existing users, then show Confirm button and price list
        if (!premium)
        {
          g.showConfirmButton = true;
          $('#total-payment-info').show();
        }
      }

      if (typeof newUsers != "undefined" && newUsers != null)
      {
        if (Object.keys(newUsers).length > 0)
        {

          $('#tbody-premium-users tr.new-user').remove();

          Object.keys(newUsers).forEach(function (key)
          {
            var obj = newUsers[key];
            var tmpQty = obj.qty;
            var tmpTitle = htmlspecialchars(obj.title, ['ENT_QUOTES']);
            if (obj.qty != obj.oldqty && obj.oldqty > 0)
            {
              tmpQty = obj.oldqty + ' -> ' + obj.qty;
              if (obj.qty > obj.oldqty) {
                g.showConfirmButton = true;
              }
            }
            if (obj.title != obj.oldtitle) {
              tmpTitle = htmlspecialchars(obj.oldtitle, ['ENT_QUOTES']) + ' -> ' + htmlspecialchars(obj.title, ['ENT_QUOTES']);
            }
            if (obj.qty != obj.oldqty && obj.oldqty > 0 && obj.qty < obj.oldqty)
            {
              tmpTitle += ' ' + g.lang.premiumjs.PCPREMIUMJSCHANGEDATNEXTPAYMENT;
            }

            // If payment was cancelled user is left in the system unpaid, show pay button then.
            if (obj.new == 0 && obj.qty > 0 && obj.oldqty == 0) {
              g.showConfirmButton = true;
            }

            // If user is not premium, and we have some existing users, then show Confirm button and price list
            if (obj.new == 0 && obj.qty > 0 && obj.oldqty > 0 && !premium) {
              g.showConfirmButton = true;
            }

            var tmpHTML = '<tr class="info new-user parent-url parent-url-' + obj.id + '"  data-type="' + ((obj.new) ? 'new' : 'old') + '"><td class="info the-url" data-tmpurl="' + htmlspecialchars(obj.title, ['ENT_QUOTES']) + '" data-url="' + htmlspecialchars(obj.oldtitle, ['ENT_QUOTES']) + '">' + tmpTitle + '</td><td class="info the-url-number" data-tmpqty="' + htmlspecialchars(obj.qty, ['ENT_QUOTES']) + '" data-qty="' + htmlspecialchars(obj.oldqty, ['ENT_QUOTES']) + '">' + tmpQty + '</td><td class="info txtRight">';
            if (obj.new)
            {
              tmpHTML += '<a class="remove-payurl" href="#" data-id="' + obj.id + '" data-url="' +  htmlspecialchars(obj.title, ['ENT_QUOTES']) + '" data-new="' + obj.new + '" data-oldqty="' + htmlspecialchars(obj.oldqty, ['ENT_QUOTES']) + '">' + g.lang.premiumjs.PCPREMIUMJSREMOVE + '</a>';
              g.showConfirmButton = true;
            }
            else
            {
              tmpHTML += '<a class="edit-subscription" data-type="new" data-id="' + obj.id + '" href="#' + obj.id + '">' + g.lang.premiumjs.PCPREMIUMJSEDIT + '</a>';
              if (obj.qty != 0)
              {
                tmpHTML += '<a class="remove-payurl" href="#" data-id="' + obj.id + '" data-url="' + htmlspecialchars(obj.title, ['ENT_QUOTES']) + '" data-new="' + obj.new + '" data-oldqty="' + htmlspecialchars(obj.oldqty, ['ENT_QUOTES']) + '">' + g.lang.premiumjs.PCPREMIUMJSREMOVE + '</a>';
              }
            }
            tmpHTML += '</td></tr>';
            $('#tbody-premium-users').append(tmpHTML);
          });

          $('#table-premium-users').show();
          $('#total-payment-info').show();
          $('.pricing-list').hide();
          showPricingList = false;

          $( '#promotion-code-part' ).hide();

          // Only show giftcard part if user is not premium and only if they are about to pay for 1 user.
          if (!premium)
          {
            $('#choose-period-radios').show();
            if (Object.keys(newUsers).length == 1)
            {
              let firstKey = Object.keys(newUsers)[0];
              if ((newUsers[firstKey].qty === 1 && newUsers[firstKey].new === 1) || (newUsers[firstKey].oldqty === 0 && newUsers[firstKey].new === 0 && newUsers[firstKey].qty === 1))
              {
                $( '#promotion-code-part' ).show();
              }
            }
          }

          activatePremiumText(g.lang.premiumjs.PCPREMIUMJSADDUSER);
        }
      }
      if (g.showConfirmButton == false)
      {
        $('#total-payment-info').hide();
        //$('.pricing-list').show();
      }

      // If no new users, dont show payment info
      if (Object.keys(newUsers).length == 0) // && premium)
      {
        $('#total-payment-info').hide();
        //$('.pricing-list').show();
      }

      $('#subscriptions-wrapper').show();
      $('#premium-tabs').show();

      if (showPricingList) {
        $('.pricing-list').show();
      }

      if (Object.keys(newUsers).length === 0 && Object.keys(existingUsers).length === 0)
      {
        hidePremiumElements();
      }

      if (premium)
      {
        $('#premium-period-wrapper').show();
      }
      bindPremiumEvents();
    }

    // Change price in modal window on change of amount of users on domain tab.
    $('#add-premium-domain-amount').keyup(function() {
      var v = $(this).val();
      var _amount = 1;
      if (v != "" && !isNaN(v)) {
        _amount = parseInt(v);
      }
      setModalPrice(_amount);
    });

    // Activate premium or "add user" event - same button
    $('#activate-premium-button').click(function()
    {
      var _email = pcrypt.getvalue('email');
      var _m = _email;

      // Check if logged in user is already in the existingUsers or newUsers list
      Object.keys(existingUsers).forEach(function (key)
      {
        if (existingUsers[key].url == _email)
        {
          _m = '';
        }
      });
      Object.keys(newUsers).forEach(function (key)
      {
        if (newUsers[key].title == _email)
        {
          _m = '';
        }
      });

      modalPremiumUrl(_m, null, null, null);
    });

    $('.pricing-column-wrapper').click(function()
    {
      $('#activate-premium-button').click();
      if ($(this).hasClass('monthly'))
      {
        $('#period1').click();
      }
      else
      {
        $('#period2').click();
      }
    });

    function modalPremiumUrl(defaultUrlEmail, defaultUrlNumber, defaultUrlDomain, editid)
    {
      var oppositePaymentType = (paymentType === 'email') ? 'domain' : 'email';

      // Fill out e-mail field, domain and number
      $('#add-premium-email').val(defaultUrlEmail);
      if (defaultUrlNumber)
      {
        $('#add-premium-domain-amount').val(defaultUrlNumber);
      }

      if (defaultUrlDomain)
      {
        $('#add-premium-domain').val(defaultUrlDomain);
      }

      if (editid)
      {
        $('#url-editid').val(editid);
        $('.email-or-domain button[data-type="' + oppositePaymentType + '"]').attr('disabled', 'disabled');
      }
      else
      {
        $('#url-editid').val('');
      }

      modaldiv('#dialog-premium', 600, 'Premium', false, false, function () { }, function (result)
      {
        if(result)
        {
          var editid = $('#url-editid').val();
          var title_ = $('#add-premium-' + paymentType).val();
          title_ = htmlspecialchars(title_, ['ENT_QUOTES']);

          var tmpAmount = $('#add-premium-' + paymentType + '-amount').val();
          tmpAmount = htmlspecialchars(tmpAmount, ['ENT_QUOTES']);

          var validUntil = null;

          if (title_ == '' || tmpAmount == '')
          {
            $('#premium-new-error-messages').html(g.lang.premiumjs.PCPREMIUMJSFILLOUTFIELDS + '<br>');
            setTimeout(function()
            {
              $('#activate-premium-button').click();
            },50);
            return;
          }

          if (isNaN(tmpAmount))
          {
            $('#premium-new-error-messages').html(g.lang.premiumjs.PCPREMIUMJSAMOUNTWRONG + '<br>');
            setTimeout(function()
            {
              $('#activate-premium-button').click();
            },50);
            return;
          }

          if (paymentType === 'email' && !validemail(title_))
          {
            $('#premium-new-error-messages').html(g.lang.premiumjs.PCPREMIUMJSPROVIDEVALIDEMAIL + '<br>');
            setTimeout(function()
            {
              $('#activate-premium-button').click();
            },50);
            return;
          }

          if (paymentType === 'domain' && !validdomain(title_))
          {
            $('#premium-new-error-messages').html(g.lang.premiumjs.PCPREMIUMJSPROVIDEVALIDDOMAIN + '<br>');
            setTimeout(function()
            {
              $('#activate-premium-button').click();
            },50);
            return;
          }

          var amount_ = parseInt(tmpAmount, 10);

          // IF EDIT!
          if (editid && editid != "")
          {
            var tmpObj =
            {
              qty: amount_,
              oldqty: parseInt($('tr.parent-url-' + editid + ' .the-url-number').data('qty'), 10),
              oldtitle: $('tr.parent-url-' + editid + ' .the-url').data('url'),
              title: title_,
              id: parseInt(editid, 10),
              new: 0
            };

            // Has it been edited before? Is is edited back to it's original state?
            Object.keys(newUsers).forEach(function (key)
            {
              if (parseInt(newUsers[key].id, 10) > 0 && parseInt(newUsers[key].id, 10) == parseInt(editid, 10))
              {
                delete newUsers[key];
              }
            });
            addTheUserObj(tmpObj, "new");

            // Delete old row in existingUsers
            Object.keys(existingUsers).forEach(function (key)
            {
              if (parseInt(existingUsers[key].id, 10) == parseInt(editid, 10))
              {
                updatedUsers[existingUsers[key].id] = existingUsers[key];
                delete existingUsers[key];
              }
            });
            
            // For now all edited show the confirm button. Might change in the future.
            g.showConfirmButton = true;

            // Wait a minute, what if it was a newUser, but now we edited it back to same number
            if (typeof updatedUsers[editid] != "undefined")
            {

              if (tmpObj.qty == tmpObj.oldqty && $('tr.parent-url-' + editid + ' .the-url').data('url') == title_) {
                Object.keys(newUsers).forEach(function (key)
                {
                  if (parseInt(newUsers[key].id, 10) > 0 && parseInt(newUsers[key].id, 10) == parseInt(editid, 10)) {
                    delete newUsers[key];
                  }
                });

                addTheUserObj(updatedUsers[editid], 'existing');
                delete updatedUsers[editid];
              }
            }
            $('.email-or-domain button[data-type="' + oppositePaymentType + '"]').removeAttr('disabled');
          }
          else
          {
            // Do not allow duplicates
            if (urlIsDuplicate(title_))
            {
              $('#premium-new-error-messages').html(g.lang.premiumjs.PCPREMIUMJSUSEREXISTS + '<br>');
              setTimeout(function()
              {
                $('#activate-premium-button').click();
              },50);
              return;
            }

            var addObj = {title: title_, oldtitle: title_, qty: amount_, oldqty: 0, new: 1, id: 0};
            addTheUserObj(addObj, 'new');
            g.showConfirmButton = true;
          }

          showPremiumUrls(validUntil, premium);

          $('#add-premium-' + paymentType).val('');
          $('#premium-new-error-messages').html('');
          $('#premium-email').val(pcrypt.getvalue('email'));
          premiumCalculatePrice();
          bindPremiumEvents();
        }
        else
        {
            $('.email-or-domain button[data-type="' + oppositePaymentType + '"]').removeAttr('disabled');
        }
      });
    }

    function urlIsDuplicate(_title)
    {
      var foundDuplicate = false;
      Object.keys(newUsers).forEach(function (key)
      {
         if (newUsers[key].title == _title)
         {
            foundDuplicate = true;
         }
      });

      Object.keys(existingUsers).forEach(function (key)
      {
         if (existingUsers[key].url == _title)
         {
            foundDuplicate = true;
         }
      });

      return foundDuplicate;
    }

    function addTheUserObj(addObj, theType)
    {
      var tmp = (theType == "new") ? newUsers : existingUsers;
      var tmpObj = JSON.parse(JSON.stringify(tmp));
      var newObj = {};
      var i = 0;
      Object.keys(tmpObj).forEach(function (key)
      {
        newObj[i] = tmpObj[key];
        i++;
      });
      newObj[i] = addObj;

      if (theType == "new")
      {
        newUsers = newObj;
      }
      else
      {
        existingUsers = newObj;
      }
    }

    /*
     * Calculate price function and show it in frontend.
     */
    function premiumCalculatePrice()
    {
      var qty = 0;
      Object.keys(newUsers).forEach(function (key)
      {
        if (newUsers[key].qty > newUsers[key].oldqty)
        {
          qty += (newUsers[key].qty - newUsers[key].oldqty);
        }
        else
        {
          if (newUsers[key].qty == newUsers[key].oldqty && newUsers[key].new === 0 && !premium)
          {
            qty += newUsers[key].qty;
          }
        }
      });

      if (!premium)
      {
        Object.keys(existingUsers).forEach(function (key)
        {
          var obj = existingUsers[key];
          qty += parseInt(obj.urlnumber, 10);
        });
      }

      var price = qty * prices[$('#choose-period-radios input[name="period"]:checked').val()];
      if (premium)
      {
        var repayMoment = moment(premiumRepayDate, "YYYY-MM-DD HH:mm:ss");
        var currentMoment = moment().hour(0).minute(0).second(0);

        var diff = repayMoment.diff(currentMoment, 'months');
        var diffDays = repayMoment.diff(currentMoment, 'days');

        var tmpprice = prices.month;
        if (premiumType === 'year')
        {
          tmpprice = prices.year / 12;
        }
        if (parseInt(diff, 10) === 0)
        {
          price = qty * ((parseInt(diffDays, 10) / 30) * tmpprice);
        }
        else if (parseInt(diff, 10) > 0)
        {
          price = qty * (tmpprice * diff);
        }
      }

      // If gift card used, the price is 0 (free).
      if (giftcardUsed) {
        price = 0;
      }

      $('#premium-charge').html((price / 100));
      $('#hidden-amount').val(parseInt(price, 10));

      if (price > 0)
      {
        $('#premium-pay-button').html(g.lang.premium.PCPREMIUMPAY);
      }
      else
      {
        $('#premium-pay-button').html(g.lang.premiumjs.PCPREMIUMJSCONFIRM);
      }
    }


    // Event on clicking RADIO button of YEAR or MONTH
    $('#choose-period-radios input[name="period"]').click(function()
    {
      premiumCalculatePrice();
    });


    // Event on the buttons in pop-up, EMAIL or DOMAIN
    $('.email-or-domain .btn').click(function ()
    {
      $('.email-or-domain .btn').removeClass('btn-info');
      $('.email-or-domain .btn').removeClass('active');
      $('.email-or-domain .btn').addClass('btn-default');
      $(this).removeClass('btn-default');
      $(this).addClass('btn-info');
      $(this).addClass('active');
      paymentType = $(this).data('type');
      $('.premium-type').hide();
      $('.' + paymentType + '-type').show();

      // Reset modal price.
      if (paymentType === "email")
      {
        setModalPrice(1);
      }
      else
      {
        var _amount = $('#add-premium-domain-amount').val();
        if (_amount != "" && !isNaN(_amount))
        {
          _amount = parseInt(_amount);
        }
        else
        {
          _amount = 1;
        }
        setModalPrice(_amount);
      }
    });


    // Promotion code events.
    $('#promotion-code-link').click(function(e)
    {
      e.preventDefault();
      $(this).find('i').toggleClass('rotate');
      $('#promotion-code-wrapper').slideToggle();
    });


    // Apply promotion code click event
    var applyingPromotionCode = false;
    $('.premium-apply').click(function() // Must use class and not ID because of lang!!
    {
      if (applyingPromotionCode) {
        return;
      }
      applyingPromotionCode = true;

      var promoCode = $('#promotion-code').val();
      jspremium.giftcardvalid(pcrypt.getvalue('authsession'), promoCode, 0,function (data, error, id)
      {
        applyingPromotionCode = false;
        if ( error )
        {
          handlepcrypterror( error, data );
          return;
        }

        if (data.valid)
        {
          giftcardUsed = true;
          $('#choose-period-radios input[type="radio"]').prop({checked:false});
          $('#period3').prop({checked:true});
          $('#giftcard-months').html(data.months);
          $('.giftcard-radio').show();
          $('#promotion-code-link').click();
          $('#period1').prop({disabled:true});
          $('#period2').prop({disabled:true});
          premiumCalculatePrice();
          modalalert(g.lang.premiumjs.PCPREMIUMCODEACTIVATED, g.lang.default.PCPROGRAMTITLE);
        }
        else
        {
          if (typeof data.created == 'undefined')
          {
            modalalert(g.lang.premiumjs.PCPREMIUMINVALIDCODETEXT, g.lang.premiumjs.PCPREMIUMINVALIDCODE);
          }
          else
          {
            let _expireDate = moment(data.expire, 'YYYY-MM-DD HH:mm:ss');
            let _nowDate = moment();
            if (_expireDate.isBefore(_nowDate)) {
              modalalert(g.lang.premiumjs.PCPREMIUMEXPIREDCODETEXT, g.lang.premiumjs.PCPREMIUMINVALIDCODE);
            }

            if (data.used != null) {
              modalalert(g.lang.premiumjs.PCPREMIUMUSEDCODETEXT, g.lang.premiumjs.PCPREMIUMINVALIDCODE);
            }
          }
        }

      });
    });


    // Tabs
    $('.premium-tabs li a').click(function(e)
    {
      e.preventDefault();
      if ($(this).hasClass('billing-tab'))
      {
        $('li.subscriptions-tab').removeClass('active');
        $('li.billing-tab').addClass('active');
        $('#subscriptions-wrapper').hide();
        $('#billing-wrapper').show();
      }
      else
      {
        $('li.billing-tab').removeClass('active');
        $('li.subscriptions-tab').addClass('active');
        $('#subscriptions-wrapper').show();
        $('#billing-wrapper').hide();
      }
    });


    // PAY / CONFIRM - button event
    $('#premium-pay-button').click(function(e)
    {
      if (!$('#tos').is(':checked'))
      {
        modalalert(g.lang.premiumjs.PCPREMIUMJSREADTOS, g.lang.premiumjs.PCPREMIUMJSTOS);
        paying = false;
      }
      else
      {
        if (paying) {
          return;
        }

        if (!premium) {
          premiumType = $('#choose-period-radios input[name="period"]:checked').val();
        }
        if (giftcardUsed) {
          premiumType = 'giftcard';
        }
        var _promoCode = $('#promotion-code').val();

        paying = true;
        var premiumpayInfo =
        {
          company: $('#premium-name').val(),
          contactperson: $('#premium-contactperson').val(),
          street: $('#premium-address').val(),
          zip: $('#premium-zip').val(),
          city: $('#premium-city').val(),
          state: $('#premium-state').val(),
          country: $('#premium-country').val(),
          email: $('#premium-email').val(),
          phone: $('#premium-phone').val(),
          vat: $('#premium-vat').val()
        };

        if (!companyPayID)
        {
          // Validate fields.
          if (premiumpayInfo.contactperson == '' ||
            premiumpayInfo.street == '' ||
            premiumpayInfo.zip == '' ||
            premiumpayInfo.city == '' ||
            premiumpayInfo.country == '' ||
            premiumpayInfo.email == '') {

            paying = false;
            modalalert(g.lang.premiumjs.PCPREMIUMJSFILLOUTFIELDS, g.lang.premiumjs.PCACCOUNTREQUIRED);
            return;
          }
          $('#premium-pay-button').html(g.lang.premiumjs.PCPREMIUMJSPLEASEWAIT);

          if (!giftcardUsed) {
            g.openedwindow = window.open( '', g.paymentWindow, '' );
          }
          jspremium.createpay(pcrypt.getvalue('authsession'), premiumpayInfo, 0, function (data, error, id)
          {

            if(error)
            {
              handlepcrypterror(error, data);
              return;
            }

            companyPayID = data.payid;

            if (Object.keys(newUsers).length)
            {
              var urls = [];
              var numbers = [];

              Object.keys(newUsers).forEach(function (key)
              {
                urls.push(newUsers[key].title);
                numbers.push(newUsers[key].qty);
              });

              jspremium.createurl(pcrypt.getvalue('authsession'), companyPayID, urls, numbers, 0, function (data2, error, id)
              {

                if(error)
                {
                  handlepcrypterror(error, data2);
                  return;
                }

                setOrderId(companyPayID, $('#choose-period-radios input[name="period"]:checked').val(), 0, _promoCode, function()
                {
                  // Giftcard does not require creditcard (for now)
                  if (giftcardUsed) {
                    pay(companyPayID, 0, _promoCode);
                  }
                  else {
                    submitInNewWindow();
                  }
                });
              });
            }
          });
        }
        else
        {
          $('#premium-pay-button').html(g.lang.premiumjs.PCPREMIUMJSPLEASEWAIT);

          var amountToPay = parseInt($('#hidden-amount').val(), 10);
          if (amountToPay)
          {
            g.openedwindow = window.open( '', g.paymentWindow, '' );
          }

          if (Object.keys(newUsers).length)
          {
            /*
             * Here we loop through all the new and current subs. And they will be either added or edited.
             */
            var urls = [];
            var numbers = [];
            var counter = 0;

            Object.keys(newUsers).forEach(function (key)
            {
              if (newUsers[key].new)
              {
                urls.push(newUsers[key].title);
                numbers.push(newUsers[key].qty);
              }

              counter++;
            });

            if (urls.length)
            {
              jspremium.createurl(pcrypt.getvalue('authsession'), companyPayID, urls, numbers, 0, function (data, error, id)
              {

                if(error)
                {
                  handlepcrypterror(error, data);
                  return;
                }

                for (var i = 0; i < urls.length; i++)
                {
                  counter--;
                }
                if (counter == 0)
                {
                  setOrderId(companyPayID, premiumType, 0, _promoCode,function() {
                    pay(companyPayID, amountToPay, _promoCode);
                  });
                }
              });
            }

            var tmpCounter = 0;
            Object.keys(newUsers).forEach(function (key)
            {
              if (!newUsers[key].new)
              {
                tmpCounter++;
                jspremium.editurl(pcrypt.getvalue('authsession'), newUsers[key].id, companyPayID, newUsers[key].title, newUsers[key].qty, tmpCounter, function(data, error, id)
                {

                  if(error)
                  {
                    handlepcrypterror(error, data);
                    return;
                  }

                  counter--;
                  if (counter == 0)
                  {
                    setOrderId(companyPayID, premiumType, 0, _promoCode, function() {
                      pay(companyPayID, amountToPay, _promoCode);
                    });
                  }
                });
              }
            });
          }
        }
      }
    });

    function pay(payid, amount, promoCode)
    {
      if (amount || giftcardUsed)
      {

        jspremium.pay(pcrypt.getvalue('authsession'), payid, amount, premiumType, promoCode, 0, function(data, error, id)
        {
          //console.log(arguments);

          if(error)
          {
            handlepcrypterror(error, data);
            return;
          }

          if (data.status == "ACK" || giftcardUsed)
          {
            paying = false;
            giftcardUsed = false;
            setPremium(true, true);
          }
          else
          {
            // Redirect to creditcard pay
            submitInNewWindow();
          }

        });
      }
      else
      {
        closeOpenedWindow();
        window.location.reload(true);
      }
    }

    function setOrderId(payId, payPeriod, renew, code, extracallback)
    {
      jspremium.sessionvalues(pcrypt.getvalue('authsession'), payId, payPeriod, renew, code, 0, function(data, error, id)
      {

      if(error)
      {
        handlepcrypterror(error, data);
        return;
      }

        $('#hidden-orderid').val(data);

        if (typeof extracallback == 'function')
        {
          extracallback();
        }
      });
    }

    function hidePremiumElements()
    {
      $('#total-payment-info').hide();
      $('#choose-period-radios').hide();
      $('#promotion-code-part').hide();
      $('#table-premium-users').hide();
    }

    function activatePremiumText (text)
    {
      $('#activate-premium-button span').html(text);
    }

    function bindPremiumEvents()
    {
      // Remove premium user event
      $('.remove-payurl').unbind();
      $('.remove-payurl').click(function (e)
      {
        e.preventDefault();
        var id_ = parseInt($(this).data('id'), 10);

        if (id_ > 0)
        {
          var tmpObj =
          {
            qty: 0,
            oldqty: parseInt($('tr.parent-url-' + id_ + ' .the-url-number').data('qty'), 10),
            oldtitle: $('tr.parent-url-' + id_ + ' .the-url').data('url'),
            title: $('tr.parent-url-' + id_ + ' .the-url').data('url'),
            id: parseInt(id_, 10),
            new: 0
          };
          var paidSub = (tmpObj.oldqty != 0);
          if (!premium) {
            paidSub = false;
          }

          Object.keys(newUsers).forEach(function (key)
          {
            if (parseInt(newUsers[key].id, 10) > 0 && parseInt(newUsers[key].id, 10) == id_) {
              delete newUsers[key];
            }
          });

          if (paidSub) {
            addTheUserObj( tmpObj, "new" );
          }
          else
          {
            // Delete from DB
            jspremium.deleteurl(pcrypt.getvalue('authsession'), id_, 0, function(data, error, id)
            {
              if(error)
              {
                handlepcrypterror(error, data);
                showPremiumUrls(null, premium);
                premiumCalculatePrice();
                return;
              }
            });
          }

          // Delete old row in existingUsers
          Object.keys(existingUsers).forEach(function (key)
          {
            if (parseInt(existingUsers[key].id, 10) == parseInt(id_, 10))
            {
              if (paidSub)
              {
                updatedUsers[existingUsers[key].id] = existingUsers[key];
              }
              delete existingUsers[key];
            }
          });

          g.showConfirmButton = !(Object.keys(newUsers).length === 0 && Object.keys(existingUsers).length === 0 && Object.keys(updatedUsers).length === 0);
          showPremiumUrls(null, premium);
          premiumCalculatePrice();
        }
        else {

          var _url = $(this).parents('tr.new-user').find('td.the-url').data('url');
          Object.keys(newUsers).forEach(function (key)
          {
            if (_url ==  newUsers[key].title) {
              delete newUsers[key];
            }
          });

          $(this).parents('tr.info').remove();

          // If there are no users in Premium List than hide everything but pricing list
          if ($('#tbody-premium-users').html() == "")
          {
            activatePremiumText(g.lang.premiumjs.PCPREMIUMJSACTIVATE);
            hidePremiumElements();
            $('#add-premium-email').val(pcrypt.getvalue('email'));
            $('.pricing-list').show();
          }
          else
          {
            // Check if it is the last new item which is being removed
            if (!$('.remove-payurl').length)
            {
              g.showConfirmButton = false;
              $('#total-payment-info').hide();
              $('#add-premium-email').val(pcrypt.getvalue('email'));
            }
          }
          showPremiumUrls(null, premium);
          premiumCalculatePrice();
        }
      });

      // Edit subscription
      $('.edit-subscription').unbind();
      $('.edit-subscription').click(function(e)
      {
        var id_ = $(this).data('id');
        var $parent = $(this).parents('.parent-url');
        var _url = $parent.find('.the-url').data('tmpurl');
        var _urlnumber = $parent.find('.the-url-number').data('tmpqty');
        var _urldomain = null;

        $('.email-or-domain button[data-type="email"]').click();

        if (!validemail(_url))
        {
          _urldomain = _url;
          _url = '';
          $('.email-or-domain button[data-type="domain"]').click();
        }

          modalPremiumUrl(_url, _urlnumber, _urldomain, id_);
      });

      // Delete url
      $('.delete-url').unbind();
      $('.delete-url').click(function(e)
      {
        var id_ = $(this).data('id');
        modalconfirm(g.lang.premiumjs.PCPREMIUMJSREMOVESURE, g.lang.premiumjs.PCPREMIUMJSREMOVE, function(response)
        {
          if (response)
          {
            jspremium.deleteurl(pcrypt.getvalue('authsession'), id_, 0, function(data, error, id)
            {
            //console.log(arguments);

            if(error)
            {
              handlepcrypterror(error, data);
              return;
            }

            getPremium();
            });
          }
        });
      });
    }

    /************* PREMIUM END *****************/




























    // Event handlers for menu
    document.getElementById('updateinfo').onclick = function (event)
    {
      if(!validlogin())
      {
        modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
        return;
      }

      $(".globalhide").hide();
      document.getElementById('accountteamname').value = pcrypt.getvalue('username');
      document.getElementById('accountteamdepartment').value = pcrypt.getvalue('userdepartment');

      var avatarImgElm = document.getElementById('accountteamavatar');
      var avatarImg = pcrypt.getvalue('useravatar');

      if(avatarImgElm && avatarImg)
      {
        avatarImgElm.setAttribute('src', 'data:image/png;base64,' + avatarImg);
      }

      $("#divaccountinfo").show();
      document.getElementById('accountteamname').focus();
    };

    document.getElementById('updateid').onclick = function (event)
    {
      if(!validlogin())
      {
        modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
        return;
      }

      $(".globalhide").hide();
      document.getElementById('currentemail').innerHTML = pcrypt.getvalue('email');
      $("#divaccountnewemail").show();
      document.getElementById('newemail').focus();
    };

    document.getElementById('updatekey').onclick = function (event)
    {
      if(!validlogin())
      {
        modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
        return;
      }

      $(".globalhide").hide();
      $("#divaccountnewpass").show();
      document.getElementById('newpassword').focus();
    };

    document.getElementById('language').onclick = function (event)
    {
      if(!validlogin())
      {
        modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
        return;
      }
      $(".globalhide").hide();

      jslang.available(0, function(availlang, error, id)
      {
        if(error)
        {
          handlepcrypterror(error, availlang);
          return;
        }

        var langcode = pcrypt.getvalue('languagecode', false);

        document.getElementById('languagetext').innerHTML = availlang[langcode].name;
        document.getElementById('languagecode').innerHTML = langcode;

        var tablearrayheader = [[g.lang.downlangjs.PCDOWNLANGCHANGEHEADER, "style='width: 200px; text-align: left;'"], [g.lang.downlangjs.PCDOWNLANGDOWNLOADHEADER, "style='width: 200px; text-align: left;'"], [g.lang.downlangjs.PCDOWNLANGCREDITHEADER, "style='text-align: left;'"]];

        var arrayavaillang = [];
        var separator;
        var uri = parseUri(window.location.href);
        var url = uri.protocol + '://' + uri.host + uri.path;

        if(uri.queryKey.hasOwnProperty('language'))
          delete uri.queryKey.language;

        if(Object.keys(uri.queryKey).length)
        {
          separator = '&';
          url += '?';
          for (var prop in uri.queryKey)
          {
            url += prop + '=' + uri.queryKey[prop] + '&';
          }
          url = url.slice(0, -1); // remove last &
        }
        else
        {
            separator = '?';
        }

        for (var key in availlang)
        {
          arrayavaillang.push([
          "<a href='" + url + separator + "language=" + key + "'>" + availlang[key].name + "</a>",
          "<a href='lib/lang/languagedb.php?download=" + key + "'>" + availlang[key].name + "</a>",
          availlang[key].credit
          ]);
        }

        document.getElementById('languagetable').innerHTML = buildtable(tablearrayheader, null, arrayavaillang, 'downlanggrid');

        //setdomlanguage(g.lang, 'downlang');

      });

      $("#divaccountlanguage").show();
    };

    document.getElementById('delete').onclick = function (event)
    {
      if(!validlogin())
      {
        modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
        return;
      }

      //$(".contentmenustylecurrent").attr('class', 'contentmenustyle');
      //$("#delete").attr('class', 'contentmenustylecurrent');

      $(".globalhide").hide();
      $("#divdelete").show();
    };

    document.getElementById('totpsecurity').onclick = function (event)
    {
      showtotpsecurity();
    };

    document.getElementById('browsersecurity').onclick = function (event)
    {
      showbrowsersecurity();
    };

    document.getElementById('sessionsecurity').onclick = function (event)
    {
      showsessionsecurity();
    };

    document.getElementById('restore').onclick = function (event)
    {
      showrestore();
    };

    document.getElementById('premium').onclick = function (event)
    {
      if(pcrypt.getvalue('options').globalpremium === true)
      {
        return;
      }

      getPremium();
      showpremium();
    };

    if(opts.enableemergencymail)
    {
      $('#emergencyMail').parents().show();
      document.getElementById('emergencyEmailSetupBtn').onclick = function(event)
      {

        if(pcrypt.getvalue('premium') < 1)
        {
          modalPremiumRestriction();
          return;
        }

        event.preventDefault();
        modaldiv('#emergencymailmodal', 500, 'setup emergency email', true, true, function () {}, function (result)
        {
          if(!result)
          {
            return;
          }
          
          var emergencyEmailInput = document.getElementById('emergencyemailinput');
          var emergencyEmailInputCheck = document.getElementById('emergencyemailinputcheck');
          var emergencyTimeSelection = document.getElementById('emergencytimeinput');
          var denialTime = Number(emergencyTimeSelection.value);
          
          if(isNaN(denialTime) || denialTime < 12 || denialTime > 720)
          {
            $('#emergencymailmodal').dialog("close");
            modalalert(g.lang.accountjs.PCACCOUNTEMERGENCYEMAILNOMATCH, g.lang.default.PCPROGRAMTITLE);
            return;
          }

          if(emergencyEmailInput.value !== emergencyEmailInputCheck.value)
          {
            $('#emergencymailmodal').dialog("close");
            modalalert(g.lang.accountjs.PCACCOUNTEMERGENCYEMAILNOMATCH, g.lang.default.PCPROGRAMTITLE);
            return;
          }

          if(!validemail(emergencyEmailInput.value) || !validemail(emergencyEmailInputCheck.value))
          {
            $('#emergencymailmodal').dialog("close");
            modalalert(g.lang.accountjs.PCACCOUNTNOTVALIDEMAIL, g.lang.default.PCPROGRAMTITLE);
            return;
          }

          if(!pcrypt.getvalue('options') || !pcrypt.getvalue('options').enableemergencymail)
          {
            return;
          }

          if(pcrypt.getvalue('premium') < 1)
          {
            $('#emergencymailmodal').dialog("close");
            modalPremiumRestriction();
            return;
          }  

            
          $('#emergencymailmodal').dialog('close');
          
          if(emergencyEmailInput.value.toLowerCase() === pcrypt.getvalue('email').toLowerCase())
          {
            modalalert(g.lang.accountjs.PCACCOUNTEMERGENCYSAMEEMAILERROR, g.lang.default.PCPROGRAMTITLE);
            return;
          }
          
          modalprompt(g.lang.default.PCPASSWORDSCONFIRMPASSWORDTEXT, g.lang.default.PCPROGRAMTITLE, 'PASSWORD', "", 64, null, function (pass)
          {
            if(pass !== false)
            {
              loader(true);
              var keys = pcrypt.generatekeys(pass, pcrypt.getvalue('saltcrypt'));
              
              if(keys.aes !== pcrypt.getvalue('keycrypt'))
              {
                loader(false);
                modalalert(g.lang.default.PCPASSWORDSWRONGPASSWORD, g.lang.default.PCPROGRAMTITLE);
                return;
              }
              
              pcrypt.emergencysetup(pcrypt.getvalue('session'), pcrypt.getvalue('email'), emergencyEmailInput.value, denialTime, pcrypt.getvalue('languagecode', false), 0, function(data, error, id)
              {
                if(error)
                {
                  if(error === 39)
                  {
                    modalalert(g.lang.accountjs.PCACCOUNTEMERGENCYSAMEEMAILERROR, g.lang.default.PCPROGRAMTITLE);
                    return;
                  }
                  else
                  {
                    handlepcrypterror(error, data);
                    return;
                  }
                }
                
                if(data)
                {
                  var privatekey = pcrypt.getvalue('privatekey');
                  var publickey  = pcrypt.decodeasymetrickeys(data[3]);
                  var sharedkey  = pcrypt.getsharedsecret(privatekey, publickey);
                  var encpass    = pcrypt.encryptdata(sharedkey, pass, false);
                  pcrypt.setemergencydata(pcrypt.getvalue('session'), encpass, 0, function(data, error, id)
                  {
                    if(error)
                    {
                      handlepcrypterror(error, data);
                      return;
                    }

                    if(data)
                    {
                      modalalert(g.lang.accountjs.PCACCOUNTEMERGENCYMODALSETUP, g.lang.default.PCPROGRAMTITLE);
                      loader(false);
                      showEmergencySetup();
                    }
                  });
                }
              });
            }
          });
        });
      }
      
      var emergencyEmailInputTimer = null;
      var emergencyEmailCheckTimer = null;

      document.getElementById('emergencyMail').onclick = function (event)
      {
        event.preventDefault();
        loader(true);

        if(!pcrypt.getvalue('options').enableemergencymail)
        {
          return;
        }

        showEmergencySetup();
      }
      
      document.getElementById('emergencyemailinput').onkeydown = function (e)
      {
        clearTimeout(emergencyEmailInputTimer);

        emergencyEmailInputTimer = setTimeout(function()
        {
          var emailInput = document.getElementById('emergencyemailinput');
          var emailCheck = document.getElementById('emergencyemailinputcheck');
          
          if(!emailInput)
          {
            return;
          }
          
          if(!emailInput.previousElementSibling || !emailInput.value)
          {
            emailInput.previousElementSibling.style.color = 'black';
            emailInput.previousElementSibling.innerText = g.lang.account.PCACCOUNTEMERGENCYLABELEMAIL;
            return;
          }
          
          if(emailCheck.value && emailCheck.value && emailInput.value !== emailCheck.value)
          {
            emailInput.style.background = '#ff000069';
            emailCheck.style.background = '#ff000069';
            emailCheck.previousElementSibling.innerText = g.lang.accountjs.PCACCOUNTEMERGENCYEMAILNOMATCH;
            emailCheck.previousElementSibling.style.color = 'red';
            return;
          }

          if(emailInput.value && !validemail(emailInput.value, emailInput) && emailInput.value.length > 0)
          {
            emailInput.previousElementSibling.style.color = 'red';
            emailInput.previousElementSibling.innerText = g.lang.accountjs.PCACCOUNTNOTVALIDEMAIL;
          }
          else
          {
            emailInput.previousElementSibling.style.color = 'black';
            emailInput.previousElementSibling.innerText = g.lang.account.PCACCOUNTEMERGENCYLABELEMAIL;
            
            if(emailCheck && emailCheck.value)
            {
              validemail(emailCheck.value, emailCheck);
              emailCheck.previousElementSibling.style.color = 'black';
              emailCheck.previousElementSibling.innerText = g.lang.account.PCACCOUNTEMERGENCYLABELEMAILRE;
            }
          }
        }, 1000);
      }

      document.getElementById('emergencyemailinputcheck').onkeyup = function (e)
      {
        clearTimeout(emergencyEmailCheckTimer);

        emergencyEmailCheckTimer = setTimeout(function()
        {
          var emailInput = document.getElementById('emergencyemailinput');
          var emailCheck = document.getElementById('emergencyemailinputcheck');

          if(!emailCheck)
          {
            return;
          }

          if(!emailCheck.value || !emailCheck.previousElementSibling)
          {
            emailInput.style.background = 'white';
            emailCheck.style.background = 'white';
            emailCheck.previousElementSibling.style.color = 'black';
            emailCheck.previousElementSibling.innerText = g.lang.account.PCACCOUNTEMERGENCYLABELEMAILRE;
            return;
          }
          
          if(emailCheck.value && emailCheck.value && emailInput.value !== emailCheck.value)
          {
            emailInput.style.background = '#ff000069';
            emailCheck.style.background = '#ff000069';
            emailCheck.previousElementSibling.innerText = g.lang.accountjs.PCACCOUNTEMERGENCYEMAILNOMATCH;
            emailCheck.previousElementSibling.style.color = 'red';
            return;
          }

          if(emailCheck.value && !validemail(emailCheck.value, emailCheck) && emailCheck.value.length > 0)
          {
            emailCheck.previousElementSibling.style.color = 'red';
            emailCheck.previousElementSibling.innerText = g.lang.accountjs.PCACCOUNTNOTVALIDEMAIL;
          }
          else
          {
            emailCheck.previousElementSibling.style.color = 'black';
            emailCheck.previousElementSibling.innerText = g.lang.account.PCACCOUNTEMERGENCYLABELEMAILRE;

            if(emailInput && emailInput.value)
            {
              validemail(emailInput.value, emailInput);
              emailCheck.previousElementSibling.style.color = 'black';
              emailInput.previousElementSibling.innerText = g.lang.account.PCACCOUNTEMERGENCYLABELEMAIL;
            }
          }
        }, 1000);
      }
    }

    if(opts.allowextension2fanegation)
    {
      document.getElementById('extension2fa').onclick = (event) => 
      {
        event.preventDefault();
        showtoggleExtension2fa();
      }

      document.getElementById('actiontoggleext2fa').onclick = (event) =>
      {
        event.preventDefault();
        pcrypt.toggleextension2fa(pcrypt.getvalue('session'), 0, (data, error, id) => 
        {
          if(error)
          {
            handlepcrypterror(error, data);
            return;
          }

          document.getElementById('PCACCOUNTTOGGLEEXT2FASTATE').innerHTML = (data > 0) ? 
          g.lang.accountjs.PCACCOUNTTOGGLEEXT2FASTATE.replace('[ext2fastate]', '<b>'+g.lang.accountjs.PCACCOUNTEXT2FAENABLED+'</b>,') : 
          g.lang.accountjs.PCACCOUNTTOGGLEEXT2FASTATE.replace('[ext2fastate]', '<b>'+g.lang.accountjs.PCACCOUNTEXT2FADISABLED+'</b>,');
        });
      }
    }

    document.getElementById('log').onclick = function (event)
    {
      showlog();
    };

    addClearSearchIcon('searchmemberlog', searchlog);
    document.getElementById('searchmemberlog').onkeyup = function (event)
    {
      searchlog();
    };

    // Event handlers for action buttons

    document.getElementById('actionupdateid').onclick = function (event)
    {
      var opts = pcrypt.getvalue('options');

      if(opts.ldapintegration)
      {
        modalconfirm(g.lang.accountjs.PCACCOUNTUPDKEYLDAPWARNING, g.lang.default.PCPROGRAMTITLE, function (result)
        {
          if(result)
          {
            updateId();
          }
        });
      }
      else
      {
        updateId();
      }
    };

    document.getElementById('actionupdatekey').onclick = function (event)
    {
      updateKeyCheck();
    };

    document.getElementById('actiondelete').onclick = function (event)
    {
      if(opts.disableuserdelete == false)
      {
        deleteUser();
      }
      else
      {
        modalalert(g.lang.default.PCNOFEATUREACCESS, g.lang.default.PCPROGRAMTITLE);
      }
    };

    document.getElementById('actiontotpsecurity').onclick = function (event)
    {
    totpsecurityUser(true);
    };

    document.getElementById('actiontotpsecurityremove').onclick = function (event)
    {
    totpsecurityUser(false);
    };

    document.getElementById('actionupdateinfo').onclick = function (event)
    {
    updateInfo();
    };

    document.getElementById('actionbrowsersecurity').onclick = function (event)
    {
    browsersecurityUser(true);
    };

    document.getElementById('actionbrowsersecurityremove').onclick = function (event)
    {
    browsersecurityUser(false);
    };

    document.getElementById('actionsessionsecurity').onclick = function (event)
    {
    sessionsecurityUser(true);
    };

    document.getElementById('actionsessionsecurityremove').onclick = function (event)
    {
    sessionsecurityUser(false);
    };

    // Other event handlers

    document.getElementById('newemail').onkeyup = function (event)
    {
      validemail(this.value, this);
    };

    document.getElementById('newpassword').onkeyup = function (event)
    {
      passwordstrength(this.value, this);
    };

    // File handling
    document.getElementById('inputavatarupload').onchange = function(event)
    {
      var files = event.target.files; // FileList object
      var options = pcrypt.getvalue('options');

      for (var i = 0, f; f = files[i]; i++)
      {
        if(!isMimeImage(f.type))
        {
          modalalert('<div class="popup">' + g.lang.accountjs.PCACCOUNTIMAGEERROR + '</div>', g.lang.default.PCPROGRAMTITLE);
          continue;
        }

        if (f.size > options.avatarsizelimit)
        {
          var filesize = Math.floor(options.avatarsizelimit / 1024) + " KB";

          modalalert('<div class="popup">' + g.lang.importjs.PCIMPORTTOOBIG +
              ' ' + filesize + '</div>', g.lang.default.PCPROGRAMTITLE);
          continue;
        }

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile)
        {
            //var fileName = theFile.name;
            var fileType = theFile.type;

            return function(e)
            {
              var avatarImgElm = document.getElementById('accountteamavatar');

              if(avatarImgElm == null)
              {
                console.log('Avatar img id not found');
                return;
              }

              var arrayBuffer = new Uint8Array(e.target.result);
              var len = arrayBuffer.byteLength;
              var binary = '';

              for (var i = 0; i < len; i++)
              {
                  binary += String.fromCharCode( arrayBuffer[ i ] );
              }

              //console.log(window.btoa(binary));

              avatarImgElm.setAttribute('data-filetype', fileType);
              avatarImgElm.setAttribute('src', 'data:' + fileType + ';base64,' + window.btoa(binary));
            };
        })(f);

        // Read in the binary file as ArrayBuffer data.
        reader.readAsArrayBuffer(f);

        this.value = ""; // Reset the element
      }

      event.target.value = null;
    };

    document.getElementById('buttonavatardelete').onclick = function(event)
    {
      var avatarImgElm = document.getElementById('accountteamavatar');

      if(avatarImgElm == null)
      {
        console.log('Avatar img id not found');
        return;
      }

      var avatarDefaultImg = avatarImgElm.getAttribute('data-default');

      avatarImgElm.removeAttribute('data-filetype');
      avatarImgElm.setAttribute('src', avatarDefaultImg);
      pcrypt.setvalue('useravatardefault', true);
    };


    /* Not in use right now
    document.getElementById('showpasswordid').onmousedown = function (event)
    {
      var element = document.getElementById('newpassword');

      if(element.getAttribute('type') == 'text')
        element.setAttribute('type', 'password');
      else
        element.setAttribute('type', 'text');
    };

    document.getElementById('showpasswordid').onmouseout = function (event)
    {
      document.getElementById('newpassword').setAttribute('type', 'password');
    };
    */

    var toggle_ = false;

    $( "#show-password-button" ).click(function(e)
    {
    if (!toggle_)
    {
      $('#newpassword').attr('type', 'text');
      $('#confirmnewpassword').attr('type', 'text');
      toggle_ = true;
    }
    else
    {
      $('#newpassword').attr('type', 'password');
      $('#confirmnewpassword').attr('type', 'password');
      toggle_ = false;
    }
    e.preventDefault();
    });

    loader(false);

    var id = getUrlParameter('id');
    if(id)
    document.getElementById(id).click();

    /**
     * If user access the account page via a "subscribe to" premium link ending in toPrem=true.
     * it should execute showPremium();
     * e.g. url: sitename.dk/index.html?someParam=value&toPrem=true.
     */
    var toPrem = getUrlParameter('toPrem');

    if(toPrem)
    {
      if(pcrypt.getvalue('options').globalpremium === true)
      {
        return;
      }

      checkPremium();
      getPremium();
      showpremium();
    }

    /**
     * If a user is send to the page via a link with to2fa = true url parameter
     */
    var to2fa = getUrlParameter('to2fa');
    if(to2fa)
    {
      showtotpsecurity();
    }
    var toEmail = getUrlParameter('toEmail');
    if(toEmail){
      $(".globalhide").hide();
      document.getElementById('currentemail').innerHTML = pcrypt.getvalue('email');
      $("#divaccountnewemail").show();
      document.getElementById('newemail').focus();
    }

    // I would have liked to put this inside index.js but nav-logo is generated later than index.js is read.
    if(opts.disablepasswords == true)
    {
      if(document.getElementsByClassName('nav-logo')[0])
      {
        if(opts.disablemessages == false)
        {
          document.getElementsByClassName('nav-logo')[0].href = './index.html?page=messages';
        }
        else if(opts.disablemessages == true)
        {
          document.getElementsByClassName('nav-logo')[0].href = './index.html?page=account';
        }

      }
    }
  });
}

function checkAll(email, pass)
{
	if(email)
  {
  	if(!validemail(document.getElementById('newemail').value))
  	{
  		modalalert(g.lang.accountjs.PCACCOUNTNOTVALIDEMAIL, g.lang.default.PCPROGRAMTITLE, function modalalertreturn(value)
  		{
  			document.getElementById('newemail').focus();
  		});
  		return false;
  	}
  }

	if(pass)
	{
    if($('#newpassword').val() !== $('#confirmnewpassword').val())
    {
      modalalert(g.lang.default.PCPASSWORDSDONOTMATCH, g.lang.default.PCPROGRAMTITLE, function (value)
      {
        document.getElementById('newpassword').focus();
      });
      return false;
    }

    switch(passwordstrength(document.getElementById('newpassword').value))
  	{
      default: // Below required length
        modalalert(g.lang.default.PCPASSWORDSHORT, g.lang.default.PCPROGRAMTITLE, function (value)
        {
            document.getElementById('newpassword').focus();
        });
        return false;
      break;

      case 2: // Not so random
        if(pcrypt.passwordonlyallowgoodquality == false)
        {
          modalconfirm(g.lang.default.PCWEAKPASSWORDSELECTED, g.lang.default.PCPROGRAMTITLE, function (result)
      		{
      		  if(!result)
      		    return false;
      		});
        }
        else
        {
          modalalert(g.lang.default.PCPASSWORDSHORT, g.lang.default.PCPROGRAMTITLE, function (value)
          {
              document.getElementById('newpassword').focus();
          });
          return false;
        }
      break;

      case 3: // Good password
      break;
  	}
  }

	return true;
}

function deleteUser()
{
	var opts = pcrypt.getvalue('options');
	if(opts.disableuserdelete == false)
	{
		if(loader())
			return;

		if(!validlogin())
		{
			modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
			return;
		}

		modalprompt(g.lang.default.PCPASSWORDSCONFIRMPASSWORDTEXT, g.lang.default.PCPROGRAMTITLE, 'PASSWORD', "", 64, null, function (pass)
		{
			if(pass != false)
			{
				var keys = pcrypt.generatekeys(pass, pcrypt.getvalue('saltcrypt'));

				if(keys.aes !== pcrypt.getvalue('keycrypt'))
				{
					modalalert(g.lang.default.PCPASSWORDSWRONGPASSWORD, g.lang.default.PCPROGRAMTITLE);
					return;
				}

				loader(true);

				//var replyurl = window.location.protocol + '//' + window.location.host + removefilefrompath(window.location.pathname) + '/accountconfirm.php';

				var langcode = pcrypt.getvalue('languagecode', false) || 'en';

				pcrypt_delete(pcrypt.getvalue('session'), langcode, 0, function deleteuserfunc(data, error, id)
				{
					if(error)
					{
						handlepcrypterror(error, data);
						return;
					}

					loader(false);

					modalalert(g.lang.accountjs.PCACCOUNTDELETED, g.lang.default.PCPROGRAMTITLE, function modalalertreturn(value)
					{
						window.location.assign(pcrypt.getvalue('pcrypttimeouturl'));
					});
				});
			}
		});
	}
}

function updateInfo()
{
	if(loader())
		return;

	if(!validlogin())
	{
		modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
		return;
	}

	loader(true);

  //var name = htmlspecialchars(pcrypt.utf8encode(document.getElementById('accountteamname').value), ['ENT_QUOTES']);
  //var department = htmlspecialchars(pcrypt.utf8encode(document.getElementById('accountteamdepartment').value), ['ENT_QUOTES']);
  var name = pcrypt.utf8encode(document.getElementById('accountteamname').value);
  var department = pcrypt.utf8encode(document.getElementById('accountteamdepartment').value);
  var avatarImgElm = document.getElementById('accountteamavatar');

  if(avatarImgElm == null)
  {
    console.log('Avatar img id not found');
    loader(false);
    return;
  }

  var avatarImgType = avatarImgElm.getAttribute('data-filetype');
  var avatarImgDefault = pcrypt.getvalue('useravatardefault');
  var avatarImg = null;
  
  if(avatarImgType) // We have a newpicture
  {
    avatarImg = avatarImgElm.getAttribute('src');
    avatarImg = avatarImg.substring(avatarImg.indexOf(',') + 1); // remove the html related stuff from string
    pcrypt.setvalue('useravatardefault', false);
  }
  else if(avatarImgDefault == false)
  {
    avatarImg = pcrypt.getvalue('useravatar');
  }


  // TODO - support this format? {info: 'pcrypt', type: type, ver: 1, enc: 'base64', data: }
  pcrypt_updateinfo(pcrypt.getvalue('session'), name, department, avatarImg, 0, function updateuserfunc(data, error, id)
  {
    if(error)
    switch(error)
    {
	    case 31:
		    modalalert(g.lang.accountjs.PCACCOUNTIMAGEERROR, g.lang.default.PCPROGRAMTITLE);
	    return;

	    default:
		    handlepcrypterror(error, data);
	    return;
    }

    pcrypt.setvalue('useravatar', data);


    loader(false);

    modalalert(g.lang.accountjs.PCACCOUNTUPDATEDINFO, g.lang.default.PCPROGRAMTITLE, function modalalertreturn(value)
    {
      pcrypt.setvalue('username', name);
      pcrypt.setvalue('userdepartment', department);

      //$(".contentmenustylecurrent").attr('class', 'contentmenustyle');
      $('ul.navigation li a').removeClass('on');
      $(".globalhide").hide();
      $("#divdefault").show();
    });
  });
}

function updateId()
{
	if(loader())
		return;

	if(!validlogin())
	{
		modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
		return;
	}

	if(!checkAll(true, false))
		return;

  modalprompt(g.lang.default.PCPASSWORDSCONFIRMPASSWORDTEXT, g.lang.default.PCPROGRAMTITLE, 'PASSWORD', "", 64, null, function (pass)
  {
    if(pass != false)
    {
      var keys = pcrypt.generatekeys(pass, pcrypt.getvalue('saltcrypt'));

			if(keys.aes !== pcrypt.getvalue('keycrypt'))
			{
				modalalert(g.lang.default.PCPASSWORDSWRONGPASSWORD, g.lang.default.PCPROGRAMTITLE);
				return;
			}

			loader(true);

	    var email = pcrypt.utf8encode(document.getElementById('newemail').value);
	    var srpclient = new SRP6JavascriptClientSessionSHA256();
      var srpverifier = srpclient.generateVerifier(pcrypt.getvalue('srpsalt'), email.toLowerCase(), keys.srp);

	    //var replyurl = window.location.protocol + '//' + window.location.host + removefilefrompath(window.location.pathname) + '/accountconfirm.php';
	    var langcode = pcrypt.getvalue('languagecode', false) || 'en';

	    pcrypt_updateid(pcrypt.getvalue('session'), srpverifier, email, langcode, 0, function updateuserfunc(data, error, id)
	    {
		    if(error)
		    switch(error)
		    {
			    case 6:
				    modalalert(g.lang.accountjs.PCACCOUNTUSEREXIST, g.lang.default.PCPROGRAMTITLE);
			    return;

			    default:
				    handlepcrypterror(error, data);
			    return;
		    }

		    loader(false);

		    modalalert(g.lang.accountjs.PCACCOUNTUPDATED, g.lang.default.PCPROGRAMTITLE, function modalalertreturn(value)
        {
          //$(".contentmenustylecurrent").attr('class', 'contentmenustyle');
          $('ul.navigation li a').removeClass('on');
          $(".globalhide").hide();
          $("#divdefault").show();
        });
	    });
		}
	});
}

addEventListener('message', function newkeyeventlistener(event) 
{
	//console.log(event.origin);

	switch(event.data.method)
	{
		case 'startupdatekeybinary_response':
			pcrypt.setvalue('newkeycrypt', event.data.newkeycrypt);
			pcrypt.setvalue('newkeycryptfilesinfo', event.data.filesinfo);
		
		case 'nextupdatekeybinary_response':
			let filesinfo = pcrypt.getvalue('newkeycryptfilesinfo');

			if(!filesinfo)
				alert('No filesinfo in file new key');

			if(filesinfo.length == 0) // We are done
			{
				loader(false);

				modalalert(g.lang.accountjs.PCACCOUNTKEYUPDATED, g.lang.default.PCPROGRAMTITLE, function modalalertreturn(value)
				{
					pcrypt.deletevalue('session'); // TODO - Not nice way but system may set values with old password during logout
					window.location.assign(pcrypt.getvalue('pcrypttimeouturl'));
				});

				return;
			}
			
			console.log('Processing file: ' + filesinfo.length);
			let filename = filesinfo[0].name;
			filesinfo.shift(); // remove the first element
			pcrypt.setvalue('newkeycryptfilesinfo', filesinfo);

      pcrypt_getbinary(pcrypt.getvalue('session'), filename, 0, function newkeycryptgetfilecallback(data, error, id)
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
				
				pcrypt.workercall({method: 'decrypt', id: 'updatekeybinarydecrypt', param: Object.keys(data), filedata: Object.values(data), keydata: pcrypt.getvalue('keycrypt')});
			});

		break;
	}
},false);

function updateKeyCheck()
{
  if(loader())
		return;

	if(!validlogin())
	{
		modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
		return;
	}

	if(!checkAll(false, true))
		return;

	// Get new password
	var newpwdfield = document.getElementById("newpassword");
	var newpwd = pcrypt.utf8encode(newpwdfield.value);

	if(passwordstrength(newpwd) !== 3)
	{
		modalconfirm(g.lang.default.PCWEAKPASSWORDSELECTED, g.lang.default.PCPROGRAMTITLE, function (result)
		{
		  if(!result)
		    return;

		  updateKey(newpwd);
		});
	}
	else
	{
	  updateKey(newpwd);
	}

	//newpwdfield.value = '';
	passwordstrength('', newpwdfield);
}

function updateKey(newpwd)
{
	function updatekeyerrorcheckfunc(data, error, id)
	{
		if(error)
		{
			handlepcrypterror(error, data);
			return;
		}
	};

	var asynckey_onerror = function(data, error, id)
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
	};

	/**
	 * Asynchronus on success
	 *
	 * @param {*} varobj
	 */
	var asynckey_onsuccess = function(varobj)
	{
		var passdata = [];
		var groupsdata = [];
		var filesinfo = [];

		passdata = varobj['pass'];
		groupsdata = varobj['groups'];
		filesinfo = varobj['files'];

		if(!passdata || (passdata.length == 0))
			passdata = [];

		if(!groupsdata || (groupsdata.length == 0))
			groupsdata = [];

		if(!filesinfo || (filesinfo.length == 0))
			filesinfo = [];

		var session = pcrypt.getvalue('session');

		// Generate new keys
		var newkeys = pcrypt.generatekeys(newpwd, pcrypt.getvalue('saltcrypt'));

		// generate new verifier
		var srpclient = new SRP6JavascriptClientSessionSHA256();
		var srpverifier = srpclient.generateVerifier(pcrypt.getvalue('srpsalt'), pcrypt.getvalue('email'), newkeys.srp);

		// get and encrypt private keys
		var privatekeyobj = pcrypt.getvalue('privatekey'); // private asym keys are decrypted with symetric key at logon

		var keyprivatedhenc = pcrypt.encryptstring(newkeys.aes, privatekeyobj.ecdh.data);
		var keyprivatesigenc = pcrypt.encryptstring(newkeys.aes, privatekeyobj.ecdsa.data);

		var keyprivate = pcrypt.encodeasymetrickeys('private', 'pcrypt', privatekeyobj.ecdh.curve, keyprivatedhenc, privatekeyobj.ecdsa.curve, keyprivatesigenc);

		pcrypt_updatekey(session, srpverifier, keyprivate, 0, function updatekeyfunc(data, error, id)
		{
			if(error)
			{
				handlepcrypterror(error, data);
				return;
			}

			pcrypt.setdata(session, newkeys.aes, 'passwords', passdata, true, 0, updatekeyerrorcheckfunc);
			pcrypt.setdata(session, newkeys.aes, 'groups', groupsdata, true, 0, updatekeyerrorcheckfunc);

			// Just delete these values (or we will get an exception on login when it is unable to decode)
			pcrypt.setdata(session, newkeys.aes, 'setting.gidshown', null, false, 0, updatekeyerrorcheckfunc);
			pcrypt.setdata(session, newkeys.aes, 'setting.tidshown', null, false, 0, updatekeyerrorcheckfunc);
			pcrypt.setdata(session, newkeys.aes, 'lastshares', pcrypt.getvalue('lastshareslocal'), false, 0, updatekeyerrorcheckfunc);

			// Now we have to get/decrypt/encrypt/store all files one by one (to limit resource draw)
			postMessage({method: 'startupdatekeybinary_response', newkeycrypt: newkeys.aes, filesinfo: filesinfo});
      
      // If an emergency is setup, reincrypt it with the new private key.
      if(pcrypt.getvalue('options').enableemergencymail)
      {
        pcrypt.emergencykeyupdate(pcrypt.getvalue('session'), 0, function (data, error, id) 
        {
          if(error)
          {
            handlepcrypterror(error, data);
            return;
          }
  
          if(data && typeof data === 'string')
          {
            var privatekey = pcrypt.getvalue('privatekey');
            var publickey  = pcrypt.decodeasymetrickeys(data);
            var sharedkey  = pcrypt.getsharedsecret(privatekey, publickey);
            var encpass    = pcrypt.encryptdata(sharedkey, newpwd, false);
            pcrypt.setemergencydata(pcrypt.getvalue('session'), encpass, 0, function(data, error, id)
            {
              if(error)
              {
                handlepcrypterror(error, data);
                return;
              }
            });
          }
        });
      }
		});
	};

	modalprompt(g.lang.default.PCPASSWORDSCONFIRMPASSWORDTEXT, g.lang.default.PCPROGRAMTITLE, 'PASSWORD', '', 64, null, function (pass)
  {
		if(pass == false)
			return;

		var keys = pcrypt.generatekeys(pcrypt.utf8encode(pass), pcrypt.getvalue('saltcrypt'));

		if(keys.aes !== pcrypt.getvalue('keycrypt'))
		{
			modalalert(g.lang.default.PCPASSWORDSWRONGPASSWORD, g.lang.default.PCPROGRAMTITLE);
			return;
		}

		loader(true);

		var keyasync = new pcrypt_async(3);

		keyasync.onsuccess = asynckey_onsuccess;
		keyasync.onerror = asynckey_onerror;

		var session = pcrypt.getvalue('session');
		var keycrypt = pcrypt.getvalue('keycrypt');

		pcrypt.getdata(session, false, keycrypt, 'passwords', 'pass', keyasync.callback);
		pcrypt.getdata(session, false, keycrypt, 'groups', 'groups', keyasync.callback);
		pcrypt_getbinaryinfo(session, 'files', keyasync.callback);

  });
}

function translatebackupname(name)
{
  switch(name)
  {
    default:
    return name;

    case 'groups':
    return g.lang.accountjs.PCACCOUNTBACKUPNAMEGROUPS;

    case 'passwords':
    return g.lang.accountjs.PCACCOUNTBACKUPNAMEPASSWORDS;
  }
}

function showrestore()
{
  if(!validlogin())
  {
    modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
    return;
  }

  //$(".contentmenustylecurrent").attr('class', 'contentmenustyle');
  //$("#restore").attr('class', 'contentmenustylecurrent');

  $(".globalhide").hide();

  if(loader())
    return;

  loader(true);

  pcrypt_getlist(pcrypt.getvalue('session'), true, 0, function getlistfunc(data, error, id)
  {
    if(error)
    {
      handlepcrypterror(error, data);
      return;
    }

    if(!data || (data.length == 0))
      data = [];

    g.backupdata = data;

    var htmlarray = new Array(g.backupdata.length);

    // Add action button to data and change date format
    for (var i = 0, len_i = g.backupdata.length; i < len_i; ++i)
    {
      var htmlarrayrow = new Array(3);

      htmlarrayrow[0] = translatebackupname(g.backupdata[i].name);
      htmlarrayrow[1] = (new Date().setFromMysql(g.backupdata[i].cre)).format(g.lang.default.JS_DATETIMEFORMAT); // Change data format
      htmlarrayrow[2] = "<input id='restore" + i + "' name='" + i + "' title='" + g.lang.accountjs.PCACCOUNTBUTTONRESTOREHINT + "' type='button' class='icon_restore'>";

      htmlarray[i] = htmlarrayrow;
    }

    var tablearrayheader = [[g.lang.accountjs.PCACCOUNTBACKUPNAMELABEL, "style='text-align: left;'"], [g.lang.accountjs.PCACCOUNTBACKUPTIMELABEL, "style='text-align: left;'"], [g.lang.accountjs.PCACCOUNTACTIONLABEL, "style='width: 60px; text-align: center;'"]];

    document.getElementById('divrestore').innerHTML = buildtable(tablearrayheader, null, htmlarray, 'restoregrid', 'datarestore table-bordered table-max-width table-white', 'white-space: nowrap;');

    for (var i = 0, len_i = htmlarray.length; i < len_i; ++i)
    {
      document.getElementById('restore'+i).onclick = function (e) { restorefunc(e); };
    }

    loader(false);
    $("#divrestore").show();
  });
}

function restorefunc(e)
{
  var index = Number((e.srcElement||e.target).name);

  var timestamp = (new Date().setFromMysql(g.backupdata[index].cre)).format(g.lang.default.JS_DATETIMEFORMAT); // Change data format

  modalprompt(g.lang.accountjs.PCACCOUNTCONFIRMRESTORE + ": <b>" + translatebackupname(g.backupdata[index].name) + " (" + timestamp + ")</b>", g.lang.default.PCPROGRAMTITLE, 'PASSWORD', "", 64, null, function (pass)
  {
    if(pass != false)
    {
      var keys = pcrypt.generatekeys(pass, pcrypt.getvalue('saltcrypt'));

			if(keys.aes !== pcrypt.getvalue('keycrypt'))
			{
				modalalert(g.lang.default.PCPASSWORDSWRONGPASSWORD, g.lang.default.PCPROGRAMTITLE);
				return;
			}

			pcrypt_restoredata(pcrypt.getvalue('session'), g.backupdata[index].name, g.backupdata[index].cre, 0, function restoredatafunc(data, error, id)
      {
        if(error)
        {
          handlepcrypterror(error, data);
          return;
        }

        pcrypt.deletevalue(g.backupdata[index].name); // Force refresh of the data from the server

        modalalert(g.lang.accountjs.PCACCOUNTDATARESTORED, g.lang.default.PCPROGRAMTITLE);
      });
    }
  });

  return;

  modalconfirm(g.lang.accountjs.PCACCOUNTCONFIRMRESTORE + ": " + translatebackupname(g.backupdata[index].name) + " [" + timestamp + "]", g.lang.default.PCPROGRAMTITLE, function(r)
  {
    if(r)
    {
      pcrypt_restoredata(pcrypt.getvalue('session'), g.backupdata[index].name, g.backupdata[index].cre, 0, function restoredatafunc(data, error, id)
      {
        if(error)
        {
          handlepcrypterror(error, data);
          return;
        }

        pcrypt.deletevalue(g.backupdata[index].name); // Force refresh of the data from the server

        modalalert(g.lang.accountjs.PCACCOUNTDATARESTORED, g.lang.default.PCPROGRAMTITLE);
      });
    }
  });
}

function showEmergencySetup()
{
  var enableEmergencyMail = pcrypt.getvalue('options').enableemergencymail;
  
  if(!enableEmergencyMail)
  {
    return;
  }

  pcrypt.emergencycheckdata(pcrypt.getvalue('session'), 'test', 0, function (data, error, id)
  {
    if(error)
    {
      handlepcrypterror(error, data);
    }
    
    if(!Array.isArray(data))
    {
      return;
    }

    if(data && data.length>0)
    {
      if(data[0] && data[0].length)
      {

        var headerTo = [
          [g.lang.default.PCDEFAULTEMAIL],
          [g.lang.teamjs.PCTEAMSTATUSLABEL],
          [g.lang.passwordsjs.PCPASSWORDSCOLUMNACTION, "style='width: 60px; text-align: center;'"]
        ];
        
        var htmlarray = new Array(data[0].length);
        // Change date format
        for (var i = 0, len_i = data[0].length; i < len_i; ++i)
        {
          var htmlarrayrow = new Array(3);
          htmlarrayrow[0] = data[0][i].targetmail;
          htmlarrayrow[1] = Number(data[0][i].approved) === 1 ? g.lang.accountjs.PCACCOUNTJSEMERGENCYTEXTCONFY : g.lang.accountjs.PCACCOUNJSTEMERGENCYTEXTCONFN;
          htmlarrayrow[2] = Number(data[0][i].approved) === 1 ? '<input class="icon_delete" title="'+g.lang.accountjs.PCACCOUNTJSEMERGENCYBTNTERMINATE+'" id="terminate-emergency-'+i+'" type="button"></input>' :
          '<input class="icon_resend" title="' + g.lang.accountjs.PCACCOUNTJSEMERGENCYBTNRESEND + '" id="resend-setup-'+i+'" type="button"></input>'+
          '<input class="icon_delete" title="' + g.lang.accountjs.PCACCOUNTJSEMERGENCYBTNTERMINATE + '" id="terminate-emergency-'+i+'" type="button"></input>';
          
          htmlarray[i] = htmlarrayrow;
        }
        
        document.getElementById('emergency-to-container').innerHTML = buildtable(headerTo, null, htmlarray, 'emergency-to-table', 'table-bordered table-max-width table-white', 'white-space: nowrap;');

        htmlarray.forEach((element, index) => 
        {
          var resendBtn = document.getElementById('resend-setup-'+index);
          var terminateBtn = document.getElementById('terminate-emergency-'+index);
          if(resendBtn)
          {
            resendBtn.onclick = (event) => 
            {
              if(pcrypt.getvalue('premium') < 1)
              {
                modalPremiumRestriction();
                return;
              }

              loader(true);

              pcrypt.emergencysetupresend(pcrypt.getvalue('session'), index, pcrypt.getvalue('languagecode', false), 0, function (data, error, id) 
              {
                loader(false);
                if(error)
                {
                  handlepcrypterror(error, data);
                  return;
                }
                else
                {
                  modalalert(g.lang.accountjs.PCACCOUNTEMERGENCYMODALRESEND, g.lang.default.PCPROGRAMTITLE);
                  showEmergencySetup();
                }
              });
            }
          }
          
          if(terminateBtn)
          {
            terminateBtn.onclick = (event) => 
            {
              loader(true);
  
              pcrypt.deleteemergency(pcrypt.getvalue('session'), index, localStorage.getItem('languagecode'), 0, function(data, error, id)
              {
                loader(false);
                if(error)
                {
                  handlepcrypterror(error, data);
                  return;
                }
  
                if(data)
                {
                  modalalert(g.lang.accountjs.PCACCOUNTEMERGENCYMODALTERMINATE, g.lang.default.PCPROGRAMTITLE);
                  
                  showEmergencySetup();
                }
              });
            }
          }
        });
        $('#emergencymail-to').show();
      }
      else
      {
        $('#emergencymail-to').hide();
      }
      
      if(data[1] && data[1].length > 0)
      {

        var headerFrom = [
          [g.lang.default.PCDEFAULTEMAIL],
          [g.lang.teamjs.PCTEAMSTATUSLABEL],
          [g.lang.passwordsjs.PCPASSWORDSCOLUMNACTION, "style='width: 60px; text-align: center;'"]
        ];
        
        var htmlarray = new Array(data[1].length);
        
        for (var i = 0, len_i = data[1].length; i < len_i; ++i)
        {
          var htmlarrayrow = new Array(2);

          htmlarrayrow[0] = data[1][i].email;
          htmlarrayrow[1] = data[1][i].authorized > 0 ? "Authorized." : "Not authorized.";
          htmlarrayrow[2] = data[1][i].authorized > 0 ?'<button class="btn btn-info btn-emergency" id="access-emergency-'+i+'"><span>' + g.lang.accountjs.PCACCOUNTEMERGENCYBTNACCESS + '</span></button>'
                                                      : '<button class="btn btn-info btn-emergency" id="request-emergency-access-'+i+'"><span>' + g.lang.accountjs.PCACCOUNTEMERGENCYBTNREQUEST + '</span></button>';
          htmlarray[i] = htmlarrayrow;
        }

        document.getElementById('emergency-from-container').innerHTML = buildtable(headerFrom, null, htmlarray, 'emergency-to-table', 'table-bordered table-max-width table-white', 'white-space: nowrap;');

        htmlarray.forEach((element, index) => 
        {
          var requestAccessBtn = document.getElementById('request-emergency-access-'+index);
          var accessEmergencyBtn = document.getElementById('access-emergency-'+index);
          if(requestAccessBtn)
          {
            requestAccessBtn.onclick = (event) => 
            {
              loader(true);
              event.preventDefault();
              
              pcrypt.requestemergencyaccess(pcrypt.getvalue('session'), index, pcrypt.getvalue('languagecode', false), 0, function(data, error, id)
              {
                loader(false);
                
                if(error)
                {
                  handlepcrypterror(error, data);
                  return;
                }
  
                if(data)
                {
                  modalalert(g.lang.accountjs.PCACCOUNTEMERGENCYMODALREQUEST, g.lang.default.PCPROGRAMTITLE);
                }
              });
            };
          }
          
          if(accessEmergencyBtn)
          {
            accessEmergencyBtn.addEventListener('click', function(e)
            {
              loader(true);
              e.preventDefault();
              
              pcrypt.getemergencydata(pcrypt.getvalue('session'), index, 0, function (data, error, id)
              {
                loader(false);
                
                if(error)
                {
                  switch (error) 
                  {
                    case 34:
                    case 35:
                      modalalert(g.lang.accountjs.PCACCOUNTEMERGENCYMODALDENIED, g.lang.default.PCPROGRAMTITLE);
                      return;
                    default:
                      handlepcrypterror(error, data);
                      return;
                  }
                }
                
                if(data)
                {
                  var privatekey = pcrypt.getvalue('privatekey');
                  var publickey  = pcrypt.decodeasymetrickeys(data.key);
                  var sharedsecret = pcrypt.getsharedsecret(privatekey, publickey);
                  var mpass = pcrypt.decryptdata(sharedsecret, data.mpass);
                  
                  modalalert(g.lang.accountjs.PCACCOUNTEMERGENCYMODALACCESSED + " " + mpass, g.lang.default.PCPROGRAMTITLE);
                }
              });
            });
          }
        });

        $('#emergencymail-from').show();
      }
      $('#divemergencysetup').show();
    }
    $('.globalhide').not('#divemergencysetup').hide();
    loader(false);
  });
}

function hidePremiumElements()
{
  $('#total-payment-info').hide();
  $('#choose-period-radios').hide();
  $('#table-premium-users').hide();
  //$('.pricing-list').hide();
}

function showpremium()
{
	if(pcrypt.getvalue('options').globalpremium === true)
	{
		return;
	}

  if(!validlogin())
  {
    modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
    return;
  }

  $(".globalhide").hide();
  //$('#subscriptions-wrapper').hide();
  hidePremiumElements();

  loader(true);

  var scriptEls = document.getElementsByTagName( 'script' );
  var thisScriptEl = scriptEls[scriptEls.length - 1];
  var scriptFolder = thisScriptEl.src.substr(0, thisScriptEl.src.lastIndexOf( '/' ) + 1 );

  // Get JSON countries file
  var xhrcountryjson = new XMLHttpRequest();
  xhrcountryjson.overrideMimeType("application/json");
  xhrcountryjson.open('GET', scriptFolder + 'countries.js.json', true);
  xhrcountryjson.onreadystatechange = function()
  {
    try
    {
      if (xhrcountryjson.readyState == 4 && xhrcountryjson.status == "200")
      {
        g.countrylist = JSON.parse(xhrcountryjson.responseText);
        setpremiumcountryselect('premium-country');
        setpremiumcountryselect('premium-edit-country');
        //setteamcountryselect(); // Set it ones here
      }
    }
    catch (err)
    {
      console.log("Unable to parse countries.json");
    }
  };
  xhrcountryjson.send(null);

  $("#divpremium").show();
  loader(false);
}

const showtoggleExtension2fa = () => 
{
  if(loader())
    return;

  loader(true);
  pcrypt.getextension2fastate(pcrypt.getvalue('session'), 0, (data, error, id) => 
  {
    if(error)
    {
      handlepcrypterror(error, data);
      return;
    }

    console.log(data);
    if(!validlogin())
    {
      modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
      return;
    }
  
    $(".globalhide").hide();
    $("#divtoggleext2fa").show();

    document.getElementById('PCACCOUNTTOGGLEEXT2FASTATE').innerHTML = (data > 0) ? 
      g.lang.accountjs.PCACCOUNTTOGGLEEXT2FASTATE.replace('[ext2fastate]', '<b>'+g.lang.accountjs.PCACCOUNTEXT2FAENABLED+'</b>,') : 
      g.lang.accountjs.PCACCOUNTTOGGLEEXT2FASTATE.replace('[ext2fastate]', '<b>'+g.lang.accountjs.PCACCOUNTEXT2FADISABLED+'</b>,');
    
      loader(false);
  });
};


function showlog()
{
  if(!validlogin())
  {
    modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
    return;
  }

  $(".globalhide").hide();
  $(".menulog").show();

  if(loader())
    return;

  loader(true);

  pcrypt_getlog(pcrypt.getvalue('session'), 30, null, 0, function getlogfunc(data, error, id)
  {
    if(error)
    {
      handlepcrypterror(error, data);
      return;
    }

    if(!data || (data.length == 0))
      data = [];

    var htmlarray = new Array(data.length);

    // Change date format
    for (var i = 0, len_i = data.length; i < len_i; ++i)
    {
      var htmlarrayrow = new Array(3);

      htmlarrayrow[0] = (new Date().setFromMysql(data[i].cre)).format(g.lang.default.JS_DATETIMEFORMAT); // Change data format
      htmlarrayrow[1] = data[i].ip;
      htmlarrayrow[2] = htmlspecialchars(data[i].txt, ['ENT_QUOTES']);

      htmlarray[i] = htmlarrayrow;
    }

    var tablearrayheader = [[g.lang.accountjs.PCACCOUNTLOGHEADERTIME, "style='text-align: left;'"], [g.lang.accountjs.PCACCOUNTLOGHEADERIP, "style='text-align: left;'"], [g.lang.accountjs.PCACCOUNTLOGHEADERACTIVITY, "style='text-align: left;'"]];

    document.getElementById('divlog').innerHTML = buildtable(tablearrayheader, null, htmlarray, 'loggrid', 'table-bordered table-max-width table-white', 'white-space: nowrap;');

    g.logshown = data.length;

    searchlog();

    loader(false);
    $("#divlog").show();
  });
}

function searchlog()
{
  if ($('#searchmemberlog').is(':visible'))
  {
    var shownrecords = tablesearch(document.getElementById('loggrid'), null, document.getElementById('searchmemberlog').value);
    //document.getElementById('statustext').innerHTML = g.lang.passwordsjs.PCPASSWORDSRECORDCOUNTTEXT + ": " + shownrecords + '/' + g.logshown;
    }
}

function randombase32string(length)
{
	var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

	var randomseeds = pcrypt_randombytes(length);
	var randomarray = [];

	for (var i = 0; i < randomseeds.length; i++)
	{
		var stringindex = Math.floor((randomseeds.charCodeAt(i) / (256)) * chars.length);
		randomarray[i] = chars.charAt(stringindex);
	}
	return randomarray.join('');
}

function showtotpsecurity()
{
  if(!validlogin())
  {
    modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
    return;
  }

  //$(".contentmenustylecurrent").attr('class', 'contentmenustyle');
  //$("#totpsecurity").attr('class', 'contentmenustylecurrent');

  var totpsecurity = pcrypt.getvalue('totpsecurity');

  if(totpsecurity)
  {
    $(".globalhide").hide();
    $("#divtotpsecurityremove").show();
    document.getElementById('autcoderemove').focus();
  }
  else
  {
    var key = randombase32string(16);

    document.getElementById('autkey').value = key;
    document.getElementById('autcode').value = "";

    g.qrcode.makeCode("otpauth://totp/PasswordCrypt?secret=" + key);

    $(".globalhide").hide();
    $("#divtotpsecurityremove").hide();
    $("#divtotpsecurity").show();
    document.getElementById('autcode').focus();
  }
}

function totpsecurityUser(enable)
{
  if(!validlogin())
  {
    modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
    return;
  }

  var newsecurity = enable; // Needed for inner callback
  var PCACCOUNTSECURITYERROR = false;

  if(enable)
    var code = document.getElementById('autcode');
  else
    var code = document.getElementById('autcoderemove');

	if ((code.value.length != 6) || (isNaN(code.value)))
	{
    code.focus();
		modalalert(g.lang.accountjs.PCACCOUNTINVALIDAUTHCODE, g.lang.default.PCPROGRAMTITLE);
		return false;
	}

	if(loader())
    return;

  loader(true);

  var key = false;

  if(enable)
    key = document.getElementById('autkey').value;

	pcrypt_totpsecurity(pcrypt.getvalue('session'), key, code.value, 0, function totpsecurityfunc(data, error, id)
  {
    if(error)
    {
      handlepcrypterror(error, data);
      return;
    }

    loader(false);

    var modaltext;

    if(data)
    {
      pcrypt.setvalue('totpsecurity', newsecurity);

      if(newsecurity)
      {
        modaltext = g.lang.accountjs.PCACCOUNTSECURITYADDED;
      }
      else
      {
        modaltext = g.lang.accountjs.PCACCOUNTSECURITYREMOVED;
      }
    }
    else
    {
      modaltext = g.lang.accountjs.PCACCOUNTSECURITYERROR;
      error = true;
    }

    modalalert(modaltext, g.lang.default.PCPROGRAMTITLE, function modalalertreturn(value)
  	{
  		//$(".contentmenustylecurrent").attr('class', 'contentmenustyle');
  		//$(".globalhide").hide();
    	//$("#divdefault").show();
      if(!error)
      {
        if(enable)
        {
        	$("#divtotpsecurity").hide();
        	$("#divtotpsecurityremove").show();
        }
        else
        {
        	showtotpsecurity();
        }
      }
  	});
  });

}

function showbrowsersecurity()
{
  if(!validlogin())
  {
    modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
    return;
  }

  var browsersecurity = pcrypt.getvalue('notificationsecurity');

  if(browsersecurity)
  {
    $(".globalhide").hide();
    $("#divbrowsersecurityremove").show();
    //document.getElementById('autcoderemove').focus();
  }
  else
  {
    $(".globalhide").hide();
    $("#divbrowsersecurity").show();
    //document.getElementById('autcode').focus();
  }
}

function showsessionsecurity()
{
  if(!validlogin())
  {
    modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
    return;
  }

  var sessionsecurity = pcrypt.getvalue('sessionsecurity');

  if(sessionsecurity)
  {
    $(".globalhide").hide();
    $("#divsessionsecurityremove").show();
    //document.getElementById('autcoderemove').focus();
  }
  else
  {
    $(".globalhide").hide();
    $("#divsessionsecurity").show();
    //document.getElementById('autcode').focus();
  }
}

function browsersecurityUser(enable)
{
	if(!validlogin())
	{
		modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
		return;
	}

	var langcode;
	var newsecurity = enable; // Needed for inner callback

/*
  if(enable)
		langcode = pcrypt.getvalue('languagecode', false) || 'en';
	else
		langcode = false;
*/
	if(loader())
    return;

  loader(true);

	pcrypt_notificationsecurity(pcrypt.getvalue('session'), newsecurity, 0, function notificationsecurityfunc(data, error, id)
  {
    if(error)
    {
      handlepcrypterror(error, data);
      return;
    }

    loader(false);


    // Set language to make sure it is set correctly
    pcrypt_setemaillanguage(pcrypt.getvalue('session'), pcrypt.getvalue('languagecode', false));

    var modaltext;

    pcrypt.setvalue('notificationsecurity', newsecurity);

	if(newsecurity)
	{
	   modaltext = g.lang.accountjs.PCACCOUNTBROWSERSECURITYADDED;
	}
	else
	{
	   modaltext = g.lang.accountjs.PCACCOUNTBROWSERSECURITYREMOVED;
	}

    modalalert(modaltext, g.lang.default.PCPROGRAMTITLE, function modalalertreturn(value)
	  {
      if (enable) {
        $("#divbrowsersecurity").hide();
        $("#divbrowsersecurityremove").show();
      }
      else {
        $("#divbrowsersecurityremove").hide();
        $("#divbrowsersecurity").show();
      }
	  });
  });
}

function sessionsecurityUser(enable)
{
	if(!validlogin())
	{
		modalalert(g.lang.accountjs.PCACCOUNTLOGINNEEDED, g.lang.default.PCPROGRAMTITLE);
		return;
	}

	var newsecurity = enable; // Needed for inner callback

	if(loader())
    return;

  loader(true);

  pcrypt_sessionsecurity(pcrypt.getvalue('session'), enable, 0, function notificationsecurityfunc(data, error, id)
  {
    if(error)
    {
      handlepcrypterror(error, data);
      return;
    }

    loader(false);

    var modaltext;

    pcrypt.setvalue('sessionsecurity', newsecurity);

    if(newsecurity)
    {
       modaltext = g.lang.accountjs.PCACCOUNTSESSIONSECURITYADDED;
    }
    else
    {
       modaltext = g.lang.accountjs.PCACCOUNTSESSIONSECURITYREMOVED;
    }
    modalalert(modaltext, g.lang.default.PCPROGRAMTITLE, function modalalertreturn(value)
    {
      if (enable) {
        $("#divsessionsecurity").hide();
        $("#divsessionsecurityremove").show();
      }
      else
      {
        $("#divsessionsecurityremove").hide();
        $("#divsessionsecurity").show();
      }
    });
  });
}

function setpremiumcountryselect(selectid)
{
  if(g.countrylist == null)
  {
    alert("Country list is not available");
    return;
  }

  var selelement = document.getElementById(selectid);
  var selected, country, itemname;
  var op = new Option("", "", true, true);
  selelement.options[selelement.options.length] = op;

  //for (prop in g.countrylist.countries)
  for(var i = 0, i_len = g.countrylist.countries.length ; i < i_len ; i++)
  {
    country = g.countrylist.countries[i];
    let itemname;

    if(country.name == country.native)
      itemname = country.name;
    else
      itemname = country.name + ' (' + country.native + ')';

    let selected = country.code == 'DK' ? true : false;
    op = new Option(itemname, country.code, selected, selected);
    selelement.options[selelement.options.length] = op;
  }
}

function submitInNewWindow() 
{
	$('#yourpay-form').attr('target', g.paymentWindow);
	$('#yourpay-form').submit();
	document.getElementById('divpremium').innerHTML = g.lang.premium.PCPREMIUMTHANKSAFTERSUBMIT;
}

function closeOpenedWindow()
{
	if(g.openedwindow)
  {
    g.openedwindow.close();
  }
}

function setPremium(showPremiumBar, reload) 
{
  pcrypt.setvalue('premium', 1);
  if (!showPremiumBar) 
  {
	  $( '#header_premium_bar' ).hide();
  }

  pcrypt_updatepremium(pcrypt.getvalue('session'), 0, function checkpremiumfunction(data, error, id)
  {
    if(error)
    {
      handlepcrypterror(error, data);
      return;
    }

    if(reload)
    {
      closeOpenedWindow();
      window.location.reload(true);
    }
  });
}
