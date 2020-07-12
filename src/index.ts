import { AccessoryPlugin, API, HAP, Logging, PlatformConfig, StaticPlatformPlugin } from "homebridge";
import { TemperatureSensor } from "./TemperatureAccessory";
import { SensorItem } from "./SensorItem";
let request = require('request');
let AsyncLock = require('async-lock');
let Guid = require('guid');

const PLATFORM_NAME = "GlancesTemperature";

let hap: HAP;
let lock = new AsyncLock({ timeout: 5000, maxPending: 10 });

export = (api: API) => {
  hap = api.hap;
  api.registerPlatform(PLATFORM_NAME, ExampleStaticPlatform);
};

class ExampleStaticPlatform implements StaticPlatformPlugin {

  private readonly log: Logging;
  private readonly hostname: String;
  private readonly port: Number;
  private readonly updateInterval: number;
  private readonly prefix: string;
  private foundAccessories: TemperatureSensor[] = [];

  constructor(log: Logging, config: PlatformConfig, api: API) {
    this.log = log;
    this.hostname = config.hostname;
    this.port = config.port ?? 61208;
    this.updateInterval = config.updateInterval ?? 5000;
    this.prefix = config.prefix ?? "";
    log.info(PLATFORM_NAME + " finished initializing!");
  }

  accessories(callback: (foundAccessories: AccessoryPlugin[]) => void): void {

    let _self = this;

    setInterval(function () {
      _self.updateAccessoires();
    }, _self.updateInterval);

    this.addAccessoires(function (accessoires) {
      callback(accessoires);
      _self.log("found: '" + accessoires.length + "' accessoires");
    });


  }

  addAccessoires(callback: (accessoires: TemperatureSensor[]) => void): void {
    let _self = this;
    this.getSensors(function (sensors) {
      for (let i = 0; i < sensors.length; i++) {
        let item = sensors[i] as SensorItem;
        if (item.type == "temperature_core") {
          var name = (_self.prefix + " " + item.label);
          var accessory = new TemperatureSensor(hap, _self.log, name , item.value.toString());
          _self.foundAccessories.push(accessory);
        }
      }
      callback(_self.foundAccessories);
    });
  }

  getSensors(callback: (accessoires: SensorItem[]) => void): void {
    let _self = this;
    let req = request('http://' + this.hostname + ':' + this.port + '/api/3/sensors', { json: true }, function (error: any, response: any, body: any) {
      if (error) {
        _self.log("request error: " + error);
      }

      let sensors = response.body as SensorItem[];
      callback(sensors);
    });

  }

  updateAccessoires(): void {
    let _self = this;
    let key = Guid.create().value;
    lock.acquire(key, function (done: any) {
      _self.getSensors(function (sensors) {
        for (let i = 0; i < sensors.length; i++) {
          var sensor = sensors[i];
          if (sensor.type == "temperature_core") {

            var existendItem = _self.foundAccessories.find(a => (a as TemperatureSensor).name == (_self.prefix + " " + sensor.label));

            if (existendItem) {
              existendItem?.TempService.getCharacteristic(hap.Characteristic.CurrentTemperature).updateValue(sensor.value);
            }
          }
        }
      });

      done(null, null);
    }, function (err: any, ret: any) {
    });
  };
}


