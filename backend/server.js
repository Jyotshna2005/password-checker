const express = require("express");
const path = require("path");
const passwordRoutes = require("./routes/passwordRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "..", "frontend")));
app.use("/api", passwordRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "VaultCheck API is running" });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err.message); // Never log request bodies/passwords.
  res.status(500).json({ message: "An unexpected server error occurred." });
});

app.listen(PORT, () => {
  console.log(`VaultCheck running at http://localhost:${PORT}`);
});
