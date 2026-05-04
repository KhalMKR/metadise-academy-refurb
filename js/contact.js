// ===================== EMAILJS CONTACT FORM =====================

// Replace these with your own EmailJS details
const EMAILJS_PUBLIC_KEY = "qiqtaanf3jc7RpACs";
const EMAILJS_SERVICE_ID = "service_1cgcrv7";
const EMAILJS_TEMPLATE_ID = "template_s42t3f8";

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

    emailjs
      .sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, contactForm)
      .then(() => {
        formStatus.textContent = "Your message has been sent successfully.";
        formStatus.classList.add("success");

        contactForm.reset();
      })
      .catch((error) => {
        console.error("EmailJS Error:", error);

        formStatus.textContent =
          "Failed to send message. Please try again or email us directly.";
        formStatus.classList.add("error");
      })
      .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = "Send Message";
      });
  });
}