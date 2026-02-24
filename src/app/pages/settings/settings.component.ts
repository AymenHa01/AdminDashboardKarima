import { Component, OnInit } from '@angular/core';
import { DashboardSettings, SettingsService } from '../../services/settings.service';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

    settings: DashboardSettings = {
        fontSize: 'normal',
        fontBold: false
    };

    fontSizeOptions = [
        { label: 'Petite', value: 'small' },
        { label: 'Normale', value: 'normal' },
        { label: 'Grande', value: 'large' },
        { label: 'Très grande', value: 'xlarge' },
    ];

    constructor(
        private settingsService: SettingsService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        this.settings = { ...this.settingsService.getSettings() };
    }

    saveSettings(): void {
        this.settingsService.saveSettings(this.settings);
        this.messageService.add({
            severity: 'success',
            summary: 'Paramètres sauvegardés',
            detail: 'Vos préférences ont été enregistrées dans les cookies.'
        });
    }

    resetSettings(): void {
        this.settingsService.resetSettings();
        this.settings = { ...this.settingsService.getSettings() };
        this.messageService.add({
            severity: 'info',
            summary: 'Paramètres réinitialisés',
            detail: 'Les paramètres par défaut ont été restaurés.'
        });
    }

}
