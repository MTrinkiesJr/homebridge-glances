import { PlatformAccessory, APIEvent, API, HAP, Logging, PlatformConfig, DynamicPlatformPlugin } from "homebridge";
import { HandlerBase } from "./Handler/HandlerBase";
import { SensorsHandler } from "./Handler/SensorsHandler";
import { CpuHandler } from "./Handler/CpuHandler";
import { MemoryHandler } from "./Handler/MemoryHandler";
import { BaseAccessory } from "./Accessoires/BaseAccessory";

let hap: HAP;

export = (api: API) => {
  hap = api.hap;
  api.registerPlatform("Glances", GlancesPlatform);
};

class GlancesPlatform implements DynamicPlatformPlugin {

  private readonly log: Logging;
  private readonly hostname: string;
  private readonly port: number;
  private readonly updateInterval: number;
  private readonly prefix: string;
  private readonly handlers: HandlerBase[];
  private accessories: PlatformAccessory[];

  constructor(log: Logging, config: PlatformConfig, api: API) {
    this.log = log;
    this.hostname = config.hostname;
    this.port = config.port ?? 61208;
    this.updateInterval = config.updateInterval ?? 5000;
    this.prefix = config.prefix ?? "";
    this.handlers = [];
    this.accessories = [];

    if (config.sensors) {
      log.info("Sensors Handler enabled");
      this.handlers.push(new SensorsHandler(hap, api, this.prefix, this.hostname, this.port, log))
    }
    if (config.cpu) {
      log.info("Cpu Handler enabled");
      this.handlers.push(new CpuHandler(hap, api, this.prefix, this.hostname, this.port, log))
    }

    if (config.memory) {
      log.info("Memory Handler enabled");
      this.handlers.push(new MemoryHandler(hap, api, this.prefix, this.hostname, this.port, log))
    }

    api.on(APIEvent.DID_FINISH_LAUNCHING, async () => {

      try {
        for (let i = 0; i < this.handlers.length; i++) {
          let handlerAccessories: PlatformAccessory[];
          handlerAccessories = [];
          let received = await this.handlers[i].getServices() as BaseAccessory[];


          let accessoryPlugin : BaseAccessory;
          accessoryPlugin = {} as BaseAccessory;
          for (let j = 0; j < received.length; j++) {
            try {
              accessoryPlugin = received[j];          
              handlerAccessories.push(accessoryPlugin.Accessory);
            }
            catch (error) {
              this.log.error("Failed to add accessory '" + accessoryPlugin.Name + "': error: '" + error + "'");
            }
          }

          this.accessories = this.accessories.concat(handlerAccessories);
        }

        this.log.info("Registered " + this.accessories.length + " accessories");
        api.registerPlatformAccessories('Glances', config.Name, this.accessories);

        if (this.accessories.length > 0) {
          this.startInterval();
        }
      }
      catch (error) {
        this.log.error("Failed to load accessories: '" + error + "'");
      }
    });

    log.info("Glances finished initializing!");
  }


  startInterval() {
    this.log.info("Staring updating timer");
    let self = this;
    setInterval(function () {
      for (let i = 0; i < self.handlers.length; i++) {
        self.handlers[i].updateServices();
      }
    }, self.updateInterval);
  }

  configureAccessory(accessory: PlatformAccessory): void { };
}
