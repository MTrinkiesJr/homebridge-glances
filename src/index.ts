import { AccessoryPlugin, API, HAP, Logging, PlatformConfig, StaticPlatformPlugin } from "homebridge";
import { TemperatureSensor } from "./TemperatureAccessory";
import { SensorItem } from "./SensorItem";
let request = require('request');

const PLATFORM_NAME = "GlancesTemperature";

let hap: HAP;

export = (api: API) => {
  hap = api.hap;

  api.registerPlatform(PLATFORM_NAME, ExampleStaticPlatform);
};

class ExampleStaticPlatform implements StaticPlatformPlugin {

  private readonly log: Logging;
  private readonly hostname: String;
  private readonly port: Number;
  private foundAccessories: TemperatureSensor[] = [];

  constructor(log: Logging, config: PlatformConfig, api: API) {
    this.log = log;
    this.hostname = config.hostname;
    this.port = config.port;
    log.info(PLATFORM_NAME + " finished initializing!");
  }

  accessories(callback: (foundAccessories: AccessoryPlugin[]) => void): void {

    let _self = this;
    this.addAccessoires(function (accessoires) {
      // setTimeout(function () {
      //   _self.updateAccessoires();
      // }, 5000);
      callback(accessoires);
    });

  }

  addAccessoires(callback: (accessoires: TemperatureSensor[]) => void): void {
    let _self = this;
    this.getSensors(function (sensors) {
      for (let i = 0; i < sensors.length; i++) {
        let item = sensors[i] as SensorItem;
        if (item.type == "temperature_core") {
          var accessory = new TemperatureSensor(hap, _self.log, item.label, item.value.toString());
          _self.log("addedd: " + item.label);
          _self.foundAccessories.push(accessory);
        }
      }
    });
  }

  getSensors(callback: (accessoires: SensorItem[]) => void): void {

    try {
      let _self = this;
      let req = request('http://' + this.hostname + ':' + this.port + '/api/3/sensors', { json: true }, function (error: any, response: any, body: any) {
        if (error) {
          _self.log("request error: " + error);
        }

        let sensors = response.body as SensorItem[];
        callback(sensors);
      });
    }
    catch (e) {
      this.log("error: '" + e + "'");
    }
  }

  updateAccessoires(): void {
    let _self = this;
    this.getSensors(function (sensors) {
      for (let i = 0; i < sensors.length; i++) {
        var sensor = sensors[i];
        if (sensor.type == "temperature_core") {

          var existendItem = _self.foundAccessories.find(a => (a as TemperatureSensor).name == sensor.label);

          if (existendItem) {
            _self.log("updating: " + sensor.label);
            existendItem?.TempService.getCharacteristic(hap.Characteristic.CurrentTemperature).updateValue(sensor.value);
          }
        }
      }
    });
  }
}


