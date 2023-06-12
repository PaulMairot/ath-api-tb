import express from "express";
import Pressure from "../models/pressure.js";

const router = express.Router();

router.get("/", function (req, res, next) {
    let filters = Object.assign({}, req.query);

    Pressure.find({...filters}).populate('athlete').populate('race').then((pressures) => {
            res.send(pressures);
        }).catch((err) => {
            return next(err);
        });
});

router.get("/:id", function (req, res, next) {
    Pressure.findById(req.params.id).populate('athlete').populate('race').then((pressure) => {
        res.send(pressure);
    }).catch((err) => {
        res.status(404).send("Pressure with ID " + req.params.id + " not found.");
    });
});

router.post("/", function (req, res, next) {
    const newPressure = new Pressure(req.body);

    newPressure.save().then((savedPressure) => {
        res.status(201).send(savedPressure);
    }).catch((err) => {
        res.status(409).send(err);
    });

});

router.put("/:id", function (req, res, next) {
    Pressure.findByIdAndUpdate(req.params.id, req.body, { returnOriginal: false }).then((updatedPressure) => {
        res.send(updatedPressure);
    }).catch((err) => {
        res.status(409).send(err)
    })

});

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