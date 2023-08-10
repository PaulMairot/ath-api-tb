import supertest from "supertest"
import mongoose from "mongoose"

import Record from "../../models/record.js";

import Performance from "../../models/performance.js";
import Meeting from "../../models/meeting.js";
import Country from "../../models/country.js";
import Athlete from "../../models/athlete.js";
import Discipline from "../../models/discipline.js";
import Race from "../../models/race.js";

import { cleanUpDatabase } from "../utils.js";
import app from "../../app.js"

/* ------- POST tests --------------------------- */

describe('POST /records', function() {
    let country, discipline, meeting, athlete, race, performance;
    beforeEach(async function() {
        // Create a country for the meeting.
        country = await Country.create({alpha2: 'JM', alpha3: 'JAM', noc: 'JAM', name: 'Jamaica'});

        // Create a discipline for the race and athletes.
        discipline = await Discipline.create({type: 'none', distance: 100, gender: 'men'});

        // Create a meeting for the race.
        meeting = await Meeting.create({name: 'Diamond League', startDate: '2023-05-05T00:00:00Z', endDate: '2023-05-05T00:00:00Z', location: 'Suhaim Bin Hamad Stadium', city: 'Doha', country: country.id});

        // Create athlete for the race and performance.
        athlete = await Athlete.create({lastName: 'Bolt', firstName: 'Usain', dateOfBirth: '1986-08-21T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]});

        // Create a race for the performance
        race = await Race.create({meeting: meeting.id, plannedStartTime: '2023-05-05T19:15:00.000Z', realStartTime: '2023-05-05T19:16:00.000Z', state: 'finished', discipline: discipline.id, athletes: [athlete.id]})

        // Create a performance for the record
        performance = await Performance.create({athlete: athlete.id, race: race.id, result: "2023-05-05T00:00:14.115Z", mention: 'MR'});
        
    });


    it('should create a record', async function() {
        const res = await supertest(app)
            .post('/records')
            .send({
                athlete: athlete.id,
                race: race.id,
                discipline: discipline.id,
                country: country.id,
                performance: performance.id,
                result: await performance.get('result', null, { getters: false }),
                mention: performance.mention[0]
            })
            .expect(201)
            .expect('Content-Type', /json/);
        expect(res.body.athlete).toEqual(athlete.id);
        expect(res.body.race).toEqual(race.id);
        expect(res.body.discipline).toEqual(discipline.id);
        expect(res.body.country).toEqual(country.id);
        expect(res.body.performance).toEqual(performance.id);
        expect(res.body.result).toEqual((await performance.get('result', null, { getters: false })).toISOString());
        expect(res.body.mention).toEqual('MR');
    });

    it('should not create a record (invalid body)', async function() {
        const res = await supertest(app)
            .post('/records')
            .send({
                athlete: 'abc',
                race: 'abc',
                discipline: 'abc',
                country: 'abc',
                performance: 'abc',
                result:'2023-05-32T26:15:00.000Z',
                mention: 'PW'
            })
            .expect(409)
            .expect('Content-Type', /json/);
    });

    it('should not create a record (empty body)', async function() {
        const res = await supertest(app)
            .post('/records')
            .send({})
            .expect(409)
            .expect('Content-Type', /json/);
    });
});



/* ------- GET tests --------------------------- */

describe('GET /records', function() {

    let country, discipline, meeting, athlete1, athlete2, race, record1, record2;
    let performance1, performance2;
    beforeEach(async function() {
         // Create a country for the meeting.
         country = await Country.create({alpha2: 'JM', alpha3: 'JAM', noc: 'JAM', name: 'Jamaica'});

         // Create a discipline for the race and athletes.
         discipline = await Discipline.create({type: 'none', distance: 100, gender: 'men'});
 
         // Create a meeting for the race.
         meeting = await Meeting.create({name: 'Diamond League', startDate: '2023-05-05T00:00:00Z', endDate: '2023-05-05T00:00:00Z', location: 'Suhaim Bin Hamad Stadium', city: 'Doha', country: country.id});
 
        // Create athletes for the race and performances.
        [ athlete1, athlete2 ] = await Promise.all([
            Athlete.create({lastName: 'Blake', firstName: 'Yohan', dateOfBirth: '1989-12-26T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]}),
            Athlete.create({lastName: 'Bolt', firstName: 'Usain', dateOfBirth: '1986-08-21T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]}),
        ]);
 
         // Create a race for the performance
         race = await Race.create({meeting: meeting.id, plannedStartTime: '2023-05-05T19:15:00.000Z', realStartTime: '2023-05-05T19:16:00.000Z', state: 'finished', discipline: discipline.id, athletes: [athlete1.id, athlete2.id]});

        // Create performances for records.
        [ performance1, performance2 ] = await Promise.all([
            Performance.create({athlete: athlete1.id, race: race.id, result: "2023-05-05T00:00:14.115Z", mention: ['MR']}),
            Performance.create({athlete: athlete2.id, race: race.id, result: "2023-05-05T00:00:16.615Z", mention: ['PB']})
        ]);

        // Create records for retrieving tests.
        [ record1, record2 ] = await Promise.all([
            Record.create({athlete: athlete1.id, race: race.id, discipline: discipline.id, country: country.id, performance: performance1.id, result: await performance1.get('result', null, { getters: false }), mention: performance1.mention[0]}),
            Record.create({athlete: athlete2.id, race: race.id, discipline: discipline.id, country: country.id, performance: performance2.id, result: await performance2.get('result', null, { getters: false }), mention: performance2.mention[0]}),
        ]);
    });

    it('should get a list of records', async function() {
        const res = await supertest(app)
            .get('/records')
            .expect(200)
            .expect('Content-Type', /json/)
        expect(res.body[0].athlete.id).toEqual(athlete1.id)
        expect(res.body[0].race.id).toEqual(race.id);
        expect(res.body[0].discipline.id).toEqual(discipline.id);
        expect(res.body[0].country.id).toEqual(country.id);
        expect(res.body[0].performance.id).toEqual(performance1.id);
        expect(res.body[0].result).toEqual((await performance1.get('result', null, { getters: false })).toISOString());
        expect(res.body[0].mention).toEqual(performance1.mention[0]);

        expect(res.body[1].athlete.id).toEqual(athlete2.id)
        expect(res.body[1].race.id).toEqual(race.id);
        expect(res.body[1].discipline.id).toEqual(discipline.id);
        expect(res.body[1].country.id).toEqual(country.id);
        expect(res.body[1].performance.id).toEqual(performance2.id);
        expect(res.body[1].result).toEqual((await performance2.get('result', null, { getters: false })).toISOString());
        expect(res.body[1].mention).toEqual(performance2.mention[0]);
        

    });

    it('should get a specific record', async function() {
        const res = await supertest(app)
            .get(`/records?athlete=${athlete2.id}&mention=${performance2.mention[0]}`)
            .expect(200)
            .expect('Content-Type', /json/)
        expect(res.body[0].athlete.id).toEqual(athlete2.id)
        expect(res.body[0].race.id).toEqual(race.id);
        expect(res.body[0].discipline.id).toEqual(discipline.id);
        expect(res.body[0].country.id).toEqual(country.id);
        expect(res.body[0].performance.id).toEqual(performance2.id);
        expect(res.body[0].result).toEqual((await performance2.get('result', null, { getters: false })).toISOString());
        expect(res.body[0].mention).toEqual(performance2.mention[0]);
    });

    it('should limit returned records to one element', async function() {
        const res = await supertest(app)
            .get('/records?limit=1')
            .expect(200)
            .expect('Content-Type', /json/)
        expect(res.body).toHaveLength(1);
    });

    it('should not get a specific record', async function() {
        const res = await supertest(app)
            .get('/records?mention=PW')
            .expect(404)
    });

});


/* ------- PUT tests --------------------------- */


describe('PUT /records', function() {

    let country, discipline, meeting, athlete, race, performance;
    let record

    beforeEach(async function() {
        // Create a country for the meeting.
        country = await Country.create({alpha2: 'JM', alpha3: 'JAM', noc: 'JAM', name: 'Jamaica'});

        // Create a discipline for the race and athletes.
        discipline = await Discipline.create({type: 'none', distance: 100, gender: 'men'});
 
        // Create a meeting for the race.
        meeting = await Meeting.create({name: 'Diamond League', startDate: '2023-05-05T00:00:00Z', endDate: '2023-05-05T00:00:00Z', location: 'Suhaim Bin Hamad Stadium', city: 'Doha', country: country.id});
 
        // Create an athlete for the race and performance.
        athlete = await Athlete.create({lastName: 'Bolt', firstName: 'Usain', dateOfBirth: '1986-08-21T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]});
 
        // Create a race for the performance
        race = await Race.create({meeting: meeting.id, plannedStartTime: '2023-05-05T19:15:00.000Z', realStartTime: '2023-05-05T19:16:00.000Z', state: 'finished', discipline: discipline.id, athletes: [athlete.id]});

        // Create a performance for record.
        performance = await Performance.create({athlete: athlete.id, race: race.id, result: "2023-05-05T00:00:14.115Z", mention: ['MR']});

        // Create records for updating tests.
        record = await Record.create({athlete: athlete.id, race: race.id, discipline: discipline.id, country: country.id, performance: performance.id, result: await performance.get('result', null, { getters: false }), mention: performance.mention[0]});
    });

    it('should modify a record', async function() {
        const res = await supertest(app)
            .put('/records/' + record.id)
            .send({
                result: '2023-05-05T00:00:16.235Z',
                mention: 'PB'
            })
        expect(res.body.athlete).toEqual(athlete.id);
        expect(res.body.race).toEqual(race.id);
        expect(res.body.discipline).toEqual(discipline.id);
        expect(res.body.country).toEqual(country.id);
        expect(res.body.performance).toEqual(performance.id);
        expect(res.body.result).toEqual('2023-05-05T00:00:16.235Z');
        expect(res.body.mention).toEqual('PB');
    });

    it('should not modify a record', async function() {
        const res = await supertest(app)
            .put('/records/' + record.id)
            .send({
                athlete: 'abc',
                race: 'abc',
                discipline: 'abc',
                country: 'abc',
                performance: 'abc',
                result:'2023-05-32T26:15:00.000Z',
                mention: 'PW'
            })
            .expect(409)
            .expect('Content-Type', /json/)
    });
});


/* ------- DELETE tests --------------------------- */


describe('DELETE /records', function() {
    let country, discipline, meeting, athlete, race, performance;
    let record, recordId;

    it('should delete a record', async function() {
        // Create a country for the meeting.
        country = await Country.create({alpha2: 'JM', alpha3: 'JAM', noc: 'JAM', name: 'Jamaica'});

        // Create a discipline for the race and athletes.
        discipline = await Discipline.create({type: 'none', distance: 100, gender: 'men'});
 
        // Create a meeting for the race.
        meeting = await Meeting.create({name: 'Diamond League', startDate: '2023-05-05T00:00:00Z', endDate: '2023-05-05T00:00:00Z', location: 'Suhaim Bin Hamad Stadium', city: 'Doha', country: country.id});
 
        // Create an athlete for the race and performance.
        athlete = await Athlete.create({lastName: 'Bolt', firstName: 'Usain', dateOfBirth: '1986-08-21T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]});
 
        // Create a race for the performance
        race = await Race.create({meeting: meeting.id, plannedStartTime: '2023-05-05T19:15:00.000Z', realStartTime: '2023-05-05T19:16:00.000Z', state: 'finished', discipline: discipline.id, athletes: [athlete.id]});

        // Create a performance for record.
        performance = await Performance.create({athlete: athlete.id, race: race.id, result: "2023-05-05T00:00:14.115Z", mention: ['MR']});

        // Create records for deleting test.
        record = await Record.create({athlete: athlete.id, race: race.id, discipline: discipline.id, country: country.id, performance: performance.id, result: await performance.get('result', null, { getters: false }), mention: performance.mention[0]});
        recordId = performance.id;
        const res = await supertest(app)
            .delete('/performances/' + performance.id)
            .expect(204)
    });

    it('should not find record to delete', async function() {
        const res = await supertest(app)
            .delete('/records/' + recordId)
            .expect(404)
        expect(res.text).toEqual(`Record with ID ${recordId} not found.`)
    });
});


beforeEach(cleanUpDatabase);

afterAll(async () => {
    await cleanUpDatabase();
    await mongoose.disconnect();
});