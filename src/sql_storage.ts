import { ArchiveStoage } from './storage_contract';
import { MqttItem } from './state_contract'
import mysql from 'mysql';
import { MqttClient } from 'mqtt';

export default new class SqlArchiveStorage implements ArchiveStoage {
    connection: mysql.Connection;

    constructor() {
        this.connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'esp'
        });
    }


    saveState(mqttItems: MqttItem[], deviceType: String[]): void {

        for (let item of mqttItems) {
            if (deviceType.indexOf(item.deviceType) !== -1) {
                this.connection.query('INSERT INTO state_archive SET ?', item, (err, res, fiels) => {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        }
    }

}