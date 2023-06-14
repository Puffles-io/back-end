const logger=require('./errorLogger');
/**
 * 
 * @param {*} err 
 * @param {*} req 
 */
function error(err,req)
{
    let errorMessage=err.sqlMessage?err.sqlMessage:err
    logger.error(
        {
          message:errorMessage,
          private_ip:req.socket.remoteAddress,
          method:req.method,
          url:req.url,
          level:"error"
        });
}
module.exports=error;