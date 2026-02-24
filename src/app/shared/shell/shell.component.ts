import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { SidebarService } from '../sidebar/sidebar.service';
import { DashboardSettings, SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css'
})
export class ShellComponent implements OnInit, OnDestroy {
  isCollapsed: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private sidebarService: SidebarService,
    private settingsService: SettingsService,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.subscription.add(
      this.sidebarService.isCollapsed$.subscribe(collapsed => {
        this.isCollapsed = collapsed;
      })
    );

    // Apply settings globally
    this.subscription.add(
      this.settingsService.settings$.subscribe(settings => {
        this.applySettings(settings);
      })
    );
  }

  private applySettings(settings: DashboardSettings): void {
    const fontSizeMap: { [key: string]: string } = {
      'small': '12px',
      'normal': '14px',
      'large': '16px',
      'xlarge': '18px'
    };

    const body = document.body;

    // Set base font properties
    body.style.fontSize = fontSizeMap[settings.fontSize] || '14px';
    body.style.fontWeight = settings.fontBold ? '700' : '400';
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    // Reset body styles on destroy
    const body = document.body;
    body.style.setProperty('zoom', '');
    body.style.fontSize = '';
    body.style.fontWeight = '';
  }
}
