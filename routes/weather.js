import express from "express";
import Weather from "../models/weather.js";

const router = express.Router();

/**
 * @api {get} /weather Request a list of weathers
 * @apiName GetWeathers
 * @apiGroup Weather
 * 
 * @apiParam {Number} [limit]          Limit the number of results.
 * @apiParam {String} [conditions]     Filter by weather's condition.
 * @apiParam {Number} [windSpeed]      Filter by minimum wind speed.
 * 
 * @apiParamExample {json} Request-Example:
 *     {
 *       "limit": 2,
 *       "conditions": "sunny",
 *       "windSpeed": -0.1
 *     }
 *
 * @apiSuccess {Object[]} weather       List of weathers.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *      {
 *          "windSpeed": "2.3",
 *          "temperature": "37"
 *          "conditions": "sunny",
 *          "id": "6482e6bbe776314a0f66a0xy"
 *      },
 *      {
 *          "windSpeed": "-0.1",
 *          "temperature": "17"
 *          "conditions": "cloudy",
 *          "id": "45a2e6fbe746314a1f66a08c"
 *      }
 *     ]
 * 
 * @apiError NoWeatherFound    No weather found.
 */
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

/**
 * @api {get} /weather/:id Request a specific weather
 * @apiName GetWeather
 * @apiGroup Weather
 * 
 * @apiParam   {String} id              Weather unique ID.
 * 
 * @apiSuccess {Number} windSpeed       Speed of the wind.
 * @apiSuccess {Number} temperature     Temperature.
 * @apiSuccess {String} conditions      Weather's conditions.
 * @apiSuccess {String} id              ID of the weather.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "windSpeed": "-2",
 *       "temperature": "23"
 *       "conditions": "cloudy",
 *       "id": "2482e6cbe776313a0f66a0xy"
 *     }
 * 
 * @apiError WeatherNotFound The <code>id</code> of the Weather was not found.
 */
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

/**
 * @api {post} /weather Create a new weather
 * @apiName PostWeather
 * @apiGroup Weather
 * 
 * @apiBody {Number} [windSpeed]        Speed of the wind.
 * @apiBody {Number} temperature        Temperature.
 * @apiBody {String} condition          Weather's conditions.
 * 
 * @apiSuccess {Number} windSpeed       Speed of the wind.
 * @apiSuccess {Number} temperature     Temperature.
 * @apiSuccess {String} conditions      Weather's conditions.
 * @apiSuccess {String} id              ID of the weather.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "windSpeed": "-2",
 *       "temperature": "23"
 *       "conditions": "cloudy",
 *       "id": "2482e6cbe776313a0f66a0xy"
 *     }
 * 
 */
router.post("/", function (req, res, next) {
    const newWeather = new Weather(req.body);

    newWeather.save().then((savedWeather) => {
        res.status(201).send(savedWeather);
    }).catch((err) => {
        res.status(409).send(err);
    });

});

/**
 * @api {put} /weather/:id Update a weather
 * @apiName PutWeather
 * @apiGroup Weather
 * 
 * @apiParam   {String} id              Weather unique ID.
 * 
 * @apiBody {Number} [windSpeed]        Speed of the wind.
 * @apiBody {Number} [temperature]      Temperature.
 * @apiBody {String} [condition]        Weather's conditions.
 * 
 * @apiSuccess {Number} windSpeed       Speed of the wind.
 * @apiSuccess {Number} temperature     Temperature.
 * @apiSuccess {String} conditions      Weather's conditions.
 * @apiSuccess {String} id              ID of the weather.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "windSpeed": "-2",
 *       "temperature": "23"
 *       "conditions": "cloudy",
 *       "id": "2482e6cbe776313a0f66a0xy"
 *     }
 * 
 * @apiError WeatherNotFound    The <code>id</code> of the Weather was not found.
 * @apiError Conflict          Data passed do not follow the model.
 * 
 */
router.put("/:id", function (req, res, next) {
    Weather.findByIdAndUpdate(req.params.id, req.body, { returnOriginal: false, runValidators: true }).then((updatedWeather) => {
        console.log(updatedWeather);
        res.send(updatedWeather);
    }).catch((err) => {
        res.status(409).send(err)
    })

});

/**
 * @api {delete} /weather/:id Remove a weather
 * @apiName DeleteWeather
 * @apiGroup Weather
 * 
 * @apiParam   {String} id      Weather unique ID.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 204 No Content
 *     {}
 * 
 * @apiError WeatherNotFound    The <code>id</code> of the Weather was not found.
 * 
 */
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