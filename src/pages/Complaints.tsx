import { motion } from 'motion/react';
import { ShieldCheck, Scale, RefreshCw, XCircle, Info, Truck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Complaints() {
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
          }`}>Korisnička podrška</span>
          <h1 className={`text-4xl md:text-5xl font-bold tracking-tight uppercase ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>Reklamacije i prigovori</h1>
          <p className={`text-lg max-w-2xl mx-auto leading-relaxed ${
            theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
          }`}>
            Vaša satisfakcija s našim proizvodima i uslugama je od izuzetnog značaja za nas. Ako imate bilo kakve nedoumice, reklamacije ili prigovore, molimo vas da odmah stupite u kontakt kako bismo ih razmotrili i rešili.
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
              <RefreshCw className="w-6 h-6" />
            </div>
            <h2 className={`text-xl font-bold uppercase tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>Reklamacije</h2>
            <p className={`text-sm leading-relaxed ${
              theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
            }`}>
              Ukoliko primetite bilo kakve nedostatke, oštećenja ili druge probleme s kupljenim proizvodom, molimo vas da nas odmah obavestite. Reklamacije se mogu podneti u roku od 14 dana od datuma prijema proizvoda.
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
              <XCircle className="w-6 h-6" />
            </div>
            <h2 className={`text-xl font-bold uppercase tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>Otkazivanje porudžbine</h2>
            <p className={`text-sm leading-relaxed ${
              theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
            }`}>
              Ako želite otkazati porudžbinu, molimo Vas da nas kontaktirate što je prije moguće putem email-a na <strong>office@dddesign.rs</strong> ili telefonom na <strong>+381 64 1605032</strong>.
            </p>
          </div>
        </div>

        <div className={`prose prose-sm leading-relaxed max-w-none space-y-8 ${
          theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
        }`}>
          <section className={`p-8 rounded-3xl shadow-sm space-y-4 border ${
            theme === 'dark' ? 'bg-[#111] border-zinc-900' : 'bg-white border-gray-100'
          }`}>
            <div className={`flex items-center space-x-3 ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>
              <Truck className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`} />
              <h3 className="text-lg font-bold uppercase tracking-tight m-0">Postupak kod preuzimanja</h3>
            </div>
            <p className="m-0">
              Ukoliko ste robu kupili u online prodavnici, prilikom preuzimanja pošiljke molimo vas da u prisustvu kurira proverite svoj paket. Ukoliko na njemu ima vidljivih oštećenja (pocepani delovi i ugnječenje), paket ne bi trebalo da preuzmete. U ovom slučaju, molimo vas da nas pozovete telefonom na broj <strong>+381 64 1605032</strong> ili nam pišite na <strong>office@dddesign.rs</strong>. U najkraćem mogućem roku obavestićemo vas o daljem postupanju.
            </p>
            <p className={`m-0 font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
              Ukoliko ste primili pošiljku i nakon otvaranja kutije ustanovili da isporučena roba ne odgovara naručenoj ili podaci na računu nisu odgovarajući, molimo vas da nas kontaktirate najkasnije u roku od 24 sata od trenutka prijema pošiljke.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className={`text-lg font-bold uppercase tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>Pravo na odustajanje i zamenu</h3>
            <p>
              U skladu sa Zakonom o zaštiti potrošača, imate pravo da odustanete od ugovora bez navođenja razloga u roku od 14 dana od dana prijema robe.
            </p>
            <p>
              U skladu s našim uslovima zamene proizvoda, proizvod se u zakonskom roku može zameniti za drugi pod uslovom da nije oštećen i korišćen, a troškove vraćanja snosi kupac. Zamena se mora izvršiti u zakonskom roku.
            </p>
          </section>

          <section className={`p-8 rounded-3xl space-y-4 border ${
            theme === 'dark' ? 'bg-[#111] border-zinc-900' : 'bg-gray-50 border-transparent'
          }`}>
            <h3 className={`text-lg font-bold uppercase tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>Povraćaj sredstava</h3>
            <p className="m-0">
              U slučaju vraćanja robe kupcu koji je prethodno robu platio kuriru tj. pouzećem, troškove vraćanja robe ne snosi DD Design, već trošak pada na teret kupca.
            </p>
            <p className="m-0">
              U slučaju vraćanja robe i povraćaja sredstava kupcu koji je prethodno platio nekom od platnih kartica, DD Design je u obavezi da povraćaj vrši isključivo preko VISA, EC/MC, Maestro i Dinacard metoda plaćanja.
            </p>
          </section>

          <section className={`pt-12 border-t ${
            theme === 'dark' ? 'border-zinc-900' : 'border-gray-100'
          }`}>
            <div className={`flex items-center space-x-3 mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>
              <Info className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`} />
              <h3 className="text-lg font-bold uppercase tracking-tight m-0">Informacije o preduzetniku</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
              <div className="space-y-1">
                <p className={`font-bold uppercase tracking-widest text-[10px] ${
                  theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                }`}>Poslovno ime</p>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Danijela Gojković pr Proizvodnja ostale odeće DD DESIGN – fashion brand Mladenovac</p>
              </div>
              <div className="space-y-1">
                <p className={`font-bold uppercase tracking-widest text-[10px] ${
                  theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                }`}>Sedište</p>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>VUKA KARADžIĆA 34/1, 11400, MLADENOVAC (VAROŠ), Srbija</p>
              </div>
              <div className="space-y-1">
                <p className={`font-bold uppercase tracking-widest text-[10px] ${
                  theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                }`}>Matični broj</p>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>66313425</p>
              </div>
              <div className="space-y-1">
                <p className={`font-bold uppercase tracking-widest text-[10px] ${
                  theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                }`}>PIB</p>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>112727875</p>
              </div>
            </div>
          </section>

          <footer className="pt-12 flex flex-col sm:flex-row gap-6">
            <div className={`flex-1 p-6 rounded-2xl ${
              theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
            }`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${
                theme === 'dark' ? 'text-black/50' : 'text-white/50'
              }`}>Dostava</p>
              <p className="text-xl font-bold uppercase tracking-tight">5-10 radnih dana</p>
            </div>
            <div className={`flex-1 p-6 rounded-2xl text-center flex flex-col justify-center ${
              theme === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-gray-100 border border-transparent'
            }`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${
                theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'
              }`}>Besplatna dostava</p>
              <p className={`text-xl font-bold uppercase tracking-tight ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>preko 10.000 RSD</p>
            </div>
          </footer>
        </div>
      </motion.div>
    </div>
  );
}
