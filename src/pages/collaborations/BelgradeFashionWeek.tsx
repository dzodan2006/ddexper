import { motion } from 'motion/react';
import { ChevronLeft, Quote, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export default function BelgradeFashionWeek() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-32 pb-24 transition-colors duration-500 overflow-x-hidden bg-transparent">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <button 
          onClick={() => navigate('/saradnje')}
          className={`flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
            theme === 'dark' ? 'text-zinc-600 hover:text-white' : 'text-gray-400 hover:text-black'
          }`}
          id="back-to-collaborations-btn"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Nazad na press</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Collumn 1: Elegant Sticky Sidebar Image */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[3/4.5] rounded-[3rem] overflow-hidden bg-zinc-900 shadow-2xl group"
              id="bfw-hero-image-wrapper"
            >
              <img 
                src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=1200" 
                alt="Belgrade Fashion Week Runway Review" 
                className="w-full h-full object-cover object-top grayscale opacity-90 group-hover:scale-[1.02] group-hover:opacity-100 transition-all duration-1000 ease-out"
                referrerPolicy="no-referrer"
                id="bfw-hero-img"
              />
            </motion.div>
            
            <div className={`flex flex-col items-center text-center p-8 rounded-3xl border transition-all duration-500 ${
              theme === 'dark' ? 'bg-zinc-900/40 border-zinc-900' : 'bg-gray-50 border-gray-100'
            }`} id="bfw-sidebar-badge">
              <Star className="w-6 h-6 text-zinc-500 mb-3" />
              <span className={`text-[10px] font-bold uppercase tracking-[0.25em] mb-1 ${
                theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'
              }`}>Prestižno Prepoznavanje</span>
              <span className={`text-xs font-serif italic ${
                theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
              }`}>Liderstvo u autorskom modnom krugu</span>
            </div>
          </div>

          {/* Collumn 2: Review Content */}
          <div className="lg:col-span-7 space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="space-y-6"
              id="bfw-content-header"
            >
              <span className={`text-[10px] font-bold uppercase tracking-[0.4em] block ${
                theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
              }`}>
                Belgrade Fashion Week
              </span>
              
              <h1 className={`text-4xl md:text-6xl font-black tracking-tighter leading-[0.95] uppercase italic transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`} id="bfw-content-title">
                Šta o nama kaže <br />
                <span className="text-zinc-500">Belgrade Fashion Week</span>
              </h1>
              
              <div className="h-0.5 w-16 bg-zinc-500 mt-8" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`text-lg leading-relaxed font-light transition-colors ${
                theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
              }`}
              id="bfw-intro-paragraph"
            >
              Izuzetno smo ponosni na dugogodišnje prepoznavanje našeg rada od strane vodećih modnih institucija u regionu. Prenosimo vam u celosti osvrt koji je o našem brendu objavio <strong>Belgrade Fashion Week</strong>:
            </motion.div>

            {/* Quote block */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className={`p-10 md:p-14 rounded-[3rem] border relative overflow-hidden group space-y-8 ${
                theme === 'dark' ? 'bg-zinc-900/60 border-zinc-800' : 'bg-gray-50 border-gray-100'
              }`}
              id="bfw-quote-card"
            >
              <Quote className="absolute -top-6 -right-6 w-32 h-32 text-zinc-500/5 group-hover:text-zinc-500/10 transition-all duration-700" />
              
              <div className="space-y-4">
                <span className={`text-xs font-bold uppercase tracking-[0.3em] block ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>
                  Modni Osvrt
                </span>
                <h3 className={`text-2xl md:text-3xl font-extrabold tracking-tight uppercase italic leading-tight ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>
                  „DD DESIGN – Modna arhitektura koja slavi žensku individualnost“
                </h3>
              </div>

              <div className={`space-y-6 text-base md:text-lg leading-relaxed font-serif italic ${
                theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
              }`}>
                <p>
                  „Na domaćoj modnoj sceni, brend DD DESIGN, iza kojeg stoje dizajnerke Danijela Stojkovski i Danijela Gojković, pozicionirao se kao sinonim za autentični luksuz i vrhunsku zanatsku egzekuciju. Njihov rad predstavlja savršen primer kako se tradicija poznavanja tekstila može pretočiti u moderan modni jezik.
                </p>
                <p>
                  Nova kolekcija brenda donosi maestralnu igru kontrasta. Koristeći rigidnost taft svile naspram fluidnosti muslina i senzualnosti francuske čipke, dizajnerke su uspele da vizuelno definišu dualnost savremene žene – njenu nepokolebljivu snagu i prefinjenu nežnost.
                </p>
                <p>
                  Sa savršenom paletom u biserno beloj i crnoj boji, DD DESIGN ne nudi samo odeću, već kompletan vizuelni identitet. To je autentična, bezvremenska elegancija koja nam u vremenu brze mode vraća veru u istinsku umetnost kreiranja.“
                </p>
              </div>

              <div className="pt-6 border-t border-zinc-800/10 dark:border-zinc-800 flex justify-between items-center">
                <span className={`text-xs font-bold uppercase tracking-widest ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>
                  — Belgrade Fashion Week
                </span>
              </div>
            </motion.div>

            {/* Custom Brand Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6 pt-6"
              id="bfw-features-block"
            >
              <h4 className={`text-sm font-bold uppercase tracking-widest ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                Vizija bezvremenske elegancije
              </h4>
              <p className={`text-sm leading-relaxed ${
                theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
              }`}>
                Ovo prestižno priznanje nas dodatno motiviše da svakom detalju u našim ateljeima posvetimo bezrezervno vreme i pažnju. Ručna izrada, vrhunski materijali poput najfinije svile i prefinjenih čipki, ostaju srž identiteta DD DESIGN brenda.
              </p>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Brand Trust Section */}
      <div className={`mt-48 py-32 border-t border-b transition-all duration-500 ${
        theme === 'dark' ? 'border-zinc-900 bg-[#0e0e0e]' : 'border-gray-100 bg-gray-50'
      }`} id="bfw-trust-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-sm font-bold mb-16 uppercase tracking-[0.3em] transition-colors ${
            theme === 'dark' ? 'text-zinc-650' : 'text-gray-400'
          }`}>Prepoznatljivost našeg brenda</h2>
          <div className={`flex flex-wrap justify-center items-center gap-x-20 gap-y-12 grayscale opacity-40 hover:opacity-100 transition-opacity duration-1000 uppercase font-bold tracking-tighter ${
            theme === 'dark' ? 'text-zinc-500' : 'text-gray-450'
          }`}>
            <span className="text-2xl md:text-3xl italic">Lepa & Srećna</span>
            <span className="text-2xl md:text-3xl tracking-[0.2em]">Belgrade Fashion Week</span>
            <span className="text-2xl md:text-3xl tracking-[0.2em]">Lepota & Zdravlje</span>
            <span className="text-2xl md:text-3xl font-serif">Elle</span>
            <span className="text-2xl md:text-2xl tracking-widest italic">Harper's Bazaar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
