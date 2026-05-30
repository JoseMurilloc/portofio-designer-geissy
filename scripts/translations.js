const langElementButtons = document.querySelectorAll('.lang-button')
const switches = document.querySelectorAll('.switch')
const toggleThumbs = document.querySelectorAll('.toggle-thumb')


const switchElementButtons = [...switches]
const toggleThumbElementDivs = [...toggleThumbs]

const Keys = {
  LANG: 'SELECT_LANG'
}

const aboutPhotoImages = {
  en: {
    about_photo_front: './images/about-photo-front-en.png',
    about_photo_front_mobile: './images/about-photo-front-mobile-en.png',
    about_photo_back_mobile: './images/about-mobile-back.png',
    about_photo_back_desktop: './images/photo-about-back.png',
  },
  pt: {
    about_photo_front: './images/about-photo-front-pt.png',
    about_photo_front_mobile: './images/about-photo-front-mobile-pt.png',
    about_photo_back_mobile: './images/about-photo-back-mobile-pt.png',
    about_photo_back_desktop: './images/about-photo-back-pt.png',
  },
}

function updateAboutPhotoImages(lang) {
  document.querySelectorAll('[data-i18n-img]').forEach((img) => {
    const key = img.getAttribute('data-i18n-img')
    const src = aboutPhotoImages[lang]?.[key]
    if (src) img.src = src
  })
}

function changeLanguage(lang, callbackUpdateDownloadResumes) {
  /**
   * 📃 Armazena nova lang selecionada.
   */
  localStorage.setItem(Keys.LANG, lang);

  callbackUpdateDownloadResumes?.();

  const prevLanguageState = (() => {
    if (lang === 'pt') {
      return 'en'
    } 

    return 'pt'
  })()

  const classes = {
    pt: {
      switch: 'switch-pt',
      toggle: 'toggle-thumb-pt',
    },
    en: {
      switch: 'switch-en',
      toggle: 'toggle-thumb-en',
    }
  };

  const prevClasses = classes[prevLanguageState];
  const nextClasses = classes[lang];

  /**
   * 🎉 Mudas todos as tags com atributos de internacionalização
   */
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    element.textContent = translations[lang][key] || key;
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    const key = element.getAttribute("data-i18n-aria");
    const value = translations[lang][key];
    if (value) element.setAttribute("aria-label", value);
  });

  if (typeof window.syncAboutLearnMoreButton === 'function') {
    window.syncAboutLearnMoreButton(lang);
  }

  updateAboutPhotoImages(lang)

  /** 
   * 🎉 Toggle classes
   */
  toggleThumbElementDivs.map(toggleTumbler => toggleTumbler.classList.remove(prevClasses.toggle))  
  switchElementButtons.map(switchElementButton => switchElementButton.classList.remove(prevClasses.switch))
  
  toggleThumbElementDivs.map(toggleTumbler => toggleTumbler.classList.add(nextClasses.toggle))
  switchElementButtons.map(switchElementButton => switchElementButton.classList.add(nextClasses.switch))
}

langElementButtons.forEach(button => {
  button.onclick = () => {
    const currentLanguage = localStorage.getItem(Keys.LANG);
  
    const browserLang = currentLanguage === 'pt' ? 'en' : 'pt';
  
    changeLanguage(browserLang, updateDownloadResumes);
  }

})

function inicializeSelectFlag () {
  const LANGUAGE_GUARD_BROWSER = localStorage.getItem(Keys.LANG) || 'en';

  switchElementButtons.map(switchElementButton => switchElementButton.classList.add('switch-' + LANGUAGE_GUARD_BROWSER))
  toggleThumbElementDivs.map(toggleTumbler => toggleTumbler.classList.add('toggle-thumb-' + LANGUAGE_GUARD_BROWSER))

  changeLanguage(LANGUAGE_GUARD_BROWSER);
}

inicializeSelectFlag()