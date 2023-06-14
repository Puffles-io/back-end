const winston = require('winston');
const { createLogger, format, transports } = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf(info => `${info.timestamp}, ${info.method}, ${info.private_ip} , ${info.url} , ${info.level}: ${info.message}`),
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});
module.exports=logger;