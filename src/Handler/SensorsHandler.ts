import type {
  Logging,
  API,
  HAP,
} from 'homebridge';
import { HandlerBase } from './HandlerBase.js';
import type { BaseAccessory } from '../Accessoires/BaseAccessory.js';
import { SensorInfo } from '../Models/SensorInfo.js';
import { TemperatureAccessory } from '../Accessoires/TemperatureAccessory.js';
import ky, { HTTPError } from 'ky';

export class SensorsHandler extends HandlerBase {
  private sensors: TemperatureAccessory[] = [];
  constructor(hap: HAP,api: API, prefix: string, hostname: string, port: number, log: Logging) {
    super(hap,api, prefix, hostname, port, log);
  }

  async getServices(): Promise<BaseAccessory[]> {
    this.log.info('SensorsHandler: starting discovery');

    const accessories: BaseAccessory[] = [];
    const sensors = await this.getSensors();

    this.log.info(`SensorsHandler: received (${sensors.length}): '${JSON.stringify(sensors)}'`);

    for (const item of sensors) {
      if (item.type === 'temperature_core') {
        this.log.info(`Adding: ${this.prefix} ${item.label}`);
        const accessory = new TemperatureAccessory(this.hap, this.api, this.log, `${this.prefix} ${item.label}`, item.value.toString());
        this.sensors.push(accessory);
        accessories.push(accessory);
      }
    }
    this.log.info('SensorsHandler: discovery finished');
    return Promise.resolve(accessories);
  }

  private async getSensors(): Promise<SensorInfo[]> {
    try {
      const api = ky.create({
        prefixUrl: `http://${this.hostname}:${this.port}/api`,
        timeout: 5000,
        retry: { limit: 1 },
      });
      try {
        const sensors = await api.get('4/sensors').json<SensorInfo[]>();
        return sensors;
      } catch (err: unknown) {
        if (err instanceof HTTPError) {
          if (err.response?.status === 404) {
            this.log.debug('SensorsHandler: v4 endpoint not found, falling back to v3');
            const sensorsv3 = await api.get('3/sensors').json<SensorInfo[]>();
            return sensorsv3;
          }
          throw new Error(`HTTP ${err.response.status}: ${err.message}`);
        }
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.log.error(`SensorsHandler: Failed request: '${msg}'`);
    }
    return [];
  }

  async updateServices(): Promise<void> {
    const sensors = await this.getSensors();
    for (const sensor of sensors) {
      if (sensor.type === 'temperature_core') {
        const name = `${this.prefix} ${sensor.label}`;
        const existingItem = this.sensors.find(a => a.Name === name);
        if (existingItem) {
          existingItem.TempService.getCharacteristic(this.hap.Characteristic.CurrentTemperature).updateValue(sensor.value);
        }
      }
    }
  };
}

