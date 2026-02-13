// QuizEngine.js - Engine de Quiz interativo

const QuizEngine = {
    // Estado atual do quiz
    _state: {
        quizId: null,
        questions: [],
        currentIndex: 0,
        answers: {},
        startTime: null,
        endTime: null,
        submitted: false,
        results: null,
        timeLimit: null,
        timeElapsed: 0
    },
    
    // Timer do quiz
    _timer: null,
    
    // Renderizar quiz
    render(quiz, options = {}) {
        if (!quiz) return '<p>Quiz não encontrado.</p>';
        
        this.resetState();
        
        this._state.quizId = quiz.id;
        this._state.questions = quiz.questions || [];
        this._state.startTime = Date.now();
        this._state.timeLimit = options.timeLimit || null;
        
        if (this._state.timeLimit) {
            this.startTimer();
        }
        
        return `
            <div class="quiz-container" id="quiz-container-${quiz.id}">
                <!-- Quiz Header -->
                <div class="quiz-header">
                    <div class="quiz-header-info">
                        <h3 class="quiz-title">${Validators.sanitize(quiz.title)}</h3>
                        <p class="quiz-meta text-secondary text-sm">
                            ${this._state.questions.length} questões
                            ${quiz.passing_score
                                ? ` • Nota mínima: ${quiz.passing_score}%`
                                : ''
                            }
                        </p>
                    </div>
                    
                    ${this._state.timeLimit ? `
                        <div class="quiz-timer" id="quiz-timer">
                            <svg xmlns="http://www.w3.org/2000/svg" 
                                 fill="none" viewBox="0 0 24 24" 
                                 stroke="currentColor" width="16" height="16">
                                <path stroke-linecap="round" stroke-linejoin="round" 
                                      stroke-width="2" 
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span id="timer-display">
                                ${Formatters.duration(this._state.timeLimit)}
                            </span>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Progress -->
                <div class="quiz-progress">
                    ${ProgressBar.createWithLabel({
                        percentage: 0,
                        label: `Questão 1 de ${this._state.questions.length}`,
                        showPercentage: false,
                        size: 'sm'
                    })}
                </div>
                
                <!-- Questions Container -->
                <div class="quiz-questions" id="quiz-questions">
                    ${this.renderQuestion(0)}
                </div>
                
                <!-- Navigation -->
                <div class="quiz-navigation" id="quiz-navigation">
                    <button 
                        class="btn btn-secondary" 
                        id="quiz-prev-btn"
                        onclick="QuizEngine.goToPrevious()"
                        style="display: none"
                        disabled>
                        ← Anterior
                    </button>
                    
                    <div class="quiz-question-dots" id="quiz-dots">
                        ${this._state.questions.map((_, i) => `
                            <button 
                                class="quiz-dot ${i === 0 ? 'active' : ''}"
                                onclick="QuizEngine.goToQuestion(${i})"
                                aria-label="Questão ${i + 1}"
                                title="Questão ${i + 1}">
                            </button>
                        `).join('')}
                    </div>
                    
                    <button 
                        class="btn btn-primary" 
                        id="quiz-next-btn"
                        onclick="QuizEngine.goToNext()">
                        Próxima →
                    </button>
                </div>
            </div>
        `;
    },
    
    // Renderizar questão individual
    renderQuestion(index) {
        const question = this._state.questions[index];
        if (!question) return '';
        
        const answer = this._state.answers[question.id];
        
        return `
            <div class="quiz-question" 
                 id="question-${question.id}"
                 data-question-index="${index}">
                
                <div class="quiz-question-number text-sm text-tertiary mb-sm">
                    Questão ${index + 1} de ${this._state.questions.length}
                </div>
                
                <h4 class="quiz-question-text">
                    ${Validators.sanitize(question.question)}
                </h4>
                
                <div class="quiz-options" id="options-${question.id}">
                    ${this.renderOptions(question, answer)}
                </div>
                
                ${this._state.submitted ? this.renderFeedback(question, answer) : ''}
            </div>
        `;
    },
    
    // Renderizar opções por tipo
    renderOptions(question, selectedAnswer) {
        switch (question.type) {
            case APP_CONFIG.QUIZ_QUESTION_TYPES.MULTIPLE_CHOICE:
                return this.renderMultipleChoice(question, selectedAnswer);
            case APP_CONFIG.QUIZ_QUESTION_TYPES.TRUE_FALSE:
                return this.renderTrueFalse(question, selectedAnswer);
            case APP_CONFIG.QUIZ_QUESTION_TYPES.ESSAY:
                return this.renderEssay(question, selectedAnswer);
            default:
                return this.renderMultipleChoice(question, selectedAnswer);
        }
    },
    
    // Renderizar múltipla escolha
    renderMultipleChoice(question, selectedAnswer) {
        return question.options.map((option, index) => {
            const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
            const isSelected = selectedAnswer === option;
            const isCorrect = this._state.submitted &&
                option === question.correct_answer;
            const isWrong = this._state.submitted &&
                isSelected && option !== question.correct_answer;
            
            let optionClass = 'quiz-option';
            if (isSelected) optionClass += ' selected';
            if (isCorrect && this._state.submitted) optionClass += ' correct';
            if (isWrong) optionClass += ' wrong';
            
            return `
                <button 
                    class="${optionClass}"
                    onclick="QuizEngine.selectAnswer('${question.id}', '${Validators.sanitize(option)}')"
                    ${this._state.submitted ? 'disabled' : ''}
                    data-option="${Validators.sanitize(option)}">
                    <span class="quiz-option-letter">${optionLetter}</span>
                    <span class="quiz-option-text">
                        ${Validators.sanitize(option)}
                    </span>
                    ${this._state.submitted ? `
                        <span class="quiz-option-icon">
                            ${isCorrect ? '✅' : isWrong ? '❌' : ''}
                        </span>
                    ` : ''}
                </button>
            `;
        }).join('');
    },
    
    // Renderizar verdadeiro/falso
    renderTrueFalse(question, selectedAnswer) {
        return ['Verdadeiro', 'Falso'].map(option => {
            const isSelected = selectedAnswer === option;
            const isCorrect = this._state.submitted &&
                option === question.correct_answer;
            const isWrong = this._state.submitted &&
                isSelected && option !== question.correct_answer;
            
            let optionClass = 'quiz-option quiz-option-tf';
            if (isSelected) optionClass += ' selected';
            if (isCorrect && this._state.submitted) optionClass += ' correct';
            if (isWrong) optionClass += ' wrong';
            
            return `
                <button 
                    class="${optionClass}"
                    onclick="QuizEngine.selectAnswer('${question.id}', '${option}')"
                    ${this._state.submitted ? 'disabled' : ''}>
                    ${option === 'Verdadeiro' ? '✓' : '✗'} ${option}
                </button>
            `;
        }).join('');
    },
    
    // Renderizar dissertativa
    renderEssay(question, savedAnswer) {
        return `
            <div class="quiz-essay">
                <textarea 
                    class="form-textarea"
                    id="essay-${question.id}"
                    placeholder="Digite sua resposta aqui..."
                    rows="6"
                    maxlength="2000"
                    ${this._state.submitted ? 'disabled' : ''}
                    oninput="QuizEngine.saveEssayAnswer('${question.id}', this.value)"
                >${savedAnswer || ''}</textarea>
                <div class="quiz-essay-counter text-xs text-tertiary text-right mt-xs">
                    <span id="essay-count-${question.id}">
                        ${(savedAnswer || '').length}
                    </span>/2000 caracteres
                </div>
            </div>
        `;
    },
    
    // Renderizar feedback pós-submissão
    renderFeedback(question, answer) {
        if (!question.explanation) return '';
        
        const isCorrect = answer === question.correct_answer;
        
        return `
            <div class="quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}">
                <div class="quiz-feedback-icon">
                    ${isCorrect ? '✅' : '❌'}
                </div>
                <div class="quiz-feedback-content">
                    <p class="quiz-feedback-status font-semibold">
                        ${isCorrect ? 'Correto!' : 'Incorreto'}
                    </p>
                    <p class="quiz-feedback-explanation text-sm">
                        ${Validators.sanitize(question.explanation)}
                    </p>
                </div>
            </div>
        `;
    },
    
    // Renderizar resultado final
    renderResults(results) {
        const { score, passed, correct, total, answers } = results;
        
        return `
            <div class="quiz-results">
                <div class="quiz-results-header">
                    <div class="quiz-results-icon">
                        ${passed ? '🎉' : '📚'}
                    </div>
                    <h3 class="quiz-results-title">
                        ${passed ? 'Parabéns! Você passou!' : 'Não foi dessa vez...'}
                    </h3>
                    <p class="quiz-results-subtitle text-secondary">
                        ${passed
                            ? 'Excelente desempenho no quiz!'
                            : 'Revise o conteúdo e tente novamente.'
                        }
                    </p>
                </div>
                
                <div class="quiz-results-score">
                    ${ProgressBar.createCircular({
                        percentage: score,
                        size: 140,
                        strokeWidth: 10
                    })}
                </div>
                
                <div class="quiz-results-stats">
                    <div class="quiz-results-stat">
                        <span class="quiz-results-stat-value text-success">
                            ${correct}
                        </span>
                        <span class="quiz-results-stat-label">Corretas</span>
                    </div>
                    <div class="quiz-results-stat">
                        <span class="quiz-results-stat-value text-error">
                            ${total - correct}
                        </span>
                        <span class="quiz-results-stat-label">Incorretas</span>
                    </div>
                    <div class="quiz-results-stat">
                        <span class="quiz-results-stat-value">
                            ${Formatters.duration(
                                (this._state.endTime - this._state.startTime) / 1000
                            )}
                        </span>
                        <span class="quiz-results-stat-label">Tempo</span>
                    </div>
                </div>
                
                <div class="quiz-results-actions">
                    ${!passed ? `
                        <button 
                            class="btn btn-outline"
                            onclick="QuizEngine.retry()">
                            🔄 Tentar novamente
                        </button>
                    ` : ''}
                    <button 
                        class="btn btn-secondary"
                        onclick="QuizEngine.reviewAnswers()">
                        📋 Revisar respostas
                    </button>
                    <button 
                        class="btn btn-primary"
                        onclick="EventBus.emit('lesson:request-next')">
                        Continuar →
                    </button>
                </div>
            </div>
        `;
    },
    
    // Selecionar resposta
    selectAnswer(questionId, answer) {
        if (this._state.submitted) return;
        
        this._state.answers[questionId] = answer;
        
        // Atualizar UI das opções
        const optionsContainer = document.getElementById(`options-${questionId}`);
        if (optionsContainer) {
            optionsContainer.querySelectorAll('.quiz-option').forEach(option => {
                option.classList.toggle(
                    'selected',
                    option.dataset.option === answer
                );
            });
        }
        
        // Atualizar dot da questão atual
        this.updateQuestionDot(this._state.currentIndex, 'answered');
        
        // Verificar se todas foram respondidas
        this.updateSubmitButton();
    },
    
    // Salvar resposta dissertativa
    saveEssayAnswer(questionId, value) {
        this._state.answers[questionId] = value;
        
        const counter = document.getElementById(`essay-count-${questionId}`);
        if (counter) counter.textContent = value.length;
        
        this.updateQuestionDot(this._state.currentIndex, value ? 'answered' : '');
        this.updateSubmitButton();
    },
    
    // Ir para próxima questão
    goToNext() {
        const isLastQuestion =
            this._state.currentIndex === this._state.questions.length - 1;
        
        if (isLastQuestion) {
            this.confirmSubmit();
        } else {
            this.goToQuestion(this._state.currentIndex + 1);
        }
    },
    
    // Ir para questão anterior
    goToPrevious() {
        if (this._state.currentIndex > 0) {
            this.goToQuestion(this._state.currentIndex - 1);
        }
    },
    
    // Navegar para questão específica
    goToQuestion(index) {
        if (index < 0 || index >= this._state.questions.length) return;
        
        this._state.currentIndex = index;
        
        // Atualizar conteúdo
        const questionsContainer = document.getElementById('quiz-questions');
        if (questionsContainer) {
            questionsContainer.innerHTML = this.renderQuestion(index);
        }
        
        // Atualizar progress bar
        const progressEl = document.querySelector('.progress-with-label');
        if (progressEl) {
            const percentage = Math.round(
                (index / (this._state.questions.length - 1)) * 100
            );
            
            progressEl.innerHTML = ProgressBar.createWithLabel({
                percentage,
                label: `Questão ${index + 1} de ${this._state.questions.length}`,
                showPercentage: false,
                size: 'sm'
            });
        }
        
        // Atualizar botões de navegação
        this.updateNavigationButtons(index);
        
        // Atualizar dots
        this.updateActiveDot(index);
    },
    
    // Atualizar botões de navegação
    updateNavigationButtons(index) {
        const prevBtn = document.getElementById('quiz-prev-btn');
        const nextBtn = document.getElementById('quiz-next-btn');
        const isLast = index === this._state.questions.length - 1;
        const answeredAll = this.allAnswered();
        
        if (prevBtn) {
            prevBtn.style.display = index === 0 ? 'none' : 'flex';
        }
        
        if (nextBtn) {
            nextBtn.textContent = isLast
                ? (answeredAll ? '✅ Finalizar Quiz' : 'Finalizar Quiz')
                : 'Próxima →';
            
            nextBtn.className = `btn ${isLast && answeredAll
                ? 'btn-success'
                : 'btn-primary'
            }`;
        }
    },
    
    // Atualizar dot ativo
    updateActiveDot(index) {
        document.querySelectorAll('.quiz-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    },
    
    // Atualizar dot de questão
    updateQuestionDot(index, status) {
        const dots = document.querySelectorAll('.quiz-dot');
        if (dots[index]) {
            dots[index].className = `quiz-dot ${status} ${
                index === this._state.currentIndex ? 'active' : ''
            }`;
        }
    },
    
    // Verificar se todas foram respondidas
    allAnswered() {
        return this._state.questions.every(
            q => this._state.answers[q.id] !== undefined
        );
    },
    
    // Atualizar botão de submit
    updateSubmitButton() {
        const isLast =
            this._state.currentIndex === this._state.questions.length - 1;
        
        if (isLast) {
            this.updateNavigationButtons(this._state.currentIndex);
        }
    },
    
    // Confirmar submissão
    async confirmSubmit() {
        const unanswered = this._state.questions.filter(
            q => !this._state.answers[q.id]
        ).length;
        
        if (unanswered > 0) {
            const confirmed = await ModalService.confirm({
                title: 'Finalizar Quiz',
                message: `Você ainda tem ${unanswered} questão(ões) sem resposta. 
                         Deseja finalizar mesmo assim?`,
                confirmLabel: 'Finalizar',
                cancelLabel: 'Continuar respondendo',
                type: 'warning'
            });
            
            if (!confirmed) return;
        }
        
        await this.submit();
    },
    
    // Submeter quiz
    async submit() {
        if (this._state.submitted) return;
        
        this._state.submitted = true;
        this._state.endTime = Date.now();
        
        if (this._timer) {
            clearInterval(this._timer);
        }
        
        const loading = ModalService.loading('Enviando respostas...');
        
        try {
            const response = await API.post(
                API_ENDPOINTS.QUIZ.SUBMIT(this._state.quizId),
                { answers: this._state.answers }
            );
            
            loading.close();
            
            this._state.results = response.data;
            
            // Analytics
            AnalyticsService.track('quiz_submitted', {
                quizId: this._state.quizId,
                score: response.data.score,
                passed: response.data.passed,
                timeSpent: (this._state.endTime - this._state.startTime) / 1000
            });
            
            EventBus.emit(APP_EVENTS.QUIZ_SUBMITTED, response.data);
            
            // Mostrar resultado
            const container = document.getElementById(
                `quiz-container-${this._state.quizId}`
            );
            
            if (container) {
                container.innerHTML = this.renderResults(response.data);
            }
            
            if (response.data.passed) {
                EventBus.emit(APP_EVENTS.QUIZ_COMPLETED, {
                    quizId: this._state.quizId,
                    score: response.data.score
                });
            }
            
        } catch (error) {
            loading.close();
            this._state.submitted = false;
            NotificationService.error('Erro ao enviar respostas. Tente novamente.');
            console.error('Quiz submission error:', error);
        }
    },
    
    // Revisar respostas
    reviewAnswers() {
        this._state.currentIndex = 0;
        this.goToQuestion(0);
        
        // Rolar para o topo do quiz
        const container = document.getElementById(
            `quiz-container-${this._state.quizId}`
        );
        container?.scrollIntoView({ behavior: 'smooth' });
    },
    
    // Tentar novamente
    async retry() {
        const confirmed = await ModalService.confirm({
            title: 'Tentar novamente',
            message: 'Deseja reiniciar o quiz?',
            confirmLabel: 'Sim, reiniciar',
            type: 'primary'
        });
        
        if (!confirmed) return;
        
        try {
            await API.post(API_ENDPOINTS.QUIZ.RETRY(this._state.quizId));
            
            const quizId = this._state.quizId;
            const questions = this._state.questions;
            
            this.resetState();
            
            const container = document.getElementById(
                `quiz-container-${quizId}`
            );
            
            if (container) {
                container.innerHTML = this.render({
                    id: quizId,
                    questions
                });
            }
            
        } catch (error) {
            NotificationService.error('Erro ao reiniciar quiz.');
        }
    },
    
    // Iniciar timer
    startTimer() {
        let remaining = this._state.timeLimit;
        
        this._timer = setInterval(() => {
            remaining -= 1;
            this._state.timeElapsed += 1;
            
            const display = document.getElementById('timer-display');
            if (display) {
                display.textContent = Formatters.duration(remaining);
                
                // Alerta quando estiver acabando
                if (remaining <= 60) {
                    display.style.color = 'var(--color-error)';
                } else if (remaining <= 300) {
                    display.style.color = 'var(--color-warning)';
                }
            }
            
            if (remaining <= 0) {
                clearInterval(this._timer);
                NotificationService.warning('Tempo esgotado! Submetendo respostas...');
                this.submit();
            }
        }, 1000);
    },
    
    // Resetar estado
    resetState() {
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
        }
        
        this._state = {
            quizId: null,
            questions: [],
            currentIndex: 0,
            answers: {},
            startTime: null,
            endTime: null,
            submitted: false,
            results: null,
            timeLimit: null,
            timeElapsed: 0
        };
    }
};