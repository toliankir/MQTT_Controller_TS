import state from './state';
import { MqttItem } from './contract/state_contract';



export function initVirtualDevices() {
    setInterval(() => {initTimeDevice()}, 5000);

}

function initTimeDevice() {
    const dt = new Date();
    state.save({
        deviceId: 'time_from_day_begin',
        deviceType: 'virtual_device',
        parameter: 'currentTime',
        value: dt.getSeconds() + (60 * dt.getMinutes()) + (60 * 60 * dt.getHours()),
        timestamp: Math.floor(Date.now() / 1000)
    });
}