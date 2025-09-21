import { Component, OnInit } from '@angular/core';
import { FormationService } from '../../services/formation.service';
import { Formation } from '../../Models/formation.model';
import { log } from 'console';

@Component({
  selector: 'app-formation-form',
  templateUrl: './formation-form.component.html',
  styleUrls: ['./formation-form.component.scss']
})
export class FormationFormComponent implements OnInit {
  formation: any  = {
    name: '',
    description: '',
    formateur: '',
    debut: '',
    fin: '',
    heures: 0,
    prix: 0,
    image: ''
  };

  constructor(private formationService: FormationService) {}

  ngOnInit(): void {
    // Exemple de récupération de formation, ici je simule la récupération
    // Remplacez ceci par la méthode réelle pour récupérer la formation
    this.formationService.getFormationById(1).subscribe(
      (data: Formation) => {
        console.log('Formation récupérée:', data);
        // Convertir les dates au format YYYY-MM-DD
        this.formation.debut = this.formatDateForInput(this.formation.debut);
        this.formation.fin = this.formatDateForInput(this.formation.fin);
        
        // Assignation des autres valeurs
        this.formation.name = this.formation.name;
        this.formation.description = this.formation.description;
        this.formation.formateur = this.formation.formateur;
        this.formation.heures = this.formation.heures;
        this.formation.prix = this.formation.prix;
        this.formation.image = this.formation.image;
      },
      (error) => {
        console.error('Erreur lors de la récupération de la formation', error);
      }
    );
  }

  formatDateForInput(dateStr: string): string {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mois de 1 à 12
    const day = String(date.getDate()).padStart(2, '0'); // Jour de 1 à 31
    
    return `${year}-${month}-${day}`;
  }

  onSubmit() {
    console.log('Formation à soumettre:', this.formation);
    
    this.formationService.addFormation(this.formation)
      .subscribe(
        response => {
          console.log('Formation ajoutée avec succès', response);
        },
        error => {
          console.error('Erreur lors de l\'ajout de la formation', error);
        }
      );
  }
}
