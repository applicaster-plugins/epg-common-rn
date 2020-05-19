import * as DSP from './dsp';
import { getImageMediaItem, getExtensions, getTimestamp, isCurrentProgram } from './atomFeedHelper';

export function loadAll(callback) {
	DSP.getData('channel-list', null, (success, feedData) => {
		if (!success || !feedData) {
			callback(false);
			return;
		}

		let channelsFeed = JSON.parse(feedData);

		if (channelsFeed && channelsFeed['entry']) {
			let loadingList = new Map();
			let orderMap = {};

			channelsFeed['entry'].forEach((channelEntry, index) => {
				let id = channelEntry['id'];
				if (id) {
					loadingList.set(id, channelEntry);
					orderMap[id] = index;
				}
			});

			if (loadingList.size == 0) {
				callback(false);
				return;
			}

			let loadedChannels = [];

			loadingList.forEach((channelEntry, channelId) => {
				fetchChannelEntry(channelEntry, (success, channel) => {
					if (success) {
						loadedChannels[orderMap[channelId]] = channel;
					}

					loadingList.delete(channelId);

					if (loadingList.size == 0) {
						callback(true, loadedChannels);
					}
				});
			});
		}
	});
}
	
export function reload(channel, callback) {
	fetchChannelEpg(channel.epgChannelId, (success, channelEpg) => {
		if (success) {
			let result = {
				...channel,
				...channelEpg
			};	

			callback(success, result);
		}
		else {
			callback(false);
		}
	});
}

// #######
// Internal methods
// #######

function fetchChannelEntry(channelEntry, callback) {
	let extensions = channelEntry['extensions'];
	if (!extensions) {
		callback(false);
		return
	}

	let epgChannelId = extensions['channel_id'];
	if (!epgChannelId) {
		epgChannelId = channelEntry['id'];
	}

	if (!epgChannelId) {
		callback(false);
		return
	}

	fetchChannelEpg(epgChannelId, (success, channelEpg) => {
		if (success) {
			let channel = {
				...parseChannelEntry(epgChannelId, channelEntry),
				...channelEpg
			}

			callback(true, channel);
		}
		else {
			callback(false);
		}
	});
}
	
function fetchChannelEpg(epgChannelId, callback) {
	DSP.getData('epg', `channelId=${epgChannelId}&current=true`, (success, feedData) => {
		if (!success || !feedData) {
			callback(false);
			return;
		}

		let epgFeed = JSON.parse(feedData);
		if (!epgFeed) {
			callback(false);
			return;
		}

		let epgEntries = epgFeed['entry'];
		if (!epgEntries) {
			callback(false);
			return;
		}

		let result = parseChannelEpg(epgEntries);
		callback(true, result);
	});
}
	
function parseChannelEntry(epgChannelId, channelEntry) {
	return {
		id: channelEntry['id'],
		name: channelEntry['title'],
		epgChannelId: epgChannelId,
		...getExtensions(channelEntry, {
			isFree: 'free'
		}),
		imageUrl: getImageMediaItem(channelEntry) || 'placeholder_big_item',
		model: channelEntry
	};
}
	
function parseChannelEpg(epgEntries) {
	let result = {};
	let currentProgram = {};
	let nextProgram = {};

	if (epgEntries.length > 0) {
		let currentProgramEntry = epgEntries[0];

		if (isProgramBlocked(currentProgramEntry)) {
			currentProgram.isBlocked = true
		}
		else {
			currentProgram = parseCurrentProgram(currentProgramEntry);
		}

		let nextProgramEntry = {};

		if (isCurrentProgram(currentProgram.start)) {
			if (epgEntries.length > 1) {
				nextProgramEntry = epgEntries[1];

				if (isProgramBlocked(nextProgramEntry)) {
					nextProgram.isBlocked = true;
				}
				else {
					nextProgram = parseNextProgram(nextProgramEntry);
				}
			}
			else {
				nextProgram.isBlocked = true;
			}
		}
		else {
			nextProgram = currentProgram;

			currentProgram = {
				isBlocked: true
			}
		}
	}
	else {
		currentProgram.isBlocked = true;
		nextProgram.isBlocked = true;
	}
	
	result.currentProgram = currentProgram;
	result.nextProgram = nextProgram;

	return result;
}
	
function parseCurrentProgram(entry) {	
	return {
		...getExtensions(entry, {
			title: 'show_name',
			start: [getTimestamp, 'starts_at'],
			end: [getTimestamp, 'ends_at'],
			isBlocked: 'is_blocked'
		}),
		imageUrl: getImageMediaItem(entry),
	}
}
	
function parseNextProgram(entry) {
	return {
		...getExtensions(entry, {
			title: 'show_name',
			isBlocked: 'is_blocked'
		})
	}
}

function isProgramBlocked(programEntry) {
	let extensions = programEntry['extensions'];
	if (!extensions) {
		return true;
	}
	
	if (!extensions['starts_at']) {
		return true;
	}

	if (!extensions['ends_at']) {
		return true;
	}

	return !programEntry.title || programEntry.title.length == 0;
}
