const express = require('express');
const router = express.Router();
const users_helper = require('../helpers/users');

router.use('/contests', async (req, res, next) => {
    try {
        const is_logged_in = users_helper.is_user_logged_in(req.app.locals.db, req.body);
        if (!is_logged_in) {
            return res.status(403).send();
        }
        next();
    } catch (e) {
        next(e);
    }
});

router.use('/contests/get_all', async (req, res, next) => {
    try {
        const contests = await req.app.locals.db.query(
            'select id, name, end_date from contests where start_date < ?',
            [new Date()]
        );
        return res.status(200).json(contests);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
