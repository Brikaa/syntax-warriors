import * as http from '/helpers/http.js';

(async () => {
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
    languages.forEach((language) => {
        const language_option = document.createElement('option');
        language_option.innerText = language.language;
        languages_select.appendChild(language_option);
    });
})();
