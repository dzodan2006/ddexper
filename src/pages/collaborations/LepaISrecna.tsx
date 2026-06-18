import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Camera, Newspaper, Quote, X, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const magazineImages = [
  "https://64.media.tumblr.com/e1ed53dd79c21abc2c6a901e940711a3/49bb5b10ceb26ae9-51/s2048x3072/8de62f8940a79731ae0707a1f0d372f27d545c8f.jpg",
  "https://64.media.tumblr.com/0d7ee7a00df594bc58740e2882bab918/49bb5b10ceb26ae9-24/s2048x3072/f931812e72281e790a42026a1999dc9519de0ab3.jpg",
  "https://64.media.tumblr.com/0ee4ba77d92bcdfb5cd897567a461adb/49bb5b10ceb26ae9-26/s2048x3072/2f63d79993ea354d7dd8e9d062c9ec6338282454.jpg",
  "https://64.media.tumblr.com/dc0a7d20577b87803d85bce68571034b/49bb5b10ceb26ae9-16/s2048x3072/a87374b39ff7b8e1f20918b6afa086d5bed72ce4.jpg",
  "https://64.media.tumblr.com/b3457b26db8053c657e61c947e721394/49bb5b10ceb26ae9-b6/s2048x3072/78f7be6faee32cabf8c9b9fd3ab37589386b2f61.jpg",
  "https://64.media.tumblr.com/1279ebda363102448a99fdce9fa5b78f/49bb5b10ceb26ae9-40/s1280x1920/a05e67544e666790cda28157132949673ccb21e2.jpg",
  "https://64.media.tumblr.com/341fd39bba59281dd41fc5ae603c4dad/49bb5b10ceb26ae9-81/s2048x3072/ed48821b410c3ae75103739bc1625a7b67ffc68b.jpg", 
  "https://64.media.tumblr.com/8db76c6f3015da37fbb6e29d1913b42e/49bb5b10ceb26ae9-98/s1280x1920/caf47de4e04f415264c47c89fb3035d8bda786f2.jpg"
].map(url => `https://images.weserv.nl/?url=${url.replace('https://', '')}`);

export default function LepaISrecna() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      rotateY: direction < 0 ? 45 : -45,
    })
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => (prevIndex + newDirection + magazineImages.length) % magazineImages.length);
  };

  return (
    <div className="min-h-screen pt-32 pb-24 transition-colors duration-500 overflow-x-hidden bg-transparent">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <button 
          onClick={() => navigate('/saradnje')}
          className={`flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
            theme === 'dark' ? 'text-zinc-600 hover:text-white' : 'text-gray-400 hover:text-black'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Nazad na press</span>
        </button>
      </div>

      {/* Lightbox / Fullscreen Viewer */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10"
            onClick={() => setIsFullscreen(false)}
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setIsFullscreen(false)}
              className="absolute top-8 right-8 z-[110] p-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-xl transition-all"
            >
              <X className="w-6 h-6" />
            </motion.button>

            <button 
              onClick={(e) => { e.stopPropagation(); paginate(-1); }}
              className="absolute left-4 md:left-8 z-[110] p-6 text-white/40 hover:text-white transition-all items-center justify-center hidden md:flex"
            >
              <ArrowLeft className="w-10 h-10" />
            </button>

            <motion.div
              key={currentIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative max-w-full max-h-[90vh] aspect-[3/4]"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={magazineImages[currentIndex]} 
                alt="Fullscreen view"
                className="w-full h-full object-contain shadow-2xl rounded-sm"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            <button 
              onClick={(e) => { e.stopPropagation(); paginate(1); }}
              className="absolute right-4 md:right-8 z-[110] p-6 text-white/40 hover:text-white transition-all items-center justify-center hidden md:flex"
            >
              <ArrowRight className="w-10 h-10" />
            </button>

            <div className="absolute bottom-10 flex space-x-3">
               {magazineImages.map((_, i) => (
                 <div 
                   key={i} 
                   className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === i ? 'w-12 bg-white' : 'w-2 bg-white/20'}`} 
                 />
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
        >
          <span className={`text-[10px] font-bold uppercase tracking-[0.4em] mb-6 block transition-colors ${
            theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
          }`}>Sinergija kreativnosti</span>
          <h1 className={`text-5xl md:text-8xl font-bold tracking-tighter uppercase italic leading-[0.9] mb-12 transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>
            Editorijali <br /> <span className="text-zinc-500">& Saradnje</span>
          </h1>
        </motion.div>
      </div>

      {/* Main Collaboration Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-20 items-start">
          
          {/* Magazine Viewer */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-32">
            <div className="relative aspect-[3/4] perspective-1000 group cursor-zoom-in">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  onClick={() => setIsFullscreen(true)}
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                    rotateY: { duration: 0.4 }
                  }}
                  className="absolute inset-0 shadow-2xl rounded-sm overflow-hidden bg-white"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <img 
                    src={magazineImages[currentIndex]} 
                    alt={`Magazine page ${currentIndex + 1}`}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-full text-white border border-white/30">
                       <Camera className="w-6 h-6" />
                    </div>
                  </div>
                  
                  {currentIndex === 6 && (
                    <div className="absolute top-8 left-8 bg-black/80 text-white px-4 py-2 text-[10px] uppercase font-bold tracking-[0.2em] backdrop-blur-md">
                      Evo nas
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
                     <p className="text-white/60 text-[10px] font-mono uppercase tracking-widest">
                       Lepa & Srećna × Olja Lević
                     </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Controls */}
              <div className="absolute -bottom-16 left-0 right-0 flex justify-between items-center px-4">
                <button 
                  onClick={() => paginate(-1)}
                  className={`p-4 rounded-full border transition-all ${
                    theme === 'dark' ? 'border-zinc-800 text-white hover:bg-white hover:text-black' : 'border-gray-200 text-black hover:bg-black hover:text-white'
                  }`}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex space-x-2">
                  {magazineImages.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1 transition-all duration-300 ${
                        currentIndex === i 
                          ? (theme === 'dark' ? 'w-8 bg-white' : 'w-8 bg-black') 
                          : (theme === 'dark' ? 'w-2 bg-zinc-800' : 'w-2 bg-gray-200')
                      }`} 
                    />
                  ))}
                </div>
                <button 
                  onClick={() => paginate(1)}
                  className={`p-4 rounded-full border transition-all ${
                    theme === 'dark' ? 'border-zinc-800 text-white hover:bg-white hover:text-black' : 'border-gray-200 text-black hover:bg-black hover:text-white'
                  }`}
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="w-full lg:w-1/2 pt-10">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                   <Newspaper className="w-4 h-4 text-zinc-500" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Lepa i Srećna × DD Design</span>
                </div>
                <h2 className={`text-4xl md:text-5xl font-bold tracking-tight leading-tight ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>
                  Besprekoran stajling za naslovnu stranu Olje Lević
                </h2>
              </div>

              <div className={`space-y-6 text-base leading-relaxed ${
                theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
              }`}>
                <p>
                  Kada se spoji vrhunska umetnost, harizma poznatog lica i nepogrešivo oko za modu, rezultat je naslovnica koja se pamti. U najnovijem broju prestižnog magazina, imali smo priliku da vidimo glumicu Olju Lević u izdanju koje odiše elegancijom i snagom, a za njen besprekoran stajling bila je zadužena upravo naša modna kreatorka Danijela Gojković.
                </p>

                <div className="py-8 border-y border-zinc-800/20 dark:border-zinc-800 space-y-4">
                   <h4 className={`text-xs font-bold uppercase tracking-widest flex items-center ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                     <Camera className="w-4 h-4 mr-2" /> Vizija iza objektiva
                   </h4>
                   <p className="text-sm italic font-serif">
                     Iza svake uspešne modne fotografije stoji tim koji razume estetiku modernog doba. Za editorijal koji je ovekovečio poznati fotograf Miloš Nadaždin, Danijela Gojković je kreirala vizuelni identitet koji savršeno prati Oljinu prirodnu lepotu.
                   </p>
                </div>

                <div className="space-y-6">
                  <h4 className={`text-sm font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Šta čini ovaj stajling posebnim?</h4>
                  <ul className="space-y-6">
                    <li className="flex items-start space-x-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-2 shrink-0" />
                      <div>
                        <span className="font-bold block mb-1">Sofisticiranost sa stavom:</span>
                        <span className="text-sm">Kreacije brenda DD Design nisu samo odeća – one su izraz karaktera.</span>
                      </div>
                    </li>
                    <li className="flex items-start space-x-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-2 shrink-0" />
                      <div>
                        <span className="font-bold block mb-1">Vrhunski materijali:</span>
                        <span className="text-sm">Poseban akcenat stavljen je na teksturu i kroj koji naglašava siluetu, a istovremeno pruža slobodu pokreta.</span>
                      </div>
                    </li>
                    <li className="flex items-start space-x-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-2 shrink-0" />
                      <div>
                        <span className="font-bold block mb-1">Sinergija tima:</span>
                        <span className="text-sm">Saradnja sa umetničkim šminkerom Markom Nikolićem i stilistkinjom Marijom Vasiljević rezultirala je "total look-om" koji postavlja standarde u domaćoj modnoj industriji.</span>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="space-y-6">
                  <h4 className={`text-sm font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Brend koji biraju profesionalci</h4>
                  <p className="text-sm">
                    Pojavljivanje DD Design-a u rubrici "Iza kamere" još jednom potvrđuje da je Danijela Gojković dizajnerka čijoj viziji veruju najpoznatija lica naše scene. Bilo da je reč o glamuroznim editorijalima ili gostovanjima u emisijama poput onih na Studiju B, njeni komadi su uvek prvi izbor za žene koje žele autentičnost.
                  </p>
                </div>

                <div className={`p-8 rounded-3xl border relative overflow-hidden group ${
                  theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-50 border-gray-100'
                }`}>
                   <Quote className="absolute -top-4 -right-4 w-24 h-24 text-zinc-500/10 group-hover:text-zinc-500/20 transition-all" />
                   <p className={`text-lg font-serif italic mb-4 relative z-10 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                     "Za Oljin blistav izgled bio je zadužen umetnički šminker Marko Nikolić, a za besprekoran stajling modna kreatorka Danijela Gojković."
                   </p>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 relative z-10">Magazin Lepota & Zdravlje</p>
                </div>

                <div className="space-y-6 pt-10 border-t border-zinc-800/10 dark:border-zinc-800">
                  <h4 className={`text-sm font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Zašto izabrati DD Design kreacije?</h4>
                  <p className="text-sm leading-relaxed">
                    Ako tražite komad koji spaja visoku modu i nosivost, naša nova kolekcija nudi upravo ono što ste videli na stranicama magazina. Svaki šav je pažljivo planiran, a svaka kreacija nosi potpis dizajnerke koja modu živi i stvara sa strašću.
                  </p>
                  <p className={`text-lg font-bold tracking-tight italic ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    Budite i vi zvezda svoje priče. Istražite našu novu kolekciju i pronađite svoj idealan DD Design stajling.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className={`mt-48 py-32 border-t border-b transition-all duration-500 ${
        theme === 'dark' ? 'border-zinc-900 bg-[#0e0e0e]' : 'border-gray-100 bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className={`text-sm font-bold mb-16 uppercase tracking-[0.3em] transition-colors ${
              theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
            }`}>Poverenje su nam ukazali</h2>
            <div className={`flex flex-wrap justify-center items-center gap-x-20 gap-y-12 grayscale opacity-40 hover:opacity-100 transition-opacity duration-1000 uppercase font-bold tracking-tighter ${
              theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'
            }`}>
                <span className="text-2xl md:text-4xl italic">Lepa & Srećna</span>
                <span className="text-2xl md:text-3xl tracking-[0.2em]">Belgrade Fashion Week</span>
                <span className="text-2xl md:text-3xl tracking-[0.2em]">Lepota & Zdravlje</span>
                <span className="text-2xl md:text-4xl font-serif">Elle</span>
                <span className="text-2xl md:text-4xl tracking-widest italic">Harper's Bazaar</span>
            </div>
        </div>
      </div>

      {/* Footer Teaser */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32 text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
        >
          <h2 className={`text-5xl font-bold tracking-tighter uppercase italic leading-none mb-8 transition-colors ${
             theme === 'dark' ? 'text-white' : 'text-black'
          }`}>VAŠA VIZIJA <br /> NAŠA <span className="text-zinc-500">KREACIJA</span></h2>
          <p className={`mb-12 text-lg transition-colors ${
             theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
          }`}>Otvoreni smo za nove ideje, kreativne vizije i inspirativne saradnje.</p>
          <a href="mailto:danijelago@yahoo.com" className={`text-xl font-bold border-b-2 pb-2 transition-all uppercase tracking-widest ${
            theme === 'dark' ? 'text-white border-white hover:text-zinc-400 hover:border-zinc-400' : 'text-black border-black hover:text-gray-400 hover:border-gray-400'
          }`}>
            STUPITE U KONTAKT
          </a>
        </motion.div>
      </div>
    </div>
  );
}
