import * as http from '/helpers/http.js';

(async () => {
    const url_params = new URLSearchParams(window.location.search);
    if (!url_params.has('id')) {
        return location.replace('/');
    }
    const contest_id = url_params.get('id');
    const contest_res = await http.post(`/contests/${contest_id}`);
    if (contest_res.status >= 400) {
        return location.replace('/');
    }
    const contest_json = await contest_res.json();
    const contest = contest_json.contest;
    if (contest === null) {
        return location.replace('/');
    }
    document.getElementById('contest_name').innerText = contest.name;
    document.getElementById('end_date').innerText = `End date: ${new Date(contest.end_date).toUTCString()}`;
    document.getElementById('contest_description').innerText = contest.description;
})();
