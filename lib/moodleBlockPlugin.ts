import { access, stat } from "fs/promises";
import path from "path";

const PLUGIN_ROOT = path.join(process.cwd(), "moodle", "block_fyec100assistant");

const requiredFiles = [
  "version.php",
  "block_fyec100assistant.php",
  "classes/privacy/provider.php",
  "settings.php",
  "db/access.php",
  "lang/en/block_fyec100assistant.php",
  "styles.css",
  "README.md"
];

export type MoodleBlockPluginFile = {
  exists: boolean;
  path: string;
};

export async function getMoodleBlockPluginStatus() {
  const files = await Promise.all(
    requiredFiles.map(async (filePath) => ({
      exists: await fileExists(path.join(PLUGIN_ROOT, filePath)),
      path: `moodle/block_fyec100assistant/${filePath}`
    }))
  );
  const rootStats = await stat(PLUGIN_ROOT);
  const missingFiles = files.filter((file) => !file.exists);

  return {
    component: "block_fyec100assistant",
    installPath: "blocks/fyec100assistant",
    localPath: "moodle/block_fyec100assistant",
    missingFiles,
    packageName: "fyec100assistant",
    readyForLmsReview: missingFiles.length === 0,
    requiredFiles: files,
    rootLastUpdated: rootStats.mtime.toISOString(),
    summary:
      "Phase 2 Moodle block scaffold that embeds the assistant in a course shell and passes pilot launch context.",
    trustBoundary:
      "This block passes pilot context only. It is not LTI 1.3 authentication and must not be treated as trusted identity validation."
  };
}

async function fileExists(filePath: string) {
  try {
    await access(filePath);

    return true;
  } catch {
    return false;
  }
}
