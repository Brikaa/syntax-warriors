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
    document.getElementById('username').innerHTML = `Signed in as ${user.username}`;
    if (!!(user.is_staff)) {
        document.getElementById('admin').style.display = 'initial';
    }
})();
