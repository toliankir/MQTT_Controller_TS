import { MqttItem } from './state_contract';
import { RuleItem, SettedValues } from './rule_contract';
export interface ArchiveStoage {
    saveState(mqttItems: MqttItem[], deviceType: String[]): Promise<number>
    getByDeviceId(deviceId: String, limit: number): Promise<DeviceResponse>
    getByDeviceIdAndParameter(deviceId: String, parameter: String, limit: number): Promise<DeviceResponse>

    addRule(rule: String, values: SettedValues, target: String): Promise<number>;
    getRule(id: number): Promise<RuleItem>;
    updateRule(id: number, rule: String, values: SettedValues, target: String): void;
    deleteRule(id: number): void;
    getRules(): Promise<RuleItem[]>
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
