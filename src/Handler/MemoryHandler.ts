import {
    Logging,
    AccessoryPlugin,
    HAP,
} from "homebridge";
import { HandlerBase } from "./HandlerBase";
import { LoadAccessory } from "../Accessoires/LoadAccessory"
import { MemoryInfo } from "../Models/MemoryInfo"
const got = require('got');
let request = require('request');

export class MemoryHandler extends HandlerBase {
    UsedMemoryInfo: LoadAccessory;

    constructor(hap: HAP, prefix: string, hostname: string, port: number, log: Logging) {
        super(hap, prefix, hostname, port, log);
        this.UsedMemoryInfo = {} as LoadAccessory;
    }

    getServices(accessories: AccessoryPlugin[], callback: (accessoires: AccessoryPlugin[]) => void): void {
        this.log.info("MemoryHandler: starting discovery");
        let self = this;
        this.getMemoryInfo(function (memoryInfo) {
            self.UsedMemoryInfo = new LoadAccessory(self.hap, self.log, self.prefix + " MEMORY USED", memoryInfo.percent);

            accessories.push(self.UsedMemoryInfo);
            self.log.info("MemoryHandler: discovery finished");
            callback(accessories);
        });
    }

    private getMemoryInfo(callback: (memoryInfo: MemoryInfo) => void): void {
        let self = this;

        let memoryInfo: MemoryInfo;
        memoryInfo = {} as MemoryInfo;

        var res = request('http://' + this.hostname + ':' + this.port + '/api/3/mem', { json: true }, function (error: any, response: any, body: any) {
            if (error) {
                self.log.info("request error: " + error);
            }
            callback(response.body as MemoryInfo);
        });
    }

    updateServices(): void {
        let self = this;
        this.getMemoryInfo(function (memoryInfo) {
            if (self.UsedMemoryInfo) {
                self.UsedMemoryInfo?.LoadService.getCharacteristic(self.hap.Characteristic.BatteryLevel).updateValue(memoryInfo.percent);
                self.UsedMemoryInfo?.InformationService.setCharacteristic(self.hap.Characteristic.ConfiguredName, memoryInfo.used + "Bytes / " + memoryInfo.total + " Bytes")
                self.UsedMemoryInfo?.InformationService.getCharacteristic(self.hap.Characteristic.ConfiguredName).updateValue(memoryInfo.used + "Bytes / " + memoryInfo.total + " Bytes");
            }
        });
    };
}