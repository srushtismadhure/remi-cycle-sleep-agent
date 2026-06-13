import { TonightExperience } from "@/components/TonightExperience";
import { runDemoAgent } from "@/lib/demoAgent";

export default async function TonightPage() {
  const result = await runDemoAgent();

  return <TonightExperience initialResult={result} />;
}
