import express from "express";
import Country from "../models/country.js";

const router = express.Router();

router.get("/", function (req, res, next) {
    let filters = Object.assign({}, req.query);
    
    if(filters.alpha2) { filters.alpha2 = filters.alpha2.toUpperCase() };
    if(filters.alpha3) { filters.alpha3 = filters.alpha3.toUpperCase() };
    if(filters.name) { filters.name = filters.name.charAt(0).toUpperCase() + filters.name.slice(1).toLowerCase(); };

    Country.find({...filters}).sort({name: 1}).then((countries) => {
        res.send(countries);
    }).catch((err) => {
        return next(err);
    });
});

router.get("/:id", function (req, res, next) {
    Country.findById(req.params.id).then((country) => {
        res.send(country);
    }).catch((err) => {
        res.status(404).send("Country with ID " + req.params.id + " not found.");
    });
});

router.post("/", function (req, res, next) {
    const newCountry = new Country(req.body);

    newCountry.save().then((savedCountry) => {
        res.status(201).send(savedCountry);
    }).catch((err) => {
        res.status(409).send(err);
    });

});

router.put("/:id", function (req, res, next) {
    Country.findByIdAndUpdate(req.params.id, req.body, { returnOriginal: false }).then((updatedCountry) => {
        res.send(updatedCountry);
    }).catch((err) => {
        res.status(409).send(err)
    })

});

router.delete("/:id", function (req, res, next) {
    Country.findById(req.params.id).deleteOne().then((deletedCountry) => {
        if (!deletedCountry.deletedCount) {
          res.status(404).send("Country with ID " + req.params.id + " not found.");
        } else {
          res.sendStatus(204);
        }
    }).catch((err) => {
        res.status(409).send(err)
    })
});


export default router;