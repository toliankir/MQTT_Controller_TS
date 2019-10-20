import { DeviceStateStorage, MqttItem } from './contract/state_contract';
import logger from './logger';

class TestStateStorage implements DeviceStateStorage {

    localStorage: MqttItem[] = [];
    stateChange: Function | null = null;
    purgeTime = 10 * 60;

    constructor() {
        if (process.env.PURGE_STATE_MINUTES) {
            this.purgeTime = parseInt(process.env.PURGE_STATE_MINUTES) * 60;
        }
        setInterval(() => this.purgeState(), 1 * 10 * 1000);
    }

    onStateChange(func: Function): void {
        this.stateChange = func;
    }

    save(mqttEvent: MqttItem): boolean {
        const eventFromStorage: MqttItem | undefined = this.localStorage.find((el) =>
            el.deviceId === mqttEvent.deviceId
            && el.deviceType === mqttEvent.deviceType
            && el.parameter === mqttEvent.parameter);
        if (!eventFromStorage) {
            this.localStorage.push(mqttEvent);
            return true;
        }
        eventFromStorage.timestamp = mqttEvent.timestamp;
        if (eventFromStorage.value !== mqttEvent.value) {
            eventFromStorage.value = mqttEvent.value;
            if (this.stateChange) this.stateChange();
        }
        return true;
    }

    getStorage() {
        return this.localStorage;
    }

    purgeState(): void {
        const startStateSize = this.localStorage.length;
        const TTLTime = Math.floor(Date.now() / 1000) - this.purgeTime;
        this.localStorage = this.localStorage.filter((el: MqttItem) => el.timestamp > TTLTime);
        logger.log({
            level: 'debug',
            message: `STATE: Purge localState, deleted ${startStateSize}.`
        });
    }

    getValue(deviceId: string, parameter: string) {
        const device = this.localStorage.find(el => el.deviceId === deviceId && el.parameter === parameter);
        if (!device) {
            throw new Error(`Device '${deviceId}' parameter '${parameter}' not found`);
        }
        return device.value;
    }

}

export default new TestStateStorage();
