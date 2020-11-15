import {
    Logging,
    API,
    HAP,
} from "homebridge";
import { HandlerBase } from "./HandlerBase";
import { BaseAccessory } from "../Accessoires/BaseAccessory";
import { LoadAccessory } from "../Accessoires/LoadAccessory"
import { CpuInfo } from "../Models/CpuInfo"
const got = require('got');

export class CpuHandler extends HandlerBase {
    TotalCpuSensor: LoadAccessory;

    constructor(hap: HAP,api: API, prefix: string, hostname: string, port: number, log: Logging) {
        super(hap, api,prefix, hostname, port, log);
        this.TotalCpuSensor = {} as LoadAccessory;
    }

    async getServices(): Promise<BaseAccessory[]> {
        this.log.info("CpuHandler: starting discovery");
        let cpuInfo = await this.getCpuInfo() as CpuInfo;

        this.log.info("CpuHandler: received'" + JSON.stringify(cpuInfo) + "'");

        if (cpuInfo) {
            this.TotalCpuSensor = new LoadAccessory(this.hap,this.api, this.log, this.prefix + " CPU TOTAL", cpuInfo.total);
            this.log.info("CpuHandler: discovery finished");
            return Promise.resolve([this.TotalCpuSensor]);
        }
        return Promise.resolve([]);
    }

    private async getCpuInfo(): Promise<CpuInfo> {
        let cpuInfo: CpuInfo;
        cpuInfo = {} as CpuInfo;

        try {
            let response = await got('http://' + this.hostname + ':' + this.port + '/api/3/cpu');

            if (response.statusCode == 200) {
                return Promise.resolve(JSON.parse(response.body) as CpuInfo)
            }
        } catch (error) {
            this.log.error("CpHandler: Failed request: '" + error + "'")
        }
        return Promise.resolve({} as CpuInfo)
    }

    async updateServices(): Promise<void> {
        let cpuInfo = await this.getCpuInfo();
        if (this.TotalCpuSensor) {
            this.log.info("Updating cpu info");
            this.TotalCpuSensor?.LoadService.getCharacteristic(this.hap.Characteristic.CurrentRelativeHumidity).updateValue(cpuInfo.total);
        }
    };
}