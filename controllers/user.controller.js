const mysql = require("mysql");
const util = require('util');
require("dotenv").config();
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt")
const saltRounds = 10

/* --- Connection Pool --- */
const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: "",
    database: process.env.DB_NAME,
});




/* ----- Register Users Data ----- */

exports.registerUser = async (req, res) => {
    try {

        const params = req.body;

        // Hashing password
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(req.body.password, salt);

        // Mail Validation
        const emailToValidate = params.email;
        const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

        // Mobile Number Validation

        const mobToValidate = params.mobno
        const mobRegExp = /^\d{10}$/

        console.log("gfgdf0", typeof (mobRegExp))
        if (emailRegexp.test(emailToValidate)) {
            if (mobRegExp.test(mobToValidate)) {
                const registerUserDetail = {
                    name: params.name,
                    age: params.age,
                    password: hash,
                    email: params.email,
                    mobno: params.mobno
                }

                InsertUser = () => {
                    return new Promise((resolve, reject) => {
                        pool.query("INSERT INTO users SET ?", registerUserDetail, (error, elements) => {
                            if (error) {
                                return reject(error);
                            }
                            return resolve(elements);
                        });
                    });
                };

                getUser = () => {
                    return new Promise((resolve, reject) => {
                        pool.query(`SELECT *  FROM users WHERE email = '${params.email}'`, (error, elements) => {
                            if (error) {
                                return reject(error);
                            }
                            return resolve(elements);
                        });
                    });
                }

                const getUserDetail = await getUser();

                if (getUserDetail.length == 0) {
                    const resultElements = await InsertUser();

                    res.status(201).json({
                        message: "USER REGISTER SUCCESSFULLY",
                        status: 201
                    })
                } else {
                    res.status(403).json({
                        message: "ALLREADY TACK THIS MAIL PLEASE ENTER UNIQUE MAIL",
                        status: 403
                    })
                }
            } else {

                res.status(426).json({
                    message: "PLEASE ENTER VALID NUMBER",
                    status: 426
                })
            }

        } else {
            res.status(426).json({
                message: "ENTER VALID MAIL",
                status: 426
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        })
    }
};

/* ----- End Of Register Users API ----- */

/* ----- Login Users API ----- */

exports.loginUser = async (req, res) => {
    try {
        const params = req.body;

        getUser = () => {
            return new Promise((resolve, reject) => {
                pool.query(`SELECT *  FROM users WHERE email = '${params.email}'`, (error, elements) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(elements);
                });
            });
        }

        const getUserDetail = await getUser();

        if (getUserDetail.length == 0) {

            res.status(401).send({
                msg: 'EMAIL OR PASSWORD IS INCORRECT!',
                status: 401
            });

        } else {
            if (bcrypt.compareSync(params.password, getUserDetail[0]['password'])) {

                const token = jwt.sign({ id: getUserDetail[0].id }, process.env.JWT_SCREAT_KEY, { expiresIn: '1h' });
                updateToken = () => {
                    return new Promise((resolve, reject) => {
                        pool.query(`UPDATE users SET token = '${token}' WHERE email = '${params.email}'`, (error, elements) => {
                            if (error) {
                                return reject(error);
                            }
                            return resolve(elements);
                        });
                    });
                }
                const updateTokenInUser = await updateToken();
                res.status(200).json({
                    message: "USER LOGIN SUCCESSFULLY",
                    token: token,
                    status: 200
                })

            } else {

                res.status(401).send({
                    msg: 'EMAIL OR PASSWORD IS INCORRECT!',
                    status: 401
                });

            }
        }
    } catch (error) {
        console.log("error", error);
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        })
    }
};

/* ----- End Of Login Users API ----- */

/* ----- Logout Users API ----- */

exports.logOutUser = async (req, res) => {
    try {

        const id = req.params.id;

        getUser = () => {
            return new Promise((resolve, reject) => {
                pool.query(`SELECT *  FROM users WHERE id = '${id}'`, (error, elements) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(elements);
                });
            });
        }

        const getUserDetail = await getUser();

        if (getUserDetail.length == 0) {

            res.status(404).send({
                msg: 'USER NOT FOUND!',
                status: 404
            });

        } else {

            updateToken = () => {
                return new Promise((resolve, reject) => {
                    pool.query(`UPDATE users SET token = '${token}' WHERE id = '${id}'`, (error, elements) => {
                        if (error) {
                            return reject(error);
                        }
                        return resolve(elements);
                    });
                });
            }

            res.status(201).json({
                message: "USER LOGOUT SUCCESSFULLY",
                status: 200
            })

        }

    } catch (error) {
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        })
    }
};

/* ----- End Of Logout Users API ----- */

/* ----- Chnange Password Users API ----- */

exports.changePassword = async (req, res) => {
    try {

        const id = req.params.id;
        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;

        // Hash Password
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(newPassword, salt);

        getUser = () => {
            return new Promise((resolve, reject) => {
                pool.query(`SELECT *  FROM users WHERE id = '${id}'`, (error, elements) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(elements);
                });
            });
        }

        const getUserDetail = await getUser();

        if (getUserDetail.length == 0) {

            res.status(404).send({
                msg: 'USER NOT FOUND!',
                status: 404
            });

        } else {

            updatePassword = () => {
                return new Promise((resolve, reject) => {
                    pool.query(`UPDATE users SET password = '${hash}' WHERE id = '${id}'`, (error, elements) => {
                        if (error) {
                            return reject(error);
                        }
                        return resolve(elements);
                    });
                });
            }


            if (bcrypt.compareSync(oldPassword, getUserDetail[0]["password"])) {
                const changeNewPass = await updatePassword();
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

    } catch (error) {
        console.log("error", error);
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

        const id = req.params.id;

        getUser = () => {
            return new Promise((resolve, reject) => {
                pool.query(`SELECT *  FROM users WHERE id = '${id}'`, (error, elements) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(elements);
                });
            });
        }

        const getUserDetail = await getUser();

        if (getUserDetail.length == 0) {

            res.status(404).send({
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
                to: `${getUserDetail[0].email}`,
                subject: 'Reset Password Link',
                html: `
                    <html>
                    <body> 
                    <h4> Hello ${getUserDetail[0].name},</h4>

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

        const id = req.params.id;
        const newPassword = req.body.newPassword

        // Hash Password
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(newPassword, salt);

        getUser = () => {
            return new Promise((resolve, reject) => {
                pool.query(`SELECT *  FROM users WHERE id = '${id}'`, (error, elements) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(elements);
                });
            });
        }

        const getUserDetail = await getUser();

        if (getUserDetail.length == 0) {

            res.status(404).send({
                msg: 'USER NOT FOUND!',
                status: 404
            });

        } else {

            updatePassword = () => {
                return new Promise((resolve, reject) => {
                    pool.query(`UPDATE users SET password = '${hash}' WHERE id = '${id}'`, (error, elements) => {
                        if (error) {
                            return reject(error);
                        }
                        return resolve(elements);
                    });
                });
            }

            const updatePasswordOfUser = await updatePassword();
            res.status(201).json({
                message: "USER PASSWORD UPDATE SUCCESSFULLY",
                status: 201
            })

        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        })
    }
};

/* ----- End Update Password  API ----- */
