// --- Utility functions ---
function getProfiles() {
  return JSON.parse(localStorage.getItem('profiles') || '[]');
}
function saveProfiles(profiles) {
  localStorage.setItem('profiles', JSON.stringify(profiles));
}

// --- Validation ---
function showError(inputId, message) {
  document.getElementById(inputId + "Error").textContent = message || "";
}
function validateForm() {
  let valid = true;

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const programmeSel = document.getElementById("programme").value;
  const otherProgramme = document.getElementById("otherProgramme").value.trim();
  const year = document.getElementById("year").value;
  const photo = document.getElementById("photo").value.trim();

  showError("firstName", firstName ? "" : "First name is required.");
  showError("lastName", lastName ? "" : "Last name is required.");
  showError("email", /\S+@\S+\.\S+/.test(email) ? "" : "Valid email required.");
  showError("programme", programmeSel ? "" : "Programme is required.");
  showError("otherProgramme", programmeSel === "other" && !otherProgramme ? "Specify programme." : "");
  showError("year", year ? "" : "Year is required.");
  if (photo && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(photo)) {
    showError("photo", "Must be a valid image URL.");
  } else {
    showError("photo", "");
  }

  // Check duplicates
  const profiles = getProfiles();
  const editIdx = document.getElementById("regForm").getAttribute("data-edit-idx");
  if (profiles.some((p, i) => p.email === email && i != editIdx)) {
    showError("email", "Email already registered.");
    valid = false;
  }

  return document.querySelectorAll(".error").length === 0 ||
         Array.from(document.querySelectorAll(".error")).every(e => !e.textContent);
}

// --- Rendering ---
function renderProfiles(filter = "") {
  const profiles = getProfiles();
  const cards = document.getElementById("cards");
  const summary = document.getElementById("summary");
  cards.innerHTML = "";
  summary.innerHTML = "";

  const lowerFilter = filter.trim().toLowerCase();
  let found = false;

  profiles.forEach((profile, idx) => {
    if (
      lowerFilter &&
      !(
        profile.firstName.toLowerCase().includes(lowerFilter) ||
        profile.lastName.toLowerCase().includes(lowerFilter) ||
        profile.email.toLowerCase().includes(lowerFilter) ||
        profile.programme.toLowerCase().includes(lowerFilter)
      )
    ) return;

    found = true;
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      ${profile.photo ? `<img src="${profile.photo}" alt="Photo of ${profile.firstName}">` : ""}
      <h3>${profile.firstName} ${profile.lastName}</h3>
      <p><strong>Email:</strong> ${profile.email}</p>
      <p><strong>Programme:</strong> ${profile.programme}</p>
      <p><strong>Year:</strong> ${profile.year}</p>
      ${profile.interests ? `<p><strong>Interests:</strong> ${profile.interests}</p>` : ""}
      <button onclick="editProfile(${idx})">Edit</button>
      <button class="remove-btn" onclick="removeProfile(${idx})">Remove</button>
    `;
    cards.appendChild(card);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${profile.firstName} ${profile.lastName}</td>
      <td>${profile.email}</td>
      <td>${profile.programme}</td>
      <td>${profile.year}</td>
      <td>
        <button onclick="editProfile(${idx})">Edit</button>
        <button class="remove-btn" onclick="removeProfile(${idx})">Remove</button>
      </td>
    `;
    summary.appendChild(tr);
  });

  if (!found) {
    cards.innerHTML = "<p>No profiles found.</p>";
  }
}

// --- Profile Management ---
window.removeProfile = function(idx) {
  if (!confirm("Are you sure you want to remove this profile?")) return;
  const profiles = getProfiles();
  profiles.splice(idx, 1);
  saveProfiles(profiles);
  renderProfiles(document.getElementById("search").value);
};

window.editProfile = function(idx) {
  const profiles = getProfiles();
  const profile = profiles[idx];
  document.getElementById("firstName").value = profile.firstName;
  document.getElementById("lastName").value = profile.lastName;
  document.getElementById("email").value = profile.email;
  document.getElementById("programme").value = 
    ["BSc Computer Science","BEng Software Engineering","BSc Information Systems"].includes(profile.programme)
    ? profile.programme : "other";
  document.getElementById("year").value = profile.year;
  document.getElementById("interests").value = profile.interests || "";
  document.getElementById("photo").value = profile.photo || "";

  if (document.getElementById("programme").value === "other") {
    document.getElementById("otherProgrammeContainer").style.display = "";
    document.getElementById("otherProgramme").value = profile.programme;
  } else {
    document.getElementById("otherProgrammeContainer").style.display = "none";
  }

  document.getElementById("regForm").setAttribute("data-edit-idx", idx);
  document.getElementById("submitBtn").textContent = "Update Profile";
  document.getElementById("cancelEdit").style.display = "inline-block";
  document.getElementById("regForm").scrollIntoView({ behavior: "smooth" });
};

// --- Form Submit ---
document.getElementById("regForm").addEventListener("submit", function(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const programmeSel = document.getElementById("programme").value;
  const otherProgramme = document.getElementById("otherProgramme").value.trim();
  const year = document.getElementById("year").value;
  const interests = document.getElementById("interests").value.trim();
  const photo = document.getElementById("photo").value.trim();

  const programme = programmeSel === "other" ? otherProgramme : programmeSel;
  const profile = { firstName, lastName, email, programme, year, interests, photo };

  let profiles = getProfiles();
  const editIdx = this.getAttribute("data-edit-idx");
  if (editIdx) {
    profiles[parseInt(editIdx, 10)] = profile;
    this.removeAttribute("data-edit-idx");
  } else {
    profiles.push(profile);
  }
  saveProfiles(profiles);
  renderProfiles(document.getElementById("search").value);

  this.reset();
  document.getElementById("otherProgrammeContainer").style.display = "none";
  document.getElementById("submitBtn").textContent = "Register";
  document.getElementById("cancelEdit").style.display = "none";
});

// --- Cancel Edit ---
document.getElementById("cancelEdit").addEventListener("click", () => {
  document.getElementById("regForm").reset();
  document.getElementById("regForm").removeAttribute("data-edit-idx");
  document.getElementById("otherProgrammeContainer").style.display = "none";
  document.getElementById("submitBtn").textContent = "Register";
  document.getElementById("cancelEdit").style.display = "none";
});

// --- Programme dropdown toggle ---
document.getElementById("programme").addEventListener("change", function() {
  const otherContainer = document.getElementById("otherProgrammeContainer");
  if (this.value === "other") {
    otherContainer.style.display = "";
    document.getElementById("otherProgramme").setAttribute("required", "required");
  } else {
    otherContainer.style.display = "none";
    document.getElementById("otherProgramme").removeAttribute("required");
  }
});

// --- Search ---
document.getElementById("search").addEventListener("input", function() {
  renderProfiles(this.value);
});

// --- On load ---
window.addEventListener("DOMContentLoaded", () => {
  renderProfiles();
});
