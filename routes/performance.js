import express from "express";
import Performance from "../models/performance.js";

const router = express.Router();

router.get("/", function (req, res, next) {
    let filters = Object.assign({}, req.query);
    delete filters.reactionTime;

    if (filters.result) { filters.result = new Date(filters.result).toISOString()}

    Performance.find({
        ...req.query.reactionTime ? { reactionTime: { $gt: req.query.reactionTime } } : {},
        ...filters
    })
        .populate('Athlete')
        .populate('Race')
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

router.post("/", function (req, res, next) {
    const newPerformance = new Performance(req.body);

    newPerformance.save().then((savedPerformance) => {
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