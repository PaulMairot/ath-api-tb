import { format, parse, compareDesc, parseISO } from 'date-fns'
import Record from '../models/record.js';

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

export async function manageRecord(performance) {

  // Bypass result getter
  let result = new Date(performance.get('result', null, { getters: false }));

  performance.mention.forEach(async mention => {
    
    let record = null;

    switch (mention) {
      case "WR" :
      case "OR" :
      case "PR" :
      case "CR" :
      case "GR" :
      case "MR" :
      case "DLR": {
        record = await Record.findOne({ mention: mention }).exec();
        break;
      }
      case "NR" : {
        record = await Record.findOne({ mention: mention, country: performance.athlete.nationality}).exec();
        break;
      }
      case "PB" : {
        record = await Record.findOne({ mention: mention, athlete: performance.athlete}).exec();
        break;
      } 
      default:
        break;
    }

    if (record == null) {
      // Create new record
      const newRecord = new Record({ athlete: performance.athlete.id, race: performance.race.id, discipline: performance.race.discipline.id, country: performance.athlete.nationality.id, performance: performance.id, result: result, mention: mention});
      await newRecord.save();
    } else {
      // Check if beaten
      if (compareDesc(result, new Date(record.result))) {
        // Update record
        Record.findByIdAndUpdate(record.id, { athlete: performance.athlete.id, race: performance.race.id, discipline: performance.race.discipline.id, country: performance.athlete.nationality.id, performance: performance.id, result: result, mention: mention}).exec();
      } 
    } 
  });
  
}