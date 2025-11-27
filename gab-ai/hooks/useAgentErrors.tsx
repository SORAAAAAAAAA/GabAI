import { useEffect } from 'react';
import { useAgent } from '@livekit/components-react';
import { toastAlert } from '@/components/livekit/alert-toast';
import { useConnection } from './useConnection';

export function useAgentErrors() {
  const agent = useAgent();
  const { isConnectionActive, startDisconnectTransition } = useConnection();

  useEffect(() => {
    if (isConnectionActive && agent.state === 'failed') {
      const reasons = agent.failureReasons;

      toastAlert({
        title: 'Session ended',
        description: (
          <>
            {reasons.length > 1 && (
              <ul className="list-inside list-disc">
                {reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            )}
            {reasons.length === 1 && <p className="w-full">{reasons[0]}</p>}
          </>
        ),
      });

      startDisconnectTransition();
    }
  }, [agent, isConnectionActive, startDisconnectTransition]);
}
