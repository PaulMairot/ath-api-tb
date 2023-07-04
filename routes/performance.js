import express from "express";
import mongoose, { isValidObjectId } from "mongoose";
import { manageRecord } from '../spec/utils.js';

import Performance from "../models/performance.js";
import Pressure from "../models/pressure.js";
import Position from "../models/position.js";
import Race from "../models/race.js";

String.prototype.toObjectId = function() {
    var ObjectId = (mongoose.Types.ObjectId);
    return new ObjectId(this.toString());
};

const router = express.Router();

/**
 * @api {get} /performances Request a list of performances
 * @apiName GetPerformances
 * @apiGroup Performance
 * 
 * @apiParam {String} [athlete]         Filter performance by athlete ID.
 * @apiParam {String} [race]            Filter performance by race ID.
 * @apiParam {Date}   [result]          Filter from specified result.
 * @apiParam {String} [reactionTime]    Filter from specified reaction time.
 * 
 * @apiParamExample {json} Request-Example:
 *     {
 *       "athlete": "f5481583fe9630109995821c",
 *       "race": "f5481583fe9630109995821c",
 *       "result": 10,
 *       "reactionTime": 140
 *     }
 *
 * @apiSuccess {Object[]} performance       List of performances.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *          "athlete" : {...},
 *          "race": {...},
 *          "lane": 4,
 *          "result": "14.115",
 *          "position": [{...}, {...}],
 *          "startingPressure": {...},
 *          "reactionTime": 132,
 *          "mention" : ["NB"]
 *          "id" : "1583f63019582099e9481cf5"
 *       }
 *     ]
 * 
 * @apiError NoPerformanceFound    No performance found.
 */
router.get("/", function (req, res, next) {
    
    let filters = Object.assign({}, req.query);
    delete filters.reactionTime;
    delete filters.result;

    Performance.find({
        ...req.query.result ? { result: { $gte: new Date(req.query.result).toISOString() } } : {},
        ...req.query.reactionTime ? { reactionTime: { $gte: req.query.reactionTime } } : {},
        ...filters
    })
    .populate([
        {path: 'athlete',populate : [{path : 'nationality'}, {path : 'discipline'}]},
        {path: 'race',populate : [{path : 'athletes'}, {path : 'discipline'}]},
        {path: 'position'},
        {path: 'startingPressure'}
    ])
        .sort({lane: 1}).then((performances) => {
            if (performances.length === 0) {
                res.status(404).send("No performance found.")
            } else {
                res.send(performances);
            }
        }).catch((err) => {
            return next(err);
        });
});


/**
 * @api {get} /performances/:id Request a specific meeting
 * @apiName GetPerformance
 * @apiGroup Performance
 * 
 * @apiParam   {String} id          Performance unique ID.
 * 
 * @apiSuccess {Object} athlete                 Athlete related to performance.
 * @apiSuccess {Object} race                    Race related to performance.
 * @apiSuccess {Number} Lane                    Lane of the athlete for the performance.
 * @apiSuccess {Array}  position                Array of all mesured position of athlete during the performance.
 * @apiSuccess {Object} startingPressure        Starting pressure of the performance.
 * @apiSuccess {Number} reactionTime            Reaction time of the athlete for the performance.
 * @apiSuccess {Array}  mention                 Mention(s) obtained by the athlete for the performance.
 * @apiSuccess {String} id                      ID of the performance.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      }
 *          "athlete" : {...},
 *          "race": {...},
 *          "lane": 4,
 *          "result": "14.115",
 *          "position": [{...}, {...}],
 *          "startingPressure": {...},
 *          "reactionTime": 132,
 *          "mention" : ["NB"]
 *          "id" : "e96301099481583f95821cf5"
 *     }
 * 
 * @apiError PerformanceNotFound The <code>id</code> of the Performance was not found.
 */
//.populate(['athlete', 'race', 'position', 'startingPressure'])
router.get("/:id", function (req, res, next) {
    Performance.findById(req.params.id)
    .populate([
            {path: 'athlete',populate : [{path : 'nationality'}, {path : 'discipline'}]},
            {path: 'race',populate : [{path : 'athletes'}, {path : 'discipline'}]},
            {path: 'position'},
            {path: 'startingPressure'}
    ]).then((performance) => {
        if (performance == null) {
            res.status(404).send("No performance found with ID :" + req.params.id + ".")
        } else {
            res.send(performance);
        }
    }).catch((err) => {
        return next(err);
    });
});


/**
 * @api {post} /performances Add a new performance
 * @apiName PostPerformance
 * @apiGroup Performance
 * 
 * @apiBody {Object} athlete                 Athlete related to performance.
 * @apiBody {Object} race                    Race related to performance.
 * @apiBody {Number} [Lane]                    Lane of the athlete for the performance.
 * @apiBody {Array}  [position]                Array of all mesured position of athlete during the performance.
 * @apiBody {Object} [startingPressure]        Starting pressure of the performance.
 * @apiBody {Number} [reactionTime]            Reaction time of the athlete for the performance.
 * @apiBody {Array}  [mention]                 Mention(s) obtained by the athlete for the performance.
 * 
 * @apiSuccess {Object} athlete                 Athlete related to new performance.
 * @apiSuccess {Object} race                    Race related to new performance.
 * @apiSuccess {Number} Lane                    Lane of the athlete for the new performance.
 * @apiSuccess {Array}  position                Array of all mesured position of athlete during the new performance.
 * @apiSuccess {Object} startingPressure        Starting pressure of the new performance.
 * @apiSuccess {Number} reactionTime            Reaction time of the athlete for th new performance.
 * @apiSuccess {Array}  mention                 Mention(s) obtained by the athlete for the new performance.
 * @apiSuccess {String} id                      ID of the new performance.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      }
 *          "athlete" : {...},
 *          "race": {...},
 *          "lane": 4,
 *          "result": "14.115",
 *          "position": [{...}, {...}],
 *          "startingPressure": {...},
 *          "reactionTime": 132,
 *          "mention" : ["NB"]
 *          "id" : "e96301099481583f95821cf5"
 *     }
 * 
 */
router.post("/", async function (req, res, next) {

    // Auto-fill position with athlete and race IDs
    if (!req.body.position && isValidObjectId(req.body.athlete) && isValidObjectId(req.body.race)) {
        await Position.find({athlete: req.body.athlete, race: req.body.race}).then((positions) => {
            if (positions) {
                req.body.position = positions;
            }
            
        })
    }

    // Auto-fill starting pressure with athlete and race IDs
    if (!req.body.startingPressure && isValidObjectId(req.body.athlete) && isValidObjectId(req.body.race)) {
        await Pressure.findOne({athlete: req.body.athlete, race: req.body.race}).then(function (pressure) {
            if (pressure) {
                req.body.startingPressure = pressure.id
            }
            
        })
    }
    
    const newPerformance = new Performance(req.body);

    newPerformance.save().then(async (savedPerformance) => {
        // Add performance to race performances array
        await Race.findOneAndUpdate(
            { _id: req.body.race }, { $push: { performances: savedPerformance._id }}
        )
        
        // Check if performance is a record, save it in that case
        await manageRecord(savedPerformance)

        res.status(201).send(savedPerformance);
    }).catch((err) => {
        res.status(409).send(err);
    });

});


/**
 * @api {put} /performances/:id Update a performance
 * @apiName PutPerformance
 * @apiGroup Performance
 * 
 * @apiParam   {String} id             Performance unique ID.
 * 
 * @apiBody {Object} [athlete]                 ID of athlete related to performance.
 * @apiBody {Object} [race]                    ID of race related to performance.
 * @apiBody {Number} [Lane]                    Lane of the athlete for the performance.
 * @apiBody {Array}  [position]                Array of all mesured position of athlete during the performance.
 * @apiBody {Object} [startingPressure]        ID of starting pressure of the performance.
 * @apiBody {Number} [reactionTime]            Reaction time of the athlete for the performance.
 * @apiBody {Array}  [mention]                 Mention(s) obtained by the athlete for the performance.
 * 
 * @apiSuccess {Object} athlete                 Athlete related to updated performance.
 * @apiSuccess {Object} race                    Race related to updated performance.
 * @apiSuccess {Number} Lane                    Lane of the athlete for the updated performance.
 * @apiSuccess {Array}  position                Array of all mesured position of athlete during the updated performance.
 * @apiSuccess {Object} startingPressure        Starting pressure of the updated performance.
 * @apiSuccess {Number} reactionTime            Reaction time of the athlete for th updated performance.
 * @apiSuccess {Array}  mention                 Mention(s) obtained by the athlete for the updated performance.
 * @apiSuccess {String} id                      ID of the updated performance.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      }
 *          "athlete" : {...},
 *          "race": {...},
 *          "lane": 4,
 *          "result": "14.115",
 *          "position": [{...}, {...}],
 *          "startingPressure": {...},
 *          "reactionTime": 132,
 *          "mention" : ["NB"]
 *          "id" : "e96301099481583f95821cf5"
 *     }
 * 
 * 
 * @apiError PerformanceNotFound    The <code>id</code> of the Performance was not found.
 * @apiError Conflict           Data passed do not follow the model.
 * 
 */
router.put("/:id", function (req, res, next) {
    Performance.findByIdAndUpdate(req.params.id, req.body, { returnOriginal: false, runValidators: true }).then(async (updatedPerformance) => {

        // Check if performance is a record, save it in that case
        await manageRecord(updatedPerformance)

        res.send(updatedPerformance);
        
    }).catch((err) => {
        res.status(409).send(err)
    })

});


/**
 * @api {delete} /performances/:id   Remove a performance
 * @apiName DeletePerformance
 * @apiGroup Performance
 * 
 * @apiParam   {String} id      Performance unique ID.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 204 No Content
 *     {}
 * 
 * @apiError PerformanceNotFound    The <code>id</code> of the Performance was not found.
 * 
 */
router.delete("/:id", function (req, res, next) {
    Performance.findById(req.params.id).deleteOne().then((deletedPerformance) => {
        if (!deletedPerformance.deletedCount) {
          res.status(404).send("Performance with ID " + req.params.id + " not found.");
        } else {
          res.sendStatus(204);
        }
    }).catch((err) => {
        res.status(409).send(err)
    })
});


export default router;