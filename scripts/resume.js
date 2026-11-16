const links = document.querySelectorAll('.resumes');

/* Files in /assets (plain ASCII names) and the name each one downloads as */
const RESUMES = {
  pt: {
    href: './assets/curriculo-product-designer-geissy.pdf?v=2',
    download: 'Currículo - Geissy Nunes | Product Designer.pdf',
  },
  en: {
    href: './assets/resume-product-designer-geissy.pdf?v=2',
    download: 'Resume - Geissy Nunes | Product Designer.pdf',
  },
};

function downloadResumeHandler(link) {
  const lang = localStorage.getItem(Keys.LANG) || 'en';
  const resume = RESUMES[lang === 'pt' ? 'pt' : 'en'];

  link.href = resume.href;
  link.setAttribute('download', resume.download);
  link.setAttribute('target', '_blank');
}

function updateDownloadResumes() {
  [...links].forEach(downloadResumeHandler);
}

updateDownloadResumes();
