import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [NgIf, CommonModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {
  selectedFile: File | null = null; 
  imagePreview: string | ArrayBuffer | null = null;
  palettecolour: string[] = [];

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0]
      const reader = new FileReader()

      reader.onload = (e) => {
        this.imagePreview = reader.result

        if (typeof window !== 'undefined') {
          const img = new Image();
          img.src = reader.result as string
          img.onload = () => {
            try {
              this.extractDominantcolour(img)
            } catch (error) {
              console.error('Error extracting colour palette:', error)
            }
          }
        }
      }

      reader.readAsDataURL(this.selectedFile);
    }
  }

  getDominantcolour(data: Uint8ClampedArray): string[] {
    const colourTracker: { [key: string]: number } = {}

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const colour = `rgb(${r},${g},${b})`

      if (!colourTracker[colour]) {
        colourTracker[colour] = 0
      }
      colourTracker[colour]++
    }

    const sortedcolour = Object.keys(colourTracker).sort((a, b) => colourTracker[b] - colourTracker[a])

    return sortedcolour.slice(0, 5)
  }


  extractDominantcolour(img: HTMLImageElement): void {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      console.error('Failed to get canvas context');
      return;
    }

    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    const colour = this.getDominantcolour(data)
    this.palettecolour = colour
    console.log('Extracted colour palette:', this.palettecolour)
  }

  onUpload(): void {
    if (!this.selectedFile) return

    console.log('Uploading file:', this.selectedFile.name);
    setTimeout(() => {
      alert('Image uploaded successfully!!!!!!')
    }, 1000);
  }
}