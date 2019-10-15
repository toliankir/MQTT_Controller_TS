import { MqttItem } from './state_contract';
export interface ArchiveStoage {
    saveState(mqttItems: MqttItem[], deviceType: String[]): void
}