import { motion } from 'motion/react';
import { Shield, Lock, Eye, Database, Cookie, Mail } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function PrivacyPolicy() {
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
          }`}>Politika privatnosti</h1>
          <p className={`text-lg max-w-2xl mx-auto leading-relaxed ${
            theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
          }`}>
            Politika privatnosti služi da vas informiše o tome koje podatke prikupljamo, kako ih koristimo i delimo, te kako možete kontrolisati svoje podatke prilikom korišćenja našeg web sajta i elektronske prodavnice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
          <div className={`p-8 rounded-3xl space-y-4 border transition-all ${
            theme === 'dark' 
              ? 'bg-[#111] border-zinc-900 hover:border-zinc-700' 
              : 'bg-gray-50 border-transparent hover:border-gray-200'
          }`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
            }`}>
              <Database className="w-6 h-6" />
            </div>
            <h2 className={`text-xl font-bold uppercase tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>Prikupljanje podataka</h2>
            <p className={`text-sm leading-relaxed ${
              theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
            }`}>
              Prikupljamo lične podatke (ime, adresa, e-mail, telefon) koje nam dobrovoljno pružate prilikom registracije ili kupovine.
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
              <Lock className="w-6 h-6" />
            </div>
            <h2 className={`text-xl font-bold uppercase tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>Sigurnosne mere</h2>
            <p className={`text-sm leading-relaxed ${
              theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
            }`}>
              Koristimo industrijski standardne sigurnosne mere za zaštitu vaših ličnih podataka od neovlašćenog pristupa.
            </p>
          </div>
        </div>

        <div className={`prose prose-sm leading-relaxed max-w-none space-y-12 ${
          theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
        }`}>
          <section className="space-y-6">
            <div className={`flex items-center space-x-3 border-b pb-4 ${
              theme === 'dark' ? 'text-white border-zinc-900' : 'text-black border-gray-100'
            }`}>
              <Eye className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`} />
              <h3 className="text-lg font-bold uppercase tracking-tight m-0">Upotreba i deljenje</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h4 className={`font-bold uppercase tracking-widest text-[11px] ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>Upotreba podataka</h4>
                <p className="m-0">
                  Prikupljene podatke koristimo isključivo za obradu vaših porudžbina, pružanje podrške korisnicima, slanje obaveštenja o promocijama i novostima, kao i za poboljšanje naših usluga.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className={`font-bold uppercase tracking-widest text-[11px] ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>Deljenje podataka</h4>
                <p className="m-0">
                  Vaše podatke nećemo deliti, prodavati ili iznajmljivati trećim licima, osim u slučajevima kada je to neophodno radi izvršenja usluga (npr. kurirske službe).
                </p>
              </div>
            </div>
          </section>

          <section className={`p-8 rounded-3xl shadow-sm space-y-6 border ${
            theme === 'dark' ? 'bg-[#111] border-zinc-900' : 'bg-white border-gray-100'
          }`}>
            <div className={`flex items-center space-x-3 ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>
              <Shield className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`} />
              <h3 className="text-lg font-bold uppercase tracking-tight m-0">Vaša prava</h3>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none p-0 m-0">
              {[
                'Pristup ličnim podacima',
                'Ispravka netačnih podataka',
                'Brisanje podataka (zaborav)',
                'Pravo na prenosivost podataka',
                'Povlačenje marketinškog pristanka',
                'Pravo na prigovor'
              ].map((pravon, i) => (
                <li key={i} className={`flex items-center space-x-2 text-sm ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    theme === 'dark' ? 'bg-white' : 'bg-black'
                  }`} />
                  <span>{pravon}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className={`flex items-center space-x-3 ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                <Cookie className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`} />
                <h3 className="text-lg font-bold uppercase tracking-tight m-0">Kolačići</h3>
              </div>
              <p className="text-sm">
                Naš web sajt koristi kolačiće radi poboljšanja funkcionalnosti i analize korišćenja. Vi možete kontrolisati ili izbrisati kolačiće putem podešavanja svog internet pretraživača.
              </p>
            </div>
            <div className="space-y-4">
              <div className={`flex items-center space-x-3 ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                <Mail className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`} />
                <h3 className="text-lg font-bold uppercase tracking-tight m-0">Kontakt</h3>
              </div>
              <p className="text-sm">
                Za sve dodatne informacije ili pitanja u vezi sa našom Politikom privatnosti, molimo vas da nas kontaktirate putem e-mail adrese <strong>office@dddesign.rs</strong>
              </p>
            </div>
          </section>

          <div className={`p-8 rounded-3xl text-center ${
            theme === 'dark' ? 'bg-zinc-900/50' : 'bg-gray-100'
          }`}>
            <p className={`m-0 italic text-sm ${
              theme === 'dark' ? 'text-zinc-600' : 'text-gray-500'
            }`}>
              Hvala vam što koristite naše usluge i što nam ukazujete poverenje. Politika privatnosti može biti ažurirana povremeno i sve izmene će biti objavljene na ovoj stranici.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
