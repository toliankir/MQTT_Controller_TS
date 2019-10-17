import { MqttItem } from './state_contract';
export interface ArchiveStoage {
    saveState(mqttItems: MqttItem[], deviceType: String[]): Promise<number>
    getByDeviceId(deviceId: String): Promise<byDeviceIdResponse>
}

export interface deviceItem {
    timestamp: number,
    value: number
}

export interface byDeviceIdResponse {
    deviceId: String,
    deviceType: String,
    state: deviceItem[]
}