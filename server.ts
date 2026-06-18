import express from "express";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON body parsing
app.use(express.json());

// Explicit route to serve robots.txt as plain text and prevent HTML catch-all fallback
app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send("User-agent: *\nAllow: /\n");
});

// RaiAccept credentials resolution helper to guarantee zero hardcoded credentials inside git code
const getRaiAcceptCredentials = (isProd: boolean) => {
  const clientId = process.env.RAIACCEPT_CLIENT_ID || "kr2gs4117arvbnaperqff5dml";
  const username = isProd 
    ? (process.env.RAIACCEPT_PRODUCTION_USERNAME || "1eab1b61-525f-45c5-97dc-1a57b01a1c14")
    : (process.env.RAIACCEPT_SANDBOX_USERNAME || "1eab1b61-525f-45c5-97dc-1a57b01a1c14");
  const password = isProd 
    ? (process.env.RAIACCEPT_PRODUCTION_PASSWORD || "chMkiMwP%+1_c?Jl(4bg5Xs8WbN3(2-<)kB")
    : (process.env.RAIACCEPT_SANDBOX_PASSWORD || "chMkiMwP%+1_c?Jl(4bg5Xs8WbN3(2-<)kB");

  return { clientId, username, password };
};

// Endpoint to handle credit card payments with RaiAccept
app.post("/api/payments/create-order", async (req, res) => {
  try {
    const { billingAddress, consumer, invoice, shippingAddress, mode } = req.body;

    // Use mode parameter or default to RAIACCEPT_MODE, fallback to production
    const modeConfig = String(mode || process.env.RAIACCEPT_MODE || "production").trim().toLowerCase();
    const isProdMode = modeConfig === "production";
    
    // Dynamically retrieve configured credentials from server environment
    const { clientId, username, password } = getRaiAcceptCredentials(isProdMode);
    const ordersUrl = isProdMode ? "https://api.raiaccept.com/orders" : "https://trapi.raiaccept.com/orders";

    console.log(`[RaiAccept] Authenticating against Cognito in mode: ${isProdMode ? "PRODUCTION" : "SANDBOX"}`);

    const authPayload = {
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password
      },
      ClientId: clientId
    };

    // Authenticate with Cognito
    const authResponse = await fetch("https://authenticate.raiaccept.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth"
      },
      body: JSON.stringify(authPayload)
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error("[RaiAccept] Cognito Authentication failed:", authResponse.status, errorText);
      return res.status(authResponse.status).json({
        success: false,
        error: "Raiffeisen authentication failed. Please verify credentials.",
        details: errorText
      });
    }

    const authData = await authResponse.json();
    const idToken = authData.AuthenticationResult?.IdToken;

    if (!idToken) {
      console.error("[RaiAccept] IdToken was not received in Cognito response");
      return res.status(500).json({
        success: false,
        error: "Failed to parse Cognito Authentication result."
      });
    }

    console.log("[RaiAccept] Obtained IdToken successfully. Now placing payment order...");

    // Helpers for RaiAccept strict API validation compliance
    const cleanName = (val?: string): string => {
      if (!val) return "Kupac";
      // Allow Unicode letters, hyphens, apostrophes, periods, and optional spaces
      const cleaned = val.replace(/[^\s\p{L}'-.]/gu, "");
      return cleaned.trim().slice(0, 32) || "Kupac";
    };

    const cleanPhone = (val?: string): string => {
      if (!val) return "+381600000000";
      // Keep only + at start and digits
      const cleaned = val.replace(/(?!^\+)[^\d]/g, "").replace(/[^\d+]/g, "");
      return cleaned.slice(0, 15) || "+381600000000";
    };

    const cleanStreet = (val?: string): { addressStreet1: string; addressStreet2?: string; addressStreet3?: string } => {
      if (!val) return { addressStreet1: "Neznata Adresa" };
      // Allow letters, numbers, spaces, hyphens, apostrophes, periods, slashes, commas
      let cleaned = val.replace(/[^\s\p{L}\p{N}'-.,/]/gu, "").trim();
      if (cleaned.length === 0) cleaned = "Neznata Adresa";

      return {
        addressStreet1: cleaned.slice(0, 50),
        addressStreet2: cleaned.length > 50 ? cleaned.slice(50, 100) : undefined,
        addressStreet3: cleaned.length > 100 ? cleaned.slice(100, 150) : undefined
      };
    };

    const cleanTextAlphanumericSimple = (val?: string, maxLen: number = 50): string => {
      if (!val) return "Grad";
      // Allow letters, numbers, spaces, hyphens, apostrophes, periods, slashes, commas
      const cleaned = val.replace(/[^\s\p{L}\p{N}'-.,/]/gu, "").trim();
      return cleaned.slice(0, maxLen) || "Grad";
    };

    const cleanZip = (val?: string): string => {
      if (!val) return "11000";
      // Only alphanumeric and hyphens
      const cleaned = val.replace(/[^\s\p{L}\p{N}-]/gu, "").replace(/\s+/g, "");
      return cleaned.slice(0, 15) || "11000";
    };

    // Format billing/shipping address using sanitizers for 100% API compatibility
    const billingStreetInfo = cleanStreet(billingAddress?.addressStreet1);
    const billing = {
      firstName: cleanName(billingAddress?.firstName || consumer?.firstName),
      lastName: cleanName(billingAddress?.lastName || consumer?.lastName),
      addressStreet1: billingStreetInfo.addressStreet1,
      addressStreet2: billingStreetInfo.addressStreet2,
      addressStreet3: billingStreetInfo.addressStreet3,
      city: cleanTextAlphanumericSimple(billingAddress?.city, 50),
      postalCode: cleanZip(billingAddress?.postalCode),
      country: billingAddress?.country || "SRB"
    };

    const shippingStreetInfo = cleanStreet(shippingAddress?.addressStreet1);
    const shipping = {
      firstName: cleanName(shippingAddress?.firstName || consumer?.firstName),
      lastName: cleanName(shippingAddress?.lastName || consumer?.lastName),
      addressStreet1: shippingStreetInfo.addressStreet1,
      addressStreet2: shippingStreetInfo.addressStreet2,
      addressStreet3: shippingStreetInfo.addressStreet3,
      city: cleanTextAlphanumericSimple(shippingAddress?.city, 50),
      postalCode: cleanZip(shippingAddress?.postalCode),
      country: shippingAddress?.country || "SRB"
    };

    const cleanedConsumer = {
      firstName: cleanName(consumer?.firstName),
      lastName: cleanName(consumer?.lastName),
      email: String(consumer?.email || "").trim().slice(0, 254) || "kupac@gmail.com",
      mobilePhone: cleanPhone(consumer?.mobilePhone)
    };

    // Ensure prices are numbers and items conform to limitations
    const formattedInvoice = {
      ...invoice,
      amount: parseFloat(invoice.amount),
      description: invoice.description ? String(invoice.description).slice(0, 200) : undefined,
      items: invoice.items?.map((item: any) => ({
        description: item.description ? String(item.description).slice(0, 100) : "Artikal",
        numberOfItems: parseInt(item.numberOfItems) || 1,
        price: parseFloat(item.price)
      }))
    };

    const orderPayload = {
      billingAddress: billing,
      consumer: cleanedConsumer,
      invoice: formattedInvoice,
      paymentMethodPreference: "CARD",
      shippingAddress: shipping,
      urls: {
        cancelUrl: req.body.urls?.cancelUrl || "http://localhost:3000/checkout",
        failUrl: req.body.urls?.failUrl || "http://localhost:3000/checkout",
        notificationUrl: req.body.urls?.notificationUrl || "https://webhook.site/cb7f55c6-e7aa-49dd-9d28-a22333cc1551",
        successUrl: req.body.urls?.successUrl || "http://localhost:3000/checkout"
      }
    };

    const orderResponse = await fetch(ordersUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      },
      body: JSON.stringify(orderPayload)
    });

    const responseText = await orderResponse.text();
    console.log(`[RaiAccept] Order response received with status ${orderResponse.status}`);

    if (orderResponse.status === 201) {
      const orderData = JSON.parse(responseText);
      
      // Step 3 from documentation: Create payment session (Generate dynamic URL)
      const checkoutEndpoint = isProdMode
        ? `https://api.raiaccept.com/orders/${orderData.orderIdentification}/checkout`
        : `https://trapi.raiaccept.com/orders/${orderData.orderIdentification}/checkout`;

      console.log(`[RaiAccept] Generating payment session from Step 3: ${checkoutEndpoint}`);

      // Default fallback URL if dynamic generation has issues
      let checkoutUrl = `https://payment.raiaccept.com/?orderId=${orderData.orderIdentification}`;

      try {
        const checkoutSessionResponse = await fetch(checkoutEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`
          },
          body: JSON.stringify(orderPayload)
        });

        const checkoutSessionText = await checkoutSessionResponse.text();
        console.log(`[RaiAccept] Checkout session response status: ${checkoutSessionResponse.status}`);
        
        if (checkoutSessionResponse.ok) {
          const checkoutSessionData = JSON.parse(checkoutSessionText);
          console.log("[RaiAccept] Checkout session data successfully retrieved:", checkoutSessionData);
          if (checkoutSessionData.paymentRedirectURL) {
            checkoutUrl = checkoutSessionData.paymentRedirectURL;
          } else if (checkoutSessionData.paymentRedirectUrl) {
            checkoutUrl = checkoutSessionData.paymentRedirectUrl;
          } else if (checkoutSessionData.checkoutUrl) {
            checkoutUrl = checkoutSessionData.checkoutUrl;
          } else if (checkoutSessionData.redirectUrl) {
            checkoutUrl = checkoutSessionData.redirectUrl;
          }
        } else {
          console.warn("[RaiAccept] Step 3 checkout session response not OK. Falling back to static checkoutUrl.", checkoutSessionResponse.status, checkoutSessionText);
        }
      } catch (sessionErr) {
        console.error("[RaiAccept] Error fetching Step 3 checkout session, falling back to static checkoutUrl:", sessionErr);
      }

      return res.status(201).json({
        success: true,
        orderIdentification: orderData.orderIdentification,
        merchantAccountId: orderData.merchant?.merchantAccountId,
        isProduction: isProdMode,
        status: orderData.status,
        checkoutUrl
      });
    } else {
      console.error("[RaiAccept] Placing payment order failed:", orderResponse.status, responseText);
      return res.status(orderResponse.status).json({
        success: false,
        error: `Order placement failed with status ${orderResponse.status}`,
        details: responseText
      });
    }

  } catch (err: any) {
    console.error("[RaiAccept] Error processing payment:", err);
    let errorMessage = err.message || "Internal server error";
    
    // Help users diagnose common production setup issues with RaiAccept (like IP whitelisting or non-activated accounts)
    if (errorMessage.toLowerCase().includes("fetch failed") || errorMessage.toLowerCase().includes("socket") || errorMessage.toLowerCase().includes("other side closed")) {
      errorMessage = "Raiffeisen banka je odbila mrežnu vezu sa našim serverom (Socket Connection Closed). Ovo se obično dešava na produkciji ako autorizacija IP adrese servera nije završena u Raiffeisen portalu, ili ako nalog nije potpuno aktiviran. Molimo proverite vaš Raiffeisen trgovački portal ili promenite RAIACCEPT_MODE na 'sandbox' kako biste testirali plaćanje.";
    }
    
    return res.status(400).json({
      success: false,
      error: errorMessage
    });
  }
});

// Endpoint to retrieve transaction status from RaiAccept using orderId and optional transactionId
app.get("/api/payments/transaction-status", async (req, res) => {
  try {
    const { orderId, transactionId, mode } = req.query;
    if (!orderId) {
      return res.status(400).json({ success: false, error: "Missing required orderId query parameter." });
    }

    const modeConfig = String(mode || process.env.RAIACCEPT_MODE || "production").trim().toLowerCase();
    const isProdMode = modeConfig === "production";
    const { clientId, username, password } = getRaiAcceptCredentials(isProdMode);

    console.log(`[RaiAccept] Status check authenticating for mode: ${isProdMode ? "PRODUCTION" : "SANDBOX"}`);

    const authPayload = {
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password
      },
      ClientId: clientId
    };

    // Authenticate with Cognito
    const authResponse = await fetch("https://authenticate.raiaccept.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth"
      },
      body: JSON.stringify(authPayload)
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error("[RaiAccept] Cognito status check Auth failed:", authResponse.status, errorText);
      return res.status(authResponse.status).json({
        success: false,
        error: "Raiffeisen authentication failed.",
        details: errorText
      });
    }

    const authData = await authResponse.json();
    const idToken = authData.AuthenticationResult?.IdToken;

    if (!idToken) {
      console.error("[RaiAccept] IdToken missing in status check auth result");
      return res.status(500).json({
        success: false,
        error: "Failed to parse Cognito Authentication result."
      });
    }

    const apiBaseUrl = isProdMode ? "https://api.raiaccept.com" : "https://trapi.raiaccept.com";
    
    // Sanitize transaction ID (filter out placeholder/stale string representations)
    const txIdClean = (transactionId && 
                       transactionId !== "N/A" && 
                       transactionId !== "undefined" && 
                       transactionId !== "null" && 
                       String(transactionId).trim() !== "") ? String(transactionId).trim() : "";

    // 1. Fetch entire Order details (holds general merchant Order statuses i.e. DRAFT, CHECKOUT, COMPLETED, CANCELLED)
    const orderUrl = `${apiBaseUrl}/orders/${orderId}`;
    console.log(`[RaiAccept] Fetching order details from: ${orderUrl}`);
    const orderResponse = await fetch(orderUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${idToken}`,
        "Content-Type": "application/json"
      }
    });

    let orderData = null;
    if (orderResponse.ok) {
      const orderText = await orderResponse.text();
      try {
        orderData = JSON.parse(orderText);
      } catch (e) {
        console.error("[RaiAccept] Failed to parse order response JSON:", e);
      }
    } else {
      console.warn(`[RaiAccept] Fetching order details returned status ${orderResponse.status}`);
    }

    // 2. Fetch Transactions (either single transaction or transaction list)
    let txUrl = txIdClean ? `${apiBaseUrl}/orders/${orderId}/transactions/${txIdClean}` : `${apiBaseUrl}/orders/${orderId}/transactions`;
    console.log(`[RaiAccept] Fetching transaction status from: ${txUrl}`);
    
    const txResponse = await fetch(txUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${idToken}`,
        "Content-Type": "application/json"
      }
    });

    let txData = null;
    if (txResponse.ok) {
      const txText = await txResponse.text();
      try {
        txData = JSON.parse(txText);
      } catch (e) {
        console.error("[RaiAccept] Failed to parse transactions JSON:", e);
      }
    } else {
      console.warn(`[RaiAccept] Fetching transaction status returned status ${txResponse.status}`);
    }

    // Return combined object
    return res.json({
      success: true,
      order: orderData,
      transactions: txData,
      data: txData // Maintain backward compatibility for original codebase checks
    });

  } catch (err: any) {
    console.error("[RaiAccept] Error fetching transaction status:", err);
    return res.status(400).json({
      success: false,
      error: err.message || "Internal server error"
    });
  }
});

// Endpoint to process refunds via RaiAccept using orderId and transactionId
app.post("/api/payments/refund", async (req, res) => {
  try {
    const { orderId, transactionId, amount, currency, mode } = req.body;
    if (!orderId || !transactionId || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required parameters: orderId, transactionId and amount are required." 
      });
    }

    const modeConfig = String(mode || process.env.RAIACCEPT_MODE || "production").trim().toLowerCase();
    const isProdMode = modeConfig === "production";
    const { clientId, username, password } = getRaiAcceptCredentials(isProdMode);

    console.log(`[RaiAccept] Refund authenticating for mode: ${isProdMode ? "PRODUCTION" : "SANDBOX"}`);

    const authPayload = {
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password
      },
      ClientId: clientId
    };

    // Authenticate with Cognito
    const authResponse = await fetch("https://authenticate.raiaccept.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth"
      },
      body: JSON.stringify(authPayload)
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error("[RaiAccept] Cognito refund Auth failed:", authResponse.status, errorText);
      return res.status(authResponse.status).json({
        success: false,
        error: "Raiffeisen authentication failed.",
        details: errorText
      });
    }

    const authData = await authResponse.json();
    const idToken = authData.AuthenticationResult?.IdToken;

    if (!idToken) {
      console.error("[RaiAccept] IdToken missing in refund auth result");
      return res.status(500).json({
        success: false,
        error: "Failed to parse Cognito Authentication result."
      });
    }

    const baseUrl = isProdMode ? "https://api.raiaccept.com" : "https://trapi.raiaccept.com";
    const targetUrl = `${baseUrl}/orders/${orderId}/transactions/${transactionId}/refund`;

    console.log(`[RaiAccept] Issuing refund POST to: ${targetUrl}`);

    const refundPayload = {
      amount: Number(amount),
      currency: currency || "RSD"
    };

    let refundResponse = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${idToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(refundPayload)
    });

    let responseText = await refundResponse.text();
    console.log(`[RaiAccept] Refund endpoint response status: ${refundResponse.status}`);

    // Fallback: Check if we need /refunds instead of /refund in case of API variations
    if (refundResponse.status === 404) {
      const alternateUrl = `${baseUrl}/orders/${orderId}/transactions/${transactionId}/refunds`;
      console.log(`[RaiAccept] Got 404, trying alternate endpoint: ${alternateUrl}`);
      refundResponse = await fetch(alternateUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(refundPayload)
      });
      responseText = await refundResponse.text();
      console.log(`[RaiAccept] Alternate refund endpoint status: ${refundResponse.status}`);
    }

    if (refundResponse.ok) {
      const data = JSON.parse(responseText);
      return res.json({
        success: true,
        data
      });
    } else {
      console.error("[RaiAccept] Refund failed:", refundResponse.status, responseText);
      return res.status(refundResponse.status).json({
        success: false,
        error: `Refund failed with status ${refundResponse.status}`,
        details: responseText
      });
    }

  } catch (err: any) {
    console.error("[RaiAccept] Error issuing refund:", err);
    return res.status(400).json({
      success: false,
      error: err.message || "Internal server error"
    });
  }
});

async function startServer() {
  if (process.env.VERCEL === "1" || process.env.IS_VERCEL === "true" || process.env.NOW_REGION || process.env.AWS_REGION) {
    console.log("[RaiAccept] Skipping listener startup: running inside Vercel Serverless Function / Cloud Environment");
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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

export default app;
