import { format, isDate } from 'date-fns'

export function transformJson(doc, json, options) {
    delete json.__v;
    json.id = json._id;
    delete json._id;
    return json;
}

export function formatDate(date) {
  // Remove timezone offset
  date = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
  return format(date, 'yyyy-MM-dd');
}

export function formatTime(time) {
  // Remove timezone offset
  if (time != null) {
    time = new Date(time.valueOf() + time.getTimezoneOffset() * 60 * 1000);
    return format(time, 'HH:mm:ss');
  }
  
  return null;
}

export function formatTimeRace(time) {
  // Remove timezone offset
  time = new Date(time.valueOf() + time.getTimezoneOffset() * 60 * 1000);

  return format(time, "HH:mm:ss.SSS");
}