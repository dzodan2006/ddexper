import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Feather, ShieldCheck, Sun, Check, ArrowRight, Droplets, Wind, HeartHandshake } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

type SilkTab = 'taft' | 'santung' | 'grez';

export default function SilkGuide() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<SilkTab>('taft');

  return (
    <div className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-screen transition-colors duration-500">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-16"
      >
        {/* Editorial Header */}
        <div className="text-center space-y-5">
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-light tracking-tight uppercase transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>
            O svili
          </h1>

          <p className={`text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-light transition-colors ${
            theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
          }`}>
            U DD DESIGN kolekcijama pažljivo biramo prirodne materijale koji spajaju eleganciju, kvalitet i dugotrajnost. Upoznajte tri izuzetna oblika svile: <strong>Taft</strong>, <strong>Šantung</strong> i <strong>Grež svilu</strong>.
          </p>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex justify-center">
          <div className={`p-1.5 rounded-2xl border flex flex-wrap justify-center gap-1.5 max-w-2xl w-full ${
            theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-gray-100 border-gray-200'
          }`}>
            {[
              { id: 'taft', label: 'Taft svila', subtitle: 'Luksuz koji se oseća' },
              { id: 'santung', label: 'Šantung svila', subtitle: 'Prirodna elegancija' },
              { id: 'grez', label: 'Grež svila', subtitle: 'Autentična lepota' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SilkTab)}
                className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-left transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? theme === 'dark'
                      ? 'bg-zinc-800 text-white shadow-md'
                      : 'bg-white text-black shadow-md'
                    : theme === 'dark'
                      ? 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                      : 'text-gray-500 hover:text-black hover:bg-gray-200/50'
                }`}
              >
                <span className="text-xs font-bold block uppercase tracking-wider">{tab.label}</span>
                <span className="text-[10px] font-medium opacity-70 block">{tab.subtitle}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Content Panel */}
        <AnimatePresence mode="wait">
          {activeTab === 'taft' && (
            <motion.div
              key="taft"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* Hero overview */}
              <div className={`p-8 sm:p-12 rounded-3xl border relative overflow-hidden transition-all ${
                theme === 'dark' ? 'bg-zinc-950/70 border-zinc-800 text-zinc-300' : 'bg-white border-gray-200 text-gray-700 shadow-xl'
              }`}>
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500 block">Kolekcija materijala</span>
                      <h2 className={`text-3xl font-light tracking-tight uppercase ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        Taft svila – luksuz koji se oseća
                      </h2>
                    </div>
                  </div>

                  <p className="text-lg leading-relaxed font-light">
                    U DD DESIGN kolekcijama pažljivo biramo materijale koji spajaju eleganciju, kvalitet i dugotrajnost. Taft svila je jedan od najcenjenijih luksuznih materijala, prepoznatljiv po svojoj sofisticiranoj teksturi, blagom sjaju i sposobnosti da zadrži formu, dajući svakom modelu prefinjen i upečatljiv izgled.
                  </p>

                  <p className="text-base leading-relaxed">
                    Njena jedinstvena struktura omogućava kreiranje savremenih silueta, arhitektonskih linija i ženstvenih formi koje ostaju postojane tokom nošenja. Upravo zato taft svila predstavlja savršen izbor za ekskluzivne modne komade.
                  </p>
                </div>
              </div>

              {/* Natural Properties Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-8 rounded-3xl border space-y-4 ${
                  theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <Droplets className="w-5 h-5 text-amber-500" />
                    <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                      Prirodna svojstva i higijena
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed">
                    Prirodna svila, od koje se izrađuje visokokvalitetni taft, poseduje određena prirodna svojstva koja doprinose udobnosti pri nošenju. Zahvaljujući proteinskoj strukturi vlakana i dobroj sposobnosti regulacije vlage, svilena tkanina stvara manje povoljne uslove za razvoj određenih mikroorganizama u poređenju sa mnogim sintetičkim materijalima. Zbog toga se često opisuje kao materijal sa prirodnim higijenskim karakteristikama.
                  </p>
                </div>

                <div className={`p-8 rounded-3xl border space-y-4 ${
                  theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <Wind className="w-5 h-5 text-amber-500" />
                    <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                      Mikroklima i osetljiva koža
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed">
                    Pored toga, svila je izuzetno prijatna za kožu, prozračna i pomaže u održavanju optimalne mikroklime tela. Ne privlači prašinu u istoj meri kao pojedini sintetički materijali, što je čini pogodnim izborom za osobe sa osetljivom kožom.
                  </p>
                </div>
              </div>

              {/* Care & Brand Signature */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-8 rounded-3xl border space-y-3 ${
                  theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'
                }`}>
                  <div className="flex items-center gap-2 text-amber-500 font-mono text-xs uppercase tracking-widest font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Održavanje</span>
                  </div>
                  <h4 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    Preporuke za negu taft svile
                  </h4>
                  <p className="text-sm leading-relaxed">
                    Kako bi modeli od taft svile zadržali svoju lepotu i kvalitet, preporučujemo <strong>hemijsko čišćenje</strong>. Materijal treba čuvati na vešalici, dalje od direktnog sunčevog zračenja, a peglanje obavljati na niskoj temperaturi sa unutrašnje strane tkanine.
                  </p>
                </div>

                <div className={`p-8 rounded-3xl border space-y-3 ${
                  theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'
                }`}>
                  <div className="flex items-center gap-2 text-amber-500 font-mono text-xs uppercase tracking-widest font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>DD DESIGN potpis</span>
                  </div>
                  <h4 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    Spoj savremenog i vanvremenskog
                  </h4>
                  <p className="text-sm leading-relaxed">
                    Svaki DD DESIGN model od taft svile nastaje kao spoj savremenog dizajna, vrhunske izrade i pažljivo odabranih materijala. Rezultat su komadi koji prate trendove, ali ostaju vanvremenski – kreirani za žene koje cene kvalitet, autentičnost i sofisticiranu eleganciju.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'santung' && (
            <motion.div
              key="santung"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* Hero overview */}
              <div className={`p-8 sm:p-12 rounded-3xl border relative overflow-hidden transition-all ${
                theme === 'dark' ? 'bg-zinc-950/70 border-zinc-800 text-zinc-300' : 'bg-white border-gray-200 text-gray-700 shadow-xl'
              }`}>
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Feather className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500 block">Kolekcija materijala</span>
                      <h2 className={`text-3xl font-light tracking-tight uppercase ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        Šantung svila – prirodna elegancija sa karakterom
                      </h2>
                    </div>
                  </div>

                  <p className="text-lg leading-relaxed font-light">
                    Šantung svila predstavlja jednu od najcenjenijih vrsta prirodne svile, prepoznatljivu po svojoj bogatoj teksturi i suptilnim nepravilnostima u tkanju koje joj daju autentičan i luksuzan izgled. Upravo te prirodne niti različite debljine čine svaki metar šantung svile jedinstvenim.
                  </p>

                  <p className="text-base leading-relaxed">
                    U DD DESIGN kolekcijama šantung svila zauzima posebno mesto zahvaljujući svojoj sposobnosti da spoji sofisticiranost, udobnost i modernu estetiku. Njena blago matirana površina i prirodan sjaj stvaraju prefinjen efekat koji nikada ne izlazi iz mode.
                  </p>
                </div>
              </div>

              {/* Characteristics List */}
              <div className={`p-8 sm:p-10 rounded-3xl border space-y-6 ${
                theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`text-2xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  Karakteristike šantung svile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    'Prirodna tekstura sa karakterističnim nepravilnostima u tkanju.',
                    'Lagana, a istovremeno dovoljno čvrsta da lepo prati formu tela.',
                    'Prozračna i prijatna za nošenje tokom različitih godišnjih doba.',
                    'Prirodan, nenametljiv sjaj koji naglašava luksuz materijala.',
                    'Odličan izbor za elegantne haljine, odela, bluze i ekskluzivne modne komade.'
                  ].map((item, idx) => (
                    <div 
                      key={idx}
                      className={`p-4 rounded-2xl border flex items-start gap-3 ${
                        theme === 'dark' ? 'bg-zinc-950/80 border-zinc-800/80' : 'bg-white border-gray-200'
                      }`}
                    >
                      <Check className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                <p className="text-sm leading-relaxed pt-2">
                  Zahvaljujući prirodnim svilenim vlaknima, šantung svila omogućava koži da diše i pruža izuzetnu udobnost tokom nošenja. Njena struktura doprinosi dobroj regulaciji vlage i prijatnom osećaju na koži, zbog čega je omiljena među ljubiteljima prirodnih materijala.
                </p>
              </div>

              {/* Care & Signature */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-8 rounded-3xl border space-y-3 ${
                  theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'
                }`}>
                  <div className="flex items-center gap-2 text-amber-500 font-mono text-xs uppercase tracking-widest font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Održavanje</span>
                  </div>
                  <h4 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    Preporuke za negu šantung svile
                  </h4>
                  <p className="text-sm leading-relaxed">
                    Kako bi šantung svila sačuvala svoju lepotu i kvalitet, preporučuje se <strong>profesionalno hemijsko čišćenje</strong>. Materijal treba čuvati zaštićen od direktne sunčeve svetlosti, a peglati sa unutrašnje strane na niskoj temperaturi.
                  </p>
                </div>

                <div className={`p-8 rounded-3xl border space-y-3 ${
                  theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'
                }`}>
                  <div className="flex items-center gap-2 text-amber-500 font-mono text-xs uppercase tracking-widest font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>DD DESIGN potpis</span>
                  </div>
                  <h4 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    Prirodna lepota i bezvremenski dizajn
                  </h4>
                  <p className="text-sm leading-relaxed">
                    Šantung svila savršeno oslikava filozofiju DD DESIGN brenda – spoj prirodne lepote, vrhunskog kvaliteta i bezvremenske elegancije. Njena autentična tekstura i luksuzan izgled omogućavaju kreiranje modela koji istovremeno deluju moderno, sofisticirano i jedinstveno, ostavljajući snažan utisak u svakoj prilici.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'grez' && (
            <motion.div
              key="grez"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* Hero overview */}
              <div className={`p-8 sm:p-12 rounded-3xl border relative overflow-hidden transition-all ${
                theme === 'dark' ? 'bg-zinc-950/70 border-zinc-800 text-zinc-300' : 'bg-white border-gray-200 text-gray-700 shadow-xl'
              }`}>
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Sun className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500 block">Kolekcija materijala</span>
                      <h2 className={`text-3xl font-light tracking-tight uppercase ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        Grež svila – autentična lepota prirodne svile
                      </h2>
                    </div>
                  </div>

                  <p className="text-lg leading-relaxed font-light">
                    Grež svila predstavlja jedan od najprirodnijih i najautentičnijih oblika svile. Karakteriše je blago hrapava tekstura, prirodna punoća i nenametljiv luksuz koji je čini izuzetno cenjenom u savremenoj modi. Za razliku od potpuno obrađene svile, grež svila zadržava deo svoje prirodne strukture, što joj daje poseban karakter i prepoznatljivu eleganciju.
                  </p>

                  <p className="text-base leading-relaxed">
                    U DD DESIGN kolekcijama grež svila je izbor za žene koje cene prirodne materijale, vrhunski kvalitet i sofisticiran stil bez suvišne raskoši. Njena jedinstvena tekstura donosi osećaj luksuza koji se ne nameće, već se prepoznaje u svakom detalju.
                  </p>
                </div>
              </div>

              {/* Characteristics List */}
              <div className={`p-8 sm:p-10 rounded-3xl border space-y-6 ${
                theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`text-2xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  Karakteristike grež svile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    'Prirodna, blago reljefna tekstura sa autentičnim izgledom.',
                    'Izuzetna prozračnost i udobnost tokom nošenja.',
                    'Prijatan osećaj na koži zahvaljujući prirodnim svilenim vlaknima.',
                    'Suptilan, elegantan sjaj koji naglašava kvalitet materijala.',
                    'Dobra sposobnost regulacije temperature, pružajući udobnost tokom različitih godišnjih doba.',
                    'Prirodna otpornost na zadržavanje neprijatnih mirisa u poređenju sa mnogim sintetičkim tkaninama.'
                  ].map((item, idx) => (
                    <div 
                      key={idx}
                      className={`p-4 rounded-2xl border flex items-start gap-3 ${
                        theme === 'dark' ? 'bg-zinc-950/80 border-zinc-800/80' : 'bg-white border-gray-200'
                      }`}
                    >
                      <Check className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                <p className="text-sm leading-relaxed pt-2">
                  Grež svila omogućava koži da diše i pruža osećaj lakoće, dok njena prirodna struktura doprinosi posebnoj estetici i ekskluzivnosti svakog modela.
                </p>
              </div>

              {/* Care & Signature */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-8 rounded-3xl border space-y-3 ${
                  theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'
                }`}>
                  <div className="flex items-center gap-2 text-amber-500 font-mono text-xs uppercase tracking-widest font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Održavanje</span>
                  </div>
                  <h4 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    Preporuke za negu grež svile
                  </h4>
                  <p className="text-sm leading-relaxed">
                    Kako bi se sačuvala lepota i kvalitet grež svile, preporučuje se <strong>profesionalno hemijsko čišćenje</strong>. Tkaninu treba čuvati zaštićenu od direktnog sunčevog zračenja, a peglati pažljivo, sa unutrašnje strane i na nižoj temperaturi.
                  </p>
                </div>

                <div className={`p-8 rounded-3xl border space-y-3 ${
                  theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'
                }`}>
                  <div className="flex items-center gap-2 text-amber-500 font-mono text-xs uppercase tracking-widest font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>DD DESIGN potpis</span>
                  </div>
                  <h4 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    Diskretan luksuz bez kompromisa
                  </h4>
                  <p className="text-sm leading-relaxed">
                    Grež svila savršeno predstavlja vrednosti DD DESIGN brenda – prirodnu eleganciju, kvalitet izrade i bezvremenski dizajn. Njena autentičnost i prefinjen izgled omogućavaju stvaranje modela koji odišu diskretnim luksuzom, namenjenih ženama koje biraju kvalitet bez kompromisa.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom CTA to Bespoke & Shop */}
        <div className={`p-8 sm:p-12 rounded-3xl border text-center space-y-6 ${
          theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-gray-200 shadow-md'
        }`}>
          <div className="max-w-xl mx-auto space-y-3">
            <h3 className={`text-2xl font-light uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
              Želite model izrađen od prirodne svile po vašim merama?
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              Svaki naš model možete naručiti u svili po izboru, prilagođen vašoj figuri i prilici.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/izrada-po-meri"
              className={`px-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-md ${
                theme === 'dark' ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'
              }`}
            >
              <span>Saznajte više o izradi po meri</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/shop"
              className={`px-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest border transition-all ${
                theme === 'dark' ? 'border-zinc-800 hover:bg-zinc-900 text-white' : 'border-gray-300 hover:bg-gray-100 text-black'
              }`}
            >
              <span>Pogledajte kolekciju</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
