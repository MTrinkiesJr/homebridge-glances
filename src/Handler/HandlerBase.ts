import {
    HAP,
    Logging,
    AccessoryPlugin
  } from "homebridge";

export abstract class HandlerBase {

    log: Logging;
    hostname: string;
    port : number;
    hap: HAP;
    prefix: string;

    constructor(hap: HAP, prefix: string, hostname: string, port: number, log: Logging)
    {
        this.hostname = hostname;
        this.port = port;
        this.log = log;
        this.prefix = prefix;
        this.hap = hap;
    }

    abstract getServices(accessories: AccessoryPlugin[], callback: (accessoires: AccessoryPlugin[]) => void): void

    abstract updateServices() : void;
}
