import express from "express";
import Position from "../models/position.js";
import position from "../models/position.js";

const router = express.Router();

router.get("/", function (req, res, next) {
    let filters = Object.assign({}, req.query);

    delete filters.speed;
    if (filters.time) { filters.time = new Date(filters.time).toISOString()}

    Position.find({
        ...filters,
        ...req.query.speed ? { speed: { $gt: req.query.speed } } : {},
    }).sort({time: 1}).then((positions) => {
        res.send(positions);
    }).catch((err) => {
        return next(err);
    });
});

router.post("/", function (req, res, next) {
    const newPosition = new Position(req.body);

    newPosition.save().then((savedPosition) => {
        res.status(201).send(savedPosition);
    }).catch((err) => {
        res.status(409).send(err);
    });
});

router.put("/:id", function (req, res, next) {
    Position.findByIdAndUpdate(req.params.id, req.body, { returnOriginal: false }).then((updatedPosition) => {
        res.send(updatedPosition);
    }).catch((err) => {
        res.status(409).send(err)
    })

});

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