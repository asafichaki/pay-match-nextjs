import { useState, useEffect } from 'react';
import { cmsClient, SITE_ID } from '@/integrations/cms/client';

export interface CmsProvider {
  id: string;
  name: string;
  tagline: string;
  logo: string | null;
  logo_url: string | null;
  logo_placeholder: string;
  features: string[];
  rating: number;
  rating_label: string;
  url: string;
  is_top_pick: boolean;
  transaction_fees: string;
  setup_speed: string;
  customer_support: string;
  payment_methods: string;
  countries: string;
  business_types: string[];
  markets: string[];
  funding_speed: number;
  fee_score: number;
  display_order: number;
}

export function useCmsProviders() {
  const [providers, setProviders] = useState<CmsProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProviders = async () => {
    try {
      const { data, error: fetchError } = await cmsClient
        .from('providers')
        .select('*')
        .eq('site_id', SITE_ID)
        .eq('status', 'active')
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      // Filter out inactive providers (Paysafe, CardX)
      const hiddenProviders = ['Paysafe', 'CardX'];
      const filteredData = (data || []).filter((p: any) => !hiddenProviders.includes(p.name));

      const mapped: CmsProvider[] = filteredData.map((p: any) => ({
        id: p.id,
        name: p.name,
        tagline: p.tagline,
        logo: p.logo,
        logo_url: p.logo_url || null,
        logo_placeholder: p.logo_placeholder || 'provider',
        features: Array.isArray(p.features) ? p.features : [],
        rating: p.rating,
        rating_label: p.rating_label,
        url: p.website_url || p.affiliate_link || '',
        is_top_pick: p.is_top_pick || false,
        transaction_fees: p.transaction_fees,
        setup_speed: p.setup_speed,
        customer_support: p.customer_support,
        payment_methods: p.payment_methods,
        countries: p.countries,
        business_types: Array.isArray(p.business_types) ? p.business_types : [],
        markets: Array.isArray(p.markets) ? p.markets : [],
        funding_speed: p.funding_speed || 1,
        fee_score: p.fee_score || 1,
        display_order: p.display_order || 0,
      }));

      setProviders(mapped);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();

    // Set up real-time subscription for all changes (no polling needed)
    const channel = cmsClient
      .channel('providers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'providers',
        },
        () => {
          fetchProviders();
        }
      )
      .subscribe();

    return () => {
      cmsClient.removeChannel(channel);
    };
  }, []);

  return { providers, loading, error, refetch: fetchProviders };
}
