import * as auth from '/helpers/auth.js';
import * as http from '/helpers/http.js';

(async () => {
    const user = await auth.get_user();
    if (user === null) {
        return location.replace('/');
    }

    const url_params = new URLSearchParams(location.search);
    if (!url_params.has('id')) {
        return location.replace('/');
    }
    const contest_id = url_params.get('id');
    const contest_res = await http.post(`/contests/get/${contest_id}`);
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

    const submissions = contest_json.submissions;
    const submissions_area = document.getElementById('submissions_area');
    submissions.forEach((s) => {
        const submission_span = document.createElement('span');
        submission_span.innerText = `${s.username} - ${s.language} - ${new Date(
            s.date
        ).toUTCString()}`;
        submissions_area.appendChild(submission_span);
        if (user.is_staff) {
            submission_span.innerText += ' - ';
            const delete_link = document.createElement('a');
            delete_link.innerText = 'delete';
            delete_link.setAttribute('href', `#`);
            delete_link.addEventListener('click', async () => {
                if (!confirm('Are you sure you want to delete this submission?')) {
                    return;
                }
                await http.post(`/admin/delete_submission/${contest.id}/${s.user_id}`);
                location.reload();
            });
            submission_span.appendChild(delete_link);
        }
        submissions_area.appendChild(document.createElement('br'));
    });

    const languages_select = document.getElementById('submission_language');
    const submission_area = document.getElementById('submission');
    const submission_button = document.getElementById('submit');
    if (new Date(contest.end_date) < new Date()) {
        submission_area.setAttribute('hidden', '');
        languages_select.setAttribute('hidden', '');
        submission_button.setAttribute('hidden', '');
        return;
    }

    const languages_req = await http.post('/contests/get_languages');
    if (languages_req.status >= 400) {
        alert('An error has occurred while loading the languages, please try again later');
        return location.replace('/');
    }
    const languages = await languages_req.json();
    const languages_arr = [];
    languages.forEach((language) => {
        const language_option = document.createElement('option');
        language_option.innerText = language.language;
        languages_select.appendChild(language_option);
        languages_arr.push(language.language);
    });

    submission_button.addEventListener('click', async (e) => {
        e.preventDefault();
        submission_button.setAttribute('disabled', 'true');
        const submission_response = await http.post(`/contests/submit/${contest_id}`, {
            submission: submission_area.value,
            language: languages_arr[languages_select.selectedIndex]
        });
        submission_button.removeAttribute('disabled');
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
