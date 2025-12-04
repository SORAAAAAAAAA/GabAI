export interface Session {
  id: string;
  job_title: string;
  subtitle: string;
  started_at: string;
  score: number;
  overall_feedback?: unknown;
  icon?: React.ReactNode;
  iconBg?: string;
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