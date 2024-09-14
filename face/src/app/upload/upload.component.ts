import { Component } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [NgIf],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {
  selectedFile: File | null = null; 
  imagePreview: string | ArrayBuffer | null = null;

  
  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];

      
      const reader = new FileReader();
      reader.onload = (e) => this.imagePreview = reader.result;
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onUpload(): void {
    if (!this.selectedFile) return;
    
    // Simulate file upload (for now)
    console.log('Uploading file:', this.selectedFile.name);
    setTimeout(() => {
      alert('Image uploaded successfully!');
    }, 1000);
  }

}
