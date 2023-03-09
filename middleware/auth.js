const jwt = require("jsonwebtoken");
const mysql = require("mysql");
require("dotenv").config();

const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: "",
    database: process.env.DB_NAME,
});


exports.verify = async (req, res, next) => {
    const token = req.headers['authorization']

    console.log(token);

    if (token) {
        pool.getConnection((err, connection) => {
            if (err) throw err; //not connected!

            const decoded = jwt.verify(token, process.env.JWT_SCREAT_KEY);
            console.log("decoded", decoded.id);
            // user the connection
            connection.query(`SELECT * FROM  users WHERE id = ${decoded.id}` , (err, rows) => {
                //when done with the connection, release it
                connection.release();
                if (token == rows[0].token) {
                    req.user = rows[0]
                    next();
                }
                else {
                    res.status(401).json({
                        msg: "UNAUTHORIZED USER",
                        status: 401
                    })
                }
            });
        });
    } else {
        res.status(403).json({
            msg: "FORBIDDEN",
            status: 403
        })
    }
}