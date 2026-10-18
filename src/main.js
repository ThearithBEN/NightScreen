import { createClient } from "@supabase/supabase-js";
import "./style.css";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const movies = [
  { title: "Midnight in Tokyo", genre: "Drama · 2025", art: "tokyo", mark: "東京", note: "A city awake. Two strangers crossing paths." },
  { title: "The Last Signal", genre: "Sci-fi · 2024", art: "signal", mark: "SIGNAL", note: "One transmission. A thousand light-years away." },
  { title: "Velvet Season", genre: "Mystery · 2025", art: "velvet", mark: "VELVET", note: "Some secrets bloom after dark." },
];

const app = document.querySelector("#app");
let currentUser = null;
let busy = false;

function render() {
  app.innerHTML = `
    <header class="topbar"><a class="brand" href="#"><span class="brand-icon">N</span>NIGHTSCREEN</a><span class="top-note">A PRIVATE CINEMA</span><button class="account-button" id="accountAction">${currentUser ? "SIGN OUT" : "MEMBER SIGN IN"}</button></header>
    <main>
      <section class="hero"><div class="hero-grain"></div><div class="hero-copy"><p class="eyebrow"><i></i> YOUR NIGHT. YOUR SCREEN.</p><h1>Stories worth<br><em>staying up for.</em></h1><p class="intro">A little cinema for the hours that belong to you.</p><button class="primary" id="heroAction">${currentUser ? "EXPLORE THE COLLECTION" : "ENTER NIGHTSCREEN"}<span>↗</span></button></div><div class="hero-art"><div class="moon"></div><div class="poster-stamp">AFTER<br><b>HOURS</b><small>VOL. 01 — 2025</small></div><div class="horizon"></div><div class="hero-caption">A PRIVATE VIEWING EXPERIENCE <span>01 / 03</span></div></div><div class="hero-index">NS—001</div></section>
      <section class="collection" id="collection"><div class="section-head"><div><p class="eyebrow">CURATED FOR THE QUIET HOURS</p><h2>The <em>screening room</em></h2></div><span class="collection-count">COLLECTION&nbsp; 001—003</span></div><div class="cards">${movies.map((movie, index) => `<article class="movie-card"><div class="poster ${movie.art}"><span class="poster-number">0${index + 1}</span><span class="poster-mark">${movie.mark}</span><span class="poster-foot">NIGHTSCREEN ORIGINAL</span></div><p class="movie-genre">${movie.genre}</p><h3>${movie.title}</h3><p class="movie-note">${movie.note}</p></article>`).join("")}</div><div class="lock-note"><span>✳</span><p>${currentUser ? `Signed in as ${escapeHtml(currentUser.email)}. Your private screening room is ready.` : "The screening room is reserved for members."}</p><button id="collectionAction">${currentUser ? "YOU’RE IN" : "SIGN IN TO UNLOCK"} <span>↗</span></button></div></section>
      <footer><a class="brand" href="#"><span class="brand-icon">N</span>NIGHTSCREEN</a><span>MADE FOR THE HOURS AFTER</span><span>© 2025 NIGHTSCREEN</span></footer>
    </main>
    <div class="modal-backdrop" id="modal" hidden><section class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="authTitle"><button class="close" id="closeModal" aria-label="Close">×</button><p class="eyebrow"><i></i> YOUR PRIVATE CINEMA</p><h2 id="authTitle">Good evening.</h2><p class="modal-copy">Sign in to continue to your screening room.</p><div class="auth-tabs"><button class="selected" data-mode="signin">SIGN IN</button><button data-mode="signup">CREATE ACCOUNT</button></div><form id="authForm"><label for="email">EMAIL ADDRESS</label><input id="email" type="email" autocomplete="email" placeholder="you@example.com" required><label for="password">PASSWORD</label><input id="password" type="password" autocomplete="current-password" minlength="6" placeholder="At least 6 characters" required><p class="form-message" id="formMessage" aria-live="polite"></p><button class="primary submit" type="submit">CONTINUE <span>↗</span></button></form><p class="privacy">Your account is managed securely by Supabase.</p></section></div>`;

  document.querySelector("#accountAction").onclick = () => currentUser ? signOut() : showModal();
  document.querySelector("#heroAction").onclick = () => currentUser ? document.querySelector("#collection").scrollIntoView({ behavior: "smooth" }) : showModal();
  document.querySelector("#collectionAction").onclick = () => currentUser ? null : showModal();
  document.querySelector("#closeModal").onclick = hideModal;
  document.querySelector("#modal").onclick = (event) => { if (event.target.id === "modal") hideModal(); };
  document.querySelectorAll("[data-mode]").forEach((tab) => tab.onclick = () => setMode(tab.dataset.mode));
  document.querySelector("#authForm").onsubmit = authenticate;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function showModal() {
  document.querySelector("#modal").hidden = false;
  document.querySelector("#email").focus();
}

function hideModal() {
  document.querySelector("#modal").hidden = true;
}

function setMode(mode) {
  document.querySelectorAll("[data-mode]").forEach((tab) => tab.classList.toggle("selected", tab.dataset.mode === mode));
  document.querySelector("#authTitle").textContent = mode === "signup" ? "Join the quiet." : "Good evening.";
  document.querySelector(".modal-copy").textContent = mode === "signup" ? "Create an account for your private screening room." : "Sign in to continue to your screening room.";
  document.querySelector("#password").autocomplete = mode === "signup" ? "new-password" : "current-password";
  document.querySelector(".submit").innerHTML = `${mode === "signup" ? "CREATE ACCOUNT" : "CONTINUE"} <span>↗</span>`;
  document.querySelector("#authForm").dataset.mode = mode;
  document.querySelector("#formMessage").textContent = "";
}

async function authenticate(event) {
  event.preventDefault();
  const message = document.querySelector("#formMessage");
  const submit = document.querySelector(".submit");
  if (!supabase) {
    message.textContent = "Setup needed: add your Supabase URL and publishable key to .env.local, then rebuild.";
    return;
  }
  if (busy) return;
  busy = true;
  submit.disabled = true;
  message.textContent = "Connecting securely…";
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value;
  const action = document.querySelector("#authForm").dataset.mode === "signup"
    ? supabase.auth.signUp({ email, password })
    : supabase.auth.signInWithPassword({ email, password });
  try {
    const { data, error } = await Promise.race([
      action,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Connection timed out. Supabase did not respond.")), 15000)),
    ]);
    if (error) throw error;
    if (document.querySelector("#authForm").dataset.mode === "signup" && !data.session) {
      message.textContent = "Check your email for the confirmation link, then sign in.";
    } else {
      currentUser = data.user;
      hideModal();
      render();
    }
  } catch (error) {
    const timeout = error.message.includes("timed out") || error.name === "TypeError";
    message.textContent = timeout
      ? `Could not reach ${new URL(supabaseUrl).host}. Check that the Supabase project is active and try another network. (${error.message})`
      : error.message;
  } finally {
    busy = false;
    submit.disabled = false;
  }
}

async function signOut() {
  await supabase?.auth.signOut();
  currentUser = null;
  render();
}

render();
if (supabase) {
  supabase.auth.getSession().then(({ data }) => {
    currentUser = data.session?.user ?? null;
    render();
  }).catch(() => {});
  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user ?? null;
    if (!document.querySelector("#modal") || document.querySelector("#modal").hidden) render();
  });
}
