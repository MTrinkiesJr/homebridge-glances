import {
    Logging,
    AccessoryPlugin,
    HAP,
} from "homebridge";
import { HandlerBase } from "./HandlerBase";
import { LoadAccessory } from "../Accessoires/LoadAccessory"
import { CpuInfo } from "../Models/CpuInfo"
const got = require('got');
let request = require('request');

export class CpuHandler extends HandlerBase {
    TotalCpuSensor: LoadAccessory;

    constructor(hap: HAP, prefix: string, hostname: string, port: number, log: Logging) {
        super(hap, prefix, hostname, port, log);
        this.TotalCpuSensor = {} as LoadAccessory;
    }

    getServices(accessories: AccessoryPlugin[], callback: (accessoires: AccessoryPlugin[]) => void): void {
        this.log.info("CpuHandler: starting discovery");
        let self = this;
        this.getCpuInfo(function (cpuInfo) {
            self.TotalCpuSensor = new LoadAccessory(self.hap, self.log, self.prefix + " CPU TOTAL", cpuInfo.total);

            accessories.push(self.TotalCpuSensor);
            self.log.info("CpuHandler: discovery finished");
            callback(accessories);
        });
    }

    private getCpuInfo(callback: (cpuInfo: CpuInfo) => void): void {
        let self = this;

        let cpuInfo: CpuInfo;
        cpuInfo = {} as CpuInfo;

        var res = request('http://' + this.hostname + ':' + this.port + '/api/3/cpu', { json: true }, function (error: any, response: any, body: any) {
            if (error) {
                self.log.info("request error: " + error);
            }
            callback(response.body as CpuInfo);
        });
    }

    updateServices(): void {
        let self = this;
        this.getCpuInfo(function (cpuInfo) {
            if (self.TotalCpuSensor) {
                self.TotalCpuSensor?.LoadService.getCharacteristic(self.hap.Characteristic.BatteryLevel).updateValue(cpuInfo.total);
            }
        });
    };
}