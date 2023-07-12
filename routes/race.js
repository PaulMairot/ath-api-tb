import express from "express";
import Race from "../models/race.js";
import Meeting from "../models/meeting.js";
import { broadcastData } from "../ws.js";

const router = express.Router();

/**
 * @api {get} /races Request a list of races
 * @apiName GetRaces
 * @apiGroup Race
 * 
 * @apiParam {String} [meeting]             Filter races by meeting ID.
 * @apiParam {Date}   [plannedStartTime]    Filter races by planned start time.
 * @apiParam {String} [state]               Filter races by state.
 * @apiParam {String} [discipline]          Filter races by discipline ID.
 * 
 * @apiParamExample {json} Request-Example:
 *      {
 *          "meeting": "8384e42535adc9bd00b5bd8e",
 *          "plannedStartTime": "2023-05-05T17:30:00.000Z",
 *          "state": "finished",
 *          "discipline": "4e4bd8e08d5235a0bd5c9b83",
 *      }
 *
 * @apiSuccess {Object[]} race       List of races.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *      {
 *          "meeting": {...},
 *          "plannedStartTime": "2023-05-05T17:30:00.000Z",
 *          "realStartTime": "2023-05-05T17:29:55.000Z",
 *          "state": "finished",
 *          "discipline": {...},
 *          "windSpeed": 1.2,
 *          "temperature": 27.8,
 *          "conditions": "sunny",
 *          "athletes": [{...}, {...}],
 *          "performances": [{...}, {...}],
 *          "id": "8d835a5e00cd8bd84ee259bd"
 *      },
 *      {...},
 *     ]
 * 
 * @apiError NoRaceFound    No race found.
 */
router.get("/", function (req, res, next) {
    let filters = Object.assign({}, req.query);
    delete filters.athlete;

    if (filters.plannedStartTime) { filters.plannedStartTime = new Date(filters.plannedStartTime).toISOString() }
    if(filters.state) { filters.state = filters.state.toLowerCase() };

    Race.find({
        ...filters,
        ...req.query.athlete ? athletes: req.query.athlete
    })
        .populate(['meeting', 'discipline', 'athletes', 'performances'])
        .sort({plannedStartTime: 1})
        .then((races) => {
            if (races.length === 0) {
                res.status(404).send("No race found.")
            } else {
                res.send(races);
            }
        }).catch((err) => {
            return next(err);
        });
});


/**
 * @api {get} /races/:id Request a specific race
 * @apiName GetRace
 * @apiGroup Race
 * 
 * @apiParam   {String} id            Race unique ID.
 * 
 * @apiSuccess {Object}  meeting             Meeting associated with the race.
 * @apiSuccess {Date}    plannedStartTime    Planned start time of the race.
 * @apiSuccess {Date}    realStartTime       Real start time of the race.
 * @apiSuccess {String}  state               State of the race.
 * @apiSuccess {Object}  discipline          Discipline associated with the race.
 * @apiSuccess {Number}  windSpeed           Wind speed during the race.
 * @apiSuccess {Number}  temperature         Temperature during the race.
 * @apiSuccess {String}  conditions          Weather conditions during the race.
 * @apiSuccess {Array}   athletes            List of athletes associated with the race.
 * @apiSuccess {Array}   performances        List of performances associated with the race.
 * @apiSuccess {String}  id                  ID of the race
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *          "meeting": {...},
 *          "plannedStartTime": "2023-05-05T17:30:00.000Z",
 *          "realStartTime": "2023-05-05T17:29:55.000Z",
 *          "state": "finished",
 *          "discipline": {...},
 *          "windSpeed": 1.2,
 *          "temperature": 27.8,
 *          "conditions": "sunny",
 *          "athletes": [{...}, {...}],
 *          "performances": [{...}, {...}],
 *          "id": "8d835a5e00cd8bd84ee259bd"
 *      }
 * 
 * @apiError RaceNotFound The <code>id</code> of the Race was not found.
 */
router.get("/:id", function (req, res, next) {
    Race.findById(req.params.id)
        .populate(['meeting', 'discipline', 'athletes'])
        .then(async (race) => {
            if (race == null) {
                res.status(404).send("No race found with ID :" + req.params.id + ".")
            } else {
                res.send(race);
            }
        }).catch((err) => {
            return next(err);
        });
});


/**
 * @api {post} /races Create a new race
 * @apiName PostRace
 * @apiGroup Race
 * 
 * @apiBody {Object}  meeting               Meeting ID associated with the race.
 * @apiBody {Date}    [plannedStartTime]    Planned start time of the race.
 * @apiBody {Date}    [realStartTime]       Real start time of the race.
 * @apiBody {String}  state                 State of the race.
 * @apiBody {Object}  discipline            Discipline associated with the race.
 * @apiBody {Number}  [windSpeed]           Wind speed during the race.
 * @apiBody {Number}  [temperature]         Temperature during the race.
 * @apiBody {String}  [conditions]          Weather conditions during the race.
 * @apiBody {Array}   [athletes]            List of athletes ID associated with the race.
 * @apiBody {Array}   [performances]        List of performances ID associated with the race.
 * 
 * @apiSuccess {Object}  meeting             Meeting associated with the new race.
 * @apiSuccess {Date}    plannedStartTime    Planned start time of the new race.
 * @apiSuccess {Date}    realStartTime       Real start time of the new race.
 * @apiSuccess {String}  state               State of the new race.
 * @apiSuccess {Object}  discipline          Discipline associated with the new race.
 * @apiSuccess {Number}  windSpeed           Wind speed during the new race.
 * @apiSuccess {Number}  temperature         Temperature during the new race.
 * @apiSuccess {String}  conditions          Weather conditions during the new race.
 * @apiSuccess {Array}   athletes            List of athletes associated with the new race.
 * @apiSuccess {Array}   performances        List of performances associated with the new race.
 * @apiSuccess {String}  id                  ID of the new race
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *          "meeting": {...},
 *          "plannedStartTime": "2023-05-05T17:30:00.000Z",
 *          "realStartTime": "2023-05-05T17:29:55.000Z",
 *          "state": "finished",
 *          "discipline": {...},
 *          "windSpeed": 1.2,
 *          "temperature": 27.8,
 *          "conditions": "sunny",
 *          "athletes": [{...}, {...}],
 *          "performances": [{...}, {...}],
 *          "id": "8d835a5e00cd8bd84ee259bd"
 *      }
 * 
 */
router.post("/", function (req, res, next) {
    const newRace = new Race(req.body);
    
    newRace.save().then(async (savedRace) => {
        // Add race to meeting races array
        await Meeting.findOneAndUpdate(
            { _id: req.body.meeting }, { $push: { races: savedRace._id }}
        )
        
        // WS new race
        broadcastData({ ressource: 'race', type: 'new', data: await savedRace.populate(['meeting', 'discipline', 'athletes']) });

        res.status(201).send(savedRace);
    }).catch((err) => {
        res.status(409).send(err);
    });
});


/**
 * @api {put} /races/:id Update a race
 * @apiName PutRace
 * @apiGroup Race
 * 
 * @apiParam   {String} id          Race unique ID.
 * 
 * @apiBody {Object}  [meeting]             Meeting associated with the race.
 * @apiBody {Date}    [plannedStartTime]    Planned start time of the race.
 * @apiBody {Date}    [realStartTime]       Real start time of the race.
 * @apiBody {String}  [state]               State of the race.
 * @apiBody {Object}  [discipline]          Discipline associated with the race.
 * @apiBody {Number}  [windSpeed]           Wind speed during the race.
 * @apiBody {Number}  [temperature]         Temperature during the race.
 * @apiBody {String}  [conditions]          Weather conditions during the race.
 * @apiBody {Array}   [athletes]            List of athletes associated with the race.
 * @apiBody {Array}   [performances]        List of performances associated with the race.
 * 
 * @apiSuccess {Object}  meeting             Meeting associated with the updated race.
 * @apiSuccess {Date}    plannedStartTime    Planned start time of the updated race.
 * @apiSuccess {Date}    realStartTime       Real start time of the updated race.
 * @apiSuccess {String}  state               State of the updated race.
 * @apiSuccess {Object}  discipline          Discipline associated with the updated race.
 * @apiSuccess {Number}  windSpeed           Wind speed during the updated race.
 * @apiSuccess {Number}  temperature         Temperature during the updated race.
 * @apiSuccess {String}  conditions          Weather conditions during the updated race.
 * @apiSuccess {Array}   athletes            List of athletes associated with the updated race.
 * @apiSuccess {Array}   performances        List of performances associated with the updated race.
 * @apiSuccess {String}  id                  ID of the updated race
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *          "meeting": {...},
 *          "plannedStartTime": "2023-05-05T17:30:00.000Z",
 *          "realStartTime": "2023-05-05T17:29:55.000Z",
 *          "state": "finished",
 *          "discipline": {...},
 *          "windSpeed": 1.2,
 *          "temperature": 27.8,
 *          "conditions": "sunny",
 *          "athletes": [{...}, {...}],
 *          "performances": [{...}, {...}],
 *          "id": "8d835a5e00cd8bd84ee259bd"
 *      }
 * 
 * @apiError RaceNotFound    The <code>id</code> of the Race was not found.
 * @apiError Conflict          Data passed do not follow the model.
 * 
 */
router.put("/:id", function (req, res, next) {
    Race.findByIdAndUpdate(req.params.id, req.body, { returnOriginal: false, runValidators: true }).then(async (updatedRace) => {
        // WS updated race
        broadcastData({ ressource: 'race', type: 'updated', data: await updatedRace.populate(['meeting', 'discipline', 'athletes']) });

        res.send(updatedRace);
    }).catch((err) => {
        res.status(409).send(err)
    })

});

/**
 * @api {delete} /races/:id Remove a race
 * @apiName DeleteRace
 * @apiGroup Race
 * 
 * @apiParam   {String} id      Race unique ID.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 204 No Content
 *     {}
 * 
 * @apiError RaceNotFound    The <code>id</code> of the Race was not found.
 * 
 */
router.delete("/:id", function (req, res, next) {
    Race.findById(req.params.id).deleteOne().then((deletedRace) => {
        if (!deletedRace.deletedCount) {
          res.status(404).send("Race with ID " + req.params.id + " not found.");
        } else {
          res.sendStatus(204);
        }
    }).catch((err) => {
        res.status(409).send(err)
    })
});


export default router;