const mysql = require("mysql");
require("dotenv").config();
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
/* --- Connection Pool --- */
const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: "",
    database: process.env.DB_NAME,
});

/* ----- Register Users Data ----- */

exports.registerUser = (req, res) => {
    try {

        const params = req.body;

        /* -- Connect to DB -- */
        pool.getConnection((err, connection) => {
            if (err) throw err; //not connected!

            // user the connection
            connection.query("INSERT INTO users SET ?", params, (err, rows) => {
                //when done with the connection, release it
                connection.release();

                if (!err) {

                    res.status(201).json({
                        message: "USER REGISTER SUCCESSFULLY",
                        status: 201
                    })

                } else {

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
};

/* ----- End Of Register Users API ----- */

/* ----- Login Users API ----- */

exports.loginUser = (req, res) => {
    try {

        const params = req.body;

        /* -- Connect to DB -- */
        pool.getConnection((err, connection) => {
            if (err) throw err; //not connected!

            // user the connection
            connection.query("SELECT * from users WHERE email = ?", params.email, (err, rows) => {
                //when done with the connection, release it
                connection.release();


                if (!err) {
                    if (!rows.length) {
                        return res.status(401).send({
                            msg: 'EMAIL OR PASSWORD IS INCORRECT!',
                            status: 401
                        });
                    } else {
                        if (req.body.password == rows[0]['password']) {
                            const token = jwt.sign({ id: rows[0].id }, process.env.JWT_SCREAT_KEY, { expiresIn: '1h' });
                            console.log("token", token, rows);
                            connection.query(
                                `UPDATE users SET token = '${token}' WHERE id = '${rows[0].id}'`
                            );
                            res.status(200).json({
                                message: "USER LOGIN SUCCESSFULLY",
                                token: token,
                                status: 200
                            })
                        } else {
                            return res.status(401).send({
                                msg: 'EMAIL OR PASSWORD IS INCORRECT!',
                                status: 401
                            });
                        }

                    }
                } else {
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
};

/* ----- End Of Login Users API ----- */

/* ----- Logout Users API ----- */

exports.logOutUser = (req, res) => {
    try {

        const params = req.params.id;

        /* -- Connect to DB -- */
        pool.getConnection((err, connection) => {
            if (err) throw err; //not connected!

            // user the connection
            connection.query(`SELECT * from users WHERE id = ${params}`, (err, rows) => {
                //when done with the connection, release it
                connection.release();


                if (!err) {
                    if (!rows.length) {
                        return res.status(404).send({
                            msg: 'USER NOT FOUND!',
                            status: 404
                        });
                    } else {

                        connection.query(
                            `UPDATE users SET token = '' WHERE id = '${params}'`
                        );
                        res.status(201).json({
                            message: "USER LOGOUT SUCCESSFULLY",
                            status: 200
                        })


                    }
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
};

/* ----- End Of Logout Users API ----- */

/* ----- Chnange Password Users API ----- */

exports.changePassword = (req, res) => {
    try {

        const id = req.params.id;
        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;

        /* -- Connect to DB -- */
        pool.getConnection((err, connection) => {
            if (err) throw err; //not connected!

            // user the connection
            connection.query(`SELECT * from users WHERE id = ${id}`, (err, rows) => {
                //when done with the connection, release it
                connection.release();

                if (!err) {
                    if (!rows.length) {
                        return res.status(404).send({
                            msg: 'USER NOT FOUND',
                            status: 404
                        });
                    } else {

                        if (rows[0].password == oldPassword) {
                            connection.query(
                                `UPDATE users SET password = ${newPassword} WHERE id = '${id}'`
                            );
                            res.status(200).json({
                                message: "USER CHANGE PASSWORD SUCCESSFULLY",
                                status: 200
                            })

                        } else {

                            res.status(401).json({
                                message: "PLEASE VERYFY YOUR OLD PASSWORD",
                                status: 401
                            })

                        }

                    }
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
};

/* ----- End Chnange Password Users API ----- */

/* -----  Reset Password API ----- */

exports.resetPassword = async (req, res) => {
    try {
        pool.getConnection((err, connection) => {
            if (err) throw err; //not connected!

            // user the connection
            connection.query(`SELECT * from users WHERE id = ${req.params.id}`, (err, rows) => {
                //when done with the connection, release it
                connection.release();


                if (!err) {
                    if (!rows.length) {
                        return res.status(404).send({
                            msg: 'USER NOT FOUND!',
                            status: 404
                        });
                    } else {

                        var transporter = nodemailer.createTransport({
                            host: 'smtp.gmail.com',
                            port: 587,
                            auth: {
                                user: 'krishnadobariya3488@gmail.com',
                                pass: 'dbuwctkqoezrhpsz',
                            }
                        });

                        var mailOptions = {
                            from: `krishnadobariya3488@gmail.com`,
                            to: `${rows[0].email}`,
                            subject: 'Reset Password Link',
                            html: `
                                <html>
                                <body> 
                                <h4> Hello ${rows[0].name},</h4>

                                <p>Did you forgot password? Don't worry we have reset your password.</p>

                                <p>You change Your new password Using this link : <b></b></p>

                                <p>Please use above Link For your update password.</p>

                                <p>If you did not get any link for update your a new password, please let us know immediately by replying to this email.</p>

                                <p>Thanks</p>
                                </body>
                                </html>`
                        };

                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email sent: ' + info.response);
                            }
                        });
                        res.status(200).json({
                            message: "USER GOT RESETPASSWORD LINK SUCCESSFULLY ON YOUR MAIL",
                            status: 200
                        })


                    }
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
        console.log(error);
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        })
    }
};

/* ----- End Resent Password  API ----- */

/* -----  Update Password API ----- */

exports.updatePassword = async (req, res) => {
    try {

        pool.getConnection((err, connection) => {
            if (err) throw err; //not connected!

            // user the connection
            connection.query(`SELECT * from users WHERE id = ${req.params.id}`, (err, rows) => {
                //when done with the connection, release it
                connection.release();

                if (!err) {
                    if (!rows.length) {
                        return res.status(404).send({
                            msg: 'USER NOT FOUND!',
                            status: 404
                        });
                    } else {
                        connection.query(
                            `UPDATE users SET password = ${req.body.newPassword} WHERE id = '${req.params.id}'`
                        );
                        res.status(201).json({
                            message: "USER PASSWORD UPDATE SUCCESSFULLY",
                            status: 201
                        })
                    }
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
        console.log(error);
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        })
    }
};

/* ----- End Update Password  API ----- */
