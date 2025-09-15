class WheelOfFortune {
    constructor() {
        this.canvas = document.getElementById('wheelCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.entries = [];
        this.isSpinning = false;
        this.currentRotation = 0;
        this.spinDuration = 5000; // 5 seconds
        
        // Load entries from localStorage
        this.loadEntries();
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Draw initial wheel
        this.drawWheel();
        
        // Update entry count
        this.updateEntryCount();
    }

    initEventListeners() {
        // Spin button
        document.getElementById('spinButton').addEventListener('click', () => {
            if (this.entries.length > 0 && !this.isSpinning) {
                this.spin();
            }
        });

        // Add single entry
        document.getElementById('addButton').addEventListener('click', () => {
            this.addSingleEntry();
        });

        // Add entry on Enter key
        document.getElementById('nameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addSingleEntry();
            }
        });

        // Bulk add entries
        document.getElementById('bulkAddButton').addEventListener('click', () => {
            this.addBulkEntries();
        });

        // Clear all entries
        document.getElementById('clearAllButton').addEventListener('click', () => {
            this.clearAllEntries();
        });
    }

    addSingleEntry() {
        const nameInput = document.getElementById('nameInput');
        const name = nameInput.value.trim();
        
        if (name && this.entries.length < 200) {
            this.entries.push(name);
            nameInput.value = '';
            this.updateDisplay();
            this.saveEntries();
        }
    }

    addBulkEntries() {
        const bulkInput = document.getElementById('bulkInput');
        const names = bulkInput.value
            .split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);
        
        const availableSlots = 200 - this.entries.length;
        const namesToAdd = names.slice(0, availableSlots);
        
        this.entries.push(...namesToAdd);
        bulkInput.value = '';
        this.updateDisplay();
        this.saveEntries();
    }

    removeEntry(index) {
        this.entries.splice(index, 1);
        this.updateDisplay();
        this.saveEntries();
    }

    clearAllEntries() {
        if (confirm('Are you sure you want to clear all entries?')) {
            this.entries = [];
            this.updateDisplay();
            this.saveEntries();
            this.hideWinner();
        }
    }

    updateDisplay() {
        this.updateEntriesList();
        this.updateEntryCount();
        this.drawWheel();
    }

    updateEntriesList() {
        const entriesList = document.getElementById('entriesList');
        entriesList.innerHTML = '';

        this.entries.forEach((entry, index) => {
            const li = document.createElement('li');
            li.className = 'entry-item';
            li.innerHTML = `
                <span class="entry-name">${this.escapeHtml(entry)}</span>
                <button class="remove-button" onclick="wheel.removeEntry(${index})">Remove</button>
            `;
            entriesList.appendChild(li);
        });
    }

    updateEntryCount() {
        document.getElementById('entryCount').textContent = this.entries.length;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    drawWheel() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.entries.length === 0) {
            // Draw empty wheel
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#f0f0f0';
            this.ctx.fill();
            this.ctx.strokeStyle = '#ddd';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Add "Add entries to start" text
            this.ctx.fillStyle = '#666';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Add entries to start!', centerX, centerY);
            return;
        }

        const anglePerSegment = (2 * Math.PI) / this.entries.length;
        const colors = this.generateColors(this.entries.length);

        // Draw segments
        this.entries.forEach((entry, index) => {
            const startAngle = index * anglePerSegment + this.currentRotation;
            const endAngle = (index + 1) * anglePerSegment + this.currentRotation;

            // Draw segment
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fillStyle = colors[index % colors.length];
            this.ctx.fill();
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Draw text
            const textAngle = startAngle + anglePerSegment / 2;
            const textRadius = radius * 0.7;
            const textX = centerX + Math.cos(textAngle) * textRadius;
            const textY = centerY + Math.sin(textAngle) * textRadius;

            this.ctx.save();
            this.ctx.translate(textX, textY);
            this.ctx.rotate(textAngle + Math.PI / 2);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Truncate long names
            let displayName = entry;
            if (displayName.length > 15) {
                displayName = displayName.substring(0, 12) + '...';
            }
            
            this.ctx.fillText(displayName, 0, 0);
            this.ctx.restore();
        });

        // Draw center circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#333';
        this.ctx.fill();
    }

    generateColors(count) {
        const colors = [];
        const hueStep = 360 / Math.max(count, 8); // Minimum 8 colors for variety
        
        for (let i = 0; i < count; i++) {
            const hue = (i * hueStep) % 360;
            const saturation = 70 + (i % 3) * 10; // Vary saturation
            const lightness = 50 + (i % 2) * 15; // Vary lightness
            colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
        }
        
        return colors;
    }

    spin() {
        if (this.isSpinning || this.entries.length === 0) return;

        this.isSpinning = true;
        this.hideWinner();
        
        // Disable spin button
        const spinButton = document.getElementById('spinButton');
        spinButton.disabled = true;
        spinButton.querySelector('.spin-text').textContent = 'SPINNING...';

        // Calculate final rotation
        const minSpins = 5; // Minimum number of full rotations
        const maxSpins = 8; // Maximum number of full rotations
        const randomSpins = minSpins + Math.random() * (maxSpins - minSpins);
        const randomAngle = Math.random() * 2 * Math.PI;
        const finalRotation = this.currentRotation + randomSpins * 2 * Math.PI + randomAngle;

        // Animate spinning
        const startTime = Date.now();
        const startRotation = this.currentRotation;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / this.spinDuration, 1);
            
            // Easing function for natural deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            this.currentRotation = startRotation + (finalRotation - startRotation) * easeOut;
            this.drawWheel();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.currentRotation = finalRotation % (2 * Math.PI);
                this.isSpinning = false;
                this.showWinner();
                
                // Re-enable spin button
                spinButton.disabled = false;
                spinButton.querySelector('.spin-text').textContent = 'SPIN!';
            }
        };

        requestAnimationFrame(animate);
    }

    showWinner() {
        if (this.entries.length === 0) return;

        // Calculate winner based on pointer position (top of wheel)
        const pointerAngle = -Math.PI / 2; // Pointer points up
        const normalizedAngle = ((pointerAngle - this.currentRotation) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const anglePerSegment = (2 * Math.PI) / this.entries.length;
        const winnerIndex = Math.floor(normalizedAngle / anglePerSegment);
        const winner = this.entries[winnerIndex];

        // Display winner
        document.getElementById('winnerName').textContent = winner;
        document.getElementById('winnerDisplay').classList.remove('hidden');
        
        // Show celebration overlay
        document.getElementById('celebrationOverlay').classList.remove('hidden');
        
        // Hide celebration after 3 seconds
        setTimeout(() => {
            document.getElementById('celebrationOverlay').classList.add('hidden');
        }, 3000);
    }

    hideWinner() {
        document.getElementById('winnerDisplay').classList.add('hidden');
        document.getElementById('celebrationOverlay').classList.add('hidden');
    }

    saveEntries() {
        localStorage.setItem('wheelEntries', JSON.stringify(this.entries));
    }

    loadEntries() {
        const saved = localStorage.getItem('wheelEntries');
        if (saved) {
            try {
                this.entries = JSON.parse(saved);
            } catch (e) {
                this.entries = [];
            }
        }
    }
}

// Initialize the wheel when page loads
let wheel;
document.addEventListener('DOMContentLoaded', () => {
    wheel = new WheelOfFortune();
});