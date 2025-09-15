const timerEl = document.getElementById('timer');

let countdown; // variável global para controlar o timer
startCountdown();

// Função para iniciar contagem regressiva
function startCountdown() {
  let timeLeft = 60;
  timerEl.textContent = `Reenviar código em ${timeLeft}s`;

  countdown = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) {
      timerEl.textContent = `Reenviar código em ${timeLeft}s`;
    } else {
      clearInterval(countdown);
      timerEl.innerHTML = `<button id="resend-btn" class="resend-btn">Reenviar código</button>`;

      // Ativa o botão "Reenviar código"
      document.getElementById('resend-btn').addEventListener('click', () => {
        alert('Novo código enviado para seu email!');
        startCountdown(); // reinicia a contagem
      });
    }
  }, 1000);
}