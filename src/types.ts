export interface Wish {
  id: string;
  sender: string;
  relation: string;
  greeting: string;
  timestamp: number;
  videoBlob: Blob | null;
  videoUrl?: string; // Runtime URL created via URL.createObjectURL
}

export interface Configuration {
  sisterName: string;
  birthYear: number;
  age: number;
}
