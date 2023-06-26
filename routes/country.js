import express from "express";
import Country from "../models/country.js";

const router = express.Router();

/**
 * @api {get} /countries Request a list of countries
 * @apiName GetCountries
 * @apiGroup Country
 * 
 * @apiParam {String} [name]        Name of a Country.
 * @apiParam {String} [alpha2]      Alpha 2 code of a country.
 * @apiParam {String} [alpha3]      Alpha 3 code of a country.
 * @apiParam {String} [noc]         NOC of a country.
 * 
 * @apiParamExample {json} Request-Example:
 *     {
 *       "name": "Switzerland",
 *       "alpha2": "ch",
 *       "alpha3": "che",
 *       "noc": "sui"
 *     }
 *
 * @apiSuccess {Object[]} country       List of countries.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *      {
 *           "alpha2": "SE",
 *           "alpha3": "SWE",
 *           "noc": "SWE",
 *           "name": "Sweden",
 *           "id": "4c82fd2c70264f8dfc92ff4f"
 *       },
 *       {
 *           "alpha2": "CH",
 *           "alpha3": "CHE",
 *           "noc": "SUI",
 *           "name": "Switzerland",
 *           "id": "64e2fdc570e6702dfc9cfed0"
 *       }
 *     ]
 * 
 * @apiError NoCountryFound    No country found.
 */
router.get("/", function (req, res, next) {
    let filters = Object.assign({}, req.query);
    
    if(filters.alpha2) { filters.alpha2 = filters.alpha2.toUpperCase() };
    if(filters.alpha3) { filters.alpha3 = filters.alpha3.toUpperCase() };
    if(filters.noc)    { filters.noc = filters.noc.toUpperCase() };
    if(filters.name)   { filters.name = filters.name.charAt(0).toUpperCase() + filters.name.slice(1).toLowerCase(); };

    Country.find({...filters}).sort({name: 1}).then((countries) => {
        if (countries.length === 0) {
            res.status(404).send("No country found.")
        } else {
            res.send(countries);
        }
    }).catch((err) => {
        return next(err);
    });
});

/**
 * @api {get} /countries/:id Request a specific country
 * @apiName GetCountry
 * @apiGroup Country
 * 
 * @apiParam   {String} id          Country unique ID.
 * 
 * @apiSuccess {String} alpha2      Alpha 2 code of the country.
 * @apiSuccess {String} alpha3      Alpha 3 code of the country.
 * @apiSuccess {String} noc         NOC of the country.
 * @apiSuccess {String} name        Name of the country.
 * @apiSuccess {String} id          ID of the country.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *         "alpha2": "CH",
 *         "alpha3": "CHE",
 *         "noc": "SUI",
 *         "name": "Switzerland",
 *         "id": "64e2fdc570e6702dfc9cfed0"
 *      }
 * 
 * @apiError CountryNotFound The <code>id</code> of the Country was not found.
 */
router.get("/:id", function (req, res, next) {
    Country.findById(req.params.id).then((country) => {
        if (country == null) {
            res.status(404).send("No country found with ID :" + req.params.id + ".")
        } else {
            res.send(country);
        }
    }).catch((err) => {
        return next(err);
    });
});


/**
 * @api {post} /countries Add a new country
 * @apiName PostCountry
 * @apiGroup Country
 * 
 * @apiBody {String} alpha2      Alpha 2 code of the country.
 * @apiBody {String} alpha3      Alpha 3 code of the country.
 * @apiBody {String} noc         NOC of the country.
 * @apiBody {String} name        Name of the country.
 * 
 * @apiSuccess {String} alpha2      Alpha 2 code of the country.
 * @apiSuccess {String} alpha3      Alpha 3 code of the country.
 * @apiSuccess {String} noc         NOC of the country.
 * @apiSuccess {String} name        Name of the country.
 * @apiSuccess {String} id          ID of the country.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *      {
 *         "alpha2": "CH",
 *         "alpha3": "CHE",
 *         "noc": "SUI",
 *         "name": "Switzerland",
 *         "id": "64e2fdc570e6702dfc9cfed0"
 *      }
 * 
 */
router.post("/", function (req, res, next) {
    const newCountry = new Country(req.body);

    newCountry.save().then((savedCountry) => {
        res.status(201).send(savedCountry);
    }).catch((err) => {
        res.status(409).send(err);
    });

});


/**
 * @api {put} /countries/:id Update a country
 * @apiName PutCountry
 * @apiGroup Country
 * 
 * @apiParam   {String} id              Country unique ID.
 * 
 * @apiBody {String} alpha2      Alpha 2 code of the country.
 * @apiBody {String} alpha3      Alpha 3 code of the country.
 * @apiBody {String} noc         NOC of the country.
 * @apiBody {String} name        Name of the country.
 * 
 * @apiSuccess {String} alpha2      Alpha 2 code of the country.
 * @apiSuccess {String} alpha3      Alpha 3 code of the country.
 * @apiSuccess {String} noc         NOC of the country.
 * @apiSuccess {String} name        Name of the country.
 * @apiSuccess {String} id          ID of the country.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *         "alpha2": "CH",
 *         "alpha3": "CHE",
 *         "noc": "SUI",
 *         "name": "Switzerland",
 *         "id": "64e2fdc570e6702dfc9cfed0"
 *      }
 * 
 * 
 * @apiError CountryNotFound    The <code>id</code> of the Country was not found.
 * @apiError Conflict          Data passed do not follow the model.
 * 
 */
router.put("/:id", function (req, res, next) {
    Country.findByIdAndUpdate(req.params.id, req.body, { returnOriginal: false, runValidators: true }).then((updatedCountry) => {
        res.send(updatedCountry);
    }).catch((err) => {
        res.status(409).send(err)
    })

});

/**
 * @api {delete} /countries/:id   Remove a country
 * @apiName DeleteCountry
 * @apiGroup Country
 * 
 * @apiParam   {String} id      Country unique ID.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 204 No Content
 *     {}
 * 
 * @apiError CountryNotFound    The <code>id</code> of the Country was not found.
 * 
 */
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