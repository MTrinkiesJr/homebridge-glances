import type {
  Logging,
  API,
  HAP,
} from 'homebridge';
import { HandlerBase } from './HandlerBase.js';
import type { BaseAccessory } from '../Accessoires/BaseAccessory.js';
import { LoadAccessory } from '../Accessoires/LoadAccessory.js';
import type { CpuInfo } from '../Models/CpuInfo.js';
import ky, { HTTPError } from 'ky';

export class CpuHandler extends HandlerBase {
  private TotalCpuSensor?: LoadAccessory;

  constructor(hap: HAP,api: API, prefix: string, hostname: string, port: number, log: Logging) {
    super(hap, api,prefix, hostname, port, log);
  }

  async getServices(): Promise<BaseAccessory[]> {
    this.log.info('CpuHandler: starting discovery');
    const cpuInfo = await this.getCpuInfo();

    this.log.info(`CpuHandler: received '${JSON.stringify(cpuInfo)}'`);

    if (cpuInfo && typeof cpuInfo.total === 'number') {
      this.TotalCpuSensor = new LoadAccessory(this.hap,this.api, this.log, `${this.prefix} CPU TOTAL`, cpuInfo.total);
      this.log.info('CpuHandler: discovery finished');
      return [this.TotalCpuSensor];
    }
    return [];
  }

  private async getCpuInfo(): Promise<CpuInfo> {
    try {
      const api = ky.create({
        prefixUrl: `http://${this.hostname}:${this.port}/api`,
        timeout: 5000,
        retry: { limit: 1 },
      });
      try {
        const cpu = await api.get('4/cpu').json<CpuInfo>();
        return cpu;
      } catch (err: unknown) {
        if (err instanceof HTTPError) {
          if (err.response?.status === 404) {
            this.log.debug('CPUHandler: v4 endpoint not found, falling back to v3');
            const cpuV3 = await api.get('3/cpu').json<CpuInfo>();
            return cpuV3;
          }
          throw new Error(`HTTP ${err.response.status}: ${err.message}`);
        }
        throw err instanceof Error ? err : new Error(String(err)); // Non-HTTP errors: normalize to Error
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.log.error(`CpuHandler: Failed request: '${msg}'`);
      return {} as CpuInfo;
    }
  }

  async updateServices(): Promise<void> {
    const cpuInfo = await this.getCpuInfo();
    if (this.TotalCpuSensor) {
      this.TotalCpuSensor.LoadService.getCharacteristic(this.hap.Characteristic.CurrentRelativeHumidity).updateValue(cpuInfo.total);
    }
  };
}
