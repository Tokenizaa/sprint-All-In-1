import { createFileRoute } from '@tanstack/react-router';
import { CopilotInterface } from '@/components/presentation/CopilotInterface';

export const Route = createFileRoute('/copilot')({
  component: CopilotInterface,
});
