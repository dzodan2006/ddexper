import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Send newsletter emails using SMTP2GO API
  app.post("/api/send-email", async (req, res) => {
    try {
      const { subject, htmlBody, recipients, customApiKey, customSender } = req.body;

      if (!subject || !htmlBody || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ error: "Nedostaju obavezna polja: naslov, sadržaj ili lista primalaca." });
      }

      // Read from request body or fallback to environment variables/defaults
      const apiKey = customApiKey || process.env.SMTP2GO_API_KEY || "api-0D65C8F726A948E7BE68974F2B80F0C6";
      const sender = customSender || process.env.SMTP2GO_SENDER || "promocija@dddesign.rs";

      console.log(`Slanje mejlova za ${recipients.length} primalaca preko SMTP2GO (${sender})...`);

      // SMTP2GO send endpoint
      const response = await fetch("https://api.smtp2go.com/v3/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: apiKey,
          sender: sender, // Use raw sender email to guarantee match with verified domain and avoid SMTP format rejection
          to: recipients,
          subject: subject,
          html_body: htmlBody,
          text_body: htmlBody.replace(/<[^>]*>/g, ""), // simple strip of HTML tags
        }),
      });

      const data = await response.json();

      const smtpGoError = data?.data?.error || data?.error || (data?.data?.failures && data.data.failures.length > 0 ? `Failed recipients: ${data.data.failures.join(', ')}` : null);

      if (!response.ok || smtpGoError) {
        console.error("Greška pri slanju SMTP2GO:", data);
        return res.status(response.status || 500).json({
          error: smtpGoError || "Slanje preko SMTP2GO nije uspelo.",
          details: data,
        });
      }

      return res.json({ success: true, response: data });
    } catch (error: any) {
      console.error("Server error during send-email:", error);
      return res.status(500).json({ error: error.message || "Interna serverska greška." });
    }
  });

  // API Route: Get SMTP2GO config details (masking API key for safety)
  app.get("/api/email-config", (req, res) => {
    res.json({
      sender: process.env.SMTP2GO_SENDER || "promocija@dddesign.rs",
      adminEmail: process.env.SMTP2GO_ADMIN_EMAIL || "srdjandzodan4@gmail.com",
      hasApiKey: !!(process.env.SMTP2GO_API_KEY || "api-0D65C8F726A948E7BE68974F2B80F0C6"),
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
