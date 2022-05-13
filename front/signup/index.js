(() => {
    const signup_button = document.getElementById("signup_button");
    signup_button.addEventListener("click", signup);
    

    function signup() {
        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;
        let email = document.getElementById("email").value;

    }
})();