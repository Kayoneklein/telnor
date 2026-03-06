"use strict";
var g = {}; // Global name space
g.lang = null;

jQuery(window).load(function() // Start of logic
{
  getlanguage(false, function(language)
  {
    if(!language)
    {
      alert('Unable to load language text.');
      return;
    }

    g.lang = language;
    console.log(g.lang);
    setdomlanguage(g.lang, 'premium', false);
  });

});