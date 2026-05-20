import { LayerPage } from "@/components/LayerPage";
import { buildMoodleCourseExperienceLayer } from "@/lib/institutionalLayers";

export default async function MoodleAssetsV2Page() {
  const layer = await buildMoodleCourseExperienceLayer();
  return <LayerPage eyebrow="Moodle Course Experience" title="Moodle copy and embed assets v2" description="Copy-ready Moodle block text, iframe snippets, fallback links, student notices, lecturer notes, and accessibility-friendly placement guidance." items={layer.copyAssets} exportHref="/api/admin/moodle-course-experience-pack.html" />;
}
