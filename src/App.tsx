/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, lazy, Suspense, FormEvent } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Instagram, Facebook, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';
import { Product, CartItem, Category } from './types';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import CookieConsent from './components/CookieConsent';
import NewsletterPopup from './components/NewsletterPopup';
import ScrollToTop from './components/ScrollToTop';
import { sortCategories, sortProductsByCustomOrder } from './lib/categories';

const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Complaints = lazy(() => import('./pages/Complaints'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Contact = lazy(() => import('./pages/Contact'));
const Sale = lazy(() => import('./pages/Sale'));
const Categories = lazy(() => import('./pages/Categories'));
const NewCollection = lazy(() => import('./pages/NewCollection'));
const Collaborations = lazy(() => import('./pages/Collaborations'));
const Editorijali = lazy(() => import('./pages/Editorijali'));
const LepaISrecna = lazy(() => import('./pages/collaborations/LepaISrecna'));
const DDModnaPrica = lazy(() => import('./pages/collaborations/DDModnaPrica'));
const AndjelkaStevic = lazy(() => import('./pages/collaborations/AndjelkaStevic'));
const DraganaKosjerina = lazy(() => import('./pages/collaborations/DraganaKosjerina'));
const LjubicaKaradjordjevic = lazy(() => import('./pages/collaborations/LjubicaKaradjordjevic'));
const AleksandraPerisic = lazy(() => import('./pages/collaborations/AleksandraPerisic'));
const DraganaRadakovic = lazy(() => import('./pages/collaborations/DraganaRadakovic'));
const DraganaMicalovic = lazy(() => import('./pages/collaborations/DraganaMicalovic'));
const TamaraMisirlic = lazy(() => import('./pages/collaborations/TamaraMisirlic'));
const DajanaSvraka = lazy(() => import('./pages/collaborations/DajanaSvraka'));
const DanijelaPantic = lazy(() => import('./pages/collaborations/DanijelaPantic'));
const BelgradeFashionWeek = lazy(() => import('./pages/collaborations/BelgradeFashionWeek'));
const Admin = lazy(() => import('./pages/Admin'));
const OwnerPortal = lazy(() => import('./pages/OwnerPortal'));
const CustomTailoring = lazy(() => import('./pages/CustomTailoring'));
const SilkGuide = lazy(() => import('./pages/SilkGuide'));


function FadingBackground() {
  const location = useLocation();
  const { theme } = useTheme();

  const images: Record<string, string> = {
    '/': "https://images.weserv.nl/?url=64.media.tumblr.com/cb6f36c302200c648bf44670ada2305e/2b7c3e65e62eb0d6-47/s2048x3072/f4675eb55ccda97da38e96bf2cedb7b947b917f0.jpg",
    '/shop': "https://images.weserv.nl/?url=64.media.tumblr.com/6d12019b559087745a3d1db1e01ebf6d/96ff0d2545ab50fb-5b/s2048x3072/10de0c48cbf4f18ed46249e525cb0dd9ebab8425.jpg",
    
    // Press specific background images (ONLY for the press section)
    '/saradnje': "https://images.weserv.nl/?url=64.media.tumblr.com/ee4b31ecf786d70664b9543ad1425c80/dce9263cc4f8b5b7-61/s2048x3072/98a7d5868f7f46dc540af884a18c4e23abd71911.jpg",
    '/saradnje/lepaisrecna': "https://images.weserv.nl/?url=64.media.tumblr.com/dc0a7d20577b87803d85bce68571034b/49bb5b10ceb26ae9-16/s2048x3072/a87374b39ff7b8e1f20918b6afa086d5bed72ce4.jpg",
    '/saradnje/dd-modna-prica': "https://images.weserv.nl/?url=64.media.tumblr.com/76dc2883adea11944da040a1a7847267/dce9263cc4f8b5b7-c2/s2048x3072/2ef0942ea8f8d24999eef396e48bafb91c41e9b6.jpg",
    '/saradnje/andjelka-stevic': "https://images.weserv.nl/?url=64.media.tumblr.com/1bfee187e0ca0398f18dda06df01f18d/dce9263cc4f8b5b7-3c/s2048x3072/1124c1cda5bfefee44bbf99bb73a68d8507e2a44.jpg",
    '/saradnje/dragana-kosjerina': "https://images.weserv.nl/?url=64.media.tumblr.com/890f7e197f51ea99ffa089f8d9c9a9ae/dce9263cc4f8b5b7-7b/s2048x3072/c224efc0f44e718917caabc814849f7a0c05eaf4.jpg",
    '/saradnje/ljubica-karadjordjevic': "https://images.weserv.nl/?url=64.media.tumblr.com/ee4b31ecf786d70664b9543ad1425c80/dce9263cc4f8b5b7-61/s2048x3072/98a7d5868f7f46dc540af884a18c4e23abd71911.jpg",
    '/saradnje/aleksandra-perisic': "https://images.weserv.nl/?url=64.media.tumblr.com/399513ff7549a952a3acdd8f65e50b67/dce9263cc4f8b5b7-78/s2048x3072/fc0d00d6a3e44d27b68b792710ec6b5837b65de6.jpg",
    '/saradnje/dragana-micalovic': "https://images.weserv.nl/?url=64.media.tumblr.com/6ca196db17bf36375f7b9a0ab4a310b8/dce9263cc4f8b5b7-61/s2048x3072/064fb37fa5581ab2516646d1c5c79c9c35b1fe58.jpg",
    '/saradnje/dajana-svraka': "https://images.weserv.nl/?url=64.media.tumblr.com/effe353d3bf33a5e79529f568d01627a/dce9263cc4f8b5b7-af/s2048x3072/626cb32846e8056a1dcaf9bf058e53c2317e5138.jpg",
    '/saradnje/danijela-pantic': "https://images.weserv.nl/?url=64.media.tumblr.com/5a9a9c8275d2e2e09baa013f341cfff0/dce9263cc4f8b5b7-53/s2048x3072/a4c625ab22a8d6069430de77bc01643618fa3d79.jpg"
  };

  const isPressPage = location.pathname.startsWith('/saradnje');

  // Avoid using press/collaboration images for general views
  const bgImage = isPressPage 
    ? (images[location.pathname] || images['/saradnje'])
    : (location.pathname === '/shop' ? images['/shop'] : images['/']);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname + theme}
          initial={{ opacity: 0 }}
          animate={{ opacity: theme === 'dark' ? 0.14 : 0.09 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="w-full h-full"
          style={{
            backgroundImage: `url('${bgImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: theme === 'dark' ? 'grayscale(100%) brightness(0.6)' : 'grayscale(100%) contrast(1.1)',
          }}
        />
      </AnimatePresence>
      {/* Light theme gradient overlay shadow */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/75 transition-opacity duration-1000 ease-in-out"
        style={{ opacity: theme === 'dark' ? 0 : 1 }}
      />
      {/* Dark theme gradient overlay shadow */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-[#000000]/60 via-[#000000]/10 to-[#000000]/75 transition-opacity duration-1000 ease-in-out"
        style={{ opacity: theme === 'dark' ? 1 : 0 }}
      />
    </div>
  );
}

// Custom SEO and JSON-LD schema builder to MAX SEO & Best Google ranking practices
function useSEO() {
  const location = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    // Check if there are query parameters for faceted SEO (categories or editorial stories)
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');
    const pricaParam = searchParams.get('prica') || searchParams.get('tab');

    const baseTitle = 'DD DESIGN';
    const slogan = 'Umetnost utkana u svilu';

    const seoData: Record<string, Record<string, { title: string; desc: string; keywords: string; type?: string }>> = {
      'sr': {
        '/': {
          title: 'DD DESIGN | Umetnost utkana u svilu | Unikatna & Luksuzna Moda',
          desc: 'Atelje DD DESIGN Danijele Gojković. Umetnost utkana u svilu — unikatne haljine od luksuzne taft, šantung i grež svile, kaputi, ženska odela i kreacije po meri.',
          keywords: 'umetnost utkana u svilu, dd design, danijela gojkovic, taft svila, santung svila, grez svila, unikatne haljine beograd, luksuzna odela, srpska moda',
          type: 'ClothingStore'
        },
        '/shop': {
          title: 'Prodavnica | Luksuzni Modni Komadi | DD DESIGN',
          desc: 'Istražite našu kolekciju unikatnih haljina, luksuznih odela, brendiranih sakoa i ručno šivenih kaputa od najplemenitije prirodne svile. Sigurna kupovina online.',
          keywords: 'kupovina haljina beograd, svilene haljine srbija, zenska odela od svile, taft svilene suknje, mantili unikatni, rucni rad',
          type: 'CollectionPage'
        },
        '/nova-kolekcija': {
          title: 'Nova Kolekcija | Ekskluzivni Svileni Modeli | DD DESIGN',
          desc: 'Nova modna kolekcija ateljea DD DESIGN. Limitirane serije, najfinija taft i šantung svila, bezvremenska silueta i arhitektonski krojevi za posebne prilike.',
          keywords: 'nova kolekcija dd design, luksuzne svilene haljine, nova modna sezona, unikatni dizajnerski komadi, visoka moda srbija',
          type: 'CollectionPage'
        },
        '/snizenja': {
          title: 'Sniženja & Posebne Pogodnosti | DD DESIGN',
          desc: 'Ekskluzivna ponuda odabranih dizajnerskih modela po sniženim cenama. Iskoristite priliku za unikatne kapute, odela i haljine vrhunskog kvaliteta.',
          keywords: 'snizenja odeca beograd, popusti haljine, modna snizenja, svila akcija, dd design outlet',
          type: 'CollectionPage'
        },
        '/kategorije': {
          title: 'Kategorije Kolekcije | Haljine, Odela, Kaputi, Sakoi | DD DESIGN',
          desc: 'Pregledajte kompletan asortiman DD DESIGN po kategorijama: ekskluzivne haljine, svečana ženska odela, skulpturalni sakoi, kaputi i svilene suknje.',
          keywords: 'modne kategorije, svilene haljine, kaputi rucni rad, sakoi od svile, unikatna odela zenska',
          type: 'CollectionPage'
        },
        '/o-svili': {
          title: 'O Svili | Vodič kroz Taft, Šantung i Grež Svilu | DD DESIGN',
          desc: 'Kompletan vodič kroz plemenite materijale DD DESIGN kolekcija: Taft svila (kraljevska tekstura i šuštavi zvuk), Šantung svila i prirodna Grež svila. Održavanje i karakteristike.',
          keywords: 'o svili, taft svila, santung svila, grez svila, odrzavanje svile, prirodna svila beograd, luksuzni materijali',
          type: 'Article'
        },
        '/izrada-po-meri': {
          title: 'Izrada po Meri | Bespoke Krojenje za Vašu Figuru | DD DESIGN',
          desc: 'Personalizovana izrada modela po meri u ateljeu DD DESIGN. Savršeno prilagođavanje vašoj silueti, odabir najfinije svile i posvećenost detaljima.',
          keywords: 'izrada po meri beograd, sivenje po meri, unikatne haljine po meri, maturske i svecane haljine po meri, bespoke zenska odela',
          type: 'Service'
        },
        '/editorijali': {
          title: 'Digitalni Editorijali & Modne Priče | Umetnost utkana u svilu | DD DESIGN',
          desc: 'Interaktivni modni magazin i vizuelne priče brenda DD DESIGN. Estetika svile u pokretu, umetničke fotografije, priče o taft svili i saveti za stilizovanje.',
          keywords: 'modni editorijal, price o svili, digitalni modni casopis, stilski saveti svila, dd design editorial',
          type: 'Article'
        },
        '/saradnje': {
          title: 'Press & Saradnje | DD DESIGN u Medijima | Danijela Gojković',
          desc: 'Pregled medijskih nastupa, naslovnih strana, televizijskih gostovanja i saradnji ateljea DD DESIGN i dizajnerke Danijele Gojković.',
          keywords: 'press dd design, danijela gojkovic mediji, javne licnosti moda, modne saradnje',
          type: 'CollectionPage'
        },
        '/saradnje/lepaisrecna': {
          title: 'Lepa & Srećna Editorijal | Miloš Nadaždin & DD DESIGN',
          desc: 'Ekskluzivni modni editorijal brenda DD DESIGN objavljen u prestižnom magazinu Lepa & Srećna, snimljen pod budnim okom Miloša Nadaždina.',
          keywords: 'lepa i srecna dd design, milos nadazdin modna fotografija, editorijal zenska moda',
          type: 'Article'
        },
        '/saradnje/dd-modna-prica': {
          title: 'Naša Modna Priča | O Ateljeu DD DESIGN & Danijeli Gojković',
          desc: 'Upoznajte viziju i put Danijele Gojković: od prvih skica do prepoznatljivog modnog ateljea koji stvara umetnost utkanu u svilu.',
          keywords: 'dd modna prica, o ateljeu dd design, danijela gojkovic dizajner, srpski modni atelje',
          type: 'Article'
        },
        '/saradnje/andjelka-stevic': {
          title: 'Anđelka Stević Žugić u DD DESIGN Kreacijama | Press',
          desc: 'Poznata glumica Anđelka Stević Žugić zablistala je u unikatnim odevnim komadima i haljinama ateljea DD DESIGN.',
          keywords: 'andjelka stevic haljina, andjelka stevic dd design, glumica moda srbija',
          type: 'Article'
        },
        '/saradnje/dragana-kosjerina': {
          title: 'Dragana Kosjerina u DD DESIGN Kreacijama | Press',
          desc: 'Televizijska voditeljka Dragana Kosjerina u sofisticiranim kreacijama i haljinama ateljea DD DESIGN.',
          keywords: 'dragana kosjerina dd design, rts voditeljka haljina, sofisticirana zenska moda',
          type: 'Article'
        },
        '/saradnje/ljubica-karadjordjevic': {
          title: 'Princeza Ljubica Karađorđević | Kraljevska Elegancija DD DESIGN',
          desc: 'Saradnja sa princezom Ljubicom Karađorđević: bezvremenska kraljevska elegancija i plemenite svilene siluete.',
          keywords: 'ljubica karadjordjevic haljina, kraljevska elegancija, dd design svecane kreacije',
          type: 'Article'
        },
        '/saradnje/aleksandra-perisic': {
          title: 'Aleksandra Perišić | Olimpijska Vicešampionka u DD DESIGNU',
          desc: 'Olimpijska vicešampionka Aleksandra Perišić u modernim i upečatljivim kreacijama našeg ateljea.',
          keywords: 'aleksandra perisic tekvondo dd design, olimpijka haljina moda',
          type: 'Article'
        },
        '/saradnje/dragana-radakovic': {
          title: 'Dragana Radaković | Operska Primadona u DD DESIGN Kreacijama',
          desc: 'Svetski priznata operska primadona Dragana Radaković nosi dramatične i skulpturalne haljine ateljea DD DESIGN na svetskim scenama.',
          keywords: 'dragana radakovic sopran, operske haljine, svecane toalete od svile',
          type: 'Article'
        },
        '/saradnje/dragana-micalovic': {
          title: 'Dragana Mićalović u DD DESIGN Modelima | Press & Glamur',
          desc: 'Glumica Dragana Mićalović nosi unikatne modele i sofisticirana odela iz ateljea DD DESIGN.',
          keywords: 'dragana micalovic odelo, glumica stil dd design',
          type: 'Article'
        },
        '/saradnje/tamara-misirlic': {
          title: 'Tamara Misirlić | Humanitarna Snaga & Elegancija | DD DESIGN',
          desc: 'Humanitarka Tamara Misirlić u nežnim i moćnim komadima kreiranim u ateljeu DD DESIGN.',
          keywords: 'tamara misirlic humanitarka, dd design saradnja',
          type: 'Article'
        },
        '/saradnje/dajana-svraka': {
          title: 'Dajana Švraka Milutinović | Autentičan Stil | DD DESIGN',
          desc: 'Medijska ličnost i novinarka Dajana Švraka Milutinović u elegantnim kreacijama brenda DD DESIGN.',
          keywords: 'dajana svraka novinarka haljina, rts dddesign',
          type: 'Article'
        },
        '/saradnje/danijela-pantic': {
          title: 'Danijela Pantić Conić | TV Ličnost u DD DESIGNU',
          desc: 'Poznato TV lice Danijela Pantić Conić u prepoznatljivim sakoima i svilenim komadima DD DESIGN.',
          keywords: 'danijela pantic slagalica tv haljina, dd design',
          type: 'Article'
        },
        '/saradnje/belgrade-fashion-week': {
          title: 'Belgrade Fashion Week | DD DESIGN na Nedelji Mode',
          desc: 'Predstavljanje kolekcija DD DESIGN na Belgrade Fashion Week-u: visoke ocene kritičara za skulpturalnu svilu i formu.',
          keywords: 'belgrade fashion week dd design, bfw beograd, nedelja mode revija',
          type: 'Article'
        },
        '/kontakt': {
          title: 'Kontakt & Atelje | DD DESIGN Beograd',
          desc: 'Stupite u kontakt sa ateljeom DD DESIGN. Poručivanje, konsultacije, zakazivanje termina za probu modela u Beogradu. Telefon: +381 64 160 5032.',
          keywords: 'kontakt dd design, atelje beograd telefon, zakazivanje probe haljine, porucivanje svile',
          type: 'ContactPage'
        },
        '/reklamacije': {
          title: 'Reklamacije i Prigovori | Sigurna Kupovina | DD DESIGN',
          desc: 'Informacije o postupku reklamacije, zamene i odustanka od kupovine u skladu sa Zakonom o zaštiti potrošača Republike Srbije.',
          keywords: 'reklamacije dd design, povrat robe, zamena velicine, prava kupaca',
          type: 'WebPage'
        },
        '/politika-privatnosti': {
          title: 'Politika Privatnosti | Zaštita Vaših Podataka | DD DESIGN',
          desc: 'Pravila privatnosti ateljea DD DESIGN. Sigurno čuvanje vaših ličnih podataka u skladu sa GDPR i propisima Republike Srbije.',
          keywords: 'politika privatnosti dd design, zastita podataka, sigurnost kupovine',
          type: 'WebPage'
        },
        '/uslovi-koriscenja': {
          title: 'Uslovi Korišćenja | Pravilnik Online Kupovine | DD DESIGN',
          desc: 'Opšti uslovi korišćenja i kupovine u online prodavnici ateljea DD DESIGN. Isporuka, cene, prava i obaveze kupaca i prodavca.',
          keywords: 'uslovi koriscenja prodavnice, isporuka robe srbija, nacin placanja, raiffeisen placanje',
          type: 'WebPage'
        }
      },
      'en': {
        '/': {
          title: 'DD DESIGN | Art Woven into Silk | Unique Luxury Fashion',
          desc: 'DD DESIGN Atelier by Danijela Gojković. Art woven into silk — unique handcrafted dresses made of pure taffeta, shantung and grege silk, tailored coats and bespoke suits.',
          keywords: 'art woven into silk, dd design, danijela gojkovic, taffeta silk gown, unique fashion brand, serbian couture',
          type: 'ClothingStore'
        },
        '/shop': {
          title: 'Boutique Shop | Luxury Silk Collection | DD DESIGN',
          desc: 'Explore or buy handcrafted designer coats, tailored suits, evening gowns, and limited silk pieces. Premium packaging and secure online checkout.',
          keywords: 'exclusive online boutique, buy hand-stitched coat, designer evening dresses, silk fashion',
          type: 'CollectionPage'
        },
        '/nova-kolekcija': {
          title: 'New Collection | Signature Silk Pieces | DD DESIGN',
          desc: 'Discover our newest luxury capsule of pure silk creations, structured silhouettes and timeless elegance.',
          keywords: 'new silk collection, designer dresses, haute couture europe',
          type: 'CollectionPage'
        },
        '/o-svili': {
          title: 'Silk Guide | Taffeta, Shantung & Grege Silk | DD DESIGN',
          desc: 'A masterclass on pure luxury silk materials: Taffeta silk with its iconic rustle and structure, slubbed Shantung, and authentic Grege silk.',
          keywords: 'silk guide, taffeta silk properties, shantung silk, luxury fabric guide',
          type: 'Article'
        },
        '/izrada-po-meri': {
          title: 'Custom Tailoring & Bespoke Atelier | DD DESIGN',
          desc: 'Bespoke tailoring and personalized sizing for your exact silhouette in pure natural silk at the DD DESIGN atelier.',
          keywords: 'bespoke tailoring belgrade, custom silk dress, haute couture made to measure',
          type: 'Service'
        },
        '/editorijali': {
          title: 'Digital Editorials | Art of Taffeta Silk | DD DESIGN',
          desc: 'The official digital fashion magazine of DD DESIGN. Immersive visual storytelling, styling guides, and premium thoughts on silk texture.',
          keywords: 'taffeta silk texture, luxury editorials, high couture europe',
          type: 'Article'
        },
        '/saradnje': {
          title: 'Press & Collaborations | DD DESIGN in the Spotlight',
          desc: 'Official featured publications, covers, and editorials with top celebrities and premium magazines highlighting our artistic range.',
          keywords: 'fashion brand tv appearances, design portfolio, celebrity fashion',
          type: 'CollectionPage'
        },
        '/kontakt': {
          title: 'Contact Atelier | DD DESIGN Belgrade',
          desc: 'Get in touch with DD DESIGN Atelier for consultations, styling appointments, and bespoke fittings.',
          keywords: 'contact dd design, belgrade fashion atelier, appointments',
          type: 'ContactPage'
        }
      },
      'ru': {
        '/': {
          title: 'DD DESIGN | Искусство, сотканное из шелка | Высокая Мода',
          desc: 'Ателье DD DESIGN Даниелы Гойкович. Искусство, сотканное из шелка — эксклюзивные платья из шелковой тафты, шантунга и грежа, костюмы и пальто ручной работы.',
          keywords: 'dd design, Даниела Гойкович, шелковая тафта, купить пальто белград, дизайнерские платья шелк',
          type: 'ClothingStore'
        },
        '/shop': {
          title: 'Магазин | Премиум Коллекция Одежды | DD DESIGN',
          desc: 'Купить уникальные вечерние платья, элегантные костюмы и пальто ручной работы. Быстрая доставка, превосходное качество пошива.',
          keywords: 'купить платье у дизайнера, шелк тафта юбка, брендовые пиджаки',
          type: 'CollectionPage'
        },
        '/o-svili': {
          title: 'Гид по Шелку | Тафта, Шантунг и Греж | DD DESIGN',
          desc: 'Полное руководство по благородным натуральным шелкам: шелковая тафта, шантунг и аутентичный греж. Особенности и уход.',
          keywords: 'шелковая тафта, шантунг шелк, уход за шелком, премиальные ткани',
          type: 'Article'
        },
        '/izrada-po-meri': {
          title: 'Индивидуальный Пошив по Меркам | DD DESIGN',
          desc: 'Персонализированный пошив эксклюзивных моделей под вашу фигуру в ателье DD DESIGN.',
          keywords: 'пошив платья на заказ, индивидуальный пошив белград, шелк на заказ',
          type: 'Service'
        },
        '/editorijali': {
          title: 'Модный Редакция | Искусство и Шелковая Тафта | DD DESIGN',
          desc: 'Официальный интерактивный журнал DD DESIGN. Съемки в замках, истории создания коллекций из тафты и гиды по стилю.',
          keywords: 'шелковая тафта, обзоры моды, эксклюзивные платья кокон',
          type: 'Article'
        },
        '/saradnje': {
          title: 'Пресса и Сотрудничество | Бренд DD DESIGN в Медиа',
          desc: 'Сюжеты из ведущих глянцевых изданий, обложки журналов и репортажи о наших показах с известными медиа-персонами.',
          keywords: 'коллаборации брендов, пресса мода',
          type: 'CollectionPage'
        },
        '/kontakt': {
          title: 'Контакты & Ателье | DD DESIGN Белград',
          desc: 'Свяжитесь с ателье DD DESIGN для заказа, консультаций и записи на примерку в Белграде.',
          keywords: 'контакты ателье белград, запись на примерку платья',
          type: 'ContactPage'
        }
      }
    };

    const currentLangData = seoData[language] || seoData['sr'];
    let currentRouteData = currentLangData[location.pathname];

    // Handle faceted URLs (categories or editorial stories)
    if (!currentRouteData) {
      if (location.pathname.startsWith('/saradnje/')) {
        currentRouteData = currentLangData['/saradnje'] || {
          title: `Press Saradnja | ${baseTitle}`,
          desc: `Ekskluzivna modna saradnja i medijska objava ateljea DD DESIGN.`,
          keywords: `press, dd design, moda`,
          type: 'Article'
        };
      } else if (location.pathname.startsWith('/product/')) {
        currentRouteData = {
          title: `Ekskluzivan Model | ${slogan} | ${baseTitle}`,
          desc: `Unikatni model ručne izrade od najplemenitije prirodne svile. Atelje DD DESIGN Danijele Gojković.`,
          keywords: `svilena odeca, unikatna haljina, luksuzni komad, rucni rad`,
          type: 'Product'
        };
      } else {
        currentRouteData = {
          title: `${baseTitle} | ${slogan}`,
          desc: `Unikatni krojeni modeli visokog kvaliteta koji spajaju bezvremensku klasiku, skulpturalnu formu i prirodnu svilu.`,
          keywords: `dd design, haute couture, srpski dizajneri, umetnost utkana u svilu`,
          type: 'WebPage'
        };
      }
    }

    // Faceted adjustments for Category or Editorial query params
    let effectiveTitle = currentRouteData.title;
    let effectiveDesc = currentRouteData.desc;

    if (location.pathname === '/shop' && categoryParam) {
      const CATEGORY_MAP: Record<string, { titleSr: string; descSr: string; titleEn: string; descEn: string }> = {
        '1': {
          titleSr: 'Kaputi i Mantili',
          descSr: 'Istražite kolekciju unikatnih, ručno šivenih kaputa i mantila od najplemenitijih materijala u ateljeu DD DESIGN.',
          titleEn: 'Coats & Outerwear',
          descEn: 'Explore handcrafted luxury coats and tailored outerwear at DD DESIGN Atelier.'
        },
        '2': {
          titleSr: 'Odela i Kompleti',
          descSr: 'Istražite kolekciju ekskluzivnih ženskih odela i kompleta od prirodne svile u ateljeu DD DESIGN. Skulpturalni krojevi i elegancija.',
          titleEn: 'Suits & Tailored Sets',
          descEn: 'Discover exclusive luxury suits and tailored silk sets at DD DESIGN Atelier.'
        },
        '3': {
          titleSr: 'Haljine',
          descSr: 'Istražite kolekciju unikatnih svilenih haljina od taft i šantung svile u ateljeu DD DESIGN. Bezvremenski glamur i savršena linija.',
          titleEn: 'Silk Dresses',
          descEn: 'Explore our exclusive collection of luxury pure silk gowns and evening dresses at DD DESIGN.'
        },
        '4': {
          titleSr: 'Kombinezoni',
          descSr: 'Istražite kolekciju sofisticiranih ženskih kombinezona od prirodne svile u ateljeu DD DESIGN.',
          titleEn: 'Silk Jumpsuits',
          descEn: 'Discover structured and fluid silk jumpsuits at DD DESIGN Atelier.'
        },
        '5': {
          titleSr: 'Košulje i Majice',
          descSr: 'Istražite kolekciju svilenih košulja i prefinjenih topova u ateljeu DD DESIGN.',
          titleEn: 'Silk Shirts & Tops',
          descEn: 'Shop elegant handcrafted silk shirts and tops at DD DESIGN.'
        },
        '6': {
          titleSr: 'Pantalone i Suknje',
          descSr: 'Istražite kolekciju svilenih suknji i elegantnih pantalona u ateljeu DD DESIGN.',
          titleEn: 'Trousers & Skirts',
          descEn: 'Explore tailored silk trousers and sculptural skirts at DD DESIGN Atelier.'
        }
      };

      const mapped = CATEGORY_MAP[categoryParam];
      const catName = mapped ? (language === 'en' ? mapped.titleEn : mapped.titleSr) : categoryParam;
      const catDesc = mapped ? (language === 'en' ? mapped.descEn : mapped.descSr) : `Istražite kolekciju kategorije ${categoryParam} u ateljeu DD DESIGN. Vrhunski krojevi od najfinije svile.`;

      effectiveTitle = `${catName} | Svileni Modeli | ${baseTitle}`;
      effectiveDesc = catDesc;
    } else if (location.pathname === '/editorijali' && pricaParam) {
      if (pricaParam === 'taft') {
        effectiveTitle = `Taft Svila | Kraljevska Tekstura & Zvuk u Pokretu | ${baseTitle}`;
        effectiveDesc = `Sve o taft svili u DD DESIGN kolekcijama: skulpturalna forma, šuštavi zvuk i bezvremenski kraljevski sjaj.`;
      } else if (pricaParam === 'santung') {
        effectiveTitle = `Šantung Svila | Prirodna Tekstura & Suptilna Mat Elegancija | ${baseTitle}`;
        effectiveDesc = `Saznajte zašto je šantung svila sinonim za organski luksuz i diskretnu sofisticiranost u ateljeu DD DESIGN.`;
      } else if (pricaParam === 'grez') {
        effectiveTitle = `Grež Svila | Sirova Autentičnost & Hipoalergena Svojstva | ${baseTitle}`;
        effectiveDesc = `Otkrijte grež svilu: neobrađena prirodna vlakna bogata sericinom za savršen komfor tokom celog dana.`;
      } else if (pricaParam === 'po-meri') {
        effectiveTitle = `Izrada po Meri | Personalizovano Krojenje za Vašu Siluetu | ${baseTitle}`;
        effectiveDesc = `Kako funkcioniše bespoke izrada po meri u našem ateljeu: od uzimanja mera do unikatne kreacije.`;
      }
    }

    document.title = effectiveTitle;

    // Helper functions for meta tag manipulation
    const setMetaName = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const setMetaProperty = (prop: string, content: string) => {
      let el = document.querySelector(`meta[property="${prop}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', prop);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMetaName('description', effectiveDesc);
    setMetaName('keywords', currentRouteData.keywords);

    const canonicalUrl = `https://dddesign.rs${location.pathname}${location.search || ''}`;
    
    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Open Graph
    setMetaProperty('og:title', effectiveTitle);
    setMetaProperty('og:description', effectiveDesc);
    setMetaProperty('og:url', canonicalUrl);
    setMetaProperty('og:site_name', 'DD DESIGN');
    setMetaProperty('og:locale', language === 'sr' ? 'sr_RS' : language === 'ru' ? 'ru_RU' : 'en_US');

    // Twitter
    setMetaName('twitter:title', effectiveTitle);
    setMetaName('twitter:description', effectiveDesc);
    setMetaName('twitter:url', canonicalUrl);

    // Dynamic JSON-LD Structured Data
    let schemaScript = document.getElementById('jsonld-schema');
    if (schemaScript) {
      schemaScript.remove();
    }
    schemaScript = document.createElement('script');
    schemaScript.id = 'jsonld-schema';
    schemaScript.setAttribute('type', 'application/ld+json');

    const schemaOrg: any = {
      "@context": "https://schema.org",
      "@type": currentRouteData.type || "ClothingStore",
      "name": "DD DESIGN",
      "url": canonicalUrl,
      "image": "https://images.weserv.nl/?url=64.media.tumblr.com/85a2897f98a2b096033b5b7b2baa4305/941158d434c8785d-07/s1280x1920/1770317d73e6ae1e7a6940ed7119efd4f78c57ce.jpg",
      "description": effectiveDesc,
      "slogan": "Umetnost utkana u svilu",
      "brand": {
        "@type": "Brand",
        "name": "DD DESIGN",
        "slogan": "Umetnost utkana u svilu"
      }
    };

    if (currentRouteData.type === 'Article') {
      schemaOrg.headline = effectiveTitle;
      schemaOrg.author = {
        "@type": "Person",
        "name": "Danijela Gojković"
      };
      schemaOrg.publisher = {
        "@type": "Organization",
        "name": "DD DESIGN",
        "logo": {
          "@type": "ImageObject",
          "url": "https://images.weserv.nl/?url=64.media.tumblr.com/85a2897f98a2b096033b5b7b2baa4305/941158d434c8785d-07/s1280x1920/1770317d73e6ae1e7a6940ed7119efd4f78c57ce.jpg"
        }
      };
    }

    schemaScript.innerHTML = JSON.stringify(schemaOrg);
    document.head.appendChild(schemaScript);

  }, [location.pathname, location.search, language]);
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const { theme } = useTheme();
  const location = useLocation();
  const isOwnerPage = location.pathname.startsWith('/vlasnici') || location.pathname.startsWith('/baza') || location.pathname.startsWith('/portal-za-vlasnike');
  useSEO(); // Run dynamic SEO optimization on route change

  // Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const handleNewsletterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setNewsletterStatus('error');
      setNewsletterMessage('Molimo unesite ispravnu e-mail adresu.');
      return;
    }

    setNewsletterStatus('loading');
    setNewsletterMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setNewsletterStatus('success');
        setNewsletterMessage(data.message || 'Uspešno ste se prijavili na naš newsletter!');
        setNewsletterEmail('');
      } else {
        setNewsletterStatus('error');
        setNewsletterMessage(data.error || 'Došlo je do greške. Pokušajte ponovo.');
      }
    } catch (err) {
      console.error('Newsletter error:', err);
      setNewsletterStatus('error');
      setNewsletterMessage('Došlo je do mrežne greške. Pokušajte ponovo.');
    }
  };

  
  // Inicijalizacija stanja iz localStorage (keša) ako postoji sa deduplikacijom
  const [products, setProducts] = useState<Product[]>(() => {
    const cachedV5 = localStorage.getItem('dd_products_cache_v5');
    if (cachedV5) {
      try {
        const parsed = JSON.parse(cachedV5);
        return Array.from(new Map(parsed.map((p: Product) => [
          p.id,
          {
            ...p,
            sizes: Array.from(new Map((p.sizes || []).map((s: any) => [s.id, s])).values()),
            colors: Array.from(new Map((p.colors || []).map((c: any) => [c.id, c])).values())
          }
        ])).values());
      } catch {
        // ignore
      }
    }
    const cached = localStorage.getItem('dd_products_cache_v4');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return Array.from(new Map(parsed.map((p: Product) => [
          p.id,
          {
            ...p,
            sizes: Array.from(new Map((p.sizes || []).map((s: any) => [s.id, s])).values()),
            colors: Array.from(new Map((p.colors || []).map((c: any) => [c.id, c])).values())
          }
        ])).values());
      } catch {
        // ignore
      }
    }
    return [];
  });
  
  const [categories, setCategories] = useState<Category[]>(() => {
    const cachedV5 = localStorage.getItem('dd_categories_cache_v5');
    if (cachedV5) {
      try {
        return sortCategories(JSON.parse(cachedV5));
      } catch {
        // ignore JSON parse issue
      }
    }
    const cached = localStorage.getItem('dd_categories_cache_v4');
    if (cached) {
      try {
        return sortCategories(JSON.parse(cached));
      } catch {
        // ignore
      }
    }
    return [];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const cached = localStorage.getItem('dd_cart_cache');
    return cached ? JSON.parse(cached) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(products.length === 0); // Ako imamo keširane proizvode, nemoj prikazivati spinner

  // Sačuvaj korpu u localStorage pri svakoj promeni
  useEffect(() => {
    localStorage.setItem('dd_cart_cache', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("Osvežavam podatke iz baze...");

        // Preuzmi server-side sačuvani redosled ako postoji
        try {
          const ordRes = await fetch("/api/ordering");
          if (ordRes.ok) {
            const ordData = await ordRes.json();
            if (ordData.success) {
              if (Array.isArray(ordData.categoryOrder) && ordData.categoryOrder.length > 0) {
                localStorage.setItem("dd_category_order", JSON.stringify(ordData.categoryOrder));
              }
              if (Array.isArray(ordData.productOrder) && ordData.productOrder.length > 0) {
                localStorage.setItem("dd_product_order", JSON.stringify(ordData.productOrder));
              }
            }
          }
        } catch {
          // ignore
        }

        // Dohvati kategorije
        const { data: catData, error: catError } = await supabase
          .from("categories")
          .select("*");
        
        if (catData) {
          const sorted = sortCategories(catData);
          setCategories(sorted);
          localStorage.setItem('dd_categories_cache_v5', JSON.stringify(sorted));
        }

        // Dohvati proizvode
        let data: any = null;
        let error: any = null;

        const queryOptions = [
          // Opcija 1: lowercase product_colors i lowercase colors (sa Color/color poljem)
          `
            id,
            name,
            description,
            price,
            discount_price,
            stock,
            is_active,
            category_id,
            new_collection,
            categories:category_id (
              name,
              Id
            ),
            product_images (
              id,
              image_url,
              image_url2,
              image_url3,
              image_url4,
              image_url5,
              is_main
            ),
            product_sizes (
              sizes (
                id,
                name
              )
            ),
            product_colors (
              colors (
                id,
                Color,
                color
              )
            )
          `,
          // Opcija 2: Velika slova Product_colors i Colors (sa Color poljem)
          `
            id,
            name,
            description,
            price,
            discount_price,
            stock,
            is_active,
            category_id,
            new_collection,
            categories:category_id (
              name,
              Id
            ),
            product_images (
              id,
              image_url,
              image_url2,
              image_url3,
              image_url4,
              image_url5,
              is_main
            ),
            product_sizes (
              sizes (
                id,
                name
              )
            ),
            Product_colors (
              Colors (
                id,
                Color
              )
            )
          `,
          // Opcija 3: mala slova product_colors sa velikim Colors
          `
            id,
            name,
            description,
            price,
            discount_price,
            stock,
            is_active,
            category_id,
            new_collection,
            categories:category_id (
              name,
              Id
            ),
            product_images (
              id,
              image_url,
              image_url2,
              image_url3,
              image_url4,
              image_url5,
              is_main
            ),
            product_sizes (
              sizes (
                id,
                name
              )
            ),
            product_colors (
              Colors (
                id,
                Color
              )
            )
          `,
          // Opcija 4: Velika slova Product_colors sa malim colors
          `
            id,
            name,
            description,
            price,
            discount_price,
            stock,
            is_active,
            category_id,
            new_collection,
            categories:category_id (
              name,
              Id
            ),
            product_images (
              id,
              image_url,
              image_url2,
              image_url3,
              image_url4,
              image_url5,
              is_main
            ),
            product_sizes (
              sizes (
                id,
                name
              )
            ),
            Product_colors (
              colors (
                id,
                color
              )
            )
          `,
          // Opcija 5: Bez boja ako ništa od ovoga ne prođe
          `
            id,
            name,
            description,
            price,
            discount_price,
            stock,
            is_active,
            category_id,
            new_collection,
            categories:category_id (
              name,
              Id
            ),
            product_images (
              id,
              image_url,
              image_url2,
              image_url3,
              image_url4,
              image_url5,
              is_main
            ),
            product_sizes (
              sizes (
                id,
                name
              )
            )
          `
        ];

        for (let i = 0; i < queryOptions.length; i++) {
          const res = await supabase
            .from("products")
            .select(queryOptions[i]);

          if (!res.error) {
            data = res.data;
            error = null;
            break;
          } else {
            error = res.error;
          }
        }

        if (data && !error) {
          const mappedProductsRaw: Product[] = data.map((product: any) => {
            const categoryName = product.categories?.name || 'Ostalo';
            const rawSizes = product.product_sizes?.map((ps: any) => ps.sizes).filter(Boolean) || [];
            const uniqueSizes = Array.from(new Map(rawSizes.map((s: any) => [String(s.id), s])).values());
            
            const rawColors = product.product_colors || product.Product_colors || [];
            const mappedColors = rawColors.map((pc: any) => {
              const colorObj = pc.colors || pc.Colors;
              if (!colorObj) return null;
              return {
                id: colorObj.id,
                name: colorObj.Color || colorObj.color || colorObj.name || ''
              };
            }).filter(Boolean) || [];
            const uniqueColors = Array.from(new Map(mappedColors.map((c: any) => [String(c.id), c])).values());
            
            const allImages: string[] = [];
            if (product.product_images && product.product_images.length > 0) {
              product.product_images.forEach((img: any) => {
                if (img.image_url) allImages.push(img.image_url);
                if (img.image_url2) allImages.push(img.image_url2);
                if (img.image_url3) allImages.push(img.image_url3);
                if (img.image_url4) allImages.push(img.image_url4);
                if (img.image_url5) allImages.push(img.image_url5);
              });
            }
            
            const uniqueImages = Array.from(new Set(allImages)).filter(Boolean);

            return {
              id: String(product.id),
              name: product.name,
              description: product.description,
              price: Number(product.price),
              discount_price: product.discount_price
                ? Number(product.discount_price)
                : null,
              stock: product.stock,
              is_active: product.is_active,
              category_id: product.category_id,
              category: categoryName,
              new_collection: product.new_collection,
              sizes: uniqueSizes,
              colors: uniqueColors,
              all_images: uniqueImages,
              image_url:
                product.product_images?.find(
                  (img: any) => img.is_main === true
                )?.image_url ||
                uniqueImages[0] ||
                "https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=800"
            };
          }).filter((p: Product) => p.is_active !== false); // Ne prikazuj proizvode ako im je vrednost is_active false

          // Garantovano jedinstveni proizvodi po ID, poređani po sačuvanom redosledu
          const mappedProducts = sortProductsByCustomOrder(
            Array.from(new Map(mappedProductsRaw.map(p => [p.id, p])).values())
          );

          setProducts(mappedProducts);
          // Sačuvaj osvežene proizvode u keš
          localStorage.setItem('dd_products_cache_v5', JSON.stringify(mappedProducts));
          localStorage.removeItem('dd_products_cache_v4');
        }
      } catch (err) {
        console.error("Greška pri dohvatanju:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const addToCart = (product: Product, selectedSize?: string, selectedColor?: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor) ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedSize, selectedColor }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number, selectedSize?: string, selectedColor?: string) => {
    setCart(prev => prev.map(item => 
      (item.id === id && item.selectedSize === selectedSize && item.selectedColor === selectedColor) ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeFromCart = (id: string, selectedSize?: string, selectedColor?: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.selectedSize === selectedSize && item.selectedColor === selectedColor)));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (isOwnerPage) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <ScrollToTop />
        <Suspense fallback={
          <div className="flex h-screen items-center justify-center bg-slate-950">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full" />
          </div>
        }>
          <Routes>
            <Route path="/vlasnici" element={<OwnerPortal />} />
            <Route path="/baza" element={<OwnerPortal />} />
            <Route path="/portal-za-vlasnike" element={<OwnerPortal />} />
          </Routes>
        </Suspense>
      </div>
    );
  }

  return (
    <>
      <div className={`fixed inset-0 z-0 transition-colors duration-500 ${
        theme === 'dark' ? 'bg-[#000000]' : 'bg-white'
      }`} />
      <ScrollToTop />
      <Navbar products={products} categories={categories} cartCount={cartCount} onCartToggle={() => setIsCartOpen(!isCartOpen)} />
      <FadingBackground />
      <div className={`min-h-screen font-sans transition-colors duration-500 flex flex-col relative z-10 bg-transparent ${
        theme === 'dark' 
          ? 'text-white selection:bg-white selection:text-black' 
          : 'text-gray-900 selection:bg-black selection:text-white'
      }`}>
        <main className="flex-1 pt-16">
          <Suspense fallback={
            <div className="flex h-[60vh] items-center justify-center">
              <div className="w-8 h-8 border-b-2 border-zinc-500 animate-spin rounded-full" />
            </div>
          }>
            <Routes>
              <Route path="/" element={<Home products={products} categories={categories} loading={loading} onAddToCart={addToCart} />} />
              <Route path="/shop" element={<Shop products={products} categories={categories} loading={loading} onAddToCart={addToCart} />} />
              <Route path="/product/:id" element={<ProductDetails products={products} onAddToCart={addToCart} />} />
              <Route path="/checkout" element={<Checkout cart={cart} clearCart={clearCart} />} />
              <Route path="/reklamacije" element={<Complaints />} />
              <Route path="/politika-privatnosti" element={<PrivacyPolicy />} />
              <Route path="/uslovi-koriscenja" element={<TermsOfService />} />
              <Route path="/kontakt" element={<Contact />} />
              <Route path="/snizenja" element={<Sale products={products} loading={loading} onAddToCart={addToCart} />} />
              <Route path="/kategorije" element={<Categories categories={categories} products={products} loading={loading} />} />
              <Route path="/nova-kolekcija" element={<NewCollection products={products} loading={loading} onAddToCart={addToCart} />} />
              <Route path="/editorijali" element={<Editorijali />} />
              <Route path="/saradnje" element={<Collaborations />} />
              <Route path="/saradnje/lepaisrecna" element={<LepaISrecna />} />
              <Route path="/saradnje/dd-modna-prica" element={<DDModnaPrica />} />
              <Route path="/saradnje/andjelka-stevic" element={<AndjelkaStevic />} />
              <Route path="/saradnje/dragana-kosjerina" element={<DraganaKosjerina />} />
              <Route path="/saradnje/ljubica-karadjordjevic" element={<LjubicaKaradjordjevic />} />
              <Route path="/saradnje/aleksandra-perisic" element={<AleksandraPerisic />} />
              <Route path="/saradnje/dragana-radakovic" element={<DraganaRadakovic />} />
              <Route path="/saradnje/dragana-micalovic" element={<DraganaMicalovic />} />
              <Route path="/saradnje/tamara-misirlic" element={<TamaraMisirlic />} />
              <Route path="/saradnje/dajana-svraka" element={<DajanaSvraka />} />
              <Route path="/saradnje/danijela-pantic" element={<DanijelaPantic />} />
              <Route path="/saradnje/belgrade-fashion-week" element={<BelgradeFashionWeek />} />
              <Route path="/izrada-po-meri" element={<CustomTailoring />} />
              <Route path="/o-svili" element={<SilkGuide />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/vlasnici" element={<OwnerPortal />} />
              <Route path="/baza" element={<OwnerPortal />} />
              <Route path="/portal-za-vlasnike" element={<OwnerPortal />} />
            </Routes>
          </Suspense>
        </main>
        <footer className={`pt-24 pb-12 border-t mt-auto transition-colors duration-500 ${
          theme === 'dark' ? 'bg-[#000000] border-zinc-900' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
              <div className="space-y-4">
                <span className={`text-2xl font-bold tracking-tighter uppercase transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>DD DESIGN</span>
                <p className={`text-xs uppercase tracking-[0.24em] font-serif ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
                  Umetnost utkana u svilu
                </p>
                <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} text-sm leading-relaxed`}>
                  Unikatni odevni komadi i bezvremenski modni dizajn Danijele Gojković. Prirodna taft, šantung i grež svila kreirani za vaš autentičan stil.
                </p>
                <div className="flex space-x-4">
                  <a href="https://www.instagram.com/dddesign.rs" target="_blank" rel="noopener noreferrer" className={`${theme === 'dark' ? 'text-zinc-500 hover:text-white' : 'text-gray-400 hover:text-black'} transition-colors`}>
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="https://www.facebook.com/dddesign.rs/" target="_blank" rel="noopener noreferrer" className={`${theme === 'dark' ? 'text-zinc-500 hover:text-white' : 'text-gray-400 hover:text-black'} transition-colors`}>
                    <Facebook className="w-5 h-5" />
                  </a>
                </div>
              </div>
              
              <div>
                <h4 className={`font-bold text-sm uppercase tracking-widest mb-8 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>Proizvodi</h4>
                <ul className={`space-y-4 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  <li><Link to="/shop" className="hover:text-current transition-colors">Svi proizvodi</Link></li>
                  <li><Link to="/nova-kolekcija" className="hover:text-current transition-colors">Nova kolekcija</Link></li>
                  <li><Link to="/editorijali" className="hover:text-current transition-colors">Editorijali</Link></li>
                  <li><Link to="/saradnje" className="hover:text-current transition-colors">Press</Link></li>
                  <li><Link to="/snizenja" className="hover:text-current transition-colors">Sniženja</Link></li>
                  <li><Link to="/kategorije" className="hover:text-current transition-colors">Kategorije</Link></li>
                </ul>
              </div>

              <div>
                <h4 className={`font-bold text-sm uppercase tracking-widest mb-8 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>Informacije</h4>
                <ul className={`space-y-4 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  <li><Link to="/editorijali?prica=taft" className="hover:text-current transition-colors font-medium">O svili i materijalima</Link></li>
                  <li><Link to="/saradnje/dd-modna-prica" className="hover:text-current transition-colors">O nama</Link></li>
                  <li><Link to="/kontakt" className="hover:text-current transition-colors">Kontakt</Link></li>
                  <li><Link to="/reklamacije" className="hover:text-current transition-colors">Reklamacije i prigovori</Link></li>
                  <li><Link to="/politika-privatnosti" className="hover:text-current transition-colors">Politika privatnosti</Link></li>
                  <li><Link to="/uslovi-koriscenja" className="hover:text-current transition-colors">Uslovi korišćenja</Link></li>
                  <li>
                    <Link to="/vlasnici" className="hover:text-current transition-colors inline-flex items-center gap-1.5 opacity-85 hover:opacity-100 font-medium">
                      <Database className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Stranica za vlasnike</span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className={`font-bold text-sm uppercase tracking-widest mb-8 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>Newsletter</h4>
                <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} text-sm mb-6`}>Pretplatite se za novosti i posebne ponude.</p>
                <form onSubmit={handleNewsletterSubmit} className="flex space-x-2">
                  <input 
                    type="email" 
                    placeholder="E-mail adresa" 
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    disabled={newsletterStatus === 'loading'}
                    required
                    className={`${
                      theme === 'dark' 
                        ? 'bg-[#1a1a1a] border-zinc-800 text-white focus:border-white' 
                        : 'bg-white border-gray-200 text-black focus:border-black'
                    } border px-4 py-3 rounded-xl text-sm w-full focus:outline-none transition-colors disabled:opacity-50`}
                  />
                  <button 
                    type="submit"
                    disabled={newsletterStatus === 'loading'}
                    className={`${
                      theme === 'dark' ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-gray-800'
                    } px-6 py-3 rounded-xl transition-all font-bold text-sm min-w-[70px] flex items-center justify-center disabled:opacity-50`}
                  >
                    {newsletterStatus === 'loading' ? '...' : 'OK'}
                  </button>
                </form>
                {newsletterMessage && (
                  <p className={`mt-3 text-xs font-medium transition-colors duration-300 ${
                    newsletterStatus === 'success' 
                      ? 'text-emerald-500' 
                      : newsletterStatus === 'error' 
                        ? 'text-rose-500' 
                        : 'text-zinc-400'
                  }`}>
                    {newsletterMessage}
                  </p>
                )}
              </div>
            </div>
            
            <div className={`pt-12 border-t space-y-8 ${
              theme === 'dark' ? 'border-zinc-900 text-zinc-500' : 'border-gray-200 text-gray-400'
            }`}>
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                {/* Bank Partner & Explanation */}
                <div className="text-center md:text-left space-y-2">
                  <p className={`font-semibold text-xs tracking-wider uppercase ${
                    theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                  }`}>
                    Kartično plaćanje omogućila Raiffeisen Banka
                  </p>
                  <p className="max-w-md text-xs leading-relaxed">
                    Sva plaćanja platnim karticama se vrše preko sigurnog sistema Raiffeisen Banke, uz punu primenu 3D Secure bezbednosnih standarda.
                  </p>
                </div>
                
                {/* Bank Logo */}
                <div className="flex items-center">
                  <a 
                    href="https://www.raiffeisenbank.rs" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="opacity-90 hover:opacity-100 transition-opacity"
                  >
                    <img 
                      src={theme === 'dark' 
                        ? "https://64.media.tumblr.com/c1584ae68b2f48317cbd88238bd874ad/be374ee1549e32c7-66/s2048x3072/afb06bfe59086f121fd16817657251752c802f5f.pnj" 
                        : "https://64.media.tumblr.com/3630fb26e86214e277bfa6c46dd176e7/be374ee1549e32c7-96/s2048x3072/94b3386d70a1b82f1f8bc8f64a4e4ab540cbc73d.pnj"
                      } 
                      alt="Raiffeisen Banka" 
                      className="h-10 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </a>
                </div>
              </div>

              {/* Logos row containing Accepted Cards and 3D Secure Protection, properly separated */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-4 border-t border-zinc-900/5 dark:border-zinc-900/40">
                {/* Section A: Accepted Cards */}
                <div className="flex flex-col items-center md:items-start gap-2">
                  <span className="text-[10px] tracking-widest uppercase font-bold text-zinc-400 dark:text-zinc-500">
                    Prihvatamo platne kartice:
                  </span>
                  <div className="flex items-center gap-4">
                    <img 
                      src={theme === 'dark'
                        ? "https://64.media.tumblr.com/50b921f4fb3be41ec9b3fca5c71063dd/be374ee1549e32c7-fe/s400x600/bfa46d7af96b5e56171240f4c72e17c2afc5bf2e.pnj"
                        : "https://64.media.tumblr.com/6f9301afac67cf4d471a4a64f7bf213d/be374ee1549e32c7-3f/s400x600/4428685ad1cb542fd18244721435056416cbeca8.pnj"
                      } 
                      alt="Visa, MasterCard, DinaCard" 
                      className="h-8 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Section B: 3D Secure Programs (Visa Secure and MasterCard Identity Check) */}
                <div className="flex flex-col items-center md:items-end gap-2">
                  <span className="text-[10px] tracking-widest uppercase font-bold text-zinc-400 dark:text-zinc-500">
                    Bezbedna kupovina (3D Secure Programi):
                  </span>
                  <div className="flex items-center gap-6">
                    <a 
                      href="https://rs.visa.com/run-your-business/small-business-tools/payment-technology/visa-secure.html"
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition-opacity"
                    >
                      <img 
                        src="https://64.media.tumblr.com/f7790a9a5b8145f326c457f03eb2fc23/be374ee1549e32c7-cd/s250x400/2d1802a688b5228d5a91594dc2175fae2aa99e2d.pnj" 
                        alt="Visa Secure" 
                        className="h-8 object-contain"
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
                        className="h-8 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </a>
                  </div>
                </div>
              </div>

              {/* Copyright Row */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs pt-4 border-t border-zinc-900/5 dark:border-zinc-900/40">
                <p>© 2026 DD DESIGN. Sva prava pridržana.</p>
              </div>
            </div>
          </div>
        </footer>

        <CartDrawer 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
        />
        <CookieConsent />
        <NewsletterPopup />
      </div>
    </>
  );
}
