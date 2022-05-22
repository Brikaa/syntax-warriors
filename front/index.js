import * as http from '/helpers/http.js';
import * as auth from '/helpers/auth.js';

(async () => {
    const user = await auth.get_user();
    if (user === null) {
        return location.replace('/signup');
    }
    document.getElementById('signout').addEventListener('click', () => {
        auth.sign_out();
        location.reload();
    });
    document.getElementById('username').innerText = `Signed in as ${user.username}`;
    if (!!user.is_staff) {
        document.getElementById('admin').removeAttribute('hidden');
    }

    const active_contests_area = document.getElementById('active_contests');
    const past_contests_area = document.getElementById('past_contests');

    const contests_res = await http.post('/contests/get_all');
    if (contests_res.status >= 400) {
        active_contests_area.innerText = 'An error has occurred';
    }

    const contests = await contests_res.json();
    const current_date = new Date();
    contests.forEach((contest) => {
        const contest_link = document.createElement('a');
        contest_link.setAttribute('href', `/contests?id=${contest.id}`);
        contest_link.innerText = contest.name;
        const target_area =
            new Date(contest.end_date) < current_date
                ? past_contests_area
                : active_contests_area;
        target_area.appendChild(contest_link);
        target_area.appendChild(document.createElement('br'));
        const end_date = document.createElement('a');
        end_date.innerText = `Ends on ${new Date(contest.end_date).toUTCString()}`;
        target_area.appendChild(end_date);
        target_area.appendChild(document.createElement('br'));
        target_area.appendChild(document.createElement('br'));
    });
})();
