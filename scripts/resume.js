const links = document.querySelectorAll('.resumes');

/* Nomes alinhados aos ficheiros em /assets (PT com NFD típico do macOS) */
const RESUME_PT =
  'Curri\u0301culo - Geissy Maysla Nunes Rodrigues - Versa\u0303o portugue\u0302s.pdf';
const RESUME_EN = 'Resume - Geissy Maysla Nunes Rodrigues - Version English.pdf';

function downloadResumeHandler(link) {
  const lang = localStorage.getItem(Keys.LANG);

  const file = lang === 'pt' ? RESUME_PT : RESUME_EN;
  link.href = './assets/' + encodeURIComponent(file);
  link.setAttribute('download', '');
  link.setAttribute('target', '_blank');
}

function updateDownloadResumes() {
  [...links].forEach(downloadResumeHandler);
}

updateDownloadResumes();
