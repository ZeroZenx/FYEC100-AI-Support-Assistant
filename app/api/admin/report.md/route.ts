import { buildPilotReport, renderPilotReportMarkdown } from "@/lib/pilotReport";

export async function GET() {
  const report = await buildPilotReport();

  return new Response(renderPilotReportMarkdown(report), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-pilot-report.md\"",
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
