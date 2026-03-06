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

pcrypt.urldomain = 'https://beast.dk'; // Server to communicate with for the API
pcrypt.urlpath = '/passdev_ibay/'; // Server path to communicate with for the API

pcrypt.url = pcrypt.urldomain + pcrypt.urlpath + pcrypt.urlscript; // Server script to communicate with for the API
pcrypt.urlsse = pcrypt.urldomain + pcrypt.urlpath + pcrypt.urlscriptsse; // SSE script to communicate with for the API

pcrypt.debug = false;



jserror.urldomain = 'https://beast.dk/passdev_ibay'; // Server to communicate with for the API
jserror.url = jserror.urldomain + jserror.urlpath + jserror.urlscript; // Server script to communicate with for the API

jslang.urldomain = 'http://pcrypt.devel'; // Server to communicate with for the API
jslang.url = jslang.urldomain + jslang.urlpath + jslang.urlscript; // Server script to communicate with for the API

jspremium.urldomain = 'https://beast.dk/passdev_ibay'; // Server to communicate with for the API

jspremium.url = jspremium.urldomain + jspremium.urlpath + jspremium.urlscript; // Server script to communicate with for the API




pcrypt.passwordminimumlength = 12;
pcrypt.passwordgoodqualityscore = 80;
pcrypt.passwordonlyallowgoodquality = false;
pcrypt.randomidlength = 22; // For file labels


premRes.posMax = 9; // Maximum positions a premium user can attatch to a password.
premRes.posMaxFree = 1; // Maximum positions a free user can attatch to a password.
premRes.fileMax = 3; // Maximum files a premium user can attatch to a password.
premRes.fileMaxTotalFree = 3; // Maximum files in total a free user is allowed to have. NOTE: no limit for premium users.
premRes.filePerPassFree = 1; // Number of files a free user is allowed to attatch to a password.
premRes.filesizemax = 10485760; // Maximum file size for uploads in bytes (please also check PHP and DB settings).
premRes.filesizemaxFree = 1048576; // Maximum file size for uploads in bytes for FREE users.
premRes.tagsMaxFree = 3; // Max tags a free user can have.
premRes.teamsMaxFree = 1; // Max team(s) a free user can have.
