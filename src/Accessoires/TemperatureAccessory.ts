import {
  API,
  CharacteristicGetCallback,
  HAP,
  Logging,
  Service,
  CharacteristicEventTypes,
} from 'homebridge';

import { BaseAccessory } from './BaseAccessory.js';

export class TemperatureAccessory extends BaseAccessory {

  private readonly log: Logging;

  value: string;

  public TempService: Service;
  hap: HAP;

  constructor(hap: HAP, api:API, log: Logging, name: string, value: string) {
    super(name, api);
    this.log = log;
    this.value = value;
    this.hap = hap;

    this.TempService = new this.hap.Service.TemperatureSensor(this.Name, this.hap.uuid.generate(this.Name + '_data'));
    this.TempService.getCharacteristic(this.hap.Characteristic.CurrentTemperature)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        callback(undefined, this.value);
      });

    this.Accessory = new this.API.platformAccessory(this.Name, hap.uuid.generate(this.Name));
    this.Accessory.addService(this.TempService);
  }

  getServices(): Service[] {
    return [this.TempService];
  }
}