import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Newspaper, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ImageZoomModal from '../components/ImageZoomModal';

const mainProjectsRaw = [
  {
    id: 'dd-modna-prica',
    titles: {
      sr: "D&D Modna Priča",
      en: "D&D Fashion Story",
      ru: "Модная история D&D"
    },
    categories: {
      sr: "Lepa & Srećna / Editorijal",
      en: "Lepa & Srećna / Editorial",
      ru: "Lepa & Srećna / Редакционная статья"
    },
    year: "2024",
    link: "/saradnje/dd-modna-prica",
    image: "https://images.weserv.nl/?url=64.media.tumblr.com/76dc2883adea11944da040a1a7847267/dce9263cc4f8b5b7-c2/s2048x3072/2ef0942ea8f8d24999eef396e48bafb91c41e9b6.jpg",
    descriptions: {
      sr: "Ekskluzivni dizajn stvoren za žene istančanog ukusa. Spoj vrhunskog kvaliteta i moderne vizije odevanja.",
      en: "Exclusive design created for women of refined taste. A fusion of superb quality and modern vision of dressing.",
      ru: "Эксклюзивный дизайн для женщин с изысканным вкусом. Сочетание превосходного качества и современного видения стиля."
    },
    icon: Star,
    colSpan: "lg:col-span-4",
    aspectRatio: "aspect-[2/3]",
    imagePosition: "object-[center_12%]"
  },
  {
    id: 'lepaisrecna',
    titles: {
      sr: "Olja Lević x Lepa & Srećna",
      en: "Olja Lević x Lepa & Srećna",
      ru: "Оля Левич x Lepa & Srećna"
    },
    categories: {
      sr: "Editorijal / Naslovna strana",
      en: "Editorial / Cover page",
      ru: "Редакционная статья / Обложка"
    },
    year: "2024",
    link: "/saradnje/lepaisrecna",
    image: "https://images.weserv.nl/?url=64.media.tumblr.com/dc0a7d20577b87803d85bce68571034b/49bb5b10ceb26ae9-16/s2048x3072/a87374b39ff7b8e1f20918b6afa086d5bed72ce4.jpg",
    descriptions: {
      sr: "Besprekoran stajling za naslovnu stranu prestižnog magazina. Sinergija visoke mode i autentične lepote.",
      en: "Impeccable styling for the cover page of a prestigious magazine. Synergy of high fashion and authentic beauty.",
      ru: "Безупречный стиль для обложки престижного журнала. Синергия высокой моды и подлинной красоты."
    },
    icon: Newspaper,
    colSpan: "lg:col-span-8",
    aspectRatio: "aspect-[16/9]",
    imagePosition: "object-[center_12%]"
  },
  {
    id: 'andjelka-stevic',
    titles: {
      sr: "Anđelka Stević Žugić u DD Design",
      en: "Anđelka Stević Žugić in DD Design",
      ru: "Анджелка Стевич Жугич в DD Design"
    },
    categories: {
      sr: "Editorijal / Naslovna strana",
      en: "Editorial / Cover page",
      ru: "Редакционная статья / Обложка"
    },
    year: "2024",
    link: "/saradnje/andjelka-stevic",
    image: "https://images.weserv.nl/?url=64.media.tumblr.com/1bfee187e0ca0398f18dda06df01f18d/dce9263cc4f8b5b7-3c/s2048x3072/1124c1cda5bfefee44bbf99bb73a68d8507e2a44.jpg",
    descriptions: {
      sr: "Stil koji prati velike snove i unikatnu žensku harizmu. Prepoznatljivi balans prefinjene savremene klasike i apsolutnog komfora.",
      en: "A style that matches big dreams and unique female charisma. A signature balance of refined modern classics and absolute comfort.",
      ru: "Стиль, соответствующий большим мечтам и уникальной женской харизме. Знаковый баланс утонченной классики и абсолютного комфорта."
    },
    icon: Star,
    colSpan: "lg:col-span-4",
    aspectRatio: "aspect-[2/3]",
    imagePosition: "object-left-top"
  },
  {
    id: 'dragana-kosjerina',
    titles: {
      sr: "Dragana Kosjerina Perduv u DD Design",
      en: "Dragana Kosjerina Perduv in DD Design",
      ru: "Драгана Косьерина Пердув в DD Design"
    },
    categories: {
      sr: "Magazin / Intervju",
      en: "Magazine / Interview",
      ru: "Журнал / Интервью"
    },
    year: "2024",
    link: "/saradnje/dragana-kosjerina",
    image: "https://images.weserv.nl/?url=64.media.tumblr.com/890f7e197f51ea99ffa089f8d9c9a9ae/dce9263cc4f8b5b7-7b/s2048x3072/c224efc0f44e718917caabc814849f7a0c05eaf4.jpg",
    descriptions: {
      sr: "Sinonim za eleganciju, elokventnost i nepogrešivi ukus. Savršen primer moderne, ambiciozne i samouverene žene sa istančanim stilom.",
      en: "A synonym for elegance, elegance and unmistakable taste. The perfect example of a modern, ambitious and confident woman with a refined style.",
      ru: "Синоним элегантности, красноречия и безупречного вкуса. Идеальный пример современной, амбициозной и уверенной в себе женщины с изысканным стилом."
    },
    icon: Newspaper,
    colSpan: "lg:col-span-8",
    aspectRatio: "aspect-[3/2]",
    imagePosition: "object-left-top"
  },
  {
    id: 'ljubica-karadjordjevic',
    titles: {
      sr: "NJKV Princeza Ljubica Karađorđević",
      en: "HRH Princess Ljubica Karađorđević",
      ru: "Е.К.В. Принцесса Любица Карагеоргиевич"
    },
    categories: {
      sr: "Svečani Intervju / Tradicija",
      en: "Gala Interview / Tradition",
      ru: "Гала-интервью / Традиция"
    },
    year: "2024",
    link: "/saradnje/ljubica-karadjordjevic",
    image: "https://images.weserv.nl/?url=64.media.tumblr.com/ee4b31ecf786d70664b9543ad1425c80/dce9263cc4f8b5b7-61/s2048x3072/98a7d5868f7f46dc540af884a18c4e23abd71911.jpg",
    descriptions: {
      sr: "Kraljevska prefinjenost, dostojanstvo i neupitni kvalitet. Modeli koji savršeno prate prirodnu estetiku i slave tradiciju.",
      en: "Royal refinement, dignity and unquestionable quality. Designs that perfectly align with natural aesthetics and celebrate tradition.",
      ru: "Королевское изящество, достоинство и бесспорное качество. Модели, которые идеально гармонируют с естественной эстетикой и воспевают традиции."
    },
    icon: Zap,
    colSpan: "lg:col-span-8",
    aspectRatio: "aspect-[16/9]",
    imagePosition: "object-[center_15%]"
  },
  {
    id: 'aleksandra-perisic',
    titles: {
      sr: "Aleksandra Perišić × DD Design",
      en: "Aleksandra Perišić × DD Design",
      ru: "Александра Перишич × DD Design"
    },
    categories: {
      sr: "Olimpijka / Stil Šampiona",
      en: "Olympian / Champions Style",
      ru: "Олимпийка / Стиль чемпионов"
    },
    year: "2024",
    link: "/saradnje/aleksandra-perisic",
    image: "https://images.weserv.nl/?url=64.media.tumblr.com/399513ff7549a952a3acdd8f65e50b67/dce9263cc4f8b5b7-78/s2048x3072/fc0d00d6a3e44d27b68b792710ec6b5837b65de6.jpg",
    descriptions: {
      sr: "Naša proslavljena reprezentativka u tekvondou i olimpijska osvajačica srebra u elegantnom ženskom odelu koje spaja strukturiranost novog talasa i častu autentičnu snagu.",
      en: "Our celebrated taekwondo representative and Olympic silver medalist in an elegant women's suit that combines structured new wave cuts with block-authentic strength.",
      ru: "Наша знаменитая представительница тхэквондо и серебряный призер Олимпийских игр в элегантном женском костюме, сочетающем структурированный крой новой волны и чистую энергию."
    },
    icon: Star,
    colSpan: "lg:col-span-4",
    aspectRatio: "aspect-[2/3]",
    imagePosition: "object-left-top"
  },
  {
    id: 'dragana-radakovic',
    titles: {
      sr: "Svetska Operska Diva Dragana Radaković",
      en: "World Opera Diva Dragana Radaković",
      ru: "Мировая оперная дива Драгана Радакович"
    },
    categories: {
      sr: "Scenski Glamur / Opera",
      en: "Stage Glamour / Opera",
      ru: "Сценический гламур / Опера"
    },
    year: "2024",
    link: "/saradnje/dragana-radakovic",
    image: "https://images.weserv.nl/?url=64.media.tumblr.com/b4642e4dc8b39d1f35a9183aad3e79c8/dce9263cc4f8b5b7-ee/s2048x3072/d266aa74275e87652a778ad97c5f37c374be09a1.jpg",
    descriptions: {
      sr: "Nastupa na najrenomiranijim svetskim scenama od Sidnejske opere do Pekinga, a u raskošno dizajniranoj crnoj kreaciji sa tilom sija i svedoči o najfinijem zanatu.",
      en: "Performing on the most renowned world stages from Sydney Opera to Beijing, shining in a magnificently designed black gown with tulle witnessing the finest craft.",
      ru: "Выступает на самых известных сценах мира от Сиднейской оперы до Пекина, блистая в великолепном черном платье из тюля, демонстрирующем тончайшее мастерство."
    },
    icon: Newspaper,
    colSpan: "lg:col-span-4",
    aspectRatio: "aspect-[2/3]",
    imagePosition: "object-left-top"
  },
  {
    id: 'dragana-micalovic',
    titles: {
      sr: "Dragana Mićalović × DD Design",
      en: "Dragana Mićalović × DD Design",
      ru: "Драгана Мичалович × DD Design"
    },
    categories: {
      sr: "Glumačka Scena / Romantika",
      en: "Acting Scene / Romance",
      ru: "Актерская сцена / Романтика"
    },
    year: "2024",
    link: "/saradnje/dragana-micalovic",
    image: "https://images.weserv.nl/?url=64.media.tumblr.com/6ca196db17bf36375f7b9a0ab4a310b8/dce9263cc4f8b5b7-61/s2048x3072/064fb37fa5581ab2516646d1c5c79c9c35b1fe58.jpg",
    descriptions: {
      sr: "Zablistala u romantičnim i nežnim modelima koji odišu optimizmom, redefinišući udobnost i unutrašnji sklad kroz vrhunsku estetiku i prirodne tkanine.",
      en: "Shined in romantic and gentle designs that radiate optimism, redefining comfort and inner balance through top aesthetics and natural fabrics.",
      ru: "Блистает в романтичных и нежных моделях, излучающих оптимизм, переопределяя комфорт и внутреннюю гармонию благодаря эстетике премиум-класса и натуральным тканям."
    },
    icon: Star,
    colSpan: "lg:col-span-8",
    aspectRatio: "aspect-[3/2]",
    imagePosition: "object-left-top"
  },
  {
    id: 'tamara-misirlic',
    titles: {
      sr: "Tamara Misirlić u beloj košulji",
      en: "Tamara Misirlić in White Shirt",
      ru: "Тамара Мисирлич в белой рубашке"
    },
    categories: {
      sr: "Stil sa svrhom / Humanost",
      en: "Style with Purpose / Humanity",
      ru: "Стиль с целью / Гуманность"
    },
    year: "2024",
    link: "/saradnje/tamara-misirlic",
    image: "https://images.weserv.nl/?url=64.media.tumblr.com/5a30deebcaf58ee5ffa440df4ede7751/dce9263cc4f8b5b7-19/s2048x3072/cb6ef8dfe2802f17462dadc6a68ec2802588ef6c.jpg",
    descriptions: {
      sr: "Uz prefinjenu belu košulju sa voluminoznim rukavima, Tamara spaja nežnost i borbeni duh u editorijalu koji svedoči o plemenitosti i autorskom modnom krugu.",
      en: "With a refined white shirt with voluminous sleeves, Tamara combines tenderness and fighting spirit in an editorial showcasing nobility and custom couture.",
      ru: "В изысканной белой рубашке с объемными рукавами Тамара сочетает нежность и боевой дух в фотосессии, свидетельствующей о благородстве и высокой моде."
    },
    icon: Newspaper,
    colSpan: "lg:col-span-8",
    aspectRatio: "aspect-[16/9]",
    imagePosition: "object-center"
  },
  {
    id: 'dajana-svraka',
    titles: {
      sr: "Dajana Švraka Milutinović u DD Design",
      en: "Dajana Švraka Milutinović in DD Design",
      ru: "Даяна Шврака Милутинович в DD Design"
    },
    categories: {
      sr: "Elegancija & Nauka",
      en: "Elegance & Science",
      ru: "Элегантность и Наука"
    },
    year: "2024",
    link: "/saradnje/dajana-svraka",
    image: "https://images.weserv.nl/?url=64.media.tumblr.com/effe353d3bf33a5e79529f568d01627a/dce9263cc4f8b5b7-af/s2048x3072/626cb32846e8056a1dcaf9bf058e53c2317e5138.jpg",
    descriptions: {
      sr: "Magistar farmacije i stručnjak za vantelesnu oplodnju u elegantnoj crnoj kreaciji koja donosi vrhunski profesionalizam, intelekt i empatiju u centar estetike.",
      en: "Master of Pharmacy and IVF expert in an elegant black gown showcasing supreme professionalism, intellect and empathy.",
      ru: "Магистр фармации и эксперт по ЭКО в элегантном черном платье, олицетворяющем высокий профессионализм, интеллект и эмпатию."
    },
    icon: Zap,
    colSpan: "lg:col-span-4",
    aspectRatio: "aspect-[2/3]",
    imagePosition: "object-left-top"
  },
  {
    id: 'danijela-pantic',
    titles: {
      sr: "Dr Danijela Pantić Conić",
      en: "Dr Danijela Pantić Conić",
      ru: "Д-р Даниэла Пантич Цонич"
    },
    categories: {
      sr: "TV Mozaik / Znanje & Stil",
      en: "TV Mosaic / Knowledge & Style",
      ru: "ТВ Мозаика / Знания и Стиль"
    },
    year: "2024",
    link: "/saradnje/danijela-pantic",
    image: "https://images.weserv.nl/?url=64.media.tumblr.com/5a9a9c8275d2e2e09baa013f341cfff0/dce9263cc4f8b5b7-53/s2048x3072/a4c625ab22a8d6069430de77bc01643618fa3d79.jpg",
    descriptions: {
      sr: "Popularna voditeljka i edukatorka donosi duh celoživotnog učenja i zdravlja, noseći ekskluzivne odevne komade izrađene od čistih, sertifikovanih organskih pamuka.",
      en: "Popular TV host and educator brings the spirit of lifelong learning and wellness, wearing exclusive pieces made of pure, certified organic cotton.",
      ru: "Популярная телеведущая и преподаватель привносит дух непрерывного обучения и здоровья, в эксклюзивных вещах из чистого сертифицированного органического хлопка."
    },
    icon: Zap,
    colSpan: "lg:col-span-8",
    aspectRatio: "aspect-[16/9]",
    imagePosition: "object-center"
  },
  {
    id: 'belgrade-fashion-week',
    titles: {
      sr: "Belgrade Fashion Week",
      en: "Belgrade Fashion Week",
      ru: "Belgrade Fashion Week"
    },
    categories: {
      sr: "Osvrt / Modna Kritika",
      en: "Overview / Fashion Review",
      ru: "Обзор / Модный обзор"
    },
    year: "2024",
    link: "/saradnje/belgrade-fashion-week",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=1200",
    descriptions: {
      sr: "„DD DESIGN – Modna arhitektura koja slavi žensku individualnost“ — Izuzetno smo ponosni na osvrt vodeće modne institucije u regionu o našem brendu.",
      en: "“DD DESIGN – Fashion architecture that celebrates female individuality” — We are exceptionally proud of the review by the leading fashion institution in the region about our brand.",
      ru: "«DD DESIGN – Архитектура моды, прославляющая женскую индивидуальность» — Мы чрезвычайно гордемся обзором ведущего модного института региона о нашем бренде."
    },
    icon: Star,
    colSpan: "lg:col-span-8 lg:col-start-3",
    aspectRatio: "aspect-[16/10]",
    imagePosition: "object-center"
  }
];

export default function Collaborations() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [zoomAlt, setZoomAlt] = useState<string>('');

  const localizedProjects = mainProjectsRaw.map(proj => ({
    id: proj.id,
    title: proj.titles[language] || proj.titles['sr'],
    category: proj.categories[language] || proj.categories['sr'],
    year: proj.year,
    link: proj.link,
    image: proj.image,
    description: proj.descriptions[language] || proj.descriptions['sr'],
    icon: proj.icon,
    colSpan: proj.colSpan,
    aspectRatio: proj.aspectRatio,
    imagePosition: proj.imagePosition
  }));

  const textDict = {
    sr: {
      tag: "Svet Kreativnosti",
      desc: "Zabeleženi trenuci rada brenda DD Design. Pogledajte prikaze u vodećim magazinima, ekskluzivne intervjue i editorijale sa izuzetnim ličnostima.",
      more: "Saznaj više"
    },
    en: {
      tag: "World of Creativity",
      desc: "Recorded moments of the DD Design brand. Take a look at features in leading magazines, exclusive interviews, and editorials with exceptional personalities.",
      more: "Discover more"
    },
    ru: {
      tag: "Мир творчества",
      desc: "Запечатленные моменты из жизни бренда DD Design. Ознакомьтесь с публикациями в ведущих журналах, эксклюзивными интервью и фотосессиями с выдающимися личностями.",
      more: "Подробнее"
    }
  };

  const currentTexts = textDict[language] || textDict['sr'];

  return (
    <div className="min-h-screen pt-32 pb-24 transition-colors duration-500 overflow-x-hidden bg-transparent">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
        >
          <span className={`text-[10px] font-light italic uppercase tracking-[0.4em] mb-6 block transition-colors ${
            theme === 'dark' ? 'text-zinc-650' : 'text-gray-400'
          }`}>{currentTexts.tag}</span>
          <h1 className={`text-6xl md:text-9xl font-extralight tracking-tighter uppercase leading-[0.8] mb-12 transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>
            PRESS
          </h1>
          <p className={`text-lg max-w-2xl leading-relaxed transition-colors ${
            theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
          }`}>
            {currentTexts.desc}
          </p>
        </motion.div>
      </div>

      {/* Main Feature Projects - Asymmetrical Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-16 lg:gap-y-24 items-start">
          {localizedProjects.map((project, i) => (
            <motion.div 
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: "easeOut", delay: (i % 3) * 0.05 }}
              className={`w-full flex flex-col space-y-6 group ${project.colSpan || 'lg:col-span-4'}`}
            >
              {/* Image with zoom on click */}
              <div 
                onClick={() => {
                  setZoomImage(project.image);
                  setZoomAlt(project.title);
                }}
                className={`w-full ${project.aspectRatio || 'aspect-[2/3]'} rounded-[2rem] overflow-hidden relative block shadow-lg hover:shadow-2xl transition-all duration-500 cursor-zoom-in bg-zinc-900`}
              >
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className={`w-full h-full object-cover ${project.imagePosition || 'object-center'} grayscale opacity-85 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-1000 ease-out`}
                  referrerPolicy="no-referrer"
                />
              </div>
              
              {/* Copy Area */}
              <div className="space-y-4 px-2">
                <div className="flex items-center space-x-3">
                   <project.icon className="w-4 h-4 text-zinc-500" />
                   <span className="text-[10px] font-light italic uppercase tracking-[0.2em] text-zinc-500">{project.category}</span>
                   <span className="h-3 w-[1px] bg-zinc-850" />
                   <span className="text-[10px] font-mono text-zinc-500">{project.year}</span>
                 </div>
                 
                <Link to={project.link} className="block group/title">
                  <h2 className={`text-2xl md:text-3xl font-light italic tracking-wide uppercase leading-tight transition-colors ${
                    theme === 'dark' ? 'text-white group-hover/title:text-zinc-350' : 'text-black group-hover/title:text-zinc-650'
                  }`}>
                    {project.title}
                  </h2>
                </Link>
                
                <p className={`text-sm leading-relaxed transition-colors ${
                  theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
                }`}>
                  {project.description}
                </p>
                
                <Link 
                  to={project.link}
                  className={`inline-flex items-center space-x-3 text-[10px] font-light italic uppercase tracking-widest transition-colors ${
                    theme === 'dark' ? 'text-white hover:text-zinc-400' : 'text-black hover:text-gray-600'
                  }`}
                >
                  <span>{currentTexts.more}</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <ImageZoomModal 
        isOpen={zoomImage !== null}
        onClose={() => setZoomImage(null)}
        imageSrc={zoomImage || ''}
        imageAlt={zoomAlt}
      />
    </div>
  );
}
