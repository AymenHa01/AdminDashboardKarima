import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BlobStorgeService } from '../../../blob-storge.service';
import { AtelierService } from '../../services/atelier.service';

@Component({
  selector: 'app-sous-atelier-form',
  templateUrl: './sous-atelier-form.component.html',
  styleUrls: ['./sous-atelier-form.component.scss']
})
export class SousAtelierFormComponent implements OnInit {
  sousAtelierForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private blob: BlobStorgeService,
    private sousAtelierService: AtelierService
  ) {
    this.sousAtelierForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      prix: ['', [Validators.required, Validators.min(0)]],
      image: [''],
      active: [true]
    });
  }

  ngOnInit(): void {
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.sousAtelierForm.patchValue({
        image: file.name
      });
      
      this.blob.uploadImage(file, file.name, (progressEvent: ProgressEvent) => {
        if (progressEvent.lengthComputable) {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          console.log(`Upload progress: ${progress}%`);
        }
      });
    }
  }

  onSubmit() {
    if (this.sousAtelierForm.valid) {
      const formData = this.sousAtelierForm.value;
      this.sousAtelierService.AddSousAtelier(formData).subscribe(
        () => {
          this.goBack();
        },
        error => {
          console.error('Error creating sous atelier:', error);
        }
      );
    }
  }

  goBack() {
    this.router.navigate(['/ateliers']);
  }
}
