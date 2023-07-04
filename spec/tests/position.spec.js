import supertest from "supertest"
import mongoose from "mongoose"

import Position from "../../models/position.js";

import Meeting from "../../models/meeting.js";
import Country from "../../models/country.js";
import Athlete from "../../models/athlete.js";
import Discipline from "../../models/discipline.js";
import Race from "../../models/race.js";

import { cleanUpDatabase } from "../utils.js";
import app from "../../app.js"

/* ------- POST tests --------------------------- */

describe('POST /positions', function() {
    let country, discipline, meeting, athlete, race;
    let position;
    beforeEach(async function() {
        // Create a country for the meeting.
        country = await Country.create({alpha2: 'JM', alpha3: 'JAM', noc: 'JAM', name: 'Jamaica'});

        // Create a discipline for the race and athletes.
        discipline = await Discipline.create({type: 'none', distance: 100, gender: 'men'});

        // Create a meeting for the race.
        meeting = await Meeting.create({name: 'Diamond League', startDate: '2023-05-05T00:00:00Z', endDate: '2023-05-05T00:00:00Z', location: 'Suhaim Bin Hamad Stadium', city: 'Doha', country: country.id});

        // Create an athlete for the race and position.
        athlete = await Athlete.create({lastName: 'Blake', firstName: 'Yohan', dateOfBirth: '1989-12-26T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]});

        // Create a race for the position.
        race = await Race.create({meeting: meeting.id, plannedStartTime: '2023-05-05T19:15:00.000Z', realStartTime: '', state: 'pending', discipline: discipline.id, athletes: [athlete.id]})
    });

    it('should create a position', async function() {
        const res = await supertest(app)
            .post('/positions')
            .send({
                athlete: athlete.id,
                race: race.id,
                rank: 3,
                runnedDistance: 30,
                gapToLeader: 1.8,
                speed: 26.6,
                time: "2023-05-05T00:00:09.716Z",
                coordinates: [80,232]
            })
            .expect(201)
            .expect('Content-Type', /json/);
        expect(res.body.athlete).toEqual(athlete.id);
        expect(res.body.race).toEqual(race.id);
        expect(res.body.rank).toEqual(3);
        expect(res.body.runnedDistance).toEqual(30);
        expect(res.body.gapToLeader).toEqual(1.8);
        expect(res.body.speed).toEqual(26.6);
        expect(res.body.time).toEqual("00:00:09.716");
        expect(res.body.coordinates).toEqual([80,232]);
    });

    it('should not create a position (invalid body)', async function() {
        const res = await supertest(app)
            .post('/positions')
            .send({
                athlete: athlete.id,
                race: race.id,
                rank: -3,
                runnedDistance: -30,
                gapToLeader: -1.8,
                speed: -26.6,
                time: "2023-05-05T00:00:09.716Z",
                coordinates: [-80,-232]
            })
            .expect(409)
            .expect('Content-Type', /json/);
    });

    it('should not create a position (empty body)', async function() {
        const res = await supertest(app)
            .post('/positions')
            .send({})
            .expect(409)
            .expect('Content-Type', /json/);
    });
});



/* ------- GET tests --------------------------- */

describe('GET /positions', function() {

    let country, discipline, meeting, athlete, race;
    let position1, position2;
    beforeEach(async function() {
        // Create a country for the meeting.
        country = await Country.create({alpha2: 'JM', alpha3: 'JAM', noc: 'JAM', name: 'Jamaica'});

        // Create a discipline for the race and athletes.
        discipline = await Discipline.create({type: 'none', distance: 100, gender: 'men'});

        // Create a meeting for the race.
        meeting = await Meeting.create({name: 'Diamond League', startDate: '2023-05-05T00:00:00Z', endDate: '2023-05-05T00:00:00Z', location: 'Suhaim Bin Hamad Stadium', city: 'Doha', country: country.id});

        // Create an athlete for the race and positions.
        athlete = await Athlete.create({lastName: 'Blake', firstName: 'Yohan', dateOfBirth: '1989-12-26T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]});

        // Create a race for the position
        race = await Race.create({meeting: meeting.id, plannedStartTime: '2023-05-05T19:15:00.000Z', realStartTime: '', state: 'pending', discipline: discipline.id, athletes: [athlete.id]});

        // Create positions for retrieving test
        [ position1, position2 ] = await Promise.all([
            Position.create({athlete: athlete.id, race: race.id, rank: 3, runnedDistance: 30, gapToLeader: 1.8, speed: 26.6, time: "2023-05-05T00:00:09.716Z", coordinates: [80,232]}),
            Position.create({athlete: athlete.id, race: race.id, rank: 3, runnedDistance: 34, gapToLeader: 1.9, speed: 25.9, time: "2023-05-05T00:00:10.132Z", coordinates: [84,231]})
        ]);
    });

    it('should get a list of positions', async function() {
        const res = await supertest(app)
            .get('/positions')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(res.body[0].athlete.id).toEqual(athlete.id);
        expect(res.body[0].race.id).toEqual(race.id);
        expect(res.body[0].rank).toEqual(3);
        expect(res.body[0].runnedDistance).toEqual(30);
        expect(res.body[0].gapToLeader).toEqual(1.8);
        expect(res.body[0].speed).toEqual(26.6);
        expect(res.body[0].time).toEqual("00:00:09.716");
        expect(res.body[0].coordinates).toEqual([80,232]);
        
        expect(res.body[1].athlete.id).toEqual(athlete.id);
        expect(res.body[1].race.id).toEqual(race.id);
        expect(res.body[1].rank).toEqual(3);
        expect(res.body[1].runnedDistance).toEqual(34);
        expect(res.body[1].gapToLeader).toEqual(1.9);
        expect(res.body[1].speed).toEqual(25.9);
        expect(res.body[1].time).toEqual("00:00:10.132");
        expect(res.body[1].coordinates).toEqual([84,231]);
        
    });

    it('should get a specific position', async function() {
        const res = await supertest(app)
            .get(`/positions?athlete=${athlete.id}&race=${race.id}&speed=26`)
            .expect(200)
            .expect('Content-Type', /json/)
        expect(res.body[0].athlete.id).toEqual(athlete.id);
        expect(res.body[0].race.id).toEqual(race.id);
        expect(res.body[0].rank).toEqual(3);
        expect(res.body[0].runnedDistance).toEqual(30);
        expect(res.body[0].gapToLeader).toEqual(1.8);
        expect(res.body[0].speed).toEqual(26.6);
        expect(res.body[0].time).toEqual("00:00:09.716");
        expect(res.body[0].coordinates).toEqual([80,232]);
    });

    it('should not get a specific position', async function() {
        const res = await supertest(app)
            .get('/positions?speed=18000')
            .expect(404)
    });

});


/* ------- PUT tests --------------------------- */


describe('PUT /positions', function() {

    let country, discipline, meeting, athlete, race;
    let position;
    beforeEach(async function() {
        // Create a country for the meeting.
        country = await Country.create({alpha2: 'JM', alpha3: 'JAM', noc: 'JAM', name: 'Jamaica'});

        // Create a discipline for the race and athletes.
        discipline = await Discipline.create({type: 'none', distance: 100, gender: 'men'});

        // Create a meeting for the race.
        meeting = await Meeting.create({name: 'Diamond League', startDate: '2023-05-05T00:00:00Z', endDate: '2023-05-05T00:00:00Z', location: 'Suhaim Bin Hamad Stadium', city: 'Doha', country: country.id});

        // Create an athlete for the race and position.
        athlete = await Athlete.create({lastName: 'Blake', firstName: 'Yohan', dateOfBirth: '1989-12-26T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]});

        // Create a race for the position.
        race = await Race.create({meeting: meeting.id, plannedStartTime: '2023-05-05T19:15:00.000Z', realStartTime: '', state: 'pending', discipline: discipline.id, athletes: [athlete.id]});

        // Create position for modifying tests.
        position = await Position.create({athlete: athlete.id, race: race.id, rank: 3, runnedDistance: 30, gapToLeader: 1.8, speed: 26.6, time: "2023-05-05T00:00:09.716Z", coordinates: [80,232]})
    });

    it('should modify a position', async function() {
        const res = await supertest(app)
            .put('/positions/' + position.id)
            .send({
                athlete: athlete.id,
                race: race.id,
                rank: 3,
                runnedDistance: 34,
                gapToLeader: 1.9,
                speed: 25.9,
                time: "2023-05-05T00:00:10.132Z",
                coordinates: [84,231]
            })
            .expect(200)
            .expect('Content-Type', /json/)
        expect(res.body.athlete).toEqual(athlete.id);
        expect(res.body.race).toEqual(race.id);
        expect(res.body.rank).toEqual(3);
        expect(res.body.runnedDistance).toEqual(34);
        expect(res.body.gapToLeader).toEqual(1.9);
        expect(res.body.speed).toEqual(25.9);
        expect(res.body.time).toEqual("00:00:10.132");
        expect(res.body.coordinates).toEqual([84,231]);
    });

    it('should not modify a position', async function() {
        const res = await supertest(app)
            .put('/positions/' + position.id)
            .send({
                athlete: 'abc',
                race: 'abc',
                time: [4000, 8000, 1000],
                position: [-100, -200, -300]
            })
            .expect(409)
            .expect('Content-Type', /json/)
    });
});


/* ------- DELETE tests --------------------------- */


describe('DELETE /positions', function() {
    let country, discipline, meeting, athlete, race;
    let position, positionId;

    it('should delete a position', async function() {
        // Create a country for the meeting.
        country = await Country.create({alpha2: 'JM', alpha3: 'JAM', noc: 'JAM', name: 'Jamaica'});

        // Create a discipline for the race and athletes.
        discipline = await Discipline.create({type: 'none', distance: 100, gender: 'men'});

        // Create a meeting for the race.
        meeting = await Meeting.create({name: 'Diamond League', startDate: '2023-05-05T00:00:00Z', endDate: '2023-05-05T00:00:00Z', location: 'Suhaim Bin Hamad Stadium', city: 'Doha', country: country.id});

        // Create an athlete for the race and position.
        athlete = await Athlete.create({lastName: 'Blake', firstName: 'Yohan', dateOfBirth: '1989-12-26T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]});

        // Create a race for the position.
        race = await Race.create({meeting: meeting.id, plannedStartTime: '2023-05-05T19:15:00.000Z', realStartTime: '', state: 'pending', discipline: discipline.id, athletes: [athlete.id]});

        // Create positions for deleting test.
        position = await Position.create({athlete: athlete.id, race: race.id, rank: 3, runnedDistance: 30, gapToLeader: 1.8, speed: 26.6, time: "2023-05-05T00:00:09.716Z", coordinates: [80,232]})
        positionId = position.id;
        
        const res = await supertest(app)
            .delete('/positions/' + position.id)
            .expect(204)
    });

    it('should not find position to delete', async function() {
        const res = await supertest(app)
            .delete('/positions/' + positionId)
            .expect(404)
        expect(res.text).toEqual(`Position with ID ${positionId} not found.`)
    });
});


beforeEach(cleanUpDatabase);

afterAll(async () => {
    await cleanUpDatabase()
    await mongoose.disconnect();
});