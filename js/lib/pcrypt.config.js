/*
  !!!!WARNING!!!!!!!
  All these settings may be overwritten during synchronization,
  so if you need to make changes which will be permanent on
  your server, then copy/paste the needed setting value into
  the corresponding part of pcrypt.config.loc.js
  !!!!WARNING!!!!!!!
*/
/*

    pcrypt - Javascript encryption for privacy and security in cloud computing
    Copyright (C) 2010 Benny Nissen.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

"use strict";

var pcrypt = {}; // Namespace

pcrypt.version = '1.11.0';
pcrypt.debug = false;

pcrypt.method = 'POST'; // Method to communicate with for the API
pcrypt.urlscript = 'lib/pcrypt.php'; // Server script to communicate with for the API
pcrypt.urlscriptsse = 'lib/pushshares.php'; // Server SSE script to communicate with for the API

//###begin_hidden###
pcrypt.urldomain = 'https://pcrypt.org'; // Server to communicate with for the API (DO NOT CHANGE THIS HERE)
pcrypt.urlpath = '/'; // Server path to communicate with for the API (DO NOT CHANGE THIS HERE)

pcrypt.url = pcrypt.urldomain + pcrypt.urlpath + pcrypt.urlscript; // Server script to communicate with for the API
pcrypt.urlsse = pcrypt.urldomain + pcrypt.urlpath + pcrypt.urlscriptsse; // SSE script to communicate with for the API
//###end_hidden###


pcrypt.passwordminimumlength = 8;
pcrypt.passwordgoodqualityscore = 80;
pcrypt.passwordonlyallowgoodquality = false;
pcrypt.randomidlength = 22; // For file labels and array ID's
pcrypt.keylength = 32; // Symetric encryption (fixed size)
pcrypt.redirectoncreation = false; //
pcrypt.disableextensionalert = false; // Disable prompt for install of extension

if (typeof premRes === 'undefined') {
    var premRes = {} // Namespace for premium restriction.
}

premRes.posMax = 9; // Maximum positions a premium user can attatch to a password.
premRes.posMaxFree = 1; // Maximum positions a free user can attatch to a password.
premRes.fileMax = 3; // Maximum files a premium user can attatch to a password.
premRes.fileMaxTotalFree = 3; // Maximum files in total a free user is allowed to have. NOTE: no limit for premium users.
premRes.filePerPassFree = 1; // Number of files a free user is allowed to attatch to a password.
premRes.filesizemax = 10485760; // Maximum file size for uploads in bytes (please also check PHP and DB settings).
premRes.filesizemaxFree = 1048576; // Maximum file size for uploads in bytes for FREE users.
premRes.tagsMaxFree = 3; // Max tags a free user can have.
premRes.teamsMaxFree = 1; // Max team(s) a free user can have.
premRes.passFocused = 0; // Variable to get the index in the g.pass[i] when clicking edit file.

if (typeof jserror === 'undefined') {
    var jserror = {}; // Namespace
}

jserror.urlpath = '/lib/jserror/'; // Server path to communicate with for the API
jserror.urlscript = 'jserror.php'; // Server script to communicate with for the API

//###begin_hidden###
//jserror.urldomain = 'https://pcrypt.org'; // Server to communicate with for the API
jserror.urldomain = 'https://beast.dk/passdev_ibay'; // Server to communicate with for the API
jserror.url = jserror.urldomain + jserror.urlpath + jserror.urlscript; // Server script to communicate with for the API
//###end_hidden###


if (typeof jslang === 'undefined') {
    var jslang = {}; // Namespace
}

jslang.urlpath = '/lib/lang/'; // Server path to communicate with for the API
jslang.urlscript = 'languagedb.php'; // Server script to communicate with for the API

//###begin_hidden###
//jslang.urldomain = 'https://pcrypt.org'; // Server to communicate with for the API
jslang.urldomain = 'http://pcrypt.devel'; // Server to communicate with for the API
jslang.url = jslang.urldomain + jslang.urlpath + jslang.urlscript; // Server script to communicate with for the API
//###end_hidden###


if (typeof jspremium === 'undefined') {
    var jspremium = {}; // Namespace
}

jspremium.urlpath = '/lib/premium/'; // Server path to communicate with for the API
jspremium.urlscript = 'premium.php'; // Server script to communicate with for the API

//###begin_hidden###
//jspremium.urldomain = 'https://pcrypt.org'; // Server to communicate with for the API
jspremium.urldomain = 'https://beast.dk/passdev_ibay'; // Server to communicate with for the API
jspremium.url = jspremium.urldomain + jspremium.urlpath + jspremium.urlscript; // Server script to communicate with for the API
//###end_hidden###
/*
// Developers message
if (pcrypt.debug === false && window && window.console && window.console.log) 
{
    window.console.log('Like playing around in the console? Why not help us build a more secure system? - https://pcrypt.com');
}
*/
