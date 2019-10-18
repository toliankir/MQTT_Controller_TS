import { ArchiveStoage, DeviceResponse, DeviceItem } from './contract/storage_contract';
import { MqttItem } from './contract/state_contract'
import mysql from 'mysql';
import logger from './logger';

export default new class SqlArchiveStorage implements ArchiveStoage {

    connection: mysql.Connection;

    constructor() {
        if (!process.env.MYSQL_HOST || !process.env.MYSQL_USER || !process.env.MYSQL_PASSWORD || !process.env.MYSQL_DB) {
            logger.log({
                level: 'error',
                message: 'MYSQL: Missing arguments for MYSQL DB connection. Check .env'
            });
            throw new Error('Missing arguments for MYSQL DB connection. Check .env');
        }

        this.connection = mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB
        });
    }

    saveState(mqttItems: MqttItem[], deviceType: String[]): Promise<number> {
        return new Promise((resolve, reject) => {
            let itemsCount = 0;
            for (let item of mqttItems) {
                if (deviceType.indexOf(item.deviceType) !== -1) {
                    itemsCount++;
                    this.connection.query('INSERT INTO state_archive SET ?', {
                        deviceId: item.deviceId,
                        deviceType: item.deviceType,
                        parameter: item.parameter,
                        value: item.value,
                    }, (err, res, fields) => {
                        if (err) {
                            logger.log({
                                level: 'error',
                                message: `MYSQL: ${err.message}`
                            });
                            return reject(err);
                        }
                    });
                }
            }
            logger.log({
                level: 'debug',
                message: `MYSQL: Save in DB ${itemsCount} (${deviceType.reduce((acc, curVal) => acc + ' ' + curVal)}) items.`
            });
            return resolve(itemsCount);
        });
    }

    getByDeviceId(deviceId: String): Promise<DeviceResponse> {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT value, UNIX_TIMESTAMP(timestamp) as timestamp FROM state_archive WHERE deviceId = ?;', [deviceId], (err, res, fields) => {
                if (err) {
                    logger.log({
                        level: 'error',
                        message: `MYSQL: ${err.message}`
                    });
                    return reject(err);
                }
                logger.log({
                    level: 'debug',
                    message: `MYSQL: Select device #${deviceId} from DB.`
                });
                return resolve({
                    deviceId: deviceId,
                    deviceType: res[0] ? res[0].deviceType : "",
                    state: res.map((el: any) => {
                        return { timestamp: el.timestamp, value: el.value };
                    })
                });
            });
        });
    }
}