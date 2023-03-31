export type PackageScore = {
  final: Number;
  detail: {
    quality: Number;
    popularity: Number;
  };
};

export type PackageLinks = {
  bug: string;
  homepage: string;
  npm: string;
  repository: string;
};

export interface Package {
  name: string;
  scope: string;
  version: string;
  description: string;
  keywords: string[];
  links: PackageLinks;
  date: Date;
}

export interface PackageResult {
  package: Package;
  highlight: string;
  score: PackageScore;
}
