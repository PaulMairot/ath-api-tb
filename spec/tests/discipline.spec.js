import supertest from "supertest"
import mongoose from "mongoose"

import Discipline from "../../models/discipline.js";

import { cleanUpDatabase } from "../utils.js";
import app from "../../app.js"


/* ------- POST tests --------------------------- */

describe('POST /disciplines', function() {
    it('should create a discipline', async function() {
        const res = await supertest(app)
            .post('/disciplines')
            .send({
                type: 'hurdles',
                distance: 110,
                gender: 'women'
            })
            .expect(201)
            .expect('Content-Type', /json/);
        expect(res.body.type).toEqual('hurdles');
        expect(res.body.distance).toEqual(110);
        expect(res.body.gender).toEqual('women');
    });

    it('should not create a discipline (invalid body)', async function() {
        const res = await supertest(app)
            .post('/disciplines')
            .send({
                type: 'sprint',
                distance: 50,
                gender: 'Everybody'
            })
            .expect(409)
            .expect('Content-Type', /json/);
    });

    it('should not create a discipline (empty body)', async function() {
        const res = await supertest(app)
            .post('/disciplines')
            .send({})
            .expect(409)
            .expect('Content-Type', /json/);
    });
});



/* ------- GET tests --------------------------- */

describe('GET /disciplines', function() {

    let discipline1;
    let discipline2;
    beforeEach(async function() {
        // Create disciplines before retrieving the list.
        [ discipline1, discipline2 ] = await Promise.all([
            Discipline.create({type: 'hurdles', distance: 110, gender: 'women'}),
            Discipline.create({type: 'none', distance: 100, gender: 'men'})
        ]);
    });

    it('should get a list of disciplines', async function() {
        const res = await supertest(app)
            .get('/disciplines')
            .expect(200)
            .expect('Content-Type', /json/)
        expect(res.body[0].type).toEqual('none');
        expect(res.body[0].distance).toEqual(100);
        expect(res.body[0].gender).toEqual('men');

        expect(res.body[1].type).toEqual('hurdles');
        expect(res.body[1].distance).toEqual(110);
        expect(res.body[1].gender).toEqual('women');
    });

    it('should get a specific discipline', async function() {
        const res = await supertest(app)
            .get('/disciplines?type=hurdles&distance=110&gender=women')
            .expect(200)
            .expect('Content-Type', /json/)
        expect(res.body[0].type).toEqual('hurdles');
        expect(res.body[0].distance).toEqual(110);
        expect(res.body[0].gender).toEqual('women');
    });

    it('should limit returned disciplines to one element', async function() {
        const res = await supertest(app)
            .get('/disciplines?limit=1')
            .expect(200)
            .expect('Content-Type', /json/)
        expect(res.body).toHaveLength(1);
    });

    it('should not get a specific discipline', async function() {
        const res = await supertest(app)
            .get('/disciplines?distance=50')
            .expect(404)
    });

});



/* ------- PUT tests --------------------------- */


describe('PUT /disciplines', function() {

    let discipline;
    beforeEach(async function() {
        // Create a discipline for modifying tests.
        discipline = await Discipline.create({type: 'none', distance: 100, gender: 'men'})
    });

    it('should modify a discipline', async function() {
        const res = await supertest(app)
            .put('/disciplines/' + discipline.id)
            .send({
                type: 'hurdles',
                distance: 110,
                gender: 'women'
            })
            .expect(200)
            .expect('Content-Type', /json/)
        expect(res.body.type).toEqual('hurdles');
        expect(res.body.distance).toEqual(110);
        expect(res.body.gender).toEqual('women');
    });

    it('should not modify a discipline', async function() {
        const res = await supertest(app)
            .put('/disciplines/' + discipline.id)
            .send({
                type: 'sprint',
                distance: 50,
                gender: 'Everybody'
            })
            .expect(409)
            .expect('Content-Type', /json/)
    });
});


/* ------- DELETE tests --------------------------- */


describe('DELETE /disciplines', function() {

    let discipline, disciplineId

    it('should delete a discipline', async function() {
        // Create discipline for deleting test.
        discipline = await Discipline.create({type: 'none', distance: 100, gender: 'men'})
        disciplineId = discipline.id;
        const res = await supertest(app)
            .delete('/disciplines/' + discipline.id)
            .expect(204)
    });

    it('should not find discipline to delete', async function() {
        const res = await supertest(app)
            .delete('/disciplines/' + disciplineId)
            .expect(404)
        expect(res.text).toEqual(`Discipline with ID ${disciplineId} not found.`)
    });
});


beforeEach(cleanUpDatabase);

afterAll(async () => {
    await cleanUpDatabase()
    await mongoose.disconnect();
});