import {
    Logging,
    AccessoryPlugin,
    HAP,
} from "homebridge";
import { HandlerBase } from "./HandlerBase";
import { SensorInfo } from "../Models/SensorInfo"
import { TemperatureAccessory } from "../Accessoires/TemperatureAccessory"
let request = require('request');

export class SensorsHandler extends HandlerBase {
    sensors: TemperatureAccessory[];
    constructor(hap: HAP, prefix: string, hostname: string, port: number, log: Logging) {
        super(hap, prefix, hostname, port, log);
        this.sensors = [];
    }

    getServices(accessories: AccessoryPlugin[], callback: (accessoires: AccessoryPlugin[]) => void): void {
        this.log.info("SensorsHandler: starting discovery");
        let self = this;
        this.getSensors(function (sensors) {

            self.log.info("SensorsHandler: received (" + sensors?.length + "): '" + JSON.stringify(sensors) + "'");

            for (let i = 0; i < sensors.length; i++) {
                let item = sensors[i] as SensorInfo;
                if (item.type == "temperature_core") {
                    var accessory = new TemperatureAccessory(self.hap, self.log, self.prefix + " " + item.label, item.value.toString());
                    self.sensors.push(accessory);
                    accessories.push(accessory);
                }
            }
            self.log.info("SensorsHandler: discovery finished");
            callback(accessories);
        });
    }

    private getSensors(callback: (sensors: SensorInfo[]) => void): void {
        let self = this;
        let req = request('http://' + this.hostname + ':' + this.port + '/api/3/sensors', { json: true }, function (error: any, response: any, body: any) {
            if (error) {
                self.log.error("request error: " + error);
                return [];
            }
            callback(response.body as SensorInfo[]);
        });
    }

    updateServices(): void {
        let self = this;
        this.getSensors(function (sensors) {
            for (let i = 0; i < sensors.length; i++) {
                var sensor = sensors[i];
                if (sensor.type == "temperature_core") {

                    var existendItem = self.sensors.find(a => (a as TemperatureAccessory).name == (self.prefix + " " + sensor.label));

                    if (existendItem) {
                        existendItem?.TempService.getCharacteristic(self.hap.Characteristic.CurrentTemperature).updateValue(sensor.value);
                    }
                }
            }
        });
    };
}