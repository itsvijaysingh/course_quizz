// Global object to hold selected answers for each quiz step
const quizAnswers = {};

document.addEventListener("DOMContentLoaded", () => {
  // ✅ Open the quiz from any element with the class "quiz-launch-link"
  document.querySelectorAll(".quiz-launch-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("quizModal1").style.display = "flex";
      // GTM Event: Fires when the user starts the quiz
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "course_fit_quiz_start",
      });
    });
  });

  // Handle Next button logic and save answers
  document.querySelectorAll(".next-btn").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();

      const currentId = this.getAttribute("data-current");
      const nextId = this.getAttribute("data-next");

      const currentModal = document.getElementById(currentId);
      const nextModal = document.getElementById(nextId);

      const selected = currentModal.querySelector('input[type="radio"]:checked');
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
      closeAllModals();
    });
  });

  // Handle final form submission
  document.getElementById("Course-Fit-Quiz").addEventListener("submit", function (e) {
    e.preventDefault();
    console.log("QUIZ ANSWERS: ", quizAnswers);

    if (quizModal9) quizModal9.style.display = "none";
    if (quizModal10) quizModal10.style.display = "flex";

    $.ajax({
      url: 'https://vickyknowsapi.com/api/v1/contact/websitequiz',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        question1Option: quizAnswers.quizModal1 || '',
        question2Option: quizAnswers.quizModal2 || '',
        question3Option: quizAnswers.quizModal3 || '',
        question4Option: quizAnswers.quizModal4 || ''
      }),
      dataType: 'json',
      success: function (response) {
        console.log('Success: ', response.records);
        const source = document.getElementById("videoSource");
        source.src = response.records[0].videoUrl;

        // Reload the video to apply the new src
        document.getElementById("myVideo").load();
        document.getElementById("rpTitle").textContent = response.records[0].rpTitle;
        document.getElementById("application").innerHTML  = response.records[0].application;
        document.getElementById("lessonName").textContent = response.records[0].lessonName;
        document.getElementById("oneliner").textContent = response.records[0].oneLiner;

        const courseName = response.records[0].course;
        document.getElementById("courseName").textContent = courseName;
        const courseId = response.records[0].courseId;
        const newHref = `https://platform.bloomster.com/signup?enrollCourseId=${courseId}/website`;
        document.getElementById("enrollLink").href = newHref;
        createContact(e, courseName);
      },
      error: function (xhr, status, error) {
        console.error('Error:', status, error);
        console.error('Response Text:', xhr.responseText);
      }
    });


  });
});

// Optional: Close all modals helper
function closeAllModals() {
  document.querySelectorAll('.quiz-modal').forEach(modal => {
    modal.style.display = 'none';
  });
}
function createContact(e, courseName) {
    console.log('Create Contact');
    const form = e.target;

    const fields = [
        { name: 'firstname', value: form.querySelector('[name="firstname"]').value },
        { name: 'lastname', value: form.querySelector('[name="lastname"]').value },
        { name: 'email', value: form.querySelector('[name="email"]').value },
        { name: 'contact_status', value: form.querySelector('[name="contact_status"]').value },
        { name: 'cfq_q1_resp', value: quizAnswers.quizModal1 },
        { name: 'cfq_q2_resp', value: quizAnswers.quizModal2 },
        { name: 'cfq_q3_resp', value: quizAnswers.quizModal3 },
        { name: 'cfq_q4_resp', value: quizAnswers.quizModal4 },
        { name: 'cfq_q5_resp', value: quizAnswers.quizModal5 },
        { name: 'cfq_q6_resp', value: quizAnswers.quizModal6 },
        { name: 'cfq_q7_resp', value: quizAnswers.quizModal7 },
        { name: 'cfq_q8_resp', value: quizAnswers.quizModal8 },
        { name: 'course_name', value: courseName }
    ];

    const payload = {
        fields: fields,
        context: {
            pageUri: window.location.href,
            pageName: document.title
        }
    };

    console.log('payload => ' + JSON.stringify(payload));
    fetch('https://api.hsforms.com/submissions/v3/integration/submit/44742474/e0c8ddda-f83a-4e70-9896-0862d2a7827d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(response => {
        console.log('submission resp : ' + response);
        if (response.ok) {
            // Capture all form values
            const userFirstname = form.querySelector('[name="firstname"]').value;
            const userLastname = form.querySelector('[name="lastname"]').value;
            const userEmail = form.querySelector('[name="email"]').value;

            // GTM Event: Push the event ONCE with all data.
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: "course_fit_quiz_submission",
                user_firstname: userFirstname,
                user_lastname: userLastname,
                user_email: userEmail,
                quiz_course_recommended: courseName
            });

            form.reset();
          //closeAllModals();
        } else {
            alert("Submission failed. Please try again.");
        }
    }).catch(error => {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
    });
}
