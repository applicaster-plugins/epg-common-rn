import { NativeModules } from 'react-native';

const { ZappPlugin } = NativeModules;

export function load(name, callback) {
	ZappPlugin.getConfiguration(name)
	.then(config => {
		global.zappConfig = config;
	})
	.catch(() => {
		global.zappConfig = {};
	})
	.finally(() => {
		callback();
	});
}

export function isEnabled(configKey) {
	let configValue = global.zappConfig[configKey];
	return configValue != null && configValue == '1';
}

export function getConfig(configKey) {
	let configValue = global.zappConfig[configKey];

	if (!configValue || configValue.length == 0) {
		return null;
	}

	return configValue;
}

export function getString(stringKey, defaultValue) {
	return getConfig(stringKey) || defaultValue;
}
