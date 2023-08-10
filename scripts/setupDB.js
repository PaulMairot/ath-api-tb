function findID(collection, values) {
  const documentFound = db.getCollection(collection).findOne(values);
  return documentFound._id;
}

// Clear database
load('./Documents/HEIG-VD/Semester 6/TB/TB/Code projects/scripts/clearDB.js');

db = connect( 'mongodb://localhost/ath-api-tb-test' );


let disciplinesScript = [];
let countriesScript = [];
let athletesScript = [];
let meetingsScript = [];
let racesScript = [];
let performancesScript = [];
let pressuresScript = [];
let positionsScript = [];

/** 
 * DISCIPLINES 
 * */
// Load file with data
load('./Documents/HEIG-VD/Semester 6/TB/TB/Code projects/scripts/models/disciplines.js');
disciplines.forEach((discipline) => {
  // Insert data in DB
  db.disciplines.insertOne(discipline);
})
// Store data in JS
disciplinesScript = db.disciplines.find({}).toArray();


/** 
 * COUNTRIES 
 * */
// Load file with data
load('./Documents/HEIG-VD/Semester 6/TB/TB/Code projects/scripts/models/countries.js');
countries.forEach((country) => {
  // Insert data in DB
  db.countries.insertOne(country);
})
// Store data in JS
countriesScript = db.countries.find({}).toArray();


/** 
 * ATHLETES 
 * */
// Load file with data
load('./Documents/HEIG-VD/Semester 6/TB/TB/Code projects/scripts/models/athletes.js');
athletes.forEach((athlete) => {
  
  // Get discipline ID
  let disciplinesID = [];
  athlete.discipline.forEach((discipline) => {
    disciplinesID.push(findID("disciplines", discipline))
  })
  athlete.discipline = disciplinesID;
  // Get country ID
  athlete.nationality = findID("countries", athlete.nationality);

  // Insert data in DB
  db.athletes.insertOne(athlete);
})

// Store data in JS
athletesScript = db.athletes.find({}).toArray();


/** 
 * MEETINGS 
 * */
// Load file with data
load('./Documents/HEIG-VD/Semester 6/TB/TB/Code projects/scripts/models/meetings.js');
meetings.forEach((meeting) => {
  
  // Get country ID
  meeting.country = findID("countries", meeting.country);

  // Insert data in DB
  db.meetings.insertOne(meeting);
})

// Store data in JS
meetingsScript = db.meetings.find({}).toArray();


/** 
 * RACE 
 * */
// Load file with data
load('./Documents/HEIG-VD/Semester 6/TB/TB/Code projects/scripts/models/races.js');
races.forEach((race) => {
  // Get meeting ID
  race.meeting = findID("meetings", race.meeting);

  // Get displine ID
  race.discipline = findID("disciplines", race.discipline);

  // Get athletes ID
  let athletesID = []
  race.athletes.forEach((athlete) => {
    athletesID.push(findID("athletes", athlete))
  })
  race.athletes = athletesID;

  // Insert data in DB
  db.races.insertOne(race);

})

// Store data in JS
racesScript = db.races.find({}).toArray();

// Add races to meetings
racesScript.forEach((race) => {
  db.meetings.findOneAndUpdate(
    {_id: race.meeting}, 
    { $push: {races: race._id} }
  )
});

/** 
 * PERFORMANCES 
 * */
// Load file with data
load('./Documents/HEIG-VD/Semester 6/TB/TB/Code projects/scripts/models/performances.js');
performances.forEach((performance) => {
  // Get race ID
  performance.race.meeting = findID("meetings", performance.race.meeting)
  performance.race = findID("races", performance.race);

  // Get athlete ID
  performance.athlete = findID("athletes", performance.athlete);


  // Insert data in DB
  db.performances.insertOne(performance);

})

// Store data in JS
performancesScript = db.performances.find({}).toArray();


/** 
 * PRESSURES 
 * */
// Load file with data
load('./Documents/HEIG-VD/Semester 6/TB/TB/Code projects/scripts/models/pressures.js');

let timesArray = [];
let pressuresArray = [];

pressures.forEach((pressure) => {
  timesArray.push(pressure.x)
  pressuresArray.push(pressure.y)
});
  
// Get race ID
pressures[0].race.meeting = findID("meetings", pressures[0].race.meeting)
const pressureRace = findID("races", pressures[0].race);

  // Same pressure to all athletes to simplify
  athletesScript.forEach((athlete) => {
    const pressure = {
      "race": pressureRace,
      "athlete": athlete._id,
      "times": timesArray,
      "pressure": pressuresArray
    }

    // Insert data in DB
    db.pressures.insertOne(pressure);
  })


// Store data in JS
pressuresScript = db.pressures.find({}).toArray();

// Add pressures to performance
pressuresScript.forEach((pressure) => {
  const requestValues = {
    "athlete": pressure.athlete,
    "race": pressure.race
  }

  db.performances.findOneAndUpdate(
    {_id: findID("performances", requestValues)}, 
    { $set: {startingPressure: pressure._id} }
  )
})



/** 
 * POSITIONS 
 * */
// Load file with data
load('./Documents/HEIG-VD/Semester 6/TB/TB/Code projects/scripts/models/positions.js');

positions.forEach((position) => {
    // Get race ID
    position.race.meeting = findID("meetings", position.race.meeting)
    position.race = findID("races", position.race);
  
    // Get athlete ID
    position.athlete = findID("athletes", position.athlete);

    // Insert data in DB
    db.positions.insertOne(position);
});

// Store data in JS
positionsScript = db.positions.find({}).toArray();

// Add positions to performance
positionsScript.forEach((position) => {
  const requestValues = {
    "athlete": position.athlete,
    "race": position.race
  }

  db.performances.findOneAndUpdate(
    {_id: findID("performances", requestValues)}, 
    { $push: {positions: position._id} }
  )
})