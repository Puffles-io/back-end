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
}
module.exports=DataRefine;