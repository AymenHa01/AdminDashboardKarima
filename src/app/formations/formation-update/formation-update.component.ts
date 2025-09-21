import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormationService } from '../../services/formation.service';
import { Formation } from '../../Models/formation.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-formation-update',
  templateUrl: './formation-update.component.html',
  styleUrls: ['./formation-update.component.scss']
})
export class FormationUpdateComponent implements OnInit {
  formationForm: FormGroup;
  formation: any ;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private formationService: FormationService,
    private router: Router,
  ) {
    this.formationForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      formateur: ['', Validators.required],
      debut: ['', Validators.required],
      fin: ['', Validators.required],
      heures: [0, Validators.required],
      prix: [0, Validators.required],
      image: ['']
    });
  }

  ngOnInit(): void {
    // Retrieve the formation from navigation state
    this.formation  = history.state.formation;

    if (this.formation) {
      // Set form default values
      this.formationForm.patchValue({
        name: this.formation.name,
        description: this.formation.description,
        formateur: this.formation.formateur,
        debut: this.formation.debut,
        fin: this.formation.fin,
        heures: this.formation.heures,
        prix: this.formation.prix,
        image: this.formation.image
      });
    } else {
      // Fallback to fetching the formation if not available in state
      const id = +this.route.snapshot.paramMap.get('id')!;
      if (id) {
        this.formationService.getFormationById(id).subscribe(
          (data: Formation) => {
            this.formation = data;
            this.formationForm.patchValue(data);
          },
          (error) => {
            console.error('Erreur lors de la récupération de la formation:', error);
          }
        );
      }
    }
  }

  onSubmit(): void {
    if (this.formation) {
      const updatedFormation: Formation = { ...this.formation, ...this.formationForm.value };
      console.log(updatedFormation);
      
      this.formationService.updateFormation(updatedFormation).subscribe(
        () => {
          this.router.navigate(['/formations']);
        },
        (error) => {
          console.error('Erreur lors de la mise à jour de la formation:', error);
        }
      );
    }
  }
}
