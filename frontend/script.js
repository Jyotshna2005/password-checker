const API = "/api";
const form = document.getElementById("checkForm");
const passwordInput = document.getElementById("passwordInput");
const checkButton = document.getElementById("checkButton");
const resultBox = document.getElementById("result");
const historyList = document.getElementById("historyList");

document.getElementById("togglePassword").addEventListener("click", () => {
  const showing = passwordInput.type === "text";
  passwordInput.type = showing ? "password" : "text";
  document.getElementById("togglePassword").textContent = showing ? "SHOW" : "HIDE";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = passwordInput.value;
  if (!password) return;
  checkButton.disabled = true;
  checkButton.querySelector("span").textContent = "Checking securely...";
  resultBox.className = "result";
  resultBox.textContent = "Checking breach records. Please wait...";
  try {
    const response = await fetch(`${API}/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to check password.");
    renderResult(data);
    passwordInput.value = "";
    passwordInput.type = "password";
    document.getElementById("togglePassword").textContent = "SHOW";
    await loadHistory();
  } catch (error) {
    resultBox.className = "result danger";
    resultBox.innerHTML = `<h3>Check could not be completed</h3><p>${escapeHtml(error.message)}</p>`;
  } finally {
    checkButton.disabled = false;
    checkButton.querySelector("span").textContent = "Check password";
  }
});

function renderResult(data) {
  const breached = data.pwnedCount > 0;
  resultBox.className = `result ${breached ? "danger" : "safe"}`;
  resultBox.innerHTML = breached
    ? `<h3>⚠ Password found in breach records</h3><div class="count">${Number(data.pwnedCount).toLocaleString()}</div><p>This password appeared ${Number(data.pwnedCount).toLocaleString()} time(s) in the Pwned Passwords dataset. Change it anywhere you use it, and never reuse it.</p>`
    : `<h3>✓ No match found</h3><div class="count">0 exposures</div><p>This password was not found in the Pwned Passwords dataset. This does not guarantee that it is safe or has never been exposed elsewhere.</p>`;
}

async function loadHistory() {
  try {
    const response = await fetch(`${API}/history`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    if (!data.length) {
      historyList.innerHTML = '<div class="empty-state">No checks yet. Run your first password check above.</div>';
      return;
    }
    historyList.innerHTML = data.map(item => `
      <article class="history-item" data-id="${escapeHtml(item.id)}">
        <div class="status-icon ${item.pwnedCount > 0 ? "danger" : "safe"}">${item.pwnedCount > 0 ? "!" : "✓"}</div>
        <div class="history-info"><strong>${escapeHtml(item.label || "Password check")}</strong><small>${new Date(item.checkedAt).toLocaleString()}</small></div>
        <div class="history-count">${Number(item.pwnedCount).toLocaleString()} exposure(s)</div>
        <div class="history-actions">
          <button data-action="patch">Rename</button>
          <button data-action="put">Replace</button>
        </div>
      </article>`).join("");
  } catch (error) {
    historyList.innerHTML = `<div class="empty-state">Could not load history: ${escapeHtml(error.message)}</div>`;
  }
}

historyList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const item = button.closest(".history-item");
  const id = item.dataset.id;
  const currentLabel = item.querySelector(".history-info strong").textContent;
  const label = prompt("Enter a label for this check:", currentLabel);
  if (label === null || !label.trim()) return;

  // Rename uses PATCH (partial update). Replace uses PUT (full editable representation).
  const method = button.dataset.action === "patch" ? "PATCH" : "PUT";
  try {
    const response = await fetch(`${API}/history/${encodeURIComponent(id)}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(method === "PATCH"
        ? { label: label.trim() }
        : { label: label.trim(), favorite: false })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Update failed.");
    await loadHistory();
  } catch (error) {
    alert(error.message);
  }
});

document.getElementById("refreshHistory").addEventListener("click", loadHistory);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

loadHistory();
