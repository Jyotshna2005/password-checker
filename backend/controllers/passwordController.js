const { checkPwnedPassword } = require("../services/hibpService");
const store = require("../services/historyStore");

async function checkPassword(req, res) {
  try {
    const { password } = req.body || {};
    if (typeof password !== "string" || password.length === 0) {
      return res.status(400).json({ message: "Please provide a password." });
    }
    if (password.length > 1024) {
      return res.status(400).json({ message: "Password is too long to check." });
    }

    // The password is used only in memory for this request. It is never stored or logged.
    const pwnedCount = await checkPwnedPassword(password);
    const record = store.add({
      label: "Password check",
      pwnedCount,
      favorite: false
    });

    return res.json({
      pwned: pwnedCount > 0,
      pwnedCount,
      checkedAt: record.checkedAt,
      message: pwnedCount > 0
        ? "This password was found in breach records."
        : "No match was found in the Pwned Passwords dataset."
    });
  } catch (error) {
    return res.status(502).json({
      message: error.message || "The breach-check service is temporarily unavailable."
    });
  }
}

function getHistory(req, res) {
  res.json(store.getAll());
}

function updateHistory(req, res) {
  const updated = store.patch(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ message: "History record not found." });
  res.json(updated);
}

function replaceHistory(req, res) {
  const { label, favorite } = req.body || {};
  if (typeof label !== "string" || typeof favorite !== "boolean") {
    return res.status(400).json({
      message: "PUT requires both label (string) and favorite (boolean)."
    });
  }
  const updated = store.replace(req.params.id, { label, favorite });
  if (!updated) return res.status(404).json({ message: "History record not found." });
  res.json(updated);
}

module.exports = { checkPassword, getHistory, updateHistory, replaceHistory };
