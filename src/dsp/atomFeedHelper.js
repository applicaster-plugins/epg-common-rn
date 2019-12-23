import { Platform } from 'react-native';

import moment from 'moment';

export function getImageMediaItem(entry) {
	let result = null;

  let mediaGroup = entry['media_group'];
  if (mediaGroup && mediaGroup.length > 0) {
    let mediaItem = mediaGroup[0];
    if (mediaItem['type'] == 'image') {
      let imageItem = mediaItem['media_item'];
      if (imageItem.length > 0) {
        result = imageItem[0]['src']
      }
    }
	}
	
	return result;
}

export function getExtensions(entry, map) {
	let result = map;

	let extensions = entry['extensions'];
	if (extensions) {
		Object.keys(map).forEach(key => {
      let value = map[key];

      if (value.constructor === Array) {
        let method = value[0];
        result[key] = method(extensions[value[1]]);
      }
      else {
        result[key] = extensions[value];
      }
		});
	}

	return result;
}

export function getTimestamp(dateString) {
  let date = moment(dateString, 'YYYY/MM/DD HH:mm:ss ZZ');
  return (date && date.valueOf()) || null;
}

export function isCurrentProgram(startTime) {
  const now = moment();

  let programStartDiffMinutes = now.diff(startTime, 'minutes');

  return programStartDiffMinutes >= 1;
}

export function getPlayableAtomEntry(channel) {
  let model = {
    id: channel.id,
    type: {
      value: 'channel'
    },
    content: {
    }
  };

	if (Platform.OS === 'android') {
    model = JSON.stringify(model);
  }

  return {
    type: 'atom_entry',
    model: model,
    imgSrc: channel.currentProgram.imageUrl
  }
};
