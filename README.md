# Homebridge Glances plugin

[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)

This [Homebridge](https://homebridge.io/) plugin platform exposes the `temperature sensors`, `cpu load` and `memory load` from  [Glances Monitoring Tool](https://github.com/nicolargo/glances) as accessoires to homebridge.

Installation

```typescript

```typescript
npm install -g homebridge-glances
```

You need to install [Glances](https://github.com/nicolargo/glances) on your target system and start it in `server mode`, which is done via the paramater `-w`. Start the Glances server with your own configuration. See -> [Configuration Docs](https://glances.readthedocs.io/en/stable/config.html).
You can also put aliases to you sensors there, so on default they have generic names like 'it3451' etc.
You can also put aliases to you sensors there, so on default they have generic names like 'it3451' etc.
Following Plugins are supported:


- sensors -> Temperature data
- cpu -> Cpu load
- mem -> Memory load

*Annotation* : The cpu loads and memory loads are exposed as `HumidityService`, because the loads are in percent value, the `HumidityService.CurrentRelativeHumidity` characteristic was the best option for that.

Example:
Example:

```text
```text
[sensors]
#enable it
disable=False 
#alias for 'it3451'
it3451_alias=CoreTemp1

[cpu]
#enable it
disable=False 
[...]

[mem]
#enable it
disable=False 
[...]

```

## Homebridge configuration


To enable the platform in homebridge add the following to the config:

```json
```json
platforms:
[
 {
  "name":  "Glances",
  "platform":  "Glances",
  "hostname":  "{IP},
  "updateInterval":  3000,
  "prefix":  "{PREFIX}",
  "sensors": true,
  "cpu": true,
  "memory": true
 }
 {
  "name":  "Glances",
  "platform":  "Glances",
  "hostname":  "{IP},
  "updateInterval":  3000,
  "prefix":  "{PREFIX}",
  "sensors": true,
  "cpu": true,
  "memory": true
 }
]
```

following parameters are defined:

| Property | Utilization | Default Value | Description
|--|--|--|--
| name | required | Glances| The name handled by homebridge
|platform|required|Glances|Required to identify the platform
|hostname|required||The ip or hostname of your target system where  glances server is running
|port|optional|61208|The port of your target system where glances server is running
|updateInterval|optional|5000|The update interval in milliseconds to update the sensors, **ATTENTION** values below 1000 may slow down your homebridge or target system
|prefix|optional||A prefix to identify the exposed accessories better
|sensors|optional|false|Enables the sensors plugin to be exposed
|cpu|optional|false|Enables the cpu plugin to be exposed
|memory|optional|false|Enables the memory plugin to be exposed
| Property | Utilization | Default Value | Description
|--|--|--|--
| name | required | Glances| The name handled by homebridge
|platform|required|Glances|Required to identify the platform
|hostname|required||The ip or hostname of your target system where  glances server is running
|port|optional|61208|The port of your target system where glances server is running
|updateInterval|optional|5000|The update interval in milliseconds to update the sensors, **ATTENTION** values below 1000 may slow down your homebridge or target system
|prefix|optional||A prefix to identify the exposed accessories better
|sensors|optional|false|Enables the sensors plugin to be exposed
|cpu|optional|false|Enables the cpu plugin to be exposed
|memory|optional|false|Enables the memory plugin to be exposed

## Release Notes

### Version 1.0.0


### Version 1.0.0

- Initial Version


### Version 1.0.1


- Some small fixes


### Version 1.0.2


- made it all asynch
- changed from `StaticPlatform` to `DynamicPlatform` (for async reasons)
- better error handling
- logs

### Version 1.0.3

- changed load accessories from BatteryService to HumiditySensor

### Version 1.0.4

- changed load accessories from HumidityService to ServiceLabel
- changed back to HumidityService

### Version 1.0.5

- removed cpu updated log

### Version 1.0.6

- updated dependencies
- call v4 of glances API and fallback to v3

### Version 2.0.0

- updated plugin to current template for homebridge version 2 support
- replaced got with ky for api requests

Future plans:

- add support for multiple hosts
- more plugins for glances to expose network and filesystem
