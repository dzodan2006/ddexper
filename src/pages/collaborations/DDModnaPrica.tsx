import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Camera, Newspaper, Quote, ChevronLeft, Sparkles, Shirt, Award, Globe, ZoomIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import ImageZoomModal from '../../components/ImageZoomModal';

const imageUrl = "https://images.weserv.nl/?url=64.media.tumblr.com/76dc2883adea11944da040a1a7847267/dce9263cc4f8b5b7-c2/s2048x3072/2ef0942ea8f8d24999eef396e48bafb91c41e9b6.jpg";

export default function DDModnaPrica() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isZoomOpen, setIsZoomOpen] = useState(false);

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

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
        >
          <span className={`text-[10px] font-bold uppercase tracking-[0.4em] mb-6 block transition-colors ${
            theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
          }`}>Ekskluzivni Editorijal</span>
          <h1 className={`text-5xl md:text-8xl font-bold tracking-tighter uppercase italic leading-[0.9] mb-8 transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>
            D&D Modna <br /> <span className="text-zinc-500">Priča</span>
          </h1>
        </motion.div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          {/* Cover & Gallery Side */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[3/4] rounded-sm overflow-hidden shadow-2xl bg-zinc-900 group cursor-pointer"
              onClick={() => setIsZoomOpen(true)}
            >
              <img 
                src={imageUrl} 
                alt="D&D modna priča" 
                className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="bg-white/15 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white px-5 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center space-x-2">
                  <ZoomIn className="w-4 h-4" />
                  <span>Zumiraj sliku</span>
                </div>
              </div>
              
              <div className="absolute top-6 left-6 bg-black/80 text-white px-4 py-2 text-[10px] uppercase font-bold tracking-[0.2em] backdrop-blur-md">
                Lepa & Srećna
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none">
                 <p className="text-white/60 text-[10px] font-mono uppercase tracking-widest mb-1">
                   Dizajn & Elegancija
                 </p>
                 <h3 className="text-white font-bold text-lg uppercase tracking-wider">
                   Ekskluzivni dizajn stvoren za žene istančanog ukusa
                 </h3>
              </div>
            </motion.div>
            

          </div>

          {/* Article Text Content Side */}
          <div className="lg:col-span-12 lg:col-start-7 xl:col-span-7 xl:col-start-6 space-y-12">
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Newspaper className="w-4 h-4 text-zinc-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Lepa & Srećna × D&D Design</span>
                </div>
                <h2 className={`text-3xl md:text-5xl font-bold tracking-tight leading-tight ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>
                  Ekskluzivni dizajn stvoren za žene istančanog ukusa
                </h2>
              </div>

              <div className={`space-y-6 text-base leading-relaxed ${
                theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
              }`}>
                <p className="text-lg font-serif italic">
                  U svetu modne hiperprodukcije i prolaznih trendova, pronaći autentičan modni potpis postaje prava umetnost. Upravo tu počinje D&D modna priča – brend iza kojeg stoje Danijela Gojković i Danijela Stojkovski, dizajnerke i vlasnice uspešnog brenda D&D Design.
                </p>

                <p>
                  Ono što je započelo kao zajednička ljubav prema modi i tekstilu tokom studija, brzo se pretočilo u prepoznatljiv modni brend namenjen ženama koje vole eleganciju, cene vrhunski kvalitet i ne pristaju na kompromise kada je u pitanju lični stil.
                </p>

                {/* Subheading 1 */}
                <div className="pt-8 pb-4 space-y-4">
                  <h3 className={`text-xl font-bold uppercase tracking-wide flex items-center ${
                    theme === 'dark' ? 'text-white' : 'text-black'
                  }`}>
                    <Shirt className="w-5 h-5 mr-3 text-zinc-500" />
                    Vizija utkana u svaki šav: Spoj vrhunskog kvaliteta i inovacije
                  </h3>
                  <p>
                    D&D Design nije nastao preko noći, već iz jasne želje da se tržištu ponudi nešto potpuno drugačije.
                  </p>
                </div>

                {/* Big Quote Block */}
                <div className={`p-8 rounded-3xl border relative overflow-hidden group ${
                  theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-50 border-gray-100'
                }`}>
                  <Quote className="absolute -top-4 -right-4 w-24 h-24 text-zinc-500/10 group-hover:text-zinc-500/20 transition-all" />
                  <p className={`text-xl font-serif italic mb-4 relative z-10 leading-relaxed ${
                    theme === 'dark' ? 'text-white' : 'text-black'
                  }`}>
                    "Želele smo da ponudimo ženama ne samo estetski privlačnu, već i udobnu odeću, koja će svojom jedinstvenošću odražavati njihov stil i individualnost."
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 relative z-10">Danijela G. & Danijela S. • D&D Design</p>
                </div>

                <p>
                  Svaki komad sa potpisom D&D Design nosi duboku emociju i priču. Inspiraciju crpimo iz bogatog spektra koji nadilazi svakodnevne okvire:
                </p>

                {/* Bullet Points with style */}
                <ul className="space-y-6 pl-2">
                  <li className="flex items-start space-x-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2.5 shrink-0 animate-pulse" />
                    <div>
                      <span className="font-bold block text-sm uppercase tracking-wider mb-1">Priroda</span>
                      <span className="text-sm">Kao neiscrpan izvor predivnih boja i tekstura koje se prelivaju na materijale.</span>
                    </div>
                  </li>
                  <li className="flex items-start space-x-4">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2.5 shrink-0 animate-pulse" />
                    <div>
                      <span className="font-bold block text-sm uppercase tracking-wider mb-1">Umetnost i Kultura</span>
                      <span className="text-sm">Inspirisano bogatim i prefinjenim detaljima različitih istorijskih epoha i stilova.</span>
                    </div>
                  </li>
                  <li className="flex items-start space-x-4">
                    <div className="w-2 h-2 rounded-full bg-amber-505 bg-zinc-500 mt-2.5 shrink-0 animate-pulse" />
                    <div>
                      <span className="font-bold block text-sm uppercase tracking-wider mb-1">Tehnološko Znanje</span>
                      <span className="text-sm">Lična iskustva i poznavanje svojstava tekstila omogućavaju nam kreiranje inovativnih, a ujedno savršeno udobnih krojeva.</span>
                    </div>
                  </li>
                </ul>

                {/* Subheading 2 */}
                <div className="pt-8 pb-4 space-y-4">
                  <h3 className={`text-xl font-bold uppercase tracking-wide flex items-center ${
                    theme === 'dark' ? 'text-white' : 'text-black'
                  }`}>
                    <Award className="w-5 h-5 mr-3 text-zinc-500" />
                    Održiva moda nasuprot hiperprodukciji i jednoličnosti
                  </h3>
                  <p>
                    Svedoci smo vremena u kojem veliki high-street brendovi nameću jednoličnost. D&D Design se svesno i ponosno bori protiv masovne proizvodnje. Naša snaga leži u stvaranju unikatnih komada izrađenih od luksuznih tkanina, uz maksimalnu posvećenost personalizaciji i detaljima.
                  </p>
                  <p>
                    Spajanjem klasične elegancije sa savremenim elementima ne pratimo slepo trendove – mi ih oblikujemo. Ekskluzivnost koju nudimo našim klijentkinjama prepoznata je i od strane stručne javnosti, a veliku podršku u afirmaciji domaćeg dizajna pruža nam i tim <strong>"MAD House Sava centar"</strong>, koji slavi kulturu i modnu umetnost.
                  </p>
                </div>

                {/* Subheading 3 */}
                <div className="pt-8 pb-4 space-y-4">
                  <h3 className={`text-xl font-bold uppercase tracking-wide flex items-center ${
                    theme === 'dark' ? 'text-white' : 'text-black'
                  }`}>
                    <Globe className="w-5 h-5 mr-3 text-zinc-500" />
                    Pogled u budućnost: Nova kolekcija i međunarodno tržište
                  </h3>
                  <p>
                    D&D Design ne prestaje da pomera granice. Trenutno radimo na razvoju nove kolekcije koja je zasnovana na održivosti i inovativnim materijalima. Naš cilj za budućnost je jasan – proširenje ponude, izlazak na međunarodno tržište i učešće na ključnim globalnim modnim događajima.
                  </p>
                  <p>
                    Želite li da unesete novinu, originalnost i vrhunski luksuz u svoju garderobu? D&D Design je tu da vam pruži istinsko zadovoljstvo svakim nošenjem.
                  </p>
                </div>

                {/* Call To Action Direct Link */}
                <div className="pt-10">
                  <button
                    onClick={() => navigate('/shop')}
                    className={`inline-flex items-center space-x-4 w-full justify-center sm:w-auto px-8 py-5 rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-white text-black hover:bg-zinc-200 shadow-xl'
                        : 'bg-black text-white hover:bg-zinc-850 shadow-xl'
                    }`}
                  >
                    <span>Pogledajte najnoviju kolekciju</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <ImageZoomModal 
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        imageSrc={imageUrl}
        imageAlt="D&D modna priča"
      />
    </div>
  );
}
