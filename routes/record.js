import express from "express";
import Record from "../models/record.js";

const router = express.Router();

/**
 * @api {get} /records Request a list of record
 * @apiName GetRecords
 * @apiGroup Record
 * 
 * @apiParam {Number} [limit]       Limit the number of results.
 * @apiParam {String} [athlete]     Filter records by athlete ID.
 * @apiParam {String} [mention]     Filter records by mention ID.
 * @apiParam {String} [country]     Filter records by country ID (for national record only).
 * 
 * @apiParamExample {json} Request-Example:
 *      {
 *          "athlete": "8384e42535adc9bd00b5bd8e",
 *          "race": "4e42535a0bd5c9b83bd8e08d",
 *          "mention": "WR"
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
 *          "mention": "WR",
 *          "id": "8d835a5e00cd8bd84ee259bd"
 *      },
 *      {
 *          "athlete": {...},
 *          "race": {...},
 *          "mention": "NR",
 *          "country": {...}
 *          "id": "59bd8a5d84ee2e0d8350cd8b"
 *      },
 *     ]
 * 
 * @apiError NoRecordFound    No record found.
 */
router.get("/", function (req, res, next) {
    let filters = Object.assign({}, req.query);
    delete filters.limit;

    Record.find({...filters}).limit(req.query.limit).then((records) => {
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
 * @apiSuccess {Object} [athlete]     Athlete associated with record.
 * @apiSuccess {Object} [race]        Race associated with record.
 * @apiSuccess {String} [mention]     Mention of record.
 * @apiSuccess {Object} [country]     Country of record (for national record only).
 * @apiSuccess {String} id            ID of the record.
 * 
 * @apiSuccessExample {json} Request-Example:
 *      {
 *          "athlete": {...},
 *          "race": {...},
 *          "mention": "WR",
 *          "id": "8d835a5e00cd8bd84ee259bd"
 *      }
 * 
 * @apiError RecordNotFound The <code>id</code> of the Record was not found.
 */
router.get("/:id", function (req, res, next) {
    Record.findById(req.params.id).then((record) => {
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
 * @api {post} /records Create a new record
 * @apiName PostRecord
 * @apiGroup Record
 * 
 * @apiBody {String} athlete       ID of the athlete associated with record.
 * @apiBody {String} race          ID of the race associated with record.
 * @apiBody {String} mention       Mention associated with record.
 * @apiBody {String} [country]     ID of the country associated with record (for national record only).
 * 
 * @apiSuccess {Object} [athlete]     Athlete associated with record.
 * @apiSuccess {Object} [race]        Race associated with record.
 * @apiSuccess {String} [mention]     Mention of record.
 * @apiSuccess {Object} [country]     Country of the record (for national record only).
 * @apiSuccess {String} id            ID of the record.
 * 
 * @apiSuccessExample {json} Request-Example:
 *      {
 *          "athlete": {...},
 *          "race": {...},
 *          "mention": "MR",
 *          "id": "8d835a5e00cd8bd84ee259bd"
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
 * @apiParam   {String} id              Record unique ID.
 * 
 * @apiBody {String} [athlete]       ID of the athlete associated with record.
 * @apiBody {String} [race]          ID of the race associated with record.
 * @apiBody {String} [mention]       Mention associated with record.
 * @apiBody {String} [country]       ID of the country associated with record (for national record only).
 * 
 * @apiSuccess {Object} [athlete]     Athlete associated with record.
 * @apiSuccess {Object} [race]        Race associated with record.
 * @apiSuccess {String} [mention]     Mention of record.
 * @apiSuccess {Object} [country]     Country of the record (for national record only).
 * @apiSuccess {String} id            ID of the record.
 * 
 * @apiSuccessExample {json} Request-Example:
 *      {
 *          "athlete": {...},
 *          "race": {...},
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
        res.send(updatedRecord);
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