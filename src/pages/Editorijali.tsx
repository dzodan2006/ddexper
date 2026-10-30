import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Sparkles, 
  ShoppingBag, 
  Scissors, 
  ShieldCheck, 
  Ruler, 
  Check, 
  Phone, 
  Mail, 
  Instagram, 
  ArrowRight,
  BookOpen,
  Feather,
  Sun,
  Droplets,
  Wind
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function Editorijali() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<'all' | 'taft' | 'santung' | 'grez' | 'po-meri'>('all');

  // Sync with search parameter if present (?prica=taft / santung / grez / po-meri)
  useEffect(() => {
    const pricaParam = searchParams.get('prica') || searchParams.get('tab');
    if (pricaParam && ['taft', 'santung', 'grez', 'po-meri'].includes(pricaParam)) {
      setActiveFilter(pricaParam as any);
      const element = document.getElementById(pricaParam);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [searchParams]);

  const handleFilterClick = (filter: 'all' | 'taft' | 'santung' | 'grez' | 'po-meri') => {
    setActiveFilter(filter);
    if (filter === 'all') {
      setSearchParams({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setSearchParams({ prica: filter });
      const element = document.getElementById(filter);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Structured Data (Schema.org) for search engines to index articles
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "DD DESIGN Editorijali — Vodič kroz prirodnu svilu i izradu po meri",
    "description": "Stručni modni vodič kroz luksuzne materijale: taft svila, šantung svila, grež svila i proces izrade modela po meri u ateljeu DD DESIGN.",
    "publisher": {
      "@type": "Organization",
      "name": "DD DESIGN",
      "url": "https://www.dddesign.rs"
    },
    "hasPart": [
      {
        "@type": "Article",
        "headline": "Taft svila – luksuz koji se oseća",
        "description": "Karakteristike taft svile, arhitektonske forme, prirodna higijenska svojstva i saveti za održavanje."
      },
      {
        "@type": "Article",
        "headline": "Šantung svila – prirodna elegancija sa karakterom",
        "description": "Autentične niti različite debljine, tekstura šantung svile, regulacija vlage i bezvremenski kroj."
      },
      {
        "@type": "Article",
        "headline": "Grež svila – autentična lepota prirodne svile",
        "description": "Prirodna punoća i blago reljefna tekstura grež svile, regulacija temperature i diskretan luksuz."
      },
      {
        "@type": "Article",
        "headline": "Izrada po meri – DD DESIGN Atelje",
        "description": "Personalizovana izrada modela prema individualnim merama, zakonski uslovi i smernice ateljea."
      }
    ]
  };

  return (
    <div className="min-h-screen py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto transition-colors duration-500">
      {/* Inject JSON-LD Schema for Search Engines */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }} 
      />

      {/* Main SEO Header */}
      <header className="text-center space-y-4 mb-16 border-b pb-12 border-zinc-500/10 dark:border-zinc-100/10">
        <h1 className={`text-4xl sm:text-5xl md:text-6xl font-light tracking-tight uppercase ${
          theme === 'dark' ? 'text-white' : 'text-zinc-900'
        }`}>
          Editorijali
        </h1>

        <p className={`text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-light ${
          theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
        }`}>
          Vodič kroz plemenite materijale našeg ateljea — svojstva <strong>taft</strong>, <strong>šantung</strong> i <strong>grež svile</strong>, pravilna nega tkanina i detaljan postupak <strong>izrade po meri</strong>.
        </p>

        {/* Quick Filter Navigation Bar */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
          {[
            { id: 'all', label: 'Sve teme' },
            { id: 'taft', label: '01. Taft svila' },
            { id: 'santung', label: '02. Šantung svila' },
            { id: 'grez', label: '03. Grež svila' },
            { id: 'po-meri', label: '04. Izrada po meri' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleFilterClick(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                activeFilter === tab.id
                  ? theme === 'dark'
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-black text-white border-black shadow-md'
                  : theme === 'dark'
                    ? 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:text-black hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Articles Container - Text-First, Clean, Highly Readable, Search-Optimized */}
      <main className="space-y-20">

        {/* ============================================================== */}
        {/* ARTICLE 1: TAFT SVILA */}
        {/* ============================================================== */}
        {(activeFilter === 'all' || activeFilter === 'taft') && (
          <article 
            id="taft" 
            className={`p-8 sm:p-12 rounded-3xl border transition-all scroll-mt-24 space-y-8 ${
              theme === 'dark' ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            <div className="space-y-3 border-b pb-6 border-zinc-500/10 dark:border-zinc-100/10">
              <div className="flex items-center gap-2 text-amber-500 font-mono text-[11px] font-bold tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Plemeniti materijali • Poglavlje 01</span>
              </div>
              <h2 className={`text-2xl sm:text-3xl md:text-4xl font-light tracking-tight uppercase ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                Taft svila – luksuz koji se oseća
              </h2>
              <p className="text-sm font-serif italic text-amber-500/90">
                Sofisticirana tekstura, blagi sjaj i postojane arhitektonske linije
              </p>
            </div>

            <div className={`space-y-4 text-base leading-relaxed font-light ${
              theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
            }`}>
              <p className="first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-amber-500 leading-relaxed">
                U DD DESIGN kolekcijama pažljivo biramo materijale koji spajaju eleganciju, kvalitet i dugotrajnost. Taft svila je jedan od najcenjenijih luksuznih materijala, prepoznatljiv po svojoj sofisticiranoj teksturi, blagom sjaju i sposobnosti da zadrži formu, dajući svakom modelu prefinjen i upečatljiv izgled.
              </p>

              <p>
                Njena jedinstvena struktura omogućava kreiranje savremenih silueta, arhitektonskih linija i ženstvenih formi koje ostaju postojane tokom nošenja. Upravo zato taft svila predstavlja savršen izbor za ekskluzivne modne komade.
              </p>

              <p>
                Prirodna svila, od koje se izrađuje visokokvalitetni taft, poseduje određena prirodna svojstva koja doprinose udobnosti pri nošenju. Zahvaljujući proteinskoj strukturi vlakana i dobroj sposobnosti regulacije vlage, svilena tkanina stvara manje povoljne uslove za razvoj određenih mikroorganizama u poređenju sa mnogim sintetičkim materijalima. Zbog toga se često opisuje kao materijal sa prirodnim higijenskim karakteristikama.
              </p>

              <p>
                Pored toga, svila je prijatna za kožu, prozračna i pomaže u održavanju optimalne mikroklime tela. Ne privlači prašinu u istoj meri kao pojedini sintetički materijali, što je čini pogodnim izborom za osobe sa osetljivom kožom.
              </p>
            </div>

            {/* Održavanje & Potpis Subsections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-500/10 dark:border-zinc-100/10">
              <section className={`p-6 rounded-2xl border space-y-2 ${
                theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800' : 'bg-gray-50 border-gray-150'
              }`}>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500">
                  <ShieldCheck className="w-4 h-4" />
                  <h3>Održavanje taft svile</h3>
                </div>
                <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  Kako bi modeli od taft svile zadržali svoju lepotu i kvalitet, preporučujemo <strong>hemijsko čišćenje</strong>. Materijal treba čuvati na vešalici, dalje od direktnog sunčevog zračenja, a peglanje obavljati na niskoj temperaturi sa unutrašnje strane tkanine.
                </p>
              </section>

              <section className={`p-6 rounded-2xl border space-y-2 ${
                theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800' : 'bg-gray-50 border-gray-150'
              }`}>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500">
                  <Sparkles className="w-4 h-4" />
                  <h3>DD DESIGN potpis</h3>
                </div>
                <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  Svaki DD DESIGN model od taft svile nastaje kao spoj savremenog dizajna, vrhunske izrade i pažljivo odabranih materijala. Rezultat su komadi koji prate trendove, ali ostaju vanvremenski – kreirani za žene koje cene kvalitet, autentičnost i sofisticiranu eleganciju.
                </p>
              </section>
            </div>

            <div className="pt-2">
              <Link
                to="/shop?search=taft"
                className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                  theme === 'dark' ? 'text-amber-400 hover:text-white' : 'text-amber-600 hover:text-black'
                }`}
              >
                <span>Pogledajte modele od taft svile u prodavnici</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </article>
        )}

        {/* ============================================================== */}
        {/* ARTICLE 2: ŠANTUNG SVILA */}
        {/* ============================================================== */}
        {(activeFilter === 'all' || activeFilter === 'santung') && (
          <article 
            id="santung" 
            className={`p-8 sm:p-12 rounded-3xl border transition-all scroll-mt-24 space-y-8 ${
              theme === 'dark' ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            <div className="space-y-3 border-b pb-6 border-zinc-500/10 dark:border-zinc-100/10">
              <div className="flex items-center gap-2 text-amber-500 font-mono text-[11px] font-bold tracking-widest uppercase">
                <Feather className="w-3.5 h-3.5" />
                <span>Plemeniti materijali • Poglavlje 02</span>
              </div>
              <h2 className={`text-2xl sm:text-3xl md:text-4xl font-light tracking-tight uppercase ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                Šantung svila – prirodna elegancija sa karakterom
              </h2>
              <p className="text-sm font-serif italic text-amber-500/90">
                Bogatstvo teksture i suptilne nepravilnosti u tkanju
              </p>
            </div>

            <div className={`space-y-4 text-base leading-relaxed font-light ${
              theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
            }`}>
              <p className="first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-amber-500 leading-relaxed">
                Šantung svila predstavlja jednu od najcenjenijih vrsta prirodne svile, prepoznatljivu po svojoj bogatoj teksturi i suptilnim nepravilnostima u tkanju koje joj daju autentičan i luksuzan izgled. Upravo te prirodne niti različite debljine čine svaki metar šantung svile jedinstvenim.
              </p>

              <p>
                U DD DESIGN kolekcijama šantung svila zauzima posebno mesto zahvaljujući svojoj sposobnosti da spoji sofisticiranost, udobnost i modernu estetiku. Njena blago matirana površina i prirodan sjaj stvaraju prefinjen efekat koji nikada ne izlazi iz mode.
              </p>
            </div>

            {/* Karakteristike šantung svile */}
            <div className={`p-6 sm:p-8 rounded-2xl border space-y-4 ${
              theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800' : 'bg-gray-50 border-gray-150'
            }`}>
              <h3 className={`text-base font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Karakteristike šantung svile:
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {[
                  'Prirodna tekstura sa karakterističnim nepravilnostima u tkanju.',
                  'Lagana, a istovremeno dovoljno čvrsta da lepo prati formu tela.',
                  'Prozračna i prijatna za nošenje tokom različitih godišnjih doba.',
                  'Prirodan, nenametljiv sjaj koji naglašava luksuz materijala.',
                  'Odličan izbor za elegantne haljine, odela, bluze i ekskluzivne modne komade.'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className={`text-xs sm:text-sm pt-2 leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                Zahvaljujući prirodnim svilenim vlaknima, šantung svila omogućava koži da diše i pruža izuzetnu udobnost tokom nošenja. Njena struktura doprinosi dobroj regulaciji vlage i prijatnom osećaju na koži, zbog čega je omiljena među ljubiteljima prirodnih materijala.
              </p>
            </div>

            {/* Održavanje & Potpis Subsections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-500/10 dark:border-zinc-100/10">
              <section className={`p-6 rounded-2xl border space-y-2 ${
                theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800' : 'bg-gray-50 border-gray-150'
              }`}>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500">
                  <ShieldCheck className="w-4 h-4" />
                  <h3>Održavanje šantung svile</h3>
                </div>
                <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  Kako bi šantung svila sačuvala svoju lepotu i kvalitet, preporučuje se <strong>profesionalno hemijsko čišćenje</strong>. Materijal treba čuvati zaštićen od direktne sunčeve svetlosti, a peglati sa unutrašnje strane na niskoj temperaturi.
                </p>
              </section>

              <section className={`p-6 rounded-2xl border space-y-2 ${
                theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800' : 'bg-gray-50 border-gray-150'
              }`}>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500">
                  <Sparkles className="w-4 h-4" />
                  <h3>DD DESIGN potpis</h3>
                </div>
                <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  Šantung svila savršeno oslikava filozofiju DD DESIGN brenda – spoj prirodne lepote, vrhunskog kvaliteta i bezvremenske elegancije. Njena autentična tekstura i luksuzan izgled omogućavaju kreiranje modela koji istovremeno deluju moderno, sofisticirano i jedinstveno, ostavljajući snažan utisak u svakoj prilici.
                </p>
              </section>
            </div>

            <div className="pt-2">
              <Link
                to="/shop?search=santung"
                className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                  theme === 'dark' ? 'text-amber-400 hover:text-white' : 'text-amber-600 hover:text-black'
                }`}
              >
                <span>Pogledajte modele od šantung svile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </article>
        )}

        {/* ============================================================== */}
        {/* ARTICLE 3: GREŽ SVILA */}
        {/* ============================================================== */}
        {(activeFilter === 'all' || activeFilter === 'grez') && (
          <article 
            id="grez" 
            className={`p-8 sm:p-12 rounded-3xl border transition-all scroll-mt-24 space-y-8 ${
              theme === 'dark' ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            <div className="space-y-3 border-b pb-6 border-zinc-500/10 dark:border-zinc-100/10">
              <div className="flex items-center gap-2 text-amber-500 font-mono text-[11px] font-bold tracking-widest uppercase">
                <Sun className="w-3.5 h-3.5" />
                <span>Plemeniti materijali • Poglavlje 03</span>
              </div>
              <h2 className={`text-2xl sm:text-3xl md:text-4xl font-light tracking-tight uppercase ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                Grež svila – autentična lepota prirodne svile
              </h2>
              <p className="text-sm font-serif italic text-amber-500/90">
                Prirodna punoća i diskretan luksuz bez suvišne raskoši
              </p>
            </div>

            <div className={`space-y-4 text-base leading-relaxed font-light ${
              theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
            }`}>
              <p className="first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-amber-500 leading-relaxed">
                Grež svila predstavlja jedan od najprirodnijih i najautentičnijih oblika svile. Karakteriše je blago hrapava tekstura, prirodna punoća i nenametljiv luksuz koji je čini izuzetno cenjenom u savremenoj modi. Za razliku od potpuno obrađene svile, grež svila zadržava deo svoje prirodne strukture, što joj daje poseban karakter i prepoznatljivu eleganciju.
              </p>

              <p>
                U DD DESIGN kolekcijama grež svila je izbor za žene koje cene prirodne materijale, vrhunski kvalitet i sofisticiran stil bez suvišne raskoši. Njena jedinstvena tekstura donosi osećaj luksuza koji se ne nameće, već se prepoznaje u svakom detalju.
              </p>
            </div>

            {/* Karakteristike grež svile */}
            <div className={`p-6 sm:p-8 rounded-2xl border space-y-4 ${
              theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800' : 'bg-gray-50 border-gray-150'
            }`}>
              <h3 className={`text-base font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Karakteristike grež svile:
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {[
                  'Prirodna, blago reljefna tekstura sa autentičnim izgledom.',
                  'Izuzetna prozračnost i udobnost tokom nošenja.',
                  'Prijatan osećaj na koži zahvaljujući prirodnim svilenim vlaknima.',
                  'Suptilan, elegantan sjaj koji naglašava kvalitet materijala.',
                  'Dobra sposobnost regulacije temperature, pružajući udobnost tokom različitih godišnjih doba.',
                  'Prirodna otpornost na zadržavanje neprijatnih mirisa u poređenju sa mnogim sintetičkim tkaninama.'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className={`text-xs sm:text-sm pt-2 leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                Grež svila omogućava koži da diše i pruža osećaj lakoće, dok njena prirodna struktura doprinosi posebnoj estetici i ekskluzivnosti svakog modela.
              </p>
            </div>

            {/* Održavanje & Potpis Subsections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-500/10 dark:border-zinc-100/10">
              <section className={`p-6 rounded-2xl border space-y-2 ${
                theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800' : 'bg-gray-50 border-gray-150'
              }`}>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500">
                  <ShieldCheck className="w-4 h-4" />
                  <h3>Održavanje grež svile</h3>
                </div>
                <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  Kako bi se sačuvala lepota i kvalitet grež svile, preporučuje se <strong>profesionalno hemijsko čišćenje</strong>. Tkaninu treba čuvati zaštićenu od direktnog sunčevog zračenja, a peglati pažljivo, sa unutrašnje strane i na nižoj temperaturi.
                </p>
              </section>

              <section className={`p-6 rounded-2xl border space-y-2 ${
                theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800' : 'bg-gray-50 border-gray-150'
              }`}>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500">
                  <Sparkles className="w-4 h-4" />
                  <h3>DD DESIGN potpis</h3>
                </div>
                <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  Grež svila savršeno predstavlja vrednosti DD DESIGN brenda – prirodnu eleganciju, kvalitet izrade i bezvremenski dizajn. Njena autentičnost i prefinjen izgled omogućavaju stvaranje modela koji odišu diskretnim luksuzom, namenjenih ženama koje biraju kvalitet bez kompromisa.
                </p>
              </section>
            </div>

            <div className="pt-2">
              <Link
                to="/shop?search=grez"
                className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                  theme === 'dark' ? 'text-amber-400 hover:text-white' : 'text-amber-600 hover:text-black'
                }`}
              >
                <span>Pogledajte modele od grež svile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </article>
        )}

        {/* ============================================================== */}
        {/* ARTICLE 4: IZRADA PO MERI (BESPOKE ATELIER) */}
        {/* ============================================================== */}
        {(activeFilter === 'all' || activeFilter === 'po-meri') && (
          <article 
            id="po-meri" 
            className={`p-8 sm:p-12 rounded-3xl border transition-all scroll-mt-24 space-y-8 ${
              theme === 'dark' ? 'bg-zinc-950/50 border-amber-500/20' : 'bg-white border-amber-200/70 shadow-sm'
            }`}
          >
            <div className="space-y-3 border-b pb-6 border-zinc-500/10 dark:border-zinc-100/10">
              <div className="flex items-center gap-2 text-amber-500 font-mono text-[11px] font-bold tracking-widest uppercase">
                <Scissors className="w-3.5 h-3.5" />
                <span>Atelje Usluge • Bespoke Krojenje</span>
              </div>
              <h2 className={`text-2xl sm:text-3xl md:text-4xl font-light tracking-tight uppercase ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                Izrada po meri
              </h2>
              <p className="text-sm font-serif italic text-amber-500/90">
                Svaki model pažljivo prilagođen vašoj figuri, željama i prilici
              </p>
            </div>

            <div className={`space-y-4 text-base leading-relaxed font-light ${
              theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
            }`}>
              <p className="first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-amber-500 leading-relaxed">
                Svi modeli iz <strong>DD DESIGN</strong> kolekcije mogu se izraditi prema individualnim merama klijenta i, po dogovoru, prilagoditi specifičnostima određene prilike. Naš cilj je da svaki model bude pažljivo prilagođen vašoj figuri, željama i potrebama, uz zadržavanje prepoznatljivog dizajna i estetike DD DESIGN brenda.
              </p>

              <div className={`p-5 rounded-2xl border flex items-start gap-3.5 ${
                theme === 'dark' ? 'bg-zinc-900/60 border-zinc-800' : 'bg-gray-50 border-gray-200'
              }`}>
                <Ruler className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">
                  Prilikom poručivanja modela, sve mere, izmene i posebni zahtevi definišu se unapred i potvrđuju sa klijentom.
                </p>
              </div>
            </div>

            {/* Važne informacije o poručenim modelima */}
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-4 ${
              theme === 'dark' ? 'bg-zinc-900/60 border-amber-500/30' : 'bg-amber-50/50 border-amber-300/60'
            }`}>
              <h3 className={`text-base font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Važne informacije o poručenim modelima:
              </h3>
              <div className="space-y-3 text-sm leading-relaxed">
                <p className="font-semibold text-amber-500">
                  Modeli izrađeni prema individualnim merama, kao i modeli izrađeni po posebnom zahtevu klijenta, predstavljaju personalizovane proizvode. Za takve proizvode pravo na odustanak i povraćaj novca može biti ograničeno u skladu sa važećim Zakonom o zaštiti potrošača.
                </p>
                <p>
                  <strong>Zato je važno da se pre izrade precizno definišu sve željene mere, izmene i detalji modela.</strong>
                </p>
                <p>
                  Korekcije ili dodatne izmene koje nisu bile deo prvobitnog dogovora i potvrđenih zahteva klijenta mogu biti dodatno naplaćene, u skladu sa obimom i zahtevnošću intervencije. O eventualnim dodatnim troškovima klijent će biti obavešten pre izvršenja izmene.
                </p>
                <p className={`pt-2 font-medium ${theme === 'dark' ? 'text-zinc-200' : 'text-black'}`}>
                  U DD DESIGN-u posebnu pažnju posvećujemo svakom detalju kako bismo obezbedili da finalni model odgovara dogovorenim merama, zahtevima i očekivanjima klijenta.
                </p>
              </div>
            </div>

            {/* Direktni kontakt za izradu po meri */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="tel:+381641605032"
                className={`inline-flex items-center gap-2 py-4 px-8 rounded-2xl text-xs uppercase tracking-[0.2em] font-bold transition-all shadow-md ${
                  theme === 'dark' ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'
                }`}
              >
                <Phone className="w-4 h-4" />
                <span>Pozovite atelje: +381 64 1605032</span>
              </a>

              <a
                href="mailto:office@dddesign.rs?subject=Upit%20za%20izradu%20po%20meri"
                className={`inline-flex items-center gap-2 py-4 px-6 rounded-2xl text-xs uppercase tracking-[0.2em] font-semibold border transition-all ${
                  theme === 'dark' ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-300' : 'border-gray-200 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>office@dddesign.rs</span>
              </a>

              <a
                href="https://www.instagram.com/dddesign.rs"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 py-4 px-6 rounded-2xl text-xs uppercase tracking-[0.2em] font-semibold border transition-all ${
                  theme === 'dark' ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-300' : 'border-gray-200 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Instagram className="w-4 h-4" />
                <span>@dddesign.rs</span>
              </a>
            </div>
          </article>
        )}

      </main>



      {/* Editorial Footer */}
      <footer className="pt-8 border-t border-zinc-500/10 dark:border-zinc-100/10 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase font-mono tracking-widest text-zinc-500 gap-4">
        <p>DD DESIGN DIGITAL MAGAZINE — ISSUE 01 / 2026</p>
        <Link to="/shop" className="hover:text-amber-500 transition-colors inline-flex items-center gap-1.5">
          <span>← Nazad na sve proizvode</span>
        </Link>
      </footer>
    </div>
  );
}
