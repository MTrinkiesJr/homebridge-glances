import { AccessoryPlugin, API, HAP, Logging, PlatformConfig, StaticPlatformPlugin } from "homebridge";
import { HandlerBase } from "./Handler/HandlerBase";
import { SensorsHandler } from "./Handler/SensorsHandler";
import { CpuHandler } from "./Handler/CpuHandler";
import { MemoryHandler } from "./Handler/MemoryHandler";

let hap: HAP;

export = (api: API) => {
  hap = api.hap;
  api.registerPlatform("GlancesTemperature", GlancesPlatform);
};

class GlancesPlatform implements StaticPlatformPlugin {

  private readonly log: Logging;
  private readonly hostname: string;
  private readonly port: number;
  private readonly updateInterval: number;
  private readonly prefix: string;
  private readonly Handlers: HandlerBase[];

  constructor(log: Logging, config: PlatformConfig, api: API) {
    this.log = log;
    this.hostname = config.hostname;
    this.port = config.port ?? 61208;
    this.updateInterval = config.updateInterval ?? 5000;
    this.prefix = config.prefix ?? "";
    this.Handlers = [];

    if (config.sensors) {
      log.info("Sensors Handler enabled");
      this.Handlers.push(new SensorsHandler(hap, this.prefix, this.hostname, this.port, log))
    }
    if (config.cpu) {
      log.info("Cpu Handler enabled");
      this.Handlers.push(new CpuHandler(hap, this.prefix, this.hostname, this.port, log))
    }

    if (config.memory) {
      log.info("Memory Handler enabled");
      this.Handlers.push(new MemoryHandler(hap, this.prefix, this.hostname, this.port, log))
    }
    log.info("GlancesTemperature finished initializing!");
  }

  accessories(callback: (foundAccessories: AccessoryPlugin[]) => void): void {
    let accessories: AccessoryPlugin[];
    accessories = [];

    let self = this;

    if (self.Handlers.length >= 1) {
      self.Handlers[0].getServices(accessories, function (accs1) {

        if (self.Handlers.length >= 2) {
          self.Handlers[1].getServices(accessories, function (accs2) {

            if (self.Handlers.length >= 3) {
              self.Handlers[2].getServices(accessories, function (accs3) {
                self.startInterval();
                self.log.info("Found accessories: " + accessories.length);
                callback(accessories);
                return;
              });
            }
            else {
              self.startInterval();
              self.log.info("Found accessories: " + accessories.length);
              callback(accessories);
            }
          });
        }
        else {
          self.startInterval();
          self.log.info("Found accessories: " + accessories.length);
          callback(accessories);
        }
      });
    }
    else {
      self.log.info("Found accessories: " + accessories.length);
      callback(accessories);
    }
  }


  startInterval() {
    let self = this;
    setInterval(function () {
      for (let i = 0; i < self.Handlers.length; i++) {
        self.Handlers[i].updateServices();
      }
    }, self.updateInterval);
  }
}


