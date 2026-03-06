// This makes it possible to trap console messages and send it to the server (not implemented)
/*
(function()
{
    var oldLog = console.log;
    console.log = function (message) 
    {
        // DO MESSAGE HERE.
        oldLog.apply(console, arguments);
    };
})();

// TODO - also catch alert

*/


// Add functionallity for object to behave a bit like Array
function Pcryptarray(){} // Class define. NB: Does not work with class name as it is not working during the release process

Pcryptarray.prototype.length = function()
{
  let keys = Object.keys(this);
  return keys.length;
};

Pcryptarray.prototype.lastindex = function()
{
  let keys = Object.keys(this);
  let last = -1; 

  keys.forEach((element) => 
  {
    element = Number(element);

    if(element > last)
      last = element;
  })

  return last;
};

Pcryptarray.prototype.lastitem = function()
{
  return this[this.lastindex()];
};

Pcryptarray.prototype.push = function(item)
{
  let last = this.lastindex() + 1;

  this[last] = item;

  return last;
};

Pcryptarray.prototype.remove = function(index)
{
  delete this[index];
  return true;
};

Array.prototype.intersection = function(a)
{
  return  this.filter(function(n) { return a.indexOf(n) !== -1;});
}

Array.prototype.difference = function(a) 
{
  return  this.filter(function(n) { return a.indexOf(n) === -1;});
}

Array.prototype.merge = function(...arrays)
{
    let jointArray = this;

    arrays.forEach(array => 
    {
        jointArray = [...jointArray, ...array]
    })

    const uniqueArray = jointArray.filter((item,index) => jointArray.indexOf(item) === index)
    return uniqueArray
}

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to)
{
	// If not numbers it will fail and may delete everything !!
	from = Number(from);
	to = Number(to);

	let  rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

// Converts numeric degrees to radians
if (typeof(Number.prototype.toRad) === "undefined")
{
  Number.prototype.toRad = function()
  {
    return this * Math.PI / 180;
  }
}

Date.prototype.setFromMysql = function(mysql_string)
{
   let t;

   if(typeof mysql_string === 'string')
   {
      t = mysql_string.split(/[- :]/);

      if(t.length < 3)
        return this;

      //when t[3], t[4] and t[5] are missing they defaults to zero
      this.setFullYear(t[0]);
      this.setMonth(t[1] - 1);
      this.setDate(t[2]);
      this.setHours(t[3] || 0);
      this.setMinutes(t[4] || 0);
      this.setSeconds(t[5] || 0);
      this.setMilliseconds(0);

      return this;
   }

   return this;
};

Date.prototype.toMysqlFormat = function()
{
    function twoDigits(d)
    {
      if(0 <= d && d < 10) return "0" + d.toString();
      if(-10 < d && d < 0) return "-0" + (-1*d).toString();
      return d.toString();
    }


    return this.getFullYear()
    + "-" + twoDigits(1 + this.getMonth())
    + "-" + twoDigits(this.getDate())
    + " " + twoDigits(this.getHours())
    + ":" + twoDigits(this.getMinutes())
    + ":" + twoDigits(this.getSeconds());
}

Date.prototype.setFromFormat = function(input, format)
{
  if((typeof input !== 'string') || (typeof format !== 'string'))
    return this;

  format = format || 'yyyy-mm-dd HH:MM:ss'; // default format

  let parts = input.match(/(\d+)/g), i = 0, fmt = {};

  if(!parts)
    return this;

  // extract date-part indexes from the format
  format.replace(/(yyyy|dd|mm|HH|MM|ss)/g, function(part) { fmt[part] = i++; });

  this.setFullYear(parts[fmt['yyyy']]);
  this.setMonth(parts[fmt['mm']]-1);
  this.setDate(parts[fmt['dd']]);
  this.setHours(parts[fmt['HH']] || 0);
  this.setMinutes(parts[fmt['MM']] || 0);
  this.setSeconds(parts[fmt['ss']] || 0);
  this.setMilliseconds(0);

  return this;
};

Date.prototype.addDays = function(days)
{
    var tmpDate = new Date(this.valueOf());
    tmpDate.setDate(tmpDate.getDate() + days);
    return tmpDate;
}