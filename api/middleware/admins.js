const express = require('express');
const router = express.Router();

const users_helper = require('../helpers/users');
const BadRequestException = require('../exceptions/bad_request_exception');
const contests_helper = require('../helpers/contests');

router.use(async (req, res, next) => {
    try {
        const is_staff = await users_helper.is_user_admin(req.app.locals.db, req.body);
        if (!is_staff) {
            return res.status(403).send();
        }
        next();
    } catch (e) {
        next(e);
    }
});

router.post('/create_contest', async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const { name, description, start_date, end_date, test_cases } =
            contests_helper.validate_and_filter_contest_info(req.body);
        const contest_packet = await db.query(
            'insert into contests (name, description, start_date, end_date) values (?, ?, ?, ?)',
            [name, description, start_date, end_date]
        );

        const test_cases_2d = test_cases.map((i) => [i.input, i.output, contest_packet.insertId]);
        const test_cases_query_values = test_cases.map((i, index) => `(${index}, ?)`);
        await db.query(
            `insert into test_cases (id, input, output, contest_id) values ${test_cases_query_values.join(
                ', '
            )}`,
            test_cases_2d
        );

        return res.status(200).send();
    } catch (e) {
        next(e);
    }
});

router.post('/get_contests', async (req, res, next) => {
    try {
        const contests = await req.app.locals.db.query('select id, name from contests');
        return res.status(200).json(contests);
    } catch (e) {
        next(e);
    }
});

router.post('/get_contest/:id', async (req, res, next) => {
    try {
        if (!req.params.hasOwnProperty('id')) {
            throw BadRequestException('A contest id must be provided in the request parameters');
        }
        const db = req.app.locals.db;
        const contests = await db.query(
            'select id, name, description, start_date, end_date from contests where id = ?',
            [req.params.id]
        );
        if (contests.length < 1) {
            return res.status(200).send({
                contest: null,
                test_cases: null
            });
        }
        const contest = contests[0];
        const test_cases = await db.query(
            'select input, output from test_cases where contest_id = ?',
            [contest.id]
        );
        return res.status(200).send({
            contest,
            test_cases
        });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
