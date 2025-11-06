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

        // Search functionality
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.searchCelebrities(e.target.value);
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

        document.getElementById('delete-celebrity').addEventListener('click', () => {
            this.deleteCelebrity();
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

    renderCelebrities(filteredCelebrities = null) {
        const grid = document.getElementById('actress-grid');
        grid.innerHTML = '';

        const celebsToRender = filteredCelebrities || this.celebrities;

        celebsToRender.forEach(celebrity => {
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
                <div class="delete-icon" title="Delete Celebrity">🗑️</div>
                <div class="edit-icon" title="Edit Celebrity">✏️</div>
            `;

            // View photo on card click (but not on edit/delete icons)
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.edit-icon') && !e.target.closest('.delete-icon')) {
                    this.viewCelebrity(celebrity);
                }
            });

            // Edit on edit icon click
            const editIcon = card.querySelector('.edit-icon');
            editIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editCelebrity(celebrity);
            });

            // Delete on delete icon click
            const deleteIcon = card.querySelector('.delete-icon');
            deleteIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.confirmDeleteCelebrity(celebrity);
            });

            grid.appendChild(card);
        });
    }

    openModal(celebrity = null) {
        this.editingCelebrity = celebrity;
        const modal = document.getElementById('celebrity-modal');
        const title = document.getElementById('modal-title');
        const deleteBtn = document.getElementById('delete-celebrity');
        
        if (celebrity) {
            title.textContent = `Edit ${celebrity.name}`;
            document.getElementById('celebrity-name').value = celebrity.name;
            document.getElementById('outfit-description').value = celebrity.outfit || '';
            document.getElementById('modal-rating-slider').value = celebrity.rating;
            deleteBtn.style.display = 'inline-block';
            
            if (celebrity.photo) {
                const preview = document.getElementById('photo-preview');
                preview.innerHTML = `<img src="${celebrity.photo}" alt="${celebrity.name}">`;
            }
        } else {
            title.textContent = 'Add Celebrity';
            deleteBtn.style.display = 'none';
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

    viewCelebrity(celebrity) {
        if (celebrity.photo) {
            this.openPhotoViewer(celebrity);
        } else {
            // If no photo, open edit mode to add one
            this.editCelebrity(celebrity);
        }
    }

    searchCelebrities(searchTerm) {
        if (!searchTerm.trim()) {
            this.renderCelebrities();
            return;
        }

        const filtered = this.celebrities.filter(celebrity => 
            celebrity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (celebrity.outfit && celebrity.outfit.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        this.renderCelebrities(filtered);
    }

    openPhotoViewer(celebrity) {
        // Create photo viewer modal
        const existingViewer = document.getElementById('photo-viewer');
        if (existingViewer) {
            existingViewer.remove();
        }

        const viewer = document.createElement('div');
        viewer.id = 'photo-viewer';
        viewer.className = 'modal';
        viewer.style.display = 'block';
        
        viewer.innerHTML = `
            <div class="photo-viewer-content">
                <span class="close photo-viewer-close">&times;</span>
                <h2>${celebrity.name}</h2>
                <img src="${celebrity.photo}" alt="${celebrity.name}" class="photo-viewer-image">
                <p class="photo-viewer-description">${celebrity.outfit || 'No description available'}</p>
                <div class="photo-viewer-rating">Rating: ${celebrity.rating}/10</div>
                <button class="edit-from-viewer" onclick="retroCloset.editCelebrity(retroCloset.celebrities.find(c => c.id === ${celebrity.id}))">Edit Celebrity</button>
            </div>
        `;

        document.body.appendChild(viewer);

        // Close viewer events
        viewer.querySelector('.photo-viewer-close').addEventListener('click', () => {
            viewer.remove();
        });

        viewer.addEventListener('click', (e) => {
            if (e.target === viewer) {
                viewer.remove();
            }
        });
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

    confirmDeleteCelebrity(celebrity) {
        const confirmMessage = `Are you sure you want to delete ${celebrity.name}? This action cannot be undone.`;
        
        if (confirm(confirmMessage)) {
            this.deleteCelebrityById(celebrity.id);
        }
    }

    deleteCelebrity() {
        if (!this.editingCelebrity) return;
        
        const confirmMessage = `Are you sure you want to delete ${this.editingCelebrity.name}? This action cannot be undone.`;
        
        if (confirm(confirmMessage)) {
            this.deleteCelebrityById(this.editingCelebrity.id);
            this.closeModal();
        }
    }

    deleteCelebrityById(celebrityId) {
        const celebrityIndex = this.celebrities.findIndex(c => c.id === celebrityId);
        
        if (celebrityIndex !== -1) {
            const deletedCelebrity = this.celebrities[celebrityIndex];
            this.celebrities.splice(celebrityIndex, 1);
            
            // Post deletion message
            if (this.currentUser) {
                const message = {
                    id: Date.now(),
                    author: this.currentUser,
                    text: `Deleted ${deletedCelebrity.name} from the collection 🗑️`,
                    timestamp: new Date().toLocaleString(),
                    isRating: false
                };
                
                this.messages.unshift(message);
                this.saveMessages();
                this.renderMessages();
            }
            
            this.saveCelebrities();
            this.renderCelebrities();
            this.showSuccessMessage(`Deleted ${deletedCelebrity.name}!`);
        }
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
let retroCloset;
document.addEventListener('DOMContentLoaded', () => {
    retroCloset = new RetroCloset();
});