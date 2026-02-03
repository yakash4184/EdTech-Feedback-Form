const teachers = [
  {
    name: "Mrs. Anjali Sharma",
    photo: "../assets/teachers/t1.jpg"
  },
  {
    name: "Mr. Rahul Verma",
    photo: "../assets/teachers/t2.jpg"
  }
];

let current = 0;

const teacherPhoto = document.getElementById("teacherPhoto");
const teacherName = document.getElementById("teacherName");

const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const skipBtn = document.getElementById("skipTeacherBtn");
const form = document.getElementById("feedbackForm");

/* 🔁 Load teacher */
function loadTeacher() {
  const t = teachers[current];
  teacherPhoto.src = t.photo;
  teacherName.innerText = t.name;

  form.reset();

  if (current === teachers.length - 1) {
    nextBtn.style.display = "none";
    submitBtn.style.display = "inline-block";
  } else {
    nextBtn.style.display = "inline-block";
    submitBtn.style.display = "none";
  }
}

/* ➡ Next Teacher */
nextBtn.addEventListener("click", () => {
  if (current < teachers.length - 1) {
    submitToGoogleForm(false);
    current++;
    loadTeacher();
  }
});

/* ⏭ Skip Teacher */
skipBtn.addEventListener("click", () => {
  if (current < teachers.length - 1) {
    current++;
    loadTeacher();
  } else {
    alert("No more teachers left.");
  }
});

/* ✅ Final Submit */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  submitToGoogleForm(false);
  alert("All Teachers Feedback Submitted Successfully!");
});

/* 🔗 GOOGLE FORM SUBMISSION */
function submitToGoogleForm(skipped) {
  const t = teachers[current];

  const googleFormURL =
    "https://docs.google.com/forms/d/e/1FAIpQLSf5nwZnYLhpkd3euTwvkPRFKh144iv3m8QuScpCc00Nzh9paA/formResponse";

  const data = new URLSearchParams();

  /* 👨‍🎓 Student Info */
  data.append(
    "entry.1595149144",
    document.getElementById("studentName").value
  );
  data.append(
    "entry.444093797",
    document.getElementById("studentClass").value
  );
  data.append(
    "entry.253041247",
    document.getElementById("studentSection").value
  );

  /* 👩‍🏫 Teacher Name */
  data.append(
    "entry.1611097108",
    t.name
  );

  /* ⭐ Ratings */
  data.append(
    "entry.1604027573",
    document.querySelector('input[name="rating"]:checked')?.value || ""
  );
  data.append(
    "entry.373365873",
    document.querySelector('input[name="clarity"]:checked')?.value || ""
  );
  data.append(
    "entry.1707014077",
    document.querySelector('input[name="behaviour"]:checked')?.value || ""
  );

  /* 📝 Feedback */
  data.append(
    "entry.1476556732",
    document.getElementById("comments").value
  );

  fetch(googleFormURL, {
    method: "POST",
    mode: "no-cors",
    body: data
  });
}

/* 🚀 Start */
loadTeacher();
