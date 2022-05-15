import * as auth from '/helpers/auth.js';

(async () => {
    const user = await auth.get_user();
    if (user === null) {
        return location.replace('/signup');
    }
    document.getElementById('logout').addEventListener('click', () => {
        localStorage.removeItem('auth-token');
        location.reload();
    });
    document.getElementById('username').innerHTML = `logged in as ${user.username}`;
})();
