
export interface PosePrompt {
  id: string;
  title: string;
  category: string;
  description: string;
  poseTechnical: string; // Descrição detalhada da anatomia da pose
  thumbnail: string;
  prompt: string;
  isDuo?: boolean;
}

export type Category = 
  | 'All' 
  | 'Executive'
  | 'Fashion'
  | 'Casual'
  | 'Action'
  | 'Duo';

export interface GenerationResult {
  imageUrl: string;
  prompt: string;
}
