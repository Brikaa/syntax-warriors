import * as auth from '/helpers/auth.js';

(async () => {
    if (await auth.is_authorized()) {
        return;
    }
    location.replace('/signup');
})();
