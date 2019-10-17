import { MqttItem } from './state_contract';
export interface ArchiveStoage {
    saveState(mqttItems: MqttItem[], deviceType: String[]): Promise<number>
    getByDeviceId(deviceId: String): Promise<DeviceResponse>
}

export interface DeviceItem {
    timestamp: number,
    value: number
}

export interface DeviceResponse {
    deviceId: String,
    deviceType: String,
    state: DeviceItem[]
}