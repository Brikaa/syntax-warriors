const express = require('express');
const config = require('../config');
const router = express.Router();

const BadRequestException = require('../exceptions/bad_request_exception');
const data_types_helper = require('../helpers/data_types');
const users_helper = require('../helpers/users');

router.use(async (req, res, next) => {
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

router.post('/get_all', async (req, res, next) => {
    try {
        const contests = await req.app.locals.db.query(
            'select id, name, end_date, count(contest_submissions.user_id) as total_participation\
            from contests\
            left join contest_submissions on contests.id = contest_submissions.contest_id\
            where start_date < ?\
            group by contests.id order by count(contest_submissions.user_id) desc',
            [new Date()]
        );
        return res.status(200).json(contests);
    } catch (e) {
        next(e);
    }
});

router.post('/get/:id', async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const contests = await db.query(
            'select id, name, description, start_date, end_date from contests where id = ? and start_date < ?',
            [req.params.id, new Date()]
        );
        if (contests.length < 1) {
            return res.status(200).json({ contest: null });
        }
        const contest = contests[0];

        const submissions = await db.query(
            'select user_id, users.username, language, date\
            from contest_submissions, users where contest_id = ? and users.id = user_id\
            order by date asc',
            [contest.id]
        );

        return res.status(200).json({ contest, submissions });
    } catch (e) {
        next(e);
    }
});

router.post('/get_languages', async (req, res, next) => {
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

router.post('/submit/:id', async (req, res, next) => {
    try {
        const db = req.app.locals.db;
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
            throw new BadRequestException('Could not find an active contest with the specified id');
        }

        const contest = contests[0];
        const user = await users_helper.get_user(db, req.body);
        if (user === null) {
            return res.status(500).send();
        }

        const submissions = await db.query(
            'select user_id from contest_submissions where user_id = ? and contest_id = ?',
            [user.id, contest.id]
        );
        if (submissions.length > 0) {
            throw new BadRequestException('You already have a submission in this contest');
        }

        const test_cases = await db.query(
            'select input, output from test_cases where contest_id = ?',
            [contest.id]
        );

        const timeout = (ms) => new Promise((res) => setTimeout(res, ms));
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
                return res.status(200).json({ passed: false });
            }
            await timeout(200);
        }

        await db.query(
            'insert into contest_submissions (user_id, contest_id, language, submission, date) values (?, ?, ?, ?, ?)',
            [user.id, contest.id, req.body.language, req.body.submission, current_date]
        );

        return res.status(200).json({ passed: true });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
