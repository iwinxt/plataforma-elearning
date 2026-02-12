// video.service.js - Serviço de gerenciamento do player de vídeo

const VideoService = {
    // Referência ao elemento de vídeo
    _videoElement: null,
    
    // Estado atual do player
    _state: {
        isPlaying: false,
        isMuted: false,
        isFullscreen: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        playbackSpeed: 1,
        quality: 'auto',
        buffered: 0,
        isLoading: false,
        hasError: false
    },
    
    // Signed URL atual
    _currentSignedUrl: null,
    _signedUrlExpiresAt: null,
    
    // Timer de renovação de URL
    _urlRenewalTimer: null,
    
    // Timer de progresso
    _progressTimer: null,
    
    // Lesson ID atual
    _currentLessonId: null,
    
    // Inicializar player
    init(videoElement, lessonId) {
        this._videoElement = videoElement;
        this._currentLessonId = lessonId;
        
        this.attachEventListeners();
        this.restorePreferences();
        
        return this;
    },
    
    // Carregar vídeo com signed URL
    async loadVideo(lessonId) {
        try {
            this._currentLessonId = lessonId;
            this.setState({ isLoading: true, hasError: false });
            
            // Buscar signed URL
            const videoData = await CourseService.getVideoUrl(lessonId);
            
            this._currentSignedUrl = videoData.url;
            this._signedUrlExpiresAt = new Date(videoData.expiresAt).getTime();
            
            // Configurar renovação automática da URL
            this.scheduleUrlRenewal(videoData.expiresAt);
            
            // Configurar source do vídeo
            if (this._videoElement) {
                this._videoElement.src = videoData.url;
                
                // Restaurar última posição
                const lastPosition = ProgressService.getLastPosition(lessonId);
                if (lastPosition > 10) {
                    this._videoElement.currentTime = lastPosition;
                }
                
                // Auto-play se configurado
                const autoplay = State.getPreference('autoplay', true);
                if (autoplay) {
                    await this.play();
                }
            }
            
            // Analytics
            AnalyticsService.track('video_load', { lessonId });
            
            return videoData;
            
        } catch (error) {
            this.setState({ isLoading: false, hasError: true });
            console.error('Error loading video:', error);
            throw error;
        }
    },
    
    // Attach event listeners no elemento de vídeo
    attachEventListeners() {
        if (!this._videoElement) return;
        
        const video = this._videoElement;
        
        video.addEventListener('loadedmetadata', () => {
            this.setState({ duration: video.duration, isLoading: false });
        });
        
        video.addEventListener('timeupdate', () => {
            this.setState({ currentTime: video.currentTime });
            
            // Salvar posição
            ProgressService.saveLastPosition(
                this._currentLessonId,
                video.currentTime
            );
            
            // Emitir evento de progresso
            EventBus.emit(APP_EVENTS.VIDEO_TIME_UPDATE, {
                currentTime: video.currentTime,
                duration: video.duration,
                percentage: (video.currentTime / video.duration) * 100
            });
            
            // Atualizar progresso no serviço
            if (this._state.duration > 0) {
                ProgressService.updateVideoProgress(
                    this._currentLessonId,
                    video.currentTime,
                    video.duration
                );
            }
        });
        
        video.addEventListener('play', () => {
            this.setState({ isPlaying: true });
            EventBus.emit(APP_EVENTS.VIDEO_PLAY);
        });
        
        video.addEventListener('pause', () => {
            this.setState({ isPlaying: false });
            EventBus.emit(APP_EVENTS.VIDEO_PAUSE);
        });
        
        video.addEventListener('ended', () => {
            this.setState({ isPlaying: false });
            EventBus.emit(APP_EVENTS.VIDEO_ENDED, {
                lessonId: this._currentLessonId
            });
            this.onVideoEnded();
        });
        
        video.addEventListener('waiting', () => {
            this.setState({ isLoading: true });
        });
        
        video.addEventListener('canplay', () => {
            this.setState({ isLoading: false });
        });
        
        video.addEventListener('error', (e) => {
            this.setState({ hasError: true, isLoading: false });
            
            // Verificar se URL expirou
            if (this.isSignedUrlExpired()) {
                this.renewSignedUrl();
            } else {
                console.error('Video error:', e);
            }
        });
        
        video.addEventListener('progress', () => {
            if (video.buffered.length > 0) {
                const buffered = video.buffered.end(video.buffered.length - 1);
                this.setState({ buffered });
            }
        });
        
        // Fullscreen events
        document.addEventListener('fullscreenchange', () => {
            this.setState({ isFullscreen: !!document.fullscreenElement });
        });
        
        // EventBus listeners para controles externos
        EventBus.on('video:toggle-play', () => this.togglePlay());
        EventBus.on('video:toggle-fullscreen', () => this.toggleFullscreen());
        EventBus.on('video:toggle-mute', () => this.toggleMute());
        EventBus.on('video:seek-forward', (seconds) => this.seekForward(seconds));
        EventBus.on('video:seek-backward', (seconds) => this.seekBackward(seconds));
        EventBus.on('video:volume-up', () => this.adjustVolume(0.1));
        EventBus.on('video:volume-down', () => this.adjustVolume(-0.1));
    },
    
    // Play
    async play() {
        if (!this._videoElement) return;
        
        try {
            await this._videoElement.play();
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Play error:', error);
            }
        }
    },
    
    // Pause
    pause() {
        if (!this._videoElement) return;
        this._videoElement.pause();
    },
    
    // Toggle play/pause
    togglePlay() {
        if (this._state.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    },
    
    // Seek to position
    seek(time) {
        if (!this._videoElement) return;
        
        const clampedTime = Math.max(0, Math.min(time, this._state.duration));
        this._videoElement.currentTime = clampedTime;
    },
    
    // Seek forward
    seekForward(seconds = 10) {
        this.seek(this._state.currentTime + seconds);
    },
    
    // Seek backward
    seekBackward(seconds = 10) {
        this.seek(this._state.currentTime - seconds);
    },
    
    // Set volume
    setVolume(volume) {
        if (!this._videoElement) return;
        
        const clampedVolume = Math.max(0, Math.min(1, volume));
        this._videoElement.volume = clampedVolume;
        this.setState({ volume: clampedVolume, isMuted: clampedVolume === 0 });
        
        State.updatePreference('volume', clampedVolume);
    },
    
    // Adjust volume
    adjustVolume(delta) {
        this.setVolume(this._state.volume + delta);
    },
    
    // Toggle mute
    toggleMute() {
        if (!this._videoElement) return;
        
        const isMuted = !this._state.isMuted;
        this._videoElement.muted = isMuted;
        this.setState({ isMuted });
    },
    
    // Set playback speed
    setPlaybackSpeed(speed) {
        if (!this._videoElement) return;
        
        if (!APP_CONFIG.VIDEO_PLAYBACK_SPEEDS.includes(speed)) return;
        
        this._videoElement.playbackRate = speed;
        this.setState({ playbackSpeed: speed });
        
        State.updatePreference('playback_speed', speed);
    },
    
    // Toggle fullscreen
    async toggleFullscreen() {
        const container = this._videoElement?.closest('.video-player');
        if (!container) return;
        
        try {
            if (!document.fullscreenElement) {
                await container.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.error('Fullscreen error:', error);
        }
    },
    
    // Verificar se URL assinada expirou
    isSignedUrlExpired() {
        if (!this._signedUrlExpiresAt) return true;
        
        // Considera expirada 60 segundos antes para evitar falhas
        return Date.now() >= (this._signedUrlExpiresAt - 60000);
    },
    
    // Renovar signed URL
    async renewSignedUrl() {
        if (!this._currentLessonId) return;
        
        try {
            const currentTime = this._videoElement?.currentTime || 0;
            
            const videoData = await CourseService.getVideoUrl(this._currentLessonId);
            
            this._currentSignedUrl = videoData.url;
            this._signedUrlExpiresAt = new Date(videoData.expiresAt).getTime();
            
            if (this._videoElement) {
                const wasPlaying = this._state.isPlaying;
                
                this._videoElement.src = videoData.url;
                this._videoElement.currentTime = currentTime;
                
                if (wasPlaying) {
                    await this.play();
                }
            }
            
            this.scheduleUrlRenewal(videoData.expiresAt);
            
        } catch (error) {
            console.error('Error renewing signed URL:', error);
        }
    },
    
    // Agendar renovação de URL
    scheduleUrlRenewal(expiresAt) {
        if (this._urlRenewalTimer) {
            clearTimeout(this._urlRenewalTimer);
        }
        
        const expiresAtMs = new Date(expiresAt).getTime();
        const renewalTime = expiresAtMs - Date.now() - 120000; // 2 min antes
        
        if (renewalTime > 0) {
            this._urlRenewalTimer = setTimeout(() => {
                this.renewSignedUrl();
            }, renewalTime);
        }
    },
    
    // Quando vídeo termina
    onVideoEnded() {
        ProgressService.markLessonComplete(this._currentLessonId);
        
        // Auto-play próxima aula se configurado
        const autoplayNext = State.getPreference('autoplay_next', true);
        if (autoplayNext) {
            EventBus.emit('lesson:request-next');
        }
    },
    
    // Restaurar preferências do usuário
    restorePreferences() {
        if (!this._videoElement) return;
        
        const volume = State.getPreference('volume', 1);
        const speed = State.getPreference('playback_speed', 1);
        
        this._videoElement.volume = volume;
        this._videoElement.playbackRate = speed;
        
        this.setState({ volume, playbackSpeed: speed });
    },
    
    // Atualizar estado
    setState(updates) {
        this._state = { ...this._state, ...updates };
    },
    
    // Obter estado atual
    getState() {
        return { ...this._state };
    },
    
    // Destruir player
    destroy() {
        if (this._urlRenewalTimer) {
            clearTimeout(this._urlRenewalTimer);
        }
        
        if (this._progressTimer) {
            clearInterval(this._progressTimer);
        }
        
        if (this._videoElement) {
            this._videoElement.pause();
            this._videoElement.src = '';
            this._videoElement = null;
        }
        
        this._currentLessonId = null;
        this._currentSignedUrl = null;
    }
};