document.addEventListener("DOMContentLoaded", () => {
  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("file-input");
  const dropZoneContent = document.getElementById("drop-zone-content");
  const previewContainer = document.getElementById("preview-container");
  const previewTbody = document.getElementById("preview-tbody");
  const importBtn = document.getElementById("import-btn");

  dropZone.addEventListener("click", () => fileInput.click());

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("border-success");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("border-success");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("border-success");
    const file = e.dataTransfer.files[0];
    handleFile(file);
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    handleFile(file);
  });

  function handleFile(file) {
    if (file) {
      dropZoneContent.innerHTML = `<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><h4 class="mt-3">PROCESSANDO ARQUIVO...</h4>`;

      setTimeout(() => {
        // Simulate file processing
        if (file.name.endsWith(".csv") || file.name.endsWith(".json")) {
          dropZoneContent.innerHTML = `<i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i><h4 class="mt-3 text-success">ARQUIVO PROCESSADO COM SUCESSO</h4>`;
          // Mock data for preview
          const data = [
            { ra: "12345", name: "João Silva", email: "joao@email.com" },
            { ra: "67890", name: "Maria Santos", email: "maria@email.com" },
          ];
          renderPreview(data);
        } else {
          dropZoneContent.innerHTML = `<i class="bi bi-x-circle-fill text-danger" style="font-size: 4rem;"></i><h4 class="mt-3 text-danger">FORMATO DE ARQUIVO NÃO SUPORTADO</h4>`;
        }
      }, 1500);
    }
  }

  function renderPreview(data) {
    previewTbody.innerHTML = "";
    data.forEach((row) => {
      const tr = `<tr><td>${row.ra}</td><td>${row.name}</td><td>${row.email}</td></tr>`;
      previewTbody.innerHTML += tr;
    });
    previewContainer.classList.remove("d-none");
    importBtn.classList.remove("d-none");
  }

  importBtn.addEventListener("click", () => {
    alert("Importação concluída com sucesso!");
    window.location.href = "index.html";
  });
});
