// LearnLoop Authentication Logic

document.addEventListener("DOMContentLoaded", () => {
  // 1. Toggle Login and Forgot Password views in login.html
  const triggerForgot = document.getElementById("trigger-forgot");
  const triggerLogin = document.getElementById("trigger-login");
  const loginView = document.getElementById("login-view");
  const forgotView = document.getElementById("forgot-view");

  if (triggerForgot && loginView && forgotView) {
    triggerForgot.addEventListener("click", () => {
      loginView.classList.remove("active");
      setTimeout(() => {
        forgotView.classList.add("active");
      }, 200);
    });
  }

  if (triggerLogin && loginView && forgotView) {
    triggerLogin.addEventListener("click", () => {
      forgotView.classList.remove("active");
      setTimeout(() => {
        loginView.classList.add("active");
      }, 200);
    });
  }

  // 2. Password Strength Meter Logic (for register.html)
  const regPassword = document.getElementById("reg-password");
  const strengthBar = document.getElementById("strength-bar");
  const strengthText = document.getElementById("strength-text");
  
  const hintLen = document.getElementById("hint-len");
  const hintNum = document.getElementById("hint-num");
  const hintSpec = document.getElementById("hint-spec");

  if (regPassword) {
    regPassword.addEventListener("input", () => {
      const val = regPassword.value;
      let score = 0;

      const hasLength = val.length >= 8;
      if (hasLength) {
        score++;
        hintLen.classList.add("valid");
      } else {
        hintLen.classList.remove("valid");
      }

      const hasNumber = /\d/.test(val);
      if (hasNumber) {
        score++;
        hintNum.classList.add("valid");
      } else {
        hintNum.classList.remove("valid");
      }

      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(val);
      if (hasSpecial) {
        score++;
        hintSpec.classList.add("valid");
      } else {
        hintSpec.classList.remove("valid");
      }

      if (val === "") {
        strengthBar.style.width = "0%";
        strengthText.textContent = "Empty";
        strengthText.style.color = "var(--text-muted)";
      } else if (score === 1) {
        strengthBar.style.width = "33%";
        strengthBar.style.backgroundColor = "#ef4444";
        strengthText.textContent = "Weak";
        strengthText.style.color = "#ef4444";
      } else if (score === 2) {
        strengthBar.style.width = "66%";
        strengthBar.style.backgroundColor = "#f59e0b";
        strengthText.textContent = "Medium";
        strengthText.style.color = "#f59e0b";
      } else if (score === 3) {
        strengthBar.style.width = "100%";
        strengthBar.style.backgroundColor = "#10b981";
        strengthText.textContent = "Strong";
        strengthText.style.color = "#10b981";
      }
    });
  }

  // 3. Login Submission Logic
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;
      
      const usersList = db.getData("ll_users");
      
      let foundUser = usersList.find(u => u.email === email);
      
      if (!foundUser) {
        const mockMatch = MOCK_USERS.find(mu => {
          const formattedEmail = mu.name.toLowerCase().replace(" ", "") + "@learnloop.com";
          return formattedEmail === email;
        });
        if (mockMatch) {
          foundUser = mockMatch;
        }
      }

      if (foundUser && (password === "password" || foundUser.password === password || !foundUser.password)) {
        db.setCurrentUser(foundUser);
        showToast(`Welcome back, ${foundUser.name}!`, "success");
        
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect") || "dashboard.html";
        
        setTimeout(() => {
          window.location.href = redirect;
        }, 1000);
      } else {
        showToast("Invalid email or password. Hint: Try registering a new account!", "error");
      }
    });
  }

  // 4. Registration Submission Logic
  const regForm = document.getElementById("register-form");
  if (regForm) {
    regForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = document.getElementById("reg-name").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const password = document.getElementById("reg-password").value;
      
      if (password.length < 8) {
        showToast("Password must be at least 8 characters long.", "error");
        return;
      }
      
      const usersList = db.getData("ll_users");
      if (usersList.some(u => u.email === email)) {
        showToast("Email address already registered.", "error");
        return;
      }
      
      const newUserId = "user-" + Date.now();
      const initials = name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
      const randColor1 = getRandomHexColor();
      const randColor2 = getRandomHexColor();
      const avatarSvg = `<svg viewBox="0 0 100 100" class="avatar-svg"><defs><linearGradient id="av-${newUserId}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${randColor1}" /><stop offset="100%" stop-color="${randColor2}" /></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#av-${newUserId})"/><text x="50" y="58" font-size="28" font-weight="700" fill="#FFF" text-anchor="middle">${initials}</text></svg>`;

      const newUser = {
        id: newUserId,
        name: name,
        headline: "Member at LearnLoop | Ready to barter skills",
        email: email,
        password: password,
        avatar: avatarSvg,
        bio: "Skill exchange learner. Excited to exchange knowledge!",
        location: "Global citizen",
        skillsOffered: [],
        skillsWanted: [],
        rating: 5.0,
        reviewsCount: 0,
        exchangesCompleted: 0,
        badges: ["Active Learner"],
        availability: "Flexible Schedule"
      };
      
      usersList.push(newUser);
      db.saveData("ll_users", usersList);
      
      const notifs = db.getData("ll_notifications");
      notifs.unshift({
        id: "notif-" + Date.now(),
        type: "system",
        text: "🏆 Badge Unlocked: Active Learner! Welcome to LearnLoop.",
        time: "Just now",
        unread: true
      });
      db.saveData("ll_notifications", notifs);
      
      db.setCurrentUser(newUser);
      showToast("Account created successfully! Dashboard loading...", "success");
      
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1200);
    });
  }

  // 5. Forgot Password Logic
  const forgotForm = document.getElementById("forgot-form");
  if (forgotForm) {
    forgotForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("forgot-email").value.trim();
      showToast(`Recovery link sent to ${email}! Check spam folders if not received.`, "success");
      forgotForm.reset();
    });
  }
});

function getRandomHexColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
