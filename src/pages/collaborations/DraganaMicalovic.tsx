import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Newspaper, Quote, ChevronLeft, Shirt, Award, ZoomIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import ImageZoomModal from '../../components/ImageZoomModal';

const imageUrl = "https://images.weserv.nl/?url=64.media.tumblr.com/6ca196db17bf36375f7b9a0ab4a310b8/dce9263cc4f8b5b7-61/s2048x3072/064fb37fa5581ab2516646d1c5c79c9c35b1fe58.jpg";

export default function DraganaMicalovic() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  return (
    <article className="min-h-screen pt-32 pb-24 transition-colors duration-500 overflow-x-hidden bg-transparent">
      {/* Back Button */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <button 
          onClick={() => navigate('/saradnje')}
          className={`flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
            theme === 'dark' ? 'text-zinc-600 hover:text-white' : 'text-gray-400 hover:text-black'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Nazad na press</span>
        </button>
      </header>

      {/* Main Hero Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
        >
          <span className={`text-[10px] font-bold uppercase tracking-[0.4em] mb-6 block transition-colors ${
            theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
          }`}>Glumačka Scena & Prirodna Lepota</span>
          <h1 className={`text-5xl md:text-8xl font-bold tracking-tighter uppercase italic leading-[0.9] mb-8 transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>
            Dragana <br /> <span className="text-zinc-500">Mićalović</span>
          </h1>
        </motion.div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          {/* Gallery / Image Side */}
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
                alt="Dragana Mićalović u DD Design nežnim i romantičnim kreacijama" 
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
                Glumica & Inspiracija
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none">
                 <p className="text-white/60 text-[10px] font-mono uppercase tracking-widest mb-1">
                   SENSITIVE ROMANCE
                 </p>
                 <h2 className="text-white font-bold text-lg uppercase tracking-wider">
                   Nežnost, autentična lepota i nepogrešiv romantični stil
                 </h2>
              </div>
            </motion.div>
          </div>

          {/* Article Text Content */}
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
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Maksimalni SEO • Romantična Sofisticiranost</span>
                </div>
                <h3 className={`text-3xl md:text-5xl font-bold tracking-tight leading-tight uppercase ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>
                  Nežnost, prirodna lepota i jedinstven stilski izraz
                </h3>
              </div>

              <div className={`space-y-6 text-base leading-relaxed ${
                theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
              }`}>
                <p className="text-lg font-serif italic">
                  Jedna od naših najpopularnijih i najlepših glumica, Dragana Mićalović, unela je svoju prepoznatljivu toplinu i prirodnu lepotu u najnoviji modni intervju, noseći nežne i romantične komade sa potpisom DD Design. Dragana, koja sa radošću i optimizmom očekuje svaku novu životnu i profesionalnu ulogu, savršena je inspiracija za našu novu kolekciju.
                </p>

                <p>
                  Kreacije brenda DD Design koje je ponela naglašavaju sofisticiranost i udobnost, kreirane za žene koje kroz život koračaju sa osmehom, negujući autentičan stil i istinsku individualnost. U vremenu brzih promena, naša vizija ženske mode se oslanja na autentične teksture i ležerne ali izuzetno efektne krojeve koji ističu ženstvenost u njenom najčistijem obliku.
                </p>

                {/* Big Quote Block */}
                <div className={`p-8 rounded-3xl border relative overflow-hidden group ${
                  theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-50 border-gray-100'
                }`}>
                  <Quote className="absolute -top-4 -right-4 w-24 h-24 text-zinc-500/10 group-hover:text-zinc-500/20 transition-all" />
                  <p className={`text-xl font-serif italic mb-4 relative z-10 leading-relaxed ${
                    theme === 'dark' ? 'text-white' : 'text-black'
                  }`}>
                    "Kada se u onome što nosite osećate slobodno i potpuno prirodno, ta unutrašnja radost i toplina se prenose na ljude oko vas."
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 relative z-10">Dragana Mićalović • Glumica</p>
                </div>

                <div className="pt-8 pb-4 space-y-4">
                  <h4 className={`text-xl font-bold uppercase tracking-wide flex items-center ${
                    theme === 'dark' ? 'text-white' : 'text-black'
                  }`}>
                    <Award className="w-5 h-5 mr-3 text-zinc-500" />
                    Brend za žene koje neguju sebe
                  </h4>
                  <p>
                    U našoj krojačkoj tradiciji, DD Design stavlja poseban fokus na toplotu materijala i prefinjenost dodira kože sa tekstilom. Romantični nabori, lagane lanene i pamučne teksture, i suptilne pastelne boje oslikavaju harmoniju koja nastaje kada dizajniramo misleći na unutrašnji mir moderne žene.
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
                    <span>Istražite romantične komade</span>
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
        imageAlt="Dragana Mićalović"
      />
    </article>
  );
}
