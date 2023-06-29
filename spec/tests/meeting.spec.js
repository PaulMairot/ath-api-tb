import supertest from "supertest"
import mongoose from "mongoose"

import Meeting from "../../models/meeting.js";
import Country from "../../models/country.js";


import { cleanUpDatabase } from "../utils.js";
import app from "../../app.js"

/* ------- POST tests --------------------------- */

describe('POST /meetings', function() {
    let country;
    beforeEach(async function() {
        // Create a country for the meeting.
        country = await Country.create({alpha2: 'QA', alpha3: 'QAT', noc: 'QAT', name: 'Qatar'})
    });

    it('should create a meeting', async function() {
        const res = await supertest(app)
            .post('/meetings')
            .send({
                name: 'Diamond League',
                startDate: '2023-05-05T00:00:00Z',
                endDate: '2023-05-05T00:00:00Z',
                location: 'Suhaim Bin Hamad Stadium',
                city: 'Doha',
                country: country.id,
            })
            .expect(201)
            .expect('Content-Type', /json/);
        expect(res.body.name).toEqual('Diamond League');
        expect(res.body.startDate).toEqual('2023-05-05');
        expect(res.body.endDate).toEqual('2023-05-05');
        expect(res.body.location).toEqual('Suhaim Bin Hamad Stadium');
        expect(res.body.city).toEqual('Doha');
        expect(res.body.country).toEqual(country.id);
    });

    it('should not create a meeting (invalid body)', async function() {
        const res = await supertest(app)
            .post('/meetings')
            .send({
                name: 'L',
                startDate: '2023-05-05T00:00:00Z',
                endDate: '2023-05-05T00:00:00Z',
                location: 'Su',
                city: 'Doha',
                country: country.id
            })
            .expect(409)
            .expect('Content-Type', /json/);
    });

    it('should not create a meeting (empty body)', async function() {
        const res = await supertest(app)
            .post('/meetings')
            .send({})
            .expect(409)
            .expect('Content-Type', /json/);
    });
});



/* ------- GET tests --------------------------- */

describe('GET /meetings', function() {

    let country1, country2;
    let meeting1, meeting2;
    beforeEach(async function() {
        // Create countries for the meetings.
        country1 = await Country.create({alpha2: 'QA', alpha3: 'QAT', noc: 'QAT', name: 'Qat'});
        country2 = await Country.create({alpha2: 'MA', alpha3: 'MAR', noc: 'MAR', name: 'Morocco'});

        // Create 2 meetings before retrieving the list.
        [ meeting1, meeting2 ] = await Promise.all([
            Meeting.create({name: 'Diamond League', startDate: '2023-05-05T00:00:00Z', endDate: '2023-05-05T00:00:00Z', location: 'Suhaim Bin Hamad Stadium', city: 'Doha', country: country1.id}),
            Meeting.create({name: 'Diamond League', startDate: '2023-05-28T00:00:00Z', endDate: '2023-05-28T00:00:00Z', location: 'Prince Moulay Abdellah Stadium', city: 'Rabat', country: country2.id}),
        ]);
    });

    it('should get a list of meetings', async function() {
        const res = await supertest(app)
            .get('/meetings')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(res.body[0].name).toEqual('Diamond League');
        expect(res.body[0].startDate).toEqual('2023-05-05');
        expect(res.body[0].endDate).toEqual('2023-05-05');
        expect(res.body[0].location).toEqual('Suhaim Bin Hamad Stadium');
        expect(res.body[0].city).toEqual('Doha');
        expect(res.body[0].country).toEqual( 
            expect.objectContaining({ alpha2: country1.alpha2, alpha3: country1.alpha3, noc: country1.noc, name: country1.name})
        );

        expect(res.body[1].name).toEqual('Diamond League');
        expect(res.body[1].startDate).toEqual('2023-05-28');
        expect(res.body[1].endDate).toEqual('2023-05-28');
        expect(res.body[1].location).toEqual('Prince Moulay Abdellah Stadium');
        expect(res.body[1].city).toEqual('Rabat');
        expect(res.body[1].country).toEqual( 
            expect.objectContaining({ alpha2: country2.alpha2, alpha3: country2.alpha3, noc: country2.noc, name: country2.name})
        );

    });

    it('should get a specific meeting', async function() {
        const res = await supertest(app)
            .get('/meetings?name=Diamond League&city=Rabat')
            .expect(200)
            .expect('Content-Type', /json/)
        expect(res.body[0].name).toEqual('Diamond League');
        expect(res.body[0].startDate).toEqual('2023-05-28');
        expect(res.body[0].endDate).toEqual('2023-05-28');
        expect(res.body[0].location).toEqual('Prince Moulay Abdellah Stadium');
        expect(res.body[0].city).toEqual('Rabat');
        expect(res.body[0].country).toEqual( 
            expect.objectContaining({ alpha2: country2.alpha2, alpha3: country2.alpha3, noc: country2.noc, name: country2.name})
        );
    });

    it('should not get a specific meeting', async function() {
        const res = await supertest(app)
            .get('/meetings?name=World Championship')
            .expect(404)
    });

});


/* ------- PUT tests --------------------------- */


describe('PUT /meetings', function() {

    let country;
    let meeting;

    beforeEach(async function() {
        // Create countries for the meetings.
        country = await Country.create({alpha2: 'MA', alpha3: 'MAR', noc: 'MAR', name: 'Morocco'});

        // Create a meeting before modifying.
        meeting = await Meeting.create({name: 'Diamond League', startDate: '2023-05-05T00:00:00Z', endDate: '2023-05-05T00:00:00Z', location: 'Suhaim Bin Hamad Stadium', city: 'Doha', country: country.id})
    });

    it('should modify a meeting', async function() {
        const res = await supertest(app)
            .put('/meetings/' + meeting.id)
            .send({
                name: 'Diamond League',
                startDate: '2023-05-28T00:00:00Z',
                endDate: '2023-05-28T00:00:00Z',
                location: 'Prince Moulay Abdellah Stadium',
                city: 'Rabat',
                country: country.id
            })
            .expect(200)
            .expect('Content-Type', /json/)
        expect(res.body.name).toEqual('Diamond League');
        expect(res.body.startDate).toEqual('2023-05-28');
        expect(res.body.endDate).toEqual('2023-05-28');
        expect(res.body.location).toEqual('Prince Moulay Abdellah Stadium');
        expect(res.body.city).toEqual('Rabat');
        expect(res.body.country).toEqual( 
            expect.objectContaining({ alpha2: country.alpha2, alpha3: country.alpha3, noc: country.noc, name: country.name})
        );
    });

    it('should not modify a meeting', async function() {
        const res = await supertest(app)
            .put('/meetings/' + meeting.id)
            .send({
                name: 'L',
                startDate: '2023-05-05T00:00:00Z',
                endDate: '2023-05-05T00:00:00Z',
                location: 'Su',
                city: 'Doha',
                country: country.id,
            })
            .expect(409)
            .expect('Content-Type', /json/)
    });
});


/* ------- DELETE tests --------------------------- */


describe('DELETE /meetings', function() {
    let country;
    let meeting, meetingId

    it('should delete a meeting', async function() {
        // Create a country for the meeting.
        country = await Country.create({alpha2: 'QA', alpha3: 'QAT', noc: 'QAT', name: 'Qat'});

        meeting = await Meeting.create({name: 'Diamond League', startDate: '2023-05-05T00:00:00Z', endDate: '2023-05-05T00:00:00Z', location: 'Suhaim Bin Hamad Stadium', city: 'Doha', country: country.id})
        meetingId = meeting.id;
        const res = await supertest(app)
            .delete('/meetings/' + meeting.id)
            .expect(204)
    });

    it('should not find meeting to delete', async function() {
        const res = await supertest(app)
            .delete('/meetings/' + meetingId)
            .expect(404)
        expect(res.text).toEqual(`Meeting with ID ${meetingId} not found.`)
    });
});


beforeEach(cleanUpDatabase);

afterAll(async () => {
    await cleanUpDatabase()
    await mongoose.disconnect();
});