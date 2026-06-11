const links = document.querySelectorAll('.resumes');

const RESUMES = {
  pt: {
    href: './assets/resume-pt.pdf',
    download: 'Curr\u00edculo - Geissy Maysla | Product Desiner.pdf',
  },
  en: {
    href: './assets/resume-en.pdf',
    download: 'Curr\u00edculo - Geissy Maysla | Product Designer:English.pdf',
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
