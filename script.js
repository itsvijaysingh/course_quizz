// Global object to hold selected answers for each quiz step
const quizAnswers = {};

document.addEventListener("DOMContentLoaded", () => {
  // Open the quiz from the link
  const openQuizLink = document.getElementById("openQuizModal");
  if (openQuizLink) {
    openQuizLink.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("quizModal1").style.display = "flex";
      // GTM Event: Fires when the user starts the quiz
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "course_fit_quiz_start",
      });
    });
  }

  // Handle Next button logic and save answers
  document.querySelectorAll(".next-btn").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();

      const currentId = this.getAttribute("data-current");
      const nextId = this.getAttribute("data-next");

      const currentModal = document.getElementById(currentId);
      const nextModal = document.getElementById(nextId);

      const selected = currentModal.querySelector(
        'input[type="radio"]:checked'
      );
      if (!selected) {
        alert("Please select an option before continuing.");
        return;
      }

      // Extract the step number from the modal ID (e.g., "quizModal1" -> 1)
      const stepNumber = parseInt(currentId.replace("quizModal", ""));

      // Save the answer and question for context
      const question =
        currentModal.querySelector(".question")?.textContent?.trim() || "";
      const answer =
        selected.nextElementSibling?.textContent?.trim() || selected.value;
      quizAnswers[currentId] = answer;

      // GTM Event: Fires for each completed step with a dynamic event name
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: `course_fit_quiz_step_${stepNumber}`,
        quiz_question: question,
        quiz_answer: answer,
      });

      currentModal.style.display = "none";
      if (nextModal) nextModal.style.display = "flex";
    });
  });

  // Handle Previous buttons
  document.querySelectorAll(".prev-btn").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();

      const currentId = this.getAttribute("data-current");
      const prevId = this.getAttribute("data-prev");

      const currentModal = document.getElementById(currentId);
      const prevModal = document.getElementById(prevId);

      if (currentModal) currentModal.style.display = "none";
      if (prevModal) prevModal.style.display = "flex";
    });
  });

  // Handle "Back To Home" links to close quiz
  document.querySelectorAll(".close-modal-btn").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelectorAll(".quiz-modal").forEach((modal) => {
        modal.style.display = "none";
      });
    });
  });

 // Handle final form submission
  document.getElementById("Course-Fit-Quiz").addEventListener("submit", function (e) {
    e.preventDefault();
    console.log("QUIZ ANSWERS: ", quizAnswers);
    
    $.ajax({
      url: 'https://vickyknowsapi-dev.link/api/v1/contact/websitequiz',
      method: 'POST',
      contentType: 'application/json', // API expects JSON
      data: JSON.stringify({
        question1Option: quizAnswers.quizModal1 || '',
        question2Option: quizAnswers.quizModal2 || '',
        question3Option: quizAnswers.quizModal3 || '',
        question4Option: quizAnswers.quizModal4 || ''
      }),
      dataType: 'json',
      success: function(response) {
        console.log('Success: ', response);
        //  alert('Subscription successful!');
      },
      error: function(xhr, status, error) {
        console.error('Error:', status, error);
        console.error('Response Text:', xhr.responseText);
        //  alert('Failed to subscribe.');
      }
    });
    
    
    
    
    const form = e.target;
    // Capture all form values
    const userFirstname = form.querySelector('[name="firstname"]').value;
    const userLastname = form.querySelector('[name="lastname"]').value;
    const userEmail = form.querySelector('[name="email"]').value;
  
    // GTM Event: Push all form values to the data layer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "course_fit_quiz_submission",
      user_firstname: userFirstname,
      user_lastname: userLastname,
      user_email: userEmail
    });

    // GTM Event: Fires when the final form is submitted
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "course_fit_quiz_submission",
      user_email: userEmail
    });

    
    const fields = [
      { name: 'firstname', value: form.querySelector('[name="firstname"]').value },
      { name: 'lastname', value: form.querySelector('[name="lastname"]').value },
      { name: 'email', value: form.querySelector('[name="email"]').value },
      { name: 'contact_status', value: form.querySelector('[name="contact_status"]').value }
    ];

    const payload = {
      fields: fields,
      context: {
        pageUri: window.location.href,
        pageName: document.title
      }
    };

    fetch('https://api.hsforms.com/submissions/v3/integration/submit/44742474/e0c8ddda-f83a-4e70-9896-0862d2a7827d', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(response => {
      if (response.ok) {
        //alert("Form submitted successfully!");
        form.reset();
        closeAllModals();
      } else {
        alert("Submission failed. Please try again.");
      }
    }).catch(error => {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    });
  });
});

// Optional: Close all modals helper
function closeAllModals() {
  document.querySelectorAll('.quiz-modal').forEach(modal => {
    modal.style.display = 'none';
  });
}
