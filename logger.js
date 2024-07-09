const axios = require('axios');
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

const logToSigNoz = async (level, message, context, serviceName) => {
  if (level === 'error' || level === 'critical') {
    const sigNozLogData = {
      resourceLogs: [
        {
          resource: {
            attributes: [
              { key: 'service.name', value: { stringValue: serviceName } },
            ],
          },
          scopeLogs: [
            {
              scope: { name: 'backend_logger', version: '1.0.0' },
              logRecords: [
                {
                  timeUnixNano: `${Date.now() * 1e6}`,
                  severityNumber: level === 'error' ? 17 : 18, // Corresponding severity for SigNoz
                  severityText: level.toUpperCase(),
                  body: { stringValue: message },
                  attributes: [
                    { key: 'module', value: { stringValue: context.module || '' } },
                    { key: 'funcName', value: { stringValue: context.funcName || '' } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    try {
      await axios.post(process.env.SIGNOZ_ENDPOINT, sigNozLogData);
    } catch (error) {
      console.error('Error sending log to SigNoz:', error);
    }
  }
};

const log = async (level, message, context = {}, serviceName = 'fretlabs_client') => {
  await logToDatabase(level, message, context, serviceName);
  await logToSigNoz(level, message, context, serviceName);
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
    new transports.Http({
      format: format.json(),
      host: 'localhost',
      port: 4318,
      path: '/v1/logs',
    }),
    new transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    }),
  ],
});

const logInfo = (message, context) => log('info', message, context);
const logWarn = (message, context) => log('warn', message, context);
const logError = (message, context) => {
  log('error', message, context);
  logger.error(message, context); // Ensure error logs go to the console as well
};

module.exports = {
  info: logInfo,
  warn: logWarn,
  error: logError,
};
