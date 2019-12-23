import { Dimensions } from 'react-native';

const Device = require('react-native-device-detection');

export function scaledScreenSize(padSize, phoneSize) {
	let window = Dimensions.get('window')
	let screenWidth = window.width; 
	let screenHeight = window.height;

	let screenSize = screenHeight;

	let baseSize = 1;
	let inputSize = 0;
	let scale = 1;

	if (Device.isTablet) {
		baseSize = 768;
		inputSize = padSize;
		scale = screenSize / baseSize;
	}
	else {
		baseSize = 667;
		inputSize = phoneSize || padSize;
		scale = Math.min(screenSize / baseSize, 1.1);
	}

	return scale * inputSize;
}
