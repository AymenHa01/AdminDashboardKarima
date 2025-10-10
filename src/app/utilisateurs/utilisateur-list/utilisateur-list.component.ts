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
  expanded?: boolean;
  participations?: {
    evenements: any[];
    formations: any[];
    sousAteliers: any[];
  };
  participationTypes?: string[];
  adherents?: Array<{
    id: number;
    type: string;
    idType: number;
  }>;
  // Additional fields to help with search
  searchDetails?: {
    eventNames: string[];
    formationNames: string[];
    atelierNames: string[];
  };
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
  
  // Search and filter
  searchText: string = '';
  selectedFilterType: string = 'ALL';
  viewMode: 'table' | 'cards' = 'table';
  searchBy: string = 'user'; // Options: 'user', 'evenement', 'formation', 'atelier'
  
  // Pagination
  currentPage: number = 0;
  rowsPerPage: number = 10;
  totalRecords: number = 0;
  
  // Statistics
  totalEventSubscriptions: number = 0;
  totalFormationSubscriptions: number = 0;
  totalAtelierSubscriptions: number = 0;
  
  // Filter options
  filterOptions = [
    { label: 'All Users', value: 'ALL' },
    { label: 'Events Only', value: 'EVENEMENT' },
    { label: 'Formations Only', value: 'Formation' },
    { label: 'Ateliers Only', value: 'SousAtelier' },
    { label: 'Active Participants', value: 'ACTIVE' },
    { label: 'No Participations', value: 'NONE' }
  ];
  
  // Search options
  searchOptions = [
    { label: 'Search by User', value: 'user' },
    { label: 'Search by Event', value: 'evenement' },
    { label: 'Search by Formation', value: 'formation' },
    { label: 'Search by Atelier', value: 'atelier' }
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
    this.totalEventSubscriptions = 0;
    this.totalFormationSubscriptions = 0;
    this.totalAtelierSubscriptions = 0;
    
    const participationPromises = this.utilisateurs.map(user => 
      this.utilisateurService.getUserParticipations(user.id).toPromise()
        .then((response: any) => {
          user.participations = {
            evenements: response.evenements || [],
            formations: response.formations || [],
            sousAteliers: response.sousAteliers || []
          };
          
          // Update global subscription counts
          this.totalEventSubscriptions += user.participations.evenements.length;
          this.totalFormationSubscriptions += user.participations.formations.length;
          this.totalAtelierSubscriptions += user.participations.sousAteliers.length;
          
          // Determine participation types for filtering
          user.participationTypes = [];
          if (user.participations.evenements.length > 0) user.participationTypes.push('EVENEMENT');
          if (user.participations.formations.length > 0) user.participationTypes.push('Formation');
          if (user.participations.sousAteliers.length > 0) user.participationTypes.push('SousAtelier');
          
          // Extract participation names for search functionality
          user.searchDetails = {
            eventNames: user.participations.evenements.map(event => 
              (event.nom || event.title || '').toLowerCase()
            ),
            formationNames: user.participations.formations.map(formation => 
              (formation.nom || formation.title || '').toLowerCase()
            ),
            atelierNames: user.participations.sousAteliers.map(atelier => 
              (atelier.nom || atelier.name || '').toLowerCase()
            )
          };
          
          return user;
        })
        .catch(error => {
          console.error(`Error loading participations for user ${user.id}:`, error);
          user.participations = { evenements: [], formations: [], sousAteliers: [] };
          user.participationTypes = [];
          user.searchDetails = { eventNames: [], formationNames: [], atelierNames: [] };
          return user;
        })
    );

    Promise.all(participationPromises).then(() => {
      this.applyFilters();
      this.loading = false;
    });
  }

  // Search functionality
  onSearchChange() {
    this.currentPage = 0; // Reset to first page when search changes
    this.applyFilters();
  }

  // Filter functionality
  onFilterChange() {
    this.currentPage = 0; // Reset to first page when filter changes
    this.applyFilters();
  }
  
  // Search type functionality
  onSearchTypeChange() {
    this.searchText = ''; // Clear search when changing search type
    this.applyFilters();
  }
  
  // Pagination
  onPageChange(event: any) {
    this.currentPage = event.page;
    this.rowsPerPage = event.rows;
    // No need to call applyFilters as PrimeNG handles pagination internally
  }

  applyFilters() {
    let filtered = [...this.utilisateurs];

    // Apply text search based on search type
    if (this.searchText && this.searchText.trim()) {
      const searchTerm = this.searchText.toLowerCase().trim();
      
      switch (this.searchBy) {
        case 'user':
          filtered = filtered.filter(user => 
            user.nom?.toLowerCase().includes(searchTerm) ||
            user.prenom?.toLowerCase().includes(searchTerm) ||
            user.email?.toLowerCase().includes(searchTerm) ||
            user.username?.toLowerCase().includes(searchTerm)
          );
          break;
        
        case 'evenement':
          filtered = filtered.filter(user => 
            user.searchDetails?.eventNames.some(eventName => 
              eventName.includes(searchTerm)
            )
          );
          break;
        
        case 'formation':
          filtered = filtered.filter(user => 
            user.searchDetails?.formationNames.some(formationName => 
              formationName.includes(searchTerm)
            )
          );
          break;
        
        case 'atelier':
          filtered = filtered.filter(user => 
            user.searchDetails?.atelierNames.some(atelierName => 
              atelierName.includes(searchTerm)
            )
          );
          break;
      }
    }

    // Apply participation filter
    if (this.selectedFilterType === 'ALL') {
      // No additional filtering
    } else if (this.selectedFilterType === 'NONE') {
      filtered = filtered.filter(user => 
        !user.participationTypes || user.participationTypes.length === 0
      );
    } else if (this.selectedFilterType === 'ACTIVE') {
      filtered = filtered.filter(user => 
        user.participationTypes && user.participationTypes.length > 0
      );
    } else {
      filtered = filtered.filter(user => 
        user.participationTypes && user.participationTypes.includes(this.selectedFilterType)
      );
    }

    this.filteredUtilisateurs = filtered;
    this.totalRecords = filtered.length;
  }

  // View mode
  setViewMode(mode: 'table' | 'cards') {
    this.viewMode = mode;
  }

  // User actions
  toggleUserDetails(user: UserWithParticipations) {
    user.expanded = !user.expanded;
  }

  viewUserDetails(user: UserWithParticipations) {
    // Implement user details view
    console.log('View user details:', user);
    this.messageService.add({
      severity: 'info',
      summary: 'User Details',
      detail: `Viewing details for ${user.prenom} ${user.nom}`
    });
  }

  editUser(user: UserWithParticipations) {
    // Implement user editing
    console.log('Edit user:', user);
    this.messageService.add({
      severity: 'info',
      summary: 'Edit User',
      detail: `Editing ${user.prenom} ${user.nom}`
    });
  }

  viewAnalytics(user: UserWithParticipations) {
    // Implement analytics view
    console.log('View analytics for user:', user);
    this.messageService.add({
      severity: 'info',
      summary: 'User Analytics',
      detail: `Viewing analytics for ${user.prenom} ${user.nom}`
    });
  }

  // Utility methods
  hasParticipations(user: UserWithParticipations): boolean {
    return !!(user.participationTypes && user.participationTypes.length > 0);
  }

  getActiveUsersCount(): number {
    return this.utilisateurs.filter(user => user.statut).length;
  }

  getUsersWithParticipationsCount(): number {
    return this.utilisateurs.filter(user => this.hasParticipations(user)).length;
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

  getSearchPlaceholder(): string {
    const option = this.searchOptions.find(opt => opt.value === this.searchBy);
    return `Search by ${option?.label || 'User'}`;
  }
}
