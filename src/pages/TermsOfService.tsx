import { motion } from 'motion/react';
import { BookOpen, MapPin, Phone, Mail, Clock, CreditCard, Truck, ShieldCheck, HelpCircle, Scale } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function TermsOfService() {
  const { theme } = useTheme();
  return (
    <div className={`py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto min-h-screen transition-colors duration-500`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="text-center space-y-4">
          <span className={`text-[10px] font-bold uppercase tracking-[0.3em] block ${
            theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
          }`}>Pravne informacije</span>
          <h1 className={`text-4xl md:text-5xl font-bold tracking-tight uppercase ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>Uslovi korišćenja</h1>
          <p className={`text-lg max-w-2xl mx-auto leading-relaxed ${
            theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
          }`}>
            Korišćenje sajta podrazumeva vašu saglasnost sa ovim uslovima. Molimo vas da ih pažljivo pročitate pre kupovine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          <div className={`p-8 rounded-3xl space-y-4 border transition-all ${
            theme === 'dark' 
              ? 'bg-[#111] border-zinc-900 hover:border-zinc-700' 
              : 'bg-gray-50 border-transparent hover:border-gray-200'
          }`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
            }`}>
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className={`text-xl font-bold uppercase tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>Korišćenje sajta</h2>
            <p className={`text-sm leading-relaxed ${
              theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
            }`}>
              Korisnici su obavezni koristiti sajt u skladu sa zakonima i ovim uslovima, izbegavajući bilo kakvu zloupotrebu ili ometanje normalnog funkcionisanja.
            </p>
          </div>

          <div className={`p-8 rounded-3xl space-y-4 border transition-all ${
            theme === 'dark' 
              ? 'bg-[#111] border-zinc-900 hover:border-zinc-700' 
              : 'bg-gray-50 border-transparent hover:border-gray-200'
          }`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
            }`}>
              <CreditCard className="w-6 h-6" />
            </div>
            <h2 className={`text-xl font-bold uppercase tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>Plaćanje</h2>
            <p className={`text-sm leading-relaxed ${
              theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
            }`}>
              Podržavamo plaćanje pouzećem ili direktni prenos na tekući račun. Sve transakcije se obračunavaju u dinarima (RSD).
            </p>
          </div>
        </div>

        <div className={`prose prose-sm leading-relaxed max-w-none space-y-12 ${
          theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
        }`}>
          {/* Section: Delivery */}
          <section className={`p-8 rounded-3xl shadow-sm space-y-6 border ${
            theme === 'dark' ? 'bg-[#111] border-zinc-900' : 'bg-white border-gray-100'
          }`}>
            <div className={`flex items-center space-x-3 ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>
              <Truck className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`} />
              <h3 className="text-lg font-bold uppercase tracking-tight m-0">Kupovina i isporuka</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className={`font-bold uppercase tracking-widest text-[10px] ${
                  theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                }`}>Vreme isporuke</p>
                <p className={`m-0 font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>5-10 radnih dana</p>
              </div>
              <div className="space-y-2">
                <p className={`font-bold uppercase tracking-widest text-[10px] ${
                  theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                }`}>Troškovi dostave</p>
                <p className={`m-0 font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Besplatna preko 10.000 RSD. Inače 400 RSD.</p>
              </div>
            </div>
            <p className={`text-xs mt-4 leading-relaxed ${
              theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
            }`}>
              * Za međunarodne porudžbine mogu se javiti dodatni troškovi carine i poštarine koji padaju na teret kupca.
            </p>
          </section>

          {/* Section: Identity */}
          <section className="space-y-8">
            <div className={`flex items-center space-x-3 border-b pb-4 ${
              theme === 'dark' ? 'text-white border-zinc-900' : 'text-black border-gray-100'
            }`}>
              <ShieldCheck className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`} />
              <h3 className="text-lg font-bold uppercase tracking-tight m-0">Integritet i Sigurnost</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h4 className={`font-bold uppercase tracking-widest text-[11px] flex items-center gap-2 ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>
                  <div className={`w-1 h-1 rounded-full ${theme === 'dark' ? 'bg-white' : 'bg-black'}`} />
                  Privatnost i podaci
                </h4>
                <p className="text-sm">
                  Poverljive informacije o platnim karticama prenose se putem javne mreže u kriptovanoj formi. Niti jednog trenutka podaci o kartici nisu dostupni našem sistemu.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className={`font-bold uppercase tracking-widest text-[11px] flex items-center gap-2 ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>
                  <div className={`w-1 h-1 rounded-full ${theme === 'dark' ? 'bg-white' : 'bg-black'}`} />
                  Otkazivanje i izrada po meri
                </h4>
                <p className="text-sm">
                  Ukoliko narudžbina standardnih artikala nije poslata, otkazivanje je bez troškova. Imate pravo na odustajanje u roku od 14 dana od prijema robe. Modeli izrađeni prema individualnim merama ili po posebnom zahtevu klijenta predstavljaju personalizovane proizvode, gde pravo na odustanak može biti zakonski ograničeno.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Business Info */}
          <section className={`p-8 rounded-3xl space-y-8 ${
            theme === 'dark' ? 'bg-[#111]' : 'bg-gray-50'
          }`}>
            <div className={`flex items-center space-x-3 ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>
              <Scale className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`} />
              <h3 className="text-lg font-bold uppercase tracking-tight m-0">Informacije o preduzetniku</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 text-sm">
              <div className="flex items-start space-x-3">
                <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`} />
                <div>
                  <p className={`font-bold uppercase tracking-widest text-[10px] mb-1 ${
                    theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                  }`}>Lokacija</p>
                  <p className={`font-medium leading-relaxed ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    Atelje DD DESIGN, Vuka Karadžića 34, Mladenovac<br />
                    Sava Centar, Milentija Popovića 9, Beograd
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <p className={`font-bold uppercase tracking-widest text-[10px] mb-1 ${
                      theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                    }`}>Matični broj / PIB</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>66313425 / 112727875</p>
                  </div>
                  <div>
                    <p className={`font-bold uppercase tracking-widest text-[10px] mb-1 ${
                      theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                    }`}>Kontakt</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>+381 64 1605032 / office@dddesign.rs</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer className="text-center pt-8">
            <p className={`text-xs uppercase tracking-[0.2em] ${
              theme === 'dark' ? 'text-zinc-700' : 'text-gray-400'
            }`}>
              Svi sporovi podležu zakonima Republike Srbije. Nadležan je sud u Srbiji.
            </p>
          </footer>
        </div>
      </motion.div>
    </div>
  );
}
