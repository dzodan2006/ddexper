import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CreditCard, Truck, CheckCircle, Package, User, MapPin, Mail, Phone, ShoppingBag, ShieldCheck, XCircle, AlertTriangle, Tag, Percent, X } from 'lucide-react';
import { CartItem, PromoCode } from '../types';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';

const getSerbianErrorMessage = (statusCode?: string, statusMessage?: string) => {
  if (!statusCode) return statusMessage || "Molimo pokušajte ponovo.";
  
  const translations: Record<string, string> = {
    "0000": "Transakcija je uspešno obavljena.",
    "1001": "Odbijeno od strane banke: sumnja na prevaru.",
    "1002": "Odbijeno od strane banke: problem sa karticom, kontaktirajte banku.",
    "1003": "Problem sa karticom. Pokušajte ponovo sa drugom karticom ili izaberite plaćanje pouzećem.",
    "1004": "Transakcija nije dozvoljena na ovoj kartici.",
    "1005": "Kartica je prijavljena kao izgubljena. Transakcija je odbijena.",
    "1006": "Kartica je prijavljena kao ukradena. Transakcija je odbijena.",
    "1007": "Dupla transakcija. Porudžbina je već registrovana.",
    "1009": "Ova valuta nije podržana.",
    "2001": "Kartica ima ograničenu upotrebu.",
    "2002": "Sistemska greška kod prodajnog mesta (neispravan nalog u RaiAccept sistemu).",
    "2003": "Iznos transakcije nije ispravan.",
    "2004": "Nedovoljno sredstava na računu. Molimo dopunite račun ili koristite drugu karticu.",
    "2005": "Iznos kredita premašuje iznos originalne transakcije.",
    "2006": "Neuspešna 3D Secure autorizacija (korisnik nije ispravno uneo SMS kod ili kod iz aplikacije banke).",
    "2007": "3D Secure autorizacija je neuspešna zbog nepoznatog uređaja.",
    "2008": "3D Secure autorizacija je neuspešna zbog nepodržanog uređaja.",
    "2009": "Prekoračen broj 3D Secure pokušaja za ovu karticu.",
    "2010": "Kartica nije registrovana u 3D Secure programu banke izdavaoca.",
    "2011": "Greška pri prenosu sigurnosnih 3D Secure ključeva.",
    "2012": "Kartica nije aktivirana za online plaćanje.",
    "2013": "Prekoračen maksimalan broj pokušaja (challenges). Pokušajte sa drugom karticom.",
    "2014": "Nenaplativa autentifikacija (NPA) nije podržana za ovu karticu.",
    "2015": "Banka izdavalac kartice je odbila transakciju (3RI neuspešan).",
    "2016": "Sistem banke izdavaoca za 3D autorizaciju trenutno nije dostupan.",
    "2017": "Greška u 3D Secure autorizaciji. Proverite CVV kod.",
    "2018": "3D Secure autorizacija je istekla. Korisnik nije autorizovao plaćanje na vreme.",
    "2019": "Nedovoljno vremena za obavljanje autorizacije.",
    "2020": "3D Secure autentifikacija je započeta ali je korisnik prekinuo.",
    "2021": "Banka izdavalac nije odgovorila u definisanom roku.",
    "2022": "Prekoračen dnevni ili mesečni limit za transakcije na kartici.",
    "3001": "Zahteva se Strong Customer Authentication sa 3D Secure.",
    "3002": "Kartica je istekla. Koristite važeću karticu.",
    "3003": "Banka ne može da potvrdi broj kartice / račun. Proverite unete cifre.",
    "3004": "Kartica je istekla ili je unet nevažeći datum isteka.",
    "3005": "Netačan sigurnosni kod sa poleđine kartice (CVV/CVC kod). Proverite i unesite ponovo.",
    "3006": "Tehnička greška u procesiranju transakcije kod procesora.",
    "3007": "Tehnička greška na strani platne šeme.",
    "3008": "Nije moguće završiti 3D Secure autentifikaciju zbog neispravnih podataka.",
    "3009": "Banka izdavalac je odbila plaćanje zbog niskog stepena poverenja (rizična transakcija).",
    "3010": "Banka izdavalac je odbila plaćanje zbog srednjeg stepena rizika.",
    "3011": "Banka izdavalac je odbila plaćanje zbog visokog stepena rizika.",
    "3012": "Banka izdavalac je automatski odbila plaćanje zbog veoma visokog bezbednosnog rizika.",
    "3013": "Metod autentifikacije koji preferirate nije podržan za ovu karticu.",
    "3014": "Greška bezbednosne polise pretraživača tokom autentifikacije.",
    "3015": "Banka izdavalac kartice je nevažeća ili nije prepoznata.",
    "3016": "Banka izdavalac kartice je trenutno nedostupna. Pokušajte ponovo kasnije.",
    "3017": "Potencijalni bezbednosni problem sa karticom. Banka je odbila plaćanje.",
    "4001": "Kartica je odbijena od strane banke izdavaoca iz opštih razloga.",
    "5001": "Preveliki broj pokušaja plaćanja u okviru jedne sesije.",
    "5002": "Ova transakcija nije dozvoljena usled internih pravila prevencije prevara.",
    "7001": "Povraćaj sredstava nije moguć zbog neispravnih podataka.",
    "7002": "Greška u odgovoru procesora prilikom obrade zahteva.",
    "7003": "Tehnička greška u servisu za tokenizaciju transakcija.",
    "7004": "Tehnička greška. Transakcija nije procesirana.",
    "7005": "Greška u validaciji podataka transakcije.",
    "7006": "Transakcija je predugo trajala i automatski je otkazana na prolazu.",
    "7007": "Tehnička greška u storniranju transakcije.",
    "7008": "Autentifikacija je odbijena na 3D secure ruteru.",
    "7009": "Ovaj brend kartice nije podržan od strane Vaše banke primaoca.",
    "7010": "Tehnička greška u infrastrukturi prolaza. Sredstva nisu skinuta, pokušajte ponovo.",
    "7011": "Tehnička greška u komunikaciji sa procesorom. Sredstva nisu skinuta, pokušajte ponovo.",
    "9999": "Nepoznata tehnička greška. Molimo kontaktirajte korisničku podršku."
  };

  return translations[statusCode] || statusMessage || "Molimo pokušajte ponovo sa drugom karticom ili izaberite plaćanje pouzećem.";
};

import { useLanguage } from '../context/LanguageContext';

const checkoutTranslations = {
  sr: {
    backBtn: "Nazad",
    titleInfo: "Lični podaci",
    descInfo: "Unesite informacije za dostavu vaše porudžbine.",
    firstName: "Ime",
    firstNamePl: "npr. Marko",
    lastName: "Prezime",
    lastNamePl: "npr. Marković",
    email: "Email",
    emailPl: "marko@email.com",
    phone: "Telefon",
    phonePl: "06x xxx xxxx",
    address: "Adresa i broj",
    addressPl: "Kralja Petra 12",
    city: "Grad",
    cityPl: "Beograd",
    zip: "Poštanski broj",
    zipPl: "11000",
    continuePayment: "Nastavi na plaćanje",
    
    titlePayment: "Način plaćanja",
    descPayment: "Odaberite kako želite da platite svoju porudžbinu.",
    codTitle: "Plaćanje pouzećem",
    codDesc: "Platite kuriru prilikom preuzimanja.",
    cardTitle: "Platna kartica",
    cardDesc: "Sigurno plaćanje putem vaše kartice.",
    
    securePayment: "Sigurno online plaćanje",
    secureNote: "Kartično plaćanje je omogućila Raiffeisen Banka. Sva komunikacija je zaštićena.",
    supportedCards: "Podržane kartice:",
    security3D: "3D Secure Zaštita:",
    
    finishOrder: "Završi porudžbinu",
    processing: "Obrađujem...",
    
    summaryTitle: "Pregled porudžbine",
    totalItems: "Artikli",
    subtotal: "Međuzbir",
    shipping: "Dostava",
    shippingFree: "Besplatna",
    grandTotal: "Ukupno za uplatu",
    promoTitle: "Promo kod za popust",
    promoPlaceholder: "Unesite promo kod...",
    promoApply: "Primeni",
    promoDiscount: "Popust",
    promoApplied: "Primenjen kod",
    promoRemove: "Ukloni",
    securityGuarantee: "Sigurna kupovina",
    securitySSL: "Sigurna kupovina i zaštita podataka. Svi vaši podaci su enkriptovani i bezbedni.",
    handmadeNotice: "Svi modeli DD Design su unikatni i ručno izrađeni. Isporuka za modele koji nisu na stanju je 5-10 radnih dana.",
    
    successTitle: "Hvala na poverenju!",
    successDesc: 'Vaša porudžbina je uspešno primljena. Uskoro ćete dobiti email sa detaljima i informacijama o dostavi.',
    orderNumber: "KOD PORUDŽBINE:",
    backHome: "Nazad na početnu",
    
    verifyingTitle: "Potvrđujem plaćanje...",
    verifyingDesc: "Molimo vas da ne zatvarate stranicu niti da se vraćate nazad. Komuniciramo sa RaiAccept bankarskim gateway-om radi bezbedne provere transakcije.",
    
    failureTitle: "Plaćanje neuspešno",
    failureContinue: "Vaša porudžbina je sačuvana u sistemu ali plaćanje nije prošlo. Možete odmah promeniti način plaćanja na Plaćanje pouzećem (kuriru na adresi) i završiti porudžbinu, ili pokušati ponovo drugom karticom.",
    retryBtn: "Pokušaj ponovo",
    codPayOption: "Platite pouzećem (COD)",
    cardPayOption: "Pokušaj ponovo karticom",
    cancelOrderBtn: "Odustani od porudžbine",
    
    errFirstName: "Ime je obavezno",
    errLastName: "Prezime je obavezno",
    errEmail: "Email je obavezan",
    errEmailFormat: "Email nije u ispravnom formatu",
    errPhone: "Telefon je obavezan",
    errPhoneFormat: "Telefon nije u ispravnom formatu",
    errAddress: "Adresa je obavezna",
    errCity: "Grad je obavezan",
    errZip: "Poštanski broj je obavezno",
    errZipDigits: "Poštanski broj mora imati 5 cifara",
    cardDetailsTitle: "Detalji kartičnog plaćanja",
    paymentMethodLabel: "Metod plaćanja:",
    cardholderLabel: "Vlasnik kartice:",
    txAmountLabel: "Iznos transakcije:",
    txIdLabel: "ID Transakcije:",
    bankStatusLabel: "Status banke:",
    orderSavedNote: "Porudžbina uspešna ali se plaćanje verifikuje.",
    authErrorTitle: "Greška pri autorizaciji transakcije",
    cardFailFallback: "Plaćanje karticom nije uspešno obavljeno ili je otkazano od strane korisnika.",
    codErrorAlert: "Došlo je do greške prilikom prelaska na plaćanje pouzećem.",
    emptyCartTitle: "Vaša korpa je prazna",
    backShopBtn: "Povratak u prodavnicu",
    errAgreeTerms: "Morate se složiti sa uslovima kupovine",
    agreeTermsLabel: "Slažem se sa uslovima kupovine",
    subscribeNewsletterLabel: "Želim da dobijam promotivne poruke o vašim proizvodima i popustima",
    notesLabel: "Beleška / Lične preferencije ili informacije o dostavi",
    notesPlaceholder: "Napišite ukoliko imate posebne zahteve za dostavu, lične mere ili specifične preferencije..."
  },
  en: {
    backBtn: "Back",
    titleInfo: "Personal Information",
    descInfo: "Enter the details for your order delivery.",
    firstName: "First name",
    firstNamePl: "e.g. John",
    lastName: "Last name",
    lastNamePl: "e.g. Doe",
    email: "Email",
    emailPl: "john@email.com",
    phone: "Phone",
    phonePl: "+381 6x xxx xxxx",
    address: "Address & street number",
    addressPl: "Kralja Petra 12",
    city: "City",
    cityPl: "Belgrade",
    zip: "Postal code",
    zipPl: "11000",
    continuePayment: "Continue to payment",
    
    titlePayment: "Payment Method",
    descPayment: "Select how you would like to pay for your order.",
    codTitle: "Cash on delivery (COD)",
    codDesc: "Pay the courier on delivery.",
    cardTitle: "Payment Card",
    cardDesc: "Secure payment via your credit/debit card.",
    
    securePayment: "Secure Online Payment",
    secureNote: "Card payments are powered by Raiffeisen Bank. All communication is protected.",
    supportedCards: "Supported Cards:",
    security3D: "3D Secure Protection:",
    
    finishOrder: "Finish Order",
    processing: "Processing...",
    
    summaryTitle: "Order Summary",
    totalItems: "Items",
    subtotal: "Subtotal",
    shipping: "Shipping",
    shippingFree: "Free",
    grandTotal: "Total Amount",
    promoTitle: "Promo Discount Code",
    promoPlaceholder: "Enter promo code...",
    promoApply: "Apply",
    promoDiscount: "Discount",
    promoApplied: "Applied code",
    promoRemove: "Remove",
    securityGuarantee: "Secure Purchase",
    securitySSL: "Safe shopping and data protection. All of your details are fully encrypted and secure.",
    handmadeNotice: "All DD Design models are unique and handcrafted. Delivery for out-of-stock items takes 5-10 business days.",
    
    successTitle: "Thank you for your trust!",
    successDesc: 'Your order was successfully received. You will receive an email with details and shipping info shortly.',
    orderNumber: "ORDER NUMBER:",
    backHome: "Back to Home",
    
    verifyingTitle: "Confirming payment...",
    verifyingDesc: "Please do not close this page or return back. We are communicating with RaiAccept bank gateway to securely check payment.",
    
    failureTitle: "Payment Failed",
    failureContinue: "Your order is saved but payment failed. You can change payment to Cash on Delivery (COD) right now to complete it, or try again with another card.",
    retryBtn: "Retry Payment",
    codPayOption: "Pay via Cash on Delivery",
    cardPayOption: "Retry payment with card",
    cancelOrderBtn: "Cancel Order",
    
    errFirstName: "First name is required",
    errLastName: "Last name is required",
    errEmail: "Email is required",
    errEmailFormat: "Invalid email format",
    errPhone: "Phone number is required",
    errPhoneFormat: "Invalid phone number format",
    errAddress: "Address is required",
    errCity: "City is required",
    errZip: "Postal code is required",
    errZipDigits: "Postal code must be exactly 5 digits",
    cardDetailsTitle: "Card Payment Details",
    paymentMethodLabel: "Payment method:",
    cardholderLabel: "Cardholder:",
    txAmountLabel: "Transaction amount:",
    txIdLabel: "Transaction ID:",
    bankStatusLabel: "Bank Status:",
    orderSavedNote: "Order successful but payment verification pending.",
    authErrorTitle: "Transaction authorization error",
    cardFailFallback: "Card payment was not completed successfully or was canceled by user.",
    codErrorAlert: "An error occurred while switching to Cash on Delivery.",
    emptyCartTitle: "Your cart is empty",
    backShopBtn: "Back to Shop",
    errAgreeTerms: "You must agree to the terms of purchase",
    agreeTermsLabel: "I agree with the terms of purchase",
    subscribeNewsletterLabel: "I want to receive promotional messages about your products and discounts",
    notesLabel: "Note / Personal preferences or delivery instructions",
    notesPlaceholder: "Write if you have special delivery requests, custom measurements or specific preferences..."
  },
  ru: {
    backBtn: "Назад",
    titleInfo: "Личные данные",
    descInfo: "Введите информацию для доставки вашего заказа.",
    firstName: "Имя",
    firstNamePl: "например, Иван",
    lastName: "Фамилия",
    lastNamePl: "например, Иванов",
    email: "Email",
    emailPl: "ivan@email.com",
    phone: "Телефон",
    phonePl: "+381 6x xxx xxxx",
    address: "Адрес и номер дома",
    addressPl: "Kralja Petra 12",
    city: "Город",
    cityPl: "Белград",
    zip: "Почтовый индекс",
    zipPl: "11000",
    continuePayment: "Перейти к оплате",
    
    titlePayment: "Способ оплаты",
    descPayment: "Выберите, как вы хотите оплатить свой заказ.",
    codTitle: "Оплата при получении (наложенный платеж)",
    codDesc: "Оплатите курьеру при получении посылки.",
    cardTitle: "Платежная карта",
    cardDesc: "Безопасная оплата вашей кредитной или дебетовой картой.",
    
    securePayment: "Безопасный онлайн-платеж",
    secureNote: "Карточные платежи предоставляются Raiffeisen Bank. Все каналы связи защищены.",
    supportedCards: "Поддерживаемые карты:",
    security3D: "Защита 3D Secure:",
    
    finishOrder: "Завершить заказ",
    processing: "Обработка...",
    
    summaryTitle: "Детали заказа",
    totalItems: "Товары",
    subtotal: "Подытог",
    shipping: "Доставка",
    shippingFree: "Бесплатно",
    grandTotal: "Итого к оплате",
    promoTitle: "Промокод на скидку",
    promoPlaceholder: "Введите код...",
    promoApply: "Применить",
    promoDiscount: "Скидка",
    promoApplied: "Промокод активирован",
    promoRemove: "Удалить",
    securityGuarantee: "Безопасная покупка",
    securitySSL: "Безопасная покупка и защита данных. Все ваши данные полностью зашифрованы и защищены.",
    handmadeNotice: "Все модели DD Design уникальны и изготавливаются вручную. Срок изготовления для моделей под заказ — 5-10 рабочих дней.",
    
    successTitle: "Спасибо за доверие!",
    successDesc: 'Ваш заказ успешно получен. В ближайшее время вы получите электронное письмо с деталями и информацией о доставке.',
    orderNumber: "НОМЕР ЗАКАЗА:",
    backHome: "На главную",
    
    verifyingTitle: "Прогресс оплаты...",
    verifyingDesc: "Пожалуйста, не закрывайте эту страницу и не возвращайтесь назад. Мы проверяем транзакцию через шлюз RaiAccept.",
    
    failureTitle: "Платеж отклонен",
    failureContinue: "Ваш заказ сохранен в системе, но платеж не прошел. Вы можете изменить способ оплаты на Оплата при получении (наложенный платеж) и завершить заказ прямо сейчас, либо попробовать оплатить другой картой.",
    retryBtn: "Попробовать еще раз",
    codPayOption: "Оплатить при получении (COD)",
    cardPayOption: "Попробовать еще раз картой",
    cancelOrderBtn: "Отменить заказ",
    
    errFirstName: "Имя обязательно для заполнения",
    errLastName: "Фамилия обязательна для заполнения",
    errEmail: "Email обязателен для заполнения",
    errEmailFormat: "Неверный формат электронной почты",
    errPhone: "Телефон обязателен для заполнения",
    errPhoneFormat: "Неверный формат телефона",
    errAddress: "Адрес обязателен для заполнения",
    errCity: "Город обязателен для заполнения",
    errZip: "Почтовый индекс обязателен для заполнения",
    errZipDigits: "Почтовый индекс должен состоять из 5 цифр",
    cardDetailsTitle: "Детали карточной транзакции",
    paymentMethodLabel: "Способ платежа:",
    cardholderLabel: "Владелец карты:",
    txAmountLabel: "Сумма транзакции:",
    txIdLabel: "ID Транзакции:",
    bankStatusLabel: "Статус банка:",
    orderSavedNote: "Заказ оформлен, ожидается подтверждение платежа.",
    authErrorTitle: "Ошибка авторизации транзакции",
    cardFailFallback: "Оплата по карте не была завершена успешно или была отменена пользователем.",
    codErrorAlert: "Произошла ошибка при переключении на оплату при получении.",
    emptyCartTitle: "Ваша корзина пуста",
    backShopBtn: "Назад в магазин",
    errAgreeTerms: "Вы должны согласиться с условиями покупки",
    agreeTermsLabel: "Я согласен с условиями покупки",
    subscribeNewsletterLabel: "Я хочу получать промо-сообщения о ваших товарах и скидках",
    notesLabel: "Примечание / Личные предпочтения или инструкции по доставке",
    notesPlaceholder: "Напишите, если у вас есть особые пожелания по доставке, индивидуальные мерки или предпочтения..."
  }
};

interface CheckoutProps {
  cart: CartItem[];
  clearCart: () => void;
}

type Step = 'information' | 'payment' | 'verifying' | 'success' | 'failure';

export default function Checkout({ cart, clearCart }: CheckoutProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { language, translateProduct, translateColorName, translateSizeName, formatCurrency } = useLanguage();
  const currentLang = (language === 'en' || language === 'ru') ? language : 'sr';
  const ct = (key: keyof typeof checkoutTranslations['sr']) => checkoutTranslations[currentLang][key] || checkoutTranslations['sr'][key];

  // Read RaiAccept redirection status parameters from the URL
  const searchParams = new URLSearchParams(window.location.search);
  const urlStatus = searchParams.get('status');
  const urlOrderCode = searchParams.get('orderCode');

  const [step, setStep] = useState<Step>(
    (urlStatus === 'success' || urlStatus === 'fail' || urlStatus === 'cancel') ? 'verifying' : 'information'
  );
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    paymentMethod: (urlStatus === 'fail' || urlStatus === 'cancel') ? ('card' as const) : ('cod' as const)
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(
    urlStatus === 'fail' || urlStatus === 'cancel'
      ? ct('cardFailFallback')
      : null
  );
  const [orderNumber, setOrderNumber] = useState<string | null>(urlOrderCode);
  const [notes, setNotes] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);

  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  // Promo code state
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoApplying, setPromoApplying] = useState(false);

  const total = cart.reduce((sum, item) => sum + (item.discount_price || item.price) * item.quantity, 0);

  // Calculate promo discount amount
  let promoDiscount = 0;
  if (appliedPromo) {
    if (appliedPromo.Category_id === null || appliedPromo.Category_id === undefined) {
      promoDiscount = Math.round((total * Number(appliedPromo.amount_of_discount_in_percent)) / 100);
    } else {
      const eligibleSum = cart.reduce((sum, item) => {
        const itemCat = item.category_id || (item.category as any)?.id || (item.category as any)?.Id;
        if (Number(itemCat) === Number(appliedPromo.Category_id)) {
          return sum + (item.discount_price || item.price) * item.quantity;
        }
        return sum;
      }, 0);
      promoDiscount = Math.round((eligibleSum * Number(appliedPromo.amount_of_discount_in_percent)) / 100);
    }
  }

  const subtotalAfterPromo = Math.max(0, total - promoDiscount);
  const shippingCost = subtotalAfterPromo >= 10000 ? 0 : 400;
  const grandTotal = subtotalAfterPromo + shippingCost;

  // Apply promo code handler
  const handleApplyPromo = async () => {
    const cleanCode = promoCodeInput.trim().toUpperCase();
    if (!cleanCode) return;
    setPromoApplying(true);
    setPromoError(null);

    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .ilike('promo_code', cleanCode)
        .eq('status', true)
        .limit(1);

      if (error || !data || data.length === 0) {
        setPromoError(
          currentLang === 'en' ? 'Promo code is invalid or expired.' :
          currentLang === 'ru' ? 'Промокод недействителен или истек.' :
          'Promo kod nije važeći ili je istekao.'
        );
        return;
      }

      const promo = data[0] as PromoCode;

      // Check category limitation if Category_id is specified
      if (promo.Category_id !== null && promo.Category_id !== undefined) {
        const hasMatchingCategory = cart.some(item => {
          const itemCat = item.category_id || (item.category as any)?.id || (item.category as any)?.Id;
          return Number(itemCat) === Number(promo.Category_id);
        });

        if (!hasMatchingCategory) {
          setPromoError(
            currentLang === 'en' ? 'This promo code applies only to selected product categories.' :
            currentLang === 'ru' ? 'Этот промокод действует только для определенных категорий товаров.' :
            'Ovaj promo kod važi samo za određenu kategoriju proizvoda koja se ne nalazi u vašoj korpi.'
          );
          return;
        }
      }

      setAppliedPromo(promo);
      setPromoCodeInput('');
      setPromoError(null);
    } catch (err: any) {
      console.error('Promo code error:', err);
      setPromoError(
        currentLang === 'en' ? 'Error applying promo code.' :
        currentLang === 'ru' ? 'Ошибка при применении промокода.' :
        'Greška pri proveri koda.'
      );
    } finally {
      setPromoApplying(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError(null);
  };

  const sendOrderNotificationEmail = async (orderCode: string) => {
    const sentKey = `order_email_sent_${orderCode}`;
    if (localStorage.getItem(sentKey)) {
      console.log(`[Notification] Email already dispatched for ${orderCode}. Skipping.`);
      return;
    }
    localStorage.setItem(sentKey, "true");

    try {
      console.log(`[Notification] Fetching order details from Supabase for ${orderCode}...`);
      const { data: dbOrder, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price,
            products (
              name
            )
          )
        `)
        .eq('order_number', orderCode)
        .maybeSingle();

      if (error) throw error;
      if (!dbOrder) {
        console.warn(`[Notification] Order ${orderCode} not found in database.`);
        return;
      }

      const itemsForEmail = dbOrder.order_items?.map((item: any) => ({
        name: item.products?.name || "Artikal",
        quantity: item.quantity,
        price: item.price
      })) || [];

      console.log(`[Notification] Sending order ${orderCode} email payload to backend...`);
      await fetch("/api/orders/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: dbOrder.order_number,
          customerName: dbOrder.customer_name,
          email: dbOrder.email,
          phone: dbOrder.phone,
          address: dbOrder.address,
          city: dbOrder.city,
          postalCode: dbOrder.postal_code,
          paymentMethod: dbOrder.payment_method || 'card',
          totalPrice: dbOrder.total_price,
          shippingCost: dbOrder.total_price >= 10000 ? 0 : 400,
          items: itemsForEmail
        })
      });
      console.log("[Notification] Successfully dispatched order confirmation email.");
    } catch (err) {
      console.error("[Notification] Error dispatching order confirmation email:", err);
      localStorage.removeItem(sentKey);
    }
  };

  // Sync RaiAccept payment status with Supabase order table using live transaction status checks
  React.useEffect(() => {
    if (urlStatus && urlOrderCode && step === 'verifying') {
      const verifyPayment = async () => {
        setVerificationLoading(true);
        try {
          // Identify order id from queries or localStorage
          const urlOrderId = searchParams.get('orderId') || searchParams.get('orderIdentification') || searchParams.get('order_id');
          const finalOrderId = urlOrderId || localStorage.getItem("pending_payment_id");
          const transactionId = searchParams.get('transactionId') || searchParams.get('transaction_id') || '';

          if (!finalOrderId) {
            console.log("[Verification] No live orderId, falling back directly to URL status.");
            if (urlStatus === 'success') {
              await supabase
                .from('orders')
                .update({ payment_status: 'paid', order_status: 'processing' })
                .eq('order_number', urlOrderCode);
              sendOrderNotificationEmail(urlOrderCode);
              setStep('success');
              clearCart();
            } else {
              await supabase
                .from('orders')
                .update({ payment_status: 'failed' })
                .eq('order_number', urlOrderCode);
              setStep('failure');
              setSubmitError(ct('cardFailFallback'));
            }
            return;
          }

          // Call our server transaction-status API
          const verificationUrl = `/api/payments/transaction-status?orderId=${finalOrderId}&transactionId=${transactionId}`;
          console.log(`[Verification] Checking status via backend: ${verificationUrl}`);
          const res = await fetch(verificationUrl);
          
          if (!res.ok) {
            throw new Error(`Failed to fetch status: ${res.status}`);
          }

          const resData = await res.json();
          if (resData.success) {
            // Support both direct transaction and transaction lists
            let tx = null;
            if (resData.data) {
              if (resData.data.transaction) {
                tx = resData.data.transaction;
              } else if (Array.isArray(resData.data)) {
                tx = resData.data[0];
              } else if (resData.data.transactions && Array.isArray(resData.data.transactions)) {
                tx = resData.data.transactions[0];
              }
            }

            console.log("[Verification] Fetched live transaction details:", tx);
            setVerificationResult(tx);

            const txStatus = tx?.status?.toUpperCase();
            const orderStatus = resData.order?.status?.toUpperCase();
            
            // Success-like statuses: SUCCESS, AUTHORIZED, CAPTURED, SETTLED at transaction level, or COMPLETED, PAID at order level
            const isTxSuccess = txStatus === 'SUCCESS' || 
                               txStatus === 'AUTHORIZED' || 
                               txStatus === 'CAPTURED' || 
                               txStatus === 'SETTLED' || 
                               orderStatus === 'COMPLETED' || 
                               orderStatus === 'PAID' || 
                               orderStatus === 'SUCCESS' || 
                               (urlStatus === 'success' && !txStatus);

            if (isTxSuccess) {
              // Fetch current address to append the tracking IDs
              const { data: dbOrder } = await supabase
                .from('orders')
                .select('address')
                .eq('order_number', urlOrderCode)
                .maybeSingle();

              const currentAddress = dbOrder?.address || '';
              const suffix = ` [RaiAccept: ${finalOrderId} | ${tx?.transactionId || transactionId || 'N/A'}]`;
              const updatedAddress = currentAddress.includes('[RaiAccept:') ? currentAddress : (currentAddress + suffix);

              // Mark as paid in database with RaiAccept tracking IDs in the address field
              const { error: updateError } = await supabase
                .from('orders')
                .update({ 
                  payment_status: 'paid', 
                  order_status: 'processing',
                  address: updatedAddress
                })
                .eq('order_number', urlOrderCode);
              
              if (updateError) {
                console.error("[Verification] Database update error:", updateError);
              }

              sendOrderNotificationEmail(urlOrderCode);

              setStep('success');
              clearCart();
              
              // Clear stored checkout cache
              localStorage.removeItem("pending_order_code");
              localStorage.removeItem("pending_payment_id");
            } else {
              // Marked as failed
              await supabase
                .from('orders')
                .update({ payment_status: 'failed' })
                .eq('order_number', urlOrderCode);

              setStep('failure');
              const errMsg = getSerbianErrorMessage(tx?.statusCode, tx?.statusMessage || tx?.status);
              setSubmitError(errMsg);
            }
          } else {
            throw new Error("Invalid provider response payload.");
          }
        } catch (err) {
          console.error("[Verification] Error checking live status, falling back to urlStatus.", err);
          
          // Resilient fallback logic
          if (urlStatus === 'success') {
            await supabase
              .from('orders')
              .update({ payment_status: 'paid', order_status: 'processing' })
              .eq('order_number', urlOrderCode);
            sendOrderNotificationEmail(urlOrderCode);
            setStep('success');
            clearCart();
          } else {
            await supabase
              .from('orders')
              .update({ payment_status: 'failed' })
              .eq('order_number', urlOrderCode);
            setStep('failure');
            setSubmitError(ct('cardFailFallback'));
          }
        } finally {
          setVerificationLoading(false);
        }
      };

      verifyPayment();
    }
  }, [urlStatus, urlOrderCode, step]);

  if (cart.length === 0 && step !== 'success' && step !== 'verifying' && step !== 'failure') {
    return (
      <div className="py-32 px-4 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-200 mb-6" />
        <h2 className="text-2xl font-bold mb-4">{ct('emptyCartTitle')}</h2>
        <button 
          onClick={() => navigate('/shop')}
          className="bg-black text-white px-8 py-3 rounded-full font-bold"
        >
          {ct('backShopBtn')}
        </button>
      </div>
    );
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = ct('errFirstName');
    if (!formData.lastName.trim()) newErrors.lastName = ct('errLastName');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = ct('errEmail');
    else if (!emailRegex.test(formData.email)) newErrors.email = ct('errEmailFormat');

    const phoneRegex = /^[\d\s+\-/]{9,}$/;
    if (!formData.phone.trim()) newErrors.phone = ct('errPhone');
    else if (!phoneRegex.test(formData.phone)) newErrors.phone = ct('errPhoneFormat');

    if (!formData.address.trim()) newErrors.address = ct('errAddress');
    if (!formData.city.trim()) newErrors.city = ct('errCity');
    
    const zipRegex = /^\d{5}$/;
    if (!formData.zip.trim()) newErrors.zip = ct('errZip');
    else if (!zipRegex.test(formData.zip)) newErrors.zip = ct('errZipDigits');

    if (!agreeTerms) {
      newErrors.agreeTerms = ct('errAgreeTerms');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const nextStep = async () => {
    if (step === 'information') {
      if (validate()) setStep('payment');
    } else if (step === 'payment') {
      setSubmitting(true);
      setSubmitError(null);
      
      try {
        const orderCode = `DD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
        
        const promoNote = appliedPromo 
          ? `[Promo kod: ${appliedPromo.promo_code} (-${appliedPromo.amount_of_discount_in_percent}% / -${formatCurrency(promoDiscount)})]`
          : '';
        const finalNotes = [notes.trim(), promoNote].filter(Boolean).join(' ');

        // 1. Snimi porudžbinu u tabelu orders
        let orderPayload: any = {
          order_number: orderCode,
          customer_name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          postal_code: Number(formData.zip),
          total_price: grandTotal,
          payment_method: formData.paymentMethod,
          payment_status: 'pending',
          order_status: 'pending',
          notes: finalNotes
        };

        let { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert(orderPayload)
          .select('id')
          .single();

        // Safe database migration fallback:
        // If 'notes' column doesn't exist, retry without it and append notes to the address field instead.
        if (orderError && (orderError.message?.includes('column "notes" of relation "orders" does not exist') || orderError.code === '42703')) {
          console.warn("[Checkout] Dedicated 'notes' column does not exist in 'orders' table. Appending to address as fallback.");
          const fallbackAddress = notes.trim() 
            ? `${formData.address.trim()} [Beleška: ${notes.trim()}]`
            : formData.address.trim();
          
          orderPayload = {
            ...orderPayload,
            address: fallbackAddress
          };
          delete orderPayload.notes;

          const retryResult = await supabase
            .from('orders')
            .insert(orderPayload)
            .select('id')
            .single();

          orderData = retryResult.data;
          orderError = retryResult.error;
        }

        if (orderError) throw orderError;
        if (!orderData) throw new Error("Došlo je do greške prilikom kreiranja porudžbine.");

        const orderId = orderData.id;

        // 2. Mapiraj artikle za order_items
        const orderItemsToInsert = cart.map((item) => {
          const dbSize = item.sizes?.find(s => s.name === item.selectedSize);
          const dbColor = item.colors?.find(c => c.name === item.selectedColor);
          
          return {
            order_id: Number(orderId),
            product_id: Number(item.id),
            size_id: dbSize ? Number(dbSize.id) : null,
            color_id: dbColor ? Number(dbColor.id) : null,
            quantity: Number(item.quantity),
            price: Number(item.discount_price || item.price)
          };
        });

        // 3. Snimi artikle u tabelu order_items
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItemsToInsert);

        if (itemsError) throw itemsError;

        // If the user opted in to receive promotional messages (Newsletter list), subscribe them in the background!
        if (subscribeNewsletter && formData.email.trim()) {
          fetch('/api/newsletter/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email.trim() })
          }).then(res => {
            if (res.ok) {
              console.log("[Checkout] Successfully registered newsletter subscriber during checkout.");
            } else {
              console.warn("[Checkout] Newsletter subscription returned non-OK status.");
            }
          }).catch(err => {
            console.error("[Checkout] Background newsletter subscription error:", err);
          });
        }

        if (formData.paymentMethod === 'card') {
          // Prepare the payload for RaiAccept API
          const paymentPayload = {
            billingAddress: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              addressStreet1: formData.address,
              city: formData.city,
              postalCode: formData.zip,
              country: "SRB"
            },
            consumer: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              mobilePhone: formData.phone
            },
            invoice: {
              amount: grandTotal,
              currency: "RSD",
              description: `Porudzbina ${orderCode}${appliedPromo ? ` (Kod: ${appliedPromo.promo_code})` : ''}`,
              items: [
                ...cart.map(item => {
                  let unitPrice = item.discount_price || item.price;
                  if (promoDiscount > 0) {
                    const isEligible = appliedPromo?.Category_id === null || 
                                       appliedPromo?.Category_id === undefined || 
                                       Number(item.category_id || (item.category as any)?.id || (item.category as any)?.Id) === Number(appliedPromo?.Category_id);
                    if (isEligible && appliedPromo) {
                      unitPrice = Math.max(1, Math.round(unitPrice * (1 - appliedPromo.amount_of_discount_in_percent / 100)));
                    }
                  }
                  return {
                    description: `${item.name}${item.selectedSize ? ` - Vel: ${item.selectedSize}` : ""}${item.selectedColor ? `, Boja: ${item.selectedColor}` : ""}`,
                    numberOfItems: item.quantity,
                    price: unitPrice
                  };
                }),
                ...(shippingCost > 0 ? [{
                  description: "Dostava",
                  numberOfItems: 1,
                  price: shippingCost
                }] : [])
              ],
              merchantOrderReference: orderCode
            },
            shippingAddress: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              addressStreet1: formData.address,
              city: formData.city,
              postalCode: formData.zip,
              country: "SRB"
            },
            urls: {
              successUrl: `${window.location.origin}/checkout?status=success&orderCode=${orderCode}&orderId={orderId}`,
              failUrl: `${window.location.origin}/checkout?status=fail&orderCode=${orderCode}&orderId={orderId}`,
              cancelUrl: `${window.location.origin}/checkout?status=cancel&orderCode=${orderCode}&orderId={orderId}`,
              notificationUrl: "https://webhook.site/cb7f55c6-e7aa-49dd-9d28-a22333cc1551"
            }
          };

          const paymentResponse = await fetch("/api/payments/create-order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(paymentPayload)
          });

          if (!paymentResponse.ok) {
            let errorMsg = "Došlo je do greške prilikom kreiranja naloga za plaćanje.";
            try {
              const responseText = await paymentResponse.text();
              try {
                const errData = JSON.parse(responseText);
                errorMsg = errData.error || errorMsg;
              } catch (parseErr) {
                // If response is plain text (like some server errors) and not HTML, show it
                if (responseText && !responseText.includes("<!DOCTYPE") && responseText.length < 500) {
                  errorMsg = responseText;
                }
              }
            } catch (_) {}
            throw new Error(errorMsg);
          }

          const paymentData = await paymentResponse.json();
          if (paymentData.success && paymentData.orderIdentification) {
            // Persist the RaiAccept Order ID immediately in the address field to allow manual/back-office verification
            const trackingSuffix = ` [RaiAccept: ${paymentData.orderIdentification} | N/A]`;
            const updatedAddress = formData.address.trim() + trackingSuffix;
            
            try {
              await supabase
                .from('orders')
                .update({ address: updatedAddress })
                .eq('order_number', orderCode);
              console.log("[Checkout] Successfully appended RaiAccept Tracking details to standard order record.");
            } catch (dbErr) {
              console.error("[Checkout] Failed to append RaiAccept details to database order record:", dbErr);
            }

            // Store checkout context in localStorage
            localStorage.setItem("pending_order_code", orderCode);
            localStorage.setItem("pending_payment_id", paymentData.orderIdentification);
            
            // Redirect user to RaiAccept hosted checkout page
            window.location.href = paymentData.checkoutUrl || `https://payment.raiaccept.com/?orderId=${paymentData.orderIdentification}`;
            return; // Exit and let browser handle redirect
          } else {
            throw new Error("Nije moguće dobiti nalog za plaćanje. Molimo pokušajte ponovo.");
          }
        }

        setOrderNumber(orderCode);
        sendOrderNotificationEmail(orderCode);
        setStep('success');
        clearCart();
      } catch (err: any) {
        console.error("Greška pri slanju porudžbine:", err);
        setSubmitError(err.message || "Došlo je do greške prilikom obrade vaše porudžbine. Molimo pokušajte ponovo.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const prevStep = () => {
    if (step === 'payment') setStep('information');
  };

  return (
    <div className={`py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen transition-colors duration-500`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* Left Side: Forms */}
        <div className="space-y-12">
          {step !== 'success' && step !== 'verifying' && step !== 'failure' && (
            <button 
              onClick={step === 'information' ? () => navigate(-1) : prevStep}
              className={`flex items-center space-x-2 text-sm font-bold uppercase tracking-widest transition-colors ${
                theme === 'dark' ? 'text-zinc-600 hover:text-white' : 'text-gray-400 hover:text-black'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{ct('backBtn')}</span>
            </button>
          )}

          <AnimatePresence mode="wait">
            {step === 'information' && (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className={`text-3xl font-bold tracking-tight mb-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{ct('titleInfo')}</h2>
                  <p className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}>{ct('descInfo')}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>{ct('firstName')}</label>
                    <div className="relative">
                      <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.firstName ? 'text-red-500' : 'text-zinc-500'}`} />
                      <input 
                        type="text" name="firstName" value={formData.firstName} onChange={handleInputChange}
                        className={`w-full border rounded-xl py-4 pl-12 pr-4 focus:ring-2 transition-all ${
                          errors.firstName 
                            ? 'border-red-500 ring-red-500/20' 
                            : 'border-transparent'
                        } ${
                          theme === 'dark' ? 'bg-zinc-900 text-white focus:ring-white' : 'bg-gray-50 text-black focus:ring-black'
                        }`}
                        placeholder={ct('firstNamePl')}
                        required
                      />
                    </div>
                    {errors.firstName && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-1">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>{ct('lastName')}</label>
                    <div className="relative">
                      <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.lastName ? 'text-red-500' : 'text-zinc-500'}`} />
                      <input 
                        type="text" name="lastName" value={formData.lastName} onChange={handleInputChange}
                        className={`w-full border rounded-xl py-4 pl-12 pr-4 focus:ring-2 transition-all ${
                          errors.lastName 
                            ? 'border-red-500 ring-red-500/20' 
                            : 'border-transparent'
                        } ${
                          theme === 'dark' ? 'bg-zinc-900 text-white focus:ring-white' : 'bg-gray-50 text-black focus:ring-black'
                        }`}
                        placeholder={ct('lastNamePl')}
                        required
                      />
                    </div>
                    {errors.lastName && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>{ct('email')}</label>
                    <div className="relative">
                      <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.email ? 'text-red-500' : 'text-zinc-500'}`} />
                      <input 
                        type="email" name="email" value={formData.email} onChange={handleInputChange}
                        className={`w-full border rounded-xl py-4 pl-12 pr-4 focus:ring-2 transition-all ${
                          errors.email 
                            ? 'border-red-500 ring-red-500/20' 
                            : 'border-transparent'
                        } ${
                          theme === 'dark' ? 'bg-zinc-900 text-white focus:ring-white' : 'bg-gray-50 text-black focus:ring-black'
                        }`}
                        placeholder={ct('emailPl')}
                        required
                      />
                    </div>
                    {errors.email && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-1">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>{ct('phone')}</label>
                    <div className="relative">
                      <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.phone ? 'text-red-500' : 'text-zinc-500'}`} />
                      <input 
                        type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                        className={`w-full border rounded-xl py-4 pl-12 pr-4 focus:ring-2 transition-all ${
                          errors.phone 
                            ? 'border-red-500 ring-red-500/20' 
                            : 'border-transparent'
                        } ${
                          theme === 'dark' ? 'bg-zinc-900 text-white focus:ring-white' : 'bg-gray-50 text-black focus:ring-black'
                        }`}
                        placeholder={ct('phonePl')}
                        required
                      />
                    </div>
                    {errors.phone && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-1">{errors.phone}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>{ct('address')}</label>
                  <div className="relative">
                    <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.address ? 'text-red-500' : 'text-zinc-500'}`} />
                    <input 
                      type="text" name="address" value={formData.address} onChange={handleInputChange}
                      className={`w-full border rounded-xl py-4 pl-12 pr-4 focus:ring-2 transition-all ${
                        errors.address 
                          ? 'border-red-500 ring-red-500/20' 
                          : 'border-transparent'
                      } ${
                        theme === 'dark' ? 'bg-zinc-900 text-white focus:ring-white' : 'bg-gray-50 text-black focus:ring-black'
                      }`}
                      placeholder={ct('addressPl')}
                      required
                    />
                  </div>
                  {errors.address && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>{ct('city')}</label>
                    <input 
                      type="text" name="city" value={formData.city} onChange={handleInputChange}
                      className={`w-full border rounded-xl py-4 px-4 focus:ring-2 transition-all ${
                        errors.city 
                          ? 'border-red-500 ring-red-500/20' 
                          : 'border-transparent'
                      } ${
                        theme === 'dark' ? 'bg-zinc-900 text-white focus:ring-white' : 'bg-gray-50 text-black focus:ring-black'
                      }`}
                      placeholder={ct('cityPl')}
                      required
                    />
                    {errors.city && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-1">{errors.city}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>{ct('zip')}</label>
                    <input 
                      type="text" name="zip" value={formData.zip} onChange={handleInputChange}
                      className={`w-full border rounded-xl py-4 px-4 focus:ring-2 transition-all ${
                        errors.zip
                          ? 'border-red-500 ring-red-500/20' 
                          : 'border-transparent'
                      } ${
                        theme === 'dark' ? 'bg-zinc-900 text-white focus:ring-white' : 'bg-gray-50 text-black focus:ring-black'
                      }`}
                      placeholder={ct('zipPl')}
                      required
                    />
                    {errors.zip && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-1">{errors.zip}</p>}
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  <label className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>
                    {ct('notesLabel')}
                  </label>
                  <textarea 
                    name="notes" 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                    className={`w-full border rounded-xl py-4 px-4 min-h-[100px] resize-y focus:ring-2 transition-all border-transparent text-sm ${
                      theme === 'dark' ? 'bg-zinc-900 text-white focus:ring-white' : 'bg-gray-50 text-black focus:ring-black'
                    }`}
                    placeholder={ct('notesPlaceholder')}
                  />
                </div>

                <div className="space-y-4 pt-6 border-t border-current/10 mt-6">
                  <label className="flex items-start space-x-3 cursor-pointer group select-none">
                    <div className="relative flex items-center mt-0.5">
                      <input 
                        type="checkbox" 
                        checked={agreeTerms}
                        onChange={(e) => {
                          setAgreeTerms(e.target.checked);
                          if (e.target.checked && errors.agreeTerms) {
                            setErrors(prev => {
                              const next = { ...prev };
                              delete next.agreeTerms;
                              return next;
                            });
                          }
                        }}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${
                        agreeTerms 
                          ? (theme === 'dark' ? 'bg-white border-white' : 'bg-black border-black')
                          : (theme === 'dark' ? 'border-zinc-800 bg-zinc-900 group-hover:border-zinc-700' : 'border-gray-300 bg-white group-hover:border-gray-400')
                      }`}>
                        {agreeTerms && (
                          <svg className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs font-medium leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                      {ct('agreeTermsLabel')}{' '}
                      <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">
                        {currentLang === 'sr' ? '(Pročitaj uslove)' : currentLang === 'ru' ? '(Читать условия)' : '(Read terms)'}
                      </a>
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-1">{errors.agreeTerms}</p>
                  )}

                  <label className="flex items-start space-x-3 cursor-pointer group select-none">
                    <div className="relative flex items-center mt-0.5">
                      <input 
                        type="checkbox" 
                        checked={subscribeNewsletter}
                        onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${
                        subscribeNewsletter 
                          ? (theme === 'dark' ? 'bg-white border-white' : 'bg-black border-black')
                          : (theme === 'dark' ? 'border-zinc-800 bg-zinc-900 group-hover:border-zinc-700' : 'border-gray-300 bg-white group-hover:border-gray-400')
                      }`}>
                        {subscribeNewsletter && (
                          <svg className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs font-medium leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                      {ct('subscribeNewsletterLabel')}
                    </span>
                  </label>
                </div>

                <button 
                  onClick={nextStep}
                  className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center space-x-3 transition-all shadow-xl mt-8 ${
                    theme === 'dark' ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-gray-900'
                  }`}
                >
                  <span>{ct('continuePayment')}</span>
                </button>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className={`text-3xl font-bold tracking-tight mb-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{ct('titlePayment')}</h2>
                  <p className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}>{ct('descPayment')}</p>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                    className={`w-full p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${
                      theme === 'dark'
                        ? formData.paymentMethod === 'cod' ? 'border-white bg-zinc-900' : 'border-zinc-800 hover:border-zinc-700 bg-transparent'
                        : formData.paymentMethod === 'cod' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl ${
                        theme === 'dark'
                          ? formData.paymentMethod === 'cod' ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500'
                          : formData.paymentMethod === 'cod' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Truck className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{ct('codTitle')}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>{ct('codDesc')}</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      theme === 'dark'
                        ? formData.paymentMethod === 'cod' ? 'border-white border-[6px]' : 'border-zinc-800'
                        : formData.paymentMethod === 'cod' ? 'border-black border-[6px]' : 'border-gray-200'
                    }`} />
                  </button>

                  <button 
                    onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                    className={`w-full p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${
                      theme === 'dark'
                        ? formData.paymentMethod === 'card' ? 'border-white bg-zinc-900' : 'border-zinc-800 hover:border-zinc-700 bg-transparent'
                        : formData.paymentMethod === 'card' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl ${
                        theme === 'dark'
                          ? formData.paymentMethod === 'card' ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500'
                          : formData.paymentMethod === 'card' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{ct('cardTitle')}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>{ct('cardDesc')}</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      theme === 'dark'
                        ? formData.paymentMethod === 'card' ? 'border-white border-[6px]' : 'border-zinc-800'
                        : formData.paymentMethod === 'card' ? 'border-black border-[6px]' : 'border-gray-200'
                    }`} />
                  </button>
                </div>

                <AnimatePresence>
                  {formData.paymentMethod === 'card' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className={`p-6 rounded-2xl border space-y-4 text-xs mt-4 ${
                        theme === 'dark' ? 'bg-[#111] border-zinc-900 text-zinc-400' : 'bg-gray-50 border-gray-150 text-gray-500'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <p className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                              Sigurno online plaćanje
                            </p>
                            <p className="mt-1">
                              Kartično plaćanje je omogućila Raiffeisen Banka. Sva komunikacija je zaštićena.
                            </p>
                          </div>
                          <a 
                            href="https://www.raiffeisenbank.rs" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="shrink-0 flex items-center"
                          >
                            <img 
                              src={theme === 'dark' 
                                ? "https://64.media.tumblr.com/c1584ae68b2f48317cbd88238bd874ad/be374ee1549e32c7-66/s2048x3072/afb06bfe59086f121fd16817657251752c802f5f.pnj" 
                                : "https://64.media.tumblr.com/3630fb26e86214e277bfa6c46dd176e7/be374ee1549e32c7-96/s2048x3072/94b3386d70a1b82f1f8bc8f64a4e4ab500cbc73d.pnj"
                              } 
                              alt="Raiffeisen Banka" 
                              className="h-8 object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </a>
                        </div>

                        <div className="pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                          {/* Accepted Cards */}
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-650">
                              Podržane kartice:
                            </span>
                            <div className="flex items-center gap-2">
                              <img 
                                src={theme === 'dark'
                                  ? "https://64.media.tumblr.com/50b921f4fb3be41ec9b3fca5c71063dd/be374ee1549e32c7-fe/s400x600/bfa46d7af96b5e56171240f4c72e17c2afc5bf2e.pnj"
                                  : "https://64.media.tumblr.com/6f9301afac67cf4d471a4a64f7bf213d/be374ee1549e32c7-3f/s400x600/4428685ad1cb542fd18244721435056416cbeca8.pnj"
                                } 
                                alt="Visa, MasterCard, DinaCard" 
                                className="h-6 object-contain"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </div>

                          {/* 3D Secure Protection */}
                          <div className="space-y-1 sm:text-right">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-650 block">
                              3D Secure Zaštita:
                            </span>
                            <div className="flex items-center gap-3">
                              <a 
                                href="https://rs.visa.com/run-your-business/small-business-tools/payment-technology/visa-secure.html"
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:opacity-80 transition-opacity"
                              >
                                <img 
                                  src="https://64.media.tumblr.com/f7790a9a5b8145f326c457f03eb2fc23/be374ee1549e32c7-cd/s250x400/2d1802a688b5228d5a91594dc2175fae2aa99e2d.pnj" 
                                  alt="Visa Secure" 
                                  className="h-6 object-contain"
                                  referrerPolicy="no-referrer"
                                />
                              </a>
                              <a 
                                href="https://www.mastercard.rs/sr-rs/korisnici/podrska/sigurnost-i-zastita/identity-check.html"
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:opacity-80 transition-opacity"
                              >
                                <img 
                                  src={theme === 'dark'
                                    ? "https://64.media.tumblr.com/fa0e2cbbf2063ba977d0cffb0907eec4/be374ee1549e32c7-d9/s2048x3072/58da21de1a7a2c1740a5885ee6b7ed5d99bf2b2c.pnj"
                                    : "https://64.media.tumblr.com/b69c1fd18e808fa9977ef1bdec1965d6/be374ee1549e32c7-89/s2048x3072/fdc7ee611bd3c042becbd04b3870e56ecd9f93a8.pnj"
                                  } 
                                  alt="MasterCard Identity Check" 
                                  className="h-6 object-contain"
                                  referrerPolicy="no-referrer"
                                />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button 
                  onClick={nextStep}
                  disabled={submitting}
                  className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center space-x-3 transition-all shadow-xl mt-8 ${
                    submitting 
                      ? 'opacity-50 cursor-not-allowed bg-zinc-300 dark:bg-zinc-800 text-zinc-500' 
                      : (theme === 'dark' ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-gray-900')
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-current" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{ct('processing')}</span>
                    </span>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>{ct('finishOrder')}</span>
                    </>
                  )}
                </button>
                {submitError && (
                  <p className="text-sm font-bold text-red-500 text-center mt-4">
                    {submitError}
                  </p>
                )}
              </motion.div>
            )}

            {step === 'verifying' && (
              <motion.div
                key="verifying"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 space-y-6 flex flex-col items-center justify-center"
              >
                <div className="relative w-16 h-16 mb-4">
                  <div className="w-16 h-16 rounded-full border-4 border-zinc-200 border-t-black animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-black dark:text-white" />
                  </div>
                </div>
                <h3 className={`text-2xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  {ct('verifyingTitle')}
                </h3>
                <p className={`max-w-md mx-auto text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
                  {ct('verifyingDesc')}
                </p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-6"
              >
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <h2 className="text-4xl font-bold tracking-tight">{ct('successTitle')}</h2>
                {orderNumber && (
                  <div className="my-4">
                    <span className={`inline-block px-4 py-2 font-mono text-sm border rounded-xl font-bold tracking-wider ${
                      theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-gray-50 border-gray-150 text-black'
                    }`}>
                      {ct('orderNumber')} {orderNumber}
                    </span>
                  </div>
                )}

                {verificationResult && (
                  <div className={`mt-6 text-left max-w-md mx-auto p-6 rounded-2xl border text-sm font-sans ${
                    theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-gray-50 border-gray-100'
                  }`}>
                    <h4 className={`font-bold border-b pb-3 mb-3 uppercase tracking-wider ${
                      theme === 'dark' ? 'text-zinc-400 border-zinc-800' : 'text-gray-400 border-gray-250'
                    }`}>
                      {ct('cardDetailsTitle')}
                    </h4>
                    <div className="space-y-2">
                      {verificationResult.card?.maskedCardNumber && (
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}>{ct('paymentMethodLabel')}</span>
                          <span className={`font-mono font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                            {verificationResult.card.type || 'KARTICA'} ({verificationResult.card.maskedCardNumber})
                          </span>
                        </div>
                      )}
                      {verificationResult.card?.cardHolderName && (
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}>{ct('cardholderLabel')}</span>
                          <span className={`${theme === 'dark' ? 'text-white' : 'text-black'} font-medium`}>
                            {verificationResult.card.cardHolderName}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}>{ct('txAmountLabel')}</span>
                        <span className={`${theme === 'dark' ? 'text-white' : 'text-black'} font-bold`}>
                          {verificationResult.transactionAmount?.toLocaleString()} {verificationResult.transactionCurrency || 'RSD'}
                        </span>
                      </div>
                      {verificationResult.transactionId && (
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}>{ct('txIdLabel')}</span>
                          <span className={`font-mono text-xs ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                            {verificationResult.transactionId}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2">
                        <span className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}>{ct('bankStatusLabel')}</span>
                        <span className="text-xs bg-green-500/10 text-green-500 dark:text-green-400 px-2.5 py-0.5 rounded font-bold uppercase tracking-widest">
                          {verificationResult.status || 'USPEŠNO'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-gray-500 max-w-md mx-auto">
                  {ct('successDesc')}
                </p>
                <button 
                  onClick={() => navigate('/')}
                  className="bg-black text-white px-10 py-5 rounded-full font-bold hover:bg-gray-900 transition-all shadow-xl mt-8"
                >
                  {ct('backHome')}
                </button>
              </motion.div>
            )}

            {step === 'failure' && (
              <motion.div
                key="failure"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-6"
              >
                <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8 dark:bg-red-950/40 dark:text-red-500">
                  <XCircle className="w-12 h-12" />
                </div>
                <h2 className={`text-4xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{ct('failureTitle')}</h2>
                
                {orderNumber && (
                  <div className="my-4">
                    <span className={`inline-block px-4 py-2 font-mono text-sm border rounded-xl font-bold tracking-wider ${
                      theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-gray-50 border-gray-150 text-gray-700'
                    }`}>
                      {ct('orderNumber')} {orderNumber}
                    </span>
                  </div>
                )}

                <div className={`max-w-md mx-auto p-6 rounded-2xl border text-sm font-sans ${
                  theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-gray-50 border-gray-100'
                }`}>
                  <p className="text-base font-bold text-red-500 mb-2">
                    {ct('authErrorTitle')}
                  </p>
                  <p className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'}>
                    {submitError || ct('cardFailFallback')}
                  </p>

                  {verificationResult && (
                    <div className={`mt-4 pt-4 border-t text-left space-y-2 ${
                      theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'
                    }`}>
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}>{ct('bankStatusLabel')}</span>
                        <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                          {verificationResult.status || 'ODBILA BANKA'}
                        </span>
                      </div>
                      {verificationResult.statusCode && (
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}>Kod greške:</span>
                          <span className={`font-mono font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                            {verificationResult.statusCode}
                          </span>
                        </div>
                      )}
                      {verificationResult.transactionId && (
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}>{ct('txIdLabel')}</span>
                          <span className="font-mono text-xs text-zinc-500">
                            {verificationResult.transactionId}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <p className={`max-w-md mx-auto text-sm leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
                  {ct('failureContinue')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                  <button 
                    onClick={async () => {
                      setSubmitting(true);
                      try {
                        const { error } = await supabase
                          .from('orders')
                          .update({ payment_method: 'cod', payment_status: 'pending' })
                          .eq('order_number', urlOrderCode);

                        if (error) throw error;
                        
                        setFormData(prev => ({ ...prev, paymentMethod: 'cod' }));
                        setStep('success');
                        clearCart();
                      } catch (err) {
                        console.error(err);
                        alert(ct('codErrorAlert'));
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                    className={`px-8 py-5 rounded-full font-bold transition-all shadow-xl w-full sm:w-auto flex items-center justify-center space-x-2 ${
                      theme === 'dark' ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-gray-900'
                    }`}
                  >
                    <Truck className="w-5 h-5" />
                    <span>{ct('codPayOption')}</span>
                  </button>

                  <button 
                    onClick={() => {
                      setStep('payment');
                      setFormData(prev => ({ ...prev, paymentMethod: 'card' }));
                    }}
                    className={`px-8 py-5 rounded-full font-bold transition-all border w-full sm:w-auto flex items-center justify-center space-x-2 ${
                      theme === 'dark' 
                        ? 'border-zinc-800 text-white bg-zinc-900 hover:bg-zinc-800' 
                        : 'border-gray-200 text-black bg-white hover:bg-gray-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>{ct('cardPayOption')}</span>
                  </button>
                </div>

                <div className="pt-4 flex justify-center">
                  <button 
                    disabled={submitting}
                    onClick={async () => {
                      setSubmitting(true);
                      try {
                        await supabase
                          .from('orders')
                          .update({ order_status: 'cancelled', payment_status: 'failed' })
                          .eq('order_number', urlOrderCode);
                      } catch (err) {
                        console.error("Error cancelling order:", err);
                      } finally {
                        setSubmitting(false);
                        navigate('/');
                      }
                    }}
                    className={`text-xs font-bold uppercase tracking-widest transition-all hover:underline py-2 px-4 rounded ${
                      theme === 'dark' ? 'text-zinc-500 hover:text-zinc-300' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {ct('cancelOrderBtn')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Order Summary */}
        {step !== 'success' && step !== 'verifying' && step !== 'failure' && (
          <div className="lg:sticky lg:top-24 h-fit">
            <div className={`rounded-3xl p-8 space-y-8 transition-colors duration-500 border ${
              theme === 'dark' ? 'bg-[#111] border-zinc-900' : 'bg-gray-50 border-transparent'
            }`}>
              <h3 className={`text-xl font-bold tracking-tight flex items-center space-x-2 ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                <Package className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-600' : 'text-black'}`} />
                <span>{ct('summaryTitle')}</span>
              </h3>

              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item, index) => {
                  const translated = translateProduct(item);
                  return (
                    <div key={`${item.id}-${item.selectedSize || ''}-${item.selectedColor || ''}-${index}`} className="flex space-x-4">
                      <div className={`w-16 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-sm ${
                        theme === 'dark' ? 'bg-zinc-900' : 'bg-white'
                      }`}>
                        <img src={item.image_url} alt={translated.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-sm font-bold leading-tight ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-900'}`}>{translated.name}</h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-widest ${
                            theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-500' : 'bg-white border-gray-100 text-gray-400'
                          }`}>
                            {item.quantity}x
                          </span>
                          {item.selectedSize && (
                            <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-widest ${
                              theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-500' : 'bg-white border-gray-100 text-gray-400'
                            }`}>
                              {language === 'en' ? 'Size' : language === 'ru' ? 'Размер' : 'Veličina'}: {translateSizeName(item.selectedSize)}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-widest ${
                              theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-500' : 'bg-white border-gray-100 text-gray-400'
                            }`}>
                              {language === 'en' ? 'Color' : language === 'ru' ? 'Цвет' : 'Boja'}: {translateColorName(item.selectedColor)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency((item.discount_price || item.price) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Promo Code Input & Display in Order Summary */}
              <div className={`p-4 rounded-2xl border space-y-2.5 ${
                theme === 'dark' ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                  }`}>
                    <Tag className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`} />
                    <span>{ct('promoTitle')}</span>
                  </span>
                </div>

                {appliedPromo ? (
                  <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    theme === 'dark' ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">
                        {appliedPromo.promo_code}
                      </span>
                      <span className="text-xs font-semibold">
                        -{appliedPromo.amount_of_discount_in_percent}% {ct('promoDiscount')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="p-1 hover:bg-emerald-500/20 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 font-bold"
                      title={ct('promoRemove')}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{ct('promoRemove')}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={ct('promoPlaceholder')}
                        value={promoCodeInput}
                        onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyPromo();
                          }
                        }}
                        className={`flex-1 px-3 py-2 text-xs rounded-xl border font-mono tracking-wider uppercase focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white ${
                          theme === 'dark'
                            ? 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500'
                            : 'bg-gray-50 border-gray-300 text-black placeholder-gray-400'
                        }`}
                      />
                      <button
                        type="button"
                        disabled={promoApplying || !promoCodeInput.trim()}
                        onClick={handleApplyPromo}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed shrink-0 ${
                          theme === 'dark'
                            ? 'bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500'
                            : 'bg-black text-white hover:bg-zinc-800 disabled:bg-gray-200 disabled:text-gray-400'
                        }`}
                      >
                        {promoApplying ? '...' : ct('promoApply')}
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-[11px] text-rose-500 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 inline shrink-0" />
                        <span>{promoError}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className={`pt-6 border-t space-y-3 ${theme === 'dark' ? 'border-zinc-900' : 'border-gray-200'}`}>
                <div className={`flex justify-between text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  <span>{ct('subtotal')}</span>
                  <span className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-900'}>{formatCurrency(total)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-500 font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{ct('promoDiscount')} ({appliedPromo?.promo_code} -{appliedPromo?.amount_of_discount_in_percent}%)</span>
                    </span>
                    <span>-{formatCurrency(promoDiscount)}</span>
                  </div>
                )}
                <div className={`flex justify-between text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  <span>{ct('shipping')}</span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600 font-medium">{ct('shippingFree')}</span>
                  ) : (
                    <span className={`font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-900'}`}>
                      {formatCurrency(shippingCost)}
                    </span>
                  )}
                </div>
                <div className={`flex justify-between text-xl font-bold pt-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <span>{ct('grandTotal')}</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border flex items-start space-x-3 ${
                theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'
              }`}>
                <ShieldCheck className={`w-5 h-5 mt-0.5 ${theme === 'dark' ? 'text-zinc-700' : 'text-gray-400'}`} />
                <p className={`text-[10px] uppercase tracking-widest font-bold leading-relaxed ${
                  theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                }`}>
                  {ct('securitySSL')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
