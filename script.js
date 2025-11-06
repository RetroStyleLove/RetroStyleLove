class RetroCloset {
    constructor() {
        this.currentUser = '';
        this.celebrities = this.loadCelebrities();
        this.editingCelebrity = null;
        this.currentPage = 1;
        this.itemsPerPage = 5;
        this.filteredCelebrities = null;
        this.init();
    }

    init() {
        this.renderCelebrities();
        this.setupEventListeners();
        this.updateModalRatingDisplay();
    }

    setupEventListeners() {
        // Add celebrity button
        document.getElementById('add-celebrity').addEventListener('click', () => {
            this.openModal();
        });

        // Search functionality
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.searchCelebrities(e.target.value);
        });

        // Pagination controls
        document.getElementById('prev-page').addEventListener('click', () => {
            this.goToPage(this.currentPage - 1);
        });

        document.getElementById('next-page').addEventListener('click', () => {
            this.goToPage(this.currentPage + 1);
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



        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('celebrity-modal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }



    renderCelebrities(filteredCelebrities = null) {
        const grid = document.getElementById('actress-grid');
        grid.innerHTML = '';

        const celebsToRender = filteredCelebrities || this.celebrities;
        this.filteredCelebrities = celebsToRender;

        // Calculate pagination
        const totalPages = Math.ceil(celebsToRender.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentPageCelebs = celebsToRender.slice(startIndex, endIndex);

        currentPageCelebs.forEach(celebrity => {
            const card = document.createElement('div');
            card.className = 'actress-card';
            card.dataset.celebrityId = celebrity.id;
            
            const imageContent = celebrity.photo ? 
                `<img src="${celebrity.photo}" alt="${celebrity.name}" style="width: 100%; height: 250px; object-fit: contain; border-radius: 15px; background: rgba(255, 107, 157, 0.1);">` :
                `<div class="actress-image">Click to add photo</div>`;
            
            card.innerHTML = `
                <h3 class="actress-name">${celebrity.name}</h3>
                ${imageContent}
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

        // Render pagination
        this.renderPagination(totalPages, celebsToRender.length);
    }

    openModal(celebrity = null) {
        this.editingCelebrity = celebrity;
        const modal = document.getElementById('celebrity-modal');
        const title = document.getElementById('modal-title');
        const deleteBtn = document.getElementById('delete-celebrity');
        
        if (celebrity) {
            title.textContent = `Edit ${celebrity.name}`;
            document.getElementById('celebrity-name').value = celebrity.name;
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
        this.currentPage = 1; // Reset to first page when searching
        
        if (!searchTerm.trim()) {
            this.renderCelebrities();
            return;
        }

        const filtered = this.celebrities.filter(celebrity => 
            celebrity.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        this.renderCelebrities(filtered);
    }

    renderPagination(totalPages, totalItems) {
        const paginationSection = document.getElementById('pagination-section');
        const pageNumbers = document.getElementById('page-numbers');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const infoText = document.getElementById('pagination-info-text');

        // Hide pagination if not needed
        if (totalPages <= 1) {
            paginationSection.style.display = 'none';
            return;
        }

        paginationSection.style.display = 'block';

        // Update buttons
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages;

        // Update info text
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, totalItems);
        infoText.textContent = `Page ${this.currentPage} of ${totalPages} (${startItem}-${endItem} of ${totalItems})`;

        // Render page numbers
        pageNumbers.innerHTML = '';
        
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('div');
            pageBtn.className = 'page-number';
            pageBtn.textContent = i;
            
            if (i === this.currentPage) {
                pageBtn.classList.add('active');
            }
            
            pageBtn.addEventListener('click', () => {
                this.goToPage(i);
            });
            
            pageNumbers.appendChild(pageBtn);
        }
    }

    goToPage(page) {
        const totalPages = Math.ceil((this.filteredCelebrities || this.celebrities).length / this.itemsPerPage);
        
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderCelebrities(this.filteredCelebrities);
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
            this.compressImage(file, (compressedDataUrl) => {
                const preview = document.getElementById('photo-preview');
                preview.innerHTML = `<img src="${compressedDataUrl}" alt="Preview">`;
            });
        }
    }

    compressImage(file, callback, quality = 0.7, maxWidth = 400, maxHeight = 400) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Calculate new dimensions
            let { width, height } = img;
            
            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            callback(compressedDataUrl);
        };
        
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    saveCelebrity() {
        const name = document.getElementById('celebrity-name').value.trim();
        const rating = parseInt(document.getElementById('modal-rating-slider').value);
        const photoPreview = document.querySelector('#photo-preview img');
        const photo = photoPreview ? photoPreview.src : null;

        if (!name) {
            alert('Please enter a celebrity name!');
            return;
        }



        if (this.editingCelebrity) {
            // Update existing celebrity
            this.editingCelebrity.name = name;
            this.editingCelebrity.rating = rating;
            if (photo) this.editingCelebrity.photo = photo;
            

        } else {
            // Add new celebrity
            const newCelebrity = {
                id: Date.now(),
                name: name,
                rating: rating,
                photo: photo
            };
            
            this.celebrities.push(newCelebrity);
        }

        this.saveCelebrities();
        this.renderCelebrities(this.filteredCelebrities);
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
            

            
            this.saveCelebrities();
            
            // Check if current page is now empty and go to previous page if needed
            const totalPages = Math.ceil((this.filteredCelebrities || this.celebrities).length / this.itemsPerPage);
            if (this.currentPage > totalPages && totalPages > 0) {
                this.currentPage = totalPages;
            }
            
            this.renderCelebrities(this.filteredCelebrities);
            this.showSuccessMessage(`Deleted ${deletedCelebrity.name}!`);
        }
    }

    loadCelebrities() {
        const saved = localStorage.getItem('retroClosetCelebrities');
        return saved ? JSON.parse(saved) : [];
    }

    saveCelebrities() {
        try {
            localStorage.setItem('retroClosetCelebrities', JSON.stringify(this.celebrities));
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                this.handleStorageQuotaExceeded();
            } else {
                console.error('Error saving celebrities:', error);
                alert('Error saving data. Please try again.');
            }
        }
    }

    handleStorageQuotaExceeded() {
        const storageInfo = this.getStorageInfo();
        const message = `Storage limit reached!\n\nCurrent usage: ${storageInfo.usedMB}MB\nCelebrities stored: ${this.celebrities.length}\n\nOptions:\n1. Delete some celebrities\n2. Clear all data and start fresh\n3. Continue without saving`;
        
        if (confirm(message + '\n\nWould you like to clear all data? (Cancel to continue without saving)')) {
            if (confirm('Are you sure? This will delete ALL celebrities and cannot be undone!')) {
                localStorage.removeItem('retroClosetCelebrities');
                this.celebrities = [];
                this.renderCelebrities();
                alert('All data cleared! You can now add new celebrities.');
            }
        }
    }

    getStorageInfo() {
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length;
            }
        }
        return {
            usedMB: (totalSize / 1024 / 1024).toFixed(2),
            usedBytes: totalSize
        };
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