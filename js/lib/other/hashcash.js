
function generatehashcash(text, value, timeout)
{
  var number = 0;  
  var texthash = pcrypt.sha256(text);
  var resulthash;
  var timestamp = Date.now();
  
  if(typeof timeout == 'undefined')
      timeout = 10000;  
  
  do
  {
    resulthash = pcrypt.sha256(texthash + number);
    
    if(resulthash.indexOf(value) != -1)
      break;
     
    if((timestamp + timeout) < Date.now())
        return false;
 
    number++;
  }
  while(1)
  
  return number;
}
