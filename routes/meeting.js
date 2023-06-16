import express from "express";
import Meeting from "../models/meeting.js";

const router = express.Router();

router.get("/", function (req, res, next) {
    let filters = Object.assign({}, req.query);
    delete filters.limit;

    if(filters.name) { 
        filters.name = filters.name.split(" ").map((word) => { 
                            return word[0].toUpperCase() + word.substring(1); 
                        }).join(" ");    
    };
    if (filters.startDate) { filters.startDate = new Date(filters.startDate).toISOString()}
    if(filters.city) { filters.city = filters.city.charAt(0).toUpperCase() + filters.city.slice(1).toLowerCase(); };

    Meeting.find({...filters})
        .populate(['country', 'races'])
        .sort({name: 1}).limit(req.query.limit).then((meetings) => {
            res.send(meetings);
        }).catch((err) => {
            return next(err);
        });
});

router.get("/:id", function (req, res, next) {
    Meeting.findById(req.params.id).populate(['country', 'races']).then((meeting) => {
        res.send(meeting);
    }).catch((err) => {
        res.status(404).send("Meeting with ID " + req.params.id + " not found.");
    });
});

router.post("/", function (req, res, next) {
    const newMeeting = new Meeting(req.body);

    newMeeting.save().then((savedMeeting) => {
        res.status(201).send(savedMeeting);
    }).catch((err) => {
        res.status(409).send(err);
    });

});

router.put("/:id", function (req, res, next) {
    Meeting.findByIdAndUpdate(req.params.id, req.body, { returnOriginal: false }).then((updatedMeeting) => {
        res.send(updatedMeeting);
    }).catch((err) => {
        res.status(409).send(err)
    })

});

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