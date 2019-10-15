import { DeviceStateStorage, MqttItem } from './storage_contract';

class TestStorage implements DeviceStateStorage {
    localStorage: MqttItem[] = [];

    save(mqttEvent: MqttItem): boolean {
        const eventFromStorage: MqttItem | undefined = this.localStorage.find((el) =>
            el.deviceId === mqttEvent.deviceId
            && el.deviceType === mqttEvent.deviceType
            && el.parameter === mqttEvent.parameter);
        if (!eventFromStorage) {
            this.localStorage.push(mqttEvent);
            return true;
        }

        eventFromStorage.value = mqttEvent.value;
        return true;
    }

    getStorage() {
        return this.localStorage;
    }

    getValue(deviceId: string, parameter: string) {
        const device = this.localStorage.find(el => el.deviceId === deviceId && el.parameter === parameter);
        return device ? device.value : null;
    }
}

export default new TestStorage();
