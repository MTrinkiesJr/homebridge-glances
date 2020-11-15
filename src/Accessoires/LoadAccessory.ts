import {
    CharacteristicGetCallback,
    API,
    HAP,
    Logging,
    Service,
    CharacteristicEventTypes,
  } from "homebridge";

  import {BaseAccessory} from "./BaseAccessory";
  
  export class LoadAccessory extends BaseAccessory {
  
    private readonly log: Logging;
    value: number;
    public LoadService: Service;
  
    constructor(hap: HAP, api: API, log: Logging, name: string, value: number) {
      super(name, api);
      this.log = log;
      this.value = value;

      this.LoadService = new hap.Service.ServiceLabel(this.Name);
      this.LoadService.getCharacteristic(hap.Characteristic.ServiceLabelNamespace)
        .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
          callback(undefined, this.float2int(this.value));
        });

        this.LoadService.getCharacteristic(hap.Characteristic.ChargingState)
        .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
          callback(undefined, 0);
        });

        this.LoadService.getCharacteristic(hap.Characteristic.StatusLowBattery)
        .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
          callback(undefined, 0);
        });

        this.Accessory = new this.API.platformAccessory(this.Name, hap.uuid.generate(this.Name));
        this.Accessory.addService(this.LoadService);
    }
  
    float2int (value: number) {
      return value | 0;
  }
  
  }