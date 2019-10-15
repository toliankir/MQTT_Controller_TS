"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TestStorage {
    constructor() {
        this.localStorage = [];
    }
    save(mqttEvent) {
        const eventFromStorage = this.localStorage.find((el) => el.deviceId === mqttEvent.deviceId
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
    getValue(deviceId, parameter) {
        const device = this.localStorage.find(el => el.deviceId === deviceId && el.parameter === parameter);
        return device ? device.value : null;
    }
}
exports.default = new TestStorage();
