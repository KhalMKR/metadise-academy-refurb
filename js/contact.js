// js/contact.js

const EMAILJS_PUBLIC_KEY = "ZTZb8l20VNt7xy64w";
const EMAILJS_SERVICE_ID = "service_47n1mgb";
const EMAILJS_TEMPLATE_ID = "template_4dkuyfm";

emailjs.init({
  publicKey: EMAILJS_PUBLIC_KEY,
});

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (contactForm) {
  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const submitButton = contactForm.querySelector(".contact-submit");

    formStatus.textContent = "";
    formStatus.className = "form-status";

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    // Extract form data manually into an object
    const templateParams = {
      from_name: document.getElementById("name").value,
      from_email: document.getElementById("email").value,
      phone_number: document.getElementById("phone").value,
      course: document.getElementById("course").value,
      message: document.getElementById("message").value,
    };

    // Use send() instead of sendForm()
    emailjs
      .send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      )
      .then(() => {
        formStatus.textContent = "Your message has been sent successfully.";
        formStatus.classList.add("success");
        contactForm.reset();
      })
      .catch((error) => {
        console.error("Full Error Object:", error);
        formStatus.textContent = "Failed to send message: " + error.text;
        formStatus.classList.add("error");
      })
      .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = "Send Message";
      });
  });
}