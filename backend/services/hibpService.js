const { createHash } = require("crypto");

async function checkPwnedPassword(password) {
  // HIBP's Pwned Passwords API uses SHA-1 hash-range (k-anonymity).
  // Only the first five hash characters are sent to HIBP, never the password or full hash.
  const sha1 = createHash("sha1").update(password, "utf8").digest("hex").toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    method: "GET",
    headers: {
      "Add-Padding": "true",
      "User-Agent": "VaultCheck-Password-Security-Demo"
    },
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new Error(`Have I Been Pwned returned HTTP ${response.status}. Please try again.`);
  }

  const responseText = await response.text();
  for (const line of responseText.split(/\r?\n/)) {
    const [returnedSuffix, countText] = line.trim().split(":");
    if (returnedSuffix && returnedSuffix.toUpperCase() === suffix) {
      const count = Number.parseInt(countText, 10);
      return Number.isFinite(count) ? count : 0;
    }
  }
  return 0;
}

module.exports = { checkPwnedPassword };
