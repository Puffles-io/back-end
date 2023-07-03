 class DataRefine
{
    removeNullData(data)
    {
        for(let i of Object.entries(data))
        {
            if(i[1]===null)
            {
                delete data[i[0]];
            }
        }
        return data;
    }
    cleanString(inputString) {
        if (Array.isArray(inputString)) {
          return inputString.map(cleanString);
        }
      
        if (typeof inputString === 'string') {
          return inputString.replace(/[\[\]"]+/g, '');
        }
      
        return inputString;
      }
    makeValidJSONString(str) {
        // Remove the extra double quotes and square brackets
        str = str.replace(/\\"/g, '"'); // Replace \" with "
        str = str.replace(/""/g, '"'); // Replace """" with "
        str = str.replace(/""/g, '""'); // Replace """" with ""
        str = str.replace(/\[\[/g, '[["'); // Replace [[ with [[" 
        str = str.replace(/\]\]/g, '"]]'); // Replace ]] with "]]"
        return str;
      }
       extractValidJSONString(inputString) {
        const regex = /"\[([^"]+)""\]""\]/g;
        const matches = inputString.match(regex);
        
        if (matches && matches.length > 0) {
          const validJSONString = matches[0].replace(/""/g, '"');
          return validJSONString;
        }
        
        return null;
      }
}
module.exports=DataRefine;