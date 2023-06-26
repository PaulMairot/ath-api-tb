import express from "express";
import Athlete from "../models/athlete.js";

const router = express.Router();

/**
 * @api {get} /athletes Request a list of athletes
 * @apiName GetAthletes
 * @apiGroup Athlete
 * 
 * @apiParam {String} [firstName]       Filter athletes by last name.
 * @apiParam {String} [lastName]        Filter athletes by first name.
 * @apiParam {String} [nationality]     Filter athletes by country ID.
 * @apiParam {String} [gender]          Filter athletes by gender.
 * 
 * @apiParamExample {json} Request-Example:
 *      {
 *          "firstName": "usain"
 *          "lasttName": "bolt"
 *          "nationality": "4e4253583bda0bd5c9b8e08d",
 *          "gender": "men"
 *      }
 *
 * @apiSuccess {Object[]} athlete       List of athletes.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *      {   
 *          "lastName": "Bolt",
 *          "firstName": "Usain",
 *          "dateOfBirth": "1986-08-21",
 *          "gender": "men",
 *          "nationality": {...},
 *          "discipline": [ {...}, {...} ],
 *          "id": "8d835a5e00cd8bd84ee259bd"
 *      },
 *      {
 *          "lastName": "Fraser-pryce",
 *          "firstName": "Shelly-ann",
 *          "dateOfBirth": "1986-12-27",
 *          "gender": "women",
 *          "nationality": {...},
 *          "discipline": [ {...}, {...} ],
 *          "id": "8d835a5e00cd8bd84ee259bd"
 *      }
 *     ]
 * 
 * @apiError NoAthleteFound    No athlete found.
 */
router.get("/", function (req, res, next) {
    let filters = Object.assign({}, req.query);

    if(filters.lastName) { filters.lastName = filters.lastName.charAt(0).toUpperCase() + filters.lastName.slice(1).toLowerCase(); };
    if(filters.firstName) { filters.firstName = filters.firstName.charAt(0).toUpperCase() + filters.firstName.slice(1).toLowerCase(); };
    if(filters.gender) { filters.gender = filters.gender.toLowerCase() };

    Athlete.find({...filters}).sort({lastName: 1}).populate('nationality').populate('discipline').then((athletes) => {
        if (athletes.length === 0) {
            res.status(404).send("No athlete found.")
        } else {
            res.send(athletes);
        }
    }).catch((err) => {
        return next(err);
    });
});


/**
 * @api {get} /athletes/:id Request a specific athlete
 * @apiName GetAthlete
 * @apiGroup Athlete
 * 
 * @apiParam   {String} id      Athlete unique ID.
 * 
 * @apiSuccess {String}    lastName        Last name of the athlete.
 * @apiSuccess {String}    firstName       First name of the athlete.
 * @apiSuccess {String}    dateOfBirth     Date of birth of the athlete.
 * @apiSuccess {String}    gender          Gender of the athlete.
 * @apiSuccess {Object}    nationality     Nationality of the athlete.
 * @apiSuccess {Array}     discipline      List of discipline practiced by the athlete.
 * @apiSuccess {String}    id              ID of the athlete.
 * 
 * @apiSuccessExample {json} Request-Example:
 *      HTTP/1.1 200 OK
 *      {
 *          "lastName": "Bolt",
 *          "firstName": "Usain",
 *          "dateOfBirth": "1986-08-21",
 *          "gender": "men",
 *          "nationality": {...},
 *          "discipline": [ {...}, {...} ],
 *          "id": "8d835a5e00cd8bd84ee259bd"
 *      }
 * 
 * @apiError AthleteNotFound The <code>id</code> of the Athlete was not found.
 */
router.get("/:id", function (req, res, next) {
    Athlete.findById(req.params.id).populate('nationality').populate('discipline').then((athlete) => {
        if (athlete == null) {
            res.status(404).send("No athlete found with ID :" + req.params.id + ".")
        } else {
            res.send(athlete);
        }
    }).catch((err) => {
        return next(err);
    });
});


/**
 * @api {post} /athletes Create a new athlete
 * @apiName PostAthlete
 * @apiGroup Athlete
 * 
 * @apiBody {String}    lastName        Last name of the athlete.
 * @apiBody {String}    firstName       First name of the athlete.
 * @apiBody {String}    dateOfBirth     Date of birth of the athlete.
 * @apiBody {String}    gender          Gender of the athlete.
 * @apiBody {Object}    nationality     Nationality of the athlete.
 * @apiBody {Array}     discipline      List of discipline practiced by the athlete.
 * @apiBody {String}    id              ID of the athlete.
 * 
 * @apiSuccess {String}    lastName        Last name of the athlete added.
 * @apiSuccess {String}    firstName       First name of the athlete added.
 * @apiSuccess {String}    dateOfBirth     Date of birth of the athlete added.
 * @apiSuccess {String}    gender          Gender of the athlete added.
 * @apiSuccess {Object}    nationality     Nationality of the athlete added.
 * @apiSuccess {Array}     discipline      List of discipline practiced by the athlete added.
 * @apiSuccess {String}    id              ID of the athlete added.
 * 
 * @apiSuccessExample {json} Request-Example:
 *      HTTP/1.1 201 Created
 *      {
 *          "lastName": "Fraser-pryce",
 *          "firstName": "Shelly-ann",
 *          "dateOfBirth": "1986-12-27",
 *          "gender": "women",
 *          "nationality": {...},
 *          "discipline": [ {...}, {...} ],
 *          "id": "8d835a5e00cd8bd84ee259bd"
 *      }
 * 
 */
router.post("/", function (req, res, next) {
    const newAthlete = new Athlete(req.body);

    newAthlete.save().then((savedAthlete) => {
        res.status(201).send(savedAthlete);
    }).catch((err) => {
        res.status(409).send(err);
    });

});


/**
 * @api {put} /athletes/:id Update a athlete
 * @apiName PutAthlete
 * @apiGroup Athlete
 * 
 * @apiParam   {String} id           Athlete unique ID.
 * 
 * @apiBody {String}    lastName        Last name of the athlete.
 * @apiBody {String}    firstName       First name of the athlete.
 * @apiBody {String}    dateOfBirth     Date of birth of the athlete.
 * @apiBody {String}    gender          Gender of the athlete.
 * @apiBody {Object}    nationality     Nationality of the athlete.
 * @apiBody {Array}     discipline      List of discipline practiced by the athlete.
 * @apiBody {String}    id              ID of the athlete.
 * 
 * @apiSuccess {String}    lastName        Last name of the athlete updated.
 * @apiSuccess {String}    firstName       First name of the athlete updated.
 * @apiSuccess {String}    dateOfBirth     Date of birth of the athlete updated.
 * @apiSuccess {String}    gender          Gender of the athlete updated.
 * @apiSuccess {Object}    nationality     Nationality of the athlete updated.
 * @apiSuccess {Array}     discipline      List of discipline practiced by the athlete updated.
 * @apiSuccess {String}    id              ID of the athlete updated.
 * 
 * @apiSuccessExample {json} Request-Example:
 *      HTTP/1.1 200 OK
 *      {
 *          "lastName": "Fraser-pryce",
 *          "firstName": "Shelly-ann",
 *          "dateOfBirth": "1986-12-27",
 *          "gender": "women",
 *          "nationality": {...},
 *          "discipline": [ {...}, {...} ],
 *          "id": "8d835a5e00cd8bd84ee259bd"
 *      }
 * 
 * @apiError AthleteNotFound    The <code>id</code> of the Athlete was not found.
 * @apiError Conflict           Data passed do not follow the model.
 * 
 */
router.put("/:id", function (req, res, next) {
    Athlete.findByIdAndUpdate(req.params.id, req.body, { returnOriginal: false, runValidators: true }).then((updatedAthlete) => {
        res.send(updatedAthlete);
    }).catch((err) => {
        res.status(409).send(err)
    })

});


/**
 * @api {delete} /athletes/:id Remove a athlete
 * @apiName DeleteAthlete
 * @apiGroup Athlete
 * 
 * @apiParam   {String} id      Athlete unique ID.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 204 No Content
 *     {}
 * 
 * @apiError AthleteNotFound    The <code>id</code> of the Athlete was not found.
 * 
 */
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