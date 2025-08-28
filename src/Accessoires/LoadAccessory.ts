import {
  CharacteristicGetCallback,
  API,
  HAP,
  Logging,
  Service,
  CharacteristicEventTypes,
} from 'homebridge';

import { BaseAccessory } from './BaseAccessory.js';
  
export class LoadAccessory extends BaseAccessory {
  
  private readonly log: Logging;
  value: number;
  public LoadService: Service;
  
  constructor(hap: HAP, api: API, log: Logging, name: string, value: number) {
    super(name, api);
    this.log = log;
    this.value = value;

    this.LoadService = new hap.Service.HumiditySensor(this.Name);
    this.LoadService.getCharacteristic(hap.Characteristic.CurrentRelativeHumidity)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        callback(undefined, this.float2int(this.value));
      });

    this.Accessory = new this.API.platformAccessory(this.Name, hap.uuid.generate(this.Name));
    this.Accessory.addService(this.LoadService);
  }
  
  float2int (value: number) {
    return value | 0;
  }
  
}