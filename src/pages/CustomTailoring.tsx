import { motion } from 'motion/react';
import { Scissors, Ruler, Sparkles, CheckCircle2, AlertCircle, Phone, Mail, Instagram, ArrowRight, Clock, Heart } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

export default function CustomTailoring() {
  const { theme } = useTheme();

  return (
    <div className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto min-h-screen transition-colors duration-500">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-16"
      >
        {/* Editorial Header */}
        <div className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-[0.25em] uppercase font-mono border transition-colors bg-amber-500/10 text-amber-500 border-amber-500/20">
            <Scissors className="w-3.5 h-3.5" />
            <span>DD DESIGN ATELIER • BESPOKE</span>
          </div>

          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-light tracking-tight uppercase transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>
            Izrada po meri
          </h1>

          <p className={`text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-light transition-colors ${
            theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
          }`}>
            Pažljivo prilagođavanje svakog modela vašoj figuri, posebnim željama i svečanoj prilici, uz očuvanje prepoznatljive estetike i vrhunske izrade našeg brenda.
          </p>
        </div>

        {/* Main Philosophy Card */}
        <div className={`p-8 sm:p-12 rounded-3xl border relative overflow-hidden transition-all duration-500 ${
          theme === 'dark'
            ? 'bg-zinc-950/70 border-zinc-800 text-zinc-300 shadow-2xl shadow-black/50'
            : 'bg-white border-gray-150 text-gray-700 shadow-xl shadow-gray-100'
        }`}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                theme === 'dark' ? 'bg-zinc-900 text-amber-400 border border-zinc-800' : 'bg-zinc-100 text-amber-600 border border-gray-200'
              }`}>
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500 block">Personalizovan pristup</span>
                <h2 className={`text-2xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  Kreirano za vašu jedinstvenu figuru
                </h2>
              </div>
            </div>

            <p className="text-base sm:text-lg leading-relaxed font-light">
              Svi modeli iz <strong>DD DESIGN</strong> kolekcije mogu se izraditi prema individualnim merama klijenta i, po dogovoru, prilagoditi specifičnostima određene prilike. Naš cilj je da svaki model bude pažljivo prilagođen vašoj figuri, željama i potrebama, uz zadržavanje prepoznatljivog dizajna i estetike DD DESIGN brenda.
            </p>

            <div className={`p-5 rounded-2xl border flex items-start gap-3.5 ${
              theme === 'dark' ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-gray-50 border-gray-200/80'
            }`}>
              <Ruler className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed font-medium">
                Prilikom poručivanja modela, sve mere, izmene i posebni zahtevi definišu se unapred i potvrđuju sa klijentom.
              </p>
            </div>
          </div>
        </div>

        {/* 4-Step Process Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500 block">Kako funkcioniše</span>
            <h3 className={`text-2xl font-bold tracking-tight uppercase ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
              Proces izrade po meri
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Izbor modela',
                desc: 'Odaberite željeni komad iz naših kolekcija ili konsultujte naš atelje za specifične želje materijala i boja.',
                icon: Heart
              },
              {
                step: '02',
                title: 'Definisanje mera',
                desc: 'Unapred definišemo vaše tačne mere (obim grudi, struka, kukova, željena dužina) i sve detalje kroja.',
                icon: Ruler
              },
              {
                step: '03',
                title: 'Ručna izrada',
                desc: 'U našem ateljeu model se pažljivo kroji i šije od najkvalitetnijih prirodnih svila i luksuznih tkanina.',
                icon: Scissors
              },
              {
                step: '04',
                title: 'Isporuka na adresu',
                desc: 'Finalni komad stiže u ekskluzivnom pakovanju, spreman za vašu posebnu priliku.',
                icon: Clock
              }
            ].map((item, idx) => (
              <div 
                key={idx}
                className={`p-6 rounded-2xl border transition-all ${
                  theme === 'dark'
                    ? 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-700'
                    : 'bg-white border-gray-150 hover:border-gray-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-mono font-black text-amber-500/80">{item.step}</span>
                  <item.icon className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`} />
                </div>
                <h4 className={`text-base font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  {item.title}
                </h4>
                <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Important Terms Section */}
        <div className={`p-8 sm:p-10 rounded-3xl border space-y-6 ${
          theme === 'dark'
            ? 'bg-zinc-900/40 border-zinc-800/80'
            : 'bg-zinc-50/70 border-zinc-200/80'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block">Pravilnik i uslovi</span>
              <h3 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Važne informacije o poručenim modelima
              </h3>
            </div>
          </div>

          <div className={`space-y-4 text-sm leading-relaxed ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
            <p className="p-4 rounded-2xl border bg-amber-500/5 border-amber-500/15 font-medium">
              Modeli izrađeni prema individualnim merama, kao i modeli izrađeni po posebnom zahtevu klijenta, predstavljaju personalizovane proizvode. Za takve proizvode pravo na odustanak i povraćaj novca može biti ograničeno u skladu sa važećim Zakonom o zaštiti potrošača.
            </p>

            <p>
              <strong>Zato je važno da se pre izrade precizno definišu sve željene mere, izmene i detalji modela.</strong> Naš tim vam stoji na raspolaganju za sve savete i smernice kako bismo zajedno osigurali savršeno pristajanje.
            </p>

            <p>
              Korekcije ili dodatne izmene koje nisu bile deo prvobitnog dogovora i potvrđenih zahteva klijenta mogu biti dodatno naplaćene, u skladu sa obimom i zahtevnošću intervencije. O eventualnim dodatnim troškovima klijent će biti obavešten pre izvršenja izmene.
            </p>

            <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
              theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-gray-200'
            }`}>
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="text-xs font-semibold">
                U DD DESIGN-u posebnu pažnju posvećujemo svakom detalju kako bismo obezbedili da finalni model odgovara dogovorenim merama, zahtevima i očekivanjima klijenta.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Contact Box */}
        <div className={`p-8 sm:p-12 rounded-3xl border text-center space-y-6 relative overflow-hidden ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-zinc-900 to-black border-zinc-800'
            : 'bg-gradient-to-b from-gray-50 to-white border-gray-200 shadow-lg'
        }`}>
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-500">Stupite u kontakt</span>
            <h3 className={`text-2xl sm:text-3xl font-light tracking-tight uppercase ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
              Zakažite konsultaciju za izradu po meri
            </h3>
            <p className={`text-sm max-w-lg mx-auto ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              Pošaljite nam upit za željeni model ili porazgovarajte direktno sa našim timom.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="tel:+381641605032"
              className={`px-6 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md ${
                theme === 'dark' ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>+381 64 1605032</span>
            </a>

            <a
              href="mailto:office@dddesign.rs?subject=Upit%20za%20izradu%20po%20meri"
              className={`px-6 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 border transition-all ${
                theme === 'dark' ? 'border-zinc-800 hover:bg-zinc-900 text-white' : 'border-gray-200 hover:bg-gray-100 text-black'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>office@dddesign.rs</span>
            </a>

            <a
              href="https://www.instagram.com/dddesign.rs"
              target="_blank"
              rel="noopener noreferrer"
              className={`px-6 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 border transition-all ${
                theme === 'dark' ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-300' : 'border-gray-200 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Instagram className="w-4 h-4" />
              <span>@dddesign.rs</span>
            </a>
          </div>

          <div className="pt-4 flex justify-center">
            <Link
              to="/shop"
              className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b pb-1 transition-colors ${
                theme === 'dark' ? 'text-zinc-400 hover:text-white border-zinc-800 hover:border-white' : 'text-gray-500 hover:text-black border-gray-300 hover:border-black'
              }`}
            >
              <span>Pogledajte sve modele u kolekciji</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
