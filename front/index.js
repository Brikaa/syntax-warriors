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

    const contests_area = document.getElementById('contests');

    const contests_res = await http.post('/contests/get_all');
    if (contests_res.status >= 400) {
        contests_area.innerHTML = 'An error has occurred';
    }
    const contests = await contests_res.json();
    contests.forEach((contest) => {
        const contest_link = document.createElement('a');
        contest_link.setAttribute('href', `/contests?id=${contest.id}`);
        contest_link.innerHTML = contest.name;
        contests_area.appendChild(contest_link);
        const end_date = document.createElement('a');
        end_date.innerHTML = ` - ends on ${(new Date(contest.end_date)).toUTCString()}`;
        contests_area.appendChild(end_date);
        contests_area.appendChild(document.createElement('br'));
    });
})();
