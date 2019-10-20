export interface DeviceStateStorage {
    save(mqttEvent: MqttItem): boolean
    getStorage(): MqttItem[]
    getValue(deviceId: string, parameter: string): any;
    onStateChange(func: Function): void;
    purgeState():void;
}

export interface MqttItem {
    deviceId: string,
    deviceType: string,
    parameter: string,
    value: number | boolean
    timestamp: number
}