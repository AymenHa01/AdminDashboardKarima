import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EvenementService } from '../../services/evenement.service';

@Component({
  selector: 'app-evenement-form',
  templateUrl: './evenement-form.component.html',
  styleUrl: './evenement-form.component.scss'
})
export class EvenementFormComponent implements OnInit  {
  evenementForm: any;
  constructor(private formBuilder: FormBuilder ,private evenemt:EvenementService  ) { }

  
  ngOnInit(): void {
    this.evenementForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      prix: ['', [Validators.required, Validators.min(0)]],
      image: ['']
    });


    


  }

  onSubmit(): void {
    if (this.evenementForm.valid) {
      const formData = this.evenementForm.value;
      this.evenemt.AddEvenemt(formData).subscribe((response)=>
      {
        if (response.status ==200 ) {
          window.alert('This is a simple alert message!');
        }
      })
    }
  }
}
