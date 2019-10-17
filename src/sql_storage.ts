import { ArchiveStoage, DeviceResponse, DeviceItem } from './storage_contract';
import { MqttItem } from './state_contract'
import mysql from 'mysql';

export default new class SqlArchiveStorage implements ArchiveStoage {

    connection: mysql.Connection;

    constructor() {
        if (!process.env.MYSQL_HOST || !process.env.MYSQL_USER || !process.env.MYSQL_PASSWORD || !process.env.MYSQL_DB) {
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
                    this.connection.query('INSERT INTO state_archive SET ?', item, (err, res, fields) => {
                        if (err) {
                            console.log(err);
                            return reject(err);
                        }
                    });
                }
            }
            return resolve(itemsCount);
        });
    }

    getByDeviceId(deviceId: String): Promise<DeviceResponse> {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT value, UNIX_TIMESTAMP(timestamp) as timestamp FROM state_archive WHERE deviceId = ?;', [deviceId], (err, res, fields) => {
                if (err) {
                    console.log(err);
                    return reject(err);
                }
                console.log(res);
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