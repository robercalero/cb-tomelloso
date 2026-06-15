import { ChangeDetectionStrategy, Component, inject, OnInit, computed } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SponsorsService } from '../../core/services/sponsors.service';
import { environment } from '../../../environments/environment';

interface SponsorPlan {
  tier: string;
  price: string;
  benefits: string[];
  highlighted?: boolean;
}

@Component({
  selector: 'app-sponsors',
  standalone: true,
  imports: [
    RouterLink,
    TitleCasePipe,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './sponsors.component.html',
  styleUrl: './sponsors.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SponsorsComponent implements OnInit {
  private sponsorsService = inject(SponsorsService);
  private title = inject(Title);
  private meta = inject(Meta);

  readonly sponsors = this.sponsorsService.sponsors;
  readonly mainSponsor = computed(() => this.sponsors().find(s => s.tier === 'principal'));
  readonly otherSponsors = computed(() => this.sponsors().filter(s => s.tier !== 'principal'));

  readonly plans: SponsorPlan[] = [
    {
      tier: 'Bronce',
      price: '200€',
      benefits: [
        'Logo en web del club',
        'Mención en redes sociales',
        'Certificado de colaboración'
      ]
    },
    {
      tier: 'Plata',
      price: '500€',
      benefits: [
        'Todo lo del plan Bronce',
        'Logo en equipaciones de entrenamiento',
        'Publicidad en pabellón (panel pequeño)',
        'Mención en entrevistas'
      ],
      highlighted: true
    },
    {
      tier: 'Oro',
      price: '1.000€',
      benefits: [
        'Todo lo del plan Plata',
        'Logo en equipación oficial de competición',
        'Publicidad en pabellón (panel grande)',
        'Presencia en ruedas de prensa',
        'Invitaciones a eventos exclusivos'
      ]
    },
    {
      tier: 'Principal',
      price: 'Personalizado',
      benefits: [
        'Exclusividad en equipación',
        'Naming del equipo',
        'Máxima visibilidad en todos los soportes',
        'Presencia en todos los actos',
        'Colaboración en la estrategia del club',
        'Trato VIP en todos los partidos'
      ],
      highlighted: true
    }
  ];

  ngOnInit(): void {
    this.title.setTitle(`Patrocinadores - ${environment.titleSuffix}`);
    this.meta.updateTag({ name: 'description', content: 'Patrocinadores del Club Baloncesto Tomelloso. Descubre cómo colaborar con el CB Tomelloso.' });

    this.sponsorsService.loadSponsors();
  }
}
