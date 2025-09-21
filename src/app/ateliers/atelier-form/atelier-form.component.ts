import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AtelierService } from '../../services/atelier.service';

@Component({
  selector: 'app-atelier-form',
  templateUrl: './atelier-form.component.html',
  styleUrl: './atelier-form.component.scss'
})
export class AtelierFormComponent {
  atelierForm: any;

  constructor(private fb: FormBuilder , private  Atelier :AtelierService  ) { }

  ngOnInit(): void {
    this.atelierForm = this.fb.group({
      id: [null], 
      name: ['', Validators.required],
      description: [''],
      image: [''],
      
    });
  }
  addSousAtelier(){

  }


  onSubmit() {
    if (this.atelierForm.valid) {
    this.Atelier.addAtelier(this.atelierForm.value).subscribe((data : any )=>
    console.log(data)
    
    )  
  }
}


}
