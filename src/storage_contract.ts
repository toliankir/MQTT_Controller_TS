export interface Storage {
    save(mqttEvent: MqttEvent): boolean
    getStorage(): MqttEvent[]
    getValue(deviceId: string, parameter: string): any;
}

export interface MqttEvent {
    deviceId: string,
    deviceType: string,
    parameter: string,
    value: number | boolean
}