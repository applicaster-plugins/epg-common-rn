import moment from 'moment/min/moment-with-locales';

import * as Config from '../zapp/config';

export const Program = {
  DURATION_WIDTH_MINUTE_MULT: 8,
  TIMEBAR_MINUTES_INTERVAL: 30
}

const EPG_DATE_FORMAT = 'ddd DD/MM';
const EPG_TIME_FORMAT = 'HH:mm';
const EPG_DAY_FORMAT = 'ddd D';
const DSP_DATE_FORMAT = 'YYYY-MM-DD HH:mm';

export function setLocale(locale) {
  moment.locale([locale, 'en-US']);
}

export function getDate(time) {
  return moment.unix(time).format(EPG_DATE_FORMAT);
}

export function getTime(time) {
  return moment(time).format(EPG_TIME_FORMAT);
}

export function parse(value, format) {
  const date = moment(value, format);
  return (date && date.unix()) || null;
}

export function getStartDateForDSP(day) {
  const date = moment.unix(day).format(DSP_DATE_FORMAT);
  return date;
}

export function getEndDateForDSP(day) {
  const date = moment.unix(day).endOf('day').format(DSP_DATE_FORMAT);
  return date;
}

export function getWidthForInterval(interval) {
  return (interval/60) * Program.DURATION_WIDTH_MINUTE_MULT;
}

export function getWidthForProgram(program) {
  return this.getWidthForInterval(program.end - program.start);
}

export function getCurrentTime() {
  return moment().unix();
}

export function isToday(dayStart) {
  const now = moment();
  return now.startOf('day').unix() == dayStart;
}

export function isCurrent(start, end) {
  const now = this.getCurrentTime();

  return now >= start && now < end;
}

export function getDays(count) {
  let date = moment().startOf('day');

  let days = [];
  for (let i = 0; i < count; i++) {
    days.push(date.unix());
    date.add(1, 'days');
  }

  return days;
}

export function getDayTitle(day) {
  const date = moment.unix(day);

  const today = moment();
  if (date.isSame(today, 'day')) {
    return Config.getString('day_selector_today_text', 'Heute');
  }

  const tomorrow = today.add(1, 'days');
  if (date.isSame(tomorrow, 'day')) {
    return Config.getString('day_selector_tomorrow_text', 'Morgen');
  }

  return date.format(EPG_DAY_FORMAT);
}

export function getEpgTimesCues(dayStart) {
  let result = [];

  let currentDate = moment.unix(dayStart);
  const dayEnd = moment(currentDate).endOf('day');

  while (currentDate.isBefore(dayEnd)) {
    const time = currentDate.format(EPG_TIME_FORMAT);
    result.push(time);
    
    currentDate.add(Program.TIMEBAR_MINUTES_INTERVAL, 'minutes');
  }

  return result;
}

export function getProgress(start, end) {
  if (start >= end) {
    return 0;
  }

  const now = moment().valueOf();
  const progress = (now - start) / (end - start);

  if (progress > 1) {
    return 1.0;
  }

  return progress;
}

export function getFormattedDuration(start, end) {
  if (!start || !end) {
    return;
  }
  
  return `${getTime(start)} - ${getTime(end)}`
}
