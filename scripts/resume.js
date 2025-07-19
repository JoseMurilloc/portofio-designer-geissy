const links = document.getElementsByClassName('resumes')

function downloadResumeHandler(link) {
  const lang = localStorage.getItem(Keys.LANG);

  const pdfUrl = lang === 'pt' 
    ? './assets/Currículo - Geissy Maysla Nunes Rodrigues.pdf' 
    : './assets/Resume - Geissy Maysla Nunes Rodrigues.pdf' 

  link.href = pdfUrl;
  link.setAttribute('download','');
  link.setAttribute('target','_blank');
}

function updateDownloadResumes () {
  [...links].forEach(downloadResumeHandler);
}

updateDownloadResumes();