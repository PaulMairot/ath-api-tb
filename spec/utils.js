import { format, parse, compareDesc, parseISO } from 'date-fns'

import Athlete from "../models/athlete.js"
import Country from "../models/country.js"
import Discipline from "../models/discipline.js"
import Meeting from "../models/meeting.js"
import Performance from "../models/performance.js"
import Position from "../models/position.js"
import Pressure from "../models/pressure.js"
import Race from "../models/race.js"
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
  if (performance instanceof Performance) {

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
          createUpdateRecord(record, performance, mention);
          break;
        }
        case "NR" : {
          record = await Record.findOne({ mention: mention, country: performance.athlete.nationality}).exec();
          createUpdateRecord(record, performance, mention)
          break;
        }
        case "PB" : {
          record = await Record.findOne({ mention: mention, athlete: performance.athlete}).exec();
          createUpdateRecord(record, performance, mention)
          break;
        } 
        default:
          return;
      }
    });
  }
}

async function createUpdateRecord(record, performance, mention) {
  let result = new Date(await performance.get('result', null, { getters: false }));
  let race = await Race.findById(performance.race).populate('discipline');
  let athlete = await Athlete.find().populate('nationality');

  if (record == null) {
    // Create new record
    const newRecord = new Record({ athlete: performance.athlete.id, race: performance.race.id, discipline: race.discipline.id, country: athlete.nationality, performance: performance.id, result: result, mention: mention});
    await newRecord.save();
  } else {
    // Check if beaten
    if (compareDesc(result, new Date(record.result))) {
      // Update record
      await Record.findByIdAndUpdate(record.id, { athlete: performance.athlete.id, race: performance.race.id, discipline: race.discipline.id, country: athlete.nationality, performance: performance.id, result: result, mention: mention}).exec();
    } 
  } 
}


export async function cleanUpDatabase() {
  await Promise.all([
    Athlete.deleteMany(),
    Country.deleteMany(),
    Discipline.deleteMany(),
    Meeting.deleteMany(),
    Performance.deleteMany(),
    Position.deleteMany(),
    Pressure.deleteMany(),
    Race.deleteMany(),
    Record.deleteMany()
  ]);
};