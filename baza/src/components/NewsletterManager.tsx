import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { supabase } from '../supabaseClient';
import { 
  Mail, 
  Plus, 
  Trash2, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  UserPlus, 
  Users, 
  FileText, 
  Sparkles, 
  Eye, 
  Check, 
  X,
  RefreshCw,
  Clock,
  UserCheck,
  HelpCircle,
  Info,
  AlertCircle
} from 'lucide-react';

interface NewsletterManagerProps {
  orders: Order[];
  onRefresh: () => void;
}

interface Subscriber {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export default function NewsletterManager({ orders, onRefresh }: NewsletterManagerProps) {
  // Manual Subscribers State
  const [manualSubscribers, setManualSubscribers] = useState<Subscriber[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [dbStatus, setDbStatus] = useState<'local' | 'supabase'>('local');
  const [dbError, setDbError] = useState<string | null>(null);
  const [activeTable, setActiveTable] = useState<'Newsletter_list' | 'newsletter_list' | 'newsletter_subscribers' | null>(null);
  const [showSmtpDetails, setShowSmtpDetails] = useState(false);

  // Custom SMTP keys state (persisted locally)
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem('dddesign_custom_api_key') || '');
  const [customSender, setCustomSender] = useState(() => localStorage.getItem('dddesign_custom_sender') || '');

  // Email Composer State
  const [subject, setSubject] = useState('DDdesign');
  const [htmlBody, setHtmlBody] = useState(`<!DOCTYPE html>
<html lang="sr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DDdesign</title>
</head>
<body style="margin: 0; padding: 40px 20px; background-color: #0d0d0d; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #ffffff; text-align: center; -webkit-font-smoothing: antialiased;">

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0d0d0d;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="450" style="background-color: #0d0d0d; width: 100%; max-width: 450px;">
                    <tr>
                        <td style="padding: 20px; color: #ffffff; font-size: 14px; line-height: 1.6; text-align: left;">
                            [Ovde unesite vaš slobodan tekst...]
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

</body>
</html>`);

  const [previewTab, setPreviewTab] = useState<'edit' | 'preview'>('edit');
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]); // Array of email addresses

  // Custom dialog states to bypass sandboxed iframe restrictions
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
  } | null>(null);

  const [alertModal, setAlertModal] = useState<{
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  // Helper functions
  const showConfirm = (title: string, message: string, onConfirm: () => void, confirmText = 'Potvrdi', cancelText = 'Otkaži') => {
    setConfirmModal({ title, message, onConfirm, confirmText, cancelText });
  };

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setAlertModal({ title, message, type });
  };

  // Send email state
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  // SMTP2GO config mask fetched from backend
  const [smtpConfig, setSmtpConfig] = useState<{ sender: string; adminEmail: string; hasApiKey: boolean }>({
    sender: 'promocija@dddesign.rs',
    adminEmail: 'srdjandzodan4@gmail.com',
    hasApiKey: false,
  });

  // Fetch SMTP Config on load
  const fetchSmtpConfig = async () => {
    try {
      const res = await fetch('/api/email-config');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setSmtpConfig(data);
        }
      }
    } catch (e) {
      console.error('Greška pri učitavanju SMTP2GO konfiguracije:', e);
    }
  };

  // Predefined email templates
  const templates = [
    {
      name: 'DDdesign - Prazan šablon',
      subject: 'DDdesign',
      body: `<!DOCTYPE html>
<html lang="sr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DDdesign</title>
</head>
<body style="margin: 0; padding: 40px 20px; background-color: #0d0d0d; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #ffffff; text-align: center; -webkit-font-smoothing: antialiased;">

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0d0d0d;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="450" style="background-color: #0d0d0d; width: 100%; max-width: 450px;">
                    <tr>
                        <td style="padding: 20px; color: #ffffff; font-size: 14px; line-height: 1.6; text-align: left;">
                            [Ovde unesite vaš slobodan tekst...]
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

</body>
</html>`
    },
    {
      name: 'DDdesign - Inspiracija',
      subject: 'DDdesign - Inspiracija',
      body: `<!DOCTYPE html>
<html lang="sr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DDdesign - Inspiracija</title>
    <style>
        @media screen and (max-width: 480px) {
            .container { width: 100% !important; padding: 10px !important; }
            .hero-img { width: 100% !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0d0d; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0d0d0d; padding: 40px 10px;">
        <tr>
            <td align="center">
                
                <!-- Glavni kontejner -->
                <table class="container" border="0" cellpadding="0" cellspacing="0" width="450" style="background-color: #0d0d0d; border-collapse: collapse;">
                    
                    <!-- LOGO -->
                    <tr>
                        <td align="center" style="padding: 0 0 30px 0;">
                            <h1 style="margin: 0; font-family: 'Times New Roman', Times, serif; font-size: 26px; font-weight: 300; letter-spacing: 8px; color: #ffffff; text-transform: uppercase;">
                                <a href="https://dddesign.rs" target="_blank" style="color: #ffffff; text-decoration: none;">DDdesign</a>
                            </h1>
                        </td>
                    </tr>

                    <!-- HERO IMAGE -->
                    <tr>
                        <td align="center">
                            <a href="https://dddesign.rs" target="_blank" style="text-decoration: none; display: block;">
                                <img class="hero-img" src="https://64.media.tumblr.com/388765e5e479f40858fb6e5df46699ca/f154c6d527090598-86/s2048x3072/44e24a8746438e71fea57e9744b6b6c67faf6dbd.jpg" alt="DDdesign" width="450" style="display: block; border: 0; width: 100%; max-width: 450px; height: auto; filter: grayscale(15%);">
                            </a>
                        </td>
                    </tr>

                    <!-- MISTERIOZNI TEKST & CTA -->
                    <tr>
                        <td align="center" style="padding: 40px 20px 20px 20px; text-align: center;">
                            <p style="margin: 0 0 10px 0; font-size: 11px; letter-spacing: 4px; color: #888888; text-transform: uppercase;">EKSKLUZIVNI PRISTUP</p>
                            
                            <h2 style="margin: 0 0 25px 0; font-family: 'Times New Roman', Times, serif; font-size: 20px; font-weight: 300; line-height: 1.4; color: #ffffff; letter-spacing: 1px;">
                                Nova akcija je aktivna na sajtu.
                            </h2>
                            
                            <!-- Minimalistički Link -->
                            <a href="https://dddesign.rs" target="_blank" style="display: inline-block; font-size: 12px; font-weight: bold; color: #ffffff; text-decoration: none; letter-spacing: 3px; text-transform: uppercase; border-bottom: 1px solid #ffffff; padding-bottom: 6px; transition: all 0.3s ease;">
                                NASTAVI ZA VIŠE &rarr;
                            </a>
                        </td>
                    </tr>

                    <!-- MINI FOOTER -->
                    <tr>
                        <td align="center" style="padding: 60px 20px 0 20px; text-align: center;">
                            <p style="margin: 0; font-size: 9px; letter-spacing: 2px; color: #444444; text-transform: uppercase;">
                                Količine su ograničene. <br>
                                <a href="https://dddesign.rs" style="color: #666666; text-decoration: underline; margin-top: 10px; display: inline-block;">Odjavi se</a>
                            </p>
                        </td>
                    </tr>

                </table>
                
            </td>
        </tr>
    </table>

</body>
</html>`
    },
    {
      name: 'DDdesign - Nova Kolekcija',
      subject: 'DDdesign - Nova Kolekcija',
      body: `<!DOCTYPE html>
<html lang="sr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DDdesign - Nova Kolekcija</title>
    <style>
        @media screen and (max-width: 480px) {
            .container { width: 100% !important; padding: 10px !important; }
            .hero-img { width: 100% !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0d0d; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0d0d0d; padding: 40px 10px;">
        <tr>
            <td align="center">
                
                <!-- Glavni kontejner -->
                <table class="container" border="0" cellpadding="0" cellspacing="0" width="450" style="background-color: #0d0d0d; border-collapse: collapse;">
                    
                    <!-- LOGO -->
                    <tr>
                        <td align="center" style="padding: 0 0 30px 0;">
                            <h1 style="margin: 0; font-family: 'Times New Roman', Times, serif; font-size: 26px; font-weight: 300; letter-spacing: 8px; color: #ffffff; text-transform: uppercase;">
                                <a href="https://dddesign.rs" target="_blank" style="color: #ffffff; text-decoration: none;">DDdesign</a>
                            </h1>
                        </td>
                    </tr>

                    <!-- HERO IMAGE (Ubačena nova slika iz tvoje selekcije) -->
                    <tr>
                        <td align="center">
                            <a href="https://dddesign.rs" target="_blank" style="text-decoration: none; display: block;">
                                <img class="hero-img" src="https://64.media.tumblr.com/96a1363ca099f00bbe9f826b30268731/48c4339e185bb078-a2/s2048x3072/058862b557ff3c61ba87b10a6ae425f46f208916.jpg" alt="DDdesign Nova Kolekcija" width="450" style="display: block; border: 0; width: 100%; max-width: 450px; height: auto; filter: grayscale(10%);">
                            </a>
                        </td>
                    </tr>

                    <!-- MISTERIOZNI TEKST & CTA -->
                    <tr>
                        <td align="center" style="padding: 40px 20px 20px 20px; text-align: center;">
                            <p style="margin: 0 0 10px 0; font-size: 11px; letter-spacing: 4px; color: #888888; text-transform: uppercase;">EKSKLUZIVNI PRISTUP</p>
                            
                            <h2 style="margin: 0 0 25px 0; font-family: 'Times New Roman', Times, serif; font-size: 20px; font-weight: 300; line-height: 1.4; color: #ffffff; letter-spacing: 1px;">
                                Nova kolekcija je na sajtu.
                            </h2>
                            
                            <!-- Minimalistički Link -->
                            <a href="https://dddesign.rs" target="_blank" style="display: inline-block; font-size: 12px; font-weight: bold; color: #ffffff; text-decoration: none; letter-spacing: 3px; text-transform: uppercase; border-bottom: 1px solid #ffffff; padding-bottom: 6px; transition: all 0.3s ease;">
                                NASTAVI ZA VIŠE &rarr;
                            </a>
                        </td>
                    </tr>

                    <!-- MINI FOOTER -->
                    <tr>
                        <td align="center" style="padding: 60px 20px 0 20px; text-align: center;">
                            <p style="margin: 0; font-size: 9px; letter-spacing: 2px; color: #444444; text-transform: uppercase;">
                                Količine su ograničene. <br>
                                <a href="https://dddesign.rs" style="color: #666666; text-decoration: underline; margin-top: 10px; display: inline-block;">Odjavi se</a>
                            </p>
                        </td>
                    </tr>

                </table>
                
            </td>
        </tr>
    </table>

</body>
</html>`
    },
    {
      name: '🎁 DDdesign - Posebna Pogodnost',
      subject: 'DDdesign - Privatna Ponuda (Kod: DD15) 🎁',
      body: `<!DOCTYPE html>
<html lang="sr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DDdesign - Posebna Pogodnost</title>
    <style>
        @media screen and (max-width: 480px) {
            .container { width: 100% !important; padding: 10px !important; }
            .hero-img { width: 100% !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0d0d; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0d0d0d; padding: 40px 10px;">
        <tr>
            <td align="center">
                
                <!-- Glavni kontejner -->
                <table class="container" border="0" cellpadding="0" cellspacing="0" width="450" style="background-color: #0d0d0d; border-collapse: collapse;">
                    
                    <!-- LOGO -->
                    <tr>
                        <td align="center" style="padding: 0 0 30px 0;">
                            <h1 style="margin: 0; font-family: 'Times New Roman', Times, serif; font-size: 26px; font-weight: 300; letter-spacing: 8px; color: #ffffff; text-transform: uppercase;">
                                <a href="https://dddesign.rs" target="_blank" style="color: #ffffff; text-decoration: none;">DDdesign</a>
                            </h1>
                        </td>
                    </tr>

                    <!-- HERO IMAGE (Treća slika iz tvoje selekcije) -->
                    <tr>
                        <td align="center">
                            <a href="https://dddesign.rs" target="_blank" style="text-decoration: none; display: block;">
                                <img class="hero-img" src="https://64.media.tumblr.com/add92cc3d291a576fb128c128442d39f/5ebab5061e1f89e6-e5/s2048x3072/a093b77d90d633265b188666ddb49fab1f6a6c97.jpg" alt="DDdesign Popust" width="450" style="display: block; border: 0; width: 100%; max-width: 450px; height: auto; filter: grayscale(10%);">
                            </a>
                        </td>
                    </tr>

                    <!-- MISTERIOZNI TEKST, KOD & CTA -->
                    <tr>
                        <td align="center" style="padding: 40px 20px 20px 20px; text-align: center;">
                            <p style="margin: 0 0 10px 0; font-size: 11px; letter-spacing: 4px; color: #888888; text-transform: uppercase;">PRIVATNA PONUDA</p>
                            
                            <h2 style="margin: 0 0 20px 0; font-family: 'Times New Roman', Times, serif; font-size: 20px; font-weight: 300; line-height: 1.4; color: #ffffff; letter-spacing: 1px;">
                                Iskoristi kod za dodatni popust na novu selekciju.
                            </h2>

                            <!-- Elegantni boks za promotivni kod -->
                            <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 30px auto;">
                                <tr>
                                    <td align="center" style="border: 1px dashed #444444; padding: 10px 25px;">
                                        <span style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: bold; color: #ffffff; letter-spacing: 4px;">DD15</span>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Minimalistički Link -->
                            <a href="https://dddesign.rs" target="_blank" style="display: inline-block; font-size: 12px; font-weight: bold; color: #ffffff; text-decoration: none; letter-spacing: 3px; text-transform: uppercase; border-bottom: 1px solid #ffffff; padding-bottom: 6px; transition: all 0.3s ease;">
                                PRIMENI KOD &rarr;
                            </a>
                        </td>
                    </tr>

                    <!-- MINI FOOTER -->
                    <tr>
                        <td align="center" style="padding: 60px 20px 0 20px; text-align: center;">
                            <p style="margin: 0; font-size: 9px; letter-spacing: 2px; color: #444444; text-transform: uppercase;">
                                Ponuda važi ograničeno vreme. <br>
                                <a href="https://dddesign.rs" style="color: #666666; text-decoration: underline; margin-top: 10px; display: inline-block;">Odjavi se</a>
                            </p>
                        </td>
                    </tr>

                </table>
                
            </td>
        </tr>
    </table>

</body>
</html>`
    },
    {
      name: 'DDdesign - Lični Šablon',
      subject: 'DDdesign - Lični Šablon',
      body: `<!DOCTYPE html>
<html lang="sr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DDdesign - Lični šablon</title>
    <style>
        @media screen and (max-width: 480px) {
            .container { width: 100% !important; padding: 10px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0d0d; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0d0d0d; padding: 40px 10px;">
        <tr>
            <td align="center">
                
                <!-- Glavni kontejner -->
                <table class="container" border="0" cellpadding="0" cellspacing="0" width="450" style="background-color: #0d0d0d; border-collapse: collapse; max-width: 450px; width: 100%;">
                    
                    <!-- LOGO -->
                    <tr>
                        <td align="center" style="padding: 0 0 30px 0;">
                            <h1 style="margin: 0; font-family: 'Times New Roman', Times, serif; font-size: 26px; font-weight: 300; letter-spacing: 8px; color: #ffffff; text-transform: uppercase;">
                                <a href="https://dddesign.rs" target="_blank" style="color: #ffffff; text-decoration: none;">DDdesign</a>
                            </h1>
                        </td>
                    </tr>

                    <!-- PROSTOR ZA LIČNI TEKST -->
                    <tr>
                        <td align="center" style="padding: 40px 20px 20px 20px; text-align: center;">
                            <p style="margin: 0 0 10px 0; font-size: 11px; letter-spacing: 4px; color: #888888; text-transform: uppercase;">EKSKLUZIVNO OBAVEŠTENJE</p>
                            
                            <h2 style="margin: 0 0 25px 0; font-family: 'Times New Roman', Times, serif; font-size: 20px; font-weight: 300; line-height: 1.4; color: #ffffff; letter-spacing: 1px;">
                                [Ovde unesite vaš naslov]
                            </h2>
                            
                            <p style="margin: 0 0 35px 0; font-size: 14px; line-height: 1.6; color: #cccccc; letter-spacing: 0.5px;">
                                [Ovde unesite vaš lični tekst poruke koji želite da pošaljete svojim pretplatnicima. Šablon zadržava prepoznatljivu tamnu i elegantnu estetiku DDdesign brenda sa Times logotipom.]
                            </p>
                            
                            <!-- Minimalistički Link -->
                            <a href="https://dddesign.rs" target="_blank" style="display: inline-block; font-size: 12px; font-weight: bold; color: #ffffff; text-decoration: none; letter-spacing: 3px; text-transform: uppercase; border-bottom: 1px solid #ffffff; padding-bottom: 6px; transition: all 0.3s ease;">
                                NASTAVI ZA VIŠE &rarr;
                            </a>
                        </td>
                    </tr>

                    <!-- MINI FOOTER -->
                    <tr>
                        <td align="center" style="padding: 60px 20px 0 20px; text-align: center;">
                            <p style="margin: 0; font-size: 9px; letter-spacing: 2px; color: #444444; text-transform: uppercase;">
                                Količine su ograničene. <br>
                                <a href="https://dddesign.rs" style="color: #666666; text-decoration: underline; margin-top: 10px; display: inline-block;">Odjavi se</a>
                            </p>
                        </td>
                    </tr>

                </table>
                
            </td>
        </tr>
    </table>

</body>
</html>`
    }
  ];

  const handleApplyTemplate = (tpl: typeof templates[0]) => {
    showConfirm(
      'Zameni sadržaj poruke?',
      'Ovo će zameniti trenutni naslov i sadržaj poruke izabranim šablonom. Da li želite da nastavite?',
      () => {
        setSubject(tpl.subject);
        setHtmlBody(tpl.body);
      },
      'Zameni šablon',
      'Otkaži'
    );
  };

  // Load Manual Subscribers from Supabase or LocalStorage fallback
  const loadManualSubscribers = async () => {
    try {
      setDbError(null);
      let data: any[] = [];
      let detectedTable: 'Newsletter_list' | 'newsletter_list' | 'newsletter_subscribers' | null = null;

      // 1. Attempt to fetch from Supabase table 'Newsletter_list' first (case sensitive check)
      const resCase = await supabase
        .from('Newsletter_list')
        .select('*');

      if (!resCase.error) {
        data = resCase.data || [];
        detectedTable = 'Newsletter_list';
      } else {
        // Fallback to lowercase 'newsletter_list'
        const resLower = await supabase
          .from('newsletter_list')
          .select('*');
        if (!resLower.error) {
          data = resLower.data || [];
          detectedTable = 'newsletter_list';
        } else {
          // Fallback to legacy 'newsletter_subscribers'
          const resLegacy = await supabase
            .from('newsletter_subscribers')
            .select('*');
          if (!resLegacy.error) {
            data = resLegacy.data || [];
            detectedTable = 'newsletter_subscribers';
          } else {
            // If all tables failed, we throw an error with the details so the user can diagnose
            const errMsg = `Nije pronađena nijedna tabela u bazi podataka.\n` +
                           `- Newsletter_list: ${resCase.error?.message || 'nepoznato'}\n` +
                           `- newsletter_list: ${resLower.error?.message || 'nepoznato'}\n` +
                           `- newsletter_subscribers: ${resLegacy.error?.message || 'nepoznato'}`;
            throw new Error(errMsg);
          }
        }
      }

      // Map rows (Newsletter_list has 'Mails' column, other tables have 'email' or 'mail')
      const mapped = (data || []).map((row: any) => {
        const emailVal = row.Mails || row.mails || row.mail || row.email || '';
        return {
          id: String(row.id),
          email: emailVal,
          name: row.name || emailVal.split('@')[0] || 'Pretplatnik',
          created_at: row.created_at || new Date().toISOString()
        };
      });

      setManualSubscribers(mapped);
      setActiveTable(detectedTable);
      setDbStatus('supabase');
    } catch (e: any) {
      console.error('Newsletter load error:', e);
      setDbError(e.message || String(e));
      setActiveTable(null);
      setDbStatus('local');

      // Fallback to LocalStorage
      const localData = localStorage.getItem('dddesign_manual_subscribers');
      if (localData) {
        try {
          setManualSubscribers(JSON.parse(localData));
        } catch (jsonErr) {
          console.error(jsonErr);
        }
      }
    }
  };

  // Helper to attempt insertion into Supabase tables
  const insertSubscriberToSupabase = async (email: string, name: string) => {
    // If we already detected a working table, try that one first!
    if (activeTable) {
      if (activeTable === 'Newsletter_list') {
        // Try inserting with Mails first, then mail
        const { error: errMails } = await supabase.from(activeTable).insert([{ Mails: email }]);
        if (!errMails) return { success: true, table: activeTable };

        const { error: errMail } = await supabase.from(activeTable).insert([{ mail: email }]);
        if (!errMail) return { success: true, table: activeTable };
      } else if (activeTable === 'newsletter_list') {
        const { error } = await supabase.from(activeTable).insert([{ mail: email }]);
        if (!error) return { success: true, table: activeTable };
      } else {
        const { error } = await supabase.from(activeTable).insert([{ email, name }]);
        if (!error) return { success: true, table: activeTable };
      }
    }

    // Otherwise (or if activeTable insert failed), try all potential tables sequentially
    const { error: err1 } = await supabase.from('Newsletter_list').insert([{ Mails: email }]);
    if (!err1) return { success: true, table: 'Newsletter_list' };

    const { error: err1b } = await supabase.from('Newsletter_list').insert([{ mail: email }]);
    if (!err1b) return { success: true, table: 'Newsletter_list' };

    const { error: err2 } = await supabase.from('newsletter_list').insert([{ mail: email }]);
    if (!err2) return { success: true, table: 'newsletter_list' };

    const { error: err3 } = await supabase.from('newsletter_subscribers').insert([{ email, name }]);
    if (!err3) return { success: true, table: 'newsletter_subscribers' };

    // If everything failed, return false with errors
    return {
      success: false,
      error: `Tabela nije detektovana ili upis nije dozvoljen u bazi podataka.\n` +
             `- Newsletter_list (Mails): ${err1?.message || 'nepoznato'}\n` +
             `- Newsletter_list (mail): ${err1b?.message || 'nepoznato'}\n` +
             `- newsletter_list: ${err2?.message || 'nepoznato'}\n` +
             `- newsletter_subscribers: ${err3?.message || 'nepoznato'}`
    };
  };

  // Helper to attempt deletion from Supabase tables
  const deleteSubscriberFromSupabase = async (email: string) => {
    if (activeTable) {
      if (activeTable === 'Newsletter_list') {
        const { error: errMails } = await supabase.from(activeTable).delete().eq('Mails', email);
        if (!errMails) return { success: true };

        const { error: errMail } = await supabase.from(activeTable).delete().eq('mail', email);
        if (!errMail) return { success: true };
      } else if (activeTable === 'newsletter_list') {
        const { error } = await supabase.from(activeTable).delete().eq('mail', email);
        if (!error) return { success: true };
      } else {
        const { error } = await supabase.from(activeTable).delete().eq('email', email);
        if (!error) return { success: true };
      }
    }

    // Try all of them sequentially
    const { error: err1 } = await supabase.from('Newsletter_list').delete().eq('Mails', email);
    if (!err1) return { success: true };

    const { error: err1b } = await supabase.from('Newsletter_list').delete().eq('mail', email);
    if (!err1b) return { success: true };

    const { error: err2 } = await supabase.from('newsletter_list').delete().eq('mail', email);
    if (!err2) return { success: true };

    const { error: err3 } = await supabase.from('newsletter_subscribers').delete().eq('email', email);
    if (!err3) return { success: true };

    return {
      success: false,
      error: `Neuspešno brisanje iz baze.\n` +
             `- Newsletter_list (Mails): ${err1?.message || 'nepoznato'}\n` +
             `- Newsletter_list (mail): ${err1b?.message || 'nepoznato'}\n` +
             `- newsletter_list: ${err2?.message || 'nepoznato'}\n` +
             `- newsletter_subscribers: ${err3?.message || 'nepoznato'}`
    };
  };

  // Add Manual Subscriber
  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmail.trim().toLowerCase();
    const defaultName = cleanEmail.split('@')[0] || 'Pretplatnik';

    if (!cleanEmail) return;

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      alert('Unesite validnu e-mail adresu.');
      return;
    }

    // Check duplicate locally first
    const exists = manualSubscribers.some(sub => sub.email.toLowerCase() === cleanEmail);
    if (exists) {
      alert('Ova e-mail adresa je već na listi.');
      return;
    }

    const newSub: Subscriber = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      email: cleanEmail,
      name: defaultName,
      created_at: new Date().toISOString()
    };

    let savedToSupabase = false;
    try {
      // Always attempt to write to Supabase
      const result = await insertSubscriberToSupabase(cleanEmail, defaultName);
      if (result.success) {
        savedToSupabase = true;
        setActiveTable(result.table as any);
        setDbStatus('supabase');
        setDbError(null);
        await loadManualSubscribers();
      } else {
        console.warn('Database insert failed, using local storage fallback:', result.error);
        // Inform user with full details of why it failed so they can copy the SQL if needed
        alert('Baza podataka: Nije uspelo upisivanje u bazu jer tabela verovatno ne postoji ili polise blokiraju pristup.\n\nDetalji greške:\n' + result.error + '\n\nMejl je privremeno upisan lokalno u pretraživač.');
      }
    } catch (err: any) {
      console.error('Error in handleAddSubscriber:', err);
    }

    if (!savedToSupabase) {
      // LocalStorage save fallback
      const updated = [newSub, ...manualSubscribers];
      setManualSubscribers(updated);
      localStorage.setItem('dddesign_manual_subscribers', JSON.stringify(updated));
    }

    setNewEmail('');
  };

  // Delete Manual Subscriber
  const handleDeleteSubscriber = async (id: string, email: string) => {
    showConfirm(
      'Ukloni pretplatnika?',
      `Da li ste sigurni da želite da uklonite "${email}" iz baze newslettera?`,
      async () => {
        let deletedFromSupabase = false;
        try {
          const result = await deleteSubscriberFromSupabase(email);
          if (result.success) {
            deletedFromSupabase = true;
            setDbError(null);
            await loadManualSubscribers();
          } else {
            console.warn('Supabase delete failed, using local storage fallback:', result.error);
          }
        } catch (err: any) {
          console.error('Error in handleDeleteSubscriber:', err);
        }

        // Always keep UI in sync by removing it from local list as well if Supabase deletion didn't trigger reload
        if (!deletedFromSupabase) {
          const updated = manualSubscribers.filter(sub => sub.id !== id);
          setManualSubscribers(updated);
          localStorage.setItem('dddesign_manual_subscribers', JSON.stringify(updated));
        }
      },
      'Ukloni',
      'Otkaži'
    );
  };

  // Seed the Supabase database with mock/test emails
  const handleSeedDatabase = async () => {
    if (dbStatus !== 'supabase' || !activeTable) {
      showAlert('Tabela nije aktivna', 'Tabela nije aktivna u bazi. Prvo kreirajte tabelu prateći SQL uputstvo ispod.', 'warning');
      return;
    }

    const testEmails = [
      'srdjandzodan4@gmail.com',
      'promocija@dddesign.rs',
      'office@dddesign.rs',
      'kupac@dddesign.rs'
    ];

    showConfirm(
      'Popuni test adresama?',
      `Da li želite da automatski popunite tabelu "${activeTable}" sa ${testEmails.length} test adresa (uključujući vašu)?`,
      async () => {
        setSending(true);
        let successCount = 0;
        let failCount = 0;
        const errors: string[] = [];

        for (const email of testEmails) {
          try {
            const result = await insertSubscriberToSupabase(email, email.split('@')[0]);
            if (result.success) {
              successCount++;
            } else {
              failCount++;
              errors.push(`${email}: ${result.error}`);
            }
          } catch (err: any) {
            failCount++;
            errors.push(`${email}: ${err.message || String(err)}`);
          }
        }

        setSending(false);
        await loadManualSubscribers();

        if (failCount === 0) {
          showAlert('Popunjavanje završeno', `Uspešno popunjena baza! Dodato je svih ${successCount} test adresa u tabelu "${activeTable}".`, 'success');
        } else {
          showAlert('Greška pri popunjavanju', `Završeno popunjavanje sa greškama.\n- Uspešno: ${successCount}\n- Neuspešno: ${failCount}\n\nGreške:\n${errors.slice(0, 3).join('\n')}`, 'error');
        }
      },
      'Da, popuni',
      'Otkaži'
    );
  };

  // Import local storage emails to Supabase
  const handleImportLocalToSupabase = async () => {
    if (dbStatus !== 'supabase' || !activeTable) {
      showAlert('Tabela nije aktivna', 'Tabela nije aktivna u bazi. Prvo kreirajte tabelu prateći SQL uputstvo ispod.', 'warning');
      return;
    }

    const localData = localStorage.getItem('dddesign_manual_subscribers');
    if (!localData) {
      showAlert('Nema lokalnih adresa', 'Nema lokalnih adresa u memoriji pretraživača za uvoz.', 'warning');
      return;
    }

    let localEmails: any[] = [];
    try {
      localEmails = JSON.parse(localData);
    } catch (e) {
      showAlert('Greška', 'Greška pri čitanju lokalnih podataka.', 'error');
      return;
    }

    if (localEmails.length === 0) {
      showAlert('Lista je prazna', 'Lista lokalnih adresa je prazna.', 'warning');
      return;
    }

    showConfirm(
      'Uvezi adrese?',
      `Da li želite da uvezete ${localEmails.length} lokalno sačuvanih adresa u tabelu "${activeTable}"?`,
      async () => {
        setSending(true);
        let successCount = 0;
        let failCount = 0;
        const errors: string[] = [];

        for (const sub of localEmails) {
          try {
            const result = await insertSubscriberToSupabase(sub.email, sub.name);
            if (result.success) {
              successCount++;
            } else {
              failCount++;
              errors.push(`${sub.email}: ${result.error}`);
            }
          } catch (err: any) {
            failCount++;
            errors.push(`${sub.email}: ${err.message || String(err)}`);
          }
        }

        setSending(false);
        await loadManualSubscribers();

        if (failCount === 0) {
          showAlert('Uvoz završen', `Sve adrese (${successCount}) su uspešno uvezene u tabelu "${activeTable}"!`, 'success');
        } else {
          showAlert('Greške pri uvozu', `Uvoz završen sa greškama.\n- Uspešno uvezeno: ${successCount}\n- Neuspešno: ${failCount}\n\nGreške:\n${errors.slice(0, 3).join('\n')}`, 'error');
        }
      },
      'Da, uvezi',
      'Otkaži'
    );
  };

  // Sync recipient selection list (Privacy-focused: only manual subscribers)
  useEffect(() => {
    const list: string[] = [];

    // Add manual subscribers
    manualSubscribers.forEach(s => {
      if (!list.includes(s.email)) list.push(s.email);
    });

    setSelectedSubscribers(list);
  }, [manualSubscribers]);

  useEffect(() => {
    loadManualSubscribers();
    fetchSmtpConfig();
  }, []);

  // Send newsletter to everyone on single click
  const handleSendEmails = async () => {
    if (selectedSubscribers.length === 0) {
      showAlert('Nema primalaca', 'Nema odabranih primalaca za slanje.', 'warning');
      return;
    }

    if (!subject.trim()) {
      showAlert('Nedostaje naslov', 'Naslov e-maila ne može biti prazan.', 'warning');
      return;
    }

    if (!htmlBody.trim()) {
      showAlert('Nedostaje sadržaj', 'Sadržaj e-maila ne može biti prazan.', 'warning');
      return;
    }

    const confirmMsg = `Spremate se da pošaljete ovaj e-mail na adresu ukupno ${selectedSubscribers.length} primalaca preko SMTP2GO naloga sa senderom: "${smtpConfig.sender}".`;
    
    showConfirm(
      'Pokreni slanje?',
      confirmMsg + '\n\nDa li ste apsolutno sigurni da želite da pokrenete slanje?',
      async () => {
        setSending(true);
        setSendSuccess(null);
        setSendError(null);

        try {
          const res = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              subject: subject.trim(),
              htmlBody: htmlBody.trim(),
              recipients: selectedSubscribers,
              customApiKey: customApiKey || undefined,
              customSender: customSender || undefined
            })
          });

          const data = await res.json();

          if (!res.ok) {
            const errorMsg = data.error || 'Neuspešno povezivanje sa serverom.';
            const detailsStr = data.details ? `\n\nDetalji servera:\n${JSON.stringify(data.details, null, 2)}` : '';
            throw new Error(errorMsg + detailsStr);
          }

          setSendSuccess(`Uspešno poslato! Poslat je e-mail na ukupno ${selectedSubscribers.length} primalaca preko SMTP2GO naloga.`);
          showAlert('Slanje uspešno', `E-mail je uspešno poslat na ukupno ${selectedSubscribers.length} primalaca preko SMTP2GO.`, 'success');
        } catch (err: any) {
          console.error(err);
          setSendError(err.message || 'Greška pri slanju mejlova. Proverite serverski log i API ključ.');
          showAlert('Greška pri slanju', err.message || 'Slanje preko SMTP2GO nije uspelo.', 'error');
        } finally {
          setSending(false);
        }
      },
      'Da, pošalji',
      'Otkaži'
    );
  };

  const totalTargetCount = selectedSubscribers.length;

  return (
    <div className="space-y-6 animate-fade-in text-left">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Subscribers & Add Manual Form (4 cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Quick Stats & Toggles */}
          <div className="bg-zinc-900/90 p-5 rounded-3xl border border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-bold text-white text-sm font-display flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Users className="h-4 w-4 text-indigo-400" />
              Baza Primalaca Newslettera
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 bg-zinc-950/70 rounded-xl border border-zinc-800 text-center">
                <span className="text-xs text-zinc-400">Ukupno selektovano primalaca za slanje:</span>
                <div className="text-2xl font-black text-indigo-400 font-mono mt-1 flex items-center justify-center gap-1.5">
                  <span>{totalTargetCount}</span>
                  <span className="text-xs font-semibold text-zinc-500">mejlova</span>
                </div>
              </div>
              <p className="text-[10px] text-zinc-400 text-center leading-normal">
                Slanje se obavlja isključivo verifikovanim pretplatnicima iz vaše baze koji su dali eksplicitan pristanak za primanje newslettera.
              </p>
            </div>
          </div>

          {/* Add Manual Form */}
          <div className="bg-zinc-900/90 p-5 rounded-3xl border border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-bold text-white text-sm font-display flex items-center gap-2 border-b border-zinc-800 pb-3">
              <UserPlus className="h-4 w-4 text-indigo-400" />
              Dodaj Ručno Pretplatnika
            </h3>

            <form onSubmit={handleAddSubscriber} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">E-mail adresa (Obavezno)</label>
                <input 
                  type="email"
                  required
                  placeholder="npr. klijent@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full text-xs p-2.5 bg-zinc-950 text-white placeholder-zinc-500 hover:bg-zinc-900 focus:bg-zinc-900 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl transition-all font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Dodaj u newsletter listu
              </button>
            </form>
          </div>

          {/* Manual Subscribers List Card */}
          <div className="bg-zinc-900/90 p-5 rounded-3xl border border-zinc-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-white text-sm font-display flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-emerald-400" />
                Ručno Dodati ({manualSubscribers.length})
              </h3>
              <div className="flex items-center gap-1.5">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  dbStatus === 'supabase' ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60' : 'bg-amber-950/70 text-amber-300 border border-amber-800/60'
                }`}>
                  {dbStatus === 'supabase' ? 'Baza' : 'Lokalno'}
                </span>
                <button
                  type="button"
                  onClick={loadManualSubscribers}
                  title="Osveži status tabele baze"
                  className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
              </div>
            </div>

            {manualSubscribers.length === 0 ? (
              <div className="text-center py-6 bg-zinc-950/70 rounded-xl border border-zinc-800">
                <p className="text-[11px] text-zinc-400">Nema ručno dodatih adresa.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                {manualSubscribers.map((sub, idx) => (
                  <div key={sub.id ? `${sub.id}-${idx}` : idx} className="p-2.5 bg-zinc-950/70 border border-zinc-800/80 rounded-xl flex justify-between items-center gap-2 group hover:bg-zinc-900/60 transition-colors">
                    <div className="overflow-hidden">
                      <span className="text-xs font-bold text-zinc-100 block truncate">{sub.name}</span>
                      <span className="text-[10px] text-zinc-400 font-mono block truncate">{sub.email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-all"
                      title="Obriši"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Actions for Database Seeding/Importing */}
            {dbStatus === 'supabase' && (
              <div className="pt-3.5 border-t border-zinc-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Brze akcije baze:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <button
                    type="button"
                    onClick={handleSeedDatabase}
                    className="py-1.5 px-2 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 font-bold rounded-xl text-[10px] transition-all cursor-pointer border border-emerald-900/60 flex items-center justify-center gap-1.5"
                  >
                    📥 Popuni test
                  </button>
                  <button
                    type="button"
                    onClick={handleImportLocalToSupabase}
                    disabled={!localStorage.getItem('dddesign_manual_subscribers')}
                    className="py-1.5 px-2 bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 font-bold rounded-xl text-[10px] transition-all cursor-pointer border border-indigo-900/60 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    🚀 Uvezi lokalne
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Composer & Templates (8 cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Templates Drawer */}
          <div className="bg-zinc-900/90 p-5 rounded-3xl border border-zinc-800 shadow-sm space-y-3.5">
            <h3 className="font-bold text-xs tracking-wider uppercase font-mono text-zinc-400">
              Brzi šabloni za slanje
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {templates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="p-3 border border-zinc-800 hover:border-indigo-500/60 bg-zinc-950/70 hover:bg-zinc-900 rounded-2xl text-left transition-all space-y-1.5 group cursor-pointer"
                >
                  <span className="text-xs font-bold text-indigo-300 group-hover:text-indigo-200 flex items-center justify-between">
                    {tpl.name}
                    <Sparkles className="h-3 w-3 text-indigo-400 group-hover:animate-pulse" />
                  </span>
                  <p className="text-[10px] text-zinc-400 leading-normal line-clamp-2">
                    {tpl.subject}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* E-mail Composer Panel */}
          <div className="bg-zinc-900/90 p-6 rounded-3xl border border-zinc-800 shadow-sm space-y-5">
            
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <div>
                <h3 className="font-bold text-white text-base font-display">Sastavljanje Marketing Poruke</h3>
                <p className="text-[11px] text-zinc-400">Kreirajte predivne HTML poruke koje privlače kupce na sajt.</p>
              </div>

              {/* Composer Mode Selector */}
              <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setPreviewTab('edit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    previewTab === 'edit' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Uređivač
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    previewTab === 'preview' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Prikaz
                </button>
              </div>
            </div>

            {/* Composer Body fields */}
            <div className="space-y-4">
              {/* Subject Input */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Naslov poruke (Subject)</label>
                <input 
                  type="text"
                  placeholder="npr. 🌟 Vikend Akcija na DDDesign!"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-sm p-3 bg-zinc-950 text-white placeholder-zinc-500 hover:bg-zinc-900 focus:bg-zinc-900 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl transition-all font-semibold"
                />
              </div>

              {/* Edit View */}
              {previewTab === 'edit' ? (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Sadržaj poruke (HTML dozvoljen)</label>
                    <span className="text-[10px] text-zinc-500 font-mono">Generiše prelepe stilizovane kampanje</span>
                  </div>
                  <textarea 
                    rows={12}
                    value={htmlBody}
                    onChange={(e) => setHtmlBody(e.target.value)}
                    className="w-full text-xs p-4 bg-zinc-950 text-zinc-100 placeholder-zinc-500 hover:bg-zinc-900 focus:bg-zinc-900 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl transition-all font-mono leading-relaxed"
                    placeholder="Unesite HTML kod ili tekst..."
                  />
                </div>
              ) : (
                /* Live HTML Preview inside styled div */
                <div className="space-y-2">
                  <span className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Pregled e-mail izgleda (Kako primalac vidi poruku)</span>
                  <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950">
                    <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 text-xs font-mono text-zinc-400 flex justify-between">
                      <span>Od: <strong className="text-zinc-200">{smtpConfig.sender}</strong></span>
                      <span>Naslov: <strong className="text-zinc-200">{subject}</strong></span>
                    </div>
                    <div className="p-6 bg-zinc-950 max-h-[400px] overflow-y-auto">
                      <div 
                        className="max-w-none text-left"
                        dangerouslySetInnerHTML={{ __html: htmlBody }} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error & Success banners */}
            {sendError && (
              <div className="p-4 bg-rose-950/40 border border-rose-900/60 rounded-2xl text-rose-300 text-xs flex gap-3 items-start animate-fade-in">
                <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-bold text-rose-200">Greška prilikom slanja!</h4>
                  <p>{sendError}</p>
                </div>
              </div>
            )}

            {sendSuccess && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-900/60 rounded-2xl text-emerald-300 text-xs flex gap-3 items-start animate-fade-in">
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-bold text-emerald-200">Kampanja uspešno poslata!</h4>
                  <p>{sendSuccess}</p>
                </div>
              </div>
            )}

            {/* ONE CLICK SEND ACTIONS */}
            <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Clock className="h-4 w-4 text-zinc-500" />
                <span>Nakon klika, poruka se šalje svima i ne može se povući.</span>
              </div>

              <button
                type="button"
                disabled={sending || selectedSubscribers.length === 0}
                onClick={handleSendEmails}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Slanje e-mailova...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>POŠALJI SVIMA ({selectedSubscribers.length})</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Custom Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in">
          <div className="bg-zinc-900 rounded-3xl w-full max-w-md shadow-2xl border border-zinc-800 overflow-hidden text-left">
            <div className="bg-zinc-950 p-5 border-b border-zinc-800 flex items-center gap-3">
              <div className="p-2.5 bg-indigo-950/60 border border-indigo-800/60 text-indigo-400 rounded-xl">
                <HelpCircle className="h-6 w-6 stroke-[2.5]" />
              </div>
              <h4 className="font-extrabold text-white text-base">{confirmModal.title}</h4>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                {confirmModal.message}
              </p>
              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 text-xs font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl transition-colors cursor-pointer"
                >
                  {confirmModal.cancelText || 'Otkaži'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const cb = confirmModal.onConfirm;
                    setConfirmModal(null);
                    cb();
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  {confirmModal.confirmText || 'Potvrdi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal */}
      {alertModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in">
          <div className="bg-zinc-900 rounded-3xl w-full max-w-md shadow-2xl border border-zinc-800 overflow-hidden text-left">
            <div className={`p-5 border-b flex items-center gap-3 ${
              alertModal.type === 'error' ? 'bg-rose-950/50 border-rose-900/60 text-rose-200' :
              alertModal.type === 'success' ? 'bg-emerald-950/50 border-emerald-900/60 text-emerald-200' :
              alertModal.type === 'warning' ? 'bg-amber-950/50 border-amber-900/60 text-amber-200' :
              'bg-zinc-950 border-zinc-800 text-white'
            }`}>
              <div className={`p-2.5 rounded-xl ${
                alertModal.type === 'error' ? 'bg-rose-900/60 text-rose-300 border border-rose-800/60' :
                alertModal.type === 'success' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-800/60' :
                alertModal.type === 'warning' ? 'bg-amber-900/60 text-amber-300 border border-amber-800/60' :
                'bg-zinc-800 text-zinc-300 border border-zinc-700'
              }`}>
                {alertModal.type === 'error' ? <AlertTriangle className="h-6 w-6" /> :
                 alertModal.type === 'success' ? <Check className="h-6 w-6" /> :
                 alertModal.type === 'warning' ? <AlertCircle className="h-6 w-6" /> :
                 <Info className="h-6 w-6" />}
              </div>
              <h4 className="font-extrabold text-base">{alertModal.title}</h4>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                {alertModal.message}
              </p>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setAlertModal(null)}
                  className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition-colors shadow-xs cursor-pointer ${
                    alertModal.type === 'error' ? 'bg-rose-600 hover:bg-rose-500' :
                    alertModal.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-500' :
                    alertModal.type === 'warning' ? 'bg-amber-600 hover:bg-amber-500' :
                    'bg-indigo-600 hover:bg-indigo-500'
                  }`}
                >
                  U redu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
