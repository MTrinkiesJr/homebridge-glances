import {
    AccessoryPlugin,
    CharacteristicGetCallback,
    HAP,
    Logging,
    Service,
    CharacteristicEventTypes,
    CharacteristicValue
  } from "homebridge";
  
  export class TemperatureSensor implements AccessoryPlugin {
  
    private readonly log: Logging;

    name: string;
    value: string;
  
    public TempService: Service;
    private readonly informationService: Service;
  
    constructor(hap: HAP, log: Logging, name: string, value: string) {
      this.log = log;
      this.name = name;
      this.value = value;
  
      this.TempService = new hap.Service.TemperatureSensor(name);
      this.TempService.getCharacteristic(hap.Characteristic.CurrentTemperature)
        .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
          callback(undefined, value);
        });
  
      this.informationService = new hap.Service.AccessoryInformation();
        // .setCharacteristic(hap.Characteristic.Manufacturer, "Custom Manufacturer")
        // .setCharacteristic(hap.Characteristic.Model, "Custom Model");
  
      log.info("Temperature '%s' created!", name);
    }
  
    identify(): void {
      this.log("Identify!");
    }
  
    getServices(): Service[] {
      return [
        this.informationService,
        this.TempService,
      ];
    }
  
  }