// VannMrtnz portfolio — public frontend + protected admin via Supabase Auth/RLS.
const CONFIG = {
  supabaseUrl: "https://dbxuythpopqjlecpppks.supabase.co",
  // Use Supabase publishable/anon key only. Never place service_role keys here.
  supabaseAnonKey: "sb_publishable_wqgmFL_LnuixXL8QagtCCw_4dzQE1rS",
  profile: {
    instagram: "Vannmrtnzz",
    instagramUrl: "https://instagram.com/Vannmrtnzz",
    email: "ervannmrtinez@gmail.com",
    githubUrl: "https://github.com/ervannmrtinez",
    whatsappNumber: "6283831224540", // country code + number, digits only
    linkedinUrl: "https://www.linkedin.com/in/ervannmrtinez/"
  }
};
const $ = (selector) => document.querySelector(selector);
const supabaseReady = !CONFIG.supabaseUrl.includes("YOUR_PROJECT_ID") &&
  !CONFIG.supabaseAnonKey.includes("YOUR_SUPABASE") &&
  window.supabase && window.supabase.createClient;
const db = supabaseReady ? window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey) : null;

$("#year").textContent = new Date().getFullYear();
$("#instagramLink").href = CONFIG.profile.instagramUrl;
$("#instagramLink").firstElementChild.textContent = `Instagram · @${CONFIG.profile.instagram}`;
$("#emailLink").href = `mailto:${CONFIG.profile.email}`;
$("#emailLink").firstElementChild.textContent = `Email · ${CONFIG.profile.email}`;
$("#emailButton").href = `mailto:${CONFIG.profile.email}`;
$("#githubLink").href = CONFIG.profile.githubUrl;
$("#whatsappLink").href = `https://wa.me/${CONFIG.profile.whatsappNumber}`;
$("#linkedinLink").href = CONFIG.profile.linkedinUrl;

const menuToggle = $("#menuToggle"), navLinks = $("#navLinks");
menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.textContent = open ? "✕" : "☰";
});
navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  navLinks.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "☰";
}));
const observer = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); } });
}, {threshold: .12}) : null;
document.querySelectorAll(".reveal").forEach(el => observer ? observer.observe(el) : el.classList.add("visible"));

const overlay = $("#adminOverlay");
let logoTaps = 0, tapTimer;
$("#brandMark").addEventListener("click", event => {
  logoTaps++;
  clearTimeout(tapTimer);
  tapTimer = setTimeout(() => logoTaps = 0, 1400);
  if (logoTaps >= 5) { event.preventDefault(); logoTaps = 0; openAdmin(); }
});
function openAdmin() {
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  updateAdminState();
}
function closeAdmin() {
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
$("#closeAdmin").addEventListener("click", closeAdmin);
overlay.addEventListener("click", e => { if (e.target === overlay) closeAdmin(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeAdmin(); });

function setStatus(selector, message, error=false) {
  const el = $(selector); el.textContent = message; el.style.color = error ? "#ff9b9b" : "#bdbdbd";
}
function updateAdminState(session=null) {
  const hasSession = Boolean(session);
  $("#adminLogin").hidden = hasSession;
  $("#adminPanel").hidden = !hasSession;
}
async function getSession() {
  if (!db) return null;
  const {data, error} = await db.auth.getSession();
  if (error) console.error(error);
  return data?.session || null;
}
$("#loginBtn").addEventListener("click", async () => {
  if (!db) return setStatus("#loginStatus", "Supabase belum dikonfigurasi. Edit CONFIG di public/script.js terlebih dahulu.", true);
  const email = $("#adminEmail").value.trim(), password = $("#adminPassword").value;
  if (!email || !password) return setStatus("#loginStatus", "Isi email dan password admin.", true);
  const {error} = await db.auth.signInWithPassword({email, password});
  if (error) return setStatus("#loginStatus", error.message, true);
  $("#adminPassword").value = "";
  setStatus("#loginStatus", "Login berhasil.");
  updateAdminState(await getSession());
  await loadProjects();
});
$("#logoutBtn").addEventListener("click", async () => {
  if (db) await db.auth.signOut();
  updateAdminState(null);
  resetProjectForm();
  setStatus("#loginStatus", "Lo sudah logout.");
});
if (db) db.auth.onAuthStateChange((_event, session) => updateAdminState(session));

function safeExternalUrl(value) {
  try { const u = new URL(value); return ["https:", "http:"].includes(u.protocol) ? u.href : ""; }
  catch { return ""; }
}
function renderProjects(projects) {
  const grid = $("#projectGrid");
  if (!projects.length) {
    grid.innerHTML = '<p class="muted">Belum ada project. Admin bisa menambahkannya melalui dashboard.</p>';
    $("#adminProjectList").innerHTML = '<p class="muted">Belum ada project.</p>';
    return;
  }
  grid.innerHTML = projects.map((p, i) => {
    const image = safeExternalUrl(p.image_url || "");
    const link = safeExternalUrl(p.project_url || "");
    const visual = image ? `<img src="${escapeAttr(image)}" alt="${escapeAttr(p.title)}" loading="lazy">` : `<span class="visual-word">${escapeHtml(p.title)}</span>`;
    const card = `<article class="project reveal"><div class="project-visual">${visual}<span class="visual-index mono">PROJECT / ${String(i+1).padStart(3,"0")}</span><span class="visual-chip">${escapeHtml(p.category || "PROJECT")}</span></div><div class="project-info"><div><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.description)}</p></div>${link ? `<a class="arrow" href="${escapeAttr(link)}" target="_blank" rel="noopener noreferrer" aria-label="Buka ${escapeAttr(p.title)}">↗</a>` : '<span class="arrow">↗</span>'}</div></article>`;
    return card;
  }).join("");
  grid.querySelectorAll(".reveal").forEach(el => observer ? observer.observe(el) : el.classList.add("visible"));
  $("#adminProjectList").innerHTML = projects.map(p => `<div class="admin-project-row"><div><strong>${escapeHtml(p.title)}</strong><p>${escapeHtml(p.category || "PROJECT")}</p></div><div class="admin-row-actions"><button type="button" data-edit="${escapeAttr(p.id)}">Edit</button><button type="button" data-delete="${escapeAttr(p.id)}">Hapus</button></div></div>`).join("");
}
function escapeHtml(value="") {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function escapeAttr(value="") { return escapeHtml(value); }

async function loadProjects() {
  if (!db) return;
  const {data, error} = await db.from("projects").select("id,title,description,category,project_url,image_url,created_at").order("created_at", {ascending:false});
  if (error) { console.error(error); setStatus("#projectStatus", `Gagal memuat project: ${error.message}`, true); return; }
  renderProjects(data || []);
}
$("#projectForm").addEventListener("submit", async e => {
  e.preventDefault();
  if (!db) return setStatus("#projectStatus", "Konfigurasikan Supabase terlebih dahulu.", true);
  const session = await getSession();
  if (!session) return setStatus("#projectStatus", "Sesi admin habis. Login kembali.", true);
  const id = $("#projectId").value;
  const payload = {
    title: $("#projectTitle").value.trim(),
    category: $("#projectCategory").value.trim() || "PROJECT",
    description: $("#projectDescription").value.trim(),
    project_url: safeExternalUrl($("#projectUrl").value.trim()) || null,
    image_url: safeExternalUrl($("#projectImage").value.trim()) || null,
    updated_at: new Date().toISOString()
  };
  if (!payload.title || !payload.description) return setStatus("#projectStatus", "Judul dan deskripsi wajib diisi.", true);
  const query = id ? db.from("projects").update(payload).eq("id", id) : db.from("projects").insert(payload);
  const {error} = await query;
  if (error) return setStatus("#projectStatus", `Gagal menyimpan: ${error.message}`, true);
  setStatus("#projectStatus", id ? "Project berhasil diperbarui." : "Project berhasil ditambahkan.");
  resetProjectForm(); await loadProjects();
});
function resetProjectForm() {
  $("#projectForm").reset(); $("#projectId").value = ""; $("#formTitle").textContent = "Tambah project"; $("#saveProjectBtn").textContent = "Simpan project";
}
$("#resetFormBtn").addEventListener("click", resetProjectForm);
$("#adminProjectList").addEventListener("click", async e => {
  const editId = e.target.dataset.edit, deleteId = e.target.dataset.delete;
  if (!db) return;
  if (editId) {
    const {data, error} = await db.from("projects").select("*").eq("id", editId).single();
    if (error || !data) return setStatus("#projectStatus", error?.message || "Project tidak ditemukan.", true);
    $("#projectId").value = data.id; $("#projectTitle").value = data.title; $("#projectCategory").value = data.category || "";
    $("#projectDescription").value = data.description; $("#projectUrl").value = data.project_url || ""; $("#projectImage").value = data.image_url || "";
    $("#formTitle").textContent = "Edit project"; $("#saveProjectBtn").textContent = "Simpan perubahan";
    $("#projectForm").scrollIntoView({behavior:"smooth", block:"start"});
  }
  if (deleteId && confirm("Hapus project ini secara permanen?")) {
    const {error} = await db.from("projects").delete().eq("id", deleteId);
    if (error) return setStatus("#projectStatus", `Gagal menghapus: ${error.message}`, true);
    setStatus("#projectStatus", "Project berhasil dihapus."); await loadProjects();
  }
}
);
(async function init() {
  if (!db) {
    $("#projectNote")?.classList.remove("hidden");
    return;
  }
  const session = await getSession();
  updateAdminState(session);
  await loadProjects();
})();
