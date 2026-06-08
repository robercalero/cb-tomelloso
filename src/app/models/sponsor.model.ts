export type SponsorTier = 'principal' | 'oro' | 'plata' | 'bronce';

export interface Sponsor {
  id: number;
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  tier: SponsorTier;
  description?: string;
  contactName?: string;
  contactEmail?: string;
  isActive: boolean;
  sortOrder: number;
}
