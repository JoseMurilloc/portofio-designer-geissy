const links = document.querySelectorAll('.resumes');

/* Files in /assets (plain ASCII names, so no Unicode-normalization issues) */
const RESUME_PT = 'curriculo-product-designer-geissy.pdf';
const RESUME_EN = 'resume-product-designer-geissy.pdf';

function downloadResumeHandler(link) {
  const lang = localStorage.getItem(Keys.LANG);

  const file = lang === 'pt' ? RESUME_PT : RESUME_EN;
  link.href = './assets/' + encodeURIComponent(file) + '?v=2';
  link.setAttribute('download', '');
  link.setAttribute('target', '_blank');
}

function updateDownloadResumes() {
  [...links].forEach(downloadResumeHandler);
}

updateDownloadResumes();
