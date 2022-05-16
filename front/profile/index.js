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
        score: document.getElementById('score')
    };
    user_elements.username.value = user.username;
    user_elements.email.value = user.email;
    user_elements.no_wins.innerHTML = user.no_wins;
    user_elements.score.innerHTML = user.score;

    document.getElementById('submit').addEventListener('click', (e) => {
        e.preventDefault();
        const new_username = user_elements.username.value;
        const new_email = user_elements.email.value;
        const new_password = user_elements.password.value;
    });
})();
