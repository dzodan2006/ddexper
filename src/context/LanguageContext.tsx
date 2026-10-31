import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'sr' | 'en' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateProduct: (product: any) => any;
  translateCategory: (category: any) => any;
  translateCategoryName: (name: string) => string;
  translateColorName: (colorName: string) => string;
  translateSizeName: (sizeName: string) => string;
  formatCurrency: (price: number) => string;
}

const translations: Record<Language, Record<string, string>> = {
  sr: {
    // Navbar
    'nav.home': 'Naslovna',
    'nav.products': 'Proizvodi',
    'nav.new': 'Novo',
    'nav.editorial': 'Editorijali',
    'nav.press': 'Press',
    'nav.categories': 'Kategorije',
    'nav.sale': 'Sniženja',
    'nav.searchPlaceholder': 'Šta tražite danas?',
    'nav.searchStore': 'Pretražite prodavnicu',
    'nav.showResults': 'Prikaži rezultate',
    'nav.resultsFor': 'Rezultati za',
    'nav.noResults': 'Nema pronađenih proizvoda za ovaj pojam.',
    'nav.lightTheme': 'Prebaci na svetlu temu',
    'nav.darkTheme': 'Prebaci na tamnu temu',
    'nav.viewAll': 'Prikaži sve',

    // Cart / Cart Drawer
    'cart.title': 'Vaša Korpa',
    'cart.empty': 'Vaša korpa je prazna.',
    'cart.continue': 'Nastavite kupovinu',
    'cart.subtotal': 'Međuzbir',
    'cart.shipping': 'Dostava',
    'cart.shippingFree': 'Besplatna isporuka na kućnu adresu',
    'cart.free': 'Besplatna',
    'cart.addMoreForFree': 'Dodajte još {amount} za besplatnu dostavu.',
    'cart.checkout': 'Dovrši kupovinu',
    'cart.added': 'Dodato u korpu',
    'cart.remove': 'Ukloni',
    'cart.size': 'Veličina',
    'cart.color': 'Boja',
    'cart.total': 'Ukupno',
    'cart.note': 'Napomena:',
    'cart.noteDesc': 'Svi modeli su ručno izrađeni. Isporuka za modele koji nisu na stanju je 5-10 radnih dana.',

    // Brand Slogan
    'brand.slogan': 'Umetnost utkana u svilu',

    // Footer
    'footer.brandDesc': 'Unikatne kreacije i bezvremeni dizajn koji slavi snažan karakter i suptilnu ženstvenost.',
    'footer.links': 'Meni',
    'footer.contact': 'Kontakt',
    'footer.rights': 'Sva prava zadržana.',

    // Editorial Page
    'ed.tag': 'Autorski Digitalni Editorijal',
    'ed.title': 'Interaktivni Modni Magazin',
    'ed.subtitle': 'Priče iz Ateljea DD Design',
    'ed.brandIdentity': 'Ovaj prostor predstavlja digitalno izdanje našeg modnog sveta. Kroz objektiv umetničke fotografije, storytelling sa autentičnih lokacija i stilske predloge, uspostavljamo iskrenu emotivnu vezu sa vama. Otkrijte inspiraciju, osetite našu viziju i pronađite komad koji govori vašim jezikom.',
    'ed.taftSilkTitle': 'Bezvremena Čarolija Taft Svile',
    'ed.taftSilkDesc': 'Taft svila (Taffeta Silk) je više od materijala – ona je skulpturalnost, kraljevska tekstura i zvuk u pokretu. Poznata po tome što stvara prefinjeni "šuštavi" zvuk pri hodu, ova čvrsto tkana tkanina zadržava svoju savršenu arhitektonsku formu, stvarajući luksuzne nabore i dramatične linije koje ističu moć ženske siluete.',
    'ed.taftSilkQuote': '"Moda je arhitektura u pokretu, a taft svila je njen najplemenitiji stub."',
    'ed.taftSilkStyleTitle': 'Stilski Saveti & Predlozi',
    'ed.taftSilkStyle1': 'Dnevni Kontrast: Kombinujte naš Taft žaket sa jednostavnim, vrhunski ukrojenim pantalonama za sveden a moćan kontrast.',
    'ed.taftSilkStyle2': 'Glamur bez napora: Haljine od čiste taft svile zahtevaju minimalno nakita – pustite samu teksturu tkanine i prelamanje svetlosti da govore sami za sebe.',
    'ed.taftSilkStyle3': 'Slojevi i Tekstura: Taft se veličanstveno spaja sa vunenim komadima i delikatnim ručno pletenim detaljima za sofisticiran jesenji ili prolećni izgled.',
    'ed.exploreTaftBtn': 'Pogledajte Taft Svila Kolekciju',
    'ed.locationTitle': 'Kameni Dvorci i Šapati Vetra',
    'ed.locationDesc': 'Naš najnoviji editorijal snimljen je na autentičnim lokacijama istorijskog zdanja, gde se srednjovekovni hladni kamen spaja sa toplinom i sjajem najfinije taft svile. Ovaj estetski duel slavi trajnost, snagu i romantičnu čežnju modernog doba.',
    'ed.shopTheLook': 'Kupite Ovaj Izgled',
    'ed.backToShop': 'Nazad u prodavnicu',
    
    // SEO labels
    'seo.taftKeywords': 'taft svila, luksuzne taft haljine, DD Design odela, srpska haute couture, visoka moda, luksuzni materijali, unikatne haljine svila',

    // Home Page Translations
    'home.heroTitle': 'Bezvremenski dizajn svedene elegancije',
    'home.heroDesc': 'Unikatni odevni komadi koji spajaju vrhunsku estetiku sa savršenom udobnošću. Ručna izrada i posvećenost detaljima kreirani za vaš prepoznatljiv stil.',
    'home.discoverCollection': 'Otkrijte kolekciju',
    'home.ourStory': 'Naša Priča',
    'home.handmadeTag': 'Umeće i Kvalitet',
    'home.handmadeTitle': 'Ručna izrada je naš potpis',
    'home.handmadeDescription': 'U svetu brze mode, mi biramo drugačiji put. Svaki komad u našoj kolekciji rezultat je pažljivog rada ruku, posvećenosti detaljima i ljubavi prema dizajnu.',
    'home.zoomLabel': 'Pogledajte ceo potpis / Zoom',
    'home.categoriesTag': 'Naše kolekcije',
    'home.categoriesTitle': 'Istražite po kategorijama',
    'home.exploreModels': 'Istražite modele',
    'home.featuredTitle': 'Izdvajamo',
    'home.featuredTag': 'Najtraženiji modeli sezone.',
    'home.viewAllModels': 'Pogledajte sve modele',
    'home.pressTag': 'Objave',
    'home.viewAllPress': 'Pogledajte sve objave',
    'home.learnMore': 'Saznaj više',

    // Categories Page
    'cat.organized': 'Organizovano',
    'cat.title': 'Istražite Kategorije',
    'cat.desc': 'Pronađite upravo ono što tražite pregledom naših pažljivo odabranih kategorija proizvoda.',
    'cat.viewBtn': 'Pogledaj kolekciju',

    // New Collection Page
    'new.title': 'Nova Kolekcija',
    'new.subtitle': 'Ekskluzivno',
    'new.desc': 'Istražite našu najnoviju i ekskluzivnu modnu priču za ovu sezonu.',
    'new.empty': 'Trenutno nema novih proizvoda u ovoj kolekciji.',

    // Sale Page
    'sale.title': 'Veliko Sniženje',
    'sale.subtitle': 'Specijalna Ponuda',
    'sale.desc': 'Pronađite prepoznatljive autorske kreacije po izuzetnim, sniženim cenama.',
    'sale.empty': 'Trenutno nema proizvoda na sniženju.',

    // Shop Page (Boutique)
    'shop.title': 'Kolekcija',
    'shop.searchPlaceholder': 'Pretraži kolekciju...',
    'shop.filterCategory': 'Kategorije',
    'shop.filterAllCategory': 'Sve',
    'shop.filterPrice': 'Cena',
    'shop.sortLabel': 'Sortiranje',
    'shop.sortPriceLow': 'Cena: od najniže',
    'shop.sortPriceHigh': 'Cena: od najviše',
    'shop.sortNewest': 'Novo i istaknuto',
    'shop.empty': 'Nismo pronašli nijedan model koji odgovara vašoj pretrazi.',

    // Product Card and Details Page
    'product.badgeNew': 'Novo',
    'product.badgeSale': 'Akcija',
    'product.soldOut': 'Rasprodato',
    'product.selectOptions': 'Izaberi opcije',
    'product.selectSize': 'Odaberi veličinu',
    'product.selectColor': 'Odaberi boju',
    'product.addBtn': 'Dodaj u korpu',
    'product.notFound': 'Proizvod nije pronađen',
    'product.backToShop': 'Povratak u prodavnicu',
    'product.alertSize': 'Molimo odaberite veličinu',
    'product.alertColor': 'Molimo odaberite boju',
    'product.backBtn': 'Povratak',
    'product.detailsCategory': 'Kategorija',
    'product.sizeChartBtn': 'Tabela veličina',
    'product.noColors': 'proizvod nema boje',
    'product.handmadeNotice': 'Svi naši modeli izrađeni su ručno, pa je za isporuku modela koji nije na stanju potrebno od pet do deset dana.',
    'product.paymentTagline': 'Plaćanje dostupno na rate i siguran povrat.',
    'product.deliveryTitle': 'Dostava',
    'product.deliveryDesc1': '2-4 radna dana (na stanju)',
    'product.deliveryDesc2': '5-10 dana za ručnu izradu',
    'product.securityTitle': 'Sigurnost',
    'product.securityDesc': 'SSL enkripcija',
    'product.returnTitle': 'Povrat',
    'product.returnDesc': '30-dnevni rok',
    'product.currencySymbol': 'din',

    // Contact Page
    'contact.subtitle': 'Budimo u kontaktu',
    'contact.title': 'Kontaktirajte nas',
    'contact.desc': 'Ako imate pitanja o našem poslovanju, slobodno nas kontaktirajte. Naš tim je tu da vam pomogne.',
    'contact.locations': 'Naše lokacije',
    'contact.info': 'Kontakt informacije',
    'contact.phone': 'Telefon',
    'contact.email': 'E-mail',
    'contact.follow': 'Pratite nas',
    'contact.formName': 'Vaše ime',
    'contact.formEmail': 'E-mail adresa',
    'contact.formSubject': 'Tema',
    'contact.formMessage': 'Vaša poruka',
    'contact.formPlaceholderName': 'Petar Petrović',
    'contact.formPlaceholderSubject': 'Pitanje u vezi porudžbine',
    'contact.formPlaceholderMessage': 'Kako vam možemo pomoći?',
    'contact.sendBtn': 'Pošalji poruku',
  },
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.new': 'New Design',
    'nav.editorial': 'Editorials',
    'nav.press': 'Press',
    'nav.categories': 'Categories',
    'nav.sale': 'On Sale',
    'nav.searchPlaceholder': 'What are you searching for today?',
    'nav.searchStore': 'Search our boutique',
    'nav.showResults': 'Show results',
    'nav.resultsFor': 'Results for',
    'nav.noResults': 'No products found matching this keyword.',
    'nav.lightTheme': 'Switch to light theme',
    'nav.darkTheme': 'Switch to dark theme',
    'nav.viewAll': 'View all',

    // Cart / Cart Drawer
    'cart.title': 'Your Cart',
    'cart.empty': 'Your cart is empty.',
    'cart.continue': 'Continue Shopping',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.shippingFree': 'Free home delivery',
    'cart.free': 'Free',
    'cart.addMoreForFree': 'Add another {amount} for free shipping.',
    'cart.checkout': 'Proceed to Checkout',
    'cart.added': 'Added to cart',
    'cart.remove': 'Remove',
    'cart.size': 'Size',
    'cart.color': 'Color',
    'cart.total': 'Total',
    'cart.note': 'Note:',
    'cart.noteDesc': 'All designs are handcrafted. Production and delivery for made-to-order items takes 5-10 business days.',

    // Brand Slogan
    'brand.slogan': 'Art woven into silk',

    // Footer
    'footer.brandDesc': 'Unique creations and timeless design celebrating strong character and subtle femininity.',
    'footer.links': 'Menu',
    'footer.contact': 'Contact',
    'footer.rights': 'All rights reserved.',

    // Editorial Page
    'ed.tag': 'Original Digital Editorial',
    'ed.title': 'Interactive Fashion Magazine',
    'ed.subtitle': 'Stories from DD Design Atelier',
    'ed.brandIdentity': 'This space represents the digital edition of our fashion universe. Through the lens of art photography, storytelling from authentic locations, and stylistic insights, we build a genuine emotional connection with you. Find inspiration, feel our vision, and select a piece that truly speaks your language.',
    'ed.taftSilkTitle': 'The Timeless Magic of Taffeta Silk',
    'ed.taftSilkDesc': 'Taffeta silk is more than just a fabric – it is architectural structure, royal texture, and sound in motion. Renowned for its signature delicate rustle as you move, this tightly woven luxury fabric retains its perfect architectural lines, creating sweeping folds and dramatic contours that celebrate the strength of the female silhouette.',
    'ed.taftSilkQuote': '"Fashion is architecture in motion, and taffeta silk is its most noble pillar."',
    'ed.taftSilkStyleTitle': 'Stylistic Advice & Ideas',
    'ed.taftSilkStyle1': 'Daytime Contrast: Pair our Taffeta jacket with simple, immaculately tailored trousers for a powerful, understated look.',
    'ed.taftSilkStyle2': 'Effortless Glamour: Pure taffeta silk dresses require minimal jewelry – let the incredible woven texture and light play make the statement.',
    'ed.taftSilkStyle3': 'Layering: Combined with premium wool knits and delicate hand-woven structures, taffeta brings depth to sophisticated spring or autumn styling.',
    'ed.exploreTaftBtn': 'Explore Taffeta Silk Collection',
    'ed.locationTitle': 'Stone Castles and Whispering Winds',
    'ed.locationDesc': 'Our latest editorial was shot on location at a historic estate, where medieval cold stone integrates seamlessly with the radiant warmth of premium taffeta silk. This aesthetic dialogue celebrates durability, elegance, and romantic yearning.',
    'ed.shopTheLook': 'Shop This Look',
    'ed.backToShop': 'Back to boutique',
    
    // SEO labels
    'seo.taftKeywords': 'taffeta silk dress, luxury taffeta suit, DD Design haute couture, luxury clothing Serbia, silk dresses, premium designer store europe',

    // Home Page Translations
    'home.heroTitle': 'Timeless design of understated elegance',
    'home.heroDesc': 'Unique tailoring that aligns high luxury aesthetics with perfect comfort. Exquisite handmade garments crafted for your signature look.',
    'home.discoverCollection': 'Discover Collection',
    'home.ourStory': 'Our Story',
    'home.handmadeTag': 'Mastery & Quality',
    'home.handmadeTitle': 'Handmade is our signature',
    'home.handmadeDescription': 'In a world of mass production, we choose a different course. Each garment in our boutique reflects dedicated handcraft, careful selection of premium fabrics, and design passion.',
    'home.zoomLabel': 'View close-up detail / Zoom',
    'home.categoriesTag': 'Our Collections',
    'home.categoriesTitle': 'Explore by categories',
    'home.exploreModels': 'Explore Designs',
    'home.featuredTitle': 'Featured',
    'home.featuredTag': 'Most desired designs of the season.',
    'home.viewAllModels': 'View all designs',
    'home.pressTag': 'Publications',
    'home.viewAllPress': 'View all press releases',
    'home.learnMore': 'Read more',

    // Categories Page
    'cat.organized': 'Curation',
    'cat.title': 'Explore Categories',
    'cat.desc': 'Find exactly what you are looking for by exploring our curated categories.',
    'cat.viewBtn': 'View Collection',

    // New Collection Page
    'new.title': 'New Collection',
    'new.subtitle': 'Exclusive',
    'new.desc': 'Explore our latest and most exclusive fashion capsule for the season.',
    'new.empty': 'There are currently no new arrivals in this collection.',

    // Sale Page
    'sale.title': 'Private Sale',
    'sale.subtitle': 'Special Offer',
    'sale.desc': 'Acquire iconic, signature handcrafted designs at extraordinary, selective pricing.',
    'sale.empty': 'There are currently no models on sale.',

    // Shop Page (Boutique)
    'shop.title': 'Boutique Collection',
    'shop.searchPlaceholder': 'Search collection...',
    'shop.filterCategory': 'Categories',
    'shop.filterAllCategory': 'All',
    'shop.filterPrice': 'Price',
    'shop.sortLabel': 'Sort Options',
    'shop.sortPriceLow': 'Price: Low to High',
    'shop.sortPriceHigh': 'Price: High to Low',
    'shop.sortNewest': 'New Arrivals',
    'shop.empty': 'No models match your current search constraints.',

    // Product Card and Details Page
    'product.badgeNew': 'New',
    'product.badgeSale': 'Sale',
    'product.soldOut': 'Sold Out',
    'product.selectOptions': 'Select Options',
    'product.selectSize': 'Select Size',
    'product.selectColor': 'Select Color',
    'product.addBtn': 'Add to Cart',
    'product.notFound': 'Product not found',
    'product.backToShop': 'Back to boutique',
    'product.alertSize': 'Please choose a size',
    'product.alertColor': 'Please choose a color',
    'product.backBtn': 'Go Back',
    'product.detailsCategory': 'Category',
    'product.sizeChartBtn': 'Size Chart',
    'product.noColors': 'no color variants available',
    'product.handmadeNotice': 'All of our garments are handmade, therefore delivery for items currently out of stock is estimated in 5 to 10 working days.',
    'product.paymentTagline': 'Installment plans available & secure refund guarantee.',
    'product.deliveryTitle': 'Delivery',
    'product.deliveryDesc1': '2-4 business days (in stock)',
    'product.deliveryDesc2': '5-10 days for hand tailoring',
    'product.securityTitle': 'Security',
    'product.securityDesc': 'SSL Encrypted Checkout',
    'product.returnTitle': 'Returns',
    'product.returnDesc': '30-day return policy',
    'product.currencySymbol': 'RSD',

    // Contact Page
    'contact.subtitle': "Let's stay in touch",
    'contact.title': 'Contact Us',
    'contact.desc': 'If you have any questions about our designs or boutique, please feel free to reach out. Our team is here to assist you.',
    'contact.locations': 'Our Locations',
    'contact.info': 'Contact Info',
    'contact.phone': 'Phone Number',
    'contact.email': 'E-mail Address',
    'contact.follow': 'Follow Us',
    'contact.formName': 'Your Name',
    'contact.formEmail': 'E-mail Address',
    'contact.formSubject': 'Subject',
    'contact.formMessage': 'Your Message',
    'contact.formPlaceholderName': 'John Doe',
    'contact.formPlaceholderSubject': 'Inquiry about order',
    'contact.formPlaceholderMessage': 'How can we help you?',
    'contact.sendBtn': 'Send Message',
  },
  ru: {
    // Navbar
    'nav.home': 'Главная',
    'nav.products': 'Коллекция',
    'nav.new': 'Новинки',
    'nav.editorial': 'Редакция',
    'nav.press': 'Пресса',
    'nav.categories': 'Категории',
    'nav.sale': 'Скидки',
    'nav.searchPlaceholder': 'Что вы ищете сегодня?',
    'nav.searchStore': 'Поиск по бутику',
    'nav.showResults': 'Показать результаты',
    'nav.resultsFor': 'Результаты для',
    'nav.noResults': 'Ничего не найдено по этому запросу.',
    'nav.lightTheme': 'Перейти на светлую тему',
    'nav.darkTheme': 'Перейти на темную тему',
    'nav.viewAll': 'Смотреть все',

    // Cart / Cart Drawer
    'cart.title': 'Ваша Корзина',
    'cart.empty': 'Ваша корзина пуста.',
    'cart.continue': 'Продолжить покупки',
    'cart.subtotal': 'Субтотал',
    'cart.shipping': 'Доставка',
    'cart.shippingFree': 'Бесплатная курьерская доставка на дом',
    'cart.free': 'Бесплатно',
    'cart.addMoreForFree': 'Добавьте еще {amount} для бесплатной доставки.',
    'cart.checkout': 'Оформить заказ',
    'cart.added': 'Добавлено в корзину',
    'cart.remove': 'Удалить',
    'cart.size': 'Размер',
    'cart.color': 'Цвет',
    'cart.total': 'Итого',
    'cart.note': 'Примечание:',
    'cart.noteDesc': 'Все наши модели создаются вручную. Пошив моделей под заказ занимает от 5 до 10 рабочих дней.',

    // Brand Slogan
    'brand.slogan': 'Искусство, сотканное из шелка',

    // Footer
    'footer.brandDesc': 'Уникальные творения и неподвластный времени дизайн, воспевающий сильный характер и утонченную женственность.',
    'footer.links': 'Меню',
    'footer.contact': 'Контакты',
    'footer.rights': 'Все права защищены.',

    // Editorial Page
    'ed.tag': 'Авторский Цифровой Релиз',
    'ed.title': 'Интерактивный Модный Журнал',
    'ed.subtitle': 'Истории из Ателье DD Design',
    'ed.brandIdentity': 'Это пространство представляет собой цифровое издание нашего модного мира. С помощью художественной фотографии, сторителлинга с аутентичных локаций и стилистических предложений мы выстраиваем искреннюю эмоциональную связь с вами. Откройте вдохновение, почувствуйте наше видение и найдите модель по душе.',
    'ed.taftSilkTitle': 'Внеземное Волшебство Тафты',
    'ed.taftSilkDesc': 'Шелковая тафта (Taffeta Silk) — это больше чем материал, это выразительная скульптурность, королевская текстура и музыка в движении. Знаменитая своим изысканным "шуршащим" шепотом при ходьбе, эта плотная шелковая ткань великолепно сохраняет свою безупречную форму, порождая роскошные складки и драматический силуэт.',
    'ed.taftSilkQuote': '"Мода — это архитектура в движении, а шелковая тафта — её самый благородный столп."',
    'ed.taftSilkStyleTitle': 'Стилистические Советы',
    'ed.taftSilkStyle1': 'Дневной Контраст: Сочетайте наш жакет из тафты с лаконичными брюками премиального кроя для сдержанного, но роскошного контраста.',
    'ed.taftSilkStyle2': 'Легкий Гламур: Платья из чистой шелковой тафты требуют минимум ювелирных украшений — позвольте самой структуре ткани говорить за себя.',
    'ed.taftSilkStyle3': 'Слоистость: Тафта великолепно гармонирует с шерстяными пальто и тонкими кружевными деталями, собирая глубокий весенний или осенний образ.',
    'ed.exploreTaftBtn': 'Посмотреть Коллекцию из Тафты',
    'ed.locationTitle': 'Каменные Замки и Шепот Ветров',
    'ed.locationDesc': 'Наша новая редакционная съемка прошла в антураже старинного замка, где средневековый холодный камень объединился с лучезарным благородством премиальной тафты. Этот эстетический поединок празднует прочность, величие и романтическую тоску современной эпохи.',
    'ed.shopTheLook': 'Купить Этот Образ',
    'ed.backToShop': 'Вернуться в магазин',
    
    // SEO labels
    'seo.taftKeywords': 'шелковая тафта платье, роскошные костюмы тафта, дизайнерская одежда DD Design, высокая мода сербия, шелковые платья купить в европе',

    // Home Page Translations
    'home.heroTitle': 'Внеземной дизайн сдержанной элегантности',
    'home.heroDesc': 'Уникальные творения, объединяющие высокую эстетику люкса с абсолютным комфортом. Изысканный ручной пошив для вашего неповторимого стиля.',
    'home.discoverCollection': 'Открыть коллекцию',
    'home.ourStory': 'Наша история',
    'home.handmadeTag': 'Мастерство и Качество',
    'home.handmadeTitle': 'Ручной пошив — наша визитная карточка',
    'home.handmadeDescription': 'В мире массового производства мы выбираем индивидуальность. Каждое изделие — результат чуткого ручного труда, перфекционизма в шовных деталях и любви к дизайну.',
    'home.zoomLabel': 'Рассмотреть детали / Zoom',
    'home.categoriesTag': 'Наши Коллекции',
    'home.categoriesTitle': 'Поиск по категориям',
    'home.exploreModels': 'Смотреть модели',
    'home.featuredTitle': 'Рекомендуем',
    'home.featuredTag': 'Самые востребованные новинки сезона.',
    'home.viewAllModels': 'Смотреть всю коллекцию',
    'home.pressTag': 'Пресса',
    'home.viewAllPress': 'Все публикации прессы',
    'home.learnMore': 'Подробнее',

    // Categories Page
    'cat.organized': 'Порядок',
    'cat.title': 'Категории Изделий',
    'cat.desc': 'Найдите именно то, что вы ищете, заглянув в наши специально подобранные категории.',
    'cat.viewBtn': 'Смотреть коллекцию',

    // New Collection Page
    'new.title': 'Новая Коллекция',
    'new.subtitle': 'Эксклюзивно',
    'new.desc': 'Откройте для себя нашу новейшую и самую роскошную модную главу этого сезона.',
    'new.empty': 'В этой коллекции пока нет новинок.',

    // Sale Page
    'sale.title': 'Сезонная Распродажа',
    'sale.subtitle': 'Специальное Предложение',
    'sale.desc': 'Уникальные дизайнерские вещи нашей ручной работы по специальным скидкам.',
    'sale.empty': 'На данный момент товаров со скидкой нет.',

    // Shop Page (Boutique)
    'shop.title': 'Коллекция',
    'shop.searchPlaceholder': 'Поиск по коллекции...',
    'shop.filterCategory': 'Категории',
    'shop.filterAllCategory': 'Все',
    'shop.filterPrice': 'Цена',
    'shop.sortLabel': 'Сортировка',
    'shop.sortPriceLow': 'Цена: по возрастанию',
    'shop.sortPriceHigh': 'Цена: по убыванию',
    'shop.sortNewest': 'Новые прибытия',
    'shop.empty': 'К сожалению, ни один товар не соответствует вашему запросу.',

    // Product Card and Details Page
    'product.badgeNew': 'New',
    'product.badgeSale': 'Sale',
    'product.soldOut': 'Продано',
    'product.selectOptions': 'Выбрать опции',
    'product.selectSize': 'Выбрать размер',
    'product.selectColor': 'Выбрать цвет',
    'product.addBtn': 'В корзину',
    'product.notFound': 'Товар не найден',
    'product.backToShop': 'Вернуться в бутик',
    'product.alertSize': 'Пожалуйста, выберите размер',
    'product.alertColor': 'Пожалуйста, выберите цвет',
    'product.backBtn': 'Назад',
    'product.detailsCategory': 'Категория',
    'product.sizeChartBtn': 'Таблица размеров',
    'product.noColors': 'варианты цвета отсутствуют',
    'product.handmadeNotice': 'Все наши вещи создаются заботливыми руками, поэтому доставка моделей, которых сейчас нет в наличии, занимает 5–10 рабочих дней.',
    'product.paymentTagline': 'Доступна оплата частями и надежная гарантия возврата.',
    'product.deliveryTitle': 'Доставка',
    'product.deliveryDesc1': '2–4 рабочих дня (в наличии)',
    'product.deliveryDesc2': '5–10 дней на ручную работу',
    'product.securityTitle': 'Безопасность',
    'product.securityDesc': 'Шифрование SSL платежей',
    'product.returnTitle': 'Возврат',
    'product.returnDesc': '30-дневный срок',
    'product.currencySymbol': 'din',

    // Contact Page
    'contact.subtitle': 'Будем на связи',
    'contact.title': 'Связаться с нами',
    'contact.desc': 'Если у вас есть какие-либо вопросы о наших моделях или магазине, пожалуйста, свяжитесь с нами. Наша команда всегда рада помочь.',
    'contact.locations': 'Наши филиалы',
    'contact.info': 'Контактная информация',
    'contact.phone': 'Телефон',
    'contact.email': 'E-mail адрес',
    'contact.follow': 'Подписывайтесь на нас',
    'contact.formName': 'Ваше имя',
    'contact.formEmail': 'E-mail адрес',
    'contact.formSubject': 'Тема сообщения',
    'contact.formMessage': 'Ваше сообщение',
    'contact.formPlaceholderName': 'Иван Иванов',
    'contact.formPlaceholderSubject': 'Вопрос о заказе',
    'contact.formPlaceholderMessage': 'Чем мы можем вам помочь?',
    'contact.sendBtn': 'Отправить сообщение',
  }
};

const categoryTranslations: Record<Language, Record<string, string>> = {
  sr: {
    'haljine': 'Haljine',
    'odela/kompleti': 'Odela / Kompleti',
    'kombinezoni': 'Kombinezoni',
    'majice/košulje': 'Košulje / Majice',
    'kosulje/majice': 'Košulje / Majice',
    'Pantalone/Suknje': 'Pantalone / Suknje',
    'pantalone/suknje': 'Pantalone / Suknje',
    'kaputi/mantili': 'Kaputi / Mantili',
    'kaputi': 'Kaputi',
    'sakoi': 'Sakoi',
    'suknje': 'Suknje',
    'mantili': 'Mantili'
  },
  en: {
    'haljine': 'Dresses', 'Haljine': 'Dresses', 'Haljina': 'Dress',
    'odela/kompleti': 'Suits & Sets', 'Odela/kompleti': 'Suits & Sets', 'Odela': 'Suits', 'Odelo': 'Suit',
    'kombinezoni': 'Jumpsuits', 'Kombinezoni': 'Jumpsuits',
    'majice/košulje': 'Shirts & Tops', 'kosulje/majice': 'Shirts & Tops', 'Košulje/majice': 'Shirts & Tops',
    'Pantalone/Suknje': 'Pants & Skirts', 'pantalone/suknje': 'Pants & Skirts', 'Suknje': 'Skirts', 'Suknja': 'Skirt',
    'kaputi/mantili': 'Coats & Trench Coats', 'Kaputi/mantili': 'Coats & Trench Coats', 'Kaputi': 'Coats', 'Kaput': 'Coat', 'kaputi': 'Coats',
    'Sakoi': 'Blazers', 'Sako': 'Blazer',
    'Mantili': 'Trench Coats', 'Mantil': 'Trench Coat',
    'Ostalo': 'Other', 'Sve': 'All'
  },
  ru: {
    'haljine': 'Платья', 'Haljine': 'Платья', 'Haljina': 'Платье',
    'odela/kompleti': 'Костюмы и комплекты', 'Odela/kompleti': 'Костюмы и комплекты', 'Odela': 'Костюмы', 'Odelo': 'Костюм',
    'kombinezoni': 'Комбинезоны', 'Kombinezoni': 'Комбинезоны',
    'majice/košulje': 'Рубашки и топы', 'kosulje/majice': 'Рубашки и топы', 'Košulje/majice': 'Рубашки и топы',
    'Pantalone/Suknje': 'Брюки и юбки', 'pantalone/suknje': 'Брюки и юбки', 'Suknje': 'Юбки', 'Suknja': 'Юбка',
    'kaputi/mantili': 'Пальто и плащи', 'Kaputi/mantili': 'Пальто и плащи', 'Kaputi': 'Пальто', 'Kaput': 'Пальто', 'kaputi': 'Пальто',
    'Sakoi': 'Жакеты', 'Sako': 'Жакет',
    'Mantili': 'Плащи / Тренчи', 'Mantil': 'Тренч',
    'Ostalo': 'Другое', 'Sve': 'Все'
  }
};

const colorTranslations: Record<Language, Record<string, string>> = {
  sr: {},
  en: {
    'crna': 'Black', 'Crna': 'Black',
    'bela': 'White', 'Bela': 'White',
    'bez': 'Beige', 'Bež': 'Beige', 'Bez': 'Beige',
    'crvena': 'Red', 'Crvena': 'Red',
    'plava': 'Blue', 'Plava': 'Blue',
    'zelena': 'Green', 'Zelena': 'Green',
    'roze': 'Pink', 'Roze': 'Pink',
    'siva': 'Grey', 'Siva': 'Grey',
    'zuta': 'Yellow', 'Žuta': 'Yellow',
    'zlatna': 'Gold', 'Zlatna': 'Gold',
    'srebrna': 'Silver', 'Srebrna': 'Silver',
    'braon': 'Brown', 'Braon': 'Brown',
    'ljubičasta': 'Purple', 'Ljubičasta': 'Purple', 'Ljubicasta': 'Purple',
    'narandžasta': 'Orange', 'Narandžasta': 'Orange',
    'tirkizna': 'Turquoise', 'Tirkizna': 'Turquoise',
    'bordo': 'Burgundy', 'Bordo': 'Burgundy',
    'Kraljevsko plava': 'Royal Blue', 'kraljevsko plava': 'Royal Blue',
    'Maslinasto zelena': 'Olive Green', 'maslinasto zelena': 'Olive Green',
    'Smaragdno zelena': 'Emerald Green', 'smaragdno zelena': 'Emerald Green',
    'Šampanjac': 'Champagne', 'šampanjac': 'Champagne', 'Sampanjac': 'Champagne',
    'proizvod nema boje': 'product has no colors',
    'Srebrne nitne': 'Silver Rivets', 'srebrne nitne': 'Silver Rivets'
  },
  ru: {
    'crna': 'Черный', 'Crna': 'Черный',
    'bela': 'Белый', 'Bela': 'Белый',
    'bez': 'Бежевый', 'Bež': 'Бежевый', 'Bez': 'Бежевый',
    'crvena': 'Красный', 'Crvena': 'Красный',
    'plava': 'Синий', 'Plava': 'Синий',
    'zelena': 'Зеленый', 'Zelena': 'Зеленый',
    'roze': 'Розовый', 'Roze': 'Розовый',
    'siva': 'Серый', 'Siva': 'Серый',
    'zuta': 'Желтый', 'Žuta': 'Желтый',
    'zlatna': 'Золотой', 'Zlatna': 'Золотой',
    'srebrna': 'Серебряный', 'Srebrna': 'Серебряный',
    'braon': 'Коричневый', 'Braon': 'Коричневый',
    'ljubičasta': 'Фиолетовый', 'Ljubičasta': 'Фиолетовый', 'Ljubicasta': 'Фиолетовый',
    'narandžasta': 'Оранжевый', 'Narandžasta': 'Оранжевый',
    'tirkizna': 'Бирюзовый', 'Tirkizna': 'Бирюзовый',
    'bordo': 'Бордовый', 'Bordo': 'Бордовый',
    'Kraljevsko plava': 'Королевский Синий', 'kraljevsko plava': 'Королевский Синий',
    'Maslinasto zelena': 'Оливковый', 'maslinasto zelena': 'Оливковый',
    'Smaragdno zelena': 'Изумрудный', 'smaragdno zelena': 'Изумрудный',
    'Šampanjac': 'Шампань', 'šampanjac': 'Шампань', 'Sampanjac': 'Шампань',
    'proizvod nema boje': 'у изделия нет вариантов цвета',
    'Srebrne nitne': 'Серебряные заклепки', 'srebrne nitne': 'Серебряные заклепки'
  }
};

const sizeTranslations: Record<Language, Record<string, string>> = {
  sr: {},
  en: {
    'univerzalna': 'Universal', 'Univerzalna': 'Universal', 'UNIVERZALNA': 'Universal',
    'po meri': 'Tailored', 'Po meri': 'Tailored', 'Po Meri': 'Tailored'
  },
  ru: {
    'univerzalna': 'Универсальный', 'Univerzalna': 'Универсальный', 'UNIVERZALNA': 'Универсальный',
    'po meri': 'Индивидуальный', 'Po meri': 'Индивидуальный', 'Po Meri': 'Индивидуальный'
  }
};

const productNameTranslations: Record<Language, Record<string, string>> = {
  sr: {},
  en: {
    'Taft Haljina': 'Taffeta Dress',
    'Taft kaput': 'Taffeta Coat',
    'Sako od tafta': 'Taffeta Blazer',
    'Beli Sako sa perjem': 'White Blazer with Feathers',
    'Crni sako sa perjem': 'Black Blazer with Feathers',
    'Crveni kaput': 'Red Coat',
    'Sako-haljina od tafta sa pojasom': 'Taffeta Blazer-Dress with Belt',
    'Haljina od tafta': 'Taffeta Dress',
    'Suknja od tafta': 'Taffeta Skirt',
    'Mantil sa pojasom': 'Trench Coat with Belt',
    'Kaput od vune': 'Wool Coat',
    'Kaput sa šal kragnom': 'Coat with Shawl Collar',
    'Odela od taft svile': 'Taffeta Silk Suits',
  },
  ru: {
    'Taft Haljina': 'Платье из тафты',
    'Taft kaput': 'Пальто из тафты',
    'Sako od tafta': 'Жакет из тафты',
    'Beli Sako sa perjem': 'Белый пиджак с перьями',
    'Crni sako sa perjem': 'Черный пиджак с перьями',
    'Crveni kaput': 'Красное пальто',
    'Sako-haljina od tafta sa pojasom': 'Жакет-платье из тафты с ремнем',
    'Haljina od tafta': 'Платье из тафты',
    'Suknja od tafta': 'Юбка из тафты',
    'Mantil sa pojasom': 'Тренч с поясом',
    'Kaput od vune': 'Шерстяное пальто',
    'Kaput sa šal kragnom': 'Пальто с шалевым воротником',
    'Odela od taft svile': 'Костюмы из шелковой тафты',
  }
};

const productDescTranslations: Record<Language, Record<string, string>> = {
  sr: {},
  en: {
    'Ručni rad.': 'Handcrafted.',
    'Hemijsko čišćenje.': 'Dry clean only.',
  },
  ru: {
    'Ručni rad.': 'Ручная работа.',
    'Hemijsko čišćenje.': 'Сухая чистка.',
  }
};

const translateTextDynamically = (text: string, lang: Language): string => {
  if (!text) return text;
  if (lang === 'sr') return text;
  
  const dict = lang === 'en' ? productNameTranslations.en : productNameTranslations.ru;
  if (dict[text]) return dict[text];
  
  const descDict = lang === 'en' ? productDescTranslations.en : productDescTranslations.ru;
  if (descDict[text]) return descDict[text];

  let result = text;
  
  const wordMap: Record<Language, Record<string, string>> = {
    sr: {},
    en: {
      'Taft haljina': 'Taffeta Dress', 'taft haljina': 'taffeta dress',
      'Taft kaput': 'Taffeta Coat', 'taft kaput': 'taffeta coat',
      'Taft suknja': 'Taffeta Skirt', 'taft suknja': 'taffeta skirt',
      'Mantil': 'Trench Coat', 'mantil': 'trench coat',
      'Sako': 'Blazer', 'sako': 'blazer',
      'Kaput': 'Coat', 'kaput': 'coat',
      'Haljina': 'Dress', 'haljina': 'dress',
      'Odelo': 'Suit', 'odelo': 'suit',
      'Odela': 'Suits', 'odela': 'suits',
      'Suknja': 'Skirt', 'suknja': 'skirt',
      'Pantalone': 'Trousers', 'pantalone': 'trousers',
      'Košulja': 'Shirt', 'košulja': 'shirt',
      'Ručni rad': 'Handmade', 'ručni rad': 'handmade',
      'ručni rad.': 'handmade.',
      'unikat': 'unique piece', 'Unikat': 'Unique piece',
      'Taft': 'Taffeta', 'taft': 'taffeta',
      'Taft svila': 'Taffeta Silk', 'taft svila': 'taffeta silk',
      'Taft svile': 'Taffeta Silk', 'taft svile': 'taffeta silk',
      'svila': 'silk', 'Svila': 'Silk',
      'svile': 'silk',
      'perje': 'feathers', 'Perje': 'Feathers',
      'sa perjem': 'with feathers',
      'sa pojasom': 'with belt',
      'od vune': 'wool', 'vuna': 'wool', 'Vuna': 'Wool',
      'kašmir': 'cashmere', 'Kašmir': 'Cashmere',
      'postava': 'lining',
      'viskoza': 'viscose',
      'pamuk': 'cotton',
      'Hemijsko čišćenje': 'Dry cleaning',
      'ekskluzivno': 'exclusively',
      'Ekskluzivno': 'Exclusive',
    },
    ru: {
      'Taft haljina': 'Платье из тафты', 'taft haljina': 'платье из тафты',
      'Taft kaput': 'Пальто из тафты', 'taft kaput': 'пальто из тафты',
      'Taft suknja': 'Юбка из тафты', 'taft suknja': 'юбка из тафты',
      'Mantil': 'Тренч', 'mantil': 'тренч',
      'Sako': 'Жакет / Пиджак', 'sako': 'пиджак',
      'Kaput': 'Пальто', 'kaput': 'пальто',
      'Haljina': 'Платье', 'haljina': 'платье',
      'Odelo': 'Костюм', 'odelo': 'костюм',
      'Odela': 'Костюмы', 'odela': 'костюмы',
      'Suknja': 'Юбка', 'suknja': 'юбка',
      'Pantalone': 'Брюки', 'pantalone': 'брюки',
      'Košulja': 'Рубашка', 'košulja': 'рубашка',
      'Ručni rad': 'Ручная работа', 'ručni rad': 'ручная работа',
      'ručni rad.': 'ручная работа.',
      'unikat': 'уникальное изделие', 'Unikat': 'Уникальное изделие',
      'Taft': 'Тафта', 'taft': 'тафта',
      'Taft svila': 'Шелковая тафта', 'taft svila': 'шелковая тафта',
      'Taft svile': 'Шелковой тафты', 'taft svile': 'шелковой тафты',
      'svila': 'шелк', 'Svila': 'Шелк',
      'svile': 'шелка',
      'perje': 'перья', 'Perje': 'Перья',
      'sa perjem': 'со страусиными перьями',
      'sa pojasom': 'с поясом',
      'od vune': 'из шерсти', 'vuna': 'шерсть', 'Vuna': 'Шерсть',
      'kašmir': 'кашемир', 'Kašmir': 'Кашемир',
      'postava': 'подкладка',
      'viskoza': 'вискоза',
      'pamuk': 'хлопок',
      'Hemijsko čišćenje': 'Сухая чистка',
      'ekskluzivno': 'эксклюзивно',
      'Ekskluzivno': 'Эксклюзивно',
    }
  };

  const words = lang === 'en' ? wordMap.en : wordMap.ru;
  const sortedKeys = Object.keys(words).sort((a, b) => b.length - a.length);
  
  for (const key of sortedKeys) {
    const replacement = words[key];
    const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedKey, 'gi');
    result = result.replace(regex, (match) => {
      if (match === match.toUpperCase()) return replacement.toUpperCase();
      if (match[0] === match[0].toUpperCase()) return replacement[0].toUpperCase() + replacement.slice(1);
      return replacement;
    });
  }

  return result;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const cached = localStorage.getItem('dd_language');
    if (cached === 'sr' || cached === 'en' || cached === 'ru') {
      return cached;
    }
    return 'sr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('dd_language', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['sr']?.[key] || key;
  };

  const translateColorName = (colorName: string): string => {
    if (!colorName) return '';
    return colorTranslations[language]?.[colorName] || colorTranslations['sr']?.[colorName] || colorName;
  };

  const translateSizeName = (sizeName: string): string => {
    if (!sizeName) return '';
    return sizeTranslations[language]?.[sizeName] || sizeTranslations['sr']?.[sizeName] || sizeName;
  };

  const translateCategoryName = (name: string): string => {
    if (!name) return '';
    return categoryTranslations[language]?.[name] || categoryTranslations['sr']?.[name] || name;
  };

  const translateCategory = (cat: any): any => {
    if (!cat) return cat;
    return {
      ...cat,
      name: translateCategoryName(cat.name)
    };
  };

  const translateProduct = (product: any): any => {
    if (!product) return product;
    
    const translatedSizes = product.sizes?.map((size: any) => ({
      ...size,
      name: translateSizeName(size.name)
    })) || [];

    const translatedColors = product.colors?.map((color: any) => ({
      ...color,
      name: translateColorName(color.name)
    })) || [];

    return {
      ...product,
      name: translateTextDynamically(product.name, language),
      description: translateTextDynamically(product.description, language),
      category: translateCategoryName(product.category),
      sizes: translatedSizes,
      colors: translatedColors
    };
  };

  const formatCurrency = (price: number): string => {
    const symbol = t('product.currencySymbol');
    if (language === 'ru') {
      // Approximate RSD (din) to RUB (approx 1 RSD = ~0.85 RUB or similar, but typically shops keep same number or convert. Let's just suffix with rubles or keep exact values as custom currency)
      return `${price.toLocaleString()} ${symbol}`;
    }
    return `${price.toLocaleString()} ${symbol}`;
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      translateProduct, 
      translateCategory, 
      translateCategoryName,
      translateColorName,
      translateSizeName,
      formatCurrency
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
