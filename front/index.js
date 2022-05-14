import * as auth from '/helpers/auth.js';

(async () => {
    if (await auth.is_authorized()) {
        location.replace('/contests');
        return;
    }
    location.replace('/signup');
})();
