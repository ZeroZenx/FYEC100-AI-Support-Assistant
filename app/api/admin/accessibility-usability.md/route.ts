import { requireAdminAccess } from "@/lib/adminAuth";
import { renderAccessibilityUsabilityMarkdown } from "@/lib/accessibilityUsabilityReview";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  return new Response(await renderAccessibilityUsabilityMarkdown(), {
    headers: {
      "Content-Disposition":
        "inline; filename=\"fyec100-accessibility-usability-review.md\"",
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
