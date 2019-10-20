import { ArchiveStoage, DeviceResponse, DeviceItem } from './contract/storage_contract';
import { RuleItem, SettedValues } from './contract/rule_contract';
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
                            return reject(err.message);
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

    getByDeviceId(deviceId: String, limit: number = 200): Promise<DeviceResponse> {
        return new Promise((resolve, reject) => {
            this.connection.query(`SELECT value, parameter, UNIX_TIMESTAMP(timestamp) as timestamp FROM state_archive WHERE deviceId = ? ORDER BY id DESC LIMIT ${limit};`, [deviceId], (err, res, fields) => {
                if (err) {
                    logger.log({
                        level: 'error',
                        message: `MYSQL: ${err.message}`
                    });
                    return reject(err.message);
                }
                logger.log({
                    level: 'debug',
                    message: `MYSQL: Select device #${deviceId} from DB.`
                });
                return resolve({
                    deviceId: deviceId,
                    deviceType: res[0] ? res[0].deviceType : "",
                    state: res.map((el: any) => {
                        return {
                            timestamp: el.timestamp,
                            parameter: el.parameter,
                            value: el.value
                        };
                    })
                });
            });
        });
    }

    getByDeviceIdAndParameter(deviceId: String, parameter: String, limit: number = 200): Promise<DeviceResponse> {
        return new Promise((resolve, reject) => {
            this.connection.query(`SELECT value, UNIX_TIMESTAMP(timestamp) as timestamp FROM state_archive WHERE deviceId = ? ORDER BY id DESC LIMIT ${limit};`, [deviceId], (err, res, fields) => {
                if (err) {
                    logger.log({
                        level: 'error',
                        message: `MYSQL: ${err.message}`
                    });
                    return reject(err.message);
                }
                logger.log({
                    level: 'debug',
                    message: `MYSQL: Select device #${deviceId} from DB.`
                });
                return resolve({
                    deviceId: deviceId,
                    deviceType: res[0] ? res[0].deviceType : "",
                    state: res.map((el: any) => {
                        return {
                            timestamp: el.timestamp,
                            value: el.value
                        };
                    })
                });
            });
        });

    }

    addRule(rule: String, { defaultValue, trueValue, falseValue }: SettedValues, target: String): Promise<number> {
        return new Promise((resolve, reject) => {
            this.connection.query('INSERT INTO rules SET ?', {
                rule,
                defaultValue,
                trueValue,
                falseValue,
                target
            }, (err, res) => {
                if (err) {
                    logger.log({
                        level: 'error',
                        message: `MYSQL: ${err.message}`
                    });
                    return reject(err.message);
                }
                logger.log({
                    level: 'debug',
                    message: `MYSQL: Save rule ${rule} in DB.`
                });
                return resolve(res.insertId);
            });
        });
    }

    getRule(id: number): Promise<RuleItem> {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT * FROM rules WHERE id = ?', [id], (err, res) => {
                if (err) {
                    logger.log({
                        level: 'error',
                        message: `MYSQL: ${err.message}`
                    });
                    return reject(err.message);
                }
                logger.log({
                    level: 'debug',
                    message: `MYSQL: Get rule #${id} from DB.`
                });
                if (!res[0]) {
                    throw new Error(`Rule ${id} don't found in DB.`);
                }
                return resolve({
                    id: res[0].id,
                    rule: res[0].rule,
                    target: res[0].target,
                    values: {
                        defaultValue: res[0].defaultValue,
                        trueValue: res[0].trueValue,
                        falseValue: res[0].falseValue
                    }
                });
            });
        });
    }

    updateRule(id: number, rule: String, { defaultValue, trueValue, falseValue }: SettedValues, target: String): void {
        this.connection.query('UPDATE rules SET ? WHERE id = ?', [{
            rule,
            defaultValue,
            trueValue,
            falseValue,
            target
        }, id], (err) => {
            if (err) {
                logger.log({
                    level: 'error',
                    message: `MYSQL: ${err.message}`
                });
                throw Error(err.message);
            }
            logger.log({
                level: 'debug',
                message: `MYSQL: Update rule #${id} to ${rule} in DB.`
            });
        });
    }

    deleteRule(id: number): void {
        this.connection.query('DELETE FROM rules WHERE id = ?', [id], (err, res, fields) => {
            if (err) {
                logger.log({
                    level: 'error',
                    message: `MYSQL: ${err.message}`
                });
                throw Error(err.message);
            }
            logger.log({
                level: 'debug',
                message: `MYSQL: Delete rule #${id} from DB.`
            });
        });
    }

    getRules(): Promise<RuleItem[]> {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT * FROM rules', (err, res) => {
                if (err) {
                    logger.log({
                        level: 'error',
                        message: `MYSQL: ${err.message}`
                    });
                    return reject(err.message);
                }
                logger.log({
                    level: 'debug',
                    message: `MYSQL: Get all rules.`
                });
                return resolve(res.map((el: any) => {
                    return {
                        id: el.id,
                        rule: el.rule,
                        target: el.target,
                        values: {
                            defaultValue: el.defaultValue,
                            trueValue: el.trueValue,
                            falseValue: el.falseValue
                        }
                    }
                }));
            });
        });
    }
}