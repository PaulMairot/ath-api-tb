import express from "express";
import Weather from "../models/weather.js";

const router = express.Router();

router.get("/", function (req, res, next) {
    let filters = Object.assign({}, req.query);
    delete filters.limit, filters.windSpeed;

    Weather.find({
        ...filters,
        ...req.query.windSpeed ? { windSpeed: { $gt: req.query.windSpeed } } : {},
    }).sort({windSpeed: 1}).limit(req.query.limit).then((weathers) => {
        if (weathers.length === 0) {
            res.status(404).send("No weather found.")
        } else {
            res.send(weathers);
        }
    }).catch((err) => {
        return next(err);
    });
});

router.get("/:id", function (req, res, next) {
    Weather.findById(req.params.id).then((weather) => {
        if (weather == null) {
            res.status(404).send("No weather found with ID :" + req.params.id + ".")
        } else {
            res.send(weather);
        }
    }).catch((err) => {
        return next(err);
    });
});

router.post("/", function (req, res, next) {
    const newWeather = new Weather(req.body);

    newWeather.save().then((savedWeather) => {
        res.status(201).send(savedWeather);
    }).catch((err) => {
        res.status(409).send(err);
    });

});

router.put("/:id", function (req, res, next) {
    Weather.findByIdAndUpdate(req.params.id, req.body, { returnOriginal: false, runValidators: true }).then((updatedWeather) => {
        console.log(updatedWeather);
        res.send(updatedWeather);
    }).catch((err) => {
        res.status(409).send(err)
    })

});

router.delete("/:id", function (req, res, next) {
    Weather.findById(req.params.id).deleteOne().then((deletedWeather) => {
        if (!deletedWeather.deletedCount) {
          res.status(404).send("Weather with ID " + req.params.id + " not found.");
        } else {
          res.sendStatus(204);
        }
    }).catch((err) => {
        res.status(409).send(err)
    })
});


export default router;