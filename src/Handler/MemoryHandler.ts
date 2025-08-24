import type {
  Logging,
  API,
  HAP,
} from 'homebridge';
import { HandlerBase } from './HandlerBase.js';
import type { BaseAccessory } from '../Accessoires/BaseAccessory.js';
import { LoadAccessory } from '../Accessoires/LoadAccessory.js';
import type { MemoryInfo } from '../Models/MemoryInfo.js';
import ky, { HTTPError } from 'ky';

export class MemoryHandler extends HandlerBase {
  private UsedMemoryInfo?: LoadAccessory;

  constructor(hap: HAP,api: API, prefix: string, hostname: string, port: number, log: Logging) {
    super(hap, api, prefix, hostname, port, log);
  }

  async getServices(): Promise<BaseAccessory[]> {
    this.log.info('MemoryHandler: starting discovery');
    const memoryInfo = await this.getMemoryInfo();

    this.log.info(`MemoryHandler: received '${JSON.stringify(memoryInfo)}'`);
    if (memoryInfo && typeof memoryInfo.total === 'number') {
      this.UsedMemoryInfo = new LoadAccessory(this.hap,this.api, this.log, this.prefix + ' MEMORY USED', memoryInfo.percent);
      this.log.info('MemoryHandler: discovery finished');
      return [this.UsedMemoryInfo];
    }
    return [];
  }

  private async getMemoryInfo(): Promise<MemoryInfo> {
    try {
      const api = ky.create({
        prefixUrl: `http://${this.hostname}:${this.port}/api`,
        timeout: 5000,
        retry: { limit: 1 },
      });
      try {
        const mem = await api.get('4/mem').json<MemoryInfo>();
        return mem;
      } catch (err: unknown) {
        if (err instanceof HTTPError) {
          if (err.response?.status === 404) {
            this.log.debug('CPUHandler: v4 endpoint not found, falling back to v3');
            const memV3 = await api.get('3/mem').json<MemoryInfo>();
            return memV3;
          }
          throw new Error(`HTTP ${err.response.status}: ${err.message}`);
        }
        throw err instanceof Error ? err : new Error(String(err)); // Non-HTTP errors: normalize to Error
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.log.error(`MemoryHandler: Failed request: '${msg}'`);      
    }
    return {} as MemoryInfo;
  }

  async updateServices(): Promise<void> {
    const memoryInfo = await this.getMemoryInfo();
    if (this.UsedMemoryInfo) {
      this.UsedMemoryInfo.LoadService.getCharacteristic(this.hap.Characteristic.CurrentRelativeHumidity).updateValue(memoryInfo.percent);
    }
  };
}
