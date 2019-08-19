const LOG_TO_CONSOLE = true;
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

var logger = createLogger({
	format: format.simple(),
	transports: [
		new transports.Console({silent: !LOG_TO_CONSOLE, stderrLevels: ['error', 'warn', 'info']}),
		new (transports.DailyRotateFile)({
			filename: 'logs/absinthe-%DATE%.log',
			datePattern: 'YYYY-MM-DD-HH',
			zippedArchive: true,
			maxSize: '20m',
			maxFiles: '14d'
		}),
	],

	exceptionHandlers: [
		new transports.Console({silent: !LOG_TO_CONSOLE, stderrLevels: ['error', 'warn', 'info']}),
		new (transports.DailyRotateFile)({
			filename: 'logs/absinthe-%DATE%.exceptions.log',
			datePattern: 'YYYY-MM-DD-HH',
			zippedArchive: true,
			maxSize: '20m',
			maxFiles: '14d'
		}),
	]

});

module.exports = logger;