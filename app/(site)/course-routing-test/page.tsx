import { CourseRoutingTester } from "@/components/feature/CourseRoutingTester";
import { PageShell } from "@/components/PageShell";

export default function CourseRoutingTestPage() {
  return (
    <PageShell
      eyebrow="Multi-Course Routing"
      title="Course routing test"
      description="Simulate Moodle course context and confirm which course, knowledge base, lifecycle status, and support rules the assistant will use."
    >
      <CourseRoutingTester />
    </PageShell>
  );
}
