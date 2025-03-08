// Representa uma linha individual no processo
export interface Node {
    id: number;
    label: string;
    status: string;
    color: string;
    description: string;
    createdAt: string;
    closedAt?: string;
  }
  
  // Representa um projeto com uma lista de linhas
  export interface Project {
    projeto: string;
    datapast: string;
    dataenvase: string;
    linhas: Node[];
  }
  