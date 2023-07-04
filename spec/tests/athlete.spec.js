import supertest from "supertest"
import mongoose from "mongoose"

import Athlete from "../../models/athlete.js";
import Country from "../../models/country.js";
import Discipline from "../../models/discipline.js";

import { cleanUpDatabase } from "../utils.js";
import app from "../../app.js"

/* ------- POST tests --------------------------- */

describe('POST /athletes', function() {
    let country, discipline1, discipline2;
    beforeEach(async function() {
        // Create a country and disciplines for the athlete.
        country = await Country.create({alpha2: 'JM', alpha3: 'JAM', noc: 'JAM', name: 'Jamaica'})
        discipline1 = await Discipline.create({type: 'none', distance: 100, gender: 'men'})
        discipline2 = await Discipline.create({type: 'relay', distance: 100, gender: 'men'})
    });

    it('should create a athlete and format lastname, firstname and dateofbirth', async function() {
        const res = await supertest(app)
            .post('/athletes')
            .send({
                lastName: 'blake',
                firstName: 'yohan',
                dateOfBirth: '1989-12-26',
                gender: 'men',
                nationality: country.id,
                discipline: [discipline1.id, discipline2.id]
            })
            .expect(201)
            .expect('Content-Type', /json/);
        expect(res.body.lastName).toEqual('Blake');
        expect(res.body.firstName).toEqual('Yohan');
        expect(res.body.dateOfBirth).toEqual('1989-12-26');
        expect(res.body.gender).toEqual('men');
        expect(res.body.nationality).toEqual(country.id);
        expect(res.body.discipline[0]).toEqual(discipline1.id);
        expect(res.body.discipline[1]).toEqual(discipline2.id);
    });

    it('should not create a athlete (invalid body lastname)', async function() {
        const res = await supertest(app)
            .post('/athletes')
            .send({
                lastName: 'B',
                firstName: '',
                dateOfBirth: 'date',
                gender: 'dnk',
                nationality: discipline1.id,
                discipline: [country.id, discipline2.id]
            })
            .expect(409)
            .expect('Content-Type', /json/);
    });


    it('should not create a athlete (empty body)', async function() {
        const res = await supertest(app)
            .post('/athletes')
            .send({})
            .expect(409)
            .expect('Content-Type', /json/);
    });
});



/* ------- GET tests --------------------------- */

describe('GET /athletes', function() {

    let country, discipline1, discipline2;
    let athlete1, athlete2;
    beforeEach(async function() {
        // Create a country and disciplines for the athlete.
        country = await Country.create({alpha2: 'JM', alpha3: 'JAM', noc: 'JAM', name: 'Jamaica'});
        discipline1 = await Discipline.create({type: 'none', distance: 100, gender: 'men'});
        discipline2 = await Discipline.create({type: 'relay', distance: 100, gender: 'men'});

        // Create 2 athletes before retrieving the list.
        [ athlete1, athlete2 ] = await Promise.all([
            Athlete.create({lastName: 'Bolt', firstName: 'Usain', dateOfBirth: '1986-08-21T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline1.id, discipline2.id]}),
            Athlete.create({lastName: 'Blake', firstName: 'Yohan', dateOfBirth: '1989-12-26T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline1.id, discipline2.id]})
        ]);
    });

    it('should get a list of athletes', async function() {
        const res = await supertest(app)
            .get('/athletes')
            .expect(200)
            .expect('Content-Type', /json/)


        expect(res.body[0].lastName).toEqual('Blake');
        expect(res.body[0].firstName).toEqual('Yohan');
        expect(res.body[0].dateOfBirth).toEqual('1989-12-26');
        expect(res.body[0].gender).toEqual('men');
        expect(res.body[0].nationality).toEqual( 
            expect.objectContaining({ alpha2: country.alpha2, alpha3: country.alpha3, noc: country.noc, name: country.name})
        );
        expect(res.body[0].discipline[0]).toEqual( 
            expect.objectContaining({ type: discipline1.type, distance: discipline1.distance, gender: discipline1.gender})
        );
        expect(res.body[0].discipline[1]).toEqual( 
            expect.objectContaining({ type: discipline2.type, distance: discipline2.distance, gender: discipline2.gender})
        );

        expect(res.body[1].lastName).toEqual('Bolt');
        expect(res.body[1].firstName).toEqual('Usain');
        expect(res.body[1].dateOfBirth).toEqual('1986-08-21');
        expect(res.body[1].gender).toEqual('men');
        expect(res.body[1].nationality).toEqual( 
            expect.objectContaining({ alpha2: country.alpha2, alpha3: country.alpha3, noc: country.noc, name: country.name})
        );
        expect(res.body[1].discipline[0]).toEqual( 
            expect.objectContaining({ type: discipline1.type, distance: discipline1.distance, gender: discipline1.gender})
        );
        expect(res.body[1].discipline[1]).toEqual( 
            expect.objectContaining({ type: discipline2.type, distance: discipline2.distance, gender: discipline2.gender})
        );
    });

    it('should get a specific athlete', async function() {
        const res = await supertest(app)
            .get('/athletes?lastName=Bolt&firstName=Usain&gender=men')
            .expect(200)
            .expect('Content-Type', /json/)
        expect(res.body[0].lastName).toEqual('Bolt');
        expect(res.body[0].firstName).toEqual('Usain');
        expect(res.body[0].dateOfBirth).toEqual('1986-08-21');
        expect(res.body[0].gender).toEqual('men');
        expect(res.body[0].nationality).toEqual( 
            expect.objectContaining({ alpha2: country.alpha2, alpha3: country.alpha3, noc: country.noc, name: country.name})
        );
        expect(res.body[0].discipline[0]).toEqual( 
            expect.objectContaining({ type: discipline1.type, distance: discipline1.distance, gender: discipline1.gender})
        );
        expect(res.body[0].discipline[1]).toEqual( 
            expect.objectContaining({ type: discipline2.type, distance: discipline2.distance, gender: discipline2.gender})
        );
    });

    it('should not get a specific athlete', async function() {
        const res = await supertest(app)
            .get('/athletes?FirstName=Elaine')
            .expect(404)
    });

});



/* ------- PUT tests --------------------------- */


describe('PUT /athletes', function() {

    let country, discipline1, discipline2;
    let athlete;
    beforeEach(async function() {
        // Create a country and disciplines for the athlete.
        country = await Country.create({alpha2: 'JM', alpha3: 'JAM', noc: 'JAM', name: 'Jamaica'});
        discipline1 = await Discipline.create({type: 'none', distance: 100, gender: 'men'});
        discipline2 = await Discipline.create({type: 'relay', distance: 100, gender: 'men'});

        // Create a athlete before modifying.
        athlete = await Athlete.create({lastName: 'Bolt', firstName: 'Usain', dateOfBirth: '1986-08-21T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline1.id, discipline2.id]})
    });

    it('should modify a athlete', async function() {
        const res = await supertest(app)
            .put('/athletes/' + athlete.id)
            .send({
                lastName: 'Blake',
                firstName: 'Yohan',
                dateOfBirth: '1989-12-26T00:00:00Z',
                gender: 'men',
                nationality: country.id,
                discipline: [discipline1.id, discipline2.id]
            })
            .expect(200)
            .expect('Content-Type', /json/)
        expect(res.body.lastName).toEqual('Blake');
        expect(res.body.firstName).toEqual('Yohan');
        expect(res.body.dateOfBirth).toEqual('1989-12-26');
        expect(res.body.gender).toEqual('men');
        expect(res.body.nationality).toEqual(country.id);
        expect(res.body.discipline[0]).toEqual(discipline1.id);
        expect(res.body.discipline[1]).toEqual(discipline2.id);
    });

    it('should not modify a athlete', async function() {
        const res = await supertest(app)
            .put('/athletes/' + athlete.id)
            .send({
                lastName: 'B',
                firstName: '',
                dateOfBirth: '1989-13-32T00:00:00Z',
                gender: 'dnk',
                nationality: discipline1.id,
                discipline: [country.id, discipline2.id]
            })
            .expect(409)
            .expect('Content-Type', /json/)
    });
});


/* ------- DELETE tests --------------------------- */


describe('DELETE /athletes', function() {
    let country, discipline1, discipline2;
    let athlete, athleteId

    it('should delete a athlete', async function() {
        // Create a country and disciplines for the athlete.
        country = await Country.create({alpha2: 'JM', alpha3: 'JAM', noc: 'JAM', name: 'Jamaica'});
        discipline1 = await Discipline.create({type: 'none', distance: 100, gender: 'men'});
        discipline2 = await Discipline.create({type: 'relay', distance: 100, gender: 'men'});

        athlete = await Athlete.create({lastName: 'Blake', firstName: 'Yohan', dateOfBirth: '1989-12-26T00:00:00Z', gender: 'men', nationality: country.id, discipline: [discipline1.id, discipline2.id]});
        athleteId = athlete.id;
        const res = await supertest(app)
            .delete('/athletes/' + athlete.id)
            .expect(204)
    });

    it('should not find athlete to delete', async function() {
        const res = await supertest(app)
            .delete('/athletes/' + athleteId)
            .expect(404)
        expect(res.text).toEqual(`Athlete with ID ${athleteId} not found.`)
    });
});


beforeEach(cleanUpDatabase);

afterAll(async () => {
    await cleanUpDatabase();
    await mongoose.disconnect();
});