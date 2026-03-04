// Functions extracted from inline HTML scripts
export function toggle() {
  const content = document.getElementById('content');
  const popup = document.getElementById('popup');
  content.classList.toggle('active');
  popup.classList.toggle('hidden');
}

export function closePopup() {
  const content = document.getElementById('content');
  const popup = document.getElementById('popup');
  content.classList.remove('active');
  popup.classList.add('hidden');
}

// For testing login handlers
export async function handleSignIn(e, signInUser) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  await signInUser(email, password);
  window.location.href = 'profile.html';
}

export async function handleSignUp(e, signUpUser) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!email || email.includes(" ") || !/^\S+@\S+\.\S+$/.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }
  await signUpUser(email, password);
  window.location.href = 'profile.html';
} 