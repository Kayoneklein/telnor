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

pcrypt.urldomain = 'https://pcrypt.org'; // Server to communicate with for the API
pcrypt.urlpath = '/'; // Server path to communicate with for the API

pcrypt.url = pcrypt.urldomain + pcrypt.urlpath + pcrypt.urlscript; // Server script to communicate with for the API
pcrypt.urlsse = pcrypt.urldomain + pcrypt.urlpath + pcrypt.urlscriptsse; // SSE script to communicate with for the API

pcrypt.debug = true;



jserror.urldomain = 'https://pcrypt.org'; // Server to communicate with for the API
jserror.url = jserror.urldomain + jserror.urlpath + jserror.urlscript; // Server script to communicate with for the API

jslang.urldomain = 'https://pcrypt.org'; // Server to communicate with for the API
jslang.url = jslang.urldomain + jslang.urlpath + jslang.urlscript; // Server script to communicate with for the API

jspremium.urldomain = 'https://pcrypt.org'; // Server to communicate with for the API
jspremium.url = jspremium.urldomain + jspremium.urlpath + jspremium.urlscript; // Server script to communicate with for the API
