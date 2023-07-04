import supertest from "supertest"
import mongoose from "mongoose"

import Race from "../../models/race.js";

import Meeting from "../../models/meeting.js";
import Country from "../../models/country.js";
import Athlete from "../../models/athlete.js";
import Discipline from "../../models/discipline.js";

import { cleanUpDatabase } from "../utils.js";
import app from "../../app.js"


/* ------- POST tests --------------------------- */

describe('POST /races', function() {
    let country, discipline, meeting, athlete1, athlete2;

    beforeEach(async function() {
        // Create a country for the meeting.
        country = await Country.create({alpha2: 'JM', alpha3: 'JAM', noc: 'JAM', name: 'Jamaica'});

        // Create a discipline for the race and athletes.
        discipline = await Discipline.create({type: 'none', distance: 100, gender: 'men'});

        // Create a meeting for the race.
        meeting = await Meeting.create({name: 'Diamond League', startDate: '2023-05-05T00:00:00Z', endDate: '2023-05-05T00:00:00Z', location: 'Suhaim Bin Hamad Stadium', city: 'Doha', country: country.id});

        // Create athletes for the race.
        [ athlete1, athlete2 ] = await Promise.all([
            Athlete.create({lastName: 'Blake', firstName: 'Yohan', dateOfBirth: '1989-12-26T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]}),
            Athlete.create({lastName: 'Bolt', firstName: 'Usain', dateOfBirth: '1986-08-21T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]}),
        ])
    });

    it('should create a race', async function() {
        const res = await supertest(app)
            .post('/races')
            .send({
                meeting: meeting.id,
                plannedStartTime: '2023-05-05T19:15:00.000Z',
                realStartTime: '2023-05-05T19:15:30.000Z',
                state: 'finished',
                discipline: discipline.id,
                athletes: [athlete1.id, athlete2.id]
            })
            .expect(201)
            .expect('Content-Type', /json/);
        expect(res.body.meeting).toEqual(meeting.id);
        expect(res.body.plannedStartTime).toEqual('19:15:00');
        expect(res.body.realStartTime).toEqual('19:15:30');
        expect(res.body.state).toEqual('finished');
        expect(res.body.discipline).toEqual(discipline.id);
        expect(res.body.athletes).toEqual([athlete1.id, athlete2.id]);
    });

    it('should not create a race (invalid body)', async function() {
        const res = await supertest(app)
            .post('/races')
            .send({
                meeting: "abc",
                plannedStartTime: '2023-05-32T19:15:00.000Z',
                realStartTime: '2023-05-32T19:15:30.000Z',
                state: 'notSure',
                discipline: "abc",
                athletes: "abc"
            })
            .expect(409)
            .expect('Content-Type', /json/);
    });

    it('should not create a race (empty body)', async function() {
        const res = await supertest(app)
            .post('/races')
            .send({})
            .expect(409)
            .expect('Content-Type', /json/);
    });
});



/* ------- GET tests --------------------------- */

describe('GET /races', function() {

    let race1, race2;
    let country, discipline, meeting, athlete1, athlete2;

    beforeEach(async function() {
        // Create a country for the meeting.
        country = await Country.create({alpha2: 'JM', alpha3: 'JAM', noc: 'JAM', name: 'Jamaica'});

        // Create a discipline for the race and athletes.
        discipline = await Discipline.create({type: 'none', distance: 100, gender: 'men'});

        // Create a meeting for the race.
        meeting = await Meeting.create({name: 'Diamond League', startDate: '2023-05-05T00:00:00Z', endDate: '2023-05-05T00:00:00Z', location: 'Suhaim Bin Hamad Stadium', city: 'Doha', country: country.id});

        // Create athletes for races.
        [ athlete1, athlete2 ] = await Promise.all([
            Athlete.create({lastName: 'Blake', firstName: 'Yohan', dateOfBirth: '1989-12-26T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]}),
            Athlete.create({lastName: 'Bolt', firstName: 'Usain', dateOfBirth: '1986-08-21T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]}),
        ]);

        // Create races before retrieving the list.
        [ race1, race2 ] = await Promise.all([
            Race.create({meeting: meeting.id, plannedStartTime: '2023-05-05T19:15:00.000Z', realStartTime: '', state: 'pending', discipline: discipline.id, athletes: [athlete1.id, athlete2.id]}),
            Race.create({meeting: meeting.id, plannedStartTime: '2023-05-05T18:30:00.000Z', realStartTime: '2023-05-05T18:29:45.000Z', state: 'finished', discipline: discipline.id, athletes: [athlete2.id, athlete1.id]})
        ])
    });

    it('should get a list of races', async function() {
        const res = await supertest(app)
            .get('/races')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(res.body[0].meeting).toEqual( 
            expect.objectContaining({ name: meeting.name, startDate: meeting.startDate, endDate: meeting.endDate, location: meeting.location, city: meeting.city})
        );
        expect(res.body[0].plannedStartTime).toEqual('18:30:00');
        expect(res.body[0].realStartTime).toEqual('18:29:45');
        expect(res.body[0].state).toEqual('finished');
        expect(res.body[0].discipline).toEqual( 
            expect.objectContaining({ type: discipline.type, distance: discipline.distance, gender: discipline.gender})
        );
        expect(res.body[0].athletes[0]).toEqual( 
            expect.objectContaining({ firstName: athlete2.firstName, lastName: athlete2.lastName})
        );
        expect(res.body[0].athletes[1]).toEqual( 
            expect.objectContaining({ firstName: athlete1.firstName, lastName: athlete1.lastName})
        );


        expect(res.body[1].meeting).toEqual( 
            expect.objectContaining({ name: meeting.name, startDate: meeting.startDate, endDate: meeting.endDate, location: meeting.location, city: meeting.city})
        );
        expect(res.body[1].plannedStartTime).toEqual('19:15:00');
        expect(res.body[1].state).toEqual('pending');
        expect(res.body[1].discipline).toEqual( 
            expect.objectContaining({ type: discipline.type, distance: discipline.distance, gender: discipline.gender})
        );
        expect(res.body[1].athletes[0]).toEqual( 
            expect.objectContaining({ firstName: athlete1.firstName, lastName: athlete1.lastName})
        );
        expect(res.body[1].athletes[1]).toEqual( 
            expect.objectContaining({ firstName: athlete2.firstName, lastName: athlete2.lastName})
        );


    });

    it('should get a specific race', async function() {
        const res = await supertest(app)
            .get(`/races?meeting=${meeting.id}&state=finished&plannedStartTime=2023-05-05T18:30:00.000Z&discipline=${discipline.id}`)
            .expect(200)
            .expect('Content-Type', /json/)
        expect(res.body[0].meeting).toEqual( 
            expect.objectContaining({ name: meeting.name, startDate: meeting.startDate, endDate: meeting.endDate, location: meeting.location, city: meeting.city})
        );
        expect(res.body[0].plannedStartTime).toEqual('18:30:00');
        expect(res.body[0].realStartTime).toEqual('18:29:45');
        expect(res.body[0].state).toEqual('finished');
        expect(res.body[0].discipline).toEqual( 
            expect.objectContaining({ type: discipline.type, distance: discipline.distance, gender: discipline.gender})
        );
        expect(res.body[0].athletes[0]).toEqual( 
            expect.objectContaining({ firstName: athlete2.firstName, lastName: athlete2.lastName})
        );
        expect(res.body[0].athletes[1]).toEqual( 
            expect.objectContaining({ firstName: athlete1.firstName, lastName: athlete1.lastName})
        );
    });

    it('should not get a specific race', async function() {
        const res = await supertest(app)
            .get('/races?state=cancelled')
            .expect(404)
    });

});


/* ------- PUT tests --------------------------- */


describe('PUT /races', function() {

    let race;
    let country, discipline, meeting, athlete1, athlete2;

    beforeEach(async function() {
        // Create a country for the meeting.
        country = await Country.create({alpha2: 'JM', alpha3: 'JAM', noc: 'JAM', name: 'Jamaica'});

        // Create a discipline for the race and athletes.
        discipline = await Discipline.create({type: 'none', distance: 100, gender: 'men'});

        // Create a meeting for the race.
        meeting = await Meeting.create({name: 'Diamond League', startDate: '2023-05-05T00:00:00Z', endDate: '2023-05-05T00:00:00Z', location: 'Suhaim Bin Hamad Stadium', city: 'Doha', country: country.id});

        // Create athletes for the race.
        [ athlete1, athlete2 ] = await Promise.all([
            Athlete.create({lastName: 'Blake', firstName: 'Yohan', dateOfBirth: '1989-12-26T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]}),
            Athlete.create({lastName: 'Bolt', firstName: 'Usain', dateOfBirth: '1986-08-21T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]}),
        ]);

        // Create a race for modifying test.
        race = await Race.create({meeting: meeting.id, plannedStartTime: '2023-05-05T19:15:00.000Z', realStartTime: '', state: 'pending', discipline: discipline.id, athletes: [athlete1.id, athlete2.id]})
    });

    it('should modify a race', async function() {
        const res = await supertest(app)
            .put('/races/' + race.id)
            .send({
                plannedStartTime: '2023-05-05T19:15:00.000Z',
                realStartTime: '2023-05-05T19:15:30.000Z',
                state: 'finished'
            })
            .expect(200)
            .expect('Content-Type', /json/)
        expect(res.body.meeting).toEqual(meeting.id);
        expect(res.body.plannedStartTime).toEqual('19:15:00');
        expect(res.body.realStartTime).toEqual('19:15:30');
        expect(res.body.state).toEqual('finished');
        expect(res.body.discipline).toEqual(discipline.id);
        expect(res.body.athletes).toEqual([athlete1.id, athlete2.id]);
    });

    it('should not modify a race', async function() {
        const res = await supertest(app)
            .put('/races/' + race.id)
            .send({
                meeting: "abc",
                plannedStartTime: '2023-05-32T19:15:00.000Z',
                realStartTime: '2023-05-32T19:15:30.000Z',
                state: 'notSure',
                discipline: "abc",
                athletes: "abc"
            })
            .expect(409)
            .expect('Content-Type', /json/)
    });
});


/* ------- DELETE tests --------------------------- */


describe('DELETE /races', function() {
    let race, raceId;
    let country, discipline, meeting, athlete1, athlete2;

    it('should delete a race', async function() {
        // Create a country for the meeting.
        country = await Country.create({alpha2: 'JM', alpha3: 'JAM', noc: 'JAM', name: 'Jamaica'});

        // Create a discipline for the race and athletes.
        discipline = await Discipline.create({type: 'none', distance: 100, gender: 'men'});

        // Create a meeting for the race.
        meeting = await Meeting.create({name: 'Diamond League', startDate: '2023-05-05T00:00:00Z', endDate: '2023-05-05T00:00:00Z', location: 'Suhaim Bin Hamad Stadium', city: 'Doha', country: country.id});

        // Create athletes for the race.
        [ athlete1, athlete2 ] = await Promise.all([
            Athlete.create({lastName: 'Blake', firstName: 'Yohan', dateOfBirth: '1989-12-26T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]}),
            Athlete.create({lastName: 'Bolt', firstName: 'Usain', dateOfBirth: '1986-08-21T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline.id]}),
        ]);

        // Create a race for deleting test.
        race = await Race.create({meeting: meeting.id, plannedStartTime: '2023-05-05T19:15:00.000Z', realStartTime: '', state: 'pending', discipline: discipline.id, athletes: [athlete1.id, athlete2.id]})
        raceId = race.id;

        const res = await supertest(app)
            .delete('/races/' + race.id)
            .expect(204)
    });

    it('should not find race to delete', async function() {
        const res = await supertest(app)
            .delete('/races/' + raceId)
            .expect(404)
        expect(res.text).toEqual(`Race with ID ${raceId} not found.`)
    });
});


beforeEach(cleanUpDatabase);

afterAll(async () => {
    await cleanUpDatabase()
    await mongoose.disconnect();
});