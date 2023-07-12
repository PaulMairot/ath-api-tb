import express from "express";
import Record from "../models/record.js";

const router = express.Router();

/**
 * @api {get} /records Request a list of records
 * @apiName GetRecords
 * @apiGroup Record
 * 
 * @apiParam {Number} [limit]       Limit the number of results.
 * @apiParam {String} [athlete]     Filter records by athlete ID.
 * @apiParam {String} [country]     Filter records by country ID (for national record only).
 * @apiParam {String} [discipline]  Filter records by discipline ID.
 * @apiParam {String} [mention]     Filter records by mention ID.
 * 
 * @apiParamExample {json} Request-Example:
 *      {
 *          "athlete": "8384e42535adc9bd00b5bd8e",
 *          "race": "4e42535a0bd5c9b83bd8e08d",
 *          "country": "4e8dbd8e08d5342535a0bc9b",
 *          "discipline": "2535a0b49b83bd8e4d5ce08d",
 *          "mention": "NR",
 *      }
 *
 * @apiSuccess {Object[]} record       List of records.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *      {
 *          "athlete": {...},
 *          "race": {...},
 *          "discipline": {...},
 *          "performance": {...},
 *          "mention": "WR",
 *          "id": "8d835a5e00cd8bd84ee259bd"
 *      },
 *      {
 *          "athlete": {...},
 *          "race": {...},
 *          "discipline": {...},
 *          "country": {...},
 *          "performance": {...},
 *          "mention": "NR",
 *          "id": "59bd8a5d84ee2e0d8350cd8b"
 *      },
 *     ]
 * 
 * @apiError NoRecordFound    No record found.
 */
router.get("/", function (req, res, next) {
    let filters = Object.assign({}, req.query);
    delete filters.limit;

    Record.find({...filters})
        .limit(req.query.limit)
        .populate(['athlete', 'race', 'discipline', 'country', 'performance']).then((records) => {
            if (records.length === 0) {
                res.status(404).send("No record found.")
            } else {
                res.send(records);
            }
    }).catch((err) => {
        return next(err);
    });
});


/**
 * @api {get} /records/:id Request a specific record
 * @apiName GetRecord
 * @apiGroup Record
 * 
 * @apiParam   {String} id            Record unique ID.
 * 
 * @apiSuccess {Object} athlete         Athlete associated with record.
 * @apiSuccess {Object} race            Race associated with record.
 * @apiSuccess {String} [discipline]    Discipline associated with record.
 * @apiSuccess {Object} [country]       Country of record (for national record only).
 * @apiSuccess {String} performance     Performance associated with record.
 * @apiSuccess {String} mention         Mention of record.
 * @apiSuccess {String} id              ID of the record.
 * 
 * @apiSuccessExample {json} Request-Example:
 *      {
 *          "athlete": {...},
 *          "race": {...},
 *          "discipline": {...},
 *          "performance": {...},
 *          "mention": "WR",
 *          "id": "8d835a5e00cd8bd84ee259bd"
 *      }
 * 
 * @apiError RecordNotFound The <code>id</code> of the Record was not found.
 */
router.get("/:id", function (req, res, next) {
    Record.findById(req.params.id).populate(['athlete', 'race', 'discipline', 'country', 'performance']).then((record) => {
        if (record == null) {
            res.status(404).send("No record found with ID :" + req.params.id + ".")
        } else {
            res.send(record);
        }
    }).catch((err) => {
        return next(err);
    });
});


/**
 * @api {post} /records Add a new record
 * @apiName PostRecord
 * @apiGroup Record
 * 
 * @apiBody {String} athlete        ID of the athlete associated with record.
 * @apiBody {String} race           ID of the race associated with record.
 * @apiBody {String} [discipline]   ID of the discipline associated with record.
 * @apiBody {String} [performance]  ID of the performance associated with record.
 * @apiBody {String} mention        Mention associated with record.
 * @apiBody {String} [country]      ID of the country associated with record (for national record only).
 * 
 * @apiSuccess {Object} athlete         Athlete associated with new record.
 * @apiSuccess {Object} race            Race associated with new record.
 * @apiSuccess {String} [discipline]    Discipline associated with new record.
 * @apiSuccess {Object} [country]       Country of new record (for national record only).
 * @apiSuccess {String} performance     Performance associated with new record.
 * @apiSuccess {String} mention         Mention of new record.
 * @apiSuccess {String} id              ID of the new record.
 * 
 * @apiSuccessExample {json} Request-Example:
 *      {
 *          "athlete": {...},
 *          "race": {...},
 *          "discipline": {...},
 *          "country": {...},
 *          "performance": {...},
 *          "mention": "NR",
 *          "id": "59bd8a5d84ee2e0d8350cd8b"
 *      }
 * 
 */
router.post("/", function (req, res, next) {
    const newRecord = new Record(req.body);
    
    newRecord.save().then((savedRecord) => {
        res.status(201).send(savedRecord);
    }).catch((err) => {
        res.status(409).send(err);
    });
    
});


/**
 * @api {put} /records/:id Update a record
 * @apiName PutRecord
 * @apiGroup Record
 * 
 * @apiParam   {String} id          Record unique ID.
 * 
 * @apiBody {String} athlete        ID of the athlete associated with record.
 * @apiBody {String} race           ID of the race associated with record.
 * @apiBody {String} [discipline]   ID of the discipline associated with record.
 * @apiBody {String} [performance]  ID of the performance associated with record.
 * @apiBody {String} mention        Mention associated with record.
 * @apiBody {String} [country]      ID of the country associated with record (for national record only).
 * 
 * @apiSuccess {Object} athlete         Athlete associated with updated record.
 * @apiSuccess {Object} race            Race associated with updated record.
 * @apiSuccess {String} [discipline]    Discipline associated with updated record.
 * @apiSuccess {Object} [country]       Country of updated record (for national record only).
 * @apiSuccess {String} performance     Performance associated with updated record.
 * @apiSuccess {String} mention         Mention of updated record.
 * @apiSuccess {String} id              ID of the updated record.
 * 
 * @apiSuccessExample {json} Request-Example:
 *      {
 *          "athlete": {...},
 *          "race": {...},
 *          "discipline": {...},
 *          "country": {...},
 *          "performance": {...},
 *          "mention": "MR",
 *          "id": "8d835a5e00cd8bd84ee259bd"
 *      }
 * 
 * @apiError RecordNotFound    The <code>id</code> of the Record was not found.
 * @apiError Conflict          Data passed do not follow the model.
 * 
 */
router.put("/:id", function (req, res, next) {
    Record.findByIdAndUpdate(req.params.id, req.body, { returnOriginal: false, runValidators: true }).then((updatedRecord) => {
        if (updatedRecord == null) {
            res.status(404).send("Record with ID " + req.params.id + " not found.");
        } else {
            res.send(updatedRecord);
        }
    }).catch((err) => {
        res.status(409).send(err)
    })

});

/**
 * @api {delete} /records/:id Remove a record
 * @apiName DeleteRecord
 * @apiGroup Record
 * 
 * @apiParam   {String} id      Record unique ID.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 204 No Content
 *     {}
 * 
 * @apiError RecordNotFound    The <code>id</code> of the Record was not found.
 * 
 */
router.delete("/:id", function (req, res, next) {
    Record.findById(req.params.id).deleteOne().then((deletedRecord) => {
        if (!deletedRecord.deletedCount) {
          res.status(404).send("Record with ID " + req.params.id + " not found.");
        } else {
          res.sendStatus(204);
        }
    }).catch((err) => {
        res.status(409).send(err)
    })
});


export default router;