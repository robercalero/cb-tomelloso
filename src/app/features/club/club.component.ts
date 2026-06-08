import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { environment } from '../../../environments/environment';

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

interface BoardMember {
  name: string;
  role: string;
}

@Component({
  selector: 'app-club',
  standalone: true,
  imports: [MatIconModule, MatCardModule],
  templateUrl: './club.component.html',
  styleUrl: './club.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClubComponent implements OnInit {
  private title = inject(Title);
  private meta = inject(Meta);

  readonly timeline: TimelineEvent[] = [
    { year: '1980', title: 'Inicios del baloncesto en Tomelloso', description: 'Primeros equipos de baloncesto comienzan a formarse en Tomelloso, vinculados al Atlético Tomelloso.' },
    { year: '1990', title: 'Consolidación como club independiente', description: 'El Club Baloncesto Tomelloso se desvincula del Atlético Tomelloso y se consolida como club independiente.' },
    { year: '2000', title: 'Primeras competiciones regionales', description: 'El club comienza a competir en la Primera Nacional Masculina de Castilla-La Mancha.' },
    { year: '2010', title: 'Crecimiento de la cantera', description: 'Se potencian las categorías de base con escuelas de baloncesto y equipos en todas las categorías.' },
    { year: '2020', title: 'Nuevo patrocinio: Val Brokers', description: 'Jiménez Valentín Seguros (Val Brokers) se convierte en patrocinador principal del club.' },
    { year: '2024', title: 'Renuncia a la competición 2024/2025', description: 'El club decide no competir en la temporada 2024/2025, centrándose en reestructurar el proyecto.' },
    { year: '2025', title: 'Nueva etapa', description: 'El CB Tomelloso relanza su proyecto deportivo con equipos sénior y júnior en competición autonómica.' }
  ];

  readonly board: BoardMember[] = [
    { name: 'José Lara', role: 'Presidente' },
    { name: 'Javier Arias', role: 'Vicepresidente' },
    { name: 'Carlos López', role: 'Secretario' },
    { name: 'Eva Temprano', role: 'Tesorera' },
    { name: 'Joaquín Peinado', role: 'Vocal' },
    { name: 'Teresa Becerra', role: 'Vocal' },
    { name: 'Daniel Bonillo', role: 'Vocal' }
  ];

  readonly values = [
    { icon: 'school', title: 'Formación', description: 'Promovemos el aprendizaje y la mejora continua de nuestros jugadores, entrenadores y directivos.' },
    { icon: 'emoji_events', title: 'Competición', description: 'Fomentamos el espíritu competitivo y el esfuerzo como motores del crecimiento deportivo.' },
    { icon: 'diversity_3', title: 'Comunidad', description: 'Somos un club abierto, integrado en la sociedad tomellosera y comprometido con nuestro entorno.' },
    { icon: 'trending_up', title: 'Crecimiento', description: 'Buscamos la evolución constante del club en todos los ámbitos, deportivos y organizativos.' }
  ];

  ngOnInit(): void {
    this.title.setTitle(`El Club - ${environment.titleSuffix}`);
    this.meta.updateTag({ name: 'description', content: 'Conoce la historia, la junta directiva y los valores del Club Baloncesto Tomelloso.' });
  }
}
