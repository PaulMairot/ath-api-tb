import express from "express";
import Race from "../models/race.js";

const router = express.Router();

router.get("/", function (req, res, next) {
    let filters = Object.assign({}, req.query);

    if (filters.startDate) { filters.startDate = new Date(filters.startDate).toISOString() }
    if(filters.gender) { filters.gender = filters.gender.toLowerCase() };
    if(filters.state) { filters.state = filters.state.toLowerCase() };

    Race.find({...filters})
        .populate('meeting')
        .populate('discipline')
        .populate('weather')
        .populate('athletes')
        .sort({name: 1}).limit(req.query.limit).then((races) => {
            res.send(races);
        }).catch((err) => {
            return next(err);
        });
});

router.get("/:id", function (req, res, next) {
    Race.findById(req.params.id)
        .populate('meeting')
        .populate('discipline')
        .populate('weather')
        .populate('athletes')
        .then((race) => {
            res.send(race);
        }).catch((err) => {
            res.status(404).send("Race with ID " + req.params.id + " not found.");
        });
});

router.post("/", function (req, res, next) {
    const newRace = new Race(req.body);

    newRace.save().then((savedRace) => {
        res.status(201).send(savedRace);
    }).catch((err) => {
        res.status(409).send(err);
    });

});

router.put("/:id", function (req, res, next) {
    Race.findByIdAndUpdate(req.params.id, req.body, { returnOriginal: false }).then((updatedRace) => {
        res.send(updatedRace);
    }).catch((err) => {
        res.status(409).send(err)
    })

});

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