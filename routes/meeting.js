import express from "express";
import Meeting from "../models/meeting.js";
import { broadcastData } from "../ws.js";

const router = express.Router();

/**
 * @api {get} /meetings Request a list of meetings
 * @apiName GetMeetings
 * @apiGroup Meeting
 * 
 * @apiParam {Number} [limit]       Limit the number of meetings.
 * @apiParam {Date}   [fromDate]    All meetings from specified date.
 * @apiParam {Date}   [toDate]      All meetings before specified date.
 * @apiParam {Date}   [date]        All meetings at specified date.
 * @apiParam {String} [country]     ID of a country.
 * @apiParam {String} [city]        Name of a city.
 * 
 * @apiParamExample {json} Request-Example:
 *     {
 *       "limit": 2,
 *       "fromDate": "2023-05-28",
 *       "toDate": "2023-05-28",
 *       "date": "2023-05-28",
 *       "country": "07b011c58932564858f9e9f0",
 *       "city": "Doha"
 *     }
 *
 * @apiSuccess {Object[]} meeting       List of meetings.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *          {
                "name": "Diamond League",
                "startDate": "2023-05-05",
                "endDate": "2023-05-05",
                "location": "Suhaim Bin Hamad Stadium",
                "city": "Doha",
                "country": {...},
                "races": [...],
                "id": "32b011c589f564858f9e9070"
            },
            {
                "name": "Diamond League",
                "startDate": "2023-05-28",
                "endDate": "2023-05-28",
                "location": "Prince Moulay Abdellah Stadium",
                "city": "Rabat",
                "country": {...},
                "races": [...],
                "id": "101958f6481cf558332099e9"
            }
 *     ]
 * 
 * @apiError NoMeetingFound    No meeting found.
 */
router.get("/", function (req, res, next) {
    let filters = Object.assign({}, req.query);
    delete filters.limit;
    delete filters.fromDate;
    delete filters.toDate;
    delete filters.date;

    if(filters.name) { 
        filters.name = filters.name.split(" ").map((word) => { 
                            return word[0].toUpperCase() + word.substring(1); 
                        }).join(" ");    
    };
    
    if(filters.city) { filters.city = filters.city.charAt(0).toUpperCase() + filters.city.slice(1).toLowerCase(); };
    
    if(req.query.fromDate) { req.query.fromDate = new Date(req.query.fromDate).toISOString()}
    if(req.query.toDate) { req.query.toDate = new Date(req.query.toDate).toISOString()}
    if(req.query.date) { req.query.date = new Date(req.query.date).toISOString()}

    // Change sorting based on query
    let sorting = 1;
    if (req.query.toDate) {
        sorting = -1
    }

    Meeting.find({
            ...filters,
            ...req.query.fromDate ? { startDate: { $gte: req.query.fromDate } } : {},
            ...req.query.toDate ? { startDate: { $lte: req.query.toDate } } : {},
            ...req.query.date ? { startDate: { $gte: req.query.date } } : {},
            ...req.query.date ? { endDate: { $lte: req.query.date } } : {},
        })
        .populate(['country', 'races'])
        .sort({startDate: sorting}).limit(req.query.limit).then((meetings) => {
            if (meetings.length === 0) {
                res.status(404).send("No meeting found.")
            } else {
                res.send(meetings);
            }
        }).catch((err) => {
            return next(err);
        });
});


/**
 * @api {get} /meetings/:id Request a specific meeting
 * @apiName GetMeeting
 * @apiGroup Meeting
 * 
 * @apiParam   {String} id          Meeting unique ID.
 * 
 * @apiSuccess {String} name            Name of the meeting.
 * @apiSuccess {String} startDate       Start date of the meeting.
 * @apiSuccess {String} endDate         End date of the meeting.
 * @apiSuccess {String} location        Location of the meeting.
 * @apiSuccess {String} city            City of the meeting.
 * @apiSuccess {Object} country         Country of the meeting.
 * @apiSuccess {Array}  races           Races of the meeting.
 * @apiSuccess {String} id              ID of the meeting.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      {
            "name": "Diamond League",
            "startDate": "2023-06-02",
            "endDate": "2023-06-02",
            "location": "Ridolfi Stadium",
            "city": "Florence",
            "country": {...},
            "races": [...],
            "id": "6cf5858990f9e95483209511"
        }
 * 
 * @apiError MeetingNotFound The <code>id</code> of the Meeting was not found.
 */
router.get("/:id", function (req, res, next) {
    Meeting.findById(req.params.id).populate(['country', 'races']).then((meeting) => {
        if (meeting == null) {
            res.status(404).send("No meeting found with ID :" + req.params.id + ".")
        } else {
            res.send(meeting);
        }
    }).catch((err) => {
        return next(err);
    });
});


/**
 * @api {post} /meetings Add a new meeting
 * @apiName PostMeeting
 * @apiGroup Meeting
 * 
 * @apiBody {String} name            Name of the meeting.
 * @apiBody {String} startDate       Start date of the meeting.
 * @apiBody {String} endDate         End date of the meeting.
 * @apiBody {String} location        Location of the meeting.
 * @apiBody {String} city            City of the meeting.
 * @apiBody {Object} country         Country of the meeting.
 * @apiBody {Array}  [races]           Races of the meeting.
 * 
 * @apiSuccess {String} name            Name of the new meeting.
 * @apiSuccess {String} startDate       Start date of the new meeting.
 * @apiSuccess {String} endDate         End date of the new meeting.
 * @apiSuccess {String} location        Location of the new meeting.
 * @apiSuccess {String} city            City of the new meeting.
 * @apiSuccess {Object} country         Country of the new meeting.
 * @apiSuccess {Array}  races           Races of the new meeting.
 * @apiSuccess {String} id              ID of the new meeting.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *      {
            "name": "Diamond League",
            "startDate": "2023-06-02",
            "endDate": "2023-06-02",
            "location": "Ridolfi Stadium",
            "city": "Florence",
            "country": {...},
            "races": [...],
            "id": "6cf5858990f9e95483209511"
        }
 * 
 */
router.post("/", function (req, res, next) {
    const newMeeting = new Meeting(req.body);
    
    newMeeting.save().then(async (savedMeeting) => {
         // WS new meeting
         broadcastData({ ressource: 'meeting', type: 'new', data: await savedMeeting.populate(['country', 'races']) });

        res.status(201).send(savedMeeting);
    }).catch((err) => {
        res.status(409).send(err);
    });

});


/**
 * @api {put} /meetings/:id Update a meeting
 * @apiName PutMeeting
 * @apiGroup Meeting
 * 
 * @apiParam   {String} id              Meeting unique ID.
 * 
 * @apiBody {String} [name]            Name of the meeting.
 * @apiBody {String} [startDate]       Start date of the meeting.
 * @apiBody {String} [endDate]         End date of the meeting.
 * @apiBody {String} [location]        Location of the meeting.
 * @apiBody {String} [city]            City of the meeting.
 * @apiBody {Object} [country]         Country of the meeting.
 * @apiBody {Array}  [races]           Races of the meeting.
 * 
 * @apiSuccess {String} name            Name of the updated meeting.
 * @apiSuccess {String} startDate       Start date of the updated meeting.
 * @apiSuccess {String} endDate         End date of the updated meeting.
 * @apiSuccess {String} location        Location of the updated meeting.
 * @apiSuccess {String} city            City of the updated meeting.
 * @apiSuccess {Object} country         Country of the updated meeting.
 * @apiSuccess {Array}  races           Races of the updated meeting.
 * @apiSuccess {String} id              ID of the updated meeting.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      {
            "name": "Diamond League",
            "startDate": "2023-06-09",
            "endDate": "2023-06-09",
            "location": "Charlety Stadium",
            "city": "Paris",
            "country": {...},
            "races": [...],
            "id": "358fcf558979e920a7016481"
        }
 * 
 * 
 * @apiError MeetingNotFound    The <code>id</code> of the Meeting was not found.
 * @apiError Conflict           Data passed do not follow the model.
 * 
 */
router.put("/:id", function (req, res, next) {
    Meeting.findByIdAndUpdate(req.params.id, req.body, { returnOriginal: false, runValidators: true }).populate(['country', 'races']).then(async (updatedMeeting) => {
        // WS updated meeting
        broadcastData({ ressource: 'meeting', type: 'updated', data: await updatedMeeting.populate(['country', 'races']) });

        res.send(updatedMeeting);
    }).catch((err) => {
        res.status(409).send(err)
    })

});


/**
 * @api {delete} /meetings/:id   Remove a meeting
 * @apiName DeleteMeeting
 * @apiGroup Meeting
 * 
 * @apiParam   {String} id      Meeting unique ID.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 204 No Content
 *     {}
 * 
 * @apiError MeetingNotFound    The <code>id</code> of the Meeting was not found.
 * 
 */
router.delete("/:id", function (req, res, next) {
    Meeting.findById(req.params.id).deleteOne().then((deletedMeeting) => {
        if (!deletedMeeting.deletedCount) {
          res.status(404).send("Meeting with ID " + req.params.id + " not found.");
        } else {
          res.sendStatus(204);
        }
    }).catch((err) => {
        res.status(409).send(err)
    })
});


export default router;