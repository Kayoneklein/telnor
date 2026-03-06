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

function pcrypt_clientversion(session, id, callback) 
{
    var argn = arguments.length,
    arge = 3;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'clientversion', session, {}, id, callback);
}

function pcrypt_clientdownload(session, id, callback) 
{
    var argn = arguments.length,
    arge = 3;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'clientdownload', session, {}, id, callback);
}

// Team functions

/*
Create a new team - allowed for everybody

[Callback parameters]
teamid: The DB ID of the new team
teamuserid: The DB ID of the new team user
*/
function pcrypt_teamcreate(session, name, contact, email, options, id, callback) {
    var argn = arguments.length,
    arge = 7;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teamcreate', session, { name: name, contact: contact, email: email, options: options }, id, callback);
}

/*
Only allowed for administrators
*/
function pcrypt_teamedit(session, teamid, name, contact, email, options, id, callback) {
    var argn = arguments.length,
    arge = 8;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teamedit', session, { teamid: teamid, name: name, contact: contact, email: email, options: options }, id, callback);
}

/*
Only allowed for administrators
*/
function pcrypt_teamdelete(session, teamid, id, callback) {
    var argn = arguments.length,
    arge = 4;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teamdelete', session, { teamid: teamid }, id, callback);
}

/*
[Description]
Include user in a team. Only allowed for administrators.
If user does not exist it create a stub user in session table.
An email is sent to the user to let the user fill in the remaining information
or to inform the user about the membership if the account already exist so her or she can approve it.

[Parameters]
teamid: Team that you like to include user in
email: Email adr. of user to include.
level: User level - 0 = normal user, 1 = administrator
emaillanguage: Language code to use in confirmation email (mandatory)
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything

[Callback parameters]
data: True on success or text string on error
error: Null on success or numeric error code (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_teamaddmember(session, teamid, email, admin, options, emaillanguage, id, callback) {
    var argn = arguments.length,
    arge = 8;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teamaddmember', session, { teamid: teamid, email: email, admin: admin, emaillanguage: emaillanguage, options: options }, id, callback);
}

/*
Only allowed for administrators

email changes are not allowed

*/
function pcrypt_teameditmember(session, teamid, email, admin, options, id, callback) {
    var argn = arguments.length,
    arge = 7;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teameditmember', session, { teamid: teamid, email: email, admin: admin, options: options }, id, callback);
}

/*
Only allowed for administrators
*/
function pcrypt_teamremovemember(session, teamid, email, id, callback) {
    var argn = arguments.length,
    arge = 5;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teamremovemember', session, { teamid: teamid, email: email }, id, callback);
}




// User team function

/*
Allowed for all team members - admins get more info
*/
function pcrypt_teaminfo(session, id, callback) {
    var argn = arguments.length,
    arge = 3;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teaminfo', session, {}, id, callback);
}

/*
Allowed for all team members - just leave team
*/
function pcrypt_teamleave(session, teamid, id, callback) {
    var argn = arguments.length,
    arge = 4;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teamleave', session, { teamid: teamid }, id, callback);
}

/*
Allowed for all team members - get list of all members
*/
function pcrypt_teammembers(session, id, callback) {
    var argn = arguments.length,
    arge = 3;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teammembers', session, {}, id, callback);
}

/*
Allowed for team admins

The parameter datastring need to have the following format: {userid: [passwords]}
no string or empty string for passwords delete shares
*/
function pcrypt_teamshares(session, teamid, id, callback) {
    var argn = arguments.length,
    arge = 4;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teamshares', session, { teamid: teamid }, id, callback);
}

/*
Allowed for all team members

The parameter datastring need to have the following format: {userid: [passwords]}
no string or empty string for passwords delete shares
*/
function pcrypt_teamsetshares(session, datastring, hash, id, callback) {
    var argn = arguments.length,
    arge = 5;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teamsetshares', session, { datastring: datastring, hash: hash }, id, callback);
}

/*
Allowed for all team members

[Return value]
Does not return anything

[Callback parameters]
data: A list of encrypted shares in the format {userid: [passwords]}
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_teamgetshares(session, id, callback) {
    var argn = arguments.length,
    arge = 3;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teamgetshares', session, null, id, callback);
}

/*
Allowed for all team members

[Return value]
Does not return anything

[Callback parameters]
data: A list of encrypted shares in the format {userid: [passwords]}
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
/*
function pcrypt_teamgetmyshares(session, id, callback)
{
  var argn = arguments.length, arge = 3;
  if((argn > arge) || (argn < (arge-2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

  pcrypt.jsonrpc(pcrypt.url, 'teamgetmyshares', session, null, id, callback);
}
*/







// Mail team functions below

/*
Allowed for all team members - check for new mails and shares

[Parameters]

[Callback parameters]
data.mails: Number of messages that is unread
data.shares: Number of shares that is new since last login
data.teamupdate: If team have new members
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_teamcheckshare(session, id, callback) {
    var argn = arguments.length,
    arge = 3;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teamcheckshare', session, {}, id, callback);
}

/*
Allowed for all team members - get list of all mails

[Callback parameters]
data.inbox: Mails sent to you
data.outbox: Mails sent by you
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_teamgetmail(session, id, callback) {
    var argn = arguments.length,
    arge = 3;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teamgetmail', session, {}, id, callback);
}

/*
Allowed for all team members - send a mail to multiple users

publicsubject: Subject of normal e-mail notification to user
expiredate: After this date the mail will be deleted
fromdata: Encrypted data string (symmetric encrypted for session user)
todata: A list of asymmetric encrypted mails in the format {userid: [maildata]}
*/
function pcrypt_teamsendmail(session, fromdata, todata, emaillanguage, id, callback) {
    var argn = arguments.length,
    arge = 6;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teamsendmail', session, { fromdata: fromdata, todata: todata, emaillanguage: emaillanguage }, id, callback);
}

/*
Allowed for all team members - remove one or many mails

mailid: Numeric value or array of numeric values
*/
function pcrypt_teamremovemail(session, mailid, id, callback) {
    var argn = arguments.length,
    arge = 4;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teamremovemail', session, { mailid: mailid }, id, callback);
}







// Binary team functions below

/*
[Description]
Store binary data on the server. Client encrypt data before this call.
Only possible to store text string data so encrypted data need base64 encoding

[Parameters]
session: ID from logon
toid: The user that we like to share this with (text string or array of strings)
dataname: String or array of strings to identify data (unique id)
datastring: The data to store on the server (text string or array of strings). Null value delete the data
nodelsource: String or array of strings to identify sourcename data that shall stay in the DB (everything else is deleted)
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: True on success
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/

function pcrypt_teamsetbinary(session, toid, sourcename, datastring, nodelsource, id, callback) {
    var argn = arguments.length,
    arge = 7;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teamsetbinary', session, { toid: toid, sourcename: sourcename, datastring: datastring, nodelsource: nodelsource }, id, callback);
}

/*
[Description]
Get stored binary data from server.

[Parameters]
session: ID from logon
dataname: String or array of strings to identify data (unique id)
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: The data from server (array)
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_teamgetbinary(session, fromid, dataname, id, callback) {
    var argn = arguments.length,
    arge = 5;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teamgetbinary', session, { fromid: fromid, dataname: dataname }, id, callback);
}

/*
[Description]
Get stored binary info from server.

[Parameters]
session: ID from logon
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: The data from server (array)
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_teamgetbinaryinfo(session, id, callback) {
    var argn = arguments.length,
    arge = 3;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teamgetbinaryinfo', session, {}, id, callback);
}

function pcrypt_teamgetbinaryinfo2(session, id, callback) {
    var argn = arguments.length,
    arge = 3;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teamgetbinaryinfo2', session, {}, id, callback);
}













// Team share functions below

/*

[FUNCTIONS]
Share team items (userid)
Get team items (userid)
Share team key (has to be admin)
Get team keys (userid) (called from start so they are available)

[LOGIC}]
Create team user danner en nøgle/key
Denne deles med alle medlemmer af team
Kun admin kan ændre nøgle/key
* Når bruger slettes skal nøgle ændres

[PROBLEMS]
Hvorledes deles nøgle/key til team items
Hvorledes opretholder vi link til item (oprindelige item kontra delt item) når nøgle/key kan ændres af admin
* Vi beholder gamle nøgler indtil bruger gemmer team shares igen (alle brugere der bruger gamle nøgle)
* Nøgler har et autoincrement værdi der angiver nøglen der skal anvendes til item
* Når bruger slettes danner admin en ny nøgle med ny nøgle id (incremented)
* Admin deler nøgler (ny og de gamle) med medlemmer af team (1 til 1)
* Når alm bruger kalder buildsharedata anvendes den sidste nøgle til at kryptere igen
* Når admin danner og gemmer en ny nøgle kan det evt. tjekkes om gamle nøgler er i brug og de kan slette hvis de ikke er (på server eller klienten?)
* Nøgleid anvendt gemmes samme med items fra bruger
* Hvorledes håndteres notifikationer med team shares ??????
* Der skal oprettes en ny tabel til binære data (teamid mangler i den nuværende)
*/

function pcrypt_teamgetteamkeysinuse(session, id, callback)
{
    var argn = arguments.length,
    arge = 3;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teamgetteamkeysinuse', session, {}, id, callback);

} 

// return teammembers to avoid extra API call
function pcrypt_teamsetteamkeys(session, datastring, hash, newkey, id, callback) 
{
    var argn = arguments.length,
    arge = 6;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teamsetteamkeys', session, { datastring: datastring, hash: hash, newkey: newkey }, id, callback);
}

/*
Allowed for all team members

The parameter datastring need to have the following format: {teamid: {keyid: number, data: [passwords items]} 
no string or false/empty string for teamid delete team shares
*/
function pcrypt_teamsetteamshares(session, datastring, hash, id, callback) 
{
    var argn = arguments.length,
    arge = 5;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teamsetteamshares', session, { datastring: datastring, hash: hash }, id, callback);
}

/*
Allowed for all team members

[Return value]
Does not return anything

[Callback parameters]
data: A list of encrypted shares in the format {teamid: [password items]} keyid ??????
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_teamgetteamshares(session, id, callback) {
    var argn = arguments.length,
    arge = 3;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teamgetteamshares', session, null, id, callback);
}

/*
[Description]
Store binary data on the server. Client encrypt data before this call.
Only possible to store text string data so encrypted data need base64 encoding

[Parameters]
session: ID from logon
teamid: The team that we like to share this with
keyid: Encyption key used
sourcename: String or array of strings to identify data (unique id)
datastring: The data to store on the server (text string or array of strings). Null value delete the data
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: True on success
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/

/*
function pcrypt_teamsetteambinary(session, teamid, keyid, sourcename, dataname, datastring, nodelsource, id, callback) 
{
    var argn = arguments.length,
    arge = 9;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teamsetteambinary', session, { teamid: teamid, keyid: keyid, sourcename: sourcename, dataname: dataname, datastring: datastring, nodelsource: nodelsource }, id, callback);
}
*/

function pcrypt_teamsetteambinary(session, teamid, keyid, sourcename, datastring, nodelsource, id, callback) 
{
    //debugger;

    var argn = arguments.length, arge = 8; // arge is the number of arguments we expect (reference)
    if(!isset(callback)) argn++; // We accepts that no callback is specified
    if(argn !== arge) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teamsetteambinary', session, { teamid: teamid, keyid: keyid, sourcename: sourcename, datastring: datastring, nodelsource: nodelsource }, id, callback);
}

/*
[Description]
Get stored binary data from server.

[Parameters]
session: ID from logon
dataname: String or array of strings to identify data (unique id)
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: The data from server (array)
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_teamgetteambinary(session, teamid, dataname, id, callback) 
{
    var argn = arguments.length,
    arge = 5;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teamgetteambinary', session, { teamid: teamid, dataname: dataname }, id, callback);
}
















/*
[Description]
Store new global message on the server

[Parameters]
session: ID from logon
data: Object containing values to pass to server
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Callback parameters]
data: The data from server (array)
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_newadminmaildata(session, data, id, callback)
{
  var argn = arguments.length,
  arge = 4;
  if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);
  pcrypt.jsonrpc(pcrypt.url, 'newglobalmsg', session, data, id, callback);
  
}
/*
[Description]
Change stored value(s) for selected global message

[Parameters]
session: ID from logon
data: Object containing values to pass to server (e.g. globalmessage)
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Callback parameters]
data: The data from server (array)
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_editadminmaildata(session, data, id, callback)
{
  var argn = arguments.length,
  arge = 4;
  if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);
  pcrypt.jsonrpc(pcrypt.url, 'editglobalmsg', session, data, id, callback);
}

/*
[Description]
Delete stored values for selected global message

[Parameters]
session: ID from logon
data: Object containing values to pass to server (e.g. globalmessage)
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Callback parameters]
data: The data from server (array)
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_deleteadminmaildata(session, data, id, callback)
{
  var argn = arguments.length,
  arge = 4;
  if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);
  pcrypt.jsonrpc(pcrypt.url, 'deleteglobalmsg', session, data, id, callback);
}

/*
[Description]
Get stored values for selected global message

[Parameters]
session: ID from logon
data: Boolean decide if a user should also be given access to the draft global messages.
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Callback parameters]
data: The data from server (array)
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_getadminmaildata(session, drafts, id, callback) {
    var argn = arguments.length,
    arge = 4;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'getglobalmsg', session, {drafts: drafts}, id, callback);
}

/*
[Description]
Count the unread global messages

[Parameters]
session: ID from logon
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Callback parameters]
data: The data from server (array)
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_countunreadadminmaildata(session, id, callback) {
    var argn = arguments.length,
    arge = 3;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'countunreadglobalmsgs', session, {}, id, callback);
}

/*
[Description]
Set time for latest read global message.

[Parameters]
session: ID from logon
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Callback parameters]
data: The data from server (array)
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_setlogreadadminmaildata(session, id, callback) {
    var argn = arguments.length,
    arge = 3;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'setlastglobalmsgread', session, {}, id, callback);
}



// Admin functions below

/*
[Description]
Get stored values for users
Only a global admin should get valid data returned.

[Parameters]
session: ID from logon
restriction: Integer, How should users be divided (equivalent of how many users should be displayed on the admins page).
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Callback parameters]
data: The data from server (array)
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_adminusers(session, id, restriction, page, order, callback) 
{
  var argn = arguments.length,
  arge = 6;
  if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

  pcrypt.jsonrpc(pcrypt.url, 'adminusers', session, {restriction: restriction, page: page, order: order}, id, callback);
}

/*
[Description]
Get stored values for users
Only a global admin should get valid data returned.

[Parameters]
session: ID from logon
search: Search value.
restriction: Max users to get [50, 100, 250, 500].
page: Page value used to determine the starting point for the search
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Callback parameters]
data: The data from server (array)
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_adminusersearch(session, id, search, restriction, page, order, callback) {
  var argn = arguments.length,
  arge = 7;
  if ((argn > arge ) || (argn < ( arge - 2 ))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

  pcrypt.jsonrpc(pcrypt.url, 'adminusersearch', session, {search: search, restriction: restriction, page: page, order: order}, id, callback);
}

/*
[Description]
Get the count of users
Only a global admin should get valid data returned.

[Parameters]
session: ID from logon
id: Integer ID value returned in callback function
callback: function (data, error, id)

[Callback parameters]
data: The data from server (array)
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_admincountusers(session, id, callback)
{
  var argn = arguments.length,
  arge = 3;
  ((argn > arge) || (argn < (arge - 2))) ? console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack) : null;

  pcrypt.jsonrpc(pcrypt.url, 'adminusercount', session, {}, id, callback);
}

/*
[Description]
Get the count of users
Only a global admin should get valid data returned.

[Parameters]
session: ID from logon
id: Integer ID value returned in callback function
callback: function (data, error, id)

[Callback parameters]
data: The data from server (array)
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_admincountuserssearch(session, id, search, callback)
{
  var argn = arguments.length,
  arge = 4;
  ((argn > arge) || (argn < (arge - 2))) ? console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack) : null;

  pcrypt.jsonrpc(pcrypt.url, 'adminusercountsearch', session, {search: search}, id, callback);
}

/*
[Description]
Delete specific users
Only a global admin should get valid data returned.
Any other user should fail and receive an error.

[Parameters]
session: ID from logon
id: Integer ID value returned in callback function
users: array of users that are to be deleted.
callback: function (data, error, id)

[Callback parameters]
data: The data from server (array)
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_admindeleteusers(session, id, users, callback) {
    var argn = arguments.length,
    arge = 4;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'admindeleteusers', session, { users: users }, id, callback);
}

// Single user functions

/*
[Description]
Get a hash value to challenge for before a call to delete!

[Parameters]
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data.hashvalue: The value we need to find before calls to create or delete
data.hashid: Id in the sessions DB for the hashvalue
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_hashvalue(id, callback) {
    var argn = arguments.length,
    arge = 2;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'hashvalue', null, {}, id, callback);
}

/*
[Description]
Create a new account. First you need to call pcrypt_hashvalue!

[Parameters]
email: Id for logon
srpsalt: Srp6a salt value
srpverifier: Srp6a verifier value
salt: Client generated unique value
publickey: ECC public keys for sign and key exchange (json encoded)
privatekey: ECC private keys for sign and key exchange (encrypted json encoded)
emaillanguage: Language code to use in confirmation email (null mean no confirmation)
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: True on success
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_create(email, srpsalt, srpverifier, salt, publickey, privatekey, emaillanguage, id, callback) {
    var argn = arguments.length,
    arge = 9;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'create', null, { email: email, srpsalt: srpsalt, srpverifier: srpverifier, salt: salt, publickey: publickey, privatekey: privatekey, emaillanguage: emaillanguage }, id, callback);
}

/*
[Description]
Create a new account. First you need to call pcrypt_hashvalue!

[Parameters]
email: Id for logon
srpsalt: Srp6a salt value
srpverifier: Srp6a verifier value
salt: Client generated unique value
publickey: ECC public keys for sign and key exchange (json encoded)
privatekey: ECC private keys for sign and key exchange (encrypted json encoded)
emaillanguage: Language code to use in confirmation email (null mean no confirmation)
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: True on success
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_ldap_create(email, srpsalt, srpverifier, salt, publickey, privatekey, emaillanguage, ldapcredentials, id, callback) {
  var argn = arguments.length,
  arge = 9;
  if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

  pcrypt.jsonrpc(pcrypt.url, 'ldapcreate', null, { email: email, srpsalt: srpsalt, srpverifier: srpverifier, salt: salt, publickey: publickey, privatekey: privatekey, emaillanguage: emaillanguage, ldapcredentials: ldapcredentials }, id, callback);
}

/*
[Description]
resend verification email

[Parameters]
session: ID from logon
email: ID from logon
emaillanguage: Language code to use in confirmation email (null mean no confirmation)
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: True on success
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_resend(session, email, emaillanguage, id, callback) {
    var argn = arguments.length,
    arge = 5;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'resendverification', session, { email: email, emaillanguage: emaillanguage }, id, callback);
}

/*
[Description]
Delete account

[Parameters]
session: ID from logon
emaillanguage: Language code to use in confirmation email (null mean no confirmation)
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: True on success
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_delete(session, emaillanguage, id, callback) {
    var argn = arguments.length,
    arge = 4;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'delete', session, { emaillanguage: emaillanguage }, id, callback);
}

function pcrypt_delete2(email, emaillanguage, hashid, hashnumber, timezoneoffset, id, callback) {
    var argn = arguments.length,
    arge = 7;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'delete', null, { email: email, emaillanguage: emaillanguage, hashid: hashid, hashnumber: hashnumber, timezoneoffset: timezoneoffset }, id, callback);
}

/*
[Description]
Change account ID (email)

[Parameters]
session: ID from logon
srpverifier: Srp6a value
newemail: New ID (email)
emaillanguage: Language code to use in confirmation email (null mean no confirmation)
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: True on success
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_updateid(session, srpverifier, newemail, emaillanguage, id, callback) {
    var argn = arguments.length,
    arge = 6;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'updateid', session, { srpverifier: srpverifier, newemail: newemail, emaillanguage: emaillanguage }, id, callback);
}

/*
[Description]
Change account key (password)

[Parameters]
session: ID from logon
srpverifier: Srp6a value
privatekey: ECC private keys for sign and key exchange (encrypted json encoded)
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: True on success
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_updatekey(session, srpverifier, privatekey, id, callback) {
    var argn = arguments.length,
    arge = 5;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'updatekey', session, { srpverifier: srpverifier, privatekey: privatekey }, id, callback);
}

/*
[Description]
Change account info (name/department) seen when sharing info

[Parameters]
session: ID from logon
name: A text string
department: A text string
avatarstring: Base64 encoded image
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: True on success
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_updateinfo(session, name, department, avatarstring, id, callback) 
{
    var argn = arguments.length,
    arge = 6;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);
      
    pcrypt.jsonrpc(pcrypt.url, 'updateinfo', session, { name: name, department: department, avatarstring: avatarstring }, id, callback);
}

/*
[Description]
Login to account first step. It is a 3 step process in total.
pcrypt_hashvalue -> pcrypt_login1 -> pcrypt_login2

[Parameters]
hashsession: From pcrypt_hashvalue
hashnumber: Calculated from hashvalue
email: Unique id for logon
other: Special string for extension login
srpa: Srp6a challenge to server (start of srp6a process)
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data.challenge: Srp6a challenge from server
data.pincode: True if TOTP security (RFC6238) is enable and user need to provide pincode
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/

function pcrypt_login1(email, hexhash, id, callback) 
{
    var argn = arguments.length,
    arge = 4;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'login1', null, { email: email, hexhash: hexhash }, id, callback);
}

/*
[Description]
Login to account first step. It is a 3 step process in total.
pcrypt_hashvalue -> pcrypt_login1 (LDAP authentication as well) -> pcrypt_login2

[Parameters]
email: Unique id for logon
id: Numeric ID value returned in callback function
other: Special string for extension login
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data.challenge: Srp6a challenge from server
data.pincode: True if TOTP security (RFC6238) is enable and user need to provide pincode
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_ldap_login1(email, credentials, hexhash, id, callback) 
{
  var argn = arguments.length,
  arge = 5;
  if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);
  
  pcrypt.jsonrpc(pcrypt.url, 'login1_ldap', null, { email: email, ldapcredentials: credentials, hexhash: hexhash }, id, callback);
}

/*
[Description]
Login to account second step. It is a 3 step process in total.
pcrypt_hashvalue -> pcrypt_login1 -> pcrypt_login2.
Only one login session is allowed. A second login invalidate all others.

[Parameters]
email: Unique id for logon
srpm: Srp6a M value to server (correct password)
pincode: TOTP security (RFC6238) pincode if needed or null
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
email: The ID that is valid for the account
salt: Salt value stored on server (created on client when the account was created)
authid: ID of user - can be used for external sites
authsession: Unique random session ID - can be used for authenfication from external sites
created: DB time when when account was created
publickey: ECC public keys for sign and key exchange (json encoded)
privatekey: ECC private keys for sign and key exchange (encrypted json encoded)
srphamk: Srp6a test that server knew the actual registered verifier and so a valid shared key 'K'
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/

function pcrypt_login2(email, srpA, srpM1, pincode, hexhash, id, callback) {
    var argn = arguments.length,
    arge = 7;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'login2', null, { email: email, srpA: srpA, srpM1: srpM1, pincode: pincode, hexhash: hexhash }, id, callback);
}

/*
[Description]
Same as pcrypt_login2 but only authenticate the user and set authsession
Not possible to set or get data as session is not set.
Also mean that it does not invalidate a pcrypt_login2 session

[Parameters]
email: Unique id for logon
srpm: Srp6a M value to server (correct password)
pincode: TOTP security (RFC6238) pincode if needed or null
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
email: The ID that is valid for the account
authid: ID of user - can be used for external sites
authsession: Unique random session ID - can be used for authenfication from external sites
srphamk: Srp6a test that server knew the actual registered verifier and so a valid shared key 'K'
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_login2authenticate(email, srpm, pincode, hexhash, id, callback) {
    var argn = arguments.length,
    arge = 6;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'login2auth', null, { email: email, srpm: srpm, pincode: pincode, hexhash: hexhash }, id, callback);
}

/*
[Description]
Logout from server (invalidate session id)

[Parameters]
session: ID from logon
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: True on success
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_logout(session, id, callback) {
    var argn = arguments.length,
    arge = 3;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'logout', session, null, id, callback);
}

/*
[Description]
Get status of security.

[Parameters]
session: ID from logon
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
totp: True if enabled
notification: True if enabled
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_securitystatus(session, id, callback) {
    var argn = arguments.length,
    arge = 3;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'securitystatus', session, {}, id, callback);
}

/*
[Description]
Enable or disable TOTP security (RFC6238)

[Parameters]
session: ID from logon
key: Base32 value to use for future logons (keep it a secret). False if we need to disable
code: Currrent time based code as security (needed to enable or disable feature)
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: True on success
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_totpsecurity(session, key, pincode, id, callback) {
    var argn = arguments.length,
    arge = 5;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'totpsecurity', session, { key: key, pincode: pincode }, id, callback);
}

/*
[Description]
Enable or disable notification security. When enabled an email is sent to notify the user
when a new platform, browser or version is used

[Parameters]
session: ID from logon
notification: Boolean (enable/disable)
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: True on success
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_notificationsecurity(session, notification, id, callback) {
    var argn = arguments.length,
    arge = 4;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'notificationsecurity', session, { notification: notification }, id, callback);
}

/*
[Description]
Enable or disable session security. When enabled the IP adr used at login can only be used
for further API calls in that session

[Parameters]
session: ID from logon
iplock: true or false
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: True on success
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_sessionsecurity(session, iplock, id, callback) {
    var argn = arguments.length,
    arge = 4;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'sessionsecurity', session, { iplock: iplock }, id, callback);
}

/*
[Description]
Get list of stored data names from server.

[Parameters]
session: ID from logon
backup: False if it shall return current data and true if it shall show backup data (see pcrypt_setdata)
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: Array of objects with the following content {name, cre}
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_getlist(session, backup, id, callback) {
    var argn = arguments.length,
    arge = 4;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'getlist', session, { backup: backup }, id, callback);
}

/*
[Description]
Get stored text data from server.

[Parameters]
session: ID from logon
dataname: String to identify data (unique id)
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data.datastring: The data from server (text string)
data.hash: Sha256 hash of the data.datastring (error check)
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_getdata(session, dataname, id, callback) {
    var argn = arguments.length,
    arge = 4;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'getdata', session, { dataname: dataname }, id, callback);
}

/*
[Description]
Store data on the server. Client encrypt data before this call.
Only possible to store text string data so encrypted data need base64 encoding

[Parameters]
session: ID from logon
dataname: String to identify data (unique id)
datastring: The data to store on the server (text string). Null value delete the data
hash: Sha256 hash of the data (datastring). Null value on delete
backup: Boolean (1/0) if this data need backup in the database (important data)
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: True on success
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_setdata(session, dataname, datastring, hash, backup, id, callback) {
    var argn = arguments.length,
    arge = 7;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'setdata', session, { dataname: dataname, datastring: datastring, hash: hash, backup: backup }, id, callback);
}

/*
[Description]
Get stored binary info from server.

[Parameters]
session: ID from logon
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: The data from server (array)
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_getbinaryinfo(session, id, callback) 
{
    var argn = arguments.length,
    arge = 3;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'getbinaryinfo', session, {}, id, callback);
}

/*
[Description]
Get stored binary data from server.

[Parameters]
session: ID from logon
dataname: String or array of strings to identify data (unique id)
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: The data from server (array)
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_getbinary(session, dataname, id, callback) {
    var argn = arguments.length,
    arge = 4;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'getbinary', session, { dataname: dataname }, id, callback);
}

/*
[Description]
Store binary data on the server. Client encrypt data before this call.
Only possible to store text string data so encrypted data need base64 encoding

[Parameters]
session: ID from logon
dataname: String or array of strings to identify data (unique id)
datastring: The data to store on the server (text string or array of strings). Null value delete the data
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: True on success
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_setbinary(session, dataname, datastring, id, callback) {
    var argn = arguments.length,
    arge = 5;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'setbinary', session, { dataname: dataname, datastring: datastring }, id, callback);
}

/*
[Description]
Restore data from backup (see pcrypt_setdata and pcrypt_getlist)

[Parameters]
session: ID from logon
dataname: String to identify data (unique id)
timestamp: Timestamp of the data to restore
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: True on success
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_restoredata(session, dataname, timestamp, id, callback) {
    var argn = arguments.length,
    arge = 5;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'restoredata', session, { dataname: dataname, timestamp: timestamp }, id, callback);
}

/*
[Description]
Get activity log from server

[Parameters]
session: ID from logon
days: Days back to retrieve
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: Array of objects with the following content {cre, ip, txt}
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_getlog(session, days, userId, id, callback) {
    var argn = arguments.length,
    arge = 5;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'getlog', session, { days: days, userId: userId }, id, callback);
}

/*
[Description]
Verify that the user session is still valid (logged in)

[Parameters]
session: ID from logon
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: True on valid session
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_verify(session, id, callback) {
    var argn = arguments.length,
    arge = 3;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'verify', session, null, id, callback);
}

/*
[Description]
Authenticate that the user is valid (called from external sites)
User need to be logged in for this to work (communication between this system and external site)

[Parameters]
authsession: Unique ID from logon
authdelete: True if authsession shall be deleted from the system (if false deleted after 24 hours)
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
authid: 32 bytes HEX string with unique ID of user
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_authenticate(authsession, authdelete, id, callback) {
    var argn = arguments.length,
    arge = 4;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'authenticate', null, { authsession: authsession, authdelete: authdelete }, id, callback);
}

/*
[Description]
Set language used in e-mails for notification etc.

[Parameters]
language: The language to use in emails (da, en, etc)
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: True on success
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_setemaillanguage(session, langcode, id, callback) {
    var argn = arguments.length,
    arge = 4;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'setemaillanguage', session, { langcode: langcode }, id, callback);
}

/*
[Description]
Get currrent system config from server from server.

[Parameters]
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: Structure of config
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_getsystemconfig(id, callback) {
    var argn = arguments.length,
    arge = 2;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'getsystemconfig', null, {}, id, callback);
}

/*
[Description]
Retrieve and store if needed favicon from url.

[Parameters]
url: url or array of url's
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: For each url  
{
  domain: Unique ID in DB (extracted from url)
  redirect: Possible meta redirect site
  updated: Date for last update (false = not in db)
  noupdate: Fixed image in DB
  image: Base64 encoded image
}
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_getfavicon(session, url, id, callback) 
{
    var argn = arguments.length,
    arge = 4;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'getfavicon', session, {url: url}, id, callback);
}

/*
Allowed for all team members
Get all avatar images for all users in the teams user is a member of

[Return value]
Does not return anything

[Callback parameters]
data: A list of base64 encoded avatars  in the format {userid: avatar}
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_teamgetavatars(session, id, callback) 
{
    var argn = arguments.length,
    arge = 3;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'teamgetavatars', session, null, id, callback);
}

// EMERGENCY FUNCTIONS
/*
Initial setup for emergency
Sets email, receiver email and the time frame for denial of an access request.

[Return value]
Does not return anything

[Callback parameters]
data: A list of base64 encoded avatars  in the format {userid: avatar}
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_setupemergency(session, email, receiveremail, emailtimer, languagecode, id, callback)
{
  var argn = arguments.length,
  arge = 7;
  if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

  pcrypt.jsonrpc(pcrypt.url, 'emergencysetup', session, {email: email, receiveremail: receiveremail, emailtimer: emailtimer, langcode: languagecode}, id, callback);
}

function pcrypt_emergencykeyupdate(session, id, callback)
{
  var argn = arguments.length,
  arge = 3;
  if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

  pcrypt.jsonrpc(pcrypt.url, 'emergencykeyupdate', session, {}, id, callback);
}
 
/**
 * @description Resend the emergency email for emergency index
 * @param {*} session session id
 * @param {*} index emergency index for said user
 * @param {*} id
 * @param {*} callback
 */
function pcrypt_emergencysetupresend(session, index, languagecode, id, callback)
{
  var argn = arguments.length,
  arge = 5;
  if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

  pcrypt.jsonrpc(pcrypt.url, 'emergencysetupresend', session, {index: index, langcode: languagecode}, id, callback);
}

function pcrypt_setemergencydata(session, data, id, callback)
{
  var argn = arguments.length,
  arge = 4;
  if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

  pcrypt.jsonrpc(pcrypt.url, 'emergencysetdata', session, {secretdata:data}, id, callback);
}

function pcrypt_requestemergencydata(session, index, languagecode, id, callback)
{
  var argn = arguments.length,
  arge = 5;
  if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

  pcrypt.jsonrpc(pcrypt.url, 'emergencyrequestaccess', session, {index: index, langcode: languagecode}, id, callback);
}

function pcrypt_getemergencydata(session, data, id, callback)
{
  var argn = arguments.length,
  arge = 4;
  if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

  pcrypt.jsonrpc(pcrypt.url, 'emergencygetdata', session, {index: data}, id, callback);
}

function pcrypt_deleteemergency(session, index, langcode, id, callback)
{
  var argn = arguments.length,
  arge = 5;
  if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

  pcrypt.jsonrpc(pcrypt.url, 'emergencydelete', session, {index: index, langcode: langcode}, id, callback);
}

function pcrypt_emergencycheckdata(session, data, id, callback)
{
  var argn = arguments.length,
  arge = 5;
  if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

  pcrypt.jsonrpc(pcrypt.url, 'emergencycheckdata', session, {data:data}, id, callback);
}

/*
[Describtion]
Toggle 2fa negation on relogging with extension
Extension accesses the webclient -> user chooses logout or closes the tab of the webclient -> extension logs out and will attempt to login again
This option allows the user to either toggle the 2fa on or off

[Parameters]
session: session string
data: boolean value (true - negate, false - do not negate)
id: Numeric ID value returned in callback function

[Callback paramters]
data: The data from server (array)
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_getextension2fastate(session, id, callback)
{
  var argn = arguments.length,
  arge = 3

  if ((argn > arge ) || (argn < ( arge - 2 ))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

  pcrypt.jsonrpc(pcrypt.url, 'getextension2fastate', session, {}, id, callback);
}

/*
[Describtion]
Toggle 2fa negation on relogging with extension
Extension accesses the webclient -> user chooses logout or closes the tab of the webclient -> extension logs out and will attempt to login again
This option allows the user to either toggle the 2fa on or off

[Parameters]
session: session string
data: boolean value (true - negate, false - do not negate)
id: Numeric ID value returned in callback function

[Callback paramters]
data: The data from server (array)
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_toggleextension2fa(session, id, callback)
{
  var argn = arguments.length,
  arge = 3;
  if ((argn > arge ) || (argn < ( arge - 2 ))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

  pcrypt.jsonrpc(pcrypt.url, 'toggle2fanegation', session, {}, id, callback);
}


/*
[Description]
Register traffic source

[Parameters]
session: temporary session
source: The source of the website/webapp
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Callback parameters]
data: The data from server (array)
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_registersource(session, source, registered, id, callback) 
{
  var argn = arguments.length,
    arge = 5;
  if ((argn > arge ) || (argn < ( arge - 2 ))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

  pcrypt.jsonrpc(pcrypt.url, 'registersource', session, {source: source, registered: registered}, id, callback);
}

/*
[Description]
Make log entry in DB

[Parameters]
session: temporary session
text: log text
shown: is this entry shown to the user
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Callback parameters]
data: The data from server (array)
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_makelogentry(session, text, shown, id, callback) 
{
  var argn = arguments.length,
    arge = 5;
  if ((argn > arge ) || (argn < ( arge - 2 ))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

  pcrypt.jsonrpc(pcrypt.url, 'makelogentry', session, {text: text, shown: shown}, id, callback);
}

/*
[Description]
If premium have changed we need to inform the back-end so it can update
Can also be used to check premium status at server level
Premium status is also returned at login

[Parameters]
session: temporary session
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Callback parameters]
data: premium status (bool)
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
function pcrypt_updatepremium(session, id, callback) 
{
  var argn = arguments.length,
    arge = 3;
  if ((argn > arge ) || (argn < ( arge - 2 ))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

  pcrypt.jsonrpc(pcrypt.url, 'updatepremium', session, {}, id, callback);
}


/*
[Description]
Get next id from from server for unique ID.

[Parameters]
dataname: String to identify data (unique id label) 
id: Numeric ID value returned in callback function
callback: function (data, error, id)

[Return value]
Does not return anything.

[Callback parameters]
data: Numeric ID
error: Null on success or string/numeric (from pcrypt.php) - data specify text description
id: Numeric ID value from function call (link call and callback)
*/
/*
function pcrypt_getautoincrement(session, dataname, startid, id, callback) 
{
    var argn = arguments.length,
    arge = 5;
    if ((argn > arge) || (argn < (arge - 2))) console.log('Wrong number of parameters [' + argn + '] in pcrypt API: ' + new Error().stack);

    pcrypt.jsonrpc(pcrypt.url, 'getautoincrement', session, {dataname: dataname, startid: startid}, id, callback);
}
*/

/*
[Description]
Get random bytes

[Parameters]
length: length of byte string to return

[Return value]
Byte string

[Callback parameters]
No callback possible
*/
function pcrypt_randombytes(length) 
{
    return forge.random.getBytesSync(length);
}

/*
[Description]
Convert bytes to hex

[Parameters]
bytes: String of bytes

[Return value]
Hex string

[Callback parameters]
No callback possible
*/
function pcrypt_bytestohex(bytes) {
    return forge.util.bytesToHex(bytes);
}

/*
[Description]
Convert hex to bytes

[Parameters]
hexstring: String of hex values

[Return value]
Byte string

[Callback parameters]
No callback possible
*/
function pcrypt_hextobytes(hexstring) {
    return forge.util.hexToBytes(hexstring);
}


/*
[Description]
Class to handle many calls to the libary in parallel (faster)
You need to override onsuccess and maybe onerror in a real implementation

[Parameters]
Number of calls to pcrypt

[Return value]
Handle to object

[Callback parameters]
No callback possible
*/
function pcrypt_async(count) 
{
    this._count = count;
    this._error = false;
    this._varobj = {};
    this._value = undefined;

    var _self = this;

    // Wrapper to make sure 'this' is correct in _callback
    _self.callback = function(data, error, id) 
    {
        return _self._callback(data, error, id);
    };
}

pcrypt_async.prototype._callback = function(data, error, id) 
{
    if (this._error) // Make sure we only show the first error
        return;

    if (error) 
    {
        this._error = true;

        if (this.onerror)
            this.onerror(data, error, id);

        return;
    }

    this._varobj[id] = data;

    if (this._count > 0)
        this._count--;

    if ((this._count <= 0) && (this.onsuccess))
        this.onsuccess(this._varobj);
}

pcrypt_async.prototype.onerror = function(data, error, id) 
{
    console.log('pcrypt_async onerror not assigned - error: ' + error + ' [' + id + '] ' + data);
}

pcrypt_async.prototype.onsuccess = function(varobj) 
{
    console.log('pcrypt_async onsuccess not assigned - returns: ' + Object.keys(varobj).length);
}

pcrypt_async.prototype.setvalue = function(value) 
{
  this._value = value;
}

pcrypt_async.prototype.getvalue = function() 
{
  return this._value;
}