# Homebridge Glances plugin for Temperature

This [Homebridge](https://homebridge.io/) plugin platform exposes the `temperature sensors` from  [Glances Monitoring Tool](https://github.com/nicolargo/glances) as accessoires to homebridge.

Installation
```
npm install -g homebridge-glances-temperature
```

You need to install [Glances](https://github.com/nicolargo/glances) on your target system and start it in `server mode`, which is done via the paramater `-w`. You need to enable the `sensors`plugin, which is not the standard. Start the Glances server with your own configuration. See -> [Configuration Docs](https://glances.readthedocs.io/en/stable/config.html).
You can also put aliases to you sensors there, so on default they have generic names like 'it3451' etc. 
Example: 

```
[sensors]
#enable it
disable=False 
#alias for 'it3451'
it3451_alias=CoreTemp1
```

## Homebridge configuration
To enable the platform in homebridge add the following to the config:

```
platforms:
[
	{
		"name":  "GlancesTemperature",
		"platform":  "GlancesTemperature",
		"hostname":  "{IP},
		"updateInterval":  3000,
		"prefix":  "{PREFIX}"
	}
]
```

following parameters are defined:

| Property | Utilization | Default Value | Description 
|--|--|--|--|
| name | required | GlancesTemperature | The name handled by homebridge |
|platform|required|GlancesTemperature|Required to identify the platform|
|hostname|required||The ip or hostname of your target system where  glances server is running|
|port|optional|61208|The port of your target system where glances server is running|
|updateInterval|optional|5000|The update interval in milliseconds to update the temperatures, **ATTENTION** values below 1000 may slow down your homebridge or target system|
|prefix|optional||A prefix when you have multiple glances target systems so you can identify them|

Future plans:

- integrate the homebridge configuration scheme to enable configuration in [homebridge-config-ui-x](https://www.npmjs.com/package/homebridge-config-ui-x)
- more plugins for glances to expose cpu, memory, network and filesystem
