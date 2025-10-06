document.getElementById("criar").addEventListener("click", function () {
    const disciplina = document.getElementById("disciplina").value.trim();
    const turma = document.getElementById("turma").value.trim();

    if (disciplina === "" || turma === "") {
        alert("Por favor, preencha todos os campos antes de criar a disciplina.");
    } else {
        alert(`Disciplina "${disciplina}" (turma ${turma}) criada com sucesso!`);
    }
});

document.getElementById("voltar").addEventListener("click", function () {
    window.history.back();
});
