import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AtelierService } from '../../services/atelier.service';
import { MediaService } from '../../services/media.service';
import { BlobStorageService } from '../../services/blob-storage.service';
import { MatDialog } from '@angular/material/dialog';
import { ImagesADDComponent } from '../../images-add/images-add.component';
import { SidebarService } from '../../shared/sidebar/sidebar.service';
import { Subscription } from 'rxjs';
import { env } from 'process';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-sous-atelier-list',
  templateUrl: './sous-atelier-list.component.html',
  styleUrl: './sous-atelier-list.component.scss'
})
export class SousAtelierListComponent implements OnInit, OnDestroy {
  sousAteliers:any[]=[]
  newSousAtelier = {
    atelier : {},
    name: '',
    description: '',
    prix: null, 
    image: null as string | null,
    active: true
  };
accoubntName: string = environment.acountName;
containerName: string = environment.containerName;
  // Image management properties
  selectedSousAtelier: any = null;
  sousAtelierImages: any[] = [];
  showImageDialog = false;
  showImageGallery = false;
  showAddImageDialog = false;
  uploadProgress: { [key: number]: number } = {};
  uploadError = '';
  isUploading = false;
  
  // Zoom dialog properties
  selectedImage: string = '';
  currentImageIndex: number = 0;
  totalImagesCount: number = 0;
  
  // Download properties
  isDownloading = false;
  downloadProgress = 0;
  downloadedCount = 0;
  totalDownloadCount = 0;
  currentDownloadingImage: string = '';
  
  // Form image properties
  selectedFormImage: File | null = null;
  formImagePreview: string | null = null;
  
  // View control
  showForm: boolean = false;
  
  // Edit mode properties
  editingRows: { [key: number]: boolean } = {};
  editingImages: { [key: number]: File | null } = {};
  editingImagePreviews: { [key: number]: string | null } = {};
  uploadingInlineImages: { [key: number]: boolean } = {};
  inlineUploadProgress: { [key: number]: number } = {};

  url = environment.blobUrl;  
  // Sidebar responsive layout
  isSidebarCollapsed: boolean = false;
  private sidebarSubscription: Subscription = new Subscription();

  id: any = 0;
  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder , 
    private sousAtelier : AtelierService,
    private mediaService: MediaService,
    private blobService: BlobStorageService, 
    private dialog: MatDialog,
    private sidebarService: SidebarService , 
  ) { }


  
  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    let body ={
      "id" : this.id
    }
    this.newSousAtelier.atelier=body
    this.GetSousAtelier()
    
    // Subscribe to sidebar state changes
    this.sidebarSubscription.add(
      this.sidebarService.isCollapsed$.subscribe(collapsed => {
        this.isSidebarCollapsed = collapsed;
      })
    );
  }
  
  ngOnDestroy(): void {
    this.sidebarSubscription.unsubscribe();
  }


  openModal(): void {
    const dialogRef = this.dialog.open(ImagesADDComponent, {
      width: '500px',
      height : '500px',
      data : this.newSousAtelier
     
    });}



  GetSousAtelier(){
    this.sousAtelier.GetSousAtelierById(this.id).subscribe((data : any )=>
      {this.sousAteliers=data
        console.log(data);
        this.sousAtelierImages = data.media || [];  
      }

      )
  }



  editeSousAtelier(id: number, des: any, name: any, prix: any, atelier: number) {
    console.log('Editing sous-atelier:', { id, des, name, prix, atelier });
    
    // Check if there's a new image being uploaded
    if (this.uploadingInlineImages[id]) {
      alert('Veuillez attendre que l\'upload de l\'image soit terminé.');
      return;
    }
    
    // Get the current image or new uploaded image
    let imageToSave = '';
    const currentSousAtelier = this.sousAteliers.find(sa => sa.id === id);
    if (currentSousAtelier) {
      imageToSave = currentSousAtelier.image || '';
    }
    
    let body = {
      "id": id,
      "name": name,
      "description": des,
      "atelier": {
        "id": atelier
      },
      "image": imageToSave,
      "prix": prix,
      "active": currentSousAtelier.active
    };

    console.log('Saving sous-atelier with body:', body);
    
    
    this.sousAtelier.Edite(body).subscribe({
      next: (data: any) => {
        console.log('Sous-atelier updated successfully:', data);
        this.GetSousAtelier();
        this.exitEditMode(id);
        alert('Sous-atelier modifié avec succès!');
      },
      error: (error) => {
        console.error('Error updating sous-atelier:', error);
        alert('Erreur lors de la modification du sous-atelier.');
      }
    });
  }

  

  saveSousAtelier(sousAtelier: any): void {
    console.log('Saving sous-atelier:', sousAtelier);
    
    // Check if there's a new image being uploaded
    if (this.uploadingInlineImages[sousAtelier.id]) {
      alert('Veuillez attendre que l\'upload de l\'image soit terminé.');
      return;
    }
    
    let body = {
      "id": sousAtelier.id,
      "name": sousAtelier.name,
      "description": sousAtelier.description,
      "atelier": {
        "id": sousAtelier.atelier.id
      },
      "image": sousAtelier.image || '',
      "prix": sousAtelier.prix,
      "active": sousAtelier.active
    };

    console.log('Saving sous-atelier with body:', body);
    
    this.sousAtelier.Edite(body).subscribe({
      next: (data: any) => {
        console.log('Sous-atelier updated successfully:', data);
        this.GetSousAtelier();
        this.exitEditMode(sousAtelier.id);
        alert('Sous-atelier modifié avec succès!');
      },
      error: (error) => {
        console.error('Error updating sous-atelier:', error);
        alert('Erreur lors de la modification du sous-atelier.');
      }
    });
  }


DeleteSousAtelier(id : number ){
  let body = {
    "id" : id 
  }
this.sousAtelier.DeleteSousAtelier(body).subscribe((data)=> this.GetSousAtelier()
)
}
checkForm() {
  // Validate required fields
  if (!this.newSousAtelier.name || this.newSousAtelier.name.trim() === '') {
    alert('Veuillez entrer un nom pour le sous-atelier.');
    return;
  }
  
  if (!this.newSousAtelier.description || this.newSousAtelier.description.trim() === '') {
    alert('Veuillez entrer une description pour le sous-atelier.');
    return;
  }
  
  if (this.newSousAtelier.prix === null || this.newSousAtelier.prix === undefined || this.newSousAtelier.prix < 0) {
    alert('Veuillez entrer un prix valide pour le sous-atelier.');
    return;
  }

  // Submit the form
  this.sousAtelier.AddSousAtelier(this.newSousAtelier).subscribe({
    next: (data: any) => {
      console.log('Sous-atelier créé avec succès:', data);
      
      // If image is selected, upload it after creating the sous-atelier
      if (this.selectedFormImage && data && data.id) {
        this.uploadFormImage(data.id);
      }
      
      this.GetSousAtelier();
      this.resetForm();
      this.showForm = false; // Hide form after successful submission
      
      // Show success message
      alert('Sous-atelier ajouté avec succès!');
    },
    error: (error) => {
      console.error('Erreur lors de l\'ajout du sous-atelier', error);
      alert('Erreur lors de l\'ajout du sous-atelier. Veuillez réessayer.');
    }
  });
}

// Handle form image selection
onFormImageSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.selectedFormImage = file;
    this.newSousAtelier.image = file.name;
    
    // Create image preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.formImagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Upload form image
uploadFormImage(sousAtelierId: number): void {
  if (this.selectedFormImage) {
    const fileName = this.selectedFormImage.name;
    
    this.blobService.uploadImage(this.selectedFormImage, fileName, (progressEvent: ProgressEvent) => {
      // Handle progress if needed
    });

    setTimeout(() => {
      this.mediaService.addMedia(fileName, sousAtelierId.toString()).subscribe({
        next: (mediaResponse) => {
          console.log('Image uploaded successfully');
        },
        error: (error) => {
          console.error('Error saving image to database:', error);
        }
      });
    }, 1000);
  }
}

  // Reset form
  resetForm(): void {
    this.newSousAtelier = {
      atelier: { id: this.id },
      name: '',
      description: '',
      prix: null,
      image: null,
      active: true
    };
    this.selectedFormImage = null;
    this.formImagePreview = null;
    
    // Reset file input
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // Edit mode methods
  enterEditMode(sousAtelierId: number): void {
    this.editingRows[sousAtelierId] = true;
  }

  exitEditMode(sousAtelierId: number): void {
    this.editingRows[sousAtelierId] = false;
    delete this.editingImages[sousAtelierId];
    delete this.editingImagePreviews[sousAtelierId];
    delete this.uploadingInlineImages[sousAtelierId];
    delete this.inlineUploadProgress[sousAtelierId];
  }

  isEditing(sousAtelierId: number): boolean {
    return this.editingRows[sousAtelierId] || false;
  }

  // Handle inline image selection during edit
  onInlineImageSelected(event: any, sousAtelierId: number): void {
    const file = event.target.files[0];
    if (file) {
      this.editingImages[sousAtelierId] = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editingImagePreviews[sousAtelierId] = e.target.result;
      };
      reader.readAsDataURL(file);
      
      // Upload image immediately
      this.uploadInlineImage(file, sousAtelierId);
    }
  }
  // Upload image for inline editing
  uploadInlineImage(file: File, sousAtelierId: number): void {
    this.uploadingInlineImages[sousAtelierId] = true;
    this.inlineUploadProgress[sousAtelierId] = 0;
    
    const fileName = file.name;
    
    // Custom XHR for better control
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `https://${environment.acountName}.blob.core.windows.net/${environment.containerName}/${fileName}?${environment.blobUrlSaS}`, true);
    xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');

    xhr.upload.onprogress = (event: ProgressEvent) => {
      if (event.lengthComputable) {
        this.inlineUploadProgress[sousAtelierId] = Math.round((event.loaded / event.total) * 100);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 201 || xhr.status === 200) {
        // Update the sous-atelier object with new image name
        const sousAtelierIndex = this.sousAteliers.findIndex(sa => sa.id === sousAtelierId);
        if (sousAtelierIndex !== -1) {
          this.sousAteliers[sousAtelierIndex].image = fileName;
        }
        
        this.uploadingInlineImages[sousAtelierId] = false;
        this.inlineUploadProgress[sousAtelierId] = 100;
        
        console.log('Image uploaded successfully:', fileName);
        
        // Reset progress after delay
        setTimeout(() => {
          this.inlineUploadProgress[sousAtelierId] = 0;
        }, 2000);
      } else {
        this.handleInlineUploadError(sousAtelierId, xhr);
      }
    };

    xhr.onerror = () => {
      this.handleInlineUploadError(sousAtelierId, xhr);
    };

    xhr.send(file);
  }

  private handleInlineUploadError(sousAtelierId: number, xhr: XMLHttpRequest): void {
    console.error('Error uploading inline image:', {
      status: xhr.status,
      statusText: xhr.statusText,
      response: xhr.responseText
    });
    
    this.uploadingInlineImages[sousAtelierId] = false;
    this.inlineUploadProgress[sousAtelierId] = 0;
    
    alert('Erreur lors de l\'upload de l\'image');
  }// Toggle form visibility
toggleForm(): void {
  this.showForm = !this.showForm;
  if (!this.showForm) {
    this.resetForm();
  }
}

// Show form
showAddForm(): void {
  this.showForm = true;
}

// Hide form and show list
showList(): void {
  this.showForm = false;
  this.resetForm();
}

// Image management methods
openImageDialog(sousAtelier: any): void {
  this.selectedSousAtelier = sousAtelier;
  this.loadSousAtelierImages(sousAtelier);
  this.showImageDialog = true;
}

// Open add image dialog
openAddImageDialog(sousAtelier: any): void {
  this.selectedSousAtelier = sousAtelier;
  this.showAddImageDialog = true;
}

// Close add image dialog
closeAddImageDialog(): void {
  this.showAddImageDialog = false;
  this.selectedSousAtelier = null;
  this.uploadError = '';
  this.isUploading = false;
}

closeImageDialog(): void {
  this.showImageDialog = false;
  this.selectedSousAtelier = null;
  this.sousAtelierImages = [];
  this.uploadError = '';
  this.isUploading = false;
  
  // Reset download state
  this.isDownloading = false;
  this.downloadProgress = 0;
  this.downloadedCount = 0;
  this.totalDownloadCount = 0;
  this.currentDownloadingImage = '';
}

loadSousAtelierImages(sousAtelier: any): void {
  this.sousAtelierImages = sousAtelier.media || [];
}

onImageSelected(event: any): void {
  const files = event.target.files;
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      this.uploadImage(files[i]);
    }
  }
}

// Handle gallery image selection
onGalleryImageSelected(event: any): void {
  const files = event.target.files;
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      this.uploadImageToGallery(files[i]);
    }
  }
}

// Handle add image dialog selection
onAddImageSelected(event: any): void {
  const files = event.target.files;
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      this.uploadImageForSousAtelier(files[i]);
    }
  }
}

// Handle simple gallery image selection
onSimpleImageSelected(event: any): void {
  const files = event.target.files;
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      this.uploadSimpleImage(files[i]);
    }
  }
}

uploadImage(file: File): void {
  this.isUploading = true;
  this.uploadError = '';

  const fileName = file.name;

  // Upload to blob storage using the BlobStorgeService
  // this.blobService.uploadImage(file, fileName, (progressEvent: ProgressEvent) => {
  //   if (progressEvent.lengthComputable) {
  //     // Progress tracking removed
  //   }
  // });


  // setTimeout(() => {
  //   this.mediaService.addMedia(fileName,  this.selectedSousAtelier.id.toString()).subscribe({
  //     next: (mediaResponse) => {
  //       this.isUploading = false;
        
  //       // Refresh images list
  //       this.loadSousAtelierImages(this.selectedSousAtelier.id);
        
  //       setTimeout(() => {
  //         // Progress reset removed
  //       }, 2000);
  //     },
  //     error: (error) => {
  //       console.error('Error saving image to database:', error);
  //       this.uploadError = 'Erreur lors de la sauvegarde en base de données';
  //       this.isUploading = false;
  //     }
  //   });
  // }, 1000); 
}

// Upload image from gallery
uploadImageToGallery(file: File): void {
  this.isUploading = true;
  const sousAtelierId = this.selectedSousAtelier.id;
  this.uploadProgress[sousAtelierId] = 0;
  this.uploadError = '';

  const fileName = file.name;

  // Upload to blob storage using the BlobStorgeService
  this.blobService.uploadImage(file, fileName, (progressEvent: ProgressEvent) => {
    if (progressEvent.lengthComputable) {
      this.uploadProgress[sousAtelierId] = Math.round((progressEvent.loaded / progressEvent.total) * 100);
    }
  });

  setTimeout(() => {
    this.mediaService.addMedia(fileName, this.selectedSousAtelier.id.toString()).subscribe({
      next: (mediaResponse) => {
        this.isUploading = false;
        
        // Refresh images list in gallery
        this.loadSousAtelierImages(this.selectedSousAtelier.id);
        
        setTimeout(() => {
          this.uploadProgress[sousAtelierId] = 0;
        }, 2000);
      },
      error: (error) => {
        console.error('Error saving image to database:', error);
        this.uploadError = 'Erreur lors de la sauvegarde en base de données';
        this.isUploading = false;
        this.uploadProgress[sousAtelierId] = 0;
      }
    });
  }, 1000);
}

// Upload image for sous atelier (from add dialog)
uploadImageForSousAtelier(file: File): void {
  this.isUploading = true;
  const sousAtelierId = this.selectedSousAtelier.id;
  this.uploadProgress[sousAtelierId] = 0;
  this.uploadError = '';

  const fileName = file.name;

  // Upload to blob storage using the BlobStorgeService
  this.blobService.uploadImage(file, fileName, (progressEvent: ProgressEvent) => {
    if (progressEvent.lengthComputable) {
      this.uploadProgress[sousAtelierId] = Math.round((progressEvent.loaded / progressEvent.total) * 100);
    }
  });

  setTimeout(() => {
    this.mediaService.addMedia(fileName, this.selectedSousAtelier.id.toString()).subscribe({
      next: (mediaResponse) => {
        this.isUploading = false;
        
        // Refresh the sous ateliers list to update the table
        this.GetSousAtelier();
        
        setTimeout(() => {
          this.uploadProgress[sousAtelierId] = 0;
          // Close dialog after successful upload
          this.closeAddImageDialog();
        }, 1000);
      },
      error: (error) => {
        console.error('Error saving image to database:', error);
        this.uploadError = 'Erreur lors de la sauvegarde en base de données';
        this.isUploading = false;
        this.uploadProgress[sousAtelierId] = 0;
      }
    });
  }, 1000);
}

// Upload image from simple gallery
uploadSimpleImage(file: File): void {
  this.isUploading = true;
  const sousAtelierId = this.selectedSousAtelier.id;
  this.uploadProgress[sousAtelierId] = 0;
  this.uploadError = '';
  const fileName = file.name;
  this.blobService.uploadImage(file, fileName, (progressEvent: ProgressEvent) => {
    if (progressEvent.lengthComputable) {
      this.uploadProgress[sousAtelierId] = Math.round((progressEvent.loaded / progressEvent.total) * 100);
    }
  });

  setTimeout(() => {
    this.mediaService.addMedia(fileName, this.selectedSousAtelier.id.toString()).subscribe({
      next: (mediaResponse) => {
        this.isUploading = false;
        
        // Refresh images in gallery and table
        this.loadSousAtelierImages(this.selectedSousAtelier.id);
        this.GetSousAtelier();
        
        setTimeout(() => {
          this.uploadProgress[sousAtelierId] = 0;
        }, 1000);
      },
      error: (error) => {
        console.error('Error saving image to database:', error);
        this.uploadError = 'Erreur lors de la sauvegarde en base de données';
        this.isUploading = false;
        this.uploadProgress[sousAtelierId] = 0;
      }
    });
  }, 1000);
}

deleteImage(image: any): void {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
    this.mediaService.deleteMedia(image.id.toString()).subscribe({
      next: () => {
        // Refresh images list
        this.loadSousAtelierImages(this.selectedSousAtelier);
      },
      error: (error) => {
        console.error('Error deleting image:', error);
        alert('Erreur lors de la suppression de l\'image');
      }
    });
  }
}

// Delete image from gallery
deleteImageFromGallery(image: any): void {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
    this.mediaService.deleteMediaAtelier(image).subscribe({
      next: () => {
         this.GetSousAtelier()
        this.loadSousAtelierImages(this.selectedSousAtelier.id);
      },
      error: (error) => {
        console.error('Error deleting image:', error);
        alert('Erreur lors de la suppression de l\'image');
      }
    });
  }
}

getImageUrl(image: any): string {
  return this.blobService.getImageUrl(image.path);
}

// Download all images
downloadAllImages(): void {
  if (this.sousAtelierImages.length === 0) {
    alert('Aucune image à télécharger');
    return;
  }

  this.isDownloading = true;
  this.downloadProgress = 0;
  this.downloadedCount = 0;
  this.totalDownloadCount = 5;
  this.currentDownloadingImage = '';

  this.downloadImagesSequentially(0);
}

// Download images one by one in sequence
private downloadImagesSequentially(index: number): void {
  if (index >= this.sousAtelierImages.length) {
    // All images downloaded
    this.isDownloading = false;
    this.downloadProgress = 100;
    this.currentDownloadingImage = '';
    alert(`Téléchargement terminé! ${this.downloadedCount} images téléchargées.`);
    
    // Reset progress after a delay
    setTimeout(() => {
      this.downloadProgress = 0;
      this.downloadedCount = 0;
      this.totalDownloadCount = 0;
    }, 3000);
    
    return;
  }

  const image = this.sousAtelierImages[index];
  this.currentDownloadingImage = image.path || `Image ${index + 1}`;
  
  // Update progress
  this.downloadProgress = Math.round(((index) / this.totalDownloadCount) * 100);

  this.downloadSingleImage(image).then(() => {
    this.downloadedCount++;
    // Continue with next image after a small delay
    setTimeout(() => {
      this.downloadImagesSequentially(index + 1);
    }, 500); // 500ms delay between downloads
  }).catch((error) => {
    console.error('Error downloading image:', error);
    // Continue with next image even if one fails
    setTimeout(() => {
      this.downloadImagesSequentially(index + 1);
    }, 500);
  });
}

// Download a single image
downloadSingleImage(image: any): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const imageUrl = this.getImageUrl(image);
      const fileName = image.path ? image.path.split('/').pop() : `image_${image.id}.jpg`;
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = fileName;
      link.target = '_blank';
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

openImageGallery(sousAtelier: any): void {
  this.selectedSousAtelier = sousAtelier;
  this.loadSousAtelierImages(sousAtelier);
  this.showImageGallery = true;
}

closeImageGallery(): void {
  this.showImageGallery = false;
  this.selectedSousAtelier = null;
  this.sousAtelierImages = [];
  
  // Reset upload and download state
  this.isUploading = false;
  this.uploadProgress = {};
  this.uploadError = '';
  this.isDownloading = false;
  this.downloadProgress = 0;
  this.downloadedCount = 0;
  this.totalDownloadCount = 0;
  this.currentDownloadingImage = '';
}

// Toggle sous-atelier active status
toggleSousAtelierStatus(sousAtelier: any): void {
  const statusText = sousAtelier.active ? 'activer' : 'désactiver';
  
  if (confirm(`Êtes-vous sûr de vouloir ${statusText} ce sous-atelier ?`)) {
    let body = {
      "id": sousAtelier.id,
      "name": sousAtelier.name,
      "description": sousAtelier.description,
      "atelier": {
        "id": sousAtelier.atelier.id
      },
      "image": sousAtelier.image || '',
      "prix": sousAtelier.prix,
      "active": sousAtelier.active
    };

    this.sousAtelier.Edite(body).subscribe({
      next: (data: any) => {
        console.log('Status updated successfully:', data);
        this.GetSousAtelier();
        const message = sousAtelier.active ? 'Sous-atelier activé avec succès!' : 'Sous-atelier désactivé avec succès!';
        alert(message);
      },
      error: (error) => {
        console.error('Error updating status:', error);
        // Revert the toggle if there's an error
        sousAtelier.active = !sousAtelier.active;
        alert('Erreur lors de la modification du statut.');
      }
    });
  } else {
    // Revert the toggle if user cancels
    sousAtelier.active = !sousAtelier.active;
  }
}

// Video support methods
isImage(path: string): boolean {
  if (!path) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  const extension = path.toLowerCase().substring(path.lastIndexOf('.'));
  return imageExtensions.includes(extension);
}

isVideo(path: string): boolean {
  if (!path) return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
  const extension = path.toLowerCase().substring(path.lastIndexOf('.'));
  return videoExtensions.includes(extension);
}

getVideoMimeType(path: string): string {
  if (!path) return 'video/mp4';
  const extension = path.toLowerCase().substring(path.lastIndexOf('.') + 1);
  const mimeTypes: { [key: string]: string } = {
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogg': 'video/ogg',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'mkv': 'video/x-matroska'
  };
  return mimeTypes[extension] || 'video/mp4';
}

// Inline media upload
uploadMediaInline(event: any, sousAtelier: any): void {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  this.uploadProgress[sousAtelier.id] = 0;

  Array.from(files).forEach((file: any, index: number) => {
    const fileName = file.name;

    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `https://${environment.acountName}.blob.core.windows.net/${environment.containerName}/${fileName}?${environment.blobUrlSaS}`, true);
    xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');

    xhr.upload.onprogress = (progressEvent: ProgressEvent) => {
      if (progressEvent.lengthComputable) {
        this.uploadProgress[sousAtelier.id] = Math.round((progressEvent.loaded / progressEvent.total) * 100);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 201 || xhr.status === 200) {
        this.mediaService.addMedia(fileName, sousAtelier.id.toString()).subscribe({
          next: (mediaResponse) => {
            console.log('Media uploaded successfully');
            this.GetSousAtelier();
            
            setTimeout(() => {
              if (this.uploadProgress[sousAtelier.id]) {
                this.uploadProgress[sousAtelier.id] = 0;
              }
            }, 2000);
          },
          error: (error: any) => {
            console.error('Error saving media to database:', error);
            alert('Erreur lors de la sauvegarde en base de données');
            this.uploadProgress[sousAtelier.id] = 0;
          }
        });
      } else {
        console.error('Upload failed:', xhr.status, xhr.statusText);
        alert('Erreur lors de l\'upload du média');
        this.uploadProgress[sousAtelier.id] = 0;
      }
    };

    xhr.onerror = () => {
      console.error('Upload error');
      alert('Erreur lors de l\'upload du média');
      this.uploadProgress[sousAtelier.id] = 0;
    };

    xhr.send(file);
  });

  event.target.value = '';
}

// Expand media view
expandMediaView(sousAtelier: any): void {
  if (sousAtelier.media && sousAtelier.media.length > 0) {
    const firstMedia = sousAtelier.media[0];
    if (this.isImage(firstMedia.path)) {
      this.showImageInZoom(firstMedia.path, sousAtelier);
    } else if (this.isVideo(firstMedia.path)) {
      this.showVideoInZoom(firstMedia.path, sousAtelier);
    }
  }
}

// Show image in zoom dialog
showImageInZoom(imagePath: string, sousAtelier?: any): void {
  if (sousAtelier) {
    this.selectedSousAtelier = sousAtelier;
    const mediaPath = `${this.url}/${imagePath}`;
    const index = sousAtelier.media.findIndex((m: any) => m.path === imagePath);
    
    this.currentImageIndex = index !== -1 ? index : 0;
    this.totalImagesCount = sousAtelier.media.length;
    this.selectedImage = mediaPath;
    this.showImageGallery = true;
  } else {
    this.selectedImage = `${this.url}/${imagePath}`;
    this.currentImageIndex = 0;
    this.totalImagesCount = 1;
    this.showImageGallery = true;
  }
}

// Show video in zoom dialog
showVideoInZoom(videoPath: string, sousAtelier?: any): void {
  if (sousAtelier) {
    this.selectedSousAtelier = sousAtelier;
    const mediaPath = `${this.url}/${videoPath}`;
    const index = sousAtelier.media.findIndex((m: any) => m.path === videoPath);
    
    this.currentImageIndex = index !== -1 ? index : 0;
    this.totalImagesCount = sousAtelier.media.length;
    this.selectedImage = mediaPath;
    this.showImageGallery = true;
  } else {
    this.selectedImage = `${this.url}/${videoPath}`;
    this.currentImageIndex = 0;
    this.totalImagesCount = 1;
    this.showImageGallery = true;
  }
}

// Navigate to previous image/video
previousImage(): void {
  if (this.selectedSousAtelier && this.currentImageIndex > 0) {
    this.currentImageIndex--;
    const media = this.selectedSousAtelier.media[this.currentImageIndex];
    this.selectedImage = `${this.url}/${media.path}`;
  }
}

// Navigate to next image/video
nextImage(): void {
  if (this.selectedSousAtelier && this.currentImageIndex < this.totalImagesCount - 1) {
    this.currentImageIndex++;
    const media = this.selectedSousAtelier.media[this.currentImageIndex];
    this.selectedImage = `${this.url}/${media.path}`;
  }
}

// Go to specific image/video
goToImage(index: number): void {
  if (this.selectedSousAtelier && index >= 0 && index < this.totalImagesCount) {
    this.currentImageIndex = index;
    const media = this.selectedSousAtelier.media[index];
    this.selectedImage = `${this.url}/${media.path}`;
  }
}


}
