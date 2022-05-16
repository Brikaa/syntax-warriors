import * as auth from '/helpers/auth.js';

(async () => {
    const user = await auth.get_user();
    if (user === null) {
        return location.replace('/');
    }
    const user_elements = {
        form: document.getElementById('profile'),
        username: document.getElementById('username'),
        email: document.getElementById('email'),
        password: document.getElementById('password'),
        no_wins: document.getElementById('no_wins'),
        score: document.getElementById('score'),
        error: document.getElementById('error')
    };
    user_elements.username.value = user.username;
    user_elements.email.value = user.email;
    user_elements.no_wins.innerHTML = user.no_wins;
    user_elements.score.innerHTML = user.score;

    document.getElementById('submit').addEventListener('click', async (e) => {
        e.preventDefault();
        const new_username = user_elements.username.value;
        const new_email = user_elements.email.value;
        const new_password = user_elements.password.value;
        const what_to_update = { new_username, new_email, new_password };
        if (new_username === user.username) {
            delete what_to_update.new_username;
        }
        if (new_email === user.email) {
            delete what_to_update.new_email;
        }
        if (new_password === '') {
            delete what_to_update.new_password;
        }
        const response = await auth.update_user(what_to_update);
        if (response.status === 400) {
            user_elements.error.innerHTML = await response.text();
            return;
        }
        if (response.status >= 400) {
            user_elements.error.innerHTML = 'Internal server error'
            return;
        }
        auth.update_auth(what_to_update);
        location.reload();
    });
})();
