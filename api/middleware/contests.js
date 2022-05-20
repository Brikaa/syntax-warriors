const express = require('express');
const config = require('../config');
const router = express.Router();

const BadRequestException = require('../exceptions/bad_request_exception');
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

router.post('/contests/get_all', async (req, res, next) => {
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

router.post('/contests/view/:id', async (req, res, next) => {
    try {
        if (!req.params.hasOwnProperty('id')) {
            throw BadRequestException('The contest ID must be provided as a request parameter');
        }
        const contests = await req.app.locals.db.query(
            'select id, name, description, start_date, end_date from contests where id = ? and start_date < ?',
            [req.params.id, new Date()]
        );
        if (contests.length < 1) {
            return res.status(200).json({ contest: null });
        }
        return res.status(200).json({ contest: contests[0] });
    } catch (e) {
        next(e);
    }
});

router.post('/contests/get_languages', async (req, res, next) => {
    try {
        const languages_res = await fetch(config.piston_url + '/runtimes');
        if (languages_res.status >= 400) {
            return res.status(500).send();
        }
        const languages = await languages_res.json();
        return res.status(200).json(languages);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
