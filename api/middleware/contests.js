const express = require('express');
const config = require('../config');
const router = express.Router();

const BadRequestException = require('../exceptions/bad_request_exception');
const data_types_helper = require('../helpers/data_types');
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

router.post('/contests/submit/:id', async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        if (!req.params.hasOwnProperty('id')) {
            throw BadRequestException('The contest id must be included as a request parameter');
        }
        data_types_helper.validate_data_types(req.body, {
            submission: 'string',
            language: 'string'
        });
        const current_date = new Date();
        const contests = await db.query(
            'select id from contests where id = ? and start_date < ? and end_date > ?',
            [req.params.id, current_date, current_date]
        );
        if (contests.length < 1) {
            throw BadRequestException('Could not find a contest with the specified id');
        }

        const contest = contests[0];
        const test_cases = await db.query(
            'select input, output from test_cases where contest_id = ?',
            [contest.id]
        );

        for (const test_case of test_cases) {
            const execution_response = await fetch(config.piston_url + '/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    language: req.body.language,
                    version: '*',
                    stdin: test_case.input,
                    files: [{ content: req.body.submission }]
                })
            });
            if (execution_response.status >= 400) {
                console.error(await execution_response.json());
                return res.status(500).send();
            }
            const execution_result = await execution_response.json();
            if (!execution_result.hasOwnProperty('run')) {
                return res.status(200).json({ passed: false });
            }
            if (execution_result.run.stdout.trim() !== test_case.output) {
                console.log(test_case.output);
                return res.status(200).json({ passed: false });
            }
        }

        return res.status(200).json({ passed: true });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
