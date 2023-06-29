import supertest from "supertest"
import mongoose from "mongoose"

import Pressure from "../../models/pressure.js";

import Meeting from "../../models/meeting.js";
import Country from "../../models/country.js";
import Athlete from "../../models/athlete.js";
import Discipline from "../../models/discipline.js";
import Race from "../../models/race.js";

import { cleanUpDatabase } from "../utils.js";
import app from "../../app.js"

/* ------- POST tests --------------------------- */

describe('POST /pressures', function() {
    let country, discipline, meeting, athlete1, athlete2, race;
    let pressure;
    beforeEach(async function() {
        // Create a country for the meeting.
        country = await Country.create({alpha2: 'JM', alpha3: 'JAM', noc: 'JAM', name: 'Jamaica'});

        // Create a discipline for the meeting and athletes.
        discipline = await Discipline.create({type: 'none', distance: 100, gender: 'men'});

        // Create a meeting for the race.
        meeting = await Meeting.create({name: 'Diamond League', startDate: '2023-05-05T00:00:00Z', endDate: '2023-05-05T00:00:00Z', location: 'Suhaim Bin Hamad Stadium', city: 'Doha', country: country.id});

        // Create athletes for the race and pressure.
        [ athlete1, athlete2 ] = await Promise.all([
            Athlete.create({lastName: 'Blake', firstName: 'Yohan', dateOfBirth: '1989-12-26T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]}),
            Athlete.create({lastName: 'Bolt', firstName: 'Usain', dateOfBirth: '1986-08-21T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]}),
        ])

        // Create a race for the pressure
        race = await Race.create({meeting: meeting.id, plannedStartTime: '2023-05-05T19:15:00.000Z', realStartTime: '', state: 'pending', discipline: discipline.id, athletes: [athlete1.id, athlete2.id]})
    });

    it('should create a pressure', async function() {
        const res = await supertest(app)
            .post('/pressures')
            .send({
                athlete: athlete1.id,
                race: race.id,
                time: [-2,0,2,4,6,8],
                pressure: [345,381,432,487,546,610]
            })
            .expect(201)
            .expect('Content-Type', /json/);
        expect(res.body.athlete).toEqual(athlete1.id);
        expect(res.body.race).toEqual(race.id);
        expect(res.body.time).toEqual([-2,0,2,4,6,8]);
        expect(res.body.pressure).toEqual([345,381,432,487,546,610]);
    });

    it('should not create a pressure (invalid body)', async function() {
        const res = await supertest(app)
            .post('/pressures')
            .send({
                athlete: 'abc',
                race: 'abc',
                time: [4000, 8000, 1000],
                pressure: [-100, -200, -300]
            })
            .expect(409)
            .expect('Content-Type', /json/);
    });

    it('should not create a pressure (empty body)', async function() {
        const res = await supertest(app)
            .post('/pressures')
            .send({})
            .expect(409)
            .expect('Content-Type', /json/);
    });
});



/* ------- GET tests --------------------------- */

describe('GET /pressures', function() {

    let country, discipline, meeting, athlete1, athlete2, race;
    let pressure1, pressure2;
    beforeEach(async function() {
        // Create a country for the meeting.
        country = await Country.create({alpha2: 'JM', alpha3: 'JAM', noc: 'JAM', name: 'Jamaica'});

        // Create a discipline for the meeting and athletes.
        discipline = await Discipline.create({type: 'none', distance: 100, gender: 'men'});

        // Create a meeting for the race.
        meeting = await Meeting.create({name: 'Diamond League', startDate: '2023-05-05T00:00:00Z', endDate: '2023-05-05T00:00:00Z', location: 'Suhaim Bin Hamad Stadium', city: 'Doha', country: country.id});

        // Create athletes for the race and pressure.
        [ athlete1, athlete2 ] = await Promise.all([
            Athlete.create({lastName: 'Blake', firstName: 'Yohan', dateOfBirth: '1989-12-26T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]}),
            Athlete.create({lastName: 'Bolt', firstName: 'Usain', dateOfBirth: '1986-08-21T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]}),
        ]);

        // Create a race for the pressure
        race = await Race.create({meeting: meeting.id, plannedStartTime: '2023-05-05T19:15:00.000Z', realStartTime: '', state: 'pending', discipline: discipline.id, athletes: [athlete1.id, athlete2.id]});

        // Create pressures for retrieving tests.
        [ pressure1, pressure2 ] = await Promise.all([
            Pressure.create({athlete: athlete1.id, race: race.id, time: [-2,0,2,4,6,8], pressure: [345,381,432,487,546,610]}),
            Pressure.create({athlete: athlete2.id, race: race.id, time: [-2,0,2,4,6,8], pressure: [158,169,173,186,198,212]})
        ])
    });

    it('should get a list of pressures', async function() {
        const res = await supertest(app)
            .get('/pressures')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(res.body[0].athlete.id).toEqual(athlete1.id)
        expect(res.body[0].race.id).toEqual(race.id)
        expect(res.body[0].time).toEqual([-2,0,2,4,6,8]);
        expect(res.body[0].pressure).toEqual([345,381,432,487,546,610]);


        expect(res.body[1].athlete.id).toEqual(athlete2.id)
        expect(res.body[1].race.id).toEqual(race.id)
        expect(res.body[1].time).toEqual([-2,0,2,4,6,8]);
        expect(res.body[1].pressure).toEqual([158,169,173,186,198,212]);
        

    });

    it('should get a specific pressure', async function() {
        const res = await supertest(app)
            .get(`/pressures?athlete=${athlete1.id}&race=${race.id}`)
            .expect(200)
            .expect('Content-Type', /json/)
        expect(res.body[0].athlete.id).toEqual(athlete1.id)
        expect(res.body[0].race.id).toEqual(race.id)
        expect(res.body[0].time).toEqual([-2,0,2,4,6,8]);
        expect(res.body[0].pressure).toEqual([345,381,432,487,546,610]);
    });

    it('should not get a specific pressure', async function() {
        const res = await supertest(app)
            .get('/pressures?name=World Championship')
            .expect(404)
    });

});


/* ------- PUT tests --------------------------- */


describe('PUT /pressures', function() {

    let country, discipline, meeting, athlete1, athlete2, race;
    let pressure;
    beforeEach(async function() {
        // Create a country for the meeting.
        country = await Country.create({alpha2: 'JM', alpha3: 'JAM', noc: 'JAM', name: 'Jamaica'});

        // Create a discipline for the meeting and athletes.
        discipline = await Discipline.create({type: 'none', distance: 100, gender: 'men'});

        // Create a meeting for the race.
        meeting = await Meeting.create({name: 'Diamond League', startDate: '2023-05-05T00:00:00Z', endDate: '2023-05-05T00:00:00Z', location: 'Suhaim Bin Hamad Stadium', city: 'Doha', country: country.id});

        // Create athletes for the race and pressure.
        [ athlete1, athlete2 ] = await Promise.all([
            Athlete.create({lastName: 'Blake', firstName: 'Yohan', dateOfBirth: '1989-12-26T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]}),
            Athlete.create({lastName: 'Bolt', firstName: 'Usain', dateOfBirth: '1986-08-21T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]}),
        ]);

        // Create a race for the pressure
        race = await Race.create({meeting: meeting.id, plannedStartTime: '2023-05-05T19:15:00.000Z', realStartTime: '', state: 'pending', discipline: discipline.id, athletes: [athlete1.id, athlete2.id]});

        // Create pressure to modify.
        pressure = await Pressure.create({athlete: athlete1.id, race: race.id, time: [-2,0,2,4,6,8], pressure: [345,381,432,487,546,610]});
    });

    it('should modify a pressure', async function() {
        const res = await supertest(app)
            .put('/pressures/' + pressure.id)
            .send({
                athlete: athlete2.id,
                race: race.id,
                time: [-2,0,2,4,6,8],
                pressure: [158,169,173,186,198,212]
            })
            .expect(200)
            .expect('Content-Type', /json/)
        expect(res.body.athlete).toEqual(athlete2.id)
        expect(res.body.race).toEqual(race.id)
        expect(res.body.time).toEqual([-2,0,2,4,6,8]);
        expect(res.body.pressure).toEqual([158,169,173,186,198,212]);
    });

    it('should not modify a pressure', async function() {
        const res = await supertest(app)
            .put('/pressures/' + pressure.id)
            .send({
                athlete: 'abc',
                race: 'abc',
                time: [4000, 8000, 1000],
                pressure: [-100, -200, -300]
            })
            .expect(409)
            .expect('Content-Type', /json/)
    });
});


/* ------- DELETE tests --------------------------- */


describe('DELETE /pressures', function() {
    let country, discipline, meeting, athlete1, athlete2, race;
    let pressure, pressureId;

    it('should delete a pressure', async function() {
        // Create a country for the meeting.
        country = await Country.create({alpha2: 'JM', alpha3: 'JAM', noc: 'JAM', name: 'Jamaica'});

        // Create a discipline for the meeting and athletes.
        discipline = await Discipline.create({type: 'none', distance: 100, gender: 'men'});

        // Create a meeting for the race.
        meeting = await Meeting.create({name: 'Diamond League', startDate: '2023-05-05T00:00:00Z', endDate: '2023-05-05T00:00:00Z', location: 'Suhaim Bin Hamad Stadium', city: 'Doha', country: country.id});

        // Create athletes for the race and pressure.
        [ athlete1, athlete2 ] = await Promise.all([
            Athlete.create({lastName: 'Blake', firstName: 'Yohan', dateOfBirth: '1989-12-26T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]}),
            Athlete.create({lastName: 'Bolt', firstName: 'Usain', dateOfBirth: '1986-08-21T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]}),
        ]);

        // Create a race for the pressure
        race = await Race.create({meeting: meeting.id, plannedStartTime: '2023-05-05T19:15:00.000Z', realStartTime: '', state: 'pending', discipline: discipline.id, athletes: [athlete1.id, athlete2.id]});

        // Create pressure to modify.
        pressure = await Pressure.create({athlete: athlete1.id, race: race.id, time: [-2,0,2,4,6,8], pressure: [345,381,432,487,546,610]});
        pressureId = pressure.id;
        const res = await supertest(app)
            .delete('/pressures/' + pressure.id)
            .expect(204)
    });

    it('should not find pressure to delete', async function() {
        const res = await supertest(app)
            .delete('/pressures/' + pressureId)
            .expect(404)
        expect(res.text).toEqual(`Pressure with ID ${pressureId} not found.`)
    });
});


beforeEach(cleanUpDatabase);

afterAll(async () => {
    await cleanUpDatabase()
    await mongoose.disconnect();
});