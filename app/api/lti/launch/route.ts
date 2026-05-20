import { NextResponse } from "next/server";
import { validateLtiLaunch } from "@/lib/ltiLaunch";

export async function POST(request: Request) {
  const formData = await request.formData();
  const validation = await validateLtiLaunch({
    idToken: readFormValue(formData.get("id_token")),
    state: readFormValue(formData.get("state"))
  });

  return NextResponse.json(validation, { status: validation.ok ? 200 : 400 });
}

export async function GET() {
  return NextResponse.json(
    {
      error: "LTI launch expects a validated POST from Moodle in a future implementation."
    },
    { status: 405 }
  );
}

function readFormValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : null;
}
