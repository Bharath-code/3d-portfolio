export interface ResumeExperience {
  company: string;
  title: string;
  dates: string;
  bullets: string[];
}

export interface ResumeProject {
  name: string;
  desc: string;
  tech: string;
}

export interface ResumeEducation {
  degree: string;
  school: string;
  dates: string;
  details: string[];
}

export interface ResumeData {
  personal: {
    name: string;
    role: string;
    location: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    portfolio: string;
  };
  profile: string;
  techStack: string[];
  experience: ResumeExperience[];
  projects: ResumeProject[];
  leadership: string[];
  openSource: string[];
  education: ResumeEducation[];
}
