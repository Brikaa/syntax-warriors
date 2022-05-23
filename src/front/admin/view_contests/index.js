import * as http from '/helpers/http.js';
import * as auth from '/helpers/auth.js';

(async () => {
    const is_staff = await auth.is_staff();
    if (!is_staff) {
        location.replace('/');
    }
    const contests_res = await http.post('/admin/get_contests');
    if (contests_res.status >= 400) {
        return alert('An error has occurred');
    }

    const contests = await contests_res.json();
    const contests_area = document.getElementById('contests');
    for (const contest of contests) {
        const contest_link = document.createElement('a');
        contest_link.setAttribute('href', `/admin/manage_contest?id=${contest.id}`);
        contest_link.innerText = contest.name;
        const separator = document.createElement('a');
        separator.innerText = ' - ';
        const delete_link = document.createElement('a');
        delete_link.setAttribute('href', `#`);
        delete_link.innerText = 'delete'
        delete_link.addEventListener('click', async () => {
            if (!confirm('Are you sure you want to delete this contest?')) {
                return;
            }
            await http.post(`/admin/delete_contest/${contest.id}`);
            location.reload();
        });
        contests_area.appendChild(contest_link);
        contests_area.appendChild(separator);
        contests_area.appendChild(delete_link);
        contests_area.appendChild(document.createElement('br'));
        contests_area.appendChild(document.createElement('br'));
    }
})();
