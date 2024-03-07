document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.querySelector(".login-form-container form");
  const emailInput = document.querySelector(
    '.login-form-container input[type="email"]'
  );
  const passwordInput = document.querySelector(
    '.login-form-container input[type="password"]'
  );
  // const rememberMeCheckbox = document.querySelector('#remember-me');
  const signInButton = document.querySelector(".login-form-container .btn");
  // const forgotPasswordLink = document.querySelector('.login-form-container p:first-child a');

  // Replace this with your actual authentication logic
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;
    // const rememberMe = rememberMeCheckbox.checked;

    // Perform user authentication here
    // You can make an API request to your server to verify the credentials

    // Example:
    fetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Authentication successful, redirect to the user's dashboard or home page
          window.location.href = "/"; // Change to your desired destination
        } else {
          // Authentication failed, display an error message
          alert("Authentication failed. Please check your credentials.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(
          "An error occurred while trying to sign in. Please try again later."
        );
      });
  });

  // Handle the "Forgot Password" link click event
  // forgotPasswordLink.addEventListener('click', function (e) {
  //     e.preventDefault();

  // Implement your forgot password functionality here
  // You can redirect the user to a "Forgot Password" page
  // or display a modal for password recovery, for example.
  // });

  // window.onclick = function(event) {
  //     if (!event.target.matches('.fa-user')) {
  //         var dropdowns = document.getElementById("account-options");
  //         if (dropdowns.style.display === 'block') {
  //             dropdowns.style.display = 'none';
  //         }
  //     }
  // }

  document
    .getElementById("logoutButton")
    .addEventListener("click", function () {
      // Send a request to the server to clear the session
      fetch("/auth/logout", {
        method: "POST",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Logout successful, redirect to index.html
            window.location.href = "/";
          } else {
            // Handle any errors or display a message to the user
            // You can add this logic here
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
});
