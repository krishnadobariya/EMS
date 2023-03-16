const mysql = require("mysql");
require("dotenv").config();
const jwt = require('jsonwebtoken');

const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: "",
    database: process.env.DB_NAME,
});


/* ----- Event Create Data ----- */

exports.EventCreate = async (req, res) => {
    try {

        const eventStartTime = req.body.eventStartTime;
        const eventEndTime = req.body.eventEndTime;
        const invitedUser = req.body.invitedUser;
        const mainUser = req.user.id;

        createEvent = () => {
            return new Promise((resolve, reject) => {
                pool.query(`INSERT INTO event(eventStartTime, eventEndTime, invitedUser, mainUser) VALUES('${eventStartTime}', '${eventEndTime}', '${invitedUser}', '${mainUser}'`, (error, elements) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(elements);
                });
            });
        }

        const insertEvent = await createEvent();

        eventGet = () => {
            return new Promise((resolve, reject) => {
                pool.query(`SELECT * FROM event WHERE id = '${insertEvent.insertId}'`, (error, elements) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(elements);
                });
            });
        }

        const getEvents = await eventGet();

        res.status(201).json({
            message: "USER CREATE EVENT SUCCESSFULLY",
            data: getEvents,
            status: 201
        })

    } catch (error) {

        console.log(error);
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        })

    }
}

/* ----- End Event Create Data ----- */

/* ----- Event List Create Data ----- */

exports.EventList = async (req, res) => {
    try {

        const id = req.user.id;
        const pageSize = req.query.pageSize;
        const pageNumber = req.query.pageNumber;
        const offset = (pageNumber - 1) * pageSize;
        const searchString = req.query.searchString;
        const startDate = req.query.date
        const dataArray = [];

        ListOfEvent = () => {
            return new Promise((resolve, reject) => {
                pool.query(`SELECT * FROM users t1 JOIN event t2 ON t1.id = t2.mainUser WHERE (mainUser = ${id} OR JSON_SEARCH(invitedUser, "one", '${id}') IS NOT NULL) AND (t1.name LIKE '%${searchString}%' OR t1.age LIKE '%${searchString}%') AND (DATE(t2.eventStartTime) = '${startDate}') LIMIT ${pageSize} OFFSET ${offset} `, (error, elements) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(elements);
                });
            });
        }


        const eventList = await ListOfEvent()

        console.log("eventList", eventList);

        eventList.forEach(result => {
            dataArray.push({
                email: result.email,
                eventStartTime: result.eventStartTime,
                eventEndTime: result.eventEndTime,
                mobno: result.mobno,
                name: result.name,
                invitedUser: result.invitedUser
            });
        });


        res.status(200).json({
            message: "USER EVENT LIST VIEW SUCCESSFULLY",
            status: 200,
            data: dataArray
        })


    } catch (error) {

        console.log("error", error);
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        })

    }
}

/* ----- End Event List Create Data ----- */

/* ----- Event List By Id Create Data ----- */

exports.EventListGetOne = async (req, res) => {
    try {

        const eventId = req.params.eventId

        getOneEvent = () => {
            return new Promise((resolve, reject) => {
                pool.query(`SELECT * FROM users t1 JOIN event t2 ON t1.id = t2.mainUser WHERE t2.id = ${eventId}`, (error, elements) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(elements);
                });
            });
        }

        const eventList = await getOneEvent()

        res.status(201).json({
            message: "EVENT LIST GET BY ID SUCCESSFULLY",
            status: 201,
            data: eventList
        })
    } catch (error) {

        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        })

    }
}

/* ----- Event List By Id Create Data ----- */

/* ----- Event Update ----- */

exports.EventUpdate = async (req, res) => {
    try {

        const eventId = req.params.eventId
        const { eventStartTime, eventEndTime, invitedUser } = req.body;

        eventUpdate = () => {
            return new Promise((resolve, reject) => {
                pool.query(`UPDATE event SET eventStartTime = '${eventStartTime}', eventEndTime = '${eventEndTime}', invitedUser = '${invitedUser}' WHERE id = '${eventId}'`, (error, elements) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(elements);
                });
            });
        }

        getOneEvent = () => {
            return new Promise((resolve, reject) => {
                pool.query(`SELECT * FROM event WHERE id = '${eventId}'`, (error, elements) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(elements);
                });
            });
        }

        const eventGet = await getOneEvent()

        if(eventGet.length == 0){

            res.status(200).json({
                message: "EVENT NOT FOUND",
                status: 200
            })

        }else{
            const updateEvent = await eventUpdate()
            res.status(200).json({
                message: "EVENT UPDATED SUCCESSFULLY",
                data: eventGet,
                status: 200
            })
        }

    } catch (error) {

        console.log("error", error);

        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        })

    }
}

/* ----- End Event Update ----- */