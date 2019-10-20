import {createLogger, transports, format} from 'winston';
const {combine, timestamp, printf} = format;

export default createLogger({
    transports: [
        new transports.Console({
            level: 'info',
            format: combine(
                timestamp(),
                printf(({ level, message, timestamp }) => {
                    return `${timestamp.replace('T', ' ').replace(/(\.\d+Z)$/, '')} ${level}: ${message}`;
                }),
                format.colorize({ all: true })
            )
        })
    ]
});
