import Link from "next/link";
import { Brand } from "@/components/ui/brand";
import { TeachingReviewLab } from "@/components/teaching-review-lab";
export const metadata = { title: "Teaching Review Lab", description: "Review teaching material with a portable, evidence-led rubric." };
export default function ReviewLabPage() { return <div className="visitor-page"><header className="visitor-header"><Brand /><nav aria-label="Review lab pages"><Link href="/try">Try the course</Link><Link href="/">Home</Link></nav></header><main id="main-content" tabIndex={-1} className="visitor-main"><span className="visitor-pill">For any subject · No sign-in needed</span><h1>Teaching Review Lab</h1><TeachingReviewLab /></main><footer className="visitor-footer"><p>PromptShala · A teacher makes the final decision.</p><Link href="/privacy">Your data and AI use</Link></footer></div>; }
