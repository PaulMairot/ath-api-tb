import express from "express";
import Athlete from "../models/athlete.js";

const router = express.Router();

router.get("/", function (req, res, next) {
    let filters = Object.assign({}, req.query);

    if(filters.lastName) { filters.lastName = filters.lastName.charAt(0).toUpperCase() + filters.lastName.slice(1).toLowerCase(); };
    if(filters.firstName) { filters.firstName = filters.firstName.charAt(0).toUpperCase() + filters.firstName.slice(1).toLowerCase(); };
    if(filters.gender) { filters.gender = filters.gender.toUpperCase() };

    Athlete.find({...filters}).sort({lastName: 1}).populate('nationality').populate('discipline').then((athletes) => {
        res.send(athletes);
    }).catch((err) => {
        return next(err);
    });
});

router.get("/:id", function (req, res, next) {
    Athlete.findById(req.params.id).then((athlete) => {
        res.send(athlete);
    }).catch((err) => {
        res.status(404).send("Athlete with ID " + req.params.id + " not found.");
    });
});

router.post("/", function (req, res, next) {
    const newAthlete = new Athlete(req.body);

    newAthlete.save().then((savedAthlete) => {
        res.status(201).send(savedAthlete);
    }).catch((err) => {
        res.status(409).send(err);
    });

});

router.put("/:id", function (req, res, next) {
    Athlete.findByIdAndUpdate(req.params.id, req.body, { returnOriginal: false }).then((updatedAthlete) => {
        res.send(updatedAthlete);
    }).catch((err) => {
        res.status(409).send(err)
    })

});

router.delete("/:id", function (req, res, next) {
    Athlete.findById(req.params.id).deleteOne().then((deletedAthlete) => {
        if (!deletedAthlete.deletedCount) {
          res.status(404).send("Athlete with ID " + req.params.id + " not found.");
        } else {
          res.sendStatus(204);
        }
    }).catch((err) => {
        res.status(409).send(err)
    })
});


export default router;