import * as auth from '/helpers/auth.js';
import * as http from '/helpers/http.js';

(async () => {
    const is_authorized = await auth.is_authorized();
    if (!is_authorized) {
        return location.replace('/');
    }

    const url_params = new URLSearchParams(window.location.search);
    if (!url_params.has('id')) {
        return location.replace('/');
    }
    const contest_id = url_params.get('id');
    const contest_res = await http.post(`/contests/view/${contest_id}`);
    if (contest_res.status >= 400) {
        return location.replace('/');
    }
    const contest_json = await contest_res.json();
    const contest = contest_json.contest;
    if (contest === null) {
        return location.replace('/');
    }

    document.getElementById('contest_name').innerText = contest.name;
    document.getElementById('end_date').innerText = `Ends on ${new Date(
        contest.end_date
    ).toUTCString()}`;
    document.getElementById('contest_description').innerText = contest.description;

    const languages_req = await http.post('/contests/get_languages');
    if (languages_req.status >= 400) {
        alert('An error has occurred while loading the languages, please try again later');
        return location.replace('/');
    }
    const languages_select = document.getElementById('submission_language');
    const languages = await languages_req.json();
    const languages_arr = [];
    languages.forEach((language) => {
        const language_option = document.createElement('option');
        language_option.innerText = language.language;
        languages_select.appendChild(language_option);
        languages_arr.push(language.language);
    });

    const submissions = contest_json.submissions;
    const submissions_area = document.getElementById('submissions_area');
    submissions.forEach(s => {
        const submission_span = document.createElement('span');
        submission_span.innerText = `${s.username} - ${s.language} - ${(new Date(s.date)).toUTCString()}`
        submissions_area.appendChild(submission_span);
        submissions_area.appendChild(document.createElement('br'));
    });

    const submission_area = document.getElementById('submission');
    document.getElementById('submit').addEventListener('click', async (e) => {
        e.preventDefault();
        const submission_response = await http.post(`/contests/submit/${contest_id}`, {
            submission: submission_area.value,
            language: languages_arr[languages_select.selectedIndex]
        });
        if (submission_response.status === 400) {
            const error = await submission_response.text();
            return alert(error);
        }
        if (submission_response.status >= 400) {
            return alert('An error has occurred');
        }
        const submission_result_json = await submission_response.json();
        const passed = submission_result_json.passed;
        if (passed) {
            alert('Congratulations! You solved the contest.');
            location.reload();
        } else {
            alert('Invalid solution');
        }
    });
})();
