export interface Session {
  id: string;
  topic: string;
  subtitle: string;
  date: string;
  score: number;
  icon: React.ReactNode;
  iconBg: string;
  iconBorder: string;
  scoreColor: string;
}

export interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

export interface SessionRowProps {
  session: Session;
}