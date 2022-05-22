const express = require('express');
const router = express.Router();

const users_helper = require('../helpers/users');
const data_types_helper = require('../helpers/data_types');
const BadRequestException = require('../exceptions/bad_request_exception');

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

        data_types_helper.validate_data_types(req.body, {
            name: 'string',
            description: 'string',
            start_date: 'date',
            end_date: 'date',
            test_cases: 'array'
        });

        const { name, description, start_date, end_date, test_cases } = req.body;

        if (name === '') {
            throw new BadRequestException('The contest name can not be empty');
        }

        const start_date_with_dt = new Date(start_date);
        const end_date_with_dt = new Date(end_date);

        if (start_date_with_dt >= end_date_with_dt) {
            throw new BadRequestException('The start date must be before the end date');
        }

        const contests_query_values = [name, description, start_date_with_dt, end_date_with_dt];

        const filtered_test_cases = test_cases.filter(
            (t) => ![undefined, ''].includes(t.input) || ![undefined, ''].includes(t.output)
        );

        if (filtered_test_cases.length < 1) {
            throw new BadRequestException('At least one valid test case must be provided');
        }

        const contest_packet = await db.query(
            'insert into contests (name, description, start_date, end_date) values (?, ?, ?, ?)',
            contests_query_values
        );

        const test_cases_2d = filtered_test_cases.map((i) => [
            i.input,
            i.output,
            contest_packet.insertId
        ]);
        const test_cases_query_values = filtered_test_cases.map((i, index) => `(${index}, ?)`);
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

router.post('/view_contests', async (req, res, next) => {
    try {
        const contests = await req.app.locals.db.query('select id, name from contests');
        return res.status(200).json(contests);
    } catch (e) {
        next(e);
    }
})

module.exports = router;
