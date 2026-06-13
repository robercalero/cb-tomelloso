import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategory } from '../product-categories/entities/product-category.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class ShopSeedService implements OnModuleInit {
  private readonly logger = new Logger(ShopSeedService.name);

  constructor(
    @InjectRepository(ProductCategory)
    private readonly categoryRepo: Repository<ProductCategory>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV === 'production') return;

    const count = await this.categoryRepo.count();
    if (count > 0) {
      this.logger.log('Shop ya tiene datos — seed omitido');
      return;
    }

    this.logger.log('Sembrando datos iniciales de la tienda...');
    await this.seedCategories();
    await this.seedProducts();
    this.logger.log('Seed de tienda completado');
  }

  private async seedCategories(): Promise<void> {
    const categories = [
      { name: 'Camisetas de juego', slug: 'camisetas-juego', description: 'Equipaciones oficiales de competición del CB Tomelloso', sortOrder: 1 },
      { name: 'Camisetas casual', slug: 'camisetas-casual', description: 'Camisetas de algodón con el escudo del club', sortOrder: 2 },
      { name: 'Sudaderas y chaquetas', slug: 'sudaderas-chaquetas', description: 'Prendas de abrigo con los colores del club', sortOrder: 3 },
      { name: 'Pantalones y shorts', slug: 'pantalones-shorts', description: 'Pantalones de juego y chándal', sortOrder: 4 },
      { name: 'Accesorios', slug: 'accesorios', description: 'Gorras, mochilas, botellas y más del CB Tomelloso', sortOrder: 5 },
      { name: 'Outlet', slug: 'outlet', description: 'Productos con descuento de temporadas anteriores', sortOrder: 6 },
    ];

    for (const cat of categories) {
      await this.categoryRepo.save(this.categoryRepo.create(cat));
    }
    this.logger.log(`Creadas ${categories.length} categorías`);
  }

  private async seedProducts(): Promise<void> {
    const catJuego = await this.categoryRepo.findOne({ where: { slug: 'camisetas-juego' } });
    const catCasual = await this.categoryRepo.findOne({ where: { slug: 'camisetas-casual' } });
    const catSudaderas = await this.categoryRepo.findOne({ where: { slug: 'sudaderas-chaquetas' } });
    const catPantalones = await this.categoryRepo.findOne({ where: { slug: 'pantalones-shorts' } });
    const catAccesorios = await this.categoryRepo.findOne({ where: { slug: 'accesorios' } });
    const catOutlet = await this.categoryRepo.findOne({ where: { slug: 'outlet' } });

    const products: Partial<Product>[] = [
      // ── CAMISETAS DE JUEGO ──
      {
        categoryId: catJuego?.id ?? null,
        name: 'Camiseta Oficial CB Tomelloso 2025/2026 — Primera equipación',
        slug: 'camiseta-oficial-primera-2025-2026',
        description: 'Camiseta oficial de juego del Club Baloncesto Tomelloso para la temporada 2025/2026. Fabricada en tejido técnico transpirable Dry-Fit que mantiene el cuerpo seco durante el esfuerzo. Cuello redondo, costuras planas y escudo bordado. Patrocinada por Val Brokers.',
        price: 39.99,
        images: ['https://placehold.co/600x600/1a5276/f39c12?text=Azul+Verde', 'https://placehold.co/600x600/ffffff/1a5276?text=Blanco'],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: [{ name: 'Azul/Verde', hex: '#1a5276' }, { name: 'Blanco', hex: '#ffffff' }],
        stock: 50,
        isActive: true,
        isFeatured: true,
        season: '2025/2026',
        tags: ['camiseta', 'oficial', 'primera', 'juego', 'temporada-2025-2026'],
      },
      {
        categoryId: catJuego?.id ?? null,
        name: 'Camiseta Oficial CB Tomelloso 2025/2026 — Segunda equipación',
        slug: 'camiseta-oficial-segunda-2025-2026',
        description: 'Segunda equipación oficial del CB Tomelloso para la temporada 2025/2026. Diseño alternativo en blanco nuclear con detalles en verde esperanza y azul cielo. Tejido transpirable de secado rápido. Ideal para partidos como visitante.',
        price: 39.99,
        images: ['https://placehold.co/600x600/ffffff/1a5276?text=Blanco+Verde'],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: [{ name: 'Blanco/Verde', hex: '#ffffff' }],
        stock: 40,
        isActive: true,
        isFeatured: true,
        season: '2025/2026',
        tags: ['camiseta', 'oficial', 'segunda', 'juego', 'temporada-2025-2026'],
      },
      {
        categoryId: catJuego?.id ?? null,
        name: 'Camiseta de Entrenamiento CB Tomelloso 2025/2026',
        slug: 'camiseta-entrenamiento-2025-2026',
        description: 'Camiseta de entrenamiento oficial del CB Tomelloso. Diseñada para sesiones de entrenamiento intensas con tejido ultraligero y paneles de ventilación. Disponible en dos colores.',
        price: 29.99,
        comparePrice: 34.99,
        images: ['https://placehold.co/600x600/2ecc71/ffffff?text=Verde', 'https://placehold.co/600x600/2980b9/ffffff?text=Azul'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [{ name: 'Verde', hex: '#2ecc71' }, { name: 'Azul', hex: '#2980b9' }],
        stock: 60,
        isActive: true,
        isFeatured: false,
        season: '2025/2026',
        tags: ['camiseta', 'entrenamiento', 'training', 'temporada-2025-2026'],
      },
      {
        categoryId: catJuego?.id ?? null,
        name: 'Camiseta Partido CB Tomelloso — Edición Especial 40 Aniversario',
        slug: 'camiseta-40-aniversario',
        description: 'Edición limitada conmemorativa del 40 aniversario del CB Tomelloso. Diseño retro con los colores históricos del club. Detalles dorados y escudo especial del 40 aniversario. ¡No te quedes sin ella!',
        price: 49.99,
        images: ['https://placehold.co/600x600/f39c12/1a5276?text=Dorado+Azul'],
        sizes: ['M', 'L', 'XL', 'XXL'],
        colors: [{ name: 'Dorado/Azul', hex: '#f39c12' }],
        stock: 25,
        isActive: true,
        isFeatured: true,
        season: '2025/2026',
        tags: ['camiseta', 'edicion-especial', '40-aniversario', 'limitada', 'retro'],
      },

      // ── CAMISETAS CASUAL ──
      {
        categoryId: catCasual?.id ?? null,
        name: 'Camiseta Casual CB Tomelloso — Escudo',
        slug: 'camiseta-casual-escudo',
        description: 'Camiseta de algodón orgánico 100% con el escudo del Club Baloncesto Tomelloso estampado en el pecho. Corte regular, costuras reforzadas. Perfecta para el día a día y para animar al equipo desde la grada.',
        price: 24.99,
        images: ['https://placehold.co/600x600/0d1117/1e8449?text=Negro', 'https://placehold.co/600x600/1a5276/ffffff?text=Azul+Marino', 'https://placehold.co/600x600/ffffff/0d1117?text=Blanco'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [{ name: 'Negro', hex: '#0d1117' }, { name: 'Azul marino', hex: '#1a5276' }, { name: 'Blanco', hex: '#ffffff' }],
        stock: 80,
        isActive: true,
        isFeatured: true,
        tags: ['camiseta', 'casual', 'escudo', 'fan', 'algodon'],
      },
      {
        categoryId: catCasual?.id ?? null,
        name: 'Camiseta Casual CB Tomelloso — Tomelloso Basketball',
        slug: 'camiseta-casual-basketball',
        description: 'Camiseta urbana con el texto "Tomelloso Basketball" en tipografía deportiva. Estilo oversize, 180g/m² de algodón peinado. Ideal para los jóvenes aficionados.',
        price: 26.99,
        images: ['https://placehold.co/600x600/f1c40f/0d1117?text=Amarillo', 'https://placehold.co/600x600/0d1117/f1c40f?text=Negro', 'https://placehold.co/600x600/ffffff/0d1117?text=Blanco'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'Amarillo', hex: '#f1c40f' }, { name: 'Negro', hex: '#0d1117' }, { name: 'Blanco', hex: '#ffffff' }],
        stock: 65,
        isActive: true,
        isFeatured: false,
        tags: ['camiseta', 'casual', 'urbana', 'tomelloso-basketball', 'oversize'],
      },
      {
        categoryId: catCasual?.id ?? null,
        name: 'Camiseta Infantil CB Tomelloso — Mini',
        slug: 'camiseta-infantil-mini',
        description: 'Camiseta infantil para los más pequeños del club. Algodón suave, sin etiquetas, con el escudo del CB Tomelloso. Disponible en tallas infantiles.',
        price: 18.99,
        images: ['https://placehold.co/600x600/1abc9c/ffffff?text=Verde+Agua', 'https://placehold.co/600x600/3498db/ffffff?text=Azul+Claro'],
        sizes: ['4-5', '6-7', '8-9', '10-11', '12-13'],
        colors: [{ name: 'Verde agua', hex: '#1abc9c' }, { name: 'Azul claro', hex: '#3498db' }],
        stock: 45,
        isActive: true,
        isFeatured: false,
        tags: ['camiseta', 'infantil', 'mini', 'niños', 'algodon'],
      },
      {
        categoryId: catCasual?.id ?? null,
        name: 'Camiseta Casual CB Tomelloso — Mapa Ciudad',
        slug: 'camiseta-casual-mapa',
        description: 'Camiseta exclusiva con el mapa de Tomelloso serigrafiado y la ubicación del pabellón marcada con una estrella. Edición limitada para orgullo local.',
        price: 28.99,
        images: ['https://placehold.co/600x600/e74c3c/ffffff?text=Rojo', 'https://placehold.co/600x600/ffffff/e74c3c?text=Blanco'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [{ name: 'Rojo', hex: '#e74c3c' }, { name: 'Blanco', hex: '#ffffff' }],
        stock: 35,
        isActive: true,
        isFeatured: false,
        tags: ['camiseta', 'casual', 'mapa', 'tomelloso', 'exclusiva'],
      },

      // ── SUDADERAS Y CHAQUETAS ──
      {
        categoryId: catSudaderas?.id ?? null,
        name: 'Sudadera con capucha CB Tomelloso',
        slug: 'sudadera-capucha-cb-tomelloso',
        description: 'Sudadera con capucha forrada interior, bolsillo canguro delantero y cierre de cordón ajustable. 280g/m² de algodón con mezcla de poliéster para mayor calidez. Logo CB Tomelloso bordado en el pecho.',
        price: 44.99,
        comparePrice: 54.99,
        images: ['https://placehold.co/600x600/1a5276/f39c12?text=Azul', 'https://placehold.co/600x600/7f8c8d/ffffff?text=Gris'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [{ name: 'Azul', hex: '#1a5276' }, { name: 'Gris', hex: '#7f8c8d' }],
        stock: 30,
        isActive: true,
        isFeatured: true,
        tags: ['sudadera', 'capucha', 'fan', 'invierno', 'abrigo'],
      },
      {
        categoryId: catSudaderas?.id ?? null,
        name: 'Sudadera ligera CB Tomelloso — Sin capucha',
        slug: 'sudadera-ligera-cb-tomelloso',
        description: 'Sudadera ligera tipo crew neck sin capucha. Ideal para pre-partido o para el día a día. Algodón fleece suave al tacto. Escudo bordado.',
        price: 37.99,
        images: ['https://placehold.co/600x600/8e44ad/ffffff?text=Purpura', 'https://placehold.co/600x600/2980b9/ffffff?text=Azul'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [{ name: 'Púrpura', hex: '#8e44ad' }, { name: 'Azul', hex: '#2980b9' }],
        stock: 25,
        isActive: true,
        isFeatured: false,
        tags: ['sudadera', 'crew-neck', 'ligera', 'fan'],
      },
      {
        categoryId: catSudaderas?.id ?? null,
        name: 'Chaqueta deportiva CB Tomelloso',
        slug: 'chaqueta-deportiva-cb-tomelloso',
        description: 'Chaqueta rompevientos oficial del CB Tomelloso. Tejido impermeable y transpirable con cremallera completa. Bolsillos con cremallera. Ideal para días fríos en el pabellón.',
        price: 54.99,
        images: ['https://placehold.co/600x600/e74c3c/ffffff?text=Rojo', 'https://placehold.co/600x600/1a5276/f39c12?text=Azul'],
        sizes: ['M', 'L', 'XL', 'XXL'],
        colors: [{ name: 'Rojo', hex: '#e74c3c' }, { name: 'Azul', hex: '#1a5276' }],
        stock: 20,
        isActive: true,
        isFeatured: true,
        tags: ['chaqueta', 'rompevientos', 'invierno', 'deportiva'],
      },

      // ── PANTALONES Y SHORTS ──
      {
        categoryId: catPantalones?.id ?? null,
        name: 'Pantalón de chándal CB Tomelloso',
        slug: 'pantalon-chandal-cb-tomelloso',
        description: 'Pantalón de chándal oficial del CB Tomelloso. Tejido fleece suave con cintura elástica y cordón ajustable. Bolsillos laterales con cremallera y perneras con puños elásticos. Detalle de la marca en la pierna.',
        price: 39.99,
        images: ['https://placehold.co/600x600/1a5276/ffffff?text=Azul', 'https://placehold.co/600x600/95a5a6/ffffff?text=Gris'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [{ name: 'Azul', hex: '#1a5276' }, { name: 'Gris', hex: '#95a5a6' }],
        stock: 35,
        isActive: true,
        isFeatured: false,
        tags: ['pantalon', 'chandal', 'invierno', 'oficial'],
      },
      {
        categoryId: catPantalones?.id ?? null,
        name: 'Shorts oficiales CB Tomelloso 2025/2026',
        slug: 'shorts-oficiales-2025-2026',
        description: 'Shorts oficiales de juego del CB Tomelloso. Tejido técnico ligero con elástico y cordón interior. Costuras planas para evitar rozaduras. El mismo que usan los jugadores en la pista.',
        price: 29.99,
        images: ['https://placehold.co/600x600/1a5276/f39c12?text=Azul+Verde', 'https://placehold.co/600x600/ecf0f1/1a5276?text=Blanco'],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: [{ name: 'Azul/Verde', hex: '#1a5276' }, { name: 'Blanco', hex: '#ecf0f1' }],
        stock: 40,
        isActive: true,
        isFeatured: false,
        season: '2025/2026',
        tags: ['shorts', 'pantalon', 'juego', 'oficial', 'temporada-2025-2026'],
      },
      {
        categoryId: catPantalones?.id ?? null,
        name: 'Pantalón corto entrenamiento CB Tomelloso',
        slug: 'pantalon-corto-entrenamiento',
        description: 'Pantalón corto de entrenamiento con tejido transpirable y bolster trasero con cremallera para objetos de valor. Ideal para pretemporada y entrenamientos de verano.',
        price: 22.99,
        images: ['https://placehold.co/600x600/27ae60/ffffff?text=Verde'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [{ name: 'Verde', hex: '#27ae60' }],
        stock: 55,
        isActive: true,
        isFeatured: false,
        tags: ['shorts', 'entrenamiento', 'verano', 'pantalon-corto'],
      },

      // ── ACCESORIOS ──
      {
        categoryId: catAccesorios?.id ?? null,
        name: 'Gorra CB Tomelloso',
        slug: 'gorra-cb-tomelloso',
        description: 'Gorra snapback 100% algodón con el escudo del CB Tomelloso bordado en relieve. Visera plana, cierre ajustable de snaps. Talla única. Protege del sol mientras animas al equipo.',
        price: 18.99,
        images: ['https://placehold.co/600x600/1a5276/ffffff?text=Azul', 'https://placehold.co/600x600/0d1117/ffffff?text=Negro', 'https://placehold.co/600x600/ffffff/0d1117?text=Blanco'],
        sizes: ['Ajustable'],
        colors: [{ name: 'Azul', hex: '#1a5276' }, { name: 'Negro', hex: '#0d1117' }, { name: 'Blanco', hex: '#ffffff' }],
        stock: 60,
        isActive: true,
        isFeatured: false,
        tags: ['gorra', 'accesorio', 'cap', 'fan', 'snapback'],
      },
      {
        categoryId: catAccesorios?.id ?? null,
        name: 'Mochila CB Tomelloso',
        slug: 'mochila-cb-tomelloso',
        description: 'Mochila deportiva con compartimento para portátil de hasta 15\". Bolsillo interior para zapatillas, bolsillo lateral para botella y compartimento acolchado. Ideal para ir al entrenamiento.',
        price: 34.99,
        comparePrice: 39.99,
        images: ['https://placehold.co/600x600/1a5276/f39c12?text=Azul', 'https://placehold.co/600x600/0d1117/f39c12?text=Negro'],
        sizes: ['Única'],
        colors: [{ name: 'Azul', hex: '#1a5276' }, { name: 'Negro', hex: '#0d1117' }],
        stock: 25,
        isActive: true,
        isFeatured: false,
        tags: ['mochila', 'accesorio', 'backpack', 'deporte'],
      },
      {
        categoryId: catAccesorios?.id ?? null,
        name: 'Botella de agua CB Tomelloso — Acero inoxidable',
        slug: 'botella-agua-acero',
        description: 'Botella térmica de acero inoxidable con capacidad de 750ml. Mantiene la bebida fría hasta 24h o caliente hasta 12h. Cierre hermético y asa de transporte. Logo CB Tomelloso grabado al láser.',
        price: 22.99,
        images: ['https://placehold.co/600x600/3498db/ffffff?text=Azul', 'https://placehold.co/600x600/bdc3c7/2c3e50?text=Plata'],
        sizes: ['750ml'],
        colors: [{ name: 'Azul', hex: '#3498db' }, { name: 'Plata', hex: '#bdc3c7' }],
        stock: 40,
        isActive: true,
        isFeatured: false,
        tags: ['botella', 'accesorio', 'agua', 'termica', 'acero'],
      },
      {
        categoryId: catAccesorios?.id ?? null,
        name: 'Pulsera CB Tomelloso — Silicona',
        slug: 'pulsera-silicona-cb-tomelloso',
        description: 'Pulsera de silicona grabada con "CB Tomelloso". Disponible en varios colores. Talla única. Ideal para llevar tu apoyo al club a todas partes. Venta benéfica — los beneficios se destinan a la cantera.',
        price: 4.99,
        images: ['https://placehold.co/600x600/1a5276/f39c12?text=Azul', 'https://placehold.co/600x600/2ecc71/ffffff?text=Verde', 'https://placehold.co/600x600/f1c40f/0d1117?text=Amarillo'],
        sizes: ['Talla única'],
        colors: [{ name: 'Azul', hex: '#1a5276' }, { name: 'Verde', hex: '#2ecc71' }, { name: 'Amarillo', hex: '#f1c40f' }],
        stock: 200,
        isActive: true,
        isFeatured: false,
        tags: ['pulsera', 'accesorio', 'silicona', 'benefico', 'cantera'],
      },
      {
        categoryId: catAccesorios?.id ?? null,
        name: 'Bufanda CB Tomelloso',
        slug: 'bufanda-cb-tomelloso',
        description: 'Bufanda de 160cm de largo con los colores del club y el escudo tejido. Tejido acrílico suave y caliente. Imprescindible para los partidos de invierno.',
        price: 16.99,
        images: ['https://placehold.co/600x600/1a5276/f39c12?text=Azul+Verde'],
        sizes: ['Única'],
        colors: [{ name: 'Azul/Verde', hex: '#1a5276' }],
        stock: 50,
        isActive: true,
        isFeatured: false,
        tags: ['bufanda', 'accesorio', 'invierno', 'calor'],
      },
      {
        categoryId: catAccesorios?.id ?? null,
        name: 'Balón CB Tomelloso — Spalding',
        slug: 'balon-spalding-cb-tomelloso',
        description: 'Balón de baloncesto Spalding con el logo del CB Tomelloso. Tamaño oficial T7 (talla 7). Superficie de composite para uso en pista cubierta y exterior. Válvula de retención de aire.',
        price: 32.99,
        images: ['https://placehold.co/600x600/d35400/ffffff?text=Naranja'],
        sizes: ['T7 (Oficial)'],
        colors: [{ name: 'Naranja', hex: '#d35400' }],
        stock: 15,
        isActive: true,
        isFeatured: false,
        tags: ['balon', 'accesorio', 'spalding', 'oficial'],
      },

      // ── OUTLET ──
      {
        categoryId: catOutlet?.id ?? null,
        name: 'Camiseta Oficial CB Tomelloso 2024/2025 — Edición anterior',
        slug: 'camiseta-oficial-2024-2025-outlet',
        description: 'Camiseta oficial de la temporada anterior 2024/2025. Misma calidad, menor precio. Tejido Dry-Fit, escudo bordado. Aprovecha el descuento de temporada.',
        price: 19.99,
        comparePrice: 39.99,
        images: ['https://placehold.co/600x600/7f8c8d/ffffff?text=Gris', 'https://placehold.co/600x600/34495e/f39c12?text=Azul'],
        sizes: ['M', 'L', 'XL', 'XXL'],
        colors: [{ name: 'Gris', hex: '#7f8c8d' }, { name: 'Azul', hex: '#34495e' }],
        stock: 12,
        isActive: true,
        isFeatured: false,
        season: '2024/2025',
        tags: ['camiseta', 'oficial', 'outlet', 'descuento', 'temporada-2024-2025'],
      },
      {
        categoryId: catOutlet?.id ?? null,
        name: 'Gorra CB Tomelloso — Edición anterior',
        slug: 'gorra-outlet-edicion-anterior',
        description: 'Gorra de la colección anterior del CB Tomelloso. Diseño clásico, misma calidad. ¡Últimas unidades!',
        price: 9.99,
        comparePrice: 18.99,
        images: ['https://placehold.co/600x600/34495e/f39c12?text=Azul'],
        sizes: ['Ajustable'],
        colors: [{ name: 'Azul', hex: '#34495e' }],
        stock: 8,
        isActive: true,
        isFeatured: false,
        tags: ['gorra', 'outlet', 'descuento', 'liquidacion'],
      },
    ];

    for (const prod of products) {
      const entity = this.productRepo.create();
      Object.assign(entity, prod);
      await this.productRepo.save(entity);
    }
    this.logger.log(`Creados ${products.length} productos`);
  }
}
