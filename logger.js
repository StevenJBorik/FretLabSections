const { Client } = require('pg');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

// Database connection setup
const dbClient = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
});

dbClient.connect().then(() => {
  console.log('Connected to the database');
}).catch(err => {
  console.error('Database connection error:', err);
  process.exit(1); 
});

const logToDatabase = async (level, message, context, serviceName) => {
  const query = `
    INSERT INTO logs (level, message, context, timestamp, service_name)
    VALUES ($1, $2, $3, $4, $5)
  `;
  const values = [
    level,
    message,
    JSON.stringify(context),
    new Date().toISOString(),
    serviceName,
  ];

  try {
    await dbClient.query(query, values);
  } catch (error) {
    console.error('Error logging to database:', error);
  }
};

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level.toUpperCase()}] ${message} ${JSON.stringify(meta)}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    }),
  ],
});

const log = async (level, message, context = {}, serviceName = 'fretlabs_client') => {
  await logToDatabase(level, message, context, serviceName);
  logger.log(level, message, context);
};

const logInfo = (message, context) => log('info', message, context);
const logWarn = (message, context) => log('warn', message, context);
const logError = (message, context) => log('error', message, context);

module.exports = {
  info: logInfo,
  warn: logWarn,
  error: logError,
};