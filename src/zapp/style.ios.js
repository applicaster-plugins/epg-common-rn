const Device = require('react-native-device-detection');

export function init(map) {
	global.zappStyles = map
}

export function getFontStyleObject(zappKey, isSelected) {
	let result = {};

	let family = global.zappStyles[zappKey + '_family_ios'];
	if (family) {
		result['fontFamily'] = family;
	}

	let color = global.zappStyles[zappKey + '_color' + (isSelected ? '_selected' : '')];
	if (color) {
		result['color'] = color;
	}

	let size = global.zappStyles[zappKey + '_size' + (Device.isTablet ? '_pad' : '')];
	if (size) {
		result['fontSize'] = parseInt(size);
	}

	return result;
}

export function getConfig(configKey) {
	let configValue = global.zappStyles[configKey];
	return !!configValue;
}

export function getColor(colorKey) {
	let colorValue = global.zappStyles[colorKey];
	return colorValue || 'transparent';
}

export function getImage(imageKey) {
	return {uri: imageKey, cache: 'force-cache'};
}
