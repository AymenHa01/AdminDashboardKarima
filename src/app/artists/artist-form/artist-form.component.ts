import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ArtisteService } from '../../services/artiste.service';

@Component({
  selector: 'app-artist-form',
  templateUrl: './artist-form.component.html',
  styleUrl: './artist-form.component.scss'
})
export class ArtistFormComponent {
//   artisteForm: any;
//   progress : number = 0
//   file: any;
//   constructor(private fb: FormBuilder ,private artiste :  ArtisteService , private blob : BlobStorgeService ) {}

//   ngOnInit(): void {
//     this.artisteForm = this.fb.group({
//       nom: ['', [Validators.required, Validators.minLength(2)]],
//       prenom: ['', [Validators.required, Validators.minLength(2)]],
//       email: ['', [Validators.required, Validators.email]],
//       numero: ['', [Validators.required, Validators.pattern('[0-9]{10}')]], // 10-digit number
//       image: ['']
//     });
//   }
//   SelectImage(event : any ){
//   this.file =event.target.files[0]

// }
//   onSubmit(): void {
//     this.artisteForm.image = "https://artimages.blob.core.windows.net/images/" + this.file.name;
//     console.log(this.artisteForm.image); 
//     if (this.artisteForm.valid) {
//       console.log('Form Data: ', this.artisteForm.value);
      
//       this.artiste.AddArtiste(this.artisteForm.value).subscribe((data)=>{
//         this.imageSelected()
//       })
//       }
//     } 
//     // imageSelected(event : any ){
//     //   let file =event.target.files[0]
    
//     //  this.blob.uploadImage(this.sas , file , file.name , ()=>{},(event: ProgressEvent) => {
//     //   const progress = (event.loaded / event.total) * 100;
//     //   console.log(`Upload Progress: ${progress}%`);
//     // })
//     // }
//     imageSelected( ){
//       this.blob.uploadImage( this.file, this.file.name, (event: ProgressEvent) => {
//         const progress = (event.loaded / event.total) * 100;
//         this.progress=progress
//       });
      
//     }


  
  }
