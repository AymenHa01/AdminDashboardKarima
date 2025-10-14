import { Component, OnInit, Inject } from '@angular/core';
import { MediaService } from '../services/media.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AtelierService } from '../services/atelier.service';
import { BlobStorageService } from '../services/blob-storage.service';

@Component({
  selector: 'app-images-add',
  templateUrl: './images-add.component.html',
  styleUrl: './images-add.component.scss'
})
export class ImagesADDComponent implements OnInit {
  Images: any[] = [];
  progress: number = 0;
  dismissible = true;
  Path = "https://artimages.blob.core.windows.net/images/";
  messsage: string = "";

  constructor(
    private Media: MediaService,
    public dialogRef: MatDialogRef<ImagesADDComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private sousAtelier: AtelierService,
    private blob: BlobStorageService,
  ) {}

  ngOnInit(): void {
  }


  onAddImage(image: any) {
    this.Images.push(image)
  }



  async AddImages() {
    if (!this.Images.length) {
      this.messsage = "Please select at least one image";
      return;
    }

    for (const data of this.Images) {
      if (data?.target?.files?.[0]) {
        const file = data.target.files[0];
        try {
          await this.blob.uploadImage(file, file.name, (event: ProgressEvent) => {
            const progress = (event.loaded / event.total) * 100;
            this.progress = progress;
          });

          await this.Media.addMedia(
            file.name,
            this.dialogData?.type || '',
          
          ).toPromise();

          console.log('Media added successfully');
          if (this.progress === 100) {
            this.messsage = "Upload completed successfully!";
          }
        } catch (error) {
          console.error('Error:', error);
          this.messsage = "Error uploading file. Please try again.";
        }
      }
    }
  }

  openModal() {
    const confirmed = window.confirm("Are you sure?");
    if (confirmed) {

      console.log("Action confirmed");
    } else {
      // Action cancelled
      console.log("Action cancelled");
    }
  }


  deleteImage(image: string) {
    this.Images = this.Images.filter(img => img !== image);
  }

  close() {
    this.dialogRef.close();
  }

}
