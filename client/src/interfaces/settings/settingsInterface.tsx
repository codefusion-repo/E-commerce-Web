// settingsInterface.tsx

// Interface para cada proovedor de cuenta
export interface ProvidersType {
  icon: any;
  providerId: string;
  providerName: string;
  email: string | null;
  name: string | null;
  linked: boolean;
}
