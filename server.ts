import express from "express";
import path from "path";
import dotenv from "dotenv";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

// Initialize Supabase client for Server API functions
// Prioritizes NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to bypass RLS securely on backend
const rawSupabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.SUPABASE_URL || 
  process.env.VITE_SUPABASE_URL || 
  "";
const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

// Server prefers SUPABASE_SERVICE_ROLE_KEY to bypass RLS for administrative endpoints,
// falling back to anon key if service role is not provided.
const serverSupabaseKey = supabaseServiceRoleKey || supabaseAnonKey;

const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseUrl.startsWith("https://") &&
  !supabaseUrl.includes("your-project-id") &&
  !supabaseUrl.includes("placeholder-project") &&
  serverSupabaseKey &&
  !serverSupabaseKey.includes("your-anon-key") &&
  !serverSupabaseKey.includes("placeholder-key")
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, serverSupabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })
  : null;

// Explicit admin client when service role key is present
export const supabaseAdmin = (isSupabaseConfigured && supabaseServiceRoleKey)
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })
  : supabase;

if (!supabase) {
  console.warn("[Server Supabase] Supabase credentials missing or invalid in server environment. Ensure NEXT_PUBLIC_SUPABASE_URL is configured.");
} else if (supabaseServiceRoleKey) {
  console.log("[Server Supabase] Client successfully initialized with SUPABASE_SERVICE_ROLE_KEY (RLS bypass enabled).");
} else {
  console.log("[Server Supabase] Client initialized with NEXT_PUBLIC_SUPABASE_ANON_KEY (Standard RLS active).");
}

const app = express();
const PORT = 3000;

// Enable JSON body parsing
app.use(express.json());

// Explicit route to serve robots.txt as plain text and prevent HTML catch-all fallback
app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send("User-agent: *\nAllow: /\n");
});

// Owner Authentication Session Helpers
const OWNER_SESSION_SECRET = process.env.OWNER_SESSION_SECRET || "dddesign_owner_portal_super_secret_auth_key_2026";

function createOwnerToken(user: { id: any; username: string }) {
  const payload = {
    id: user.id,
    username: user.username,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days valid
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", OWNER_SESSION_SECRET).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function verifyOwnerToken(token: string) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, signature] = parts;
  const expectedSig = crypto.createHmac("sha256", OWNER_SESSION_SECRET).update(body).digest("base64url");
  if (signature !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// Endpoint to authenticate owner from 'accounts' table securely on backend
app.post("/api/owner/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: "Korisničko ime i lozinka su obavezni." });
    }

    if (!supabase) {
      return res.status(500).json({ success: false, error: "Baza podataka nije dostupna." });
    }

    // Secure query: search accounts table by username
    // Passwords are never sent or exposed to the client
    const trimmedUsername = String(username).trim();
    const { data: accounts, error } = await supabase
      .from("accounts")
      .select("id, username, password")
      .ilike("username", trimmedUsername)
      .limit(1);

    if (error) {
      console.error("[Owner Auth] Supabase query error:", error);
      return res.status(500).json({ success: false, error: "Greška pri proveri naloga u bazi." });
    }

    if (!accounts || accounts.length === 0) {
      return res.status(401).json({ success: false, error: "Pogrešno korisničko ime ili lozinka." });
    }

    const account = accounts[0];
    if (String(account.password) !== String(password)) {
      return res.status(401).json({ success: false, error: "Pogrešno korisničko ime ili lozinka." });
    }

    // Password verified! Generate token and return sanitized user data (NO password returned)
    const token = createOwnerToken({ id: account.id, username: account.username });
    return res.json({
      success: true,
      token,
      user: {
        id: account.id,
        username: account.username
      }
    });
  } catch (err: any) {
    console.error("[Owner Auth] Exception during login:", err);
    return res.status(500).json({ success: false, error: "Greška na serveru pri autentifikaciji." });
  }
});

// Endpoint to verify owner session token
app.post("/api/owner/verify-session", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let token = req.body?.token;
    if (!token && authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token) {
      return res.status(401).json({ success: false, error: "Sesija ne postoji." });
    }

    const payload = verifyOwnerToken(token);
    if (!payload) {
      return res.status(401).json({ success: false, error: "Sesija je istekla ili je nevažeća." });
    }

    return res.json({
      success: true,
      user: {
        id: payload.id,
        username: payload.username
      }
    });
  } catch (err: any) {
    return res.status(401).json({ success: false, error: "Nevažeća sesija." });
  }
});

// Endpoint to delete order and associated order_items securely from database
app.delete("/api/admin/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: "ID porudžbine je obavezan." });
    }

    if (!supabase) {
      return res.status(500).json({ success: false, error: "Baza podataka nije dostupna." });
    }

    console.log(`[Order Delete] Processing deletion for order ID: ${id}...`);

    // 1. Delete associated order items first to satisfy foreign key integrity
    const { error: itemsError } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", id);

    if (itemsError) {
      console.warn("[Order Delete] Notice: deleting items returned:", itemsError.message);
    }

    // 2. Delete the order record
    const { error: orderError } = await supabase
      .from("orders")
      .delete()
      .eq("id", id);

    if (orderError) {
      console.error("[Order Delete] Error deleting order from database:", orderError);
      return res.status(500).json({ success: false, error: orderError.message });
    }

    console.log(`[Order Delete] Order ID ${id} deleted successfully.`);
    return res.json({ success: true, message: `Porudžbina #${id} je uspešno obrisana.` });
  } catch (err: any) {
    console.error("[Order Delete] Exception while deleting order:", err);
    return res.status(500).json({ success: false, error: err.message || "Greška pri brisanju porudžbine." });
  }
});

// Endpoint to delete category securely from database (bypasses RLS with service role)
app.delete("/api/admin/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: "ID kategorije je obavezan." });
    }

    const db = supabaseAdmin || supabase;
    if (!db) {
      return res.status(500).json({ success: false, error: "Baza podataka nije dostupna." });
    }

    const catIdNum = Number(id);
    console.log(`[Category Delete] Request to delete category ID: ${id}...`);

    // 1. Unassign products referencing this category (category_id = id) to avoid foreign key errors
    try {
      const { error: unassignProdErr } = await db
        .from("products")
        .update({ category_id: null })
        .eq("category_id", catIdNum);

      if (unassignProdErr) {
        console.warn("[Category Delete] Updating products category_id returned:", unassignProdErr.message);
      }
    } catch (e: any) {
      console.warn("[Category Delete] Exception unassigning products:", e?.message);
    }

    // 2. Unassign promo_codes referencing this category (Category_id = id or category_id = id)
    try {
      await db.from("promo_codes").update({ Category_id: null }).eq("Category_id", catIdNum);
    } catch (e) {
      try {
        await db.from("promo_codes").update({ category_id: null }).eq("category_id", catIdNum);
      } catch (e2) {}
    }

    // 3. Delete from 'categories' table
    // Categories table uses primary key 'Id' (capital I) or 'id' (lowercase)
    // NEVER use 'category_id' here because category_id is only a column on products!
    let deleteError: any = null;
    let deleted = false;

    // First attempt: uppercase 'Id'
    const { error: errCap } = await db
      .from("categories")
      .delete()
      .eq("Id", catIdNum);

    if (!errCap) {
      deleted = true;
    } else {
      console.warn("[Category Delete] Uppercase 'Id' attempt returned:", errCap.message);
      deleteError = errCap;

      // Second attempt: lowercase 'id'
      const { error: errLow } = await db
        .from("categories")
        .delete()
        .eq("id", catIdNum);

      if (!errLow) {
        deleted = true;
        deleteError = null;
      } else {
        console.error("[Category Delete] Lowercase 'id' attempt returned:", errLow.message);
        deleteError = errLow;
      }
    }

    if (!deleted && deleteError) {
      return res.status(500).json({
        success: false,
        error: deleteError.message || "Greška pri brisanju kategorije iz baze."
      });
    }

    // 4. Remove deleted category from ordering.json if present
    try {
      const fs = await import("fs/promises");
      try {
        const raw = await fs.readFile(ORDERING_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.categoryOrder)) {
          const filtered = parsed.categoryOrder.filter((cid: any) => Number(cid) !== catIdNum);
          if (filtered.length !== parsed.categoryOrder.length) {
            parsed.categoryOrder = filtered;
            await fs.writeFile(ORDERING_FILE, JSON.stringify(parsed, null, 2), "utf-8");
            console.log(`[Category Delete] Cleaned category ID ${catIdNum} from ordering.json.`);
          }
        }
      } catch {}
    } catch {}

    console.log(`[Category Delete] Category ID ${id} deleted successfully.`);
    return res.json({ success: true, message: `Kategorija #${id} je uspešno obrisana.` });
  } catch (err: any) {
    console.error("[Category Delete] Exception while deleting category:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Greška pri brisanju kategorije."
    });
  }
});

// Endpoint to delete product securely from database (bypasses RLS with service role and cascades child tables)
app.delete("/api/admin/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: "ID proizvoda je obavezan." });
    }

    const db = supabaseAdmin || supabase;
    if (!db) {
      return res.status(500).json({ success: false, error: "Baza podataka nije dostupna." });
    }

    const prodIdNum = Number(id);
    console.log(`[Product Delete] Processing complete deletion for product ID: ${id}...`);

    // 1. Delete associated colors from 'Product_colors' (capital P as in schema) and 'product_colors'
    const { error: colErr1 } = await db
      .from("Product_colors")
      .delete()
      .eq("product_id", prodIdNum);

    if (colErr1) {
      console.warn("[Product Delete] Notice deleting Product_colors:", colErr1.message);
      const { error: colErr2 } = await db
        .from("product_colors")
        .delete()
        .eq("product_id", prodIdNum);
      if (colErr2) {
        console.warn("[Product Delete] Notice deleting product_colors:", colErr2.message);
      }
    }

    // 2. Delete associated sizes from 'product_sizes'
    const { error: szErr } = await db
      .from("product_sizes")
      .delete()
      .eq("product_id", prodIdNum);
    if (szErr) {
      console.warn("[Product Delete] Notice deleting product_sizes:", szErr.message);
    }

    // 3. Delete associated images from 'product_images'
    const { error: imgErr } = await db
      .from("product_images")
      .delete()
      .eq("product_id", prodIdNum);
    if (imgErr) {
      console.warn("[Product Delete] Notice deleting product_images:", imgErr.message);
    }

    // 4. Safely unlink from order_items (keep past customer order receipts intact, but clear product reference)
    try {
      await db
        .from("order_items")
        .update({ product_id: null })
        .eq("product_id", prodIdNum);
    } catch (orderItemErr: any) {
      console.warn("[Product Delete] Notice unlinking order_items:", orderItemErr?.message);
    }

    // 5. Delete the product itself from 'products' table
    const { error: prodErr } = await db
      .from("products")
      .delete()
      .eq("id", prodIdNum);

    if (prodErr) {
      console.error("[Product Delete] Error deleting product from database:", prodErr);
      return res.status(500).json({ success: false, error: prodErr.message });
    }

    // 6. Remove product ID from ordering.json if present
    try {
      const fs = await import("fs/promises");
      try {
        const raw = await fs.readFile(ORDERING_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.productOrder)) {
          const filtered = parsed.productOrder.filter((pid: any) => Number(pid) !== prodIdNum);
          if (filtered.length !== parsed.productOrder.length) {
            parsed.productOrder = filtered;
            await fs.writeFile(ORDERING_FILE, JSON.stringify(parsed, null, 2), "utf-8");
            console.log(`[Product Delete] Removed product ID ${prodIdNum} from ordering.json.`);
          }
        }
      } catch {}
    } catch {}

    console.log(`[Product Delete] Product ID ${id} deleted successfully.`);
    return res.json({ success: true, message: `Proizvod #${id} je uspešno obrisan.` });
  } catch (err: any) {
    console.error("[Product Delete] Exception while deleting product:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Greška pri brisanju proizvoda."
    });
  }
});

// Custom Product and Category ordering endpoints (persisted in ordering.json)
const ORDERING_FILE = path.join(process.cwd(), "ordering.json");

app.get("/api/ordering", async (req, res) => {
  try {
    const fs = await import("fs/promises");
    try {
      const data = await fs.readFile(ORDERING_FILE, "utf-8");
      const parsed = JSON.parse(data);
      return res.json({
        success: true,
        productOrder: Array.isArray(parsed.productOrder) ? parsed.productOrder : [],
        categoryOrder: Array.isArray(parsed.categoryOrder) ? parsed.categoryOrder : []
      });
    } catch {
      return res.json({ success: true, productOrder: [], categoryOrder: [] });
    }
  } catch (err: any) {
    return res.json({ success: true, productOrder: [], categoryOrder: [] });
  }
});

app.post("/api/ordering", async (req, res) => {
  try {
    const fs = await import("fs/promises");
    const { productOrder, categoryOrder } = req.body;

    let current = { productOrder: [] as any[], categoryOrder: [] as any[] };
    try {
      const data = await fs.readFile(ORDERING_FILE, "utf-8");
      current = JSON.parse(data);
    } catch {
      // ignore
    }

    const updated = {
      productOrder: Array.isArray(productOrder) ? productOrder : current.productOrder || [],
      categoryOrder: Array.isArray(categoryOrder) ? categoryOrder : current.categoryOrder || []
    };

    await fs.writeFile(ORDERING_FILE, JSON.stringify(updated, null, 2), "utf-8");
    console.log(`[Ordering] Saved ordering configuration: ${updated.productOrder.length} products, ${updated.categoryOrder.length} categories.`);

    return res.json({
      success: true,
      message: "Redosled uspešno sačuvan.",
      ...updated
    });
  } catch (err: any) {
    console.error("[Ordering] Error saving ordering:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Standardni User-Agent koji sprečava Cloudflare/WAF da blokira vezu sa Vercela
const COMMON_HEADERS = {
  "Accept": "application/json",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 DDDesignApp/1.0"
};

// RaiAccept credentials resolution helper
const getRaiAcceptCredentials = (isProd: boolean) => {
  const clientId = process.env.RAIACCEPT_CLIENT_ID || "P-001-MA-2qVqpYFY";
  const username = isProd 
    ? (process.env.RAIACCEPT_PRODUCTION_USERNAME || "dc3bbc8b-b417-4fca-ae08-3bfeff51381d")
    : (process.env.RAIACCEPT_SANDBOX_USERNAME || "1eab1b61-525f-45c5-97dc-1a57b01a1c14");
  const password = isProd 
    ? (process.env.RAIACCEPT_PRODUCTION_PASSWORD || "")
    : (process.env.RAIACCEPT_SANDBOX_PASSWORD || "chMkiMwP%+1_c?Jl(4bg5Xs8WbN3(2-<)kB");

  return { clientId, username, password };
};

// Endpoint to handle credit card payments with RaiAccept
app.post("/api/payments/create-order", async (req, res) => {
  try {
    const { billingAddress, consumer, invoice, shippingAddress, mode } = req.body;

    const modeConfig = String(mode || process.env.RAIACCEPT_MODE || "production").trim().toLowerCase();
    const isProdMode = modeConfig === "production";
    
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

    // 1. Authenticate with Cognito (dodat User-Agent i Accept)
    const authResponse = await fetch("https://authenticate.raiaccept.com", {
      method: "POST",
      headers: {
        ...COMMON_HEADERS,
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

    const cleanName = (val?: string): string => {
      if (!val) return "Kupac";
      const cleaned = val.replace(/[^\s\p{L}'-.]/gu, "");
      return cleaned.trim().slice(0, 32) || "Kupac";
    };

    const cleanPhone = (val?: string): string => {
      if (!val) return "+381600000000";
      const cleaned = val.replace(/(?!^\+)[^\d]/g, "").replace(/[^\d+]/g, "");
      return cleaned.slice(0, 15) || "+381600000000";
    };

    const cleanStreet = (val?: string): { addressStreet1: string; addressStreet2?: string; addressStreet3?: string } => {
      if (!val) return { addressStreet1: "Neznata Adresa" };
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
      const cleaned = val.replace(/[^\s\p{L}\p{N}'-.,/]/gu, "").trim();
      return cleaned.slice(0, maxLen) || "Grad";
    };

    const cleanZip = (val?: string): string => {
      if (!val) return "11000";
      const cleaned = val.replace(/[^\s\p{L}\p{N}-]/gu, "").replace(/\s+/g, "");
      return cleaned.slice(0, 15) || "11000";
    };

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
        cancelUrl: req.body.urls?.cancelUrl || "https://dddesign.rs/checkout",
        failUrl: req.body.urls?.failUrl || "https://dddesign.rs/checkout",
        notificationUrl: req.body.urls?.notificationUrl || "https://dddesign.rs/api/payments/webhook",
        successUrl: req.body.urls?.successUrl || "https://dddesign.rs/checkout"
      }
    };

    // 2. Kreiranje porudžbine (dodat User-Agent i Accept)
    const orderResponse = await fetch(ordersUrl, {
      method: "POST",
      headers: {
        ...COMMON_HEADERS,
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      },
      body: JSON.stringify(orderPayload)
    });

    const responseText = await orderResponse.text();
    console.log(`[RaiAccept] Order response received with status ${orderResponse.status}`);

    if (orderResponse.status === 201) {
      const orderData = JSON.parse(responseText);
      
      const checkoutEndpoint = isProdMode
        ? `https://api.raiaccept.com/orders/${orderData.orderIdentification}/checkout`
        : `https://trapi.raiaccept.com/orders/${orderData.orderIdentification}/checkout`;

      console.log(`[RaiAccept] Generating payment session from Step 3: ${checkoutEndpoint}`);

      let checkoutUrl = `https://payment.raiaccept.com/?orderId=${orderData.orderIdentification}`;

      try {
        // 3. Checkout sesija (dodat User-Agent i Accept)
        const checkoutSessionResponse = await fetch(checkoutEndpoint, {
          method: "POST",
          headers: {
            ...COMMON_HEADERS,
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`
          },
          body: JSON.stringify(orderPayload)
        });

        const checkoutSessionText = await checkoutSessionResponse.text();
        console.log(`[RaiAccept] Checkout session response status: ${checkoutSessionResponse.status}`);
        
        if (checkoutSessionResponse.ok) {
          const checkoutSessionData = JSON.parse(checkoutSessionText);
          if (checkoutSessionData.paymentRedirectURL) {
            checkoutUrl = checkoutSessionData.paymentRedirectURL;
          } else if (checkoutSessionData.paymentRedirectUrl) {
            checkoutUrl = checkoutSessionData.paymentRedirectUrl;
          } else if (checkoutSessionData.checkoutUrl) {
            checkoutUrl = checkoutSessionData.checkoutUrl;
          } else if (checkoutSessionData.redirectUrl) {
            checkoutUrl = checkoutSessionData.redirectUrl;
          }
        }
      } catch (sessionErr) {
        console.error("[RaiAccept] Error fetching Step 3 checkout session:", sessionErr);
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
    return res.status(400).json({
      success: false,
      error: err.message || "Internal server error"
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
        ...COMMON_HEADERS,
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
        ...COMMON_HEADERS,
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
        ...COMMON_HEADERS,
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
        ...COMMON_HEADERS,
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
        ...COMMON_HEADERS,
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
          ...COMMON_HEADERS,
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

// Order notification endpoint with SMTP2GO integration
app.post("/api/orders/send-notification", async (req, res) => {
  try {
    const {
      orderNumber,
      customerName,
      email,
      phone,
      address,
      city,
      postalCode,
      paymentMethod,
      totalPrice,
      shippingCost,
      items
    } = req.body;

    if (!orderNumber || !email) {
      return res.status(400).json({
        success: false,
        error: "Missing required order details."
      });
    }

    const apiKey = process.env.SMTP2GO_API_KEY || "api-0D65C8F726A948E7BE68974F2B80F0C6";
    let sender = process.env.SMTP2GO_SENDER || "promocija@dddesign.rs";
    if (!sender || typeof sender !== "string" || !sender.includes("@")) {
      sender = "promocija@dddesign.rs";
    }
    const adminEmail = process.env.SMTP2GO_ADMIN_EMAIL || "srdjandzodan4@gmail.com, info@dddesign.rs";

    console.log(`[Order Notification] Sending confirmation for order: ${orderNumber} to: ${email}`);

    // Build items HTML for Customer Email
    const itemsHtml = Array.isArray(items) ? items.map((item: any) => {
      const details = [];
      if (item.selectedSize) details.push(`Vel: ${item.selectedSize}`);
      if (item.selectedColor) details.push(`Boja: ${item.selectedColor}`);
      const detailsStr = details.length > 0 ? ` <span style="font-size: 11px; color: #a1a1aa; font-family: 'Outfit', sans-serif;">(${details.join(", ")})</span>` : "";
      
      return `
        <tr style="border-bottom: 1px solid #222222;">
          <td style="padding: 14px 0; color: #ffffff; line-height: 1.4; font-family: 'Outfit', sans-serif; font-size: 14px;">
            <strong style="font-weight: 400; color: #ffffff;">${item.name || "Artikal"}</strong>${detailsStr}
          </td>
          <td style="padding: 14px 0; text-align: center; color: #a1a1aa; font-family: 'Outfit', sans-serif; font-size: 14px;">
            ${item.quantity || 1}
          </td>
          <td style="padding: 14px 0; text-align: right; color: #ffffff; font-family: 'Outfit', sans-serif; font-weight: bold; font-size: 14px;">
            ${(item.price || 0) * (item.quantity || 1)} RSD
          </td>
        </tr>
      `;
    }).join("") : "";

    // Build items HTML for Admin Email
    const itemsHtmlAdmin = Array.isArray(items) ? items.map((item: any) => {
      const details = [];
      if (item.selectedSize) details.push(`Vel: ${item.selectedSize}`);
      if (item.selectedColor) details.push(`Boja: ${item.selectedColor}`);
      const detailsStr = details.length > 0 ? ` (${details.join(", ")})` : "";

      return `
        <tr style="border-bottom: 1px solid #222222;">
          <td style="padding: 10px 0; color: #ffffff; font-family: 'Outfit', sans-serif; font-size: 13.5px;">
            <strong>${item.name || "Artikal"}</strong>${detailsStr}
          </td>
          <td style="padding: 10px 0; text-align: center; color: #a1a1aa; font-family: 'Outfit', sans-serif; font-size: 13.5px;">
            ${item.quantity || 1}
          </td>
          <td style="padding: 10px 0; text-align: right; color: #ffffff; font-family: 'Outfit', sans-serif; font-size: 13.5px; font-weight: bold;">
            ${(item.price || 0) * (item.quantity || 1)} RSD
          </td>
        </tr>
      `;
    }).join("") : "";

    // 1. Send Order Confirmation Email to Customer
    const customerResponse = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        api_key: apiKey,
        sender: sender,
        to: [email],
        subject: `Potvrda porudžbine ${orderNumber} - DD DESIGN`,
        html_body: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Potvrda porudžbine - DD DESIGN</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Italiana&family=Outfit:wght@300;400;500&display=swap');
            </style>
          </head>
          <body style="font-family: 'Outfit', 'Helvetica Neue', Arial, sans-serif; background-color: #000000; color: #ffffff; margin: 0; padding: 0; -webkit-font-smoothing: antialiased;">
            <div style="background-color: #000000; padding: 40px 10px;">
              <div style="font-family: 'Outfit', 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #1c1c1e; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);">
                <!-- Elegant Brand Banner using Tumblr Image optimized via Weserv -->
                <div style="background-image: url('https://images.weserv.nl/?url=64.media.tumblr.com/cb6f36c302200c648bf44670ada2305e/2b7c3e65e62eb0d6-47/s2048x3072/f4675eb55ccda97da38e96bf2cedb7b947b917f0.jpg&w=600&h=260&fit=cover'); background-size: cover; background-position: center; height: 200px; position: relative;">
                   <div style="position: absolute; inset: 0; background-color: rgba(0, 0, 0, 0.45); top:0; left:0; right:0; bottom:0;"></div>
                  <table style="width: 100%; height: 100%; position: relative; z-index: 10; border-collapse: collapse;">
                    <tr>
                      <td style="text-align: center; vertical-align: middle; padding: 20px;">
                        <h1 style="font-family: 'Italiana', serif; color: #ffffff; font-size: 32px; font-weight: 300; letter-spacing: 0.25em; margin: 0; text-transform: uppercase; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">DD DESIGN</h1>
                        <p style="font-family: 'Outfit', sans-serif; color: #f4f4f5; font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; margin: 8px 0 0 0; text-shadow: 0 1px 4px rgba(0,0,0,0.5);">Modern Design & Premium Quality</p>
                      </td>
                    </tr>
                  </table>
                </div>
                
                <div style="padding: 40px 35px;">
                  <!-- Title -->
                  <div style="text-align: center; margin-bottom: 35px;">
                    <h2 style="font-family: 'Italiana', serif; color: #ffffff; font-size: 22px; font-weight: 300; margin: 0 0 12px 0; letter-spacing: 0.15em; text-transform: uppercase;">Hvala Vam na porudžbini!</h2>
                    <p style="font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: 16px; color: #a1a1aa; margin: 0; line-height: 1.6;">
                      Vaša porudžbina <strong>${orderNumber}</strong> je uspešno primljena i trenutno se obrađuje.
                    </p>
                  </div>
 
                  <!-- Order Info Box -->
                  <div style="background-color: #111111; border: 1px solid #222222; padding: 24px; margin-bottom: 35px; border-radius: 2px;">
                    <h3 style="font-family: 'Italiana', serif; color: #ffffff; font-size: 13px; font-weight: bold; margin-top: 0; border-bottom: 1px solid #222222; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 15px;">Podaci o dostavi</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; color: #d4d4d8; line-height: 1.6;">
                      <tr>
                        <td style="padding: 6px 0; color: #a1a1aa; width: 120px; font-family: 'Outfit', sans-serif;">Primalac:</td>
                        <td style="padding: 6px 0; color: #ffffff; font-weight: bold; font-family: 'Outfit', sans-serif;">${customerName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #a1a1aa; font-family: 'Outfit', sans-serif;">Telefon:</td>
                        <td style="padding: 6px 0; color: #ffffff; font-family: 'Outfit', sans-serif;">${phone}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #a1a1aa; font-family: 'Outfit', sans-serif;">Adresa:</td>
                        <td style="padding: 6px 0; color: #ffffff; font-family: 'Outfit', sans-serif;">${address}, ${postalCode} ${city}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #a1a1aa; font-family: 'Outfit', sans-serif;">Plaćanje:</td>
                        <td style="padding: 6px 0; color: #ffffff; font-weight: bold; font-family: 'Outfit', sans-serif;">${paymentMethod === 'card' ? 'Online karticom (RaiAccept - PLAĆENO)' : 'Plaćanje pouzećem (kuriru prilikom isporuke)'}</td>
                      </tr>
                    </table>
                  </div>
 
                  <!-- Items Table -->
                  <div style="margin-bottom: 35px;">
                    <h3 style="font-family: 'Italiana', serif; color: #ffffff; font-size: 13px; font-weight: bold; margin-top: 0; border-bottom: 1px solid #222222; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 15px;">Pregled poručenih artikala</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
                      <thead>
                        <tr style="border-bottom: 1px solid #222222;">
                          <th style="font-family: 'Italiana', serif; text-align: left; padding: 10px 0; color: #a1a1aa; font-weight: 300; letter-spacing: 0.1em; text-transform: uppercase;">Naziv</th>
                          <th style="font-family: 'Italiana', serif; text-align: center; padding: 10px 0; color: #a1a1aa; font-weight: 300; letter-spacing: 0.1em; text-transform: uppercase; width: 60px;">Kol.</th>
                          <th style="font-family: 'Italiana', serif; text-align: right; padding: 10px 0; color: #a1a1aa; font-weight: 300; letter-spacing: 0.1em; text-transform: uppercase; width: 100px;">Cena</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                      <tfoot>
                        <tr style="border-top: 1px solid #222222;">
                          <td colspan="2" style="padding: 12px 0; color: #a1a1aa; font-family: 'Outfit', sans-serif;">Dostava:</td>
                          <td style="padding: 12px 0; text-align: right; color: #ffffff; font-family: 'Outfit', sans-serif;">${shippingCost > 0 ? `${shippingCost} RSD` : 'Besplatna'}</td>
                        </tr>
                        <tr style="border-top: 1px solid #222222; font-weight: bold;">
                          <td colspan="2" style="padding: 14px 0; color: #ffffff; font-family: 'Italiana', serif; font-size: 16px; letter-spacing: 0.05em; text-transform: uppercase;">Ukupno za uplatu:</td>
                          <td style="padding: 14px 0; text-align: right; color: #ffffff; font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: bold;">${totalPrice} RSD</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
 
                  <!-- Brand Message / Callout -->
                  <div style="background-color: #111111; border-left: 2px solid #ffffff; padding: 20px; margin-bottom: 35px; border-radius: 0 4px 4px 0;">
                    <p style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 15px; color: #e4e4e7; line-height: 1.6; margin: 0;">
                      <strong>Ručna izrada i unikatni modeli:</strong> Svi modeli DD Design su unikatni i ručno izrađeni. Isporuka za modele koji trenutno nisu na stanju može trajati od 5 do 10 radnih dana. Hvala Vam na strpljenju i razumevanju.
                    </p>
                  </div>
 
                  <!-- Action button -->
                  <div style="text-align: center; margin: 40px 0;">
                    <a href="https://dddesign.rs/shop" style="font-family: 'Outfit', sans-serif; background-color: #ffffff; color: #000000; padding: 14px 32px; font-size: 11px; font-weight: 500; text-decoration: none; border-radius: 0px; letter-spacing: 0.25em; text-transform: uppercase; display: inline-block; border: 1px solid #ffffff;">
                      Poseti Prodavnicu
                    </a>
                  </div>
 
                  <p style="font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: 15px; color: #a1a1aa; line-height: 1.7; margin-top: 30px; text-align: center;">
                    Ukoliko imate bilo kakvih pitanja, slobodno nam odgovorite na ovaj email ili nas pozovite.<br /><br />
                    Srdačan pozdrav,<br />
                    <strong style="font-family: 'Italiana', serif; font-style: normal; font-size: 15px; letter-spacing: 0.1em; color: #ffffff;">Vaš DD DESIGN Tim</strong>
                  </p>
                </div>
                
                <!-- Fine print footer -->
                <div style="background-color: #050505; padding: 35px; border-top: 1px solid #1c1c1e; text-align: center;">
                  <p style="margin: 0 0 10px 0; font-family: 'Outfit', sans-serif; font-size: 11px; color: #71717a; line-height: 1.6;">Ova poruka je automatski generisana sistemom elektronskih porudžbina.</p>
                  <p style="margin: 0; font-family: 'Outfit', sans-serif; font-size: 11px; color: #71717a; letter-spacing: 1px; text-transform: uppercase;">© 2026 DD DESIGN. Sva prava zadržana.</p>
                </div>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      })
    });

    const customerData = await customerResponse.json().catch(() => ({}));
    console.log(`[Order Notification] Customer email response status:`, customerResponse.status);

    // 2. Send Order Alert Email to Admin
    const adminRecipients = adminEmail.split(",").map(e => e.trim()).filter(Boolean);
    if (adminRecipients.length > 0) {
      const adminResponse = await fetch("https://api.smtp2go.com/v3/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          api_key: apiKey,
          sender: sender,
          to: adminRecipients,
          subject: `🛒 NOVA PORUDŽBINA: ${orderNumber} - ${customerName}`,
          html_body: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Italiana&family=Outfit:wght@300;400;500&display=swap');
              </style>
            </head>
            <body style="font-family: 'Outfit', 'Helvetica Neue', Arial, sans-serif; background-color: #000000; margin: 0; padding: 0;">
              <div style="background-color: #000000; padding: 40px 10px;">
                <div style="font-family: 'Outfit', sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #1c1c1e; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);">
                  <!-- Admin Header -->
                  <div style="background-color: #000000; color: #ffffff; padding: 25px 30px; text-align: center; border-bottom: 1px solid #1c1c1e;">
                    <h1 style="font-family: 'Italiana', serif; color: #ffffff; font-size: 18px; font-weight: 300; letter-spacing: 0.2em; margin: 0; text-transform: uppercase;">Nova Porudžbina</h1>
                    <p style="font-family: 'Outfit', sans-serif; color: #a1a1aa; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; margin: 5px 0 0 0;">Sistem elektronske trgovine — DD Design</p>
                  </div>
                  
                  <div style="padding: 30px 25px;">
                    <p style="font-size: 14px; color: #ffffff; line-height: 1.6; margin-top: 0; margin-bottom: 20px;">
                      Prisigla je nova porudžbina <strong>${orderNumber}</strong> na veb sajtu:
                    </p>
 
                    <div style="background-color: #111111; border: 1px solid #222222; padding: 20px; border-radius: 2px; margin-bottom: 25px; font-size: 13.5px; line-height: 1.6; color: #ffffff;">
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 4px 0; color: #a1a1aa; width: 120px; font-family: 'Outfit', sans-serif;">Kupac:</td>
                          <td style="padding: 4px 0; color: #ffffff; font-weight: bold; font-family: 'Outfit', sans-serif;">${customerName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0; color: #a1a1aa; font-family: 'Outfit', sans-serif;">Email:</td>
                          <td style="padding: 4px 0; color: #ffffff; font-family: 'Outfit', sans-serif;"><a href="mailto:${email}" style="color: #ffffff; text-decoration: none;">${email}</a></td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0; color: #a1a1aa; font-family: 'Outfit', sans-serif;">Telefon:</td>
                          <td style="padding: 4px 0; color: #ffffff; font-family: 'Outfit', sans-serif;">${phone}</td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0; color: #a1a1aa; font-family: 'Outfit', sans-serif;">Adresa:</td>
                          <td style="padding: 4px 0; color: #ffffff; font-family: 'Outfit', sans-serif;">${address}, ${postalCode} ${city}</td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0; color: #a1a1aa; font-family: 'Outfit', sans-serif;">Metod plaćanja:</td>
                          <td style="padding: 4px 0; color: #ffffff; font-weight: bold; font-family: 'Outfit', sans-serif;">${paymentMethod === 'card' ? 'Online kartica (RaiAccept - PLAĆENO)' : 'Plaćanje pouzećem (COD)'}</td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0; color: #a1a1aa; font-family: 'Outfit', sans-serif;">Ukupan iznos:</td>
                          <td style="padding: 4px 0; color: #ffffff; font-weight: bold; font-family: 'Outfit', sans-serif;">${totalPrice} RSD</td>
                        </tr>
                      </table>
                    </div>
 
                    <h3 style="font-family: 'Italiana', serif; font-size: 13px; color: #ffffff; border-bottom: 1px solid #222222; padding-bottom: 8px; margin-top: 0; margin-bottom: 15px; letter-spacing: 0.1em; text-transform: uppercase;">Artikli u porudžbini</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 25px;">
                      <thead>
                        <tr style="border-bottom: 1px solid #222222; text-align: left;">
                          <th style="padding: 8px 0; color: #a1a1aa; font-family: 'Italiana', serif; font-weight: 300; letter-spacing: 0.05em; text-transform: uppercase;">Artikal</th>
                          <th style="padding: 8px 0; color: #a1a1aa; text-align: center; width: 50px; font-family: 'Italiana', serif; font-weight: 300; letter-spacing: 0.05em; text-transform: uppercase;">Kol.</th>
                          <th style="padding: 8px 0; color: #a1a1aa; text-align: right; width: 80px; font-family: 'Italiana', serif; font-weight: 300; letter-spacing: 0.05em; text-transform: uppercase;">Cena</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtmlAdmin}
                      </tbody>
                    </table>
 
                    <div style="text-align: center; margin: 30px 0 10px 0;">
                      <a href="https://dddesign.rs/admin" style="font-family: 'Outfit', sans-serif; background-color: #ffffff; color: #000000; padding: 12px 24px; font-size: 11px; font-weight: 500; text-decoration: none; border-radius: 0px; letter-spacing: 0.15em; text-transform: uppercase; display: inline-block; border: 1px solid #ffffff;">
                        Otvori Admin Panel
                      </a>
                    </div>
                  </div>
 
                  <div style="background-color: #050505; padding: 25px; border-top: 1px solid #1c1c1e; text-align: center;">
                    <p style="margin: 0; font-family: 'Outfit', sans-serif; font-size: 10px; color: #71717a; line-height: 1.5;">
                      Sistem: DD Design Automated Order Manager<br />
                      Vreme kreiranja: ${new Date().toLocaleString('sr-RS', { timeZone: 'Europe/Belgrade' })}
                    </p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `
        })
      });

      const adminData = await adminResponse.json().catch(() => ({}));
      console.log(`[Order Notification] Admin email response status:`, adminResponse.status);
    }

    return res.json({
      success: true,
      message: "Order confirmation emails dispatched."
    });

  } catch (err: any) {
    console.error("[Order Notification] Error sending notification emails:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to dispatch order notification emails."
    });
  }
});

// Newsletter subscription endpoint with SMTP2GO integration
app.post("/api/newsletter/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({
        success: false,
        error: "Molimo unesite ispravnu e-mail adresu."
      });
    }

    const apiKey = process.env.SMTP2GO_API_KEY || "api-0D65C8F726A948E7BE68974F2B80F0C6";
    let sender = process.env.SMTP2GO_SENDER || "promocija@dddesign.rs";
    if (!sender || typeof sender !== "string" || !sender.includes("@")) {
      console.warn(`[Newsletter] Warning: Invalid SMTP2GO_SENDER configured ("${sender}"). Falling back to "promocija@dddesign.rs".`);
      sender = "promocija@dddesign.rs";
    }
    const adminEmail = process.env.SMTP2GO_ADMIN_EMAIL || "srdjandzodan4@gmail.com, info@dddesign.rs";

    console.log(`[Newsletter] Subscribing email: ${email} using SMTP2GO`);

    // 1. Send Welcome Email to Subscriber
    const welcomeResponse = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        api_key: apiKey,
        sender: sender,
        to: [email],
        subject: "Dobrodošli u DD Design zajednicu",
        text_body: "Uspešno ste se pretplatili na DD Design newsletter! Hvala na poverenju.",
        html_body: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Dobrodošli u DD DESIGN zajednicu</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Italiana&family=Outfit:wght@300;400;500&display=swap');
            </style>
          </head>
          <body style="font-family: 'Outfit', 'Helvetica Neue', Arial, sans-serif; background-color: #000000; color: #ffffff; margin: 0; padding: 0; -webkit-font-smoothing: antialiased;">
            <div style="background-color: #000000; padding: 40px 10px;">
              <div style="font-family: 'Outfit', 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #1c1c1e; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);">
                <!-- Elegant Handcrafted Banner using Tumblr Image optimized via Weserv -->
                <div style="background-image: url('https://images.weserv.nl/?url=64.media.tumblr.com/6d12019b559087745a3d1db1e01ebf6d/96ff0d2545ab50fb-5b/s2048x3072/10de0c48cbf4f18ed46249e525cb0dd9ebab8425.jpg&w=600&h=260&fit=cover'); background-size: cover; background-position: center; height: 200px; position: relative;">
                  <div style="position: absolute; inset: 0; background-color: rgba(0, 0, 0, 0.45); top:0; left:0; right:0; bottom:0;"></div>
                  <table style="width: 100%; height: 100%; position: relative; z-index: 10; border-collapse: collapse;">
                    <tr>
                      <td style="text-align: center; vertical-align: middle; padding: 20px;">
                        <h1 style="font-family: 'Italiana', serif; color: #ffffff; font-size: 32px; font-weight: 300; letter-spacing: 0.25em; margin: 0; text-transform: uppercase; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">DD DESIGN</h1>
                        <p style="font-family: 'Outfit', sans-serif; color: #f4f4f5; font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; margin: 8px 0 0 0; text-shadow: 0 1px 4px rgba(0,0,0,0.5);">Zajednica Ljubitelja Unikatne Mode</p>
                      </td>
                    </tr>
                  </table>
                </div>
                
                <div style="padding: 40px 35px;">
                  <!-- Greeting -->
                  <p style="font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: 18px; color: #ffffff; line-height: 1.6; margin-top: 0; margin-bottom: 25px;">Poštovani,</p>
                  
                  <p style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 16px; color: #d4d4d8; line-height: 1.8; margin-bottom: 20px;">
                    Hvala Vam što ste se pretplatili na ekskluzivni <strong>DD DESIGN</strong> newsletter!
                  </p>
                  
                  <p style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 16px; color: #d4d4d8; line-height: 1.8; margin-bottom: 25px;">
                    Sada ste deo naše odabrane zajednice koja slavi autentičnost i vrhunsku ručnu izradu. Prvi ćete saznati za naše nove sezonske kolekcije, limitirana izdanja modnih komada, ekskluzivne popuste i inspirativne priče koje prate stvaranje svakog našeg modela od najfinije taft svile.
                  </p>
 
                  <!-- Feature Callout box with image style -->
                  <div style="background-color: #111111; border-left: 2px solid #ffffff; padding: 20px; margin-bottom: 35px; border-radius: 0 4px 4px 0;">
                    <p style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 15px; color: #e4e4e7; line-height: 1.6; margin: 0;">
                      <strong>Dizajn sa karakterom:</strong> Svaki komad brenda DD Design, iza kojeg stoji kreatorka Danijela Gojković, nosi jedinstvenu priču i ručno je šiven kako bi naglasio Vašu eleganciju i jedinstvenost.
                    </p>
                  </div>
                  
                  <!-- Action button -->
                  <div style="text-align: center; margin: 40px 0;">
                    <a href="https://dddesign.rs/shop" style="font-family: 'Outfit', sans-serif; background-color: #ffffff; color: #000000; padding: 14px 32px; font-size: 11px; font-weight: 500; text-decoration: none; border-radius: 0px; letter-spacing: 0.25em; text-transform: uppercase; display: inline-block; border: 1px solid #ffffff;">
                      Istražite Kolekciju
                    </a>
                  </div>
                  
                  <p style="font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: 15px; color: #a1a1aa; line-height: 1.7; text-align: center; margin-top: 35px;">
                    Radujemo se što ćemo zajedno pisati novu modnu priču.<br /><br />
                    Srdačan pozdrav,<br />
                    <strong style="font-family: 'Italiana', serif; font-style: normal; font-size: 15px; letter-spacing: 0.1em; color: #ffffff;">Vaš DD DESIGN Tim</strong>
                  </p>
                </div>
                
                <!-- Fine print footer -->
                <div style="background-color: #050505; padding: 35px; border-top: 1px solid #1c1c1e; text-align: center;">
                  <p style="margin: 0 0 10px 0; font-family: 'Outfit', sans-serif; font-size: 11px; color: #71717a; line-height: 1.6;">Ova poruka je poslata jer ste se prijavili na newsletter na sajtu dddesign.rs.</p>
                  <p style="margin: 0 0 15px 0; font-family: 'Outfit', sans-serif; font-size: 11px; color: #71717a; line-height: 1.6;">Ukoliko želite da se odjavite, pišite nam na <a href="mailto:${sender}" style="color: #ffffff; text-decoration: underline;">${sender}</a>.</p>
                  <p style="margin: 0; font-family: 'Outfit', sans-serif; font-size: 11px; color: #71717a; letter-spacing: 1px; text-transform: uppercase;">© 2026 DD DESIGN. Sva prava zadržana.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      })
    });

    const welcomeData = await welcomeResponse.json().catch(() => ({}));
    console.log("[Newsletter] SMTP2GO Welcome response status:", welcomeResponse.status);

    // 2. Send Admin Notification Email
    const adminRecipients = adminEmail.split(",").map(e => e.trim()).filter(Boolean);
    if (adminRecipients.length > 0) {
      const adminResponse = await fetch("https://api.smtp2go.com/v3/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          api_key: apiKey,
          sender: sender,
          to: adminRecipients,
          subject: "📢 NOVI PRETPLATNIK: DD Design Newsletter",
          text_body: `Novi pretplatnik na newsletter: ${email}\nDatum: ${new Date().toLocaleString('sr-RS')}`,
          html_body: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Italiana&family=Outfit:wght@300;400;500&display=swap');
              </style>
            </head>
            <body style="font-family: 'Outfit', 'Helvetica Neue', Arial, sans-serif; background-color: #000000; margin: 0; padding: 0;">
              <div style="background-color: #000000; padding: 40px 10px;">
                <div style="font-family: 'Outfit', sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #1c1c1e; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);">
                  <!-- Admin Header -->
                  <div style="background-color: #000000; color: #ffffff; padding: 25px 30px; text-align: center; border-bottom: 1px solid #1c1c1e;">
                    <h1 style="font-family: 'Italiana', serif; color: #ffffff; font-size: 18px; font-weight: 300; letter-spacing: 0.2em; margin: 0; text-transform: uppercase;">Novi Pretplatnik</h1>
                    <p style="font-family: 'Outfit', sans-serif; color: #a1a1aa; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; margin: 5px 0 0 0;">Sistem obaveštenja — DD Design</p>
                  </div>
                  
                  <div style="padding: 30px 25px;">
                    <p style="font-size: 14px; color: #ffffff; line-height: 1.6; margin-top: 0; margin-bottom: 20px;">
                       Novi korisnik se uspešno prijavio na Vaš newsletter na sajtu:
                    </p>
                    
                    <div style="background-color: #111111; border: 1px solid #222222; border-left: 2px solid #ffffff; padding: 20px; border-radius: 0 4px 4px 0; margin: 20px 0;">
                      <span style="font-size: 16px; font-weight: bold; color: #ffffff; font-family: 'Outfit', sans-serif;">${email}</span>
                    </div>
                    
                    <p style="font-size: 12px; color: #a1a1aa; margin-top: 25px;">
                      Vreme prijave: ${new Date().toLocaleString('sr-RS', { timeZone: 'Europe/Belgrade' })}<br />
                      Sistem: DD Design Automated Notifications
                    </p>
                  </div>
                  
                  <div style="background-color: #050505; padding: 25px; border-top: 1px solid #1c1c1e; text-align: center;">
                    <p style="margin: 0; font-family: 'Outfit', sans-serif; font-size: 10px; color: #71717a; line-height: 1.5;">
                      DD Design Automated Notifications System
                    </p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `
        })
      });
      const adminData = await adminResponse.json().catch(() => ({}));
      console.log("[Newsletter] SMTP2GO Admin notification status:", adminResponse.status);
    }

    // Try to save to Supabase Newsletter_list table
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("Newsletter_list")
          .insert([{ Mails: email }]);
        if (error) {
          console.error("[Newsletter] Error saving to Supabase table Newsletter_list:", error);
        } else {
          console.log("[Newsletter] Successfully saved to Supabase Newsletter_list:", email);
        }
      } catch (dbErr) {
        console.error("[Newsletter] Supabase exception during save:", dbErr);
      }
    } else {
      console.warn("[Newsletter] Supabase not configured or available. Skipped database registry.");
    }

    // Try to save to local subscribers.json file as fallback registry
    try {
      const fs = await import("fs/promises");
      const subFilePath = path.join(process.cwd(), "subscribers.json");
      let list: string[] = [];
      try {
        const fileContent = await fs.readFile(subFilePath, "utf-8");
        list = JSON.parse(fileContent);
      } catch (e) {
        // File doesn't exist yet, that's fine
      }
      if (!list.includes(email)) {
        list.push(email);
        await fs.writeFile(subFilePath, JSON.stringify(list, null, 2), "utf-8");
      }
    } catch (fsErr) {
      console.error("[Newsletter] Failed to save subscriber locally:", fsErr);
    }

    return res.json({
      success: true,
      message: "Uspešno ste se prijavili na naš newsletter!"
    });

  } catch (err: any) {
    console.error("[Newsletter] Error handling subscription:", err);
    return res.status(500).json({
      success: false,
      error: "Došlo je do greške prilikom prijave na newsletter. Molimo pokušajte ponovo."
    });
  }
});

// Endpoint to retrieve public SMTP configuration for Owner Portal Newsletter Manager
app.get("/api/email-config", (req, res) => {
  const apiKey = process.env.SMTP2GO_API_KEY || "api-0D65C8F726A948E7BE68974F2B80F0C6";
  const sender = process.env.SMTP2GO_SENDER || "promocija@dddesign.rs";
  const adminEmail = process.env.SMTP2GO_ADMIN_EMAIL || "srdjandzodan4@gmail.com";

  return res.json({
    sender,
    adminEmail,
    hasApiKey: !!apiKey
  });
});

// Endpoint to broadcast email campaign from Owner Portal Newsletter Manager
app.post("/api/send-email", async (req, res) => {
  try {
    const { subject, htmlBody, recipients, customApiKey, customSender } = req.body;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ success: false, error: "Nema primalaca za slanje." });
    }

    if (!subject || typeof subject !== "string") {
      return res.status(400).json({ success: false, error: "Naslov e-maila je obavezan." });
    }

    if (!htmlBody || typeof htmlBody !== "string") {
      return res.status(400).json({ success: false, error: "Sadržaj e-maila je obavezan." });
    }

    const apiKey = customApiKey || process.env.SMTP2GO_API_KEY || "api-0D65C8F726A948E7BE68974F2B80F0C6";
    let sender = customSender || process.env.SMTP2GO_SENDER || "promocija@dddesign.rs";
    if (!sender || typeof sender !== "string" || !sender.includes("@")) {
      sender = "promocija@dddesign.rs";
    }

    console.log(`[Send Email] Broadcasting email to ${recipients.length} recipients via SMTP2GO. Sender: ${sender}`);

    const smtpResponse = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        api_key: apiKey,
        sender,
        to: recipients,
        subject,
        html_body: htmlBody
      })
    });

    const smtpData = await smtpResponse.json().catch(() => ({}));

    if (!smtpResponse.ok) {
      console.error("[Send Email] SMTP2GO error response:", smtpResponse.status, smtpData);
      return res.status(smtpResponse.status).json({
        success: false,
        error: "Greška prilikom slanja preko SMTP2GO.",
        details: smtpData
      });
    }

    return res.json({
      success: true,
      message: `Uspešno poslato na ${recipients.length} adresa.`,
      data: smtpData
    });
  } catch (err: any) {
    console.error("[Send Email] Exception during sending:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Došlo je do greške na serveru prilikom slanja poruke."
    });
  }
});

// Endpoint to automatically notify newsletter subscribers when a new product is added
app.post("/api/newsletter/notify-new-product", async (req, res) => {
  try {
    const { productId, name, price, discount_price, description, image_url, categoryName } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: "Naziv proizvoda je obavezan." });
    }

    // 1. Gather all unique subscriber emails
    const emailSet = new Set<string>();

    if (supabase) {
      try {
        // Try Newsletter_list
        const { data: listCase } = await supabase.from("Newsletter_list").select("*");
        if (listCase) {
          listCase.forEach((r: any) => {
            const m = r.Mails || r.mails || r.mail || r.email;
            if (m && typeof m === "string" && m.includes("@")) emailSet.add(m.trim().toLowerCase());
          });
        }

        // Try lowercase newsletter_list
        const { data: listLower } = await supabase.from("newsletter_list").select("*");
        if (listLower) {
          listLower.forEach((r: any) => {
            const m = r.mail || r.Mails || r.email;
            if (m && typeof m === "string" && m.includes("@")) emailSet.add(m.trim().toLowerCase());
          });
        }

        // Try newsletter_subscribers
        const { data: listSub } = await supabase.from("newsletter_subscribers").select("email");
        if (listSub) {
          listSub.forEach((r: any) => {
            if (r.email && typeof r.email === "string" && r.email.includes("@")) {
              emailSet.add(r.email.trim().toLowerCase());
            }
          });
        }
      } catch (dbErr) {
        console.warn("[New Product Notify] Supabase fetch warning:", dbErr);
      }
    }

    // Also check local fallback file subscribers.json
    try {
      const fs = await import("fs/promises");
      const subFilePath = path.join(process.cwd(), "subscribers.json");
      const fileContent = await fs.readFile(subFilePath, "utf-8");
      const localList: string[] = JSON.parse(fileContent);
      if (Array.isArray(localList)) {
        localList.forEach(m => {
          if (m && typeof m === "string" && m.includes("@")) emailSet.add(m.trim().toLowerCase());
        });
      }
    } catch {
      // Ignore if file doesn't exist
    }

    const recipients = Array.from(emailSet);

    if (recipients.length === 0) {
      console.log("[New Product Notify] No newsletter subscribers found to notify.");
      return res.json({ success: true, count: 0, message: "Nema prijavljenih pretplatnika na newsletter listi." });
    }

    const apiKey = process.env.SMTP2GO_API_KEY || "api-0D65C8F726A948E7BE68974F2B80F0C6";
    let sender = process.env.SMTP2GO_SENDER || "promocija@dddesign.rs";
    if (!sender || typeof sender !== "string" || !sender.includes("@")) {
      sender = "promocija@dddesign.rs";
    }

    console.log(`[New Product Notify] Dispatching new product announcement "${name}" to ${recipients.length} subscribers...`);

    const formattedPrice = Number(price || 0).toLocaleString("sr-RS") + " RSD";
    const hasDiscount = discount_price && Number(discount_price) > 0;
    const formattedDiscountPrice = hasDiscount ? Number(discount_price).toLocaleString("sr-RS") + " RSD" : null;

    const fallbackImg = "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600";
    const finalImage = image_url && image_url.startsWith("http") ? image_url : fallbackImg;
    const cleanDesc = description ? description.replace(/<[^>]*>/g, "").slice(0, 220) : "Novi unikatni modni komad iz najnovije selekcije DD DESIGN brenda.";

    const htmlBody = `<!DOCTYPE html>
<html lang="sr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Novi komad u DD DESIGN kolekciji: ${name}</title>
</head>
<body style="margin: 0; padding: 40px 10px; background-color: #0d0d0d; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #ffffff; text-align: center; -webkit-font-smoothing: antialiased;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0d0d0d;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="460" style="background-color: #0d0d0d; max-width: 460px; width: 100%;">
                    
                    <!-- LOGO -->
                    <tr>
                        <td align="center" style="padding: 0 0 25px 0;">
                            <h1 style="margin: 0; font-family: 'Times New Roman', Times, serif; font-size: 26px; font-weight: 300; letter-spacing: 8px; color: #ffffff; text-transform: uppercase;">
                                <a href="https://dddesign.rs" target="_blank" style="color: #ffffff; text-decoration: none;">DD DESIGN</a>
                            </h1>
                        </td>
                    </tr>

                    <!-- HERO IMAGE -->
                    <tr>
                        <td align="center">
                            <a href="https://dddesign.rs/shop" target="_blank" style="text-decoration: none; display: block;">
                                <img src="${finalImage}" alt="${name}" width="460" style="display: block; border: 0; width: 100%; max-width: 460px; height: auto; border-radius: 4px; object-fit: cover;">
                            </a>
                        </td>
                    </tr>

                    <!-- PRODUCT DETAILS -->
                    <tr>
                        <td align="center" style="padding: 35px 20px 20px 20px; text-align: center;">
                            <p style="margin: 0 0 10px 0; font-size: 11px; letter-spacing: 4px; color: #a1a1aa; text-transform: uppercase;">
                                ${categoryName ? categoryName.toUpperCase() + " • " : ""}NOVI MODEL U KOLEKCIJI
                            </p>
                            
                            <h2 style="margin: 0 0 15px 0; font-family: 'Times New Roman', Times, serif; font-size: 24px; font-weight: 300; line-height: 1.3; color: #ffffff; letter-spacing: 1px;">
                                ${name}
                            </h2>

                            <!-- PRICE DISPLAY -->
                            <div style="margin: 0 0 20px 0; font-size: 18px; font-weight: bold; letter-spacing: 1px;">
                                ${hasDiscount ? `
                                  <span style="color: #ef4444; margin-right: 12px; font-size: 20px;">${formattedDiscountPrice}</span>
                                  <span style="color: #71717a; text-decoration: line-through; font-size: 15px;">${formattedPrice}</span>
                                ` : `
                                  <span style="color: #ffffff;">${formattedPrice}</span>
                                `}
                            </div>
                            
                            <p style="margin: 0 0 30px 0; font-size: 13.5px; line-height: 1.7; color: #cccccc; letter-spacing: 0.3px; max-width: 400px;">
                                ${cleanDesc}
                            </p>
                            
                            <!-- CTA BUTTON -->
                            <a href="https://dddesign.rs/shop" target="_blank" style="display: inline-block; font-size: 12px; font-weight: bold; color: #000000; background-color: #ffffff; text-decoration: none; letter-spacing: 3px; text-transform: uppercase; padding: 14px 32px; border-radius: 2px; transition: all 0.3s ease;">
                                POGLEDAJ NA SAJTU &rarr;
                            </a>
                        </td>
                    </tr>

                    <!-- MINI FOOTER -->
                    <tr>
                        <td align="center" style="padding: 50px 20px 10px 20px; text-align: center;">
                            <p style="margin: 0; font-size: 9px; letter-spacing: 2px; color: #52525b; text-transform: uppercase; line-height: 1.6;">
                                Ručna izrada • Unikatan dizajn • DD DESIGN<br>
                                Primili ste ovo obaveštenje jer ste pretplaćeni na naš newsletter.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    const smtpResponse = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        sender,
        to: recipients,
        subject: `🌟 Novi model u DD DESIGN kolekciji: ${name}`,
        html_body: htmlBody
      })
    });

    const smtpData = await smtpResponse.json().catch(() => ({}));

    if (!smtpResponse.ok) {
      console.error("[New Product Notify] SMTP2GO error response:", smtpResponse.status, smtpData);
      return res.status(smtpResponse.status).json({
        success: false,
        error: "Greška prilikom slanja preko SMTP2GO.",
        details: smtpData
      });
    }

    console.log(`[New Product Notify] Successfully dispatched to ${recipients.length} subscribers!`);
    return res.json({
      success: true,
      count: recipients.length,
      message: `Uspešno poslato obaveštenje na ${recipients.length} newsletter adresa.`
    });

  } catch (err: any) {
    console.error("[New Product Notify] Server exception:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Greška na serveru prilikom obaveštavanja newsletter pretplatnika."
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
      server: { 
        middlewareMode: true,
        hmr: false
      },
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
