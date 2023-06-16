import express from "express";
import Race from "../models/race.js";
import Meeting from "../models/meeting.js";

const router = express.Router();

router.get("/", function (req, res, next) {
    let filters = Object.assign({}, req.query);

    if (filters.startDate) { filters.startDate = new Date(filters.startDate).toISOString() }
    if(filters.gender) { filters.gender = filters.gender.toLowerCase() };
    if(filters.state) { filters.state = filters.state.toLowerCase() };

    Race.find({...filters})
        .populate(['meeting', 'discipline', 'weather', 'athletes'])
        .sort({name: 1}).limit(req.query.limit).then((races) => {
            if (races.length === 0) {
                res.status(404).send("No race found.")
            } else {
                res.send(races);
            }
        }).catch((err) => {
            return next(err);
        });
});

router.get("/:id", function (req, res, next) {
    Race.findById(req.params.id)
        .populate(['meeting', 'discipline', 'weather', 'athletes'])
        .then((race) => {
            if (race == null) {
                res.status(404).send("No race found with ID :" + req.params.id + ".")
            } else {
                res.send(race);
            }
        }).catch((err) => {
            return next(err);
        });
});

router.post("/", function (req, res, next) {
    const newRace = new Race(req.body);
    
    newRace.save().then(async (savedRace) => {
        // Add race to meeting races array
        await Meeting.findOneAndUpdate(
            { _id: req.body.meeting }, { $push: { races: savedRace._id }}
        )

        res.status(201).send(savedRace);
    }).catch((err) => {
        res.status(409).send(err);
    });
});

router.put("/:id", function (req, res, next) {
    Race.findByIdAndUpdate(req.params.id, req.body, { returnOriginal: false, runValidators: true }).then((updatedRace) => {
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