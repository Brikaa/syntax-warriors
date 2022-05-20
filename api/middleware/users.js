const express = require('express');
const router = express.Router();

const users_helper = require('../helpers/users');

router.post('/get_user', async (req, res, next) => {
    try {
        return res
            .status(200)
            .json({ user: await users_helper.get_user(req.app.locals.db, req.body) });
    } catch (e) {
        next(e);
    }
});

router.post('/signup', async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        users_helper.validate_user_info(req.body);
        await users_helper.check_same_user(db, req.body.username, req.body.email);
        const { username, email, password } = req.body;
        await db.query('insert into users (email, username, password) values (?, ?, ?)', [
            email,
            username,
            password
        ]);
        return res.status(200).send();
    } catch (e) {
        next(e);
    }
});

router.post('/update_user', async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const user = await users_helper.get_user(db, req.body);
        if (user === null) {
            return res.status(403).send();
        }

        let contains_password = true;
        let contains_email = true;
        let contains_username = true;
        if (!req.body.hasOwnProperty('new_password')) {
            contains_password = false;
            req.body.new_password = 'random placeholder';
        }
        if (!req.body.hasOwnProperty('new_username')) {
            contains_username = false;
            req.body.new_username = user.username;
        }
        if (!req.body.hasOwnProperty('new_email')) {
            contains_email = false;
            req.body.new_email = user.email;
        }

        if (!contains_username && !contains_email && !contains_password) {
            return res.status(200).send();
        }

        const { new_username, new_password, new_email } = req.body;
        users_helper.validate_user_info({
            username: new_username,
            email: new_email,
            password: new_password
        });
        if (contains_username || contains_email) {
            await users_helper.check_same_user(
                db,
                contains_username ? new_username : undefined,
                contains_email ? new_email : undefined
            );
        }

        let set_clause = [];
        let set_parameters = [];
        if (contains_username) {
            set_clause.push('username = ?');
            set_parameters.push(new_username);
        }
        if (contains_email) {
            set_clause.push('email = ?');
            set_parameters.push(new_email);
        }
        if (contains_password) {
            set_clause.push('password = ?');
            set_parameters.push(new_password);
        }
        await db.query(`update users set ${set_clause.join(', ')} where id = ?`, [
            ...set_parameters,
            user.id
        ]);

        return res.status(200).send();
    } catch (e) {
        next(e);
    }
});

module.exports = router;
