export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      cms_section_items: {
        Row: {
          body: string | null;
          created_at: string;
          ends_at: string | null;
          href: string | null;
          id: string;
          is_enabled: boolean;
          item_key: string | null;
          media_asset_id: string | null;
          section_id: string;
          settings: Json;
          sort_order: number;
          starts_at: string | null;
          subtitle: string | null;
          title: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          ends_at?: string | null;
          href?: string | null;
          id?: string;
          is_enabled?: boolean;
          item_key?: string | null;
          media_asset_id?: string | null;
          section_id: string;
          settings?: Json;
          sort_order?: number;
          starts_at?: string | null;
          subtitle?: string | null;
          title: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          body?: string | null;
          ends_at?: string | null;
          href?: string | null;
          is_enabled?: boolean;
          item_key?: string | null;
          media_asset_id?: string | null;
          section_id?: string;
          settings?: Json;
          sort_order?: number;
          starts_at?: string | null;
          subtitle?: string | null;
          title?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      cms_sections: {
        Row: {
          created_at: string;
          id: string;
          is_enabled: boolean;
          name: string;
          section_key: string;
          section_type: string;
          settings: Json;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_enabled?: boolean;
          name: string;
          section_key: string;
          section_type: string;
          settings?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          is_enabled?: boolean;
          name?: string;
          section_key?: string;
          section_type?: string;
          settings?: Json;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      catalog_categories: {
        Row: {
          banner_media_asset_id: string | null;
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          is_featured: boolean;
          media_asset_id: string | null;
          name: string;
          parent_id: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          sort_order: number;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          banner_media_asset_id?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          is_featured?: boolean;
          media_asset_id?: string | null;
          name: string;
          parent_id?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          sort_order?: number;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          banner_media_asset_id?: string | null;
          description?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          media_asset_id?: string | null;
          name?: string;
          parent_id?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          sort_order?: number;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      catalog_product_media: {
        Row: {
          alt_text: string | null;
          created_at: string;
          id: string;
          is_enabled: boolean;
          is_primary: boolean;
          media_asset_id: string;
          placement: "gallery" | "hero" | "thumbnail" | "bento" | "detail";
          product_id: string;
          settings: Json;
          sort_order: number;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          alt_text?: string | null;
          created_at?: string;
          id?: string;
          is_enabled?: boolean;
          is_primary?: boolean;
          media_asset_id: string;
          placement?: "gallery" | "hero" | "thumbnail" | "bento" | "detail";
          product_id: string;
          settings?: Json;
          sort_order?: number;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          alt_text?: string | null;
          is_enabled?: boolean;
          is_primary?: boolean;
          media_asset_id?: string;
          placement?: "gallery" | "hero" | "thumbnail" | "bento" | "detail";
          product_id?: string;
          settings?: Json;
          sort_order?: number;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      catalog_product_variants: {
        Row: {
          compare_at_price_cents: number | null;
          created_at: string;
          id: string;
          is_active: boolean;
          is_default: boolean;
          option_values: Json;
          price_cents: number | null;
          product_id: string;
          sku: string | null;
          stock_quantity: number;
          title: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          compare_at_price_cents?: number | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          is_default?: boolean;
          option_values?: Json;
          price_cents?: number | null;
          product_id: string;
          sku?: string | null;
          stock_quantity?: number;
          title: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          compare_at_price_cents?: number | null;
          is_active?: boolean;
          is_default?: boolean;
          option_values?: Json;
          price_cents?: number | null;
          product_id?: string;
          sku?: string | null;
          stock_quantity?: number;
          title?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      catalog_products: {
        Row: {
          brand: string;
          category_id: string | null;
          compare_at_price_cents: number | null;
          compatibility_notes: string | null;
          cost_price_cents: number | null;
          created_at: string;
          currency: string;
          description: string | null;
          feature_bullets: Json;
          id: string;
          is_featured: boolean;
          is_new_arrival: boolean;
          is_popular: boolean;
          low_stock_threshold: number;
          name: string;
          price_cents: number;
          published_at: string | null;
          seo_description: string | null;
          seo_title: string | null;
          shipping_policy: string | null;
          short_description: string | null;
          sku: string | null;
          slug: string;
          sort_order: number;
          specifications: Json;
          status: "draft" | "active" | "archived";
          stock_quantity: number;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          brand?: string;
          category_id?: string | null;
          compare_at_price_cents?: number | null;
          compatibility_notes?: string | null;
          cost_price_cents?: number | null;
          created_at?: string;
          currency?: string;
          description?: string | null;
          feature_bullets?: Json;
          id?: string;
          is_featured?: boolean;
          is_new_arrival?: boolean;
          is_popular?: boolean;
          low_stock_threshold?: number;
          name: string;
          price_cents?: number;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          shipping_policy?: string | null;
          short_description?: string | null;
          sku?: string | null;
          slug: string;
          sort_order?: number;
          specifications?: Json;
          status?: "draft" | "active" | "archived";
          stock_quantity?: number;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          brand?: string;
          category_id?: string | null;
          compare_at_price_cents?: number | null;
          compatibility_notes?: string | null;
          cost_price_cents?: number | null;
          currency?: string;
          description?: string | null;
          feature_bullets?: Json;
          is_featured?: boolean;
          is_new_arrival?: boolean;
          is_popular?: boolean;
          low_stock_threshold?: number;
          name?: string;
          price_cents?: number;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          shipping_policy?: string | null;
          short_description?: string | null;
          sku?: string | null;
          slug?: string;
          sort_order?: number;
          specifications?: Json;
          status?: "draft" | "active" | "archived";
          stock_quantity?: number;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      media_assets: {
        Row: {
          alt_text: string | null;
          created_at: string;
          created_by: string | null;
          folder: string | null;
          height: number | null;
          id: string;
          is_public: boolean;
          mime_type: string | null;
          provider: "imagekit" | "local" | "external";
          size_bytes: number | null;
          storage_key: string;
          updated_at: string;
          url: string;
          width: number | null;
        };
        Insert: {
          alt_text?: string | null;
          created_at?: string;
          created_by?: string | null;
          folder?: string | null;
          height?: number | null;
          id?: string;
          is_public?: boolean;
          mime_type?: string | null;
          provider?: "imagekit" | "local" | "external";
          size_bytes?: number | null;
          storage_key: string;
          updated_at?: string;
          url: string;
          width?: number | null;
        };
        Update: {
          alt_text?: string | null;
          created_by?: string | null;
          folder?: string | null;
          height?: number | null;
          is_public?: boolean;
          mime_type?: string | null;
          provider?: "imagekit" | "local" | "external";
          size_bytes?: number | null;
          storage_key?: string;
          url?: string;
          width?: number | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          email: string;
          id: string;
          role: "customer" | "admin" | "super_admin";
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          email: string;
          id: string;
          role?: "customer" | "admin" | "super_admin";
          updated_at?: string;
        };
        Update: {
          display_name?: string | null;
          email?: string;
          role?: "customer" | "admin" | "super_admin";
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "customer" | "admin" | "super_admin";
    };
    CompositeTypes: Record<string, never>;
  };
};
