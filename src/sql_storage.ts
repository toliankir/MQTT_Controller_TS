import { ArchiveStoage, byDeviceIdResponse } from './storage_contract';
import { MqttItem } from './state_contract'
import mysql from 'mysql';
import { MqttClient } from 'mqtt';

export default new class SqlArchiveStorage implements ArchiveStoage {
  
    connection: mysql.Connection;

    constructor() {
        this.connection = mysql.createConnection({
            host: 'localhost',
            user: 'wm',
            password: '1234',
            database: 'esp'
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

    getByDeviceId(deviceId: String): Promise<byDeviceIdResponse> {
        throw new Error("Method not implemented.");
    }
    

}