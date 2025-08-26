import {
    HAP,
    API,
    Logging
  } from "homebridge";

  
import {BaseAccessory} from "../Accessoires/BaseAccessory";

export abstract class HandlerBase {

    log: Logging;
    hostname: string;
    port : number;
    hap: HAP;
    prefix: string;
    api: API;

    constructor(hap: HAP,api: API, prefix: string, hostname: string, port: number, log: Logging)
    {
        this.hostname = hostname;
        this.port = port;
        this.log = log;
        this.prefix = prefix;
        this.hap = hap;
        this.api = api;
    }

    abstract getServices(): Promise<BaseAccessory[]>

    abstract updateServices() : Promise<void>;
}
