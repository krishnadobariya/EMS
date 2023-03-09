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
        console.log("req.user", req.user);
        const eventStartTime = req.body.eventStartTime;
        const eventEndTime = req.body.eventEndTime;
        const invitedUser = req.body.invitedUser;
        const mainUser = req.user.id;
        /* -- Connect to DB -- */
        pool.getConnection((err, connection) => {
            if (err) throw err; //not connected!
            // user the connection
            connection.query(`INSERT INTO event(eventStartTime, eventEndTime, invitedUser, mainUser) VALUES('${eventStartTime}', '${eventEndTime}', '${invitedUser}', '${mainUser}')`, (err, rows) => {

                connection.query(`SELECT * FROM event WHERE id = '${rows.insertId}'`, (err, rows) => {

                    //when done with the connection, release it
                    connection.release();
                    if (!err) {
                        res.status(201).json({
                            message: "USER CREATE EVENT SUCCESSFULLY",
                            data: rows,
                            status: 201
                        })
                    } else {
                        console.log(err);
                        res.status(500).json({
                            message: "DATABASE QUERY ERROR",
                            status: 500
                        })
                    }
                })

            });
        });

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

        let data = [];
        pool.getConnection((err, connection) => {
            if (err) throw err; //not connected!
            // user the connection
            // mainUser = ${ req.user.id } OR
            // SELECT * FROM event WHERE invitedUser LIKE ? `, [`${ req.user.id }`]

            const pageSize = req.query.pageSize;
            const pageNumber = req.query.pageNumber;
            const offset = (pageNumber - 1) * pageSize;
            const searchString = req.query.searchString;
            const startDate = req.query.date
            const dataArray = [];
            connection.query(`SELECT * FROM users t1 JOIN event t2 ON t1.id = t2.mainUser WHERE (mainUser = ${req.user.id} OR JSON_SEARCH(invitedUser, "one", ?) IS NOT NULL) AND (t1.name LIKE '%${searchString}%' OR t1.age LIKE '%${searchString}%') AND (DATE(t2.eventStartTime) = '${startDate}') LIMIT ${pageSize} OFFSET ${offset} `, [req.user.id], (err, rows) => {
                //when done with the connection, release it

                rows.forEach(result => {
                    dataArray.push({
                        email: result.email,
                        eventStartTime: result.eventStartTime,
                        eventEndTime: result.eventEndTime,
                        mobno: result.mobno,
                        name: result.name,
                        invitedUser: result.invitedUser
                    });
                });

                if (!err) {
                    res.status(201).json({
                        message: "USER CREATE EVENT SUCCESSFULLY",
                        status: 201,
                        data: dataArray
                    })
                } else {
                    console.log(err);
                    res.status(500).json({
                        message: "DATABASE QUERY ERROR",
                        status: 500
                    })
                }
            });
        });

    } catch (error) {

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

        pool.getConnection((err, connection) => {

            const dataArray = [];

            // Construct the MySQL query        
            if (err) throw err; //not connected!
            // user the connection

            const query = `SELECT * FROM users t1 JOIN event t2 ON t1.id = t2.mainUser WHERE t2.id = ${req.params.eventId}`;

            connection.query(query, (error, results, fields) => {
                if (error) throw error;
                results.forEach(result => {
                    dataArray.push({
                        email: result.email,
                        eventStartTime: result.eventStartTime,
                        eventEndTime: result.eventEndTime,
                        mobno: result.mobno,
                        name: result.name,
                        invitedUser: result.invitedUser
                    });
                });

                if (!err) {
                    res.status(201).json({
                        message: "EVENT LUIST GRT BY ID SUCCESSFULLY",
                        status: 201,
                        data: dataArray
                    })
                } else {
                    console.log(err);
                    res.status(500).json({
                        message: "DATABASE QUERY ERROR",
                        status: 500
                    })
                }
                connection.end();
            });

        });



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


        const { eventStartTime, eventEndTime, invitedUser } = req.body;

        pool.getConnection((err, connection) => {
            if (err) throw err; //not connected!

            // user the connection
            connection.query(
                "UPDATE event SET eventStartTime = ?, eventEndTime = ?, invitedUser = ? WHERE id = ?",
                [eventStartTime, eventEndTime, invitedUser, req.params.eventId],
                (err, rows) => {
                    //when done with the connection, release it
                    connection.query(`SELECT * FROM event WHERE id = '${req.params.eventId}'`, (err, rows) => {

                        connection.release();

                        if (!err) {

                            res.status(200).json({
                                message: "EVENT UPDATED SUCCESSFULLY",
                                data: rows,
                                status: 200
                            })

                        } else {

                            res.status(500).json({
                                message: "DATABASE QUERY ERROR",
                                status: 500
                            })

                        }
                    })

                }
            );
        });

    } catch (error) {

        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        })

    }
}

/* ----- End Event Update ----- */