import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject } from 'rxjs';

export interface DashboardSettings {
    fontSize: string; // 'normal' | 'large' | 'bold'
    fontBold: boolean;
}

const DEFAULT_SETTINGS: DashboardSettings = {
    fontSize: 'normal',
    fontBold: false
};

const COOKIE_KEY = 'dashboard_settings';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {

    private settingsSubject = new BehaviorSubject<DashboardSettings>(DEFAULT_SETTINGS);
    settings$ = this.settingsSubject.asObservable();

    constructor(private cookieService: CookieService) {
        this.loadFromCookies();
    }

    private loadFromCookies(): void {
        const saved = this.cookieService.get(COOKIE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as DashboardSettings;
                this.settingsSubject.next({ ...DEFAULT_SETTINGS, ...parsed });
            } catch {
                this.settingsSubject.next(DEFAULT_SETTINGS);
            }
        }
    }

    getSettings(): DashboardSettings {
        return this.settingsSubject.getValue();
    }

    saveSettings(settings: DashboardSettings): void {
        this.settingsSubject.next(settings);
        // Save to cookie with 365 days expiry
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);
        this.cookieService.set(COOKIE_KEY, JSON.stringify(settings), expires, '/');
    }

    resetSettings(): void {
        this.saveSettings(DEFAULT_SETTINGS);
    }
}
