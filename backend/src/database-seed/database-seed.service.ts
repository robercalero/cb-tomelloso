import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '../news/entities/news.entity';
import { Team } from '../teams/entities/team.entity';
import { Player } from '../players/entities/player.entity';
import { Match } from '../matches/entities/match.entity';
import { Sponsor } from '../sponsors/entities/sponsor.entity';
import { Gallery } from '../gallery/entities/gallery.entity';
import { Activity } from '../activities/entities/activity.entity';

@Injectable()
export class DatabaseSeedService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeedService.name);

  constructor(
    @InjectRepository(News) private newsRepo: Repository<News>,
    @InjectRepository(Team) private teamRepo: Repository<Team>,
    @InjectRepository(Player) private playerRepo: Repository<Player>,
    @InjectRepository(Match) private matchRepo: Repository<Match>,
    @InjectRepository(Sponsor) private sponsorRepo: Repository<Sponsor>,
    @InjectRepository(Gallery) private galleryRepo: Repository<Gallery>,
    @InjectRepository(Activity) private activityRepo: Repository<Activity>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV === 'production') return;
    const count = await this.newsRepo.count();
    if (count > 0) {
      this.logger.log('Base de datos ya tiene datos — seed omitido');
      return;
    }
    this.logger.log('Sembrando datos completos de la aplicación...');
    await this.seedNews();
    await this.seedTeamsAndPlayers();
    await this.seedMatches();
    await this.seedSponsors();
    await this.seedGallery();
    await this.seedActivities();
    this.logger.log('Seed completado');
  }

  private async seedNews(): Promise<void> {
    const newsItems = [
      {
        title: 'CB Tomelloso arranca la pretemporada 2025/2026',
        slug: 'arranca-pretemporada-2025-2026',
        excerpt: 'El Club Baloncesto Tomelloso ha comenzado los entrenamientos de pretemporada con vistas a una temporada ilusionante.',
        content: `<p>El pasado lunes, las distintas categorías del CB Tomelloso iniciaron los entrenamientos de pretemporada de cara a la temporada 2025/2026. El equipo Senior, dirigido por su entrenador, ya trabaja en el Pabellón Municipal con el objetivo de mejorar los resultados de la campaña anterior.</p><p>La plantilla cuenta con las altas de varios jugadores jóvenes procedentes de la cantera, reflejo del trabajo realizado en las categorías inferiores. El club confía en que esta temporada sea la del despegue definitivo.</p><p>Los abonados podrán asistir a los partidos amistosos de pretemporada que se irán anunciando próximamente.</p>`,
        category: 'club' as const,
        imageUrl: 'https://placehold.co/1200x600/1a5276/f39c12?text=Pretemporada+CB+Tomelloso',
        isPublished: true,
        publishedAt: new Date('2026-08-15'),
        source: 'web' as const,
      },
      {
        title: 'Victoria contundente del Senior frente al CB Alcázar',
        slug: 'victoria-senior-cb-alcazar',
        excerpt: 'El CB Tomelloso se impuso por 82-65 en un partido dominado de principio a fin.',
        content: `<p>El equipo Senior del CB Tomelloso logró una importante victoria en casa frente al CB Alcázar por un marcador de 82-65. Los locales dominaron el encuentro desde el primer cuarto, con una defensa sólida y un ataque efectivo.</p><p>El jugador más destacado fue el base Rubén Sánchez, que anotó 18 puntos y repartió 7 asistencias. También fue clave la actuación de Carlos Martínez en el rebote defensivo.</p><p>Con esta victoria, el CB Tomelloso se sitúa en la parte alta de la clasificación de la 1ª Autonómica.</p>`,
        category: 'resultado' as const,
        imageUrl: 'https://placehold.co/1200x600/e74c3c/ffffff?text=Victoria+CB+Tomelloso',
        isPublished: true,
        publishedAt: new Date('2026-10-20'),
        source: 'web' as const,
      },
      {
        title: 'La cantera del CB Tomelloso brilla en el Torneo de Ciudad Real',
        slug: 'cantera-torneo-ciudad-real',
        excerpt: 'Los equipos de categorías inferiores del club dejaron el pabellón muy alto en el torneo provincial.',
        content: `<p>Las categorías inferiores del CB Tomelloso participaron este fin de semana en el Torneo de Baloncesto Base de Ciudad Real, cosechando excelentes resultados.</p><p>El equipo Alevín se alzó con el primer puesto de su categoría, mientras que el Infantil y el Cadete alcanzaron las semifinales. El trabajo de la cantera es uno de los pilares fundamentales del club.</p><p>La directiva quiere felicitar a todos los jugadores y entrenadores por su dedicación y esfuerzo.</p>`,
        category: 'cantera' as const,
        imageUrl: 'https://placehold.co/1200x600/2ecc71/ffffff?text=Cantera+CB+Tomelloso',
        isPublished: true,
        publishedAt: new Date('2026-09-10'),
        source: 'web' as const,
      },
      {
        title: 'Presentadas las nuevas equipaciones oficiales 2025/2026',
        slug: 'nuevas-equipaciones-2025-2026',
        excerpt: 'El club ha presentado las nuevas camisetas de juego para la temporada, con un diseño renovado.',
        content: `<p>El CB Tomelloso ha presentado oficialmente las nuevas equipaciones para la temporada 2025/2026. Las camisetas, fabricadas con tejido técnico transpirable, lucen los colores tradicionales del club: azul, verde y blanco.</p><p>La primera equipación mantiene el clásico azul verdoso con detalles en amarillo, mientras que la segunda es completamente blanca. Ambas incluyen el escudo bordado del club y el logo del patrocinador principal.</p><p>Las nuevas equipaciones ya están disponibles en la tienda oficial del club.</p>`,
        category: 'evento' as const,
        imageUrl: 'https://placehold.co/1200x600/f39c12/1a5276?text=Nuevas+Equipaciones',
        isPublished: true,
        publishedAt: new Date('2026-08-01'),
        source: 'web' as const,
      },
      {
        title: 'Abierto el plazo de inscripción para la Escuela de Baloncesto',
        slug: 'escuela-baloncesto-inscripcion',
        excerpt: 'Ya está abierto el plazo de matriculación para la Escuela Municipal de Baloncesto del CB Tomelloso.',
        content: `<p>La Escuela de Baloncesto del CB Tomelloso abre su período de inscripción para la temporada 2025/2026. La escuela está dirigida a niños y niñas de 4 a 14 años, divididos en grupos por edades.</p><p>Los entrenamientos se realizarán en el Pabellón Municipal y serán impartidos por monitores titulados. El precio incluye la equipación de entrenamiento completa.</p><p>Las plazas son limitadas. Los interesados pueden inscribirse a través del formulario de la web o acudiendo directamente a las oficinas del club.</p>`,
        category: 'cantera' as const,
        imageUrl: 'https://placehold.co/1200x600/3498db/ffffff?text=Escuela+Baloncesto',
        isPublished: true,
        publishedAt: new Date('2026-07-20'),
        source: 'web' as const,
      },
      {
        title: 'CB Tomelloso y Val Brokers renuevan su compromiso',
        slug: 'renovacion-val-brokers',
        excerpt: 'El club renueva su acuerdo de patrocinio con Val Brokers para las próximas tres temporadas.',
        content: `<p>El CB Tomelloso y Val Brokers han alcanzado un acuerdo de renovación del patrocinio principal por tres temporadas más. Val Brokers continuará siendo el patrocinador principal del club, apareciendo en la parte frontal de las camisetas de juego.</p><p>El acto de firma tuvo lugar en las instalaciones de Val Brokers con la presencia del presidente del club y los directivos de la empresa. Ambas partes han mostrado su satisfacción por la continuidad de una relación que se ha mantenido durante más de 5 años.</p><p>Este acuerdo permite al club planificar con estabilidad las próximas temporadas.</p>`,
        category: 'club' as const,
        imageUrl: 'https://placehold.co/1200x600/1a5276/f39c12?text=Val+Brokers+CB+Tomelloso',
        isPublished: true,
        publishedAt: new Date('2026-06-15'),
        source: 'web' as const,
      },
    ];
    for (const data of newsItems) {
      const entity = this.newsRepo.create();
      Object.assign(entity, data);
      await this.newsRepo.save(entity);
    }
    this.logger.log(`Creadas ${newsItems.length} noticias`);
  }

  private async seedTeamsAndPlayers(): Promise<void> {
    const teamData = [
      {
        name: 'CB Tomelloso Senior',
        category: 'Senior Autonómica' as const,
        season: '2025/2026',
        coach: 'Javier López',
        assistantCoach: 'Antonio García',
        photoUrl: 'https://placehold.co/400x300/1a5276/ffffff?text=Senior',
        isActive: true,
      },
      {
        name: 'CB Tomelloso Júnior',
        category: 'Junior U19' as const,
        season: '2025/2026',
        coach: 'María Sánchez',
        assistantCoach: 'David Pérez',
        photoUrl: 'https://placehold.co/400x300/2ecc71/ffffff?text=Junior',
        isActive: true,
      },
      {
        name: 'CB Tomelloso Minibasket',
        category: 'Minibasket' as const,
        season: '2025/2026',
        coach: 'Laura Martínez',
        assistantCoach: null,
        photoUrl: 'https://placehold.co/400x300/f39c12/ffffff?text=Minibasket',
        isActive: true,
      },
    ];

    const playerNames = [
      ['Rubén', 'Sánchez', 'Base', 2002, 183],
      ['Carlos', 'Martínez', 'Ala-Pívot', 2001, 196],
      ['Jorge', 'Torres', 'Escolta', 2003, 188],
      ['Álvaro', 'Díaz', 'Alero', 2000, 192],
      ['Miguel', 'Ángel Ruiz', 'Pívot', 1999, 202],
      ['Pablo', 'Navarro', 'Base', 2004, 180],
      ['Sergio', 'Moreno', 'Escolta', 2002, 186],
      ['Daniel', 'López', 'Alero', 2001, 190],
      ['Alejandro', 'García', 'Ala-Pívot', 2000, 198],
      ['Francisco', 'Jiménez', 'Pívot', 1998, 205],
      ['Iván', 'Romero', 'Base', 2003, 178],
      ['David', 'Serrano', 'Escolta', 2004, 185],
      ['Raúl', 'Castillo', 'Alero', 2002, 191],
      ['Jesús', 'Herrera', 'Pívot', 2001, 200],
      ['Manuel', 'Ortega', 'Base', 2005, 182],
    ];

    const juniorNames = [
      ['Adrián', 'Molina', 'Base', 2007, 175],
      ['Marcos', 'Ramírez', 'Escolta', 2008, 180],
      ['Hugo', 'Vázquez', 'Alero', 2007, 185],
      ['Lucas', 'Santos', 'Ala-Pívot', 2008, 190],
      ['Pablo', 'Cruz', 'Pívot', 2007, 195],
      ['Álex', 'Flores', 'Base', 2008, 172],
      ['Martín', 'Peña', 'Escolta', 2007, 178],
      ['Juan', 'Marín', 'Alero', 2008, 183],
      ['Diego', 'Rivas', 'Ala-Pívot', 2007, 188],
      ['Santiago', 'Aguilar', 'Pívot', 2008, 198],
      ['Gonzalo', 'Medina', 'Base', 2007, 170],
      ['Ángel', 'Campos', 'Escolta', 2008, 176],
      ['Samuel', 'Nieto', 'Alero', 2007, 182],
      ['Mateo', 'Guerrero', 'Base', 2008, 174],
      ['Enrique', 'Delgado', 'Pívot', 2007, 193],
    ];

    const miniNames = [
      ['Carlos', 'Gil', 'Base', 2013, 150],
      ['Daniel', 'Reyes', 'Escolta', 2014, 148],
      ['Javier', 'Paredes', 'Alero', 2013, 155],
      ['Andrés', 'Mora', 'Base', 2014, 145],
      ['Víctor', 'Soto', 'Pívot', 2013, 160],
      ['Alejandro', 'Vidal', 'Escolta', 2014, 147],
      ['Jorge', 'Cano', 'Alero', 2013, 153],
      ['Luis', 'Bravo', 'Base', 2014, 142],
      ['Rubén', 'Castro', 'Pívot', 2013, 158],
      ['Iker', 'Suárez', 'Escolta', 2014, 146],
      ['Pablo', 'León', 'Alero', 2013, 152],
      ['Marcos', 'Pastor', 'Base', 2014, 144],
      ['Hugo', 'Blanco', 'Pívot', 2013, 157],
      ['Adrián', 'Navarro', 'Escolta', 2014, 143],
      ['David', 'Rincón', 'Base', 2013, 149],
    ];

    const allPlayers = [playerNames, juniorNames, miniNames];

    for (let t = 0; t < teamData.length; t++) {
      const data = teamData[t];
      const teamEntity = this.teamRepo.create();
      Object.assign(teamEntity, data);
      const savedTeam = await this.teamRepo.save(teamEntity);

      const players = allPlayers[t];
      for (let i = 0; i < players.length; i++) {
        const [name, surname, position, birthYear, heightCm] = players[i];
        const player = this.playerRepo.create();
        Object.assign(player, {
          teamId: savedTeam.id,
          name,
          surname,
          dorsal: i + 1,
          position: position as any,
          nationality: 'España',
          birthYear,
          heightCm,
          photoUrl: null,
          isActive: true,
        });
        await this.playerRepo.save(player);
      }
    }
    this.logger.log(`Creados ${teamData.length} equipos con 15 jugadores cada uno`);
  }

  private async seedMatches(): Promise<void> {
    const teams = await this.teamRepo.find({ take: 1 });

    const matches = [
      {
        teamId: teams[0].id,
        homeTeam: 'CB Tomelloso',
        awayTeam: 'CB Alcázar',
        matchDate: '2026-10-26',
        matchTime: '18:00',
        competition: '1ª Autonómica CLM',
        venue: 'Pabellón Municipal de Tomelloso',
        isHome: true,
        status: 'scheduled' as const,
      },
      {
        teamId: teams[0].id,
        homeTeam: 'CB Valdepeñas',
        awayTeam: 'CB Tomelloso',
        matchDate: '2026-11-02',
        matchTime: '19:30',
        competition: '1ª Autonómica CLM',
        venue: 'Pabellón Polideportivo de Valdepeñas',
        isHome: false,
        status: 'scheduled' as const,
      },
      {
        teamId: teams[0].id,
        homeTeam: 'CB Tomelloso',
        awayTeam: 'CB Daimiel',
        matchDate: '2026-11-09',
        matchTime: '18:00',
        competition: '1ª Autonómica CLM',
        venue: 'Pabellón Municipal de Tomelloso',
        isHome: true,
        status: 'scheduled' as const,
      },
      {
        teamId: teams[0].id,
        homeTeam: 'CB Tomelloso',
        awayTeam: 'CB La Roda',
        matchDate: '2026-11-16',
        matchTime: '12:00',
        competition: 'Copa CLM',
        venue: 'Pabellón Municipal de Tomelloso',
        isHome: true,
        status: 'scheduled' as const,
      },
      {
        teamId: teams[0].id,
        homeTeam: 'CB Albacete',
        awayTeam: 'CB Tomelloso',
        matchDate: '2026-11-23',
        matchTime: '19:00',
        competition: '1ª Autonómica CLM',
        venue: 'Pabellón del Parque de Albacete',
        isHome: false,
        status: 'scheduled' as const,
      },
      {
        teamId: teams[0].id,
        homeTeam: 'CB Tomelloso',
        awayTeam: 'CB Mota del Cuervo',
        matchDate: '2026-10-05',
        matchTime: '18:00',
        competition: '1ª Autonómica CLM',
        venue: 'Pabellón Municipal de Tomelloso',
        isHome: true,
        scoreHome: 78,
        scoreAway: 62,
        status: 'finished' as const,
        notes: 'Buena actuación del equipo local',
      },
      {
        teamId: teams[0].id,
        homeTeam: 'CB Socuéllamos',
        awayTeam: 'CB Tomelloso',
        matchDate: '2026-09-28',
        matchTime: '19:00',
        competition: '1ª Autonómica CLM',
        venue: 'Polideportivo Municipal de Socuéllamos',
        isHome: false,
        scoreHome: 71,
        scoreAway: 74,
        status: 'finished' as const,
        notes: 'Remontada espectacular en el último cuarto',
      },
      {
        teamId: teams[0].id,
        homeTeam: 'CB Tomelloso',
        awayTeam: 'CB Villarrobledo',
        matchDate: '2026-09-21',
        matchTime: '18:00',
        competition: '1ª Autonómica CLM',
        venue: 'Pabellón Municipal de Tomelloso',
        isHome: true,
        scoreHome: 65,
        scoreAway: 59,
        status: 'finished' as const,
      },
      {
        teamId: teams[0].id,
        homeTeam: 'CB Tomelloso',
        awayTeam: 'CB Pedro Muñoz',
        matchDate: '2026-09-14',
        matchTime: '12:00',
        competition: 'Pretemporada',
        venue: 'Pabellón Municipal de Tomelloso',
        isHome: true,
        scoreHome: 70,
        scoreAway: 55,
        status: 'finished' as const,
      },
      {
        teamId: teams[0].id,
        homeTeam: 'CB Alcázar',
        awayTeam: 'CB Tomelloso',
        matchDate: '2026-09-07',
        matchTime: '20:00',
        competition: 'Pretemporada',
        venue: 'Pabellón Antonio Díaz-Miguel',
        isHome: false,
        scoreHome: 63,
        scoreAway: 67,
        status: 'finished' as const,
      },
    ];

    for (const data of matches) {
      const entity = this.matchRepo.create();
      Object.assign(entity, data);
      await this.matchRepo.save(entity);
    }
    this.logger.log(`Creados ${matches.length} partidos`);
  }

  private async seedSponsors(): Promise<void> {
    const sponsors = [
      {
        name: 'Val Brokers',
        logoUrl: 'https://placehold.co/300x150/1a5276/f39c12?text=Val+Brokers',
        websiteUrl: 'https://valbrokers.com/',
        tier: 'principal' as const,
        description: 'Correduría de seguros de confianza, patrocinador oficial del CB Tomelloso desde 2018.',
        contactName: 'Javier Valbuena',
        contactEmail: 'info@valbrokers.com',
        isActive: true,
        sortOrder: 1,
      },
      {
        name: 'Construcciones Díaz',
        logoUrl: 'https://placehold.co/300x150/e74c3c/ffffff?text=Construcciones+Diaz',
        websiteUrl: null,
        tier: 'oro' as const,
        description: 'Empresa constructora local comprometida con el deporte base.',
        contactName: null,
        contactEmail: null,
        isActive: true,
        sortOrder: 2,
      },
      {
        name: 'Panadería La Espiga',
        logoUrl: 'https://placehold.co/300x150/f39c12/1a5276?text=La+Espiga',
        websiteUrl: null,
        tier: 'plata' as const,
        description: 'Panadería artesanal de Tomelloso, alimentando a nuestros deportistas.',
        contactName: null,
        contactEmail: null,
        isActive: true,
        sortOrder: 3,
      },
      {
        name: 'Clínica Dental Tomelloso',
        logoUrl: 'https://placehold.co/300x150/3498db/ffffff?text=Clinica+Dental',
        websiteUrl: null,
        tier: 'plata' as const,
        description: 'Tu salud bucodental es nuestra prioridad.',
        contactName: null,
        contactEmail: null,
        isActive: true,
        sortOrder: 4,
      },
      {
        name: 'Autoescuela Ruedas',
        logoUrl: 'https://placehold.co/300x150/27ae60/ffffff?text=Autoescuela+Ruedas',
        websiteUrl: null,
        tier: 'bronce' as const,
        description: 'Formación vial de calidad en Tomelloso.',
        contactName: null,
        contactEmail: null,
        isActive: true,
        sortOrder: 5,
      },
      {
        name: 'Bar Restaurante El Parque',
        logoUrl: 'https://placehold.co/300x150/e67e22/ffffff?text=El+Parque',
        websiteUrl: null,
        tier: 'bronce' as const,
        description: 'Punto de encuentro para las celebraciones del club.',
        contactName: null,
        contactEmail: null,
        isActive: true,
        sortOrder: 6,
      },
    ];

    for (const data of sponsors) {
      const entity = this.sponsorRepo.create();
      Object.assign(entity, data);
      await this.sponsorRepo.save(entity);
    }
    this.logger.log(`Creados ${sponsors.length} patrocinadores`);
  }

  private async seedGallery(): Promise<void> {
    const teams = await this.teamRepo.find();
    const images = [
      { title: 'Equipo Senior 2025/2026', eventName: 'Presentación equipos', teamId: teams[0]?.id ?? null, season: '2025/2026' },
      { title: 'Entrenamiento Senior', eventName: 'Entrenamiento', teamId: teams[0]?.id ?? null, season: '2025/2026' },
      { title: 'Partido en casa', eventName: 'Jornada 1', teamId: teams[0]?.id ?? null, season: '2025/2026' },
      { title: 'Afición del CB Tomelloso', eventName: 'Partido en casa', teamId: null, season: '2025/2026' },
      { title: 'Equipo Júnior', eventName: 'Torneo Ciudad Real', teamId: teams[1]?.id ?? null, season: '2025/2026' },
      { title: 'Júnior en acción', eventName: 'Entrenamiento', teamId: teams[1]?.id ?? null, season: '2025/2026' },
      { title: 'Minibasket posando', eventName: 'Fiesta del deporte', teamId: teams[2]?.id ?? null, season: '2025/2026' },
      { title: 'Cantera al completo', eventName: 'Jornada de puertas abiertas', teamId: null, season: '2025/2026' },
      { title: 'Presentación equipaciones', eventName: 'Evento presentación', teamId: null, season: '2025/2026' },
      { title: 'Trofeo de la cantera', eventName: 'Torneo', teamId: null, season: '2025/2026' },
      { title: 'Celebración victoria', eventName: 'Jornada 3', teamId: teams[0]?.id ?? null, season: '2025/2026' },
      { title: 'Vista del pabellón', eventName: 'Instalaciones', teamId: null, season: '2025/2026' },
    ];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const hue = (i * 37 + 180) % 360;
      const bg = `hsl(${hue}, 50%, 40%)`;
      const fg = `hsl(${hue}, 50%, 90%)`;
      const entity = this.galleryRepo.create();
      Object.assign(entity, {
        ...img,
        mediaType: 'image' as const,
        url: `https://placehold.co/800x600/${encodeURIComponent(bg.replace('#', ''))}/${encodeURIComponent(fg.replace('#', ''))}?text=${encodeURIComponent(img.title.substring(0, 20))}`,
        thumbnailUrl: `https://placehold.co/400x300/${encodeURIComponent(bg.replace('#', ''))}/${encodeURIComponent(fg.replace('#', ''))}?text=${encodeURIComponent(img.title.substring(0, 15))}`,
        takenAt: '2026-06-01',
        isPublished: true,
        sortOrder: i + 1,
      });
      await this.galleryRepo.save(entity);
    }
    this.logger.log(`Creadas ${images.length} imágenes de galería`);
  }

  private async seedActivities(): Promise<void> {
    const activities = [
      {
        title: 'Torneo de Baloncesto Base',
        description: 'Torneo provincial de categorías inferiores con equipos de toda la provincia. Participarán nuestros equipos Alevín, Infantil y Cadete.',
        activityType: 'torneo' as const,
        startDate: '2026-12-15',
        endDate: '2026-12-17',
        venue: 'Polideportivo Municipal',
        imageUrl: 'https://placehold.co/600x400/1a5276/f39c12?text=Torneo+Base',
        isPublished: true,
      },
      {
        title: 'Escuela de Navidad CB Tomelloso',
        description: 'Campamento urbano de baloncesto durante las vacaciones de Navidad. Para niños de 4 a 14 años. Incluye entrenamientos, juegos y actividades.',
        activityType: 'escuela' as const,
        startDate: '2026-12-23',
        endDate: '2026-12-30',
        venue: 'Pabellón Municipal',
        imageUrl: 'https://placehold.co/600x400/e74c3c/ffffff?text=Escuela+Navidad',
        isPublished: true,
      },
      {
        title: 'Partido homenaje a la leyenda',
        description: 'Partido de homenaje a nuestro histórico jugador Antonio "Toni" García, que se retira tras 20 temporadas en el club.',
        activityType: 'evento' as const,
        startDate: '2026-11-30',
        endDate: null,
        venue: 'Pabellón Municipal de Tomelloso',
        imageUrl: 'https://placehold.co/600x400/f39c12/1a5276?text=Homenaje',
        isPublished: true,
      },
      {
        title: 'Copa de Baloncesto CLM',
        description: 'Fase final de la Copa de Castilla-La Mancha de baloncesto. Nuestro equipo Senior buscará el título.',
        activityType: 'copa' as const,
        startDate: '2027-01-10',
        endDate: '2027-01-12',
        venue: 'Pabellón Municipal de Tomelloso',
        imageUrl: 'https://placehold.co/600x400/2ecc71/ffffff?text=Copa+CLM',
        isPublished: true,
      },
    ];

    for (const data of activities) {
      const entity = this.activityRepo.create();
      Object.assign(entity, data);
      await this.activityRepo.save(entity);
    }
    this.logger.log(`Creadas ${activities.length} actividades`);
  }
}
