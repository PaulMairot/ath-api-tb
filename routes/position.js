import express from "express";
import Position from "../models/position.js";

const router = express.Router();

/**
 * @api {get} /positions Request a list of position
 * @apiName GetPositions
 * @apiGroup Position
 * 
 * @apiParam {String} [athlete]         Filter position by athlete ID.
 * @apiParam {String} [race]            Filter position by race ID.
 * @apiParam {Number} [speed]           Filter from specified speed.
 * 
 * @apiParamExample {json} Request-Example:
 *     {
 *       "athlete": "158e9481cf53f63019582099",
 *       "race": "e9481cf52091583f96301958",
 *       "speed": 15
 *     }
 *
 * @apiSuccess {Object[]} position       List of positions.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *          "athlete" : {...},
 *          "race": {...},
 *          "rank": 4,
 *          "runnedDistance": 1.6,
 *          "gapToLeader": 0.2,
 *          "speed": 6.4,
 *          "time": "00:00:01.134",
 *          "coordinates": [80, 232],
 *          "id" : "1583f63019582099e9481cf5"
 *       },
 *       {...}
 *     ]
 * 
 * @apiError NoPositionFound    No position found.
 */
router.get("/", function (req, res, next) {
    let filters = Object.assign({}, req.query);
    delete filters.speed;

    Position.find({
        ...filters,
        ...req.query.speed ? { speed: { $gt: req.query.speed } } : {}
    })
        .populate(['athlete', 'race'])
        .sort({time: 1}).then((positions) => {
            if (positions.length === 0) {
                res.status(404).send("No position found.")
            } else {
                res.send(positions);
            }
        }).catch((err) => {
            return next(err);
        });
});

/**
 * @api {post} /positions Add a new position
 * @apiName PostPosition
 * @apiGroup Position
 * 
 * @apiBody {Object} athlete              ID of Athlete related to position.
 * @apiBody {Object} race                 ID of Race related to position.
 * @apiBody {Number} [rank]               Rank of the athlete for the position.
 * @apiBody {Number} [runnedDistance]     Distance runned by the athlete at the position. 
 * @apiBody {Number} [gapToLeader]        Distance to the race leader at the position. 
 * @apiBody {Number} [speed]              Speed of the athlete for the position.
 * @apiBody {Date}   time                 Time of the position.
 * @apiBody {Array}  coordinates          Coordinates of the athlete.
 * 
 * @apiSuccess {Object}  athlete           Athlete related to new position.
 * @apiSuccess {Object}  race              Race related to new position.
 * @apiSuccess {Number}  rank              Rank of the athlete for the new position.
 * @apiSuccess {Number}  runnedDistance    Distance runned by the athlete at the new position.
 * @apiSuccess {Number}  gapToLeader       Distance to the race leader at the new position.
 * @apiSuccess {Number}  speed             Speed of the athlete for the new position.
 * @apiSuccess {Date}    time              Time for the new position.
 * @apiSuccess {Array}   coordinates       Coordinates of the athlete for the new position.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *          "athlete" : {...},
 *          "race": {...},
 *          "rank": 4,
 *          "runnedDistance": 1.6,
 *          "gapToLeader": 0.2,
 *          "speed": 6.4,
 *          "time": "00:00:01.134",
 *          "coordinates": [80, 232],
 *          "id" : "1583f63019582099e9481cf5"
 *      }
 * 
 */
router.post("/", function (req, res, next) {
    const newPosition = new Position(req.body);

    newPosition.save().then((savedPosition) => {
        res.status(201).send(savedPosition);
    }).catch((err) => {
        res.status(409).send(err);
    });
});


/**
 * @api {put} /positions/:id Update a position
 * @apiName PutPosition
 * @apiGroup Position
 * 
 * @apiParam   {String} id             Position unique ID.
 * 
 * @apiBody {Object} [athlete]            ID of Athlete related to position.
 * @apiBody {Object} [race]               ID of Race related to position.
 * @apiBody {Number} [rank]               Rank of the athlete for the position.
 * @apiBody {Number} [runnedDistance]     Distance runned by the athlete at the position. 
 * @apiBody {Number} [gapToLeader]        Distance to the race leader at the position. 
 * @apiBody {Number} [speed]              Speed of the athlete for the position.
 * @apiBody {Date}   [time]               Time of the position.
 * @apiBody {Array}  [coordinates]        Coordinates of the athlete.
 * 
 * @apiSuccess {Object}  athlete           Athlete related to new position.
 * @apiSuccess {Object}  race              Race related to new position.
 * @apiSuccess {Number}  rank              Rank of the athlete for the new position.
 * @apiSuccess {Number}  runnedDistance    Distance runned by the athlete at the new position.
 * @apiSuccess {Number}  gapToLeader       Distance to the race leader at the new position.
 * @apiSuccess {Number}  speed             Speed of the athlete for the new position.
 * @apiSuccess {Date}    time              Time for the new position.
 * @apiSuccess {Array}   coordinates       Coordinates of the athlete for the new position.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *          "athlete" : {...},
 *          "race": {...},
 *          "rank": 4,
 *          "runnedDistance": 1.6,
 *          "gapToLeader": 0.2,
 *          "speed": 6.4,
 *          "time": "00:00:01.134",
 *          "coordinates": [80, 232],
 *          "id" : "1583f63019582099e9481cf5"
 *      }
 * 
 * 
 * @apiError PositionNotFound    The <code>id</code> of the Position was not found.
 * @apiError Conflict            Data passed do not follow the model.
 * 
 */
router.put("/:id", function (req, res, next) {
    Position.findByIdAndUpdate(req.params.id, req.body, { returnOriginal: false, runValidators: true }).then((updatedPosition) => {
        res.send(updatedPosition);
    }).catch((err) => {
        res.status(409).send(err)
    })
});


/**
 * @api {delete} /positions/:id   Remove a performance
 * @apiName DeletePosition
 * @apiGroup Position
 * 
 * @apiParam   {String} id      Position unique ID.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 204 No Content
 *     {}
 * 
 * @apiError PositionNotFound    The <code>id</code> of the Position was not found.
 * 
 */
router.delete("/:id", function (req, res, next) {
    Position.findById(req.params.id).deleteOne().then((deletedPosition) => {
        if (!deletedPosition.deletedCount) {
          res.status(404).send("Position with ID " + req.params.id + " not found.");
        } else {
          res.sendStatus(204);
        }
    }).catch((err) => {
        res.status(409).send(err)
    })
});


export default router;