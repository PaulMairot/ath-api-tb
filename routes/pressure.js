import express from "express";
import Pressure from "../models/pressure.js";

const router = express.Router();

/**
 * @api {get} /pressures Request a list of pressures
 * @apiName GetPressures
 * @apiGroup Pressure
 * 
 * @apiParam {String} [athlete]     Filter pressures by athlete ID.
 * @apiParam {String} [race]        Filter pressures by race ID.
 * 
 * @apiParamExample {json} Request-Example:
 *      {
 *          "athlete": "8384e42535adc9bd00b5bd8e",
 *          "race": "4e42535a0bd5c9b83bd8e08d"
 *      }
 *
 * @apiSuccess {Object[]} pressure       List of pressures.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *      {
 *          "athlete": {...},
 *          "race": {...},
 *          "time": [...],
 *          "pressure": [...],
 *          "id": "8d835a5e00cd8bd84ee259bd"
 *      },
 *      {...},
 *     ]
 * 
 * @apiError NoPressureFound    No pressure found.
 */
router.get("/", function (req, res, next) {
    let filters = Object.assign({}, req.query);

    Pressure.find({...filters}).populate(['athlete', 'race']).then((pressures) => {
        if (pressures.length === 0) {
            res.status(404).send("No pressure found.")
        } else {
            res.send(pressures);
        }
        }).catch((err) => {
            return next(err);
        });
});


/**
 * @api {get} /pressures/:id Request a specific pressure
 * @apiName GetPressure
 * @apiGroup Pressure
 * 
 * @apiParam   {String} id            Pressure unique ID.
 * 
 * @apiSuccess {Object} athlete         Athlete associated with pressure.
 * @apiSuccess {Object} race            Race associated with pressure.
 * @apiSuccess {Array}  time            List of time.
 * @apiSuccess {Array}  pressure        List of pressure.
 * 
 * @apiSuccessExample {json} Request-Example:
 *      HTTP/1.1 200 OK
 *      {
 *          "athlete": {...},
 *          "race": {...},
 *          "time": [...],
 *          "performance": [...],
 *          "id": "8d835a5e00cd8bd84ee259bd"
 *      }
 * 
 * @apiError PressureNotFound The <code>id</code> of the Pressure was not found.
 */
router.get("/:id", function (req, res, next) {
    Pressure.findById(req.params.id).populate('athlete').populate('race').then((pressure) => {
        if (pressure == null) {
            res.status(404).send("No pressure found with ID :" + req.params.id + ".")
        } else {
            res.send(pressure);
        }
    }).catch((err) => {
        return next(err);
    });
});


/**
 * @api {post} /pressures Add a new pressure
 * @apiName PostPressure
 * @apiGroup Pressure
 * 
 * @apiBody {Object} athlete         Athlete ID associated with pressure.
 * @apiBody {Object} race            Race ID associated with pressure.
 * @apiBody {Array}  time            List of time.
 * @apiBody {Array}  pressure        List of pressure.
 * 
 * @apiSuccess {Object} athlete         Athlete associated with new pressure.
 * @apiSuccess {Object} race            Race associated with new pressure.
 * @apiSuccess {Array}  time            List of time.
 * @apiSuccess {Array}  pressure        List of pressure.
 * 
 * @apiSuccessExample {json} Request-Example:
 *     HTTP/1.1 200 OK
 *      {
 *          "athlete": {...},
 *          "race": {...},
 *          "time": [...],
 *          "performance": [...],
 *          "id": "59bd8a5d84ee2e0d8350cd8b"
 *      }
 * 
 */
router.post("/", function (req, res, next) {
    const newPressure = new Pressure(req.body);

    newPressure.save().then((savedPressure) => {
        res.status(201).send(savedPressure);
    }).catch((err) => {
        res.status(409).send(err);
    });

});


/**
 * @api {put} /pressures/:id Update a pressure
 * @apiName PutPressure
 * @apiGroup Pressure
 * 
 * @apiParam   {String} id          Pressure unique ID.
 * 
 * @apiBody {Object} athlete         Athlete ID associated with pressure.
 * @apiBody {Object} race            Race ID associated with pressure.
 * @apiBody {Array}  time            List of time.
 * @apiBody {Array}  pressure        List of pressure.
 * 
 * @apiSuccess {Object} athlete         Athlete associated with updated pressure.
 * @apiSuccess {Object} race            Race associated with updated pressure.
 * @apiSuccess {Array}  time            List of time.
 * @apiSuccess {Array}  pressure        List of pressure.
 * 
 * @apiSuccessExample {json} Request-Example:
 *     HTTP/1.1 200 OK
 *      {
 *          "athlete": {...},
 *          "race": {...},
 *          "time": [...],
 *          "performance": [...],
 *          "id": "59bd8a5d84ee2e0d8350cd8b"
 *      }
 * 
 * @apiError PressureNotFound    The <code>id</code> of the Pressure was not found.
 * @apiError Conflict          Data passed do not follow the model.
 * 
 */
router.put("/:id", function (req, res, next) {
    Pressure.findByIdAndUpdate(req.params.id, req.body, { returnOriginal: false, runValidators: true }).then((updatedPressure) => {
        res.send(updatedPressure);
    }).catch((err) => {
        res.status(409).send(err)
    })

});


/**
 * @api {delete} /pressures/:id Remove a pressure
 * @apiName DeletePressure
 * @apiGroup Pressure
 * 
 * @apiParam   {String} id      Pressure unique ID.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 204 No Content
 *     {}
 * 
 * @apiError PressureNotFound    The <code>id</code> of the Pressure was not found.
 * 
 */
router.delete("/:id", function (req, res, next) {
    Pressure.findById(req.params.id).deleteOne().then((deletedPressure) => {
        if (!deletedPressure.deletedCount) {
          res.status(404).send("Pressure with ID " + req.params.id + " not found.");
        } else {
          res.sendStatus(204);
        }
    }).catch((err) => {
        res.status(409).send(err)
    })
});


export default router;