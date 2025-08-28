import {
  PlatformAccessory,
  API,
} from 'homebridge';

export abstract class BaseAccessory {
  public Name: string;
  public Accessory : PlatformAccessory; 
  protected API: API;

  constructor(name: string, api: API) {
    this.Name = name;
    this.API = api;
    this.Accessory = {} as PlatformAccessory;
  }
}