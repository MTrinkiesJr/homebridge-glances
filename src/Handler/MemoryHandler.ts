import {
    Logging,
    API,
    HAP,
} from "homebridge";
import { HandlerBase } from "./HandlerBase";
import { BaseAccessory } from "../Accessoires/BaseAccessory";
import { LoadAccessory } from "../Accessoires/LoadAccessory"
import { MemoryInfo } from "../Models/MemoryInfo"
const got = require('got');

export class MemoryHandler extends HandlerBase {
    UsedMemoryInfo: LoadAccessory;

    constructor(hap: HAP,api: API, prefix: string, hostname: string, port: number, log: Logging) {
        super(hap, api, prefix, hostname, port, log);
        this.UsedMemoryInfo = {} as LoadAccessory;
    }

    async getServices(): Promise<BaseAccessory[]> {
        this.log.info("MemoryHandler: starting discovery");
        let memoryInfo = await this.getMemoryInfo() as MemoryInfo;
        this.log.info("MemoryHandler: received'" + JSON.stringify(memoryInfo) + "'");
        if (memoryInfo) {
            this.UsedMemoryInfo = new LoadAccessory(this.hap,this.api, this.log, this.prefix + " MEMORY USED", memoryInfo.percent);
            this.log.info("MemoryHandler: discovery finished");
            return Promise.resolve([this.UsedMemoryInfo]);
        }
        return Promise.resolve([]);
    }

    private async getMemoryInfo(): Promise<MemoryInfo> {
        let memoryInfo: MemoryInfo;
        memoryInfo = {} as MemoryInfo;

        try {
            let response = await got('http://' + this.hostname + ':' + this.port + '/api/3/mem');

            if (response.statusCode) {
                return Promise.resolve(JSON.parse(response.body) as MemoryInfo);
            }
        } catch (error) {
            this.log.error("MemoryHandler: Failed request: '" + error + "'")
        }
        return Promise.resolve({} as MemoryInfo);
    }

    async updateServices(): Promise<void> {
        let memoryInfo = await this.getMemoryInfo();
        if (this.UsedMemoryInfo) {
            this.UsedMemoryInfo?.LoadService.getCharacteristic(this.hap.Characteristic.ServiceLabelNamespace).updateValue(memoryInfo.percent);
        }
    };
}