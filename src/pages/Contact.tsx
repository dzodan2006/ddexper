import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Instagram, Facebook, Send } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function Contact() {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <div className={`py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen transition-colors duration-500`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-16"
      >
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className={`text-[10px] font-bold uppercase tracking-[0.3em] block ${
            theme === 'dark' ? 'text-zinc-650' : 'text-gray-400'
          }`}>{t('contact.subtitle')}</span>
          <h1 className={`text-4xl md:text-5xl font-bold tracking-tight uppercase ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>{t('contact.title')}</h1>
          <p className={`text-sm leading-relaxed max-w-lg mx-auto ${
            theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
          }`}>
            {t('contact.desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Contact Details */}
          <div className="space-y-12">
            <div className="space-y-8">
              <h2 className={`text-2xl font-bold uppercase tracking-tight border-b pb-4 ${
                theme === 'dark' ? 'text-white border-zinc-900' : 'text-black border-gray-100'
              }`}>{t('contact.locations')}</h2>
              
              <div className="space-y-8">
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=MAD+House+Sava+Centar+Beograd" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-start space-x-4 group"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    theme === 'dark' ? 'bg-[#111] group-hover:bg-white' : 'bg-gray-50 group-hover:bg-black'
                  }`}>
                    <MapPin className={`w-5 h-5 transition-colors ${
                      theme === 'dark' 
                        ? 'text-zinc-500 group-hover:text-black' 
                        : 'text-black group-hover:text-white'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                      theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                    }`}>Beograd</p>
                    <p className={`text-lg font-medium transition-colors ${
                      theme === 'dark' ? 'text-zinc-400 group-hover:text-white' : 'text-gray-900 group-hover:text-black'
                    }`}>MAD House - Sava Centar</p>
                  </div>
                </a>

                <a 
                  href="https://www.google.com/maps/search/?api=1&query=MAD+House+Rajićeva+Beograd" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-start space-x-4 group"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    theme === 'dark' ? 'bg-[#111] group-hover:bg-white' : 'bg-gray-50 group-hover:bg-black'
                  }`}>
                    <MapPin className={`w-5 h-5 transition-colors ${
                      theme === 'dark' 
                        ? 'text-zinc-500 group-hover:text-black' 
                        : 'text-black group-hover:text-white'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                      theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                    }`}>Beograd</p>
                    <p className={`text-lg font-medium transition-colors ${
                      theme === 'dark' ? 'text-zinc-400 group-hover:text-white' : 'text-gray-900 group-hover:text-black'
                    }`}>MAD House - Rajićeva SC</p>
                  </div>
                </a>

                <a 
                  href="https://www.google.com/maps/search/?api=1&query=The+Luxury+Club+Novi+Sad+Trg+Marije+Trandafil+12" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-start space-x-4 group"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    theme === 'dark' ? 'bg-[#111] group-hover:bg-white' : 'bg-gray-50 group-hover:bg-black'
                  }`}>
                    <MapPin className={`w-5 h-5 transition-colors ${
                      theme === 'dark' 
                        ? 'text-zinc-500 group-hover:text-black' 
                        : 'text-black group-hover:text-white'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                      theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                    }`}>Novi Sad</p>
                    <p className={`text-lg font-medium transition-colors ${
                      theme === 'dark' ? 'text-zinc-400 group-hover:text-white' : 'text-gray-900 group-hover:text-black'
                    }`}>The Luxury Club</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>Trg Marije Trandafil 12</p>
                  </div>
                </a>

                <a 
                  href="https://www.google.com/maps/search/?api=1&query=DD+DESIGN+Vuka+Karadžića+34/1+Mladenovac" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-start space-x-4 group"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    theme === 'dark' ? 'bg-[#111] group-hover:bg-white' : 'bg-gray-50 group-hover:bg-black'
                  }`}>
                    <MapPin className={`w-5 h-5 transition-colors ${
                      theme === 'dark' 
                        ? 'text-zinc-500 group-hover:text-black' 
                        : 'text-black group-hover:text-white'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                      theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                    }`}>Mladenovac</p>
                    <p className={`text-lg font-medium transition-colors ${
                      theme === 'dark' ? 'text-zinc-400 group-hover:text-white' : 'text-gray-900 group-hover:text-black'
                    }`}>DD DESIGN (Showroom)</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>Vuka Karadžića 34/1</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className={`text-2xl font-bold uppercase tracking-tight border-b pb-4 ${
                theme === 'dark' ? 'text-white border-zinc-900' : 'text-black border-gray-100'
              }`}>{t('contact.info')}</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    theme === 'dark' ? 'bg-[#111]' : 'bg-gray-50'
                  }`}>
                    <Phone className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-500' : 'text-black'}`} />
                  </div>
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                      theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                    }`}>{t('contact.phone')}</p>
                    <p className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>+381 64 1605032</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    theme === 'dark' ? 'bg-[#111]' : 'bg-gray-50'
                  }`}>
                    <Mail className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-500' : 'text-black'}`} />
                  </div>
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                      theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                    }`}>{t('contact.email')}</p>
                    <p className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>office@dddesign.rs</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className={`text-xs font-bold uppercase tracking-[0.2em] ${
                theme === 'dark' ? 'text-zinc-650' : 'text-gray-400'
              }`}>{t('contact.follow')}</h3>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="https://www.instagram.com/dddesign.rs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all group ${
                    theme === 'dark' 
                      ? 'bg-zinc-900 text-zinc-450 hover:bg-white hover:text-black' 
                      : 'bg-gray-50 text-black hover:bg-black hover:text-white'
                  }`}
                >
                  <Instagram className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-widest">Instagram</span>
                </a>
                <a 
                  href="https://www.facebook.com/dddesign.rs/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all group ${
                    theme === 'dark' 
                      ? 'bg-zinc-900 text-zinc-450 hover:bg-white hover:text-black' 
                      : 'bg-gray-50 text-black hover:bg-black hover:text-white'
                  }`}
                >
                  <Facebook className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-widest">Facebook</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className={`p-8 md:p-12 rounded-[2.5rem] ${
            theme === 'dark' ? 'bg-[#111]' : 'bg-gray-50'
          }`}>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${
                    theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                  }`}>{t('contact.formName')}</label>
                  <input 
                    type="text" 
                    className={`w-full border border-transparent focus:border-opacity-100 rounded-2xl px-6 py-4 outline-none transition-all ${
                      theme === 'dark' 
                        ? 'bg-zinc-900 text-white focus:border-white animate-colors' 
                        : 'bg-white text-black focus:border-black'
                    }`}
                    placeholder={t('contact.formPlaceholderName')}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${
                    theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                  }`}>{t('contact.formEmail')}</label>
                  <input 
                    type="email" 
                    className={`w-full border border-transparent focus:border-opacity-100 rounded-2xl px-6 py-4 outline-none transition-all ${
                      theme === 'dark' 
                        ? 'bg-zinc-900 text-white focus:border-white animate-colors' 
                        : 'bg-white text-black focus:border-black'
                    }`}
                    placeholder="mail@example.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${
                  theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                }`}>{t('contact.formSubject')}</label>
                <input 
                  type="text" 
                  className={`w-full border border-transparent focus:border-opacity-100 rounded-2xl px-6 py-4 outline-none transition-all ${
                    theme === 'dark' 
                      ? 'bg-zinc-900 text-white focus:border-white animate-colors' 
                      : 'bg-white text-black focus:border-black'
                  }`}
                  placeholder={t('contact.formPlaceholderSubject')}
                />
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${
                  theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                }`}>{t('contact.formMessage')}</label>
                <textarea 
                  rows={4}
                  className={`w-full border border-transparent focus:border-opacity-100 rounded-2xl px-6 py-4 outline-none transition-all resize-none ${
                    theme === 'dark' 
                      ? 'bg-zinc-900 text-white focus:border-white' 
                      : 'bg-white text-black focus:border-black'
                  }`}
                  placeholder={t('contact.formPlaceholderMessage')}
                />
              </div>

              <button className={`w-full font-bold uppercase tracking-widest text-[11px] py-5 rounded-2xl flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity ${
                theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
              }`}>
                <span>{t('contact.sendBtn')}</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
