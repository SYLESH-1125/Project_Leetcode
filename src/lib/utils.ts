import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatScore(score: number | null): string {
  return score ? `${score} pts` : 'N/A'
}

export function formatRank(rank: number | null, total: number): string {
  return rank ? `#${rank.toLocaleString()} / ${total.toLocaleString()}` : 'N/A'
}

export function getPerformanceLevel(score: number | null): string {
  if (!score) return 'Did Not Participate'
  if (score >= 18) return 'Excellent'
  if (score >= 15) return 'Very Good'
  if (score >= 12) return 'Good'
  if (score >= 9) return 'Fair'
  return 'Needs Improvement'
}

export function getPerformanceColor(score: number | null): string {
  if (!score) return 'text-gray-500'
  if (score >= 18) return 'text-green-600'
  if (score >= 15) return 'text-blue-600'
  if (score >= 12) return 'text-yellow-600'
  if (score >= 9) return 'text-orange-600'
  return 'text-red-600'
}

export function calculatePercentile(rank: number | null, total: number): string {
  if (!rank) return 'N/A'
  const percentile = 100 - (rank / total * 100)
  return `${percentile.toFixed(1)}%`
}
