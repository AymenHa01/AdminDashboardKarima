import { Component, OnInit } from '@angular/core';
import { UtilisateurService } from '../../services/utilisateur/utilisateur.service';
import { MessageService } from 'primeng/api';

interface UserWithParticipations {
  id: number;
  username: string;
  nom: string;
  prenom: string;
  email: string;
  numero: string;
  age: number;
  image: string;
  statut: boolean;
  role: string;
  participations?: {
    evenements: any[];
    formations: any[];
    sousAteliers: any[];
  };
  participationTypes?: string[];
}

@Component({
  selector: 'app-utilisateur-list',
  templateUrl: './utilisateur-list.component.html',
  styleUrl: './utilisateur-list.component.scss'
})
export class UtilisateurListComponent implements OnInit {
  utilisateurs: UserWithParticipations[] = [];
  filteredUtilisateurs: UserWithParticipations[] = [];
  loading: boolean = false;
  
  // Filter options
  selectedFilterType: string = 'ALL';
  filterOptions = [
    { label: 'All Users', value: 'ALL' },
    { label: 'Events Only', value: 'EVENEMENT' },
    { label: 'Formations Only', value: 'Formation' },
    { label: 'Ateliers Only', value: 'SousAtelier' },
    { label: 'No Participations', value: 'NONE' }
  ];

  constructor(
    private utilisateurService: UtilisateurService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.utilisateurService.gertAllUsers().subscribe({
      next: (data: any) => {
        this.utilisateurs = data.body || [];
        console.log("Users loaded:", this.utilisateurs);
        this.loadUserParticipations();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users'
        });
        this.loading = false;
      }
    });
  }

  loadUserParticipations() {
    const participationPromises = this.utilisateurs.map(user => 
      this.utilisateurService.getUserParticipations(user.id).toPromise()
        .then((response: any) => {
          user.participations = {
            evenements: response.evenements || [],
            formations: response.formations || [],
            sousAteliers: response.sousAteliers || []
          };
          
          // Determine participation types for filtering
          user.participationTypes = [];
          if (user.participations.evenements.length > 0) user.participationTypes.push('EVENEMENT');
          if (user.participations.formations.length > 0) user.participationTypes.push('Formation');
          if (user.participations.sousAteliers.length > 0) user.participationTypes.push('SousAtelier');
          
          return user;
        })
        .catch(error => {
          console.error(`Error loading participations for user ${user.id}:`, error);
          user.participations = { evenements: [], formations: [], sousAteliers: [] };
          user.participationTypes = [];
          return user;
        })
    );

    Promise.all(participationPromises).then(() => {
      this.applyFilter();
      this.loading = false;
    });
  }

  applyFilter() {
    if (this.selectedFilterType === 'ALL') {
      this.filteredUtilisateurs = [...this.utilisateurs];
    } else if (this.selectedFilterType === 'NONE') {
      this.filteredUtilisateurs = this.utilisateurs.filter(user => 
        !user.participationTypes || user.participationTypes.length === 0
      );
    } else {
      this.filteredUtilisateurs = this.utilisateurs.filter(user => 
        user.participationTypes && user.participationTypes.includes(this.selectedFilterType)
      );
    }
  }

  onFilterChange() {
    this.applyFilter();
  }

  getParticipationSummary(user: UserWithParticipations): string {
    if (!user.participations) return 'Loading...';
    
    const summary: string[] = [];
    if (user.participations.evenements.length > 0) {
      summary.push(`${user.participations.evenements.length} Event(s)`);
    }
    if (user.participations.formations.length > 0) {
      summary.push(`${user.participations.formations.length} Formation(s)`);
    }
    if (user.participations.sousAteliers.length > 0) {
      summary.push(`${user.participations.sousAteliers.length} Atelier(s)`);
    }
    
    return summary.length > 0 ? summary.join(', ') : 'No participations';
  }

  getParticipationDetails(user: UserWithParticipations): string {
    if (!user.participations) return '';
    
    const details: string[] = [];
    
    user.participations.evenements.forEach(event => {
      details.push(`Event: ${event.nom || event.title || 'Unknown'}`);
    });
    
    user.participations.formations.forEach(formation => {
      details.push(`Formation: ${formation.nom || formation.title || 'Unknown'}`);
    });
    
    user.participations.sousAteliers.forEach(atelier => {
      details.push(`Atelier: ${atelier.nom || atelier.name || 'Unknown'}`);
    });
    
    return details.join('\n');
  }
}
