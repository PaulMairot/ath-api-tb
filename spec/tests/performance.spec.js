import supertest from "supertest"
import mongoose from "mongoose"

import Performance from "../../models/performance.js";

import Meeting from "../../models/meeting.js";
import Country from "../../models/country.js";
import Athlete from "../../models/athlete.js";
import Discipline from "../../models/discipline.js";
import Race from "../../models/race.js";
import Pressure from "../../models/pressure.js";
import Position from "../../models/position.js";

import { cleanUpDatabase } from "../utils.js";
import app from "../../app.js"

/* ------- POST tests --------------------------- */

describe('POST /performances', function() {
    let country, discipline, meeting, athlete, race, pressure, position1, position2;
    beforeEach(async function() {
        // Create a country for the meeting.
        country = await Country.create({alpha2: 'JM', alpha3: 'JAM', noc: 'JAM', name: 'Jamaica'});

        // Create a discipline for the race and athletes.
        discipline = await Discipline.create({type: 'none', distance: 100, gender: 'men'});

        // Create a meeting for the race.
        meeting = await Meeting.create({name: 'Diamond League', startDate: '2023-05-05T00:00:00Z', endDate: '2023-05-05T00:00:00Z', location: 'Suhaim Bin Hamad Stadium', city: 'Doha', country: country.id});

        // Create athletes for the race and performance.
        athlete = await Athlete.create({lastName: 'Bolt', firstName: 'Usain', dateOfBirth: '1986-08-21T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]});

        // Create a race for the performance.
        race = await Race.create({meeting: meeting.id, plannedStartTime: '2023-05-05T19:15:00.000Z', realStartTime: '2023-05-05T19:16:00.000Z', state: 'finished', discipline: discipline.id, athletes: [athlete.id]})

        // Create pressure for performance.
        pressure = await Pressure.create({athlete: athlete.id, race: race.id, time: [-2,0,2,4,6,8], pressure: [345,381,432,487,546,610]});

        // Create positions for the performance.
        [ position1, position2 ] = await Promise.all([
            Position.create({athlete: athlete.id, race: race.id, rank: 3, runnedDistance: 30, gapToLeader: 1.8, speed: 26.6, time: "2023-05-05T00:00:09.716Z", coordinates: [80,232]}),
            Position.create({athlete: athlete.id, race: race.id, rank: 3, runnedDistance: 34, gapToLeader: 1.9, speed: 25.9, time: "2023-05-05T00:00:10.132Z", coordinates: [84,231]})
        ]);
    });

    it('should create a performance', async function() {
        const res = await supertest(app)
            .post('/performances')
            .send({
                athlete: athlete.id,
                race: race.id,
                lane: 2,
                result: "2023-05-05T00:00:14.115Z",
                position: [position1.id, position2.id],
                startingPressure: pressure.id,
                reactionTime: 0.230,
            })
            .expect(201)
            .expect('Content-Type', /json/);
        expect(res.body.athlete).toEqual(athlete.id);
        expect(res.body.race).toEqual(race.id);
        expect(res.body.lane).toEqual(2);
        expect(res.body.result).toEqual('14.115');
        expect(res.body.position).toEqual([position1.id, position2.id]);
        expect(res.body.startingPressure).toEqual(pressure.id);
        expect(res.body.reactionTime).toEqual(0.230);
    });

    it('should not create a performance (invalid body)', async function() {
        const res = await supertest(app)
            .post('/performances')
            .send({
                athlete: 'abc',
                race: 'abc',
                lane: -2,
                result: "2023-05-32T22:00:14.115Z",
                position: ['abc', 'abc'],
                startingPressure: 'abc',
                reactionTime: -230
            })
            .expect(409)
            .expect('Content-Type', /json/);
    });

    it('should not create a performance (empty body)', async function() {
        const res = await supertest(app)
            .post('/performances')
            .send({})
            .expect(409)
            .expect('Content-Type', /json/);
    });
});



/* ------- GET tests --------------------------- */

describe('GET /performances', function() {

    let country, discipline, meeting, athlete1, athlete2, race, pressure1, pressure2, position1, position2;
    let performance1, performance2;
    beforeEach(async function() {
        // Create a country for the meeting.
        country = await Country.create({alpha2: 'JM', alpha3: 'JAM', noc: 'JAM', name: 'Jamaica'});

        // Create a discipline for the race and athletes.
        discipline = await Discipline.create({type: 'none', distance: 100, gender: 'men'});

        // Create a meeting for the race.
        meeting = await Meeting.create({name: 'Diamond League', startDate: '2023-05-05T00:00:00Z', endDate: '2023-05-05T00:00:00Z', location: 'Suhaim Bin Hamad Stadium', city: 'Doha', country: country.id});

        // Create athletes for the race and performance.
        [ athlete1, athlete2 ] = await Promise.all([
            Athlete.create({lastName: 'Blake', firstName: 'Yohan', dateOfBirth: '1989-12-26T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]}),
            Athlete.create({lastName: 'Bolt', firstName: 'Usain', dateOfBirth: '1986-08-21T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]}),
        ]);

        // Create a race for performances.
        race = await Race.create({meeting: meeting.id, plannedStartTime: '2023-05-05T19:15:00.000Z', realStartTime: '2023-05-05T19:16:00.000Z', state: 'finished', discipline: discipline.id, athletes: [athlete1.id, athlete2]});

        // Create pressures for performances.
        [ pressure1, pressure2 ] = await Promise.all([
            Pressure.create({athlete: athlete1.id, race: race.id, time: [-2,0,2,4,6,8], pressure: [345,381,432,487,546,610]}),
            Pressure.create({athlete: athlete2.id, race: race.id, time: [-2,0,2,4,6,8], pressure: [158,169,173,186,198,212]})
        ]);

        // Create performances for retrieving tests.
        [ performance1, performance2 ] = await Promise.all([
            Performance.create({athlete: athlete1.id, race: race.id, lane: 2, result: "2023-05-05T00:00:14.115Z", startingPressure: pressure1.id, reactionTime: 0.230}),
            Performance.create({athlete: athlete2.id, race: race.id, lane: 3, result: "2023-05-05T00:00:14.615Z", startingPressure: pressure2.id, reactionTime: 0.278})
        ])
    });

    it('should get a list of performances', async function() {
        const res = await supertest(app)
            .get('/performances')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(res.body[0].athlete.id).toEqual(athlete1.id);
        expect(res.body[0].race.id).toEqual(race.id);
        expect(res.body[0].lane).toEqual(2);
        expect(res.body[0].result).toEqual('14.115');
        expect(res.body[0].startingPressure).toEqual( 
            expect.objectContaining({ athlete: athlete1.id, race: race.id, time: pressure1.time, pressure: pressure1.pressure})
        );
        expect(res.body[0].reactionTime).toEqual(0.230);

        expect(res.body[1].athlete.id).toEqual(athlete2.id);
        expect(res.body[1].race.id).toEqual(race.id);
        expect(res.body[1].lane).toEqual(3);
        expect(res.body[1].result).toEqual('14.615');
        expect(res.body[1].startingPressure).toEqual( 
            expect.objectContaining({ athlete: athlete2.id, race: race.id, time: pressure2.time, pressure: pressure2.pressure})
        );
        expect(res.body[1].reactionTime).toEqual(0.278);
        

    });

    it('should get a specific performance', async function() {
        const res = await supertest(app)
            .get(`/performances?athlete=${athlete1.id}&race=${race.id}&result=2023-05-05T00:00:14.115Z&reactionTime=0.230`)
            .expect(200)
            .expect('Content-Type', /json/)
        expect(res.body[0].athlete.id).toEqual(athlete1.id);
        expect(res.body[0].race.id).toEqual(race.id);
        expect(res.body[0].lane).toEqual(2);
        expect(res.body[0].result).toEqual('14.115');
        expect(res.body[0].startingPressure).toEqual( 
            expect.objectContaining({ athlete: athlete1.id, race: race.id, time: pressure1.time, pressure: pressure1.pressure})
        );
        expect(res.body[0].reactionTime).toEqual(0.230);
    });

    it('should not get a specific performance', async function() {
        const res = await supertest(app)
            .get('/performances?reactionTime=10000')
            .expect(404)
    });

});


/* ------- PUT tests --------------------------- */


describe('PUT /performances', function() {

    let country, discipline, meeting, athlete1, athlete2, race, pressure1, pressure2, position1, position2;
    let performance;
    beforeEach(async function() {
        // Create a country for the meeting.
        country = await Country.create({alpha2: 'JM', alpha3: 'JAM', noc: 'JAM', name: 'Jamaica'});

        // Create a discipline for the race and athletes.
        discipline = await Discipline.create({type: 'none', distance: 100, gender: 'men'});

        // Create a meeting for the race.
        meeting = await Meeting.create({name: 'Diamond League', startDate: '2023-05-05T00:00:00Z', endDate: '2023-05-05T00:00:00Z', location: 'Suhaim Bin Hamad Stadium', city: 'Doha', country: country.id});

        // Create athletes for the race and performance.
        [ athlete1, athlete2 ] = await Promise.all([
            Athlete.create({lastName: 'Blake', firstName: 'Yohan', dateOfBirth: '1989-12-26T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]}),
            Athlete.create({lastName: 'Bolt', firstName: 'Usain', dateOfBirth: '1986-08-21T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]}),
        ]);

        // Create a race for the performance
        race = await Race.create({meeting: meeting.id, plannedStartTime: '2023-05-05T19:15:00.000Z', realStartTime: '2023-05-05T19:16:00.000Z', state: 'finished', discipline: discipline.id, athletes: [athlete1.id, athlete2]});

        // Create pressures for the performance.
        [ pressure1, pressure2 ] = await Promise.all([
            Pressure.create({athlete: athlete1.id, race: race.id, time: [-2,0,2,4,6,8], pressure: [345,381,432,487,546,610]}),
            Pressure.create({athlete: athlete2.id, race: race.id, time: [-2,0,2,4,6,8], pressure: [158,169,173,186,198,212]})
        ]);

        // Create performance for updating tests.
        performance = await Performance.create({athlete: athlete1.id, race: race.id, lane: 2, result: "2023-05-05T00:00:14.115Z", startingPressure: pressure1.id, reactionTime: 0.230})
    });

    it('should modify a performance', async function() {
        const res = await supertest(app)
            .put('/performances/' + performance.id)
            .send({
                athlete: athlete2.id,
                race: race.id,
                lane: 3,
                result: "2023-05-05T00:00:14.615Z",
                startingPressure: pressure2.id,
                reactionTime: 0.278
            })
            .expect(200)
            .expect('Content-Type', /json/)
        expect(res.body.athlete).toEqual(athlete2.id);
        expect(res.body.race).toEqual(race.id);
        expect(res.body.lane).toEqual(3);
        expect(res.body.result).toEqual('14.615');
        expect(res.body.startingPressure).toEqual(pressure2.id);
        expect(res.body.reactionTime).toEqual(0.278);
    });

    it('should not modify a performance', async function() {
        const res = await supertest(app)
            .put('/performances/' + performance.id)
            .send({
                athlete: 'abc',
                race: 'abc',
                lane: 50,
                result: "2023-05-032T00:00:14.615Z",
                startingPressure: 'abc',
                reactionTime: 10000
            })
            .expect(409)
            .expect('Content-Type', /json/)
    });
});


/* ------- DELETE tests --------------------------- */


describe('DELETE /performances', function() {
    let country, discipline, meeting, athlete, race, pressure;
    let performance, performanceId;

    it('should delete a performance', async function() {
        // Create a country for the meeting.
        country = await Country.create({alpha2: 'JM', alpha3: 'JAM', noc: 'JAM', name: 'Jamaica'});

        // Create a discipline for the race and athletes.
        discipline = await Discipline.create({type: 'none', distance: 100, gender: 'men'});

        // Create a meeting for the race.
        meeting = await Meeting.create({name: 'Diamond League', startDate: '2023-05-05T00:00:00Z', endDate: '2023-05-05T00:00:00Z', location: 'Suhaim Bin Hamad Stadium', city: 'Doha', country: country.id});

        // Create athletes for the race and performance.
        athlete = await Athlete.create({lastName: 'Bolt', firstName: 'Usain', dateOfBirth: '1986-08-21T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]});

        // Create a race for the performance
        race = await Race.create({meeting: meeting.id, plannedStartTime: '2023-05-05T19:15:00.000Z', realStartTime: '2023-05-05T19:16:00.000Z', state: 'finished', discipline: discipline.id, athletes: [athlete.id]});

        // Create pressure for performance.
        pressure = await Pressure.create({athlete: athlete.id, race: race.id, time: [-2,0,2,4,6,8], pressure: [345,381,432,487,546,610]});

        // Create performance for deleting test.
        performance = await Performance.create({athlete: athlete.id, race: race.id, lane: 2, result: "2023-05-05T00:00:14.115Z", startingPressure: pressure.id, reactionTime: 0.230})
        performanceId = performance.id;
        const res = await supertest(app)
            .delete('/performances/' + performance.id)
            .expect(204)
    });

    it('should not find performance to delete', async function() {
        const res = await supertest(app)
            .delete('/performances/' + performanceId)
            .expect(404)
        expect(res.text).toEqual(`Performance with ID ${performanceId} not found.`)
    });
});


beforeEach(cleanUpDatabase);

afterAll(async () => {
    await cleanUpDatabase()
    await mongoose.disconnect();
});