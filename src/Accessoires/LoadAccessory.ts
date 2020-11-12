import {
    AccessoryPlugin,
    CharacteristicGetCallback,
    HAP,
    Logging,
    Service,
    CharacteristicEventTypes,
    CharacteristicValue
  } from "homebridge";
  
  export class LoadAccessory implements AccessoryPlugin {
  
    private readonly log: Logging;

    name: string;
    value: number;
  
    public LoadService: Service;
    public InformationService: Service;
  
    constructor(hap: HAP, log: Logging, name: string, value: number) {
      this.log = log;
      this.name = name;
      this.value = value;
  
      this.LoadService = new hap.Service.BatteryService(name);
      this.LoadService.getCharacteristic(hap.Characteristic.BatteryLevel)
        .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
          callback(undefined, this.float2int(value));
        });

        this.LoadService.getCharacteristic(hap.Characteristic.ChargingState)
        .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
          callback(undefined, 0);
        });

        this.LoadService.getCharacteristic(hap.Characteristic.StatusLowBattery)
        .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
          callback(undefined, 0);
        });
  
      this.InformationService = new hap.Service.AccessoryInformation()
        .setCharacteristic(hap.Characteristic.Manufacturer, "Michael Trinkies")
        .setCharacteristic(hap.Characteristic.Model, "Homebridge Glances Plugin (load)");
  
      log.info("LoadAccessory '%s' created!", name);
    }
  
    identify(): void {
      this.log("Identify!");
    }
  
    getServices(): Service[] {
      return [
        this.InformationService,
        this.LoadService,
      ];
    }

    float2int (value: number) {
      return value | 0;
  }
  
  }