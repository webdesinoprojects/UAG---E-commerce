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
