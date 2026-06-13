import { Routes } from '@angular/router';

export const shopRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/shop-home/shop-home.component').then(m => m.ShopHomeComponent),
    title: 'Tienda Oficial — CB Tomelloso',
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent),
    title: 'Finalizar compra — CB Tomelloso',
  },
  {
    path: 'pedido/:orderNumber',
    loadComponent: () =>
      import('./pages/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent),
    title: 'Pedido — CB Tomelloso',
  },
  {
    path: ':slug',
    loadComponent: () =>
      import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
    title: 'Producto — CB Tomelloso',
  },
];
