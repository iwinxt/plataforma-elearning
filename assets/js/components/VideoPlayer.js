// VideoPlayer.js - Componente do player de vídeo customizado

const VideoPlayer = {
    // Instância atual
    _instance: null,
    
    // Renderizar player
    render(lessonId, options = {}) {
        return `
            <div class="video-player" 
                 id="video-player-container"
                 data-lesson-id="${lessonId}">
                
                <!-- Elemento de vídeo -->
                <video 
                    id="main-video"
                    class="video-player-video"
                    preload="metadata"
                    playsinline
                    crossorigin="anonymous">
                </video>
                
                <!-- Overlay gradiente -->
                <div class="video-player-overlay"></div>
                
                <!-- Loading spinner -->
                <div class="video-player-loading" id="video-loading" 
                     style="display: none"></div>
                
                <!-- Centro: botão play/pause -->
                <div class="video-player-center-play" id="center-play-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                         viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </div>
                
                <!-- Controles -->
                <div class="video-player-controls" id="video-controls">
                    
                    <!-- Progress bar -->
                    <div class="video-player-progress-container" 
                         id="video-progress-container">
                        <div class="video-player-progress-buffered" 
                             id="video-buffered"></div>
                        <div class="video-player-progress-played" 
                             id="video-progress">
                            <div class="video-player-progress-handle"></div>
                        </div>
                        <div class="video-player-progress-tooltip" 
                             id="progress-tooltip">0:00</div>
                    </div>
                    
                    <!-- Controls row -->
                    <div class="video-player-controls-row">
                        
                        <!-- Play/Pause -->
                        <button class="video-player-btn video-player-btn-play" 
                                id="play-pause-btn"
                                aria-label="Play/Pause"
                                title="Play/Pause (Espaço)">
                            <svg id="play-icon" xmlns="http://www.w3.org/2000/svg" 
                                 viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                            <svg id="pause-icon" xmlns="http://www.w3.org/2000/svg" 
                                 viewBox="0 0 24 24" fill="currentColor" 
                                 style="display:none">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                            </svg>
                        </button>
                        
                        <!-- Skip backward -->
                        <button class="video-player-btn" 
                                id="skip-back-btn"
                                aria-label="Voltar 10 segundos"
                                title="Voltar 10s (←)">
                            <svg xmlns="http://www.w3.org/2000/svg" 
                                 viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                                <text x="12" y="14" text-anchor="middle" 
                                      font-size="6" fill="currentColor">10</text>
                            </svg>
                        </button>
                        
                        <!-- Skip forward -->
                        <button class="video-player-btn" 
                                id="skip-forward-btn"
                                aria-label="Avançar 10 segundos"
                                title="Avançar 10s (→)">
                            <svg xmlns="http://www.w3.org/2000/svg" 
                                 viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
                                <text x="12" y="14" text-anchor="middle" 
                                      font-size="6" fill="currentColor">10</text>
                            </svg>
                        </button>
                        
                        <!-- Volume -->
                        <div class="video-player-volume">
                            <button class="video-player-btn" 
                                    id="mute-btn"
                                    aria-label="Mudo"
                                    title="Mudo (M)">
                                <svg id="volume-icon" xmlns="http://www.w3.org/2000/svg" 
                                     viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                                </svg>
                                <svg id="mute-icon" xmlns="http://www.w3.org/2000/svg" 
                                     viewBox="0 0 24 24" fill="currentColor" 
                                     style="display:none">
                                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                                </svg>
                            </button>
                            <div class="video-player-volume-slider" id="volume-slider">
                                <div class="video-player-volume-slider-fill" 
                                     id="volume-fill" 
                                     style="width: 100%">
                                </div>
                            </div>
                        </div>
                        
                        <!-- Time display -->
                        <span class="video-player-time" id="time-display">
                            0:00 / 0:00
                        </span>
                        
                        <!-- Spacer -->
                        <div class="video-player-spacer"></div>
                        
                        <!-- Settings (velocidade) -->
                        <div class="video-player-settings" id="settings-menu">
                            <button class="video-player-btn" 
                                    id="settings-btn"
                                    aria-label="Configurações">
                                <svg xmlns="http://www.w3.org/2000/svg" 
                                     viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                                </svg>
                            </button>
                            <div class="video-player-settings-menu" id="settings-dropdown">
                                <div style="padding: var(--spacing-sm); 
                                            color: rgba(255,255,255,0.6); 
                                            font-size: var(--text-xs);
                                            text-transform: uppercase;
                                            letter-spacing: 0.05em">
                                    Velocidade
                                </div>
                                ${APP_CONFIG.VIDEO_PLAYBACK_SPEEDS.map(speed => `
                                    <div class="video-player-settings-item ${speed === 1 ? 'active' : ''}"
                                         data-speed="${speed}"
                                         onclick="VideoPlayer.setSpeed(${speed})">
                                        ${speed === 1 ? 'Normal' : speed + 'x'}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Fullscreen -->
                        <button class="video-player-btn" 
                                id="fullscreen-btn"
                                aria-label="Tela cheia"
                                title="Tela cheia (F)">
                            <svg id="fullscreen-icon" xmlns="http://www.w3.org/2000/svg" 
                                 viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                            </svg>
                            <svg id="exit-fullscreen-icon" xmlns="http://www.w3.org/2000/svg" 
                                 viewBox="0 0 24 24" fill="currentColor" 
                                 style="display:none">
                                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Inicializar player após renderização
    async init(lessonId) {
        const container = document.getElementById('video-player-container');
        const videoElement = document.getElementById('main-video');
        
        if (!container || !videoElement) return;
        
        // Inicializar serviço
        VideoService.init(videoElement, lessonId);
        
        // Carregar vídeo
        await VideoService.loadVideo(lessonId);
        
        // Inicializar controles
        this.initControls(container, videoElement);
        
        // Auto-hide controls
        this.initAutoHide(container);
        
        // Double click para fullscreen
        videoElement.addEventListener('dblclick', () => {
            VideoService.toggleFullscreen();
        });
    },
    
    // Inicializar controles
    initControls(container, videoElement) {
        // Play/Pause button
        const playPauseBtn = document.getElementById('play-pause-btn');
        const centerPlayBtn = document.getElementById('center-play-btn');
        const playIcon = document.getElementById('play-icon');
        const pauseIcon = document.getElementById('pause-icon');
        
        [playPauseBtn, centerPlayBtn].forEach(btn => {
            btn?.addEventListener('click', (e) => {
                e.stopPropagation();
                VideoService.togglePlay();
            });
        });
        
        // Sincronizar ícone play/pause
        EventBus.on(APP_EVENTS.VIDEO_PLAY, () => {
            playIcon && (playIcon.style.display = 'none');
            pauseIcon && (pauseIcon.style.display = 'block');
            container.classList.remove('paused');
        });
        
        EventBus.on(APP_EVENTS.VIDEO_PAUSE, () => {
            playIcon && (playIcon.style.display = 'block');
            pauseIcon && (pauseIcon.style.display = 'none');
            container.classList.add('paused');
        });
        
        // Skip buttons
        document.getElementById('skip-back-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            VideoService.seekBackward(10);
        });
        
        document.getElementById('skip-forward-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            VideoService.seekForward(10);
        });
        
        // Progress bar
        this.initProgressBar();
        
        // Volume
        this.initVolumeControl();
        
        // Time display
        EventBus.on(APP_EVENTS.VIDEO_TIME_UPDATE, ({ currentTime, duration }) => {
            const display = document.getElementById('time-display');
            if (display) {
                display.textContent = `${Formatters.duration(currentTime)} / ${Formatters.duration(duration)}`;
            }
            
            // Update progress bar
            const progress = document.getElementById('video-progress');
            if (progress && duration > 0) {
                progress.style.width = `${(currentTime / duration) * 100}%`;
            }
        });
        
        // Settings
        const settingsBtn = document.getElementById('settings-btn');
        const settingsMenu = document.getElementById('settings-menu');
        
        settingsBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsMenu?.classList.toggle('open');
        });
        
        document.addEventListener('click', () => {
            settingsMenu?.classList.remove('open');
        });
        
        // Fullscreen
        document.getElementById('fullscreen-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            VideoService.toggleFullscreen();
        });
        
        document.addEventListener('fullscreenchange', () => {
            const isFullscreen = !!document.fullscreenElement;
            const fsIcon = document.getElementById('fullscreen-icon');
            const exitIcon = document.getElementById('exit-fullscreen-icon');
            
            if (fsIcon) fsIcon.style.display = isFullscreen ? 'none' : 'block';
            if (exitIcon) exitIcon.style.display = isFullscreen ? 'block' : 'none';
        });
        
        // Loading state
        EventBus.on('video:loading', (loading) => {
            const spinner = document.getElementById('video-loading');
            if (spinner) spinner.style.display = loading ? 'block' : 'none';
        });
    },
    
    // Inicializar barra de progresso
    initProgressBar() {
        const progressContainer = document.getElementById('video-progress-container');
        const tooltip = document.getElementById('progress-tooltip');
        
        if (!progressContainer) return;
        
        progressContainer.addEventListener('click', (e) => {
            const rect = progressContainer.getBoundingClientRect();
            const percentage = (e.clientX - rect.left) / rect.width;
            const duration = VideoService.getState().duration;
            
            VideoService.seek(percentage * duration);
        });
        
        progressContainer.addEventListener('mousemove', (e) => {
            const rect = progressContainer.getBoundingClientRect();
            const percentage = (e.clientX - rect.left) / rect.width;
            const duration = VideoService.getState().duration;
            const hoverTime = percentage * duration;
            
            if (tooltip) {
                tooltip.textContent = Formatters.duration(hoverTime);
                tooltip.style.left = `${e.clientX - rect.left}px`;
            }
            
            // Update buffered
            const buffered = document.getElementById('video-buffered');
            const state = VideoService.getState();
            if (buffered && state.duration > 0) {
                buffered.style.width = `${(state.buffered / state.duration) * 100}%`;
            }
        });
    },
    
    // Inicializar controle de volume
    initVolumeControl() {
        const volumeSlider = document.getElementById('volume-slider');
        const volumeFill = document.getElementById('volume-fill');
        const muteBtn = document.getElementById('mute-btn');
        const volumeIcon = document.getElementById('volume-icon');
        const muteIcon = document.getElementById('mute-icon');
        
        muteBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            VideoService.toggleMute();
        });
        
        volumeSlider?.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = volumeSlider.getBoundingClientRect();
            const volume = (e.clientX - rect.left) / rect.width;
            VideoService.setVolume(volume);
        });
        
        // Sincronizar ícone de volume
        const updateVolumeIcon = () => {
            const state = VideoService.getState();
            if (volumeIcon) volumeIcon.style.display = state.isMuted ? 'none' : 'block';
            if (muteIcon) muteIcon.style.display = state.isMuted ? 'block' : 'none';
            if (volumeFill) volumeFill.style.width = state.isMuted ? '0%' : `${state.volume * 100}%`;
        };
        
        EventBus.on(APP_EVENTS.VIDEO_PLAY, updateVolumeIcon);
        EventBus.on(APP_EVENTS.VIDEO_PAUSE, updateVolumeIcon);
    },
    
    // Auto-hide controls
    initAutoHide(container) {
        let hideTimer;
        
        const showControls = () => {
            container.classList.add('controls-visible');
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => {
                if (VideoService.getState().isPlaying) {
                    container.classList.remove('controls-visible');
                }
            }, 3000);
        };
        
        container.addEventListener('mousemove', showControls);
        container.addEventListener('touchstart', showControls);
    },
    
    // Definir velocidade
    setSpeed(speed) {
        VideoService.setPlaybackSpeed(speed);
        
        // Atualizar UI
        document.querySelectorAll('[data-speed]').forEach(item => {
            item.classList.toggle('active', parseFloat(item.dataset.speed) === speed);
        });
    },
    
    // Destruir player
    destroy() {
        VideoService.destroy();
    }
};