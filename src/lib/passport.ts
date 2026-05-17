import { execSync } from "child_process";

export function executePassportSession(url: string, method: string = "GET", body?: any) {
  try {
    let cmd = `kpass agent:session execute --url "${url}" --method ${method} --output json`;
    if (body) {
      cmd += ` --headers '{"Content-Type":"application/json"}' --body '${JSON.stringify(body)}'`;
    }
    const output = execSync(cmd, { encoding: "utf-8" });
    return JSON.parse(output);
  } catch (error: any) {
    console.error("Passport execution failed:", error.message);
    throw error;
  }
}
