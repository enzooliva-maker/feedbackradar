document.addEventListener('DOMContentLoaded', () => {
    // Selecionando os elementos do DOM
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackList = document.getElementById('feedbackList');
    const successMessage = document.getElementById('successMessage');
    const ctx = document.getElementById('feedbackChart').getContext('2d');

    // Elementos para o sistema de avaliação por estrelas
    const starContainer = document.getElementById('starRatingContainer');
    const stars = document.querySelectorAll('.star');
    const hiddenRatingInput = document.getElementById('userRating');

    let feedbackChart;
    let feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];

    // --- LÓGICA PARA AS ESTRELAS DE AVALIAÇÃO ---

    // Evento para quando o mouse passa por cima de uma estrela
    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            const ratingValue = star.dataset.value;
            highlightStars(ratingValue);
        });

        // Evento de clique para definir a nota
        star.addEventListener('click', () => {
            const ratingValue = star.dataset.value;
            hiddenRatingInput.value = ratingValue; // Define o valor no campo oculto

            // Remove a classe 'selected' de todas para depois reaplicar
            stars.forEach(s => s.classList.remove('selected'));
            highlightStars(ratingValue, true); // Marca as estrelas como selecionadas
        });
    });

    // Evento para quando o mouse sai da área das estrelas
    starContainer.addEventListener('mouseout', () => {
        // Se já houver uma nota clicada, volta a exibir essa nota. Senão, limpa.
        const currentRating = hiddenRatingInput.value;
        if (currentRating) {
            highlightStars(currentRating, true);
        } else {
            stars.forEach(s => s.classList.remove('hover-effect', 'selected'));
        }
    });

    /**
     * Função para iluminar as estrelas até uma certa nota.
     * @param {number} value - O número de estrelas a iluminar (1 a 5).
     * @param {boolean} isSelected - Se verdadeiro, aplica a classe 'selected', senão 'hover-effect'.
     */
    function highlightStars(value, isSelected = false) {
        stars.forEach(star => {
            // Limpa ambos os estados antes de aplicar o novo
            star.classList.remove('hover-effect', 'selected');

            if (star.dataset.value <= value) {
                // Adiciona a classe correta dependendo se é um hover ou um clique definitivo
                star.classList.add(isSelected ? 'selected' : 'hover-effect');
            }
        });
    }

    // --- LÓGICA PRINCIPAL DA APLICAÇÃO (semelhante à anterior) ---

    const render = () => {
        renderFeedbackList();
        renderChart();
    };

    const renderFeedbackList = () => {
        // ... (esta função não precisa de alterações)
        feedbackList.innerHTML = '';
        if (feedbacks.length === 0) {
            feedbackList.innerHTML = '<p class="no-feedback">Ainda não há feedbacks. Seja o primeiro a avaliar!</p>';
            return;
        }
        feedbacks.forEach(fb => {
            const feedbackElement = document.createElement('div');
            feedbackElement.classList.add('feedback-item');
            let borderColor = '#3498db';
            if (fb.rating <= 2) borderColor = '#e74c3c';
            feedbackElement.style.borderLeftColor = borderColor;
            feedbackElement.innerHTML = `
                <h3>
                    ${escapeHTML(fb.name)}
                    <span class="rating" style="background-color: ${borderColor}">${'★'.repeat(fb.rating)}${'☆'.repeat(5 - fb.rating)}</span>
                </h3>
                <p>"${fb.comment ? escapeHTML(fb.comment) : 'Nenhum comentário.'}"</p>
            `;
            feedbackList.appendChild(feedbackElement);
        });
    };

    const renderChart = () => {
        // ... (esta função não precisa de alterações)
        const ratingCounts = [0, 0, 0, 0, 0];
        feedbacks.forEach(fb => {
            ratingCounts[fb.rating - 1]++;
        });
        const chartData = {
            labels: ['Nota 1', 'Nota 2', 'Nota 3', 'Nota 4', 'Nota 5'],
            datasets: [{
                label: 'Número de Feedbacks',
                data: ratingCounts,
                backgroundColor: ['rgba(231, 76, 60, 0.8)', 'rgba(241, 196, 15, 0.8)', 'rgba(52, 152, 219, 0.8)', 'rgba(46, 204, 113, 0.8)', 'rgba(26, 188, 156, 0.8)'],
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        };
        if (feedbackChart) {
            feedbackChart.data = chartData;
            feedbackChart.update();
        } else {
            feedbackChart = new Chart(ctx, {
                type: 'pie',
                data: chartData,
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'top' }, tooltip: { callbacks: { label: (c) => `${c.label}: ${c.raw} (${((c.raw/c.chart.getDatasetMeta(0).total)*100).toFixed(1)}%)` }}}}
            });
        }
    };

    // ATUALIZAÇÃO na validação do formulário
    feedbackForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const userName = document.getElementById('userName').value.trim();
        const userRating = parseInt(hiddenRatingInput.value, 10); // Lê do campo oculto
        const userComment = document.getElementById('userComment').value.trim();

        // Validação para garantir que uma nota foi selecionada
        if (!userName || !userRating) {
            alert('Por favor, preencha seu nome e selecione uma nota clicando nas estrelas.');
            return;
        }

        const newFeedback = { name: userName, rating: userRating, comment: userComment, date: new Date().toISOString() };
        feedbacks.push(newFeedback);
        localStorage.setItem('feedbacks', JSON.stringify(feedbacks));

        // Limpa o formulário e o estado das estrelas
        feedbackForm.reset();
        hiddenRatingInput.value = ''; // Limpa o valor do campo oculto
        stars.forEach(s => s.classList.remove('selected', 'hover-effect')); // Reseta visualmente as estrelas

        showSuccessMessage('Feedback enviado com sucesso!');
        render();
    });

    const showSuccessMessage = (message) => {
        // ... (esta função não precisa de alterações)
        successMessage.textContent = message;
        successMessage.classList.add('show');
        setTimeout(() => successMessage.classList.remove('show'), 3000);
    };

    const escapeHTML = (str) => {
        // ... (esta função não precisa de alterações)
        const p = document.createElement('p');
        p.appendChild(document.createTextNode(str));
        return p.innerHTML;
    };

    render();
});