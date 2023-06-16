import express from "express";
import mongoose, { isValidObjectId } from "mongoose";
import Performance from "../models/performance.js";
import Pressure from "../models/pressure.js";
import Position from "../models/position.js";
import Race from "../models/race.js";

String.prototype.toObjectId = function() {
    var ObjectId = (mongoose.Types.ObjectId);
    return new ObjectId(this.toString());
};

const router = express.Router();

router.get("/", function (req, res, next) {
    let filters = Object.assign({}, req.query);
    delete filters.reactionTime;
    delete filters.result;


    Performance.find({
        ...req.query.result ? { result: { $gte: new Date(req.query.result).toISOString() } } : {},
        ...req.query.reactionTime ? { reactionTime: { $gte: req.query.reactionTime } } : {},
        ...filters
    })
        .populate(['athlete', 'race', 'position', 'startingPressure'])
        .sort({lane: 1}).then((performances) => {
            res.send(performances);
        }).catch((err) => {
            return next(err);
        });
});

router.get("/:id", function (req, res, next) {
    Performance.findById(req.params.id).populate('country').then((performance) => {
        res.send(performance);
    }).catch((err) => {
        res.status(404).send("Performance with ID " + req.params.id + " not found.");
    });
});

router.post("/", async function (req, res, next) {

    // If no result defined, take last time as result
    if (!req.body.result && isValidObjectId(req.body.athlete) && isValidObjectId(req.body.race)) {
        await Position.find({athlete: req.body.athlete, race: req.body.race}).sort({ "time": -1 }).limit(1).then((lastPosition) => {
            if (lastPosition) {
                req.body.result = lastPosition[0].time;
            }
        })
    }

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

        res.status(201).send(savedPerformance);
    }).catch((err) => {
        res.status(409).send(err);
    });

    

});

router.put("/:id", function (req, res, next) {
    Performance.findByIdAndUpdate(req.params.id, req.body, { returnOriginal: false }).then((updatedPerformance) => {
        res.send(updatedPerformance);
    }).catch((err) => {
        res.status(409).send(err)
    })

});

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