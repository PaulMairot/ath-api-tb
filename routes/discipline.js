import express from "express";
import Discipline from "../models/discipline.js";

const router = express.Router();

router.get("/", function (req, res, next) {
    let filters = Object.assign({}, req.query);
    delete filters.limit;

    Discipline.find({...filters}).limit(req.query.limit).then((disciplines) => {
        res.send(disciplines);
    }).catch((err) => {
        return next(err);
    });
});

router.get("/:id", function (req, res, next) {
    Discipline.findById(req.params.id).then((discipline) => {
        res.send(discipline);
    }).catch((err) => {
        res.status(404).send("Discipline with ID " + req.params.id + " not found.");
    });
});

router.post("/", function (req, res, next) {
    const newDiscipline = new Discipline(req.body);

    newDiscipline.save().then((savedDiscipline) => {
        res.status(201).send(savedDiscipline);
    }).catch((err) => {
        res.status(409).send(err);
    });

});

router.put("/:id", function (req, res, next) {
    Discipline.findByIdAndUpdate(req.params.id, req.body, { returnOriginal: false }).then((updatedDiscipline) => {
        res.send(updatedDiscipline);
    }).catch((err) => {
        res.status(409).send(err)
    })

});

router.delete("/:id", function (req, res, next) {
    Discipline.findById(req.params.id).deleteOne().then((deletedDiscipline) => {
        if (!deletedDiscipline.deletedCount) {
          res.status(404).send("Discipline with ID " + req.params.id + " not found.");
        } else {
          res.sendStatus(204);
        }
    }).catch((err) => {
        res.status(409).send(err)
    })
});


export default router;