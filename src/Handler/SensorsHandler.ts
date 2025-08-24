import {
    Logging,
    API,
    HAP,
} from "homebridge";
import { HandlerBase } from "./HandlerBase";
import { BaseAccessory } from "../Accessoires/BaseAccessory";
import { SensorInfo } from "../Models/SensorInfo"
import { TemperatureAccessory } from "../Accessoires/TemperatureAccessory"
const got = require('got');

export class SensorsHandler extends HandlerBase {
    sensors: TemperatureAccessory[];
    constructor(hap: HAP,api: API, prefix: string, hostname: string, port: number, log: Logging) {
        super(hap,api, prefix, hostname, port, log);
        this.sensors = [];
    }

    async getServices(): Promise<BaseAccessory[]> {
        this.log.info("SensorsHandler: starting discovery");
        let sensors = await this.getSensors() as SensorInfo[];
        let accessories: BaseAccessory[];
        accessories = [];

        this.log.info("SensorsHandler: received (" + sensors?.length + "): '" + JSON.stringify(sensors) + "'");

        for (let i = 0; i < sensors.length; i++) {
            let item = sensors[i] as SensorInfo;
            if (item.type == "temperature_core") {
                this.log.info("Adding: " + this.prefix + " " + item.label);
                var accessory = new TemperatureAccessory(this.hap, this.api, this.log, this.prefix + " " + item.label, item.value.toString());
                this.sensors.push(accessory);
                accessories.push(accessory);
            }
        }
        this.log.info("SensorsHandler: discovery finished");
        return Promise.resolve(accessories);
    }

    private async getSensors(): Promise<SensorInfo[]> {
        try {
            let response = await got('http://' + this.hostname + ':' + this.port + '/api/4/sensors');

            if (response.statusCode == 200) {
                return Promise.resolve(JSON.parse(response.body) as SensorInfo[])
            }
            // Check for glances version 3 api
            if (response.statusCode == 404) {
              this.log.info("SensorHandler: v4 endpoint not found, falling back to v3");
              let responsev3 = await got('http://' + this.hostname + ':' + this.port + '/api/3/sensors');
              if (responsev3.statusCode === 200) {
                return Promise.resolve([]);
              }
            }            
        } catch (error) {
            this.log.error("SensorsHandler: Failed request: '" + error + "'")
        }
        return Promise.resolve([]);
    }

    async updateServices(): Promise<void> {
        let sensors = await this.getSensors();
        for (let i = 0; i < sensors.length; i++) {
            var sensor = sensors[i];
            if (sensor.type == "temperature_core") {

                var existendItem = this.sensors.find(a => (a as TemperatureAccessory).Name == (this.prefix + " " + sensor.label));

                if (existendItem) {
                    existendItem?.TempService.getCharacteristic(this.hap.Characteristic.CurrentTemperature).updateValue(sensor.value);
                }
            }
        }
    };
}
