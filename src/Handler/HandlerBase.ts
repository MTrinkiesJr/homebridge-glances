import {
  HAP,
  API,
  Logging,
} from 'homebridge';
  
import { BaseAccessory } from '../Accessoires/BaseAccessory.js';

export abstract class HandlerBase {

  protected constructor(
    protected readonly hap: HAP,
    protected readonly api: API, 
    protected readonly prefix: string, 
    protected readonly hostname: string, 
    protected readonly port: number, 
    protected readonly log: Logging,
  ) {}

    abstract getServices(): Promise<BaseAccessory[]>

    abstract updateServices() : Promise<void>;
}
