const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const pool = require("./config/pool");

function initialize(passport) {
    const authenticateUser = (email, password, done) => {
        var getUserSql = `SELECT * FROM reviewers WHERE reviewer_email='${email}'`
        console.log(getUserSql);
        pool.query(getUserSql, async(err, result) => {
            if (err) {
                console.error(err);
                res.status(400).send(err);
            }
            console.log(result[0]);
            if (result.length == 0) {
                console.log("Email Not Registered");
                return done(null, false, {
                    message: "Email Not Registered"
                })
            }
            if (await bcrypt.compare(password, result[0].reviewer_password)) {
                console.log(result[0]);
                return done(null, result[0]);
            } else {

                console.log("Password incorrect");

                return done(null, false, { message: 'Password incorrect' })
            }
        });

    }
    passport.use(new LocalStrategy({ usernameField: 'email' },
        authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        var sql = "SELECT * FROM reviewers where id = " + id;
        pool.query(sql, (err, result) => {
            done(err, result[0]);
        });

    })
}

module.exports = initialize