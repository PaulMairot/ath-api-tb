import supertest from "supertest"
import mongoose from "mongoose"

import Country from "../../models/country.js";

import { cleanUpDatabase } from "../utils.js";
import app from "../../app.js"


/* ------- POST tests --------------------------- */

describe('POST /countries', function() {
    it('should create a country', async function() {
        const res = await supertest(app)
            .post('/countries')
            .send({
                alpha2: 'BV',
                alpha3: 'BVA',
                noc: 'BVA',
                name: 'Bartovia'
            })
            .expect(201)
            .expect('Content-Type', /json/);
        expect(res.body.alpha2).toEqual('BV');
        expect(res.body.alpha3).toEqual('BVA');
        expect(res.body.noc).toEqual('BVA');
        expect(res.body.name).toEqual('Bartovia');
    });

    it('should not create a country (invalid body)', async function() {
        const res = await supertest(app)
            .post('/countries')
            .send({
                alpha2: 'BVA',
                alpha3: 'BV',
                noc: 'BVAA',
                name: 'B'
            })
            .expect(409)
            .expect('Content-Type', /json/);
    });

    it('should not create a country (empty body)', async function() {
        const res = await supertest(app)
            .post('/countries')
            .send({})
            .expect(409)
            .expect('Content-Type', /json/);
    });
});



/* ------- GET tests --------------------------- */

describe('GET /countries', function() {

    let country1;
    let country2;
    beforeEach(async function() {
        // Create countries before retrieving the list.
        [ country1, country2 ] = await Promise.all([
            Country.create({alpha2: 'CH', alpha3: 'CHE', noc: 'SUI', name: 'Switzerland'}),
            Country.create({alpha2: 'BV', alpha3: 'BVA', noc: 'BVA', name: 'Bartovia'})
        ]);
    });

    it('should get a list of countries', async function() {
        const res = await supertest(app)
            .get('/countries')
            .expect(200)
            .expect('Content-Type', /json/)
        expect(res.body[0].alpha2).toEqual('BV');
        expect(res.body[0].alpha3).toEqual('BVA');
        expect(res.body[0].noc).toEqual('BVA');
        expect(res.body[0].name).toEqual('Bartovia');

        expect(res.body[1].alpha2).toEqual('CH');
        expect(res.body[1].alpha3).toEqual('CHE');
        expect(res.body[1].noc).toEqual('SUI');
        expect(res.body[1].name).toEqual('Switzerland');
    });

    it('should get a specific country', async function() {
        const res = await supertest(app)
            .get('/countries?alpha2=Bv&alpha3=BVA&noc=bva&name=bartovia')
            .expect(200)
            .expect('Content-Type', /json/)
        expect(res.body[0].alpha2).toEqual('BV');
        expect(res.body[0].alpha3).toEqual('BVA');
        expect(res.body[0].noc).toEqual('BVA');
        expect(res.body[0].name).toEqual('Bartovia');
    });

    it('should not get a specific country', async function() {
        const res = await supertest(app)
            .get('/countries?alpha2=zzz')
            .expect(404)
    });

});



/* ------- PUT tests --------------------------- */


describe('PUT /countries', function() {

    let country;
    beforeEach(async function() {
        // Create a country for modifying tests.
        country = await Country.create({alpha2: 'BV', alpha3: 'BVA', noc: 'BVA', name: 'Bartovia'});
    });

    it('should modify a country', async function() {
        const res = await supertest(app)
            .put('/countries/' + country.id)
            .send({
                alpha2: 'CH',
                alpha3: 'CHE',
                noc: 'SUI',
                name: 'Switzerland'
            })
            .expect(200)
            .expect('Content-Type', /json/)
        expect(res.body.alpha2).toEqual('CH');
        expect(res.body.alpha3).toEqual('CHE');
        expect(res.body.noc).toEqual('SUI');
        expect(res.body.name).toEqual('Switzerland');
    });

    it('should not modify a country', async function() {
        const res = await supertest(app)
            .put('/countries/' + country.id)
            .send({
                alpha2: 'HCC',
                alpha3: 'CH',
                noc: 'Suisse',
                name: 'S'
            })
            .expect(409)
            .expect('Content-Type', /json/)
        expect(res.body.errors).toHaveProperty('alpha2');
        expect(res.body.errors).toHaveProperty('alpha3');
        expect(res.body.errors).toHaveProperty('noc');
        expect(res.body.errors).toHaveProperty('name');
    });
});


/* ------- DELETE tests --------------------------- */


describe('DELETE /countries', function() {

    let country;
    let countryId

    it('should delete a country', async function() {
        // Create country for deleting test.
        country = await Country.create({alpha2: 'BV', alpha3: 'BVA', noc: 'BVA', name: 'Bartovia'});
        countryId = country.id;
        const res = await supertest(app)
            .delete('/countries/' + country.id)
            .expect(204)
    });

    it('should not find country to delete', async function() {
        const res = await supertest(app)
            .delete('/countries/' + countryId)
            .expect(404)
        expect(res.text).toEqual(`Country with ID ${countryId} not found.`)
    });
});


beforeEach(cleanUpDatabase);

afterAll(async () => {
    await cleanUpDatabase()
    await mongoose.disconnect();
});