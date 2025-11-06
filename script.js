class RetroCloset {
    constructor() {
        this.currentUser = '';
        this.celebrities = this.loadCelebrities();
        this.messages = this.loadMessages();
        this.editingCelebrity = null;
        this.init();
    }

    init() {
        this.loadSavedUser();
        this.renderCelebrities();
        this.setupEventListeners();
        this.renderMessages();
        this.updateModalRatingDisplay();
    }

    setupEventListeners() {
        // Name saving functionality
        document.getElementById('save-name').addEventListener('click', () => {
            this.saveUserName();
        });

        document.getElementById('username').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveUserName();
            }
        });

        // Add celebrity button
        document.getElementById('add-celebrity').addEventListener('click', () => {
            this.openModal();
        });

        // Modal controls
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancel-modal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('save-celebrity').addEventListener('click', () => {
            this.saveCelebrity();
        });

        // Modal rating slider
        const modalSlider = document.getElementById('modal-rating-slider');
        modalSlider.addEventListener('input', () => {
            this.updateModalRatingDisplay();
        });

        // Photo upload
        document.getElementById('photo-upload').addEventListener('change', (e) => {
            this.handlePhotoUpload(e);
        });

        // Message board
        document.getElementById('post-message').addEventListener('click', () => {
            this.postMessage();
        });

        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.postMessage();
            }
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('celebrity-modal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    loadSavedUser() {
        const savedUser = localStorage.getItem('retroClosetUser');
        if (savedUser) {
            this.currentUser = savedUser;
            document.getElementById('username').value = savedUser;
            this.showWelcomeMessage();
        }
    }

    saveUserName() {
        const nameInput = document.getElementById('username');
        const name = nameInput.value.trim();
        
        if (name) {
            this.currentUser = name;
            localStorage.setItem('retroClosetUser', name);
            this.showWelcomeMessage();
        } else {
            alert('Please enter a valid name!');
        }
    }

    showWelcomeMessage() {
        const welcomeMsg = document.getElementById('welcome-msg');
        welcomeMsg.textContent = `Welcome back, ${this.currentUser}! 💫`;
        welcomeMsg.style.display = 'inline';
    }

    renderCelebrities() {
        const grid = document.getElementById('actress-grid');
        grid.innerHTML = '';

        this.celebrities.forEach(celebrity => {
            const card = document.createElement('div');
            card.className = 'actress-card';
            card.dataset.celebrityId = celebrity.id;
            
            const imageContent = celebrity.photo ? 
                `<img src="${celebrity.photo}" alt="${celebrity.name}" style="width: 100%; height: 250px; object-fit: contain; border-radius: 15px; background: rgba(255, 107, 157, 0.1);">` :
                `<div class="actress-image">Click to add photo</div>`;
            
            card.innerHTML = `
                <h3 class="actress-name">${celebrity.name}</h3>
                ${imageContent}
                <p class="outfit-description">${celebrity.outfit || 'Click to add outfit description'}</p>
                <div class="current-rating">Rating: ${celebrity.rating}/10</div>
            `;

            card.addEventListener('click', () => {
                this.editCelebrity(celebrity);
            });

            grid.appendChild(card);
        });
    }

    openModal(celebrity = null) {
        this.editingCelebrity = celebrity;
        const modal = document.getElementById('celebrity-modal');
        const title = document.getElementById('modal-title');
        
        if (celebrity) {
            title.textContent = `Edit ${celebrity.name}`;
            document.getElementById('celebrity-name').value = celebrity.name;
            document.getElementById('outfit-description').value = celebrity.outfit || '';
            document.getElementById('modal-rating-slider').value = celebrity.rating;
            
            if (celebrity.photo) {
                const preview = document.getElementById('photo-preview');
                preview.innerHTML = `<img src="${celebrity.photo}" alt="${celebrity.name}">`;
            }
        } else {
            title.textContent = 'Add Celebrity';
            this.clearModalForm();
        }
        
        this.updateModalRatingDisplay();
        modal.style.display = 'block';
    }

    closeModal() {
        const modal = document.getElementById('celebrity-modal');
        modal.style.display = 'none';
        this.editingCelebrity = null;
        this.clearModalForm();
    }

    clearModalForm() {
        document.getElementById('celebrity-name').value = '';
        document.getElementById('outfit-description').value = '';
        document.getElementById('modal-rating-slider').value = 5;
        document.getElementById('photo-upload').value = '';
        document.getElementById('photo-preview').innerHTML = '';
        this.updateModalRatingDisplay();
    }

    editCelebrity(celebrity) {
        this.openModal(celebrity);
    }

    updateModalRatingDisplay() {
        const slider = document.getElementById('modal-rating-slider');
        const display = document.getElementById('modal-rating-value');
        display.textContent = slider.value;
    }

    handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('photo-preview');
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    }

    saveCelebrity() {
        const name = document.getElementById('celebrity-name').value.trim();
        const outfit = document.getElementById('outfit-description').value.trim();
        const rating = parseInt(document.getElementById('modal-rating-slider').value);
        const photoPreview = document.querySelector('#photo-preview img');
        const photo = photoPreview ? photoPreview.src : null;

        if (!name) {
            alert('Please enter a celebrity name!');
            return;
        }

        // Debug: Check if currentUser is properly set
        console.log('Current user check:', this.currentUser);
        console.log('Saved user from localStorage:', localStorage.getItem('retroClosetUser'));
        
        if (!this.currentUser) {
            // Try to reload the user from localStorage
            this.loadSavedUser();
            if (!this.currentUser) {
                alert('Please save your name first!');
                return;
            }
        }

        if (this.editingCelebrity) {
            // Update existing celebrity
            this.editingCelebrity.name = name;
            this.editingCelebrity.outfit = outfit;
            this.editingCelebrity.rating = rating;
            if (photo) this.editingCelebrity.photo = photo;
            
            this.postRatingMessage(name, rating, true);
        } else {
            // Add new celebrity
            const newCelebrity = {
                id: Date.now(),
                name: name,
                outfit: outfit,
                rating: rating,
                photo: photo
            };
            
            this.celebrities.push(newCelebrity);
            this.postRatingMessage(name, rating, false);
        }

        this.saveCelebrities();
        this.renderCelebrities();
        this.closeModal();
        this.showSuccessMessage(`${this.editingCelebrity ? 'Updated' : 'Added'} ${name}!`);
    }

    postRatingMessage(celebrityName, rating, isUpdate = false) {
        const ratingEmojis = ['😱', '😬', '😐', '🙂', '😊', '😍', '🤩', '✨', '🔥', '👑'];
        const emoji = ratingEmojis[rating - 1] || '⭐';
        const action = isUpdate ? 'updated' : 'rated';
        
        const message = {
            id: Date.now(),
            author: this.currentUser,
            text: `Just ${action} ${celebrityName}'s retro look: ${rating}/10 ${emoji}`,
            timestamp: new Date().toLocaleString(),
            isRating: true
        };

        this.messages.unshift(message);
        this.saveMessages();
        this.renderMessages();
    }

    loadCelebrities() {
        const saved = localStorage.getItem('retroClosetCelebrities');
        return saved ? JSON.parse(saved) : [];
    }

    saveCelebrities() {
        localStorage.setItem('retroClosetCelebrities', JSON.stringify(this.celebrities));
    }

    postMessage() {
        const messageInput = document.getElementById('message-input');
        const text = messageInput.value.trim();

        if (!text) {
            alert('Please enter a message!');
            return;
        }

        if (!this.currentUser) {
            alert('Please save your name first!');
            return;
        }

        const message = {
            id: Date.now(),
            author: this.currentUser,
            text: text,
            timestamp: new Date().toLocaleString(),
            isRating: false
        };

        this.messages.unshift(message);
        this.saveMessages();
        this.renderMessages();
        messageInput.value = '';
    }

    renderMessages() {
        const container = document.getElementById('messages-container');
        container.innerHTML = '';

        if (this.messages.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No messages yet. Be the first to share your thoughts!</p>';
            return;
        }

        this.messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            if (message.isRating) {
                messageDiv.style.borderLeftColor = '#f8b500';
            }
            
            messageDiv.innerHTML = `
                <div class="message-author">${message.author}</div>
                <div class="message-text">${message.text}</div>
                <div class="message-time">${message.timestamp}</div>
            `;

            container.appendChild(messageDiv);
        });
    }

    loadMessages() {
        const saved = localStorage.getItem('retroClosetMessages');
        return saved ? JSON.parse(saved) : [];
    }

    saveMessages() {
        localStorage.setItem('retroClosetMessages', JSON.stringify(this.messages));
    }

    showSuccessMessage(text) {
        // Create temporary success message
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #ff6b9d, #c44569);
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            font-family: 'Bubblegum Sans', cursive;
            font-weight: bold;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            animation: slideIn 0.5s ease;
        `;
        successDiv.textContent = text;

        // Add animation keyframes
        if (!document.getElementById('success-animation')) {
            const style = document.createElement('style');
            style.id = 'success-animation';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(successDiv);

        // Remove after 3 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RetroCloset();
});