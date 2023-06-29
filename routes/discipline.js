import express from "express";
import Discipline from "../models/discipline.js";

const router = express.Router();

/**
 * @api {get} /disciplines Request a list of disciplines
 * @apiName GetDisciplines
 * @apiGroup Discipline
 * 
 * @apiParam {Number} [limit]       Limit the number of results.
 * @apiParam {String} [type]        Filter disciplines by type (none, hurdles, relay, steeple).
 * @apiParam {Number} [distance]    Filter disciplines by distance.
 * @apiParam {String} [gender]      Filter disciplines by gender (women, men, girls, boys, mixed).
 * 
 * @apiParamExample {json} Request-Example:
 *      {   
 *          "limit": 5
 *          "type": "hurdles",
 *          "distance": 200,
 *          "gender": "women"
 *      }
 *
 * @apiSuccess {Object[]} discipline       List of disciplines.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *      {
 *          "type": "hurdles",
 *          "distance": 400,
 *          "gender": "men",
 *          "id": "8d835a5e00cd8bd84ee259bd"
 *      },
 *      {
 *          "type": "none",
 *          "distance": 100,
 *          "gender": "boys",
 *          "id": "6f83a33a003b8ba2aee253fc"
 *      },
 *     ]
 * 
 * @apiError NoDisciplineFound    No discipline found.
 */
router.get("/", function (req, res, next) {
    let filters = Object.assign({}, req.query);
    delete filters.limit;

    Discipline.find({...filters}).limit(req.query.limit).sort({distance: 1}).then((disciplines) => {
        if (disciplines.length === 0) {
            res.status(404).send("No discipline found.")
        } else {
            res.send(disciplines);
        }
    }).catch((err) => {
        return next(err);
    });
});


/**
 * @api {get} /disciplines/:id Request a specific discipline
 * @apiName GetDiscipline
 * @apiGroup Discipline
 * 
 * @apiParam   {String} id              Discipline unique ID.
 * 
 * @apiSuccess {String} type            Type of the discipline (none, hurdles, relay, steeple).
 * @apiSuccess {Number} distance        Distance of the discipline.
 * @apiSuccess {String} gender          Gender of the discipline (women, men, girls, boys, mixed).
 * @apiSuccess {String} id              ID of the discipline.
 * 
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "type": "hurdles",
 *          "distance": 400,
 *          "gender": "men",
 *          "id": "83bd8e00bd84e42535a5c9bd"
 *      }
 * 
 * @apiError DisciplineNotFound The <code>id</code> of the Discipline was not found.
 */
router.get("/:id", function (req, res, next) {
    Discipline.findById(req.params.id).then((discipline) => {
        if (discipline == null) {
            res.status(404).send("No discipline found with ID :" + req.params.id + ".")
        } else {
            res.send(discipline);
        }
    }).catch((err) => {
        return next(err);
    });
});


/**
 * @api {post} /disciplines Add a new discipline
 * @apiName PostDiscipline
 * @apiGroup Discipline
 * 
 * @apiBody {String} type            Type of the discipline (none, hurdles, relay, steeple).
 * @apiBody {Number} distance        Distance of the discipline.
 * @apiBody {String} gender          Gender of the discipline.
 * 
 * @apiSuccess {String} type         Type of the discipline (none, hurdles, relay, steeple).
 * @apiSuccess {Number} distance     Distance of the discipline.
 * @apiSuccess {String} gender       Gender of the discipline (women, men, girls, boys, mixed).
 * @apiSuccess {String} id           ID of the discipline.
 * 
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 201 Created
 *      {
 *          "type": "relay",
 *          "distance": 400,
 *          "gender": "mixed",
 *          "id": "83d8535a5b4e42d8e00bc9bd"
 *      }
 * 
 * 
 */
router.post("/", function (req, res, next) {
    const newDiscipline = new Discipline(req.body);

    newDiscipline.save().then((savedDiscipline) => {
        res.status(201).send(savedDiscipline);
    }).catch((err) => {
        res.status(409).send(err);
    });

});


/**
 * @api {put} /disciplines/:id Update a discipline
 * @apiName PutDiscipline
 * @apiGroup Discipline
 * 
 * @apiParam   {String} id           Discipline unique ID.
 * 
 * @apiBody {String} type            Type of the discipline (none, hurdles, relay, steeple).
 * @apiBody {Number} distance        Distance of the discipline.
 * @apiBody {String} gender          Gender of the discipline.
 * 
 * @apiSuccess {String} type         Type of the updated discipline (none, hurdles, relay, steeple).
 * @apiSuccess {Number} distance     Distance of the updated discipline.
 * @apiSuccess {String} gender       Gender of the updated discipline (women, men, girls, boys, mixed).
 * @apiSuccess {String} id           ID of the updated discipline.
 * 
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "type": "none",
 *          "distance": 200,
 *          "gender": "women",
 *          "id": "83d8535a5b4e42d8e00bc9bd"
 *      }
 * 
 * @apiError DisciplineNotFound    The <code>id</code> of the Discipline was not found.
 * @apiError Conflict          Data passed do not follow the model.
 * 
 */
router.put("/:id", function (req, res, next) {
    Discipline.findByIdAndUpdate(req.params.id, req.body, { returnOriginal: false, runValidators: true }).then((updatedDiscipline) => {
        res.send(updatedDiscipline);
    }).catch((err) => {
        res.status(409).send(err)
    })

});

/**
 * @api {delete} /disciplines/:id Remove a discipline
 * @apiName DeleteDiscipline
 * @apiGroup Discipline
 * 
 * @apiParam   {String} id      Discipline unique ID.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 204 No Content
 *     {}
 * 
 * @apiError DisciplineNotFound    The <code>id</code> of the Discipline was not found.
 * 
 */
router.delete("/:id", function (req, res, next) {
    Discipline.findById(req.params.id).deleteOne().then((deletedDiscipline) => {
        if (!deletedDiscipline.deletedCount) {
          res.status(404).send("Discipline with ID " + req.params.id + " not found.");
        } else {
          res.sendStatus(204);
        }
    }).catch((err) => {
        res.status(409).send(err)
    })
});


export default router;